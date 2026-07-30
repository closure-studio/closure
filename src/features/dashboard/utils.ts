const COMPACT_NUMBER_THRESHOLD = 10_000;

export function formatCompactNumber(value: number) {
  return value >= COMPACT_NUMBER_THRESHOLD
    ? `${(value / COMPACT_NUMBER_THRESHOLD).toFixed(1)}w`
    : value.toLocaleString('en-US');
}
