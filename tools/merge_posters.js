import fs from 'fs';
import path from 'path';

const root = process.cwd();
const fixturesDir = path.join(root, 'data', 'fixtures');
const postersPath = path.join(fixturesDir, 'movies-with-posters.json');
const movies2Path = path.join(fixturesDir, 'movies2.js');

function escapeRegex(s){
  return s.replace(/[-\\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

if (!fs.existsSync(postersPath)){
  console.error('Posters file not found:', postersPath);
  process.exit(1);
}
if (!fs.existsSync(movies2Path)){
  console.error('movies2.js not found:', movies2Path);
  process.exit(1);
}

const posters = JSON.parse(fs.readFileSync(postersPath, 'utf8'));
let content = fs.readFileSync(movies2Path, 'utf8');
const backupPath = movies2Path + '.bak.' + Date.now();
fs.copyFileSync(movies2Path, backupPath);
console.log('Backup written to', backupPath);

let updates = 0;

for (const p of posters){
  const title = p.title;
  const year = p.year;
  const poster = p.poster;

  // Build a regex that finds the movie object by title and release_year nearby, and replaces image_url: null
  // We limit the intervening text to a reasonable window to avoid accidental cross-object matches.
  const titleRe = escapeRegex(title);
  const re = new RegExp("(title:\\\s*'" + titleRe + "',[\\s\\S]{0,600}?release_year:\\\s*" + year + "[\\s\\S]{0,600}?image_url:)\\s*null","g");

  const newContent = content.replace(re, (match, g1) => {
    updates += 1;
    return g1 + " '" + poster + "'";
  });

  if (newContent !== content){
    content = newContent;
  }
}

fs.writeFileSync(movies2Path, content, 'utf8');
console.log(`Updated ${updates} image_url fields in ${movies2Path}`);
if (updates === 0) console.warn('No updates made — check for title/year mismatches or differing formatting in movies2.js');
