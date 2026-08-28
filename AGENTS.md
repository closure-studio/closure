# Systemic Simplification Before Patching

Optimize for the smallest necessary system, not the fewest lines. Before a fix or feature, review the execution path and blast radius; prefer deleting, replacing, or consolidating existing code over layering new state, wrappers, flags, or fallbacks on top of it.

- Keep one authoritative source of truth per concern. Do not mirror store, router, schema, or server state in a second local copy; refactor across modules so the final behavior has one owner and one seam.
- Apply the deletion test to every new module or abstraction: if deleting it makes complexity disappear rather than move into multiple callers, do not add it.
- Add fallbacks only for a concrete, named failure mode at a real trust or platform seam.
- Keep refactors bounded to the requested behavior and its real dependencies; preserve unrelated changes and prove the result with proportionate tests and the quality gates. Tests verify the simplified design and are exempt from line-count pressure.

# Application Data Flow

```text
Presentational UI <- props
        ^
Screen / Route
   ├── App Store <-> Zustand Persist <-> MMKV
   │     client state and client workflows
   │
   └── Feature Query Layer <-> Server
         server state, cache, mutations and SSE
```

- The App Store is the single owner of client state and client workflows; screens and routes read it through selectors and call its actions.
- The Feature Query Layer (TanStack Query) is the single owner of server state: cache, mutations, and SSE updates.
- Store actions own client workflows; query hooks, options, and mutations own server operations.
- Screens never call the API service or MMKV directly; presentational UI receives values and callbacks through props and never imports the Store, query layer, services, or MMKV.
- Combine Store and Query state in the owning feature hook, not in every Route.
- Never mirror state across the boundary: no Query -> Store and no Store -> Query copies.
- Validate server responses, SSE payloads, and persisted storage once at their ingress boundary with the owning Valibot schema. Never keep synchronized copies of the same data in UI, networking, and persistence.
- Access MMKV only through the Zustand persist adapter. Persist only stable client state; exclude actions, loading/error state, Promises, and cancellation handles.

# Tamagui-First UI

Use Tamagui as the default UI and styling layer. Before writing Tamagui code, run `npm run tamagui:generate` and read `.tamagui/prompt.md`.

- Prefer Tamagui primitives, theme APIs, media queries, and `$` tokens over hand-written React Native UI, custom color-scheme hooks, or manual breakpoint logic. Use `styled()` with typed variants for reusable patterns.
- Check built-in and compound components before implementing state, accessibility, or interaction from scratch.
- Keep direct React Native or Expo APIs at real platform boundaries: Expo Router, native tabs, safe-area measurements, `TamaguiProvider` init, third-party native components.
- Keep `tamagui` and `@tamagui/*` versions aligned. After UI or config changes run `npm run tamagui:check`, `npm run tamagui:generate`, and `npx tsc --noEmit`.
- Put user-visible prose in i18n resources, not hardcoded strings.

Closure has two width layouts. Small is the default; large starts at 768px.

- Use small styles as component defaults and `$large` for structural overrides. Do not introduce additional width breakpoints.
- Use flex, wrap, or grid for continuous resizing instead of adding breakpoints.
- Call `useMedia().large` only when JavaScript values or different render trees are required. Read it at the lowest component that consumes it; never pass layout size through props.
- Do not create layout schemas, layout providers, or wrapper hooks around Tamagui media APIs.

# Valibot Schema-First Domain Models

Valibot schemas in `src/schemas/<domain>/` are the source of truth for domain data and cross-boundary input. The full contract lives in `src/schemas/README.md`.

- Define the schema value first and derive the trusted type with `v.InferOutput<typeof schema>`; do not keep handwritten duplicate types, and do not add feature-local `types.ts` for domain models.
- Compose larger schemas from smaller owning schemas and shared literals instead of repeating shapes.
- Validate untrusted data once at its ingress boundary: server responses, persisted storage, route/search params, form payloads. Do not re-parse already-trusted objects during render.
- Export schemas and types from the domain `index.ts`; consumers that only need a type must use `import type`.

# Constants and Dependency Boundaries

- Keep constants with their narrowest owner; use `src/constants/<name>.ts` only for stable, non-domain values shared across features or layers.
- Keep `src/constants` pure: no JSX and no UI imports. Import constants from their owning module, not a broad barrel.

# TypeScript Quality Gate

Treat AI-generated TypeScript as untrusted until deterministic checks pass.

- No `any`, non-null assertions, `@ts-ignore`, or double assertions. `as const` is allowed for Tamagui variants; prefer `satisfies`, inference, discriminated unions, and runtime guards.
- Use `unknown` only at untrusted boundaries (parsed external data, caught errors, storage, callbacks); narrow it immediately before domain or UI code.
- Await, return, or handle every Promise; clean up effects and account for races or unmounted consumers.
- Do not guess Expo APIs or install plausible packages: check the Expo 57 docs, prefer existing dependencies, and install with `npx expo install`.
- Before handing off changes, run `npm run quality`. For Tamagui UI or config changes, also regenerate the prompt.
