import { defaultConfig } from '@tamagui/config/v5';
import { createFont, createTamagui } from 'tamagui';

import { animations } from './src/theme/animations';
import { APP_RASTER_COLORS } from './src/theme/app-colors';

const appFontSizes = {
  1: 12,
  2: 13,
  2.5: 14,
  3: 16,
  4: 18,
  5: 20,
  5.5: 22,
  6: 26,
  7: 30,
  8: 32,
  9: 38,
  10: 42,
  true: 16,
} as const;

const appLineHeights = {
  1: 16,
  2: 18,
  2.5: 19,
  3: 22,
  4: 24,
  5: 26,
  5.5: 26,
  6: 32,
  7: 36,
  8: 38,
  9: 42,
  10: 46,
  true: 22,
} as const;

const oxaniumFont = createFont({
  family: 'Oxanium_400Regular',
  size: appFontSizes,
  lineHeight: appLineHeights,
  weight: {
    1: '400', 2: '400', 2.5: '400', 3: '400', 4: '500', 5: '500', 5.5: '500',
    6: '600', 7: '700', 8: '700', 9: '800', 10: '800', true: '400',
  },
  letterSpacing: { 1: 0, 2: 0, 2.5: 0, 3: 0, 4: 0, 5: 0, 5.5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, true: 0 },
  face: {
    400: { normal: 'Oxanium_400Regular' },
    500: { normal: 'Oxanium_500Medium' },
    600: { normal: 'Oxanium_600SemiBold' },
    700: { normal: 'Oxanium_700Bold' },
    800: { normal: 'Oxanium_800ExtraBold' },
    900: { normal: 'Oxanium_800ExtraBold' },
  },
});

const geistMonoFont = createFont({
  family: 'GeistMono_400Regular',
  size: appFontSizes,
  lineHeight: appLineHeights,
  weight: {
    1: '400', 2: '400', 2.5: '400', 3: '400', 4: '500', 5: '500', 5.5: '500',
    6: '600', 7: '700', 8: '700', 9: '800', 10: '900', true: '400',
  },
  letterSpacing: { 1: 0, 2: 0, 2.5: 0, 3: 0, 4: 0, 5: 0, 5.5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, true: 0 },
  face: {
    400: { normal: 'GeistMono_400Regular' },
    500: { normal: 'GeistMono_500Medium' },
    600: { normal: 'GeistMono_600SemiBold' },
    700: { normal: 'GeistMono_700Bold' },
    800: { normal: 'GeistMono_800ExtraBold' },
    900: { normal: 'GeistMono_900Black' },
  },
});

export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  animations,
  media: {
    large: { minWidth: 768 },
  },
  fonts: {
    ...defaultConfig.fonts,
    body: oxaniumFont,
    heading: oxaniumFont,
    mono: geistMonoFont,
  },
  tokens: {
    ...defaultConfig.tokens,
    color: {
      appBackground: APP_RASTER_COLORS.appBackground,
      appSurface: 'rgba(13, 16, 17, 0.76)',
      appSurfaceStrong: 'rgba(15, 18, 20, 0.95)',
      appSurfaceRaised: '#15191a',
      appSurfaceRaisedTranslucent: 'rgba(29, 32, 34, 0.40)',
      appBorder: 'rgba(75, 83, 82, 0.52)',
      appBorderSolid: '#2a2f31',
      appGrid: 'rgba(228, 233, 235, 0.06)',
      appScanline: APP_RASTER_COLORS.appScanline,
      appText: APP_RASTER_COLORS.appText,
      appMuted: '#878e8c',
      appRule: APP_RASTER_COLORS.appRule,
      appAccent: APP_RASTER_COLORS.appAccent,
      appAccentBorder: 'rgba(61, 204, 223, 0.50)',
      appAccentEdge: 'rgba(61, 204, 223, 0.60)',
      appAccentRing: 'rgba(61, 204, 223, 0.70)',
      appAccentSoft: 'rgba(61, 204, 223, 0.10)',
      appAccentSubtle: 'rgba(61, 204, 223, 0.065)',
      appMaterial: '#c7df18',
      appWarning: '#ff9d36',
      appWarningBorder: 'rgba(255, 157, 54, 0.50)',
      appWarningRing: 'rgba(255, 157, 54, 0.70)',
      appWarningSoft: 'rgba(255, 157, 54, 0.05)',
      appSuccess: '#63d18f',
      appSuccessSoft: 'rgba(99, 209, 143, 0.20)',
      appMutedRing: 'rgba(130, 135, 138, 0.60)',
      appDanger: '#ea3c3f',
      appDangerBorder: 'rgba(234, 60, 63, 0.50)',
      appDangerSoft: 'rgba(234, 60, 63, 0.05)',
      appScrim: 'rgba(5, 6, 7, 0.88)',
    },
  },
});

export type TamaguiConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends TamaguiConfig {}
}

export default tamaguiConfig;
