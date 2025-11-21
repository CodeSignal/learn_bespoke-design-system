# Input Component

A versatile input component matching the CodeSignal Design System. Supports text and number inputs with various states and styling options.

## Usage

Import the CSS file in your HTML or CSS:

```html
<link rel="stylesheet" href="/design-system/components/input/input.css">
```

or

```css
@import url('/design-system/components/input/input.css');
```

## Classes

### Base Class
- `.input`: The base class required for all input fields.

### Input Types
- `type="text"`: Standard text input (default).
- `type="number"`: Numeric input with styled spinner buttons.

### States
The component supports standard pseudo-classes (`:hover`, `:focus`, `:disabled`) and utility classes for manual state application:
- `.hover`: Applies hover state styling (stronger border color).
- `.focus`: Applies focus state styling (primary border color and focus ring).
- `:disabled`: Disabled state (reduced opacity and not-allowed cursor).

## HTML Examples

```html
<!-- Default Text Input -->
<input type="text" class="input" placeholder="Enter text...">

<!-- Input with Hover State -->
<input type="text" class="input hover" placeholder="Hover me">

<!-- Input with Focus State -->
<input type="text" class="input focus" placeholder="Focus me">

<!-- Filled Input -->
<input type="text" class="input" value="Pre-filled value">

<!-- Disabled Input -->
<input type="text" class="input" disabled placeholder="Disabled input">

<!-- Number Input -->
<input type="number" class="input" placeholder="Enter number...">

<!-- Number Input with Value -->
<input type="number" class="input" value="100">
```

## Features

### Number Input Spinner Buttons
Number inputs (`type="number"`) include styled spinner buttons that:
- Are properly sized and positioned within the input
- Have subtle opacity that increases on hover and focus
- Work consistently across WebKit browsers (Chrome, Safari, Edge) and Firefox
- Maintain the input's width without requiring extra padding

### Focus Ring
When focused, inputs display a subtle focus ring using the primary color with reduced opacity for better accessibility.

## Dark Mode

The component automatically adapts to dark mode via the `@media (prefers-color-scheme: dark)` query. All states are optimized for both light and dark themes.

## Dependencies

This component relies on variables from:
- `design-system/colors/colors.css`
- `design-system/spacing/spacing.css`
- `design-system/typography/typography.css`

