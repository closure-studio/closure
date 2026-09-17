# Source follow-ups

## Remove the Tamagui Toast portal z-index workaround

- **Status:** Open
- **Current affected version:** Tamagui `2.7.7`
- **Check cadence:** Review whenever `npm run check:updates` reports a newer Tamagui release.
- **Upstream issue:** [tamagui/tamagui#4161](https://github.com/tamagui/tamagui/issues/4161)
- **Upstream fix:** [tamagui/tamagui#4174](https://github.com/tamagui/tamagui/pull/4174), merge commit `1c84b171bbcfffd2840d5a0d8125d27f1bac086a`

React Native Fabric stores `zIndex` as a signed 32-bit integer. Toast v2 in Tamagui 2.7.7 passes `Number.MAX_SAFE_INTEGER` to its native portal; it wraps to `-1`, placing the toast behind the application. `AppToastHost` currently passes the large but int32-safe value `100_000` through `portalZIndex`.

When a released Tamagui version includes the upstream portal clamp:

1. Update all `tamagui` and `@tamagui/*` packages together.
2. Confirm the installed `@tamagui/portal` native implementation contains the signed 32-bit z-index clamp.
3. Remove `TOAST_PORTAL_Z_INDEX` and the explicit `portalZIndex` prop from `components/feedback/app-toast-host.tsx`.
4. Verify error and success toasts in an iOS Fabric build, then run `npm run quality`.
5. Remove this follow-up section.
