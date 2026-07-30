# Features

Each business feature owns its screens, presentation components, hooks, API adapters, and local utilities. Stable domain schemas and their inferred types live in `src/schemas/<domain>/`. A typical implemented feature may contain:

```text
feature/
  api/
  components/
  hooks/
  screens/
  utils.ts
  index.ts
```

Only `index.ts` is public to routes and other features. Do not add empty implementation files merely to match this example.

Do not add `features/<feature>/types.ts` for stable domain models or business inputs. Define those contracts schema-first under `src/schemas/<domain>/` and import their inferred types through the domain barrel. Feature-local implementation types that do not represent runtime domain data remain next to the code that owns them.
