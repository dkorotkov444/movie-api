#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import mongoose from 'mongoose';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function usage() {
  console.log(`Usage: node tools/import_movies.js --uri <MONGO_URI> [--dry] [--upsert]

Options:
  --uri <MONGO_URI>   MongoDB connection string or set MONGO_URI env var
  --dry               Do a dry run (no writes)
  --upsert            Update existing documents (match by title+release_year)
  --help              Show this message
`);
}

async function readMoviesFromFile(p) {
  const txt = fs.readFileSync(p, 'utf8');
  // The fixtures file is a JS array literal (not a module). Evaluate safely in a VM.
  const sandbox = { ISODate: (s) => new Date(s) };
  vm.createContext(sandbox);
  // Wrap in parens to ensure expressions evaluate to the array
  const script = new vm.Script('result = ' + txt);
  script.runInContext(sandbox);
  const movies = sandbox.result;
  if (!Array.isArray(movies)) throw new Error('Parsed movies is not an array');
  return movies;
}

function parseDateVal(v) {
  if (v == null) return null;
  // If already a Date, check validity
  if (v instanceof Date) {
    return isNaN(v.valueOf()) ? null : v;
  }
  // If numeric (timestamp)
  if (typeof v === 'number') {
    const d = new Date(v);
    return isNaN(d.valueOf()) ? null : d;
  }
  // If string, try to parse
  if (typeof v === 'string') {
    const d = new Date(v);
    return isNaN(d.valueOf()) ? null : d;
  }
  // Unknown type
  return null;
}

function normalizeMovie(obj) {
  // Ensure primitive types and remove any BSON specific tokens
  const m = {
    title: obj.title,
    description: obj.description || '',
    release_year: obj.release_year ? Number(obj.release_year) : null,
    image_url: obj.image_url || null,
    rating_imdb: (obj.rating_imdb == null) ? null : Number(obj.rating_imdb),
    featured: !!obj.featured,
    starring: Array.isArray(obj.starring) ? obj.starring : [],
    director: {
      name: obj.director && obj.director.name ? obj.director.name : '',
      bio: obj.director && obj.director.bio ? obj.director.bio : '',
      birth_date: parseDateVal(obj.director && obj.director.birth_date),
      death_date: parseDateVal(obj.director && obj.director.death_date),
    },
    genre: {
      name: obj.genre && obj.genre.name ? obj.genre.name : '',
      description: obj.genre && obj.genre.description ? obj.genre.description : '',
    }
  };
  return m;
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--help') || argv.includes('-h')) return usage();
  const dry = argv.includes('--dry');
  const upsert = argv.includes('--upsert');
  let mongoUri = process.env.MONGO_URI || null;
  const uriIndex = argv.indexOf('--uri');
  if (uriIndex !== -1 && argv.length > uriIndex + 1) mongoUri = argv[uriIndex + 1];
  if (!mongoUri) {
    console.error('MongoDB URI not provided. Set MONGO_URI or use --uri <uri>');
    usage();
    process.exit(2);
  }

  const moviesFile = path.join(repoRoot, 'data', 'fixtures', 'movies2.js');
  if (!fs.existsSync(moviesFile)) {
    console.error('movies2.js not found at', moviesFile);
    process.exit(2);
  }

  console.log('Reading', moviesFile);
  const rawMovies = await readMoviesFromFile(moviesFile);
  const movies = rawMovies.map(normalizeMovie);
  console.log(`Parsed ${movies.length} movies from fixtures`);

  console.log('Connecting to MongoDB...');
  // Mongoose v6+ uses sensible defaults; avoid passing deprecated options
  await mongoose.connect(mongoUri);
  console.log('Connected');

  // Import models after connecting (models.js uses mongoose)
  const modelsPath = path.join(repoRoot, 'src', 'models', 'models.js');
  const modelsModule = await import(pathToFileURL(modelsPath).href);
  const Movie = modelsModule.Movie;
  if (!Movie) {
    console.error('Movie model not found in models.js');
    await mongoose.disconnect();
    process.exit(3);
  }

  let inserted = 0, skipped = 0, updated = 0, failed = 0;
  for (const m of movies) {
    // Basic filter: require title and release_year
    if (!m.title || !m.release_year) {
      console.warn('Skipping movie with missing title or release_year', m.title);
      skipped++;
      continue;
    }

    const filter = { title: m.title, release_year: m.release_year };
    const existing = await Movie.findOne(filter).exec();
    if (existing) {
      if (upsert) {
        // update fields
        existing.description = m.description;
        existing.image_url = m.image_url;
        existing.rating_imdb = m.rating_imdb;
        existing.featured = m.featured;
        existing.starring = m.starring;
        existing.director = m.director;
        existing.genre = m.genre;
        try {
          if (!dry) await existing.save();
          updated++;
        } catch (err) {
          console.error('Failed to update', m.title, err.message || err);
          failed++;
        }
      } else {
        skipped++;
      }
    } else {
      try {
        if (!dry) await Movie.create(m);
        inserted++;
      } catch (err) {
        console.error('Failed to insert', m.title, err.message || err);
        failed++;
      }
    }
  }

  console.log(`Done. inserted=${inserted} updated=${updated} skipped=${skipped} failed=${failed} (dry=${dry})`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
