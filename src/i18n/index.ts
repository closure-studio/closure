import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import enAuth from '@/i18n/locales/en/auth.json';
import enCommon from '@/i18n/locales/en/common.json';
import enDashboard from '@/i18n/locales/en/dashboard.json';
import enSettings from '@/i18n/locales/en/settings.json';
import zhCNAuth from '@/i18n/locales/zh-CN/auth.json';
import zhCNCommon from '@/i18n/locales/zh-CN/common.json';
import zhCNDashboard from '@/i18n/locales/zh-CN/dashboard.json';
import zhCNSettings from '@/i18n/locales/zh-CN/settings.json';
import { defaultLocale, getInitialLocale, supportedLocales } from '@/i18n/locale';

export const defaultNS = 'common' as const;
export const i18n = createInstance();

export const resources = {
  'zh-CN': {
    auth: zhCNAuth,
    common: zhCNCommon,
    dashboard: zhCNDashboard,
    settings: zhCNSettings,
  },
  en: {
    auth: enAuth,
    common: enCommon,
    dashboard: enDashboard,
    settings: enSettings,
  },
} as const;

i18n.use(initReactI18next).init({
  defaultNS,
  fallbackLng: defaultLocale,
  initAsync: false,
  interpolation: {
    escapeValue: false,
  },
  lng: getInitialLocale(),
  ns: ['common', 'auth', 'dashboard', 'settings'],
  resources,
  returnNull: false,
  supportedLngs: [...supportedLocales],
}).catch((initializationError: unknown) => {
  console.error('Unable to initialize localization.', initializationError);
});
