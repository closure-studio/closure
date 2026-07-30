import { getLocales, type Locale } from 'expo-localization';

export const supportedLocales = ['zh-CN', 'en'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = 'zh-CN';

type LocalePreference = Pick<Locale, 'languageCode' | 'languageTag'>;

export function resolveLocale(preferences: readonly LocalePreference[]): SupportedLocale {
  for (const preference of preferences) {
    const language = preference.languageCode?.toLowerCase()
      ?? preference.languageTag.split('-')[0]?.toLowerCase();

    if (language === 'zh') return 'zh-CN';
    if (language === 'en') return 'en';
  }

  return defaultLocale;
}

export function getInitialLocale(): SupportedLocale {
  return process.env.EXPO_OS === 'web' ? defaultLocale : resolveLocale(getLocales());
}
