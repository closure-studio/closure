import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const publicFolder = resolve(import.meta.dirname, '../public');
await mkdir(publicFolder, { recursive: true });

const wasmSource = fileURLToPath(
  import.meta.resolve('canvaskit-wasm/bin/full/canvaskit.wasm'),
);
const wasmDestination = resolve(publicFolder, 'canvaskit.wasm');

await copyFile(wasmSource, wasmDestination);
