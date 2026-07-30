import { formatCompactNumber } from './utils';

describe('formatCompactNumber', () => {
  it('formats values below the compact threshold with separators', () => {
    expect(formatCompactNumber(9_999)).toBe('9,999');
  });

  it('formats values at and above the compact threshold in wan units', () => {
    expect(formatCompactNumber(10_000)).toBe('1.0w');
    expect(formatCompactNumber(124_800)).toBe('12.5w');
  });
});
