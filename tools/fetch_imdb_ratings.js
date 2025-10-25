import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '..');
const movies2Path = path.join(repoRoot, 'data', 'fixtures', 'movies2.js');

const OMDB_API_KEY = process.env.OMDB_API_KEY || null;
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const FORCE_SCRAPE = args.includes('--scrape');

function readFile(p) {
  return fs.readFileSync(p, 'utf8');
}

function writeFile(p, txt) {
  fs.writeFileSync(p, txt, 'utf8');
}

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function getFetch() {
  if (typeof fetch !== 'undefined') return fetch;
  try {
    const mod = await import('node-fetch');
    return mod.default || mod;
  } catch (e) {
    console.error('No global fetch and node-fetch is not installed. Please run `npm install node-fetch` or use Node 18+.');
    process.exit(1);
  }
}

async function fetchFromOmdb(title, year, fetchFn) {
  const q = `t=${encodeURIComponent(title)}&y=${encodeURIComponent(year)}`;
  const url = `http://www.omdbapi.com/?${q}&apikey=${OMDB_API_KEY}`;
  const res = await fetchFn(url);
  const json = await res.json();
  if (json && json.Response === 'True' && json.imdbRating && json.imdbRating !== 'N/A') {
    return parseFloat(json.imdbRating);
  }
  // Helpful debug: return null but also attach the raw response for logging by the caller
  // (caller will print useful info). We return an object when there's an error so
  // the caller can surface OMDb's Error message.
  return { __omdb: true, json };
}

async function scrapeImdbRating(title, year, fetchFn) {
  const searchUrl = `https://www.imdb.com/find?q=${encodeURIComponent(title)}&s=tt&ttype=ft&ref_=fn_ft`;
  const searchRes = await fetchFn(searchUrl, { headers: { 'Accept-Language': 'en-US,en' } });
  const searchHtml = await searchRes.text();
  const m = /href="(\/title\/tt\d+\/)[^"]*"/.exec(searchHtml);
  if (!m) return null;
  const titlePath = m[1];
  const pageUrl = `https://www.imdb.com${titlePath}`;
  const pageRes = await fetchFn(pageUrl, { headers: { 'Accept-Language': 'en-US,en' } });
  const pageHtml = await pageRes.text();
  let mm = /"ratingValue"\s*:\s*"(\d+\.?\d?)"/.exec(pageHtml);
  if (mm) return parseFloat(mm[1]);
  mm = /itemprop="ratingValue">(\d+\.?\d?)<\/span>/.exec(pageHtml);
  if (mm) return parseFloat(mm[1]);
  mm = /AggregateRatingButton__RatingScore[^>]*>(\d+\.?\d?)<\//.exec(pageHtml);
  if (mm) return parseFloat(mm[1]);
  return null;
}

async function main() {
  const fetchFn = await getFetch();
  const src = readFile(movies2Path);

  const movieRe = /title:\s*'([^']+)'[\s\S]*?release_year:\s*(\d{4})[\s\S]*?rating_imdb:\s*(null|\d+(?:\.\d+)?)/gs;

  const matches = [];
  let m;
  while ((m = movieRe.exec(src)) !== null) {
    matches.push({ title: m[1], year: m[2], oldRating: m[3] });
  }

  if (matches.length === 0) {
    console.error('No movies found to update in', movies2Path);
    process.exit(2);
  }

  if (!OMDB_API_KEY && !FORCE_SCRAPE) {
    console.log('No OMDB_API_KEY detected. By default I won\'t scrape IMDb automatically.\nProvide an OMDb API key via the OMDB_API_KEY environment variable, or run this script with --scrape to allow HTML scraping (fragile).');
    process.exit(0);
  }

  const ratings = [];
  let i = 0;
  for (const it of matches) {
    i++;
    const { title, year } = it;
    console.log(`[${i}/${matches.length}] ${title} (${year})`);
    let rating = null;
    try {
      if (OMDB_API_KEY) {
        rating = await fetchFromOmdb(title, year, fetchFn);
      } else {
        rating = await scrapeImdbRating(title, year, fetchFn);
      }
    } catch (err) {
      console.error('Error fetching rating for', title, err.message || err);
      rating = null;
    }
    // If fetchFromOmdb returned an OMDb debug object, log its contents for diagnosis
    if (rating && rating.__omdb) {
      const json = rating.json;
      if (json && json.Error) {
        console.log(' -> OMDb:', json.Error);
      } else {
        console.log(' -> OMDb response (no rating):', JSON.stringify(json));
      }
      rating = null;
    } else {
      console.log(' ->', rating === null ? 'not found' : rating);
    }
    ratings.push(rating);
    await wait(900);
  }

  if (DRY) {
    console.log('Dry run; not writing changes.');
    return;
  }

  let idx = 0;
  const out = src.replace(movieRe, (full, title, year, old) => {
    const newRating = ratings[idx++];
    const replacement = newRating === null ? 'rating_imdb: null' : `rating_imdb: ${newRating}`;
    return full.replace(/rating_imdb:\s*(null|\d+(?:\.\d+)?)/, replacement);
  });

  writeFile(movies2Path, out);
  const replaced = ratings.filter((r) => r !== null).length;
  console.log(`Updated ${replaced} ratings in ${movies2Path}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
