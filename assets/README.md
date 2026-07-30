# Assets

Static files are grouped by runtime purpose:

- `images/`: product imagery, splash artwork, and other bitmap content.
- `icons/`: application icons, favicons, and icon variants.
- `fonts/`: local font files when package-provided fonts are not sufficient.
- `animations/`: bundled animation data such as Lottie or Rive assets.

Keep generated platform resources in their platform-specific subdirectory and update `app.json` whenever an application icon or splash path moves.
