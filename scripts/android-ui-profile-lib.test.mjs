import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildComparison,
  parseCsv,
  parseGfxInfoFramestats,
  parseMemInfo,
  summarizePerfettoJank,
} from './android-ui-profile-lib.mjs';

const frameColumns = [
  'Flags',
  'IntendedVsync',
  'Vsync',
  'OldestInputEvent',
  'NewestInputEvent',
  'HandleInputStart',
  'AnimationStart',
  'PerformTraversalsStart',
  'DrawStart',
  'FrameDeadline',
  'FrameInterval',
  'FrameStartTime',
  'SyncQueued',
  'SyncStart',
  'IssueDrawCommandsStart',
  'SwapBuffers',
  'FrameCompleted',
  'DequeueBufferDuration',
  'QueueBufferDuration',
  'GpuCompleted',
  'SwapBuffersCompleted',
  'DisplayPresentTime',
  'CommandSubmissionCompleted',
];

function frameRow({ completed, deadline, flags = 0, intended }) {
  const values = Object.fromEntries(frameColumns.map((column) => [column, intended]));
  values.Flags = flags;
  values.IntendedVsync = intended;
  values.FrameDeadline = deadline;
  values.FrameInterval = 16_666_667;
  values.FrameCompleted = completed;
  return frameColumns.map((column) => values[column]).join(',');
}

test('parseGfxInfoFramestats summarizes completed frames against their deadlines', () => {
  const output = [
    'Applications Graphics Acceleration Info:',
    '---PROFILEDATA---',
    frameColumns.join(','),
    frameRow({ intended: 1_000_000_000, deadline: 1_016_666_667, completed: 1_015_000_000 }),
    frameRow({ intended: 2_000_000_000, deadline: 2_016_666_667, completed: 2_030_000_000 }),
    frameRow({ flags: 1, intended: 3_000_000_000, deadline: 3_016_666_667, completed: 3_050_000_000 }),
    '---PROFILEDATA---',
  ].join('\n');

  assert.deepEqual(parseGfxInfoFramestats(output), {
    frameCount: 2,
    jankyFrameCount: 1,
    jankPercent: 50,
    missedVsyncCount: 1,
    refreshIntervalMs: 16.667,
    totalDurationMs: {
      p50: 22.5,
      p90: 28.5,
      p95: 29.25,
      p99: 29.85,
      max: 30,
    },
    overrunMs: {
      p50: 13.333,
      p90: 13.333,
      p95: 13.333,
      p99: 13.333,
      max: 13.333,
    },
  });
});

test('parseMemInfo accepts legacy and table total PSS formats', () => {
  assert.deepEqual(parseMemInfo('TOTAL PSS: 123456 TOTAL RSS: 999'), { totalPssKb: 123456 });
  assert.deepEqual(parseMemInfo(' TOTAL  654321  123  456  789\n'), { totalPssKb: 654321 });
  assert.deepEqual(parseMemInfo('No process found'), { totalPssKb: null });
});

test('parseCsv handles quoted fields and summarizePerfettoJank groups frame causes', () => {
  const csv = 'jank_type,frame_count\n"None",80\n"App Deadline Missed",15\n"GPU Deadline Missed",5\n';
  assert.deepEqual(parseCsv('name,value\n"a,b","quoted ""value"""\n'), [
    { name: 'a,b', value: 'quoted "value"' },
  ]);
  assert.deepEqual(summarizePerfettoJank(csv), {
    byType: {
      None: 80,
      'App Deadline Missed': 15,
      'GPU Deadline Missed': 5,
    },
    frameCount: 100,
    jankyFrameCount: 20,
    jankPercent: 20,
  });
});

function profile(label, { jankPercent, memoryGrowthKb, p95, p99 }) {
  return {
    label,
    rounds: {
      warm: {
        gfxInfo: {
          jankPercent,
          refreshIntervalMs: 16.667,
          totalDurationMs: { p95, p99 },
        },
        memory: { totalPssGrowthKb: memoryGrowthKb },
      },
    },
  };
}

test('buildComparison recommends the smallest measured variant that clears the budget', () => {
  const comparison = buildComparison([
    profile('baseline', { jankPercent: 10, memoryGrowthKb: 1000, p95: 20, p99: 30 }),
    profile('hardware-texture', { jankPercent: 7, memoryGrowthKb: 6000, p95: 20, p99: 30 }),
    profile('list-window', { jankPercent: 8.5, memoryGrowthKb: 1000, p95: 19, p99: 28 }),
    profile('combined', { jankPercent: 5, memoryGrowthKb: 2000, p95: 18, p99: 26 }),
  ]);

  assert.equal(comparison.baselineHealthy, false);
  assert.equal(comparison.recommended, 'hardware-texture');
  assert.equal(comparison.variants.find((variant) => variant.label === 'hardware-texture')?.passes, true);
  assert.equal(comparison.variants.find((variant) => variant.label === 'list-window')?.passes, false);
});

test('buildComparison keeps a healthy baseline instead of recommending more code', () => {
  const comparison = buildComparison([
    profile('baseline', { jankPercent: 2, memoryGrowthKb: 500, p95: 16, p99: 22 }),
  ]);
  assert.equal(comparison.baselineHealthy, true);
  assert.equal(comparison.recommended, 'baseline');
});
