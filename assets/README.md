# Assets

Static files are grouped by runtime purpose:

- `images/`: product imagery, splash artwork, and other bitmap content.
- `icons/`: application icons, favicons, and icon variants.
- `fonts/`: local font files when package-provided fonts are not sufficient.
- `animations/`: bundled animation data such as Lottie or Rive assets.
- `data/`: bundled game data resources such as the Item Table.

The bundled Item Table at `data/item_table.json` is sourced from
<https://ark-resource.arknights.app/data/item_table.json>.

Keep generated platform resources in their platform-specific subdirectory and update `app.json` whenever an application icon or splash path moves.
