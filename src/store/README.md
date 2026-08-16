# Global Store

`useAppStore` is the single owner of the cross-feature User Session, the selected API Node, and the runtime Game Account selection reference. Callers select the smallest value they render and invoke store actions for updates; presentation components continue to receive business data and actions through props.

The store persists its remembered `auth.session` and `selectedApiNodeId` through Zustand's persist middleware into the shared MMKV adapter in `src/lib/mmkv.ts`. No feature or UI module reads or writes MMKV directly. Actions, loading state, errors, forms, sheets, filters, responsive Layout Size, and other temporary UI state are not persisted.

Zustand owns only the runtime `selectedGameAccountId` reference. ArkHost server data — the Game Account list, detail, characters, and logs — lives exclusively in the TanStack Query cache. The selected Game Account object is a derived value computed from that cache and the Store selection, never stored as a second copy. The selection is never persisted; it resets to `null` on logout, on session principal changes, and whenever the selected account is no longer present in a successfully fetched list.

The same Store persists validated Game Resource Catalog downloads under a fixed second key. This keeps large resource tables out of frequent User Session and Game Account list writes while preserving one Store and one persistence boundary across native and web.

Login credentials never enter the User Session. When a person does not choose to remember the session, neither the Session nor Game Account data is written to MMKV.

Add a `uiSettings` slice only when the application gains a real user-selected presentation preference that must survive restart. Do not add an empty slice or mirror Tamagui media/theme state.
