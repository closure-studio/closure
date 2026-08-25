import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { chmod, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildComparison,
  parseCsv,
  parseGfxInfoFramestats,
  parseMemInfo,
  renderCaptureReport,
  renderComparisonReport,
  summarizePerfettoJank,
} from './android-ui-profile-lib.mjs';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_ROOT = path.join(PROJECT_ROOT, '.expo', 'ui-performance');
const TOOLS_ROOT = path.join(OUTPUT_ROOT, 'tools');
const TRACE_PROCESSOR_PATH = path.join(TOOLS_ROOT, 'trace_processor');
const TRACE_PROCESSOR_URL = 'https://get.perfetto.dev/trace_processor';
const DEFAULT_SESSION = 'operators';
const DEFAULT_DURATION_SECONDS = 25;
const ROUND_NAMES = ['cold', 'warm'];

function log(message) {
  process.stdout.write(`[android-ui-profile] ${message}\n`);
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/gu, '-');
}

function sanitizeName(value, label) {
  if (!/^[a-z0-9][a-z0-9_-]*$/u.test(value)) {
    throw new Error(`${label} must match [a-z0-9][a-z0-9_-]*.`);
  }
  return value;
}

function parseOptions(argumentsList) {
  const options = {};
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (!argument?.startsWith('--')) throw new Error(`Unexpected argument: ${argument}`);
    const name = argument.slice(2);
    if (name === 'skip-build') {
      options.skipBuild = true;
      continue;
    }
    const value = argumentsList[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for --${name}.`);
    options[name] = value;
    index += 1;
  }
  return options;
}

async function run(command, argumentsList, {
  allowFailure = false,
  cwd = PROJECT_ROOT,
  env,
  input,
} = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, argumentsList, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const stdout = [];
    const stderr = [];
    child.stdout.on('data', (chunk) => stdout.push(chunk));
    child.stderr.on('data', (chunk) => stderr.push(chunk));
    child.on('error', reject);
    child.on('close', (code) => {
      const result = {
        code: code ?? 1,
        stderr: Buffer.concat(stderr),
        stdout: Buffer.concat(stdout),
      };
      if (result.code !== 0 && !allowFailure) {
        const details = result.stderr.toString('utf8').trim()
          || result.stdout.toString('utf8').trim();
        reject(new Error(`${command} exited with ${result.code}${details ? `: ${details}` : ''}`));
        return;
      }
      resolve(result);
    });
    if (input !== undefined) child.stdin.end(input);
    else child.stdin.end();
  });
}

async function runText(command, argumentsList, options) {
  const result = await run(command, argumentsList, options);
  return {
    ...result,
    stderrText: result.stderr.toString('utf8'),
    stdoutText: result.stdout.toString('utf8'),
  };
}

function adbArguments(serial, argumentsList) {
  return ['-s', serial, ...argumentsList];
}

async function adbText(serial, argumentsList, options) {
  return runText('adb', adbArguments(serial, argumentsList), options);
}

async function listAuthorizedDevices() {
  const { stdoutText } = await runText('adb', ['devices', '-l']);
  return stdoutText
    .split(/\r?\n/u)
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [serial, state] = line.split(/\s+/u);
      return { serial, state, raw: line };
    })
    .filter((device) => device.state === 'device');
}

async function resolveSingleDevice() {
  const devices = await listAuthorizedDevices();
  if (devices.length !== 1) {
    throw new Error(
      `Expected exactly one authorized ADB device, found ${devices.length}. Check \`adb devices -l\`.`,
    );
  }
  return devices[0].serial;
}

async function getProperty(serial, property) {
  const { stdoutText } = await adbText(serial, ['shell', 'getprop', property]);
  return stdoutText.trim();
}

async function collectDeviceMetadata(serial) {
  const [manufacturer, model, androidVersion, apiLevel, abiList, size] = await Promise.all([
    getProperty(serial, 'ro.product.manufacturer'),
    getProperty(serial, 'ro.product.model'),
    getProperty(serial, 'ro.build.version.release'),
    getProperty(serial, 'ro.build.version.sdk'),
    getProperty(serial, 'ro.product.cpu.abilist'),
    adbText(serial, ['shell', 'wm', 'size'], { allowFailure: true }),
  ]);
  return {
    abi: abiList.split(',')[0] || 'arm64-v8a',
    abiList,
    androidVersion,
    apiLevel,
    manufacturer,
    model,
    screenSize: size.stdoutText.trim(),
    serial,
  };
}

