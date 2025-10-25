import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '..');
const moviesPath = path.join(repoRoot, 'data', 'fixtures', 'movies.js');
const movies2Path = path.join(repoRoot, 'data', 'fixtures', 'movies2.js');

function readFile(p) {
  return fs.readFileSync(p, 'utf8');
}

function extractGenreDescriptions(src) {
  // Matches genre: {\n  name: 'Name',\n  description: '...'
  const re = /genre:\s*{([\s\S]*?)}/g;
  const map = {};
  let m;
  while ((m = re.exec(src)) !== null) {
    const block = m[1];
    const nameMatch = /name:\s*'([^']+)'/.exec(block);
    const descMatch = /description:\s*'([^']*)'/.exec(block);
    if (nameMatch && descMatch) {
      const name = nameMatch[1];
      const desc = descMatch[1];
      map[name] = desc;
    }
  }
  return map;
}

function replaceDescriptions(src, map) {
  let count = 0;
  const re = /genre:\s*{([\s\S]*?)}/g;
  const out = src.replace(re, (match, block) => {
    const nameMatch = /name:\s*'([^']+)'/.exec(block);
    if (!nameMatch) return match;
    const name = nameMatch[1];
    if (!map[name]) return match;
    // Replace or add description line
    const newDesc = "description: '" + map[name] + "'";
    if (/description:\s*'([^']*)'/.test(block)) {
      count++;
      const newBlock = block.replace(/description:\s*'([^']*)'/, newDesc);
      return 'genre: {' + newBlock + '}';
    } else {
      // insert description after name line
      const newBlock = block.replace(/(name:\s*'[^']+'\s*,?\s*)/, "$1\n      " + newDesc + ",");
      count++;
      return 'genre: {' + newBlock + '}';
    }
  });
  return { out, count };
}

try {
  const movies = readFile(moviesPath);
  const movies2 = readFile(movies2Path);
  const map = extractGenreDescriptions(movies);
  if (Object.keys(map).length === 0) {
    console.error('No genre descriptions found in movies.js');
    process.exit(2);
  }
  const { out, count } = replaceDescriptions(movies2, map);
  fs.writeFileSync(movies2Path, out, 'utf8');
  console.log('Updated', count, 'genre descriptions in', movies2Path);
} catch (err) {
  console.error(err);
  process.exit(1);
}
