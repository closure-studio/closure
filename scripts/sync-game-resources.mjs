import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as v from 'valibot';

import { ARK_RESOURCES_ORIGIN } from '../src/config/ark-resources.ts';
import { characterTableSchema } from '../src/schemas/game-data/character-table.schema.ts';
import { itemTableSchema } from '../src/schemas/game-data/item-table.schema.ts';
import { stageTableSchema } from '../src/schemas/game-data/stage-table.schema.ts';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.resolve(scriptDirectory, '../assets/data');
const resources = [
  {
    fileName: 'character_table.json',
    schema: characterTableSchema,
  },
  {
    fileName: 'item_table.json',
    schema: itemTableSchema,
  },
  {
    fileName: 'stage_table.json',
    schema: stageTableSchema,
  },
];

async function downloadResource(resource) {
  const response = await fetch(`${ARK_RESOURCES_ORIGIN}/data/${resource.fileName}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text();
  const result = v.safeParse(resource.schema, JSON.parse(text));
  if (!result.success) throw new Error('Resource schema validation failed');
  return { resource, text };
}

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
  successCount += 1;
  console.log(`${resource.fileName}: updated`);
}

if (successCount !== resources.length) process.exitCode = 1;
