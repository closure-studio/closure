export const AVATAR_FILTER_PATTERN = {
  width: 3,
  height: 3,
  rowHeight: 1,
} as const;

export const AVATAR_FILTER_BASE_LAYERS = [
  { color: 'appBackground', opacity: 0.18 },
  { color: 'appAccent', opacity: 0.08 },
] as const;

export const AVATAR_FILTER_WASH_STOPS = [
  { color: 'appAccent', offset: 0, opacity: 0.14 },
  { color: 'appAccent', offset: 0.52, opacity: 0 },
  { color: 'appText', offset: 1, opacity: 0.08 },
] as const;

export const AVATAR_FILTER_SCANLINE_OPACITY = 0.62;