async function loadExpoIdentity() {
  const { stdoutText } = await runText(
    'npx',
    ['expo', 'config', '--type', 'public', '--json'],
    { env: { APP_VARIANT: 'development' } },
  );
  const jsonStart = stdoutText.indexOf('{');
  if (jsonStart < 0) throw new Error('Expo config did not return JSON.');
  const config = JSON.parse(stdoutText.slice(jsonStart));
  const packageName = config.android?.package;
  const scheme = Array.isArray(config.scheme) ? config.scheme[0] : config.scheme;
  if (!packageName || !scheme) throw new Error('Expo config is missing android.package or scheme.');
  return { packageName, scheme };
}

async function buildAndInstall(serial, abi) {
  log(`Building release APK for ${abi}.`);
  await run(
    './gradlew',
    [':app:assembleRelease', `-PreactNativeArchitectures=${abi}`],
    { cwd: path.join(PROJECT_ROOT, 'android'), env: { APP_VARIANT: 'development' } },
  );
  const apkPath = path.join(
    PROJECT_ROOT,
    'android',
    'app',
    'build',
    'outputs',
    'apk',
    'release',
    'app-release.apk',
  );
  await stat(apkPath);
  log('Installing release APK without clearing app data.');
  await adbText(serial, ['install', '-r', '-t', apkPath]);
}

async function speak(message) {
  process.stdout.write('\u0007');
  await run('say', [message], { allowFailure: true });
}

async function ensureTraceProcessor() {
  await mkdir(TOOLS_ROOT, { recursive: true });
  try {
    await stat(TRACE_PROCESSOR_PATH);
  } catch {
    log('Downloading the official Perfetto trace processor bootstrap.');
    const response = await fetch(TRACE_PROCESSOR_URL);
    if (!response.ok) throw new Error(`Unable to download trace processor: HTTP ${response.status}`);
    await writeFile(TRACE_PROCESSOR_PATH, Buffer.from(await response.arrayBuffer()));
    await chmod(TRACE_PROCESSOR_PATH, 0o755);
  }
  const version = await runText(TRACE_PROCESSOR_PATH, ['--version'], { allowFailure: true });
  return version.stdoutText.trim() || version.stderrText.trim() || 'unknown';
}

function makePerfettoConfig(packageName, durationSeconds) {
  return `
duration_ms: ${durationSeconds * 1000}
buffers { size_kb: 65536 fill_policy: RING_BUFFER }
data_sources { config { name: "android.surfaceflinger.frametimeline" } }
data_sources {
  config {
    name: "linux.ftrace"
    ftrace_config {
      ftrace_events: "sched/sched_switch"
      ftrace_events: "sched/sched_waking"
      ftrace_events: "power/cpu_frequency"
      ftrace_events: "power/suspend_resume"
      atrace_categories: "am"
      atrace_categories: "gfx"
      atrace_categories: "input"
      atrace_categories: "view"
      atrace_categories: "wm"
      atrace_apps: "${packageName}"
    }
  }
}
data_sources {
  config {
    name: "linux.process_stats"
    process_stats_config { scan_all_processes_on_start: true }
  }
}
data_sources { config { name: "android.packages_list" } }
`;
}

async function launchOperatorsRoute(serial, identity, forceStop) {
  if (forceStop) await adbText(serial, ['shell', 'am', 'force-stop', identity.packageName]);
  const routeUrl = `${identity.scheme}:///dashboard/G16601716973/operators`;
  await adbText(serial, [
    'shell',
    'am',
    'start',
    '-W',
    '-a',
    'android.intent.action.VIEW',
    '-d',
    routeUrl,
    identity.packageName,
  ]);
  await delay(6000);
  const windowState = await adbText(serial, ['shell', 'dumpsys', 'window', 'windows']);
  if (!isPackageFocused(windowState.stdoutText, identity.packageName)) {
    throw new Error(
      `Expected ${identity.packageName} to be in the foreground. Unlock the device and retry.`,
    );
  }
}

