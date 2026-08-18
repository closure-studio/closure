// Colors consumed by both Tamagui and the build-time raster asset pipeline.
// Keep this module dependency-free so Node scripts can import it directly.
export const APP_RASTER_COLORS = {
  appAccent: '#3dccdf',
  appBackground: '#07090a',
  appRule: 'rgba(205, 216, 211, 0.16)',
  appScanline: 'rgba(228, 233, 235, 0.04)',
  appText: '#f0f2ee',
} satisfies Record<string, string>;

export type AppRasterColorToken = keyof typeof APP_RASTER_COLORS;
