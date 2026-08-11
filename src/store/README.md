# Global Store

`useAppStore` is the single owner of cross-feature User Session and Game Account state. Callers select the smallest value they render and invoke store actions for updates; presentation components continue to receive business data and actions through props.

The store persists its `user` and `games` data through Zustand's persist middleware into the shared MMKV adapter in `src/lib/mmkv.ts`. No feature or UI module reads or writes MMKV directly. Actions, loading state, forms, sheets, filters, responsive Layout Size, and other temporary UI state are not persisted.

The current User Session deliberately persists username, password, and token without MMKV encryption. This relies only on the operating-system application sandbox and must not be treated as secure credential storage.

Add a `uiSettings` slice only when the application gains a real user-selected presentation preference that must survive restart. Do not add an empty slice or mirror Tamagui media/theme state.
