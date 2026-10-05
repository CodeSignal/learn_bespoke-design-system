# Colors Design System

This directory contains the color system definitions for the application.

## Usage

Import the CSS file in your HTML or CSS:

```html
<link rel="stylesheet" href="/design-system/colors/colors.css">
```

or

```css
@import url('/design-system/colors/colors.css');
```

## Variable Structure

The color system is divided into two layers:

### 1. Base Scales (Primitive Tokens)

These are the raw color values defined on numbered scales. **Avoid using these directly** in your components if a semantic alternative exists.

Pattern: `--Colors-Base-[Family]-[Scale]-[Step]`

Examples:
- `--Colors-Base-Primary-700`
- `--Colors-Base-Neutral-00`
- `--Colors-Base-Accent-Green-500`
- `--Colors-Base-Neutral-Alphas-1000-25` (Alpha variants)

Families:
- `Primary`: Main brand colors (Blue)
- `Neutral`: Grays, White, Black
- `Accent-Green`: Success states
- `Accent-Sky-Blue`: Info states
- `Accent-Midnight-Blue`: Accent blue
- `Accent-Yellow`: Warning states
- `Accent-Orange`: Warning states
- `Accent-Red`: Error/Danger states
- `Accent-Magenta`: Magenta accent

Also: `--Colors-Alpha-Neutral-*` / `--Colors-Alpha-Primary-*` ramps (Subtle → Boldest).

### 2. Semantic Names (Contextual Tokens)

These variables map the base colors to specific usage contexts. **Prefer using these variables** to ensure consistency and support for theming (e.g., Dark Mode).

Categories:

- **Primary**: Brand colors
  - e.g., `--Colors-Primary-Default`, `--Colors-Primary-Medium`
- **Backgrounds**: Legacy surface colors (kept for compatibility)
  - e.g., `--Colors-Backgrounds-Main-Default`, `--Colors-Backgrounds-Main-Top`
- **Surface**: App / container / nav / scrim surfaces (co-design-al parity)
  - e.g., `--Colors-Surface-App-Base`, `--Colors-Surface-Container-High`
- **Text**: Typography colors
  - e.g., `--Colors-Text-Body-Default`, `--Colors-Text-Body-Primary`
- **Icon**: Iconography colors
  - e.g., `--Colors-Icon-Default`, `--Colors-Icon-Primary-Medium`
- **Stroke**: Legacy border colors (opaque; kept for compatibility)
  - e.g., `--Colors-Stroke-Default`, `--Colors-Stroke-Strong`
- **Border**: Alpha-composited borders (co-design-al parity)
  - e.g., `--Colors-Border-Medium`, `--Colors-Border-Focus-Visible`
- **Control**: Interactive control fills, progress, toggles
  - e.g., `--Colors-Control-Neutral-Soft`, `--Colors-Control-Progress-Primary-Thumb`
- **Emphasis**: Soft fills and shadow tints
  - e.g., `--Colors-Emphasis-Subtle`, `--Colors-Emphasis-Shadow-Medium`
- **Alert**: Feedback colors (Success, Error, Warning, Info)
  - e.g., `--Colors-Alert-Success-Default`, `--Colors-Alert-Error-Medium`

## Dark Mode

The system automatically handles Dark Mode via the `@media (prefers-color-scheme: dark)` query. By using the **Semantic Names**, your components will automatically adapt to the user's system preference.

## Contrast (WCAG)

Semantic text and focus tokens are chosen to meet WCAG 2.2 AA against `Backgrounds-Main-Top` in each theme (values synced to co-design-al foundations):

| Token | Requirement | Notes |
| :--- | :--- | :--- |
| `--Colors-Primary-Default` | ≥ 3:1 (non-text / focus) | Same Primary-700 in light and dark; dark Main-Top is near-black so 700 clears 3:1. |
| `--Colors-Text-Body-Lighter` | ≥ 4.5:1 (body text) | Use at full opacity. **Do not fade this token** with `opacity` — layering transparency will drop it below 4.5:1. |
| `--Colors-Text-Body-Light` | ≥ 4.5:1 | Also used for input placeholders; kept one step stronger than Lighter. |

### Stroke tokens in dark mode

`--Colors-Stroke-*` are remapped in the dark block onto dark neutrals / primary steps (not the light near-white scale). Prefer these semantic stroke tokens for borders and dividers so components adapt automatically; avoid hardcoding `Neutral-100`…`550` for borders if you need theming.

For new work, prefer `--Colors-Border-*` (alpha-composited) when matching co-design-al. Existing `--Colors-Stroke-*` names are unchanged for compatibility.

`npm test` includes `tests/contrast-tokens.spec.js`, which measures text/focus ratios and asserts stroke tokens dark-adapt.

