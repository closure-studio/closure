import { env } from "node:process";

import type { ConfigContext, ExpoConfig } from "expo/config";

import { SUPPORTED_LOCALES } from "./src/constants/locales.ts";

type AppVariant = "development" | "production";

type AppIdentity = {
  applicationId: string;
  name: string;
  scheme: string;
};

const DEFAULT_APP_VARIANT: AppVariant = "development";

const appIdentities = {
  development: {
    applicationId: "com.closurestudio.app.dev",
    name: "Closure Studio Dev",
    scheme: "closure-dev",
  },
  production: {
    applicationId: "com.closurestudio.app",
    name: "Closure Studio",
    scheme: "closure",
  },
} as const satisfies Record<AppVariant, AppIdentity>;

function resolveAppVariant(value: string | undefined): AppVariant {
  if (!value) return DEFAULT_APP_VARIANT;
  if (value === "development" || value === "production") return value;
  throw new Error(`Unsupported APP_VARIANT: ${value}`);
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const identity = appIdentities[resolveAppVariant(env.APP_VARIANT)];

  return {
    ...config,
    name: identity.name,
    slug: config.slug ?? "closure",
    scheme: identity.scheme,
    ios: {
      ...config.ios,
      bundleIdentifier: identity.applicationId,
    },
    android: {
      ...config.android,
      package: identity.applicationId,
    },
    plugins: [
      ...(config.plugins ?? []),
      ["expo-localization", { supportedLocales: [...SUPPORTED_LOCALES] }],
      "expo-image",
    ],
  };
};
