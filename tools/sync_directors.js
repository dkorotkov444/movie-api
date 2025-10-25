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

function extractDirectorBios(src) {
  const re = /director:\s*{([\s\S]*?)}/g;
  const map = {};
  let m;
  while ((m = re.exec(src)) !== null) {
    const block = m[1];
    const nameMatch = /name:\s*'([^']+)'/.exec(block);
    const bioMatch = /bio:\s*'([^']*)'/.exec(block);
    if (nameMatch && bioMatch) {
      const name = nameMatch[1];
      const bio = bioMatch[1];
      map[name] = bio;
    }
  }
  return map;
}

function replaceDirectorBios(src, map) {
  let count = 0;
  const re = /director:\s*{([\s\S]*?)}/g;
  const out = src.replace(re, (match, block) => {
    const nameMatch = /name:\s*'([^']+)'/.exec(block);
    if (!nameMatch) return match;
    const name = nameMatch[1];
    if (!map[name]) return match;
    const newBio = "bio: '" + map[name] + "'";
    if (/bio:\s*'([^']*)'/.test(block)) {
      count++;
      const newBlock = block.replace(/bio:\s*'([^']*)'/, newBio);
      return 'director: {' + newBlock + '}';
    } else {
      const newBlock = block.replace(/(name:\s*'[^']+'\s*,?\s*)/, "$1\n      " + newBio + ",");
      count++;
      return 'director: {' + newBlock + '}';
    }
  });
  return { out, count };
}

try {
  const movies = readFile(moviesPath);
  const movies2 = readFile(movies2Path);
  const map = extractDirectorBios(movies);
  if (Object.keys(map).length === 0) {
    console.error('No director bios found in movies.js');
    process.exit(2);
  }
  const { out, count } = replaceDirectorBios(movies2, map);
  fs.writeFileSync(movies2Path, out, 'utf8');
  console.log('Updated', count, 'director bios in', movies2Path);
} catch (err) {
  console.error(err);
  process.exit(1);
}
