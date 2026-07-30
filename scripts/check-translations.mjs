import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const localeDirectory = path.resolve(scriptDirectory, '../src/i18n/locales');
const referenceLocale = 'zh-CN';

function flattenKeys(value, prefix = '') {
  if (typeof value === 'string') return [prefix];
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    throw new Error(`Translation value at "${prefix}" must be a string or object`);
  }

  return Object.entries(value).flatMap(([key, child]) => (
    flattenKeys(child, prefix ? `${prefix}.${key}` : key)
  ));
}

async function readNamespace(locale, fileName) {
  const filePath = path.join(localeDirectory, locale, fileName);
  return JSON.parse(await readFile(filePath, 'utf8'));
}

const locales = (await readdir(localeDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const namespaces = (await readdir(path.join(localeDirectory, referenceLocale)))
  .filter((fileName) => fileName.endsWith('.json'))
  .sort();
const failures = [];

for (const locale of locales) {
  const localeNamespaces = (await readdir(path.join(localeDirectory, locale)))
    .filter((fileName) => fileName.endsWith('.json'))
    .sort();

  if (localeNamespaces.join('\n') !== namespaces.join('\n')) {
    failures.push(`${locale}: namespace files do not match ${referenceLocale}`);
    continue;
  }

  for (const namespace of namespaces) {
    const referenceKeys = flattenKeys(await readNamespace(referenceLocale, namespace)).sort();
    const localeKeys = flattenKeys(await readNamespace(locale, namespace)).sort();
    const missing = referenceKeys.filter((key) => !localeKeys.includes(key));
    const extra = localeKeys.filter((key) => !referenceKeys.includes(key));

    if (missing.length) failures.push(`${locale}/${namespace}: missing ${missing.join(', ')}`);
    if (extra.length) failures.push(`${locale}/${namespace}: extra ${extra.join(', ')}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Translations are aligned across ${locales.length} locales and ${namespaces.length} namespaces.`);
}
