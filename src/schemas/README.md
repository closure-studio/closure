# Domain Schemas

Valibot schemas in this directory are the source of truth for stable domain data and business input contracts.

## Contract

- Place each schema in `<domain>/<name>.schema.ts` and export it through the domain's `index.ts`.
- Define the schema value first, then export the trusted type with `v.InferOutput<typeof schema>` from the same file.
- Compose schemas for nested domain data and shared literals; do not duplicate their shapes as handwritten types, interfaces, constants, or validators.
- Import schema values and types through `@/schemas/<domain>`. Use `import type` when runtime validation is not required by the consumer.
- Validate untrusted data once at its ingress boundary. Already-trusted domain objects do not need repeated parsing during render or in-memory updates.
- Keep UI props, local component state, framework types, and types derived from local constants beside their implementation when they are not runtime domain contracts.
- Test accepted values, rejected values, boundary rules, transformations, cross-field invariants, and canonical fixtures in proportion to each schema's contract.

Do not add feature-local `types.ts` files for models owned here. `src/types/` remains reserved for ambient and module declarations.
