// Single source of truth for the small-screen operator portrait geometry.
// Shared by the runtime layout (operator-card.tsx) and the pre-rendered asset
// generator (scripts/generate-dashboard-assets.mjs). Kept free of UI imports so
// both consumers can import it.
export const OPERATOR_PORTRAIT_GEOMETRY = {
  sourceWidth: 180,
  sourceHeight: 360,
  layerWidthPercent: 55,
  zoomPercent: 120,
  // Negative = image top edge above the layer; -20 sacrifices 10px of the
  // usually-blank source top to reveal more lower-body detail.
  topOffset: -20,
} as const;

// Portrait-specific scanlines stay dark enough to preserve artwork detail while
// keeping the terminal texture visible after the 55% layer is downsampled.
export const OPERATOR_PORTRAIT_FILTER = {
  scanlineColor: 'appBackground',
  scanlineOpacity: 0.24,
} as const;
