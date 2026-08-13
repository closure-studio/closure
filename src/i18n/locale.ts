import { getLocales, type Locale } from 'expo-localization';

import { DEFAULT_LOCALE } from '@/constants/locales';
import type { SupportedLocale } from '@/constants/locales';

type LocalePreference = Pick<Locale, 'languageCode' | 'languageTag'>;

export function resolveLocale(preferences: readonly LocalePreference[]): SupportedLocale {
  for (const preference of preferences) {
    const language = preference.languageCode?.toLowerCase()
      ?? preference.languageTag.split('-')[0]?.toLowerCase();

    if (language === 'zh') return 'zh-CN';
    if (language === 'en') return 'en';
  }

  return DEFAULT_LOCALE;
}

export function getInitialLocale(): SupportedLocale {
  return process.env.EXPO_OS === 'web' ? DEFAULT_LOCALE : resolveLocale(getLocales());
}