async function writeCommandOutput(filePath, result) {
  const output = result.stdout.length > 0 ? result.stdout : result.stderr;
  await writeFile(filePath, output);
}

function sqlString(value) {
  return value.replaceAll("'", "''");
}

function isPackageFocused(windowState, packageName) {
  return windowState
    .split(/\r?\n/u)
    .some((line) => (
      (line.includes('mCurrentFocus=') || line.includes('mFocusedApp='))
      && line.includes(packageName)
    ));
}

async function queryTrace(tracePath, sql) {
  const result = await runText(
    TRACE_PROCESSOR_PATH,
    ['query', tracePath, sql],
    { allowFailure: true },
  );
  if (result.code === 0) return result;
  return runText(
    TRACE_PROCESSOR_PATH,
    ['-q', sql, tracePath],
    { allowFailure: true },
  );
}

async function analyzePerfetto(tracePath, packageName, roundDirectory) {
  const escapedPackage = sqlString(packageName);
  const jankQuery = `
SELECT COALESCE(jank_type, 'Unknown') AS jank_type, COUNT(*) AS frame_count
FROM actual_frame_timeline_slice
JOIN process USING (upid)
WHERE process.name GLOB '${escapedPackage}*'
GROUP BY jank_type
ORDER BY frame_count DESC;
`;
  const slicesQuery = `
SELECT slice.name AS slice_name,
       COUNT(*) AS occurrence_count,
       ROUND(SUM(slice.dur) / 1000000.0, 3) AS total_ms,
       ROUND(MAX(slice.dur) / 1000000.0, 3) AS max_ms
FROM slice
JOIN thread_track ON slice.track_id = thread_track.id
JOIN thread USING (utid)
JOIN process USING (upid)
WHERE process.name GLOB '${escapedPackage}*'
  AND thread.is_main_thread = 1
  AND slice.dur > 0
GROUP BY slice.name
ORDER BY total_ms DESC
LIMIT 20;
`;
  const [jankResult, slicesResult] = await Promise.all([
    queryTrace(tracePath, jankQuery),
    queryTrace(tracePath, slicesQuery),
  ]);
  await writeCommandOutput(path.join(roundDirectory, 'perfetto-jank.csv'), jankResult);
  await writeCommandOutput(path.join(roundDirectory, 'perfetto-main-thread-slices.csv'), slicesResult);
  return {
    jank: jankResult.code === 0 ? summarizePerfettoJank(jankResult.stdoutText) : null,
    mainThreadSlices: slicesResult.code === 0 ? parseCsv(slicesResult.stdoutText) : [],
    queryErrors: [jankResult, slicesResult]
      .filter((result) => result.code !== 0)
      .map((result) => result.stderrText.trim() || result.stdoutText.trim()),
  };
}

