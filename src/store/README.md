# Global Store

`useAppStore` is the single owner of the cross-feature User Session, selected API Node, and current-run Game Account selection. Callers select the smallest value they render and invoke store actions for updates; presentation components continue to receive business data and actions through props.

The store persists its remembered `auth.session` and `selectedApiNodeId` through Zustand's persist middleware into the shared MMKV adapter in `src/lib/mmkv.ts`. The transient `selectedGameAccountId` is excluded, so a new App or web run starts from the first available Game Account. No feature or UI module reads or writes MMKV directly. Actions, loading state, errors, forms, sheets, filters, responsive Layout Size, and other temporary UI state are not persisted.

ArkHost server data — the Game Account list, detail, characters, and logs — lives exclusively in the TanStack Query cache. `DashboardAccountProvider` combines that list with the Store-owned selection and derives the matching Game Account, or the first account when no valid selection exists. Dashboard routes contain only the active page, and no Game Account object or server payload is copied into the Store.

The same Store persists validated Game Resource Catalog downloads under a fixed second key. This keeps large resource tables out of frequent User Session and Game Account list writes while preserving one Store and one persistence boundary across native and web.

Login credentials never enter the User Session. When a person does not choose to remember the session, neither the Session nor Game Account data is written to MMKV.

Add a `uiSettings` slice only when the application gains a real user-selected presentation preference that must survive restart. Do not add an empty slice or mirror Tamagui media/theme state.
