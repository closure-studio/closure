import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const sourceDirectory = path.resolve(scriptDirectory, '../src');
const excludeTestFiles = !process.argv.includes('--with-tests');
const excludeEmptyLines = process.argv.includes('--no-empty');

async function collectFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(fullPath));
    } else if (/\.tsx?$/.test(entry.name) && !(excludeTestFiles && /\.test\./.test(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function countLines(content) {
  const trimmed = content.endsWith('\n') ? content.slice(0, -1) : content;
  if (!excludeEmptyLines) return trimmed.split('\n').length;
  return trimmed.split('\n').filter((line) => line.trim() !== '').length;
}

const files = (await collectFiles(sourceDirectory)).sort();
const entries = [];
for (const filePath of files) {
  const content = await readFile(filePath, 'utf8');
  const relativePath = path.relative(sourceDirectory, filePath);
  entries.push({
    path: relativePath,
    lines: countLines(content),
    topDirectory: relativePath.split(path.sep)[0],
  });
}

const totalLines = entries.reduce((sum, entry) => sum + entry.lines, 0);
const byDirectory = new Map();
for (const entry of entries) {
  const bucket = byDirectory.get(entry.topDirectory) ?? { files: 0, lines: 0 };
  bucket.files += 1;
  bucket.lines += entry.lines;
  byDirectory.set(entry.topDirectory, bucket);
}

const width = Math.max(...entries.map((entry) => entry.path.length));
console.log(
  `src LOC audit (${excludeTestFiles ? 'excluding' : 'including'} test files, ` +
  `${excludeEmptyLines ? 'non-empty lines' : 'all lines'})`
);
console.log(`total: ${totalLines} lines across ${entries.length} files`);
console.log('');

console.log('by top-level directory:');
for (const [directory, bucket] of [...byDirectory.entries()].sort((a, b) => b[1].lines - a[1].lines)) {
  console.log(`  ${directory.padEnd(width)} ${bucket.lines.toString().padStart(6)} lines  ${bucket.files} files`);
}
console.log('');

const topFiles = [...entries].sort((a, b) => b.lines - a.lines).slice(0, 10);
console.log('largest files:');
for (const entry of topFiles) {
  console.log(`  ${entry.path.padEnd(width)} ${entry.lines.toString().padStart(6)} lines`);
}
