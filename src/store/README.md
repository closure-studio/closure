# Global Store

`useAppStore` owns the cross-feature User Session, persisted startup request-mode preference, and selected API Node. Callers select only the values they consume and invoke Store actions for updates. Authentication forms, feedback, browser authorization, operation cancellation, verification transactions, and game-verification history remain with their owning features.

The store persists `auth.session`, `requestMode`, and `selectedApiNodeId` through Zustand's persist middleware into the shared MMKV adapter in `src/lib/mmkv.ts`. `requestMode` is a startup preference, not the active runtime environment. No feature or UI module reads or writes MMKV directly. Temporary state never enters the Store or its persistence pipeline.

`setNextRequestMode` changes only the persisted preference for the next launch; it does not replace the running API or clear unrelated Store state. The hidden login shortcut saves that preference and makes a best-effort reload request. If reload fails, the current runtime remains valid and the preference applies on the next normal launch. `src/services/api.ts` selects adapters once after synchronous Store hydration. Session and node transitions still cancel stale work without rebuilding adapters.

ArkHost server data — the Game Account list, detail, characters, and logs — lives exclusively in the TanStack Query cache. `DashboardAccountProvider` owns the dashboard-local Game Account selection and combines it with that list to derive the matching Game Account, or the first account when no valid selection exists. Dashboard routes contain only the active page, and no Game Account object or server payload is copied into the Store.

The same Store persists validated Game Resource Catalog downloads under a fixed second key. This keeps large resource tables out of frequent app-state writes while preserving one Store and one persistence boundary across native and web.

Login credentials never enter the User Session. When a person does not choose to remember the session, neither the Session nor Game Account data is written to MMKV.

Add a `uiSettings` slice only when the application gains a real user-selected presentation preference that must survive restart. Do not add an empty slice or mirror Tamagui media/theme state.
