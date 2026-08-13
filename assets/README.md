# Assets

Static files are grouped by runtime purpose:

- `images/`: product imagery, splash artwork, and other bitmap content.
- `icons/`: application icons, favicons, and icon variants.
- `fonts/`: local font files when package-provided fonts are not sufficient.
- `animations/`: bundled animation data such as Lottie or Rive assets.
- `data/`: bundled game data resources such as the Item, Stage, and Character Tables.

The bundled game data tables are sourced from:

- <https://ark-resource.arknights.app/data/item_table.json>
- <https://ark-resource.arknights.app/data/stage_table.json>
- <https://ark-resource.arknights.app/data/character_table.json>

Run `npm run resources:sync` to validate and update the three bundled tables and
their matching `Last-Modified` timestamps. Each table is updated independently.

Keep generated platform resources in their platform-specific subdirectory and update `app.json` whenever an application icon or splash path moves.