async function captureRound({
  durationSeconds,
  identity,
  label,
  roundDirectory,
  roundName,
  serial,
}) {
  await mkdir(roundDirectory, { recursive: true });
  log(`Preparing ${label}/${roundName}.`);
  await launchOperatorsRoute(serial, identity, roundName === 'cold');
  await adbText(serial, ['shell', 'dumpsys', 'gfxinfo', identity.packageName, 'reset']);

  const [memoryBefore, batteryBefore, thermalBefore] = await Promise.all([
    adbText(serial, ['shell', 'dumpsys', 'meminfo', identity.packageName]),
    adbText(serial, ['shell', 'dumpsys', 'battery'], { allowFailure: true }),
    adbText(serial, ['shell', 'dumpsys', 'thermalservice'], { allowFailure: true }),
  ]);
  await writeCommandOutput(path.join(roundDirectory, 'meminfo-before.txt'), memoryBefore);
  await writeCommandOutput(path.join(roundDirectory, 'battery-before.txt'), batteryBefore);
  await writeCommandOutput(path.join(roundDirectory, 'thermal-before.txt'), thermalBefore);

  const deviceTracePath = `/data/misc/perfetto-traces/closure-${process.pid}-${roundName}.perfetto-trace`;
  const perfettoPromise = adbText(
    serial,
    ['shell', 'perfetto', '--txt', '-c', '-', '-o', deviceTracePath],
    {
      allowFailure: true,
      input: makePerfettoConfig(identity.packageName, durationSeconds),
    },
  );

  await delay(1000);
  log(`${roundName}: start scrolling for ${durationSeconds} seconds.`);
  await speak(`Start ${roundName} scrolling now`);
  const perfettoResult = await perfettoPromise;
  await speak('Stop scrolling');
  log(`${roundName}: capture complete.`);
  await writeCommandOutput(path.join(roundDirectory, 'perfetto-command.txt'), perfettoResult);

  const [gfxInfo, memoryAfter, batteryAfter, thermalAfter, screenshot] = await Promise.all([
    adbText(serial, ['shell', 'dumpsys', 'gfxinfo', identity.packageName, 'framestats']),
    adbText(serial, ['shell', 'dumpsys', 'meminfo', identity.packageName]),
    adbText(serial, ['shell', 'dumpsys', 'battery'], { allowFailure: true }),
    adbText(serial, ['shell', 'dumpsys', 'thermalservice'], { allowFailure: true }),
    run('adb', adbArguments(serial, ['exec-out', 'screencap', '-p']), { allowFailure: true }),
  ]);
  await writeCommandOutput(path.join(roundDirectory, 'gfxinfo.txt'), gfxInfo);
  await writeCommandOutput(path.join(roundDirectory, 'meminfo-after.txt'), memoryAfter);
  await writeCommandOutput(path.join(roundDirectory, 'battery-after.txt'), batteryAfter);
  await writeCommandOutput(path.join(roundDirectory, 'thermal-after.txt'), thermalAfter);
  if (screenshot.code === 0) await writeFile(path.join(roundDirectory, 'screen.png'), screenshot.stdout);

  const finalWindowState = await adbText(serial, ['shell', 'dumpsys', 'window', 'windows']);
  await writeCommandOutput(path.join(roundDirectory, 'window-after.txt'), finalWindowState);
  if (!isPackageFocused(finalWindowState.stdoutText, identity.packageName)) {
    throw new Error(
      `${identity.packageName} left the foreground during ${roundName}; the capture is invalid.`,
    );
  }

  const localTracePath = path.join(roundDirectory, 'trace.perfetto-trace');
  const pullResult = perfettoResult.code === 0
    ? await adbText(serial, ['pull', deviceTracePath, localTracePath], { allowFailure: true })
    : { code: 1 };
  await adbText(serial, ['shell', 'rm', '-f', deviceTracePath], { allowFailure: true });

  const beforeMemory = parseMemInfo(memoryBefore.stdoutText);
  const afterMemory = parseMemInfo(memoryAfter.stdoutText);
  const perfetto = pullResult.code === 0
    ? await analyzePerfetto(localTracePath, identity.packageName, roundDirectory)
    : { jank: null, mainThreadSlices: [], queryErrors: ['Perfetto trace was not captured.'] };
  return {
    gfxInfo: parseGfxInfoFramestats(gfxInfo.stdoutText),
    memory: {
      afterTotalPssKb: afterMemory.totalPssKb,
      beforeTotalPssKb: beforeMemory.totalPssKb,
      totalPssGrowthKb: beforeMemory.totalPssKb === null || afterMemory.totalPssKb === null
        ? null
        : afterMemory.totalPssKb - beforeMemory.totalPssKb,
    },
    perfetto,
  };
}

async function getGitFingerprint() {
  const [head, diff, statusOutput] = await Promise.all([
    runText('git', ['rev-parse', '--short', 'HEAD']),
    run('git', ['diff', '--binary', 'HEAD']),
    runText('git', ['status', '--porcelain=v1']),
  ]);
  const hash = createHash('sha256')
    .update(diff.stdout)
    .update(statusOutput.stdoutText)
    .digest('hex')
    .slice(0, 12);
  return `${head.stdoutText.trim()}-${hash}`;
}

