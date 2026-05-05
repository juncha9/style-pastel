# Style Pastel

[![VS Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/alkemic-studio.style-pastel?color=007ACC&logo=visual-studio-code&label=marketplace)](https://marketplace.visualstudio.com/items?itemName=alkemic-studio.style-pastel)
[![VS Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/alkemic-studio.style-pastel?color=informational&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=alkemic-studio.style-pastel)
[![VS Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/alkemic-studio.style-pastel?color=orange&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=alkemic-studio.style-pastel&ssr=false#review-details)
[![GitHub stars](https://img.shields.io/github/stars/juncha9/style-pastel?color=f5d90a&logo=github)](https://github.com/juncha9/style-pastel/stargazers)
[![last commit](https://img.shields.io/github/last-commit/juncha9/style-pastel?color=blueviolet&logo=github)](https://github.com/juncha9/style-pastel/commits/main)
[![license](https://img.shields.io/github/license/juncha9/style-pastel?color=green)](./LICENSE.md)
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-ea4aaa?logo=github-sponsors)](https://github.com/sponsors/juncha9)

Inline `style="..."` is a wall of `prop: value;` pairs. Pastel helps you read it — every declaration tinted by category, so layout, box, surface, and typography sort themselves out before your eyes do.

So `display: flex; align-items: center; gap: 16px; padding: 12px 8px; background: #fff; border-radius: 8px; font-size: 14px; font-weight: 500;` stops reading like noise — each declaration is painted in its category's hue, and your eyes group them automatically.

## Features

- **Category-based coloring** — every declaration's property name is colored by category
- **CSS variable highlighting** — both `--brand: red;` declarations and `var(--brand)` references inside values get a distinct cool tone (slate-300)
- **Multi-attribute support** — picks up `style`, `:style` (Vue), `[style]` (Angular), `ngStyle`, and JSX `style={` `` ` `` `...` `` ` `` `}` template literals
- **Long property aware** — `padding-inline-start`, `border-top-left-radius`, `-webkit-mask-image`, etc. classify by their longest matching prefix
- **Debounced updates** — re-highlights 150ms after edits to stay snappy on large files

## Categories

Six high-level groups, sharing the same palette as [Tailwind Pastel](https://marketplace.visualstudio.com/items?itemName=alkemic-studio.tailwind-pastel) so the visual language stays consistent if you use both:

| Category       | Color   | Covers                                                                              |
| -------------- | ------- | ----------------------------------------------------------------------------------- |
| **Layout**     | Blue    | `display`, `position`, `flex`/`grid`, `gap`, `justify/align/place-*`, `overflow`    |
| **Box**        | Emerald | sizing (`width`, `height`, `min/max-*`) and spacing (`padding-*`, `margin-*`)       |
| **Typography** | Amber   | `font-*`, `color`, `text-*`, `line-height`, `letter-spacing`, `white-space`         |
| **Surface**    | Pink    | `background-*`, `border-*`, `outline-*`, `box-shadow`, `opacity`, `filter`, `mask-*`|
| **Motion**     | Violet  | `transition-*`, `animation-*`, `transform`, `translate`, `rotate`, `scale`          |
| **Other**      | Gray    | `cursor`, `user-select`, `pointer-events`, `scroll-*`, `touch-action`, fallback     |

CSS custom properties (`--brand`) and `var(--brand)` references use a separate slate tone so they stand out from regular property names.

## Supported Languages

- TypeScript React (`.tsx`)
- JavaScript React (`.jsx`)
- HTML
- Vue
- Svelte
- Astro

## Detection

Style strings are extracted from the following attribute forms:

- `style="..."` / `style='...'` (HTML, Svelte, Astro, JSX)
- `style={` `` ` `` `...` `` ` `` `}` (JSX tagged-template inside expression — no `${}` interpolation)
- `style={{ ... }}` (JSX object form — camelCase keys, kebab-case quoted keys, vendor prefixes like `WebkitMaskImage`, and `'--brand'` custom properties all classify correctly)
- `:style="..."` (Vue)
- `[style]="..."` (Angular property binding)
- `ngStyle="..."` (Angular)

For string-based attributes, each `prop: value;` pair becomes one token. Parentheses and brackets in values are respected, so commas/semicolons inside `rgb(0, 0, 0)` or `calc(100% - 16px)` don't split a declaration.

For JSX object form, each `key: value` pair becomes one token, separated at top-level `,`. String literals, template literals (including `${}` interpolation), comments, and nested `()`/`[]`/`{}` are all skipped when looking for the separator. Spread (`...base`) and computed keys (`[expr]`) are ignored.

## Configuration

| Setting                  | Type      | Default | Description                  |
| ------------------------ | --------- | ------- | ---------------------------- |
| `stylePastel.enabled`    | `boolean` | `true`  | Enable category highlighting |

## Commands

| Command                                       | Description                                                                                         |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `Style Pastel: Toggle Highlighting`           | Flip `stylePastel.enabled` — writes to workspace settings if defined there, otherwise to global.    |
| `Style Pastel: Inspect Declaration at Cursor` | Shows the category of the declaration under the cursor in the status bar (debug helper).            |

## License

MIT — see [LICENSE.md](./LICENSE.md).
