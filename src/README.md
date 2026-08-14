# Source Architecture

UI code is organized by reuse scope and business-state ownership, not by visual size.

## Dependency Direction

```text
app -> providers -> i18n/Tamagui/Router theme
app -> feature public entry -> feature screen -> feature hooks/components
session -> auth/dashboard public entries
feature screens/hooks/components -> domain schemas + feature selectors/utils/data source
features -> components public entry -> components/ui
```

- `app/` contains Expo Router route and layout files only. Route files mount feature or shared layout entry points and always export a default component.
- `(auth)` and `(app)` route groups separate public authentication from protected application routes without adding group names to public URLs.
- `providers/` contains application-wide provider composition such as fonts, splash lifecycle, localization, Tamagui, and Router theme.
- `features/session/` owns protected navigation intent and the shared terminal shell used across authentication and application routes. The global store owns the persisted User Session.
- `features/<feature>/index.ts` is the feature's public API. Routes and other features must not import its internal files directly.
- A mature responsibility may live under `features/<feature>/<slice>/` when it owns multiple real artifacts. Internal slices are ownership boundaries inside a feature, not additional public features.
- `features/<feature>/screens/` contains feature entry screens and business-state composition boundaries.
- `features/<feature>/components/` contains presentation shared by multiple internal slices or by the feature shell. A slice's own `components/` contains presentation used only by that slice.
- `features/<feature>/hooks/` contains feature-owned controllers and data hooks. It is not a destination for globally reusable hooks.
- `schemas/<domain>/` contains Valibot schemas and exports stable domain and input types with `InferOutput`. Domain barrels are the canonical import boundary for both schema values and inferred types; see `schemas/README.md` for the schema-first contract.
- Feature selectors derive screen-ready data, and `features/<feature>/utils.ts` contains feature-local pure helpers.
- `features/<feature>/mocks/` contains development fixtures and mock construction boundaries; it is not a production data layer.
- `components/index.ts` is the public API for globally reusable UI. `components/ui/` contains business-agnostic Tamagui primitives and visual effects; `components/layout/` contains reusable page layouts.
- `i18n/` contains locale resolution, typed resources, and feature-oriented translation namespaces. Its React provider lives in `providers/`.
- `lib/` owns shared third-party initialization, including the MMKV adapter. `store/` owns the single cross-feature Zustand store; placeholder directories for `services/`, `config/`, global `hooks/`, `constants/`, and `utils/` contain ownership notes.
- Tamagui tokens, themes, media queries, fonts, and animations remain centralized in the root `tamagui.config.ts`; do not duplicate them under `src/theme/`.
- `types/` contains ambient and module declarations only; domain types are inferred from schemas under `schemas/`.

## State Rules

Shared UI and feature presentation components receive business data and actions through props. They may still use local UI state, refs, animation hooks, measurements, accessibility hooks, and Tamagui theme APIs.

Examples of local UI state include password visibility, the selected filter, form validation messages, sheet visibility, and animation progress. The global store owns the User Session, the selected API Node, and the runtime Game Account selection reference. Game Account data and account-scoped server data are owned by TanStack Query; the Store never mirrors them, and the selection is never persisted. A store slice should own a UI preference only after a user can explicitly choose it and it must survive restart.

Large components do not automatically become state-connected. For example, an Operator Roster remains props-driven while a thin feature screen or container selects Operators from the store and passes them down.

## Internationalization

- Supported application locales are declared in `i18n/locale.ts`; the default locale is also the fallback used for static web rendering.
- Translation resources live in `i18n/locales/<locale>/<namespace>.json`. Keep each locale's namespace files and nested keys identical; `npm run i18n:check` enforces this.
- Use the `common` namespace for shared actions and accessibility text. Feature copy belongs in its feature namespace, such as `auth` or `dashboard`.
- Store stable IDs or error states in component state and translate them during render. Do not store translated strings or use display copy as a business identifier.
- Use interpolation and pluralization for dynamic sentences instead of concatenating translated fragments.
- Game-domain content and taxonomy remain source data in their original language unless a later product decision brings them into localization scope.

## Placement

- Put a component in `components/ui/` only when it is reusable across features and does not use business model types.
- Put presentation shared by a feature shell or multiple slices in `features/<feature>/components/`. Put slice-owned presentation, such as Inventory or Operator Roster UI, in `features/<feature>/<slice>/components/`.
- Create slice `components/`, `screens/`, `mocks/`, `api/`, and helper modules only when real owned files exist. Do not create empty folders for symmetry.
- Feature presentation components import domain types from `@/schemas/<domain>` and may import their own feature's `utils.ts` through a single-level relative import, but they do not import mocks, APIs, stores, or screens.
- Put store, context, API, and routing access in the feature screen or feature hook that composes those components.
- Export feature entry points explicitly from `features/<feature>/index.ts`. Do not add public slice barrels or import another feature's internal files.
- Import shared UI through `@/components`; internal shared UI files use relative imports to avoid barrel cycles.

ESLint enforces the critical import boundaries for shared UI and feature presentation components.
