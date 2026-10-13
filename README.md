# Closure Studio

Expo (SDK 57) app for iOS, Android, and Web. Node.js version is pinned in `.nvmrc` and is used by local tooling, GitHub Actions, and EAS Build.

## Development

```bash
npm install
cp .env.example .env   # fill in EXPO_PUBLIC_LINUXDO_CLIENT_ID
npm run android        # or: npm run ios / npm run web
```

Local commands build the development identity `com.closurestudio.app.dev`. Run `npm run quality` before opening a pull request; CI runs the same gate plus `expo-doctor` and a bundle export.

## Build variants and environments

`APP_VARIANT` selects the app identity in `app.config.ts`. EAS builds and updates read it, together with all other variables, from the EAS environment named by the build profile:

| EAS environment | Variables |
|---|---|
| `production` | `APP_VARIANT=production`, `EXPO_PUBLIC_LINUXDO_CLIENT_ID` |
| `development` | `APP_VARIANT=development`, `EXPO_PUBLIC_LINUXDO_CLIENT_ID` |

Resolving the production config fails when `EXPO_PUBLIC_LINUXDO_CLIENT_ID` is missing. Manage them with `npx eas-cli env:set`.

## Release

Production Android builds are signed APKs distributed through GitHub Releases (no store submission).

- **Native release:** bump `expo.version` in `app.json`, merge to `master`, then push tag `v<version>`. `.github/workflows/release-native.yml` runs the quality gate, builds on EAS, and attaches the APK to a GitHub Release. Build numbers are incremented remotely by EAS.
- **OTA update (manual, not in CI/CD):** `npx eas-cli update --channel production --environment production --platform android --message "<message>"`. `runtimeVersion` uses the fingerprint policy, so an update only reaches builds with identical native code; native changes require a new tag.

GitHub repository secrets: `EXPO_TOKEN` (EAS access token).

The Android release keystore is stored in EAS credentials (`npx eas-cli credentials -p android`). Keep an offline backup: losing it prevents existing installs from upgrading.
