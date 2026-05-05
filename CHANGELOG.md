# Changelog

All notable changes to **Style Pastel** are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2026-05-05

### Added

- Initial release.
- Category-based highlighting for HTML inline `style` declarations across six groups: **Layout**, **Box**, **Typography**, **Surface**, **Motion**, **Other**. Palette matches [Tailwind Pastel](https://marketplace.visualstudio.com/items?itemName=alkemic-studio.tailwind-pastel).
- Anchor-only decoration: only the property name (e.g. `padding` in `padding: 16px`) gets the category color in bold — values stay untinted so dense walls of declarations remain readable.
- CSS custom property highlighting:
    - `--brand: red;` — the declaration's property name gets a distinct cool tone (slate-300).
    - `var(--brand)` references inside values — the same tone at normal weight, so refs and decls stay related but visually distinct.
- Long property names classify by their longest matching prefix — `padding-inline-start` → Box, `border-top-left-radius` → Surface, `-webkit-mask-image` → Surface, `transition-timing-function` → Motion.
- Style string detection from:
    - Attributes: `style`, `:style` (Vue), `[style]` (Angular), `ngStyle`.
    - JSX expressions: `style={` `` ` `` `...` `` ` `` `}` tagged-template form (no `${}` interpolation).
    - JSX object form: `style={{ paddingTop: 16, color: 'red' }}`.
        - camelCase keys (`paddingTop` → `padding-top`) classify correctly.
        - Vendor prefixes via leading uppercase (`WebkitMaskImage` → `-webkit-mask-image`).
        - Quoted keys keep their literal form, so `'padding-top'` and `'--brand'` work.
        - String literals, template literals (with `${}` interpolation), comments, and nested `()`/`[]`/`{}` inside values don't split a declaration.
        - Spread (`...base`) and computed keys (`[expr]`) are skipped.
- Setting `stylePastel.enabled` (boolean, default `true`).
- Commands:
    - `Style Pastel: Toggle Highlighting` — flip the enabled setting (workspace target if defined, otherwise global).
    - `Style Pastel: Inspect Declaration at Cursor` — show the category of the declaration under the cursor in the status bar.
- Supported languages: TypeScript React, JavaScript React, HTML, Vue, Svelte, Astro.
- Performance:
    - Debounced re-highlighting (150ms) on document changes.
    - Document-level token cache keyed by `TextDocument.version`.
    - Windowed incremental rescan for single-line edits — only the affected ±5 lines are re-extracted, the rest of the cache is shifted by the change delta.

[0.0.1]: https://github.com/juncha9/style-pastel/releases/tag/v0.0.1
