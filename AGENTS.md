# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Tamagui-First UI

Use Tamagui as the default UI and styling layer throughout `src/`. Before writing Tamagui code, run `npm run tamagui:generate` and read `.tamagui/prompt.md` so components, themes, tokens, media queries, fonts, and shorthands come from the project's actual configuration.

- Prefer Tamagui primitives and components such as `XStack`, `YStack`, `Text`, `Button`, `ScrollView`, `Collapsible`, `Dialog`, and `Sheet` over equivalent hand-written React Native UI.
- Prefer Tamagui theme and responsive APIs such as `useTheme`, `useThemeName`, `useMedia`, theme tokens, and platform/media props over custom color-scheme hooks, duplicated theme objects, or manual breakpoint logic.
- Use configured `$` tokens and available shorthand props for colors, spacing, sizes, radii, and typography. Do not guess token names or hardcode reusable visual values when a configured token exists.
- Use `styled()` and typed variants for reusable visual patterns. Add `as const` to variant definitions and keep base props before responsive or platform overrides so later props override correctly.
- Check Tamagui's built-in and compound components before implementing component state, accessibility, adaptation, portals, or interaction behavior from scratch.
- Prefer `$platform-*` and configured media props inside Tamagui styles instead of branching on `Platform.OS` inside `styled()` definitions.

Keep direct React Native or Expo APIs when they are the correct platform boundary, including Expo Router integration, native tabs, safe-area measurements, system color-scheme initialization for `TamaguiProvider`, Reanimated-specific views, and third-party components with required native event contracts. Do not add wrappers solely to eliminate React Native imports.

Import the full UI kit and configuration APIs from `tamagui`, keep `TamaguiProvider` in the root layout, and keep direct `tamagui` and `@tamagui/*` package versions aligned. After Tamagui UI or configuration changes, run `npm run tamagui:check`, `npm run tamagui:generate`, `npx tsc --noEmit`, and the relevant web/native bundle checks.

# Expo Bundle Verification

Use `npm run export:all` from the current repository when a change needs Web, iOS, and Android bundle verification. Expo SDK 57 supports `--platform all` natively, so one CLI run should coordinate all three platforms and write to the repository's default `dist/` directory.

- Do not start separate `expo export` commands for Web, iOS, and Android in parallel. Concurrent Metro instances contend over shared project caches and can hang without producing bundles.
- Do not pass `--output-dir` for routine verification. Use the default ignored `dist/` output in the current repository.
- Keep the combined export in the foreground and wait for it to finish; do not leave Expo or Metro verification processes running in background terminals.

# Valibot Schema-First Domain Models

Use Valibot as the source of truth for stable domain data, business inputs, and data that crosses a runtime trust boundary.

- Put schemas in `src/schemas/<domain>/<name>.schema.ts`. Use domain language such as `game-account`, not a screen or route name. Schema files contain no JSX and must use `.ts`, not `.tsx`.
- Export the schema value first and derive its trusted domain type from that value with `v.InferOutput`, for example `export type GameAccount = v.InferOutput<typeof gameAccountSchema>`. Do not maintain a handwritten `type` or `interface` that duplicates a schema.
- Compose larger schemas from smaller owning schemas. Reuse the same schema for shared literals, value objects, nested entities, and validation rules instead of repeating picklists or field shapes.
- Export schemas and inferred types explicitly from `src/schemas/<domain>/index.ts`. Consumers import through `@/schemas/<domain>`; consumers that only need a type must use `import type` so schema code is not pulled into the production bundle unnecessarily.
- Do not create `features/<feature>/types.ts` for domain models. Keep React props, component state, context values, third-party adapter types, and types already derived from local constants or library APIs next to their implementation when they do not represent runtime domain data.
- Treat API responses, persisted storage, route/search parameters, form payloads crossing into services, and other external values as untrusted. Validate them with the owning schema at the ingress boundary before they enter domain, store, or UI state. Do not repeatedly parse already-trusted objects during render or ordinary in-memory updates.
- Use `v.InferInput` only when a schema transformation creates a genuinely distinct raw input contract; otherwise expose only the `v.InferOutput` domain type. Keep normalization and validation semantics in the schema rather than in a parallel type or validator.
- Add focused schema tests for valid, boundary, empty, malformed, and cross-field failure cases. Canonical mocks and fixtures must be checked against their complete owning schema in tests.
- Keep `src/types/` for ambient and module declarations only. Before handing off a schema migration, confirm there are no legacy duplicate domain types or imports from removed feature `types.ts` files.

# Constants and Dependency Boundaries

Keep constants with their narrowest owner. Put stable, non-domain constants in `src/constants/<name>.ts` only when they are shared across features or architectural layers.

- Keep `src/constants` modules pure: no JSX and no imports from components, features, React Native, Expo UI packages, or other platform/UI modules.
- Import shared constants directly from their owning module, for example `@/constants/page-transition`. Do not re-export them from `@/components` or another broad barrel, and do not make pure logic import a UI or feature barrel just to read a constant.
- Keep feature-local policy values beside their feature owner. Do not move a constant to `src/constants` merely because more than one file in the same feature uses it.
- Do not put Tamagui tokens, translated display copy, domain literals owned by Valibot schemas, runtime environment configuration, or mock/fixture data in `src/constants`.
- In pure logic tests, import the subject and its constants from their direct modules so the test does not initialize unrelated UI or feature dependency graphs.

# TypeScript Quality Gate

Treat AI-generated TypeScript as untrusted until deterministic checks pass.

- Do not use `any`, non-null assertions, `@ts-ignore`, double assertions, or narrowing type assertions that substitute for validation. `as const` is allowed and required for Tamagui variants. Prefer `satisfies`, inference, discriminated unions, exhaustive branching, and runtime guards.
- Use `unknown` only at genuinely untrusted boundaries such as parsed external data, caught errors, storage, or third-party callbacks. Narrow it immediately before the value enters domain or UI code. Type annotations do not validate runtime data.
- Await, return, or handle every Promise. Event handlers that must return `void` should call an async function that handles its own rejection. Do not use `void promise` only to silence lint. Clean up effects and account for races or unmounted consumers.
- Name values that encode policy or protocol: timeouts, retry counts, limits, thresholds, storage keys, endpoints, regular expressions, and stable state IDs. Keep constants with their narrowest owner. Obvious arithmetic values, array indexes, one-off layout dimensions, shader coefficients, and mock fixture data do not need artificial constants.
- Put user-visible prose in i18n resources and reusable visual values in Tamagui tokens. Preserve punctuation and domain fixture content when they are data rather than interface copy.
- Do not guess Expo APIs or install plausible package names. Check the Expo 57 documentation and the package's official registry/source, prefer existing dependencies, and install Expo-compatible packages with `npx expo install`.
- Avoid speculative abstractions, duplicated domain types or rules, catch-all utility modules, silent fallbacks, swallowed errors, prop/state mutation, and unnecessary effects or memoization. Test success, boundary, empty, and failure paths in proportion to the change.
- Before handing off TypeScript changes, run `npm run quality`. For Tamagui UI/config changes, also regenerate the prompt and run the bundle checks required above.
