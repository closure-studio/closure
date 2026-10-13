import { env } from "node:process";

import type { ConfigContext, ExpoConfig } from "expo/config";

import {
  APP_IDENTITIES,
  DEFAULT_APP_VARIANT,
} from "./src/constants/app-identities.ts";
import type { AppVariant } from "./src/constants/app-identities.ts";
import { SUPPORTED_LOCALES } from "./src/constants/locales.ts";

function resolveAppVariant(value: string | undefined): AppVariant {
  if (!value) return DEFAULT_APP_VARIANT;
  if (value === "development" || value === "production") return value;
  throw new Error(`Unsupported APP_VARIANT: ${value}`);
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = resolveAppVariant(env.APP_VARIANT);
  // Inlined at bundle time; without it production silently hides Linux.do login.
  if (variant === "production" && !env.EXPO_PUBLIC_LINUXDO_CLIENT_ID?.trim()) {
    throw new Error("Missing production environment variable: EXPO_PUBLIC_LINUXDO_CLIENT_ID");
  }
  const identity = APP_IDENTITIES[variant];

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
