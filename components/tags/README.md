# Tag Component

A versatile tag component matching the CodeSignal Design System. Tags are used to display labels, categories, or status indicators.

## Usage

Import the CSS file in your HTML or CSS:

```html
<link rel="stylesheet" href="/design-system/components/tags/tags.css">
```

or

```css
@import url('/design-system/components/tags/tags.css');
```

## Classes

### Base Class
- `.tag` or `.tag.default`: The base class required for all tags. Provides default styling (Primary variant).

### Variants
- `.tag` / `.tag.default`: Primary tag (Brand Blue background).
- `.tag.secondary`: Secondary tag (Neutral gray background).
- `.tag.outline`: Outline tag (Transparent background with border).
- `.tag.success`: Success tag (Green background, for positive states).
- `.tag.error`: Error tag (Red background, for error/danger states).
- `.tag.warning`: Warning tag (Yellow background, for warning states).
- `.tag.info`: Info tag (Sky Blue background, for informational states).

### States
The component supports standard pseudo-classes (`:hover`, `:focus`, `:active`) and utility classes for manual state application:
- `.hover`: Applies hover state styling.
- `.focus`: Applies focus state styling (includes focus ring).
- `.active`: Applies active state styling (includes border).

## HTML Examples

```html
<!-- Primary Tag (Default) -->
<div class="tag">Tag Label</div>

<!-- Secondary Tag -->
<div class="tag secondary">Category</div>

<!-- Outline Tag -->
<div class="tag outline">Filter</div>

<!-- Success Tag -->
<div class="tag success">Completed</div>

<!-- Error Tag -->
<div class="tag error">Failed</div>

<!-- Warning Tag -->
<div class="tag warning">Pending</div>

<!-- Info Tag -->
<div class="tag info">New</div>

<!-- Tag with Hover State -->
<div class="tag success hover">Hover State</div>

<!-- Tag with Focus State -->
<div class="tag info focus" tabindex="0">Focus State</div>

<!-- Tag with Active State -->
<div class="tag error active">Active State</div>
```

## Dark Mode

The component automatically adapts to dark mode via the `@media (prefers-color-scheme: dark)` query. All variants are optimized for both light and dark themes.

## Dependencies

This component relies on variables from:
- `design-system/colors/colors.css`
- `design-system/spacing/spacing.css`
- `design-system/typography/typography.css`

