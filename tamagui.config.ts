import { defaultConfig } from '@tamagui/config/v5';
import { animations } from '@tamagui/config/v5-rn';
import { createFont, createTamagui } from 'tamagui';

const terminalFontSizes = {
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

const terminalLineHeights = {
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
  size: terminalFontSizes,
  lineHeight: terminalLineHeights,
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
  size: terminalFontSizes,
  lineHeight: terminalLineHeights,
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
  fonts: {
    ...defaultConfig.fonts,
    body: oxaniumFont,
    heading: oxaniumFont,
    mono: geistMonoFont,
  },
  tokens: {
    ...defaultConfig.tokens,
    color: {
      terminalBg: '#090a0c',
      terminalSurface: 'rgba(15, 18, 20, 0.70)',
      terminalSurfaceStrong: 'rgba(15, 18, 20, 0.95)',
      terminalRaised: '#1d2022',
      terminalRaisedTranslucent: 'rgba(29, 32, 34, 0.40)',
      terminalBorder: 'rgba(42, 47, 49, 0.70)',
      terminalBorderSolid: '#2a2f31',
      terminalGrid: 'rgba(228, 233, 235, 0.06)',
      terminalScanline: 'rgba(228, 233, 235, 0.04)',
      terminalText: '#e4e9eb',
      terminalMuted: '#82878a',
      terminalCyan: '#3dccdf',
      terminalCyanBorder: 'rgba(61, 204, 223, 0.50)',
      terminalCyanEdge: 'rgba(61, 204, 223, 0.60)',
      terminalCyanRing: 'rgba(61, 204, 223, 0.70)',
      terminalCyanSoft: 'rgba(61, 204, 223, 0.10)',
      terminalWarning: '#ff9d36',
      terminalWarningBorder: 'rgba(255, 157, 54, 0.50)',
      terminalWarningRing: 'rgba(255, 157, 54, 0.70)',
      terminalWarningSoft: 'rgba(255, 157, 54, 0.05)',
      terminalSuccess: '#63d18f',
      terminalSuccessSoft: 'rgba(99, 209, 143, 0.20)',
      terminalMutedRing: 'rgba(130, 135, 138, 0.60)',
      terminalDanger: '#ea3c3f',
      terminalDangerBorder: 'rgba(234, 60, 63, 0.50)',
      terminalDangerSoft: 'rgba(234, 60, 63, 0.05)',
      terminalScrim: 'rgba(5, 6, 7, 0.88)',
    },
  },
});

export type TamaguiConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends TamaguiConfig {}
}

export default tamaguiConfig;
