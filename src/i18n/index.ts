import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/constants/locales';
import enAuth from '@/i18n/locales/en/auth.json';
import enCommon from '@/i18n/locales/en/common.json';
import enDashboard from '@/i18n/locales/en/dashboard.json';
import enNavigation from '@/i18n/locales/en/navigation.json';
import enSettings from '@/i18n/locales/en/settings.json';
import zhCNAuth from '@/i18n/locales/zh-CN/auth.json';
import zhCNCommon from '@/i18n/locales/zh-CN/common.json';
import zhCNDashboard from '@/i18n/locales/zh-CN/dashboard.json';
import zhCNNavigation from '@/i18n/locales/zh-CN/navigation.json';
import zhCNSettings from '@/i18n/locales/zh-CN/settings.json';
import { getInitialLocale } from '@/i18n/locale';

export const defaultNS = 'common' as const;
export const i18n = createInstance();

export const resources = {
  'zh-CN': {
    auth: zhCNAuth,
    common: zhCNCommon,
    dashboard: zhCNDashboard,
    navigation: zhCNNavigation,
    settings: zhCNSettings,
  },
  en: {
    auth: enAuth,
    common: enCommon,
    dashboard: enDashboard,
    navigation: enNavigation,
    settings: enSettings,
  },
} as const;

i18n.use(initReactI18next).init({
  defaultNS,
  fallbackLng: DEFAULT_LOCALE,
  initAsync: false,
  interpolation: {
    escapeValue: false,
  },
  lng: getInitialLocale(),
  ns: ['common', 'auth', 'dashboard', 'navigation', 'settings'],
  resources,
  returnNull: false,
  supportedLngs: [...SUPPORTED_LOCALES],
}).catch((initializationError: unknown) => {
  console.error('Unable to initialize localization.', initializationError);
});
