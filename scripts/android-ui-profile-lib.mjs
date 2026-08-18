const NANOSECONDS_PER_MILLISECOND = 1_000_000;
const PROFILE_DATA_MARKER = '---PROFILEDATA---';
const MAX_MEMORY_GROWTH_KB = 15 * 1024;

function round(value, digits = 3) {
  if (!Number.isFinite(value)) return null;
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function percentile(sortedValues, percentileValue) {
  if (sortedValues.length === 0) return null;
  const position = (sortedValues.length - 1) * percentileValue;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  const lower = sortedValues[lowerIndex];
  const upper = sortedValues[upperIndex];
  if (lower === undefined || upper === undefined) return null;
  return lower + (upper - lower) * (position - lowerIndex);
}

function summarizeDurations(values) {
  const sortedValues = values.filter(Number.isFinite).sort((left, right) => left - right);
  return {
    p50: round(percentile(sortedValues, 0.5)),
    p90: round(percentile(sortedValues, 0.9)),
    p95: round(percentile(sortedValues, 0.95)),
    p99: round(percentile(sortedValues, 0.99)),
    max: round(sortedValues.at(-1) ?? Number.NaN),
  };
}

export function parseGfxInfoFramestats(output) {
  const frames = [];
  let columns = null;
  let insideProfileData = false;

  for (const rawLine of output.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (line === PROFILE_DATA_MARKER) {
      insideProfileData = !insideProfileData;
      if (!insideProfileData) columns = null;
      continue;
    }
    if (!insideProfileData || line.length === 0) continue;
    if (line.startsWith('Flags,IntendedVsync,')) {
      columns = line.split(',');
      continue;
    }
    if (!columns || !/^\d/u.test(line)) continue;

    const values = line.split(',').map(Number);
    if (values.length < columns.length || values.some((value) => !Number.isFinite(value))) {
      continue;
    }

    const frame = Object.fromEntries(columns.map((column, index) => [column, values[index]]));
    if (
      frame.Flags !== 0
      || frame.IntendedVsync <= 0
      || frame.FrameCompleted <= frame.IntendedVsync
      || frame.FrameDeadline <= frame.IntendedVsync
    ) {
      continue;
    }

    const intervalNs = frame.FrameInterval > 0
      ? frame.FrameInterval
      : frame.FrameDeadline - frame.IntendedVsync;
    const totalDurationNs = frame.FrameCompleted - frame.IntendedVsync;
    const overrunNs = frame.FrameCompleted - frame.FrameDeadline;
    frames.push({
      intervalNs,
      janky: overrunNs > 0,
      missedVsyncs: overrunNs > 0
        ? Math.max(1, Math.ceil(overrunNs / intervalNs))
        : 0,
      overrunMs: overrunNs / NANOSECONDS_PER_MILLISECOND,
      totalDurationMs: totalDurationNs / NANOSECONDS_PER_MILLISECOND,
    });
  }

  const jankyFrames = frames.filter((frame) => frame.janky);
  const intervalDurationsMs = frames.map(
    (frame) => frame.intervalNs / NANOSECONDS_PER_MILLISECOND,
  );

  return {
    frameCount: frames.length,
    jankyFrameCount: jankyFrames.length,
    jankPercent: round(frames.length === 0 ? 0 : (jankyFrames.length / frames.length) * 100),
    missedVsyncCount: frames.reduce((total, frame) => total + frame.missedVsyncs, 0),
    refreshIntervalMs: round(percentile(intervalDurationsMs.sort((a, b) => a - b), 0.5)),
    totalDurationMs: summarizeDurations(frames.map((frame) => frame.totalDurationMs)),
    overrunMs: summarizeDurations(jankyFrames.map((frame) => frame.overrunMs)),
  };
}

export function parseMemInfo(output) {
  const totalPssMatch = /^\s*TOTAL PSS:\s+(\d+)/mu.exec(output)
    ?? /^\s*TOTAL\s+(\d+)\s+/mu.exec(output);
  return {
    totalPssKb: totalPssMatch ? Number(totalPssMatch[1]) : null,
  };
}

export function parseCsv(output) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < output.length; index += 1) {
    const character = output[index];
    if (quoted) {
      if (character === '"' && output[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }
    if (character === '"') {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      row.push(field.replace(/\r$/u, ''));
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  if (rows.length < 2) return [];

  const headers = rows[0];
  if (!headers) return [];
  return rows.slice(1).map((values) => Object.fromEntries(
    headers.map((header, index) => [header, values[index] ?? '']),
  ));
}

export function summarizePerfettoJank(output) {
  const byType = {};
  let frameCount = 0;
  let jankyFrameCount = 0;
  for (const row of parseCsv(output)) {
    const jankType = row.jank_type || 'Unknown';
    const count = Number(row.frame_count);
    if (!Number.isFinite(count)) continue;
    byType[jankType] = count;
    frameCount += count;
    if (jankType !== 'None') jankyFrameCount += count;
  }
  return {
    byType,
    frameCount,
    jankyFrameCount,
    jankPercent: round(frameCount === 0 ? 0 : (jankyFrameCount / frameCount) * 100),
  };
}

function percentChange(current, baseline) {
  if (!Number.isFinite(current) || !Number.isFinite(baseline) || baseline === 0) return null;
  return round(((current - baseline) / baseline) * 100);
}

function percentReduction(current, baseline) {
  if (!Number.isFinite(current) || !Number.isFinite(baseline) || baseline === 0) return null;
  return round(((baseline - current) / baseline) * 100);
}

function getWarmMetrics(metrics) {
  const warm = metrics.rounds?.warm;
  if (!warm) throw new Error(`Profile ${metrics.label ?? 'unknown'} has no warm round.`);
  return {
    jankPercent: warm.gfxInfo.jankPercent,
    p95Ms: warm.gfxInfo.totalDurationMs.p95,
    p99Ms: warm.gfxInfo.totalDurationMs.p99,
    memoryGrowthKb: warm.memory.totalPssGrowthKb,
  };
}

export function buildComparison(profileMetrics) {
  const baseline = profileMetrics.find((metrics) => metrics.label === 'baseline');
  if (!baseline) throw new Error('A baseline profile is required for comparison.');
  const baselineWarm = getWarmMetrics(baseline);
  const baselineHealthy = baselineWarm.jankPercent <= 3
    && baselineWarm.p95Ms !== null
    && baselineWarm.p95Ms <= (baseline.rounds.warm.gfxInfo.refreshIntervalMs ?? 16.667) * 1.05;

  const variants = profileMetrics
    .filter((metrics) => metrics.label !== 'baseline')
    .map((metrics) => {
      const warm = getWarmMetrics(metrics);
      const jankReductionPercent = percentReduction(warm.jankPercent, baselineWarm.jankPercent);
      const p95ChangePercent = percentChange(warm.p95Ms, baselineWarm.p95Ms);
      const p99ChangePercent = percentChange(warm.p99Ms, baselineWarm.p99Ms);
      const passes = jankReductionPercent !== null
        && jankReductionPercent >= 20
        && (p95ChangePercent ?? Number.POSITIVE_INFINITY) <= 2
        && (p99ChangePercent ?? Number.POSITIVE_INFINITY) <= 2
        && Number.isFinite(warm.memoryGrowthKb)
        && warm.memoryGrowthKb <= MAX_MEMORY_GROWTH_KB;
      return {
        label: metrics.label,
        passes,
        jankReductionPercent,
        p95ChangePercent,
        p99ChangePercent,
        memoryGrowthKb: warm.memoryGrowthKb,
        warm,
      };
    });

  const concernRank = {
    'hardware-texture': 1,
    'list-window': 1,
    combined: 2,
  };
  const recommended = baselineHealthy
    ? 'baseline'
    : variants
      .filter((variant) => variant.passes)
      .sort((left, right) => (
        (concernRank[left.label] ?? 99) - (concernRank[right.label] ?? 99)
        || left.memoryGrowthKb - right.memoryGrowthKb
        || right.jankReductionPercent - left.jankReductionPercent
      ))[0]?.label ?? null;

  return {
    baselineHealthy,
    baseline: baselineWarm,
    recommended,
    variants,
  };
}

function formatMetric(value, suffix = '') {
  return value === null || value === undefined ? 'n/a' : `${value}${suffix}`;
}

export function renderCaptureReport(metrics) {
  const lines = [
    `# Android UI Profile: ${metrics.label}`,
    '',
    `- Device: ${metrics.device.manufacturer} ${metrics.device.model}`,
    `- Android: ${metrics.device.androidVersion} (API ${metrics.device.apiLevel})`,
    `- Git state: ${metrics.gitFingerprint}`,
    `- Captured: ${metrics.capturedAt}`,
    '',
    '| Round | Frames | Jank | P95 | P99 | Missed vsync | PSS growth |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];
  for (const [roundName, round] of Object.entries(metrics.rounds)) {
    lines.push(
      `| ${roundName} | ${round.gfxInfo.frameCount} | ${formatMetric(round.gfxInfo.jankPercent, '%')} | ${formatMetric(round.gfxInfo.totalDurationMs.p95, 'ms')} | ${formatMetric(round.gfxInfo.totalDurationMs.p99, 'ms')} | ${round.gfxInfo.missedVsyncCount} | ${formatMetric(round.memory.totalPssGrowthKb, 'KB')} |`,
    );
  }
  lines.push('', 'Raw traces and command output are stored beside this report.', '');
  return lines.join('\n');
}

export function renderComparisonReport(comparison) {
  const lines = [
    '# Android UI Profile Comparison',
    '',
    `Recommendation: ${comparison.recommended ?? 'no measured variant qualifies'}`,
    '',
    '| Variant | Pass | Jank reduction | P95 change | P99 change | PSS growth |',
    '| --- | --- | ---: | ---: | ---: | ---: |',
  ];
  for (const variant of comparison.variants) {
    lines.push(
      `| ${variant.label} | ${variant.passes ? 'yes' : 'no'} | ${formatMetric(variant.jankReductionPercent, '%')} | ${formatMetric(variant.p95ChangePercent, '%')} | ${formatMetric(variant.p99ChangePercent, '%')} | ${formatMetric(variant.memoryGrowthKb, 'KB')} |`,
    );
  }
  lines.push('');
  return lines.join('\n');
}