async function findLatestMetrics(labelDirectory) {
  const entries = await readdir(labelDirectory, { withFileTypes: true });
  const runNames = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .reverse();
  for (const runName of runNames) {
    try {
      return JSON.parse(await readFile(path.join(labelDirectory, runName, 'metrics.json'), 'utf8'));
    } catch {
      // Ignore incomplete captures and continue to the previous run.
    }
  }
  return null;
}

async function compareSession(session) {
  const sessionDirectory = path.join(OUTPUT_ROOT, session);
  const entries = await readdir(sessionDirectory, { withFileTypes: true });
  const metrics = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const latestMetrics = await findLatestMetrics(path.join(sessionDirectory, entry.name));
    if (latestMetrics) metrics.push(latestMetrics);
  }
  const comparison = buildComparison(metrics);
  await Promise.all([
    writeFile(
      path.join(sessionDirectory, 'comparison.json'),
      `${JSON.stringify(comparison, null, 2)}\n`,
    ),
    writeFile(path.join(sessionDirectory, 'comparison.md'), renderComparisonReport(comparison)),
  ]);
  log(`Comparison written to ${path.relative(PROJECT_ROOT, sessionDirectory)}.`);
  return comparison;
}

async function capture(options) {
  const label = sanitizeName(options.label ?? '', 'label');
  const session = sanitizeName(options.session ?? DEFAULT_SESSION, 'session');
  const durationSeconds = Number(options.duration ?? DEFAULT_DURATION_SECONDS);
  if (!Number.isInteger(durationSeconds) || durationSeconds < 10 || durationSeconds > 120) {
    throw new Error('duration must be an integer between 10 and 120 seconds.');
  }

  const serial = await resolveSingleDevice();
  const [device, identity, traceProcessorVersion, gitFingerprint] = await Promise.all([
    collectDeviceMetadata(serial),
    loadExpoIdentity(),
    ensureTraceProcessor(),
    getGitFingerprint(),
  ]);
  log(`Using ${device.manufacturer} ${device.model} (${serial}).`);
  log(`Trace processor: ${traceProcessorVersion}.`);
  if (!options.skipBuild) await buildAndInstall(serial, device.abi);

  const runDirectory = path.join(OUTPUT_ROOT, session, label, timestamp());
  await mkdir(runDirectory, { recursive: true });
  const metadata = {
    capturedAt: new Date().toISOString(),
    device,
    durationSeconds,
    gitFingerprint,
    identity,
    label,
    session,
    traceProcessorVersion,
  };
  await writeFile(path.join(runDirectory, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);

  const rounds = {};
  await speak('Android UI profile is ready');
  for (const roundName of ROUND_NAMES) {
    rounds[roundName] = await captureRound({
      durationSeconds,
      identity,
      label,
      roundDirectory: path.join(runDirectory, roundName),
      roundName,
      serial,
    });
    if (roundName === 'cold') await delay(3000);
  }

  const metrics = { ...metadata, rounds };
  await Promise.all([
    writeFile(path.join(runDirectory, 'metrics.json'), `${JSON.stringify(metrics, null, 2)}\n`),
    writeFile(path.join(runDirectory, 'report.md'), renderCaptureReport(metrics)),
  ]);
  log(`Capture written to ${path.relative(PROJECT_ROOT, runDirectory)}.`);

  if (label !== 'baseline') {
    try {
      await compareSession(session);
    } catch (error) {
      log(`Comparison skipped: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

function printHelp() {
  process.stdout.write(`
Usage:
  npm run profile:android-ui -- capture --label baseline [--session operators] [--duration 25] [--skip-build]
  npm run profile:android-ui -- compare [--session operators]

The capture command records cold and warm rounds. During each spoken capture window,
scroll the operator list continuously from top to bottom and back.
`);
}

async function main() {
  const [command = 'help', ...argumentsList] = process.argv.slice(2);
  const options = parseOptions(argumentsList);
  if (command === 'capture') {
    await capture(options);
  } else if (command === 'compare') {
    await compareSession(sanitizeName(options.session ?? DEFAULT_SESSION, 'session'));
  } else if (command === 'help' || command === '--help') {
    printHelp();
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
