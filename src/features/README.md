# Features

Each business feature owns its screens, presentation components, hooks, API adapters, and local utilities. Stable domain schemas and their inferred types live in `src/schemas/<domain>/`. A typical implemented feature may contain:

```text
feature/
  api/
  components/
  hooks/
  screens/
  owned-slice/
    components/
    mocks/
    screens/
    helper.ts
  utils.ts
  index.ts
```

Internal slices are optional ownership clusters for mature responsibilities with multiple real artifacts. Parent `components/` remains for presentation shared by the feature shell or multiple slices; slice `components/` is owned only by that slice. Create `api/`, `components/`, `hooks/`, `mocks/`, `screens/`, and helpers only when real files require them.

Only the feature-root `index.ts` is public to routes and other features. Do not add slice barrels or empty implementation files merely to match this example.

Do not add `features/<feature>/types.ts` for stable domain models or business inputs. Define those contracts schema-first under `src/schemas/<domain>/` and import their inferred types through the domain barrel. Feature-local implementation types that do not represent runtime domain data remain next to the code that owns them.
