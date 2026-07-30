import { useLocales } from 'expo-localization';
import type { PropsWithChildren } from 'react';
import { useEffect, useMemo } from 'react';
import { I18nextProvider } from 'react-i18next';

import { i18n } from '@/i18n';
import { resolveLocale } from '@/i18n/locale';

export function LocalizationProvider({ children }: PropsWithChildren) {
  const locales = useLocales();
  const locale = useMemo(() => resolveLocale(locales), [locales]);

  useEffect(() => {
    let isCurrent = true;
    const syncDocumentLanguage = () => {
      if (process.env.EXPO_OS === 'web' && isCurrent) {
        document.documentElement.lang = locale;
        document.documentElement.dir = 'ltr';
      }
    };

    if (i18n.resolvedLanguage === locale) {
      syncDocumentLanguage();
    } else {
      i18n.changeLanguage(locale).then(syncDocumentLanguage).catch((languageChangeError: unknown) => {
        if (isCurrent) console.error('Unable to change application language.', languageChangeError);
      });
    }

    return () => {
      isCurrent = false;
    };
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
