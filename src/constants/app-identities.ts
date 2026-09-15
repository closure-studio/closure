export type AppVariant = 'development' | 'production';

type AppIdentity = {
  applicationId: string;
  name: string;
  scheme: string;
};

export const DEFAULT_APP_VARIANT: AppVariant = 'development';

export const APP_IDENTITIES = {
  development: {
    applicationId: 'com.closurestudio.app.dev',
    name: 'Closure Studio Dev',
    scheme: 'com.closurestudio.app.dev',
  },
  production: {
    applicationId: 'com.closurestudio.app',
    name: 'Closure Studio',
    scheme: 'com.closurestudio.app',
  },
} as const satisfies Record<AppVariant, AppIdentity>;
