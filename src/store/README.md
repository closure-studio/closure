# Global Store

`useAppStore` is the single owner of cross-feature User Session and Game Account state. Callers select the smallest value they render and invoke store actions for updates; presentation components continue to receive business data and actions through props.

The store persists its remembered `auth.session` and `games` data through Zustand's persist middleware into the shared MMKV adapter in `src/lib/mmkv.ts`. No feature or UI module reads or writes MMKV directly. Actions, loading state, errors, forms, sheets, filters, responsive Layout Size, and other temporary UI state are not persisted.

Login credentials never enter the User Session. When a person does not choose to remember the session, neither the Session nor its user-bound Game Account data is written to MMKV.

Add a `uiSettings` slice only when the application gains a real user-selected presentation preference that must survive restart. Do not add an empty slice or mirror Tamagui media/theme state.
