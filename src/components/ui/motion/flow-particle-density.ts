const REFERENCE_VIEWPORT = {
  width: 402,
  height: 874,
  particles: 90,
} as const;

const AREA_SCALE_EXPONENT = 0.75;

export function getFlowParticleCount(width: number, height: number) {
  const safeWidth = Number.isFinite(width) ? Math.max(1, width) : 1;
  const safeHeight = Number.isFinite(height) ? Math.max(1, height) : 1;
  const area = safeWidth * safeHeight;
  const referenceArea = REFERENCE_VIEWPORT.width * REFERENCE_VIEWPORT.height;

  // Sublinear area scaling keeps phones dense without letting large displays grow linearly.
  return Math.max(
    1,
    Math.round(REFERENCE_VIEWPORT.particles * Math.pow(area / referenceArea, AREA_SCALE_EXPONENT)),
  );
}
