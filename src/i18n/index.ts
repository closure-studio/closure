import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import enAuth from '@/i18n/locales/en/auth.json';
import enCommon from '@/i18n/locales/en/common.json';
import enDashboard from '@/i18n/locales/en/dashboard.json';
import enNavigation from '@/i18n/locales/en/navigation.json';
import enRecordingCenter from '@/i18n/locales/en/recording-center.json';
import enSiteSettings from '@/i18n/locales/en/site-settings.json';
import enSystemAdmin from '@/i18n/locales/en/system-admin.json';
import zhCNAuth from '@/i18n/locales/zh-CN/auth.json';
import zhCNCommon from '@/i18n/locales/zh-CN/common.json';
import zhCNDashboard from '@/i18n/locales/zh-CN/dashboard.json';
import zhCNNavigation from '@/i18n/locales/zh-CN/navigation.json';
import zhCNRecordingCenter from '@/i18n/locales/zh-CN/recording-center.json';
import zhCNSiteSettings from '@/i18n/locales/zh-CN/site-settings.json';
import zhCNSystemAdmin from '@/i18n/locales/zh-CN/system-admin.json';
import { defaultLocale, getInitialLocale, supportedLocales } from '@/i18n/locale';

export const defaultNS = 'common' as const;
export const i18n = createInstance();

export const resources = {
  'zh-CN': {
    auth: zhCNAuth,
    common: zhCNCommon,
    dashboard: zhCNDashboard,
    navigation: zhCNNavigation,
    'recording-center': zhCNRecordingCenter,
    'site-settings': zhCNSiteSettings,
    'system-admin': zhCNSystemAdmin,
  },
  en: {
    auth: enAuth,
    common: enCommon,
    dashboard: enDashboard,
    navigation: enNavigation,
    'recording-center': enRecordingCenter,
    'site-settings': enSiteSettings,
    'system-admin': enSystemAdmin,
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
  ns: ['common', 'auth', 'dashboard', 'navigation', 'recording-center', 'site-settings', 'system-admin'],
  resources,
  returnNull: false,
  supportedLngs: [...supportedLocales],
}).catch((initializationError: unknown) => {
  console.error('Unable to initialize localization.', initializationError);
});
