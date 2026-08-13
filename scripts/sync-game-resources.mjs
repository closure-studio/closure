import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as v from 'valibot';

import { ARK_RESOURCES_ORIGIN } from '../src/config/ark-resources.ts';
import { characterTableSchema } from '../src/schemas/game-data/character-table.schema.ts';
import { itemTableSchema } from '../src/schemas/game-data/item-table.schema.ts';
import { stageTableSchema } from '../src/schemas/game-data/stage-table.schema.ts';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.resolve(scriptDirectory, '../assets/data');
const metadataPath = path.join(dataDirectory, 'game_resources.json');
const resources = [
  {
    fileName: 'character_table.json',
    key: 'character',
    schema: characterTableSchema,
  },
  {
    fileName: 'item_table.json',
    key: 'item',
    schema: itemTableSchema,
  },
  {
    fileName: 'stage_table.json',
    key: 'stage',
    schema: stageTableSchema,
  },
];

async function downloadResource(resource) {
  const response = await fetch(`${ARK_RESOURCES_ORIGIN}/data/${resource.fileName}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const lastModified = response.headers.get('Last-Modified');
  if (!lastModified) throw new Error('Missing Last-Modified header');
  const updatedAt = new Date(lastModified).toISOString();
  if (!Number.isFinite(Date.parse(updatedAt))) throw new Error('Invalid Last-Modified header');
  const text = await response.text();
  const result = v.safeParse(resource.schema, JSON.parse(text));
  if (!result.success) throw new Error('Resource schema validation failed');
  return { resource, text, updatedAt };
}

const metadata = JSON.parse(await readFile(metadataPath, 'utf8'));
const results = await Promise.allSettled(resources.map(downloadResource));
let successCount = 0;

for (const [index, result] of results.entries()) {
  const resource = resources[index];
  if (!resource) continue;
  if (result.status === 'rejected') {
    console.error(`${resource.fileName}: ${result.reason instanceof Error ? result.reason.message : 'Unknown error'}`);
    continue;
  }
  await writeFile(
    path.join(dataDirectory, resource.fileName),
    result.value.text,
  );
  metadata[resource.key] = { updatedAt: result.value.updatedAt };
  successCount += 1;
  console.log(`${resource.fileName}: ${result.value.updatedAt}`);
}

if (successCount > 0) {
  await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
}
if (successCount !== resources.length) process.exitCode = 1;
