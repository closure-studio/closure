import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');

const checks = [
  { label: 'expo install --check', command: 'npx', args: ['expo', 'install', '--check'] },
  { label: 'expo-doctor', command: 'npx', args: ['expo-doctor'] },
];

const reportArgIndex = process.argv.indexOf('--report');
const reportPath = reportArgIndex >= 0 ? process.argv[reportArgIndex + 1] : null;

function runCheck(check) {
  return new Promise((resolve) => {
    const child = spawn(check.command, check.args, {
      cwd: projectDirectory,
      env: { ...process.env, CI: '1', EXPO_NO_TELEMETRY: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const output = [];

    child.stdout.on('data', (chunk) => output.push(chunk));
    child.stderr.on('data', (chunk) => output.push(chunk));
    child.on('error', () => resolve({ ok: false, output: output.join('') }));
    child.on('close', (code) => resolve({ ok: code === 0, output: output.join('') }));
  });
}

const results = [];
for (const check of checks) {
  const result = await runCheck(check);
  results.push({ ...check, ...result });
  if (result.ok) {
    console.log(`✓ ${check.label} passed`);
  } else {
    console.error(`✗ ${check.label} failed`);
    process.stderr.write(`${result.output.trimEnd()}\n`);
  }
}

const failed = results.filter((result) => !result.ok);
const report = [
  `# Library update check ${new Date().toISOString()}`,
  '',
  failed.length ? `Checks failed: ${failed.map((result) => '`' + result.label + '`').join(', ')}.` : 'All checks passed.',
  '',
  ...failed.flatMap((result) => [
    `## ${result.label} failed`,
    '',
    '```',
    result.output.trim(),
    '```',
    '',
  ]),
].join('\n');

if (reportPath) {
  await writeFile(reportPath, `${report}\n`, 'utf8');
}

if (failed.length) {
  process.exitCode = 1;
}