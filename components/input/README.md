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
- `type="checkbox"`: Checkbox input with custom styling (see Checkbox section below).
- `type="radio"`: Radio button input with custom styling (see Radio section below).

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

## Checkbox Input

The checkbox component provides a custom-styled checkbox input with support for multiple sizes and states.

### Checkbox Structure

Checkboxes require a specific HTML structure:

```html
<label class="input-checkbox">
  <input type="checkbox">
  <span class="input-checkbox-box">
    <span class="input-checkbox-checkmark"></span>
  </span>
  <span class="input-checkbox-label">Checkbox Label</span>
</label>
```

### Checkbox Sizes

- **Default**: 32px checkbox box, large label text (17px)
- `.input-checkbox-small`: 26px checkbox box, medium label text (16px)
- `.input-checkbox-xsmall`: 20px checkbox box, small label text (14px)

### Checkbox States

- **Default**: White background with gray border
- **Hover**: Blue border (primary color)
- **Checked**: Blue background with white checkmark icon
- **Disabled**: Reduced opacity (0.45 for box, 0.2 for label)

### Checkbox Examples

```html
<!-- Default Checkbox -->
<label class="input-checkbox">
  <input type="checkbox">
  <span class="input-checkbox-box">
    <span class="input-checkbox-checkmark"></span>
  </span>
  <span class="input-checkbox-label">Checkbox Label</span>
</label>

<!-- Checked Checkbox -->
<label class="input-checkbox">
  <input type="checkbox" checked>
  <span class="input-checkbox-box">
    <span class="input-checkbox-checkmark"></span>
  </span>
  <span class="input-checkbox-label">Checkbox Label</span>
</label>

<!-- Small Checkbox -->
<label class="input-checkbox input-checkbox-small">
  <input type="checkbox">
  <span class="input-checkbox-box">
    <span class="input-checkbox-checkmark"></span>
  </span>
  <span class="input-checkbox-label">Checkbox Label</span>
</label>

<!-- XSmall Checkbox -->
<label class="input-checkbox input-checkbox-xsmall">
  <input type="checkbox">
  <span class="input-checkbox-box">
    <span class="input-checkbox-checkmark"></span>
  </span>
  <span class="input-checkbox-label">Checkbox Label</span>
</label>

<!-- Disabled Checkbox -->
<label class="input-checkbox disabled">
  <input type="checkbox" disabled>
  <span class="input-checkbox-box">
    <span class="input-checkbox-checkmark"></span>
  </span>
  <span class="input-checkbox-label">Checkbox Label</span>
</label>
```

### Checkbox Features

- **Custom Styling**: Native checkbox is hidden and replaced with a custom-styled box
- **Checkmark Icon**: White checkmark appears when checked, using SVG mask for crisp rendering
- **Focus Ring**: Accessible focus indicator with primary color ring
- **Accessibility**: Proper label association and keyboard navigation support
- **Responsive**: Adapts to dark mode automatically

## Radio Input

The radio component provides a custom-styled radio button input with support for multiple sizes and states. Radio buttons are used when only one option can be selected from a group.

### Radio Structure

Radio buttons require a specific HTML structure and must share the same `name` attribute to function as a group:

```html
<label class="input-radio">
  <input type="radio" name="group-name">
  <span class="input-radio-circle">
    <span class="input-radio-dot"></span>
  </span>
  <span class="input-radio-label">Radio Label</span>
</label>
```

### Radio Sizes

- **Default**: 32px radio circle, large label text (17px)
- `.input-radio-small`: 26px radio circle, medium label text (16px)
- `.input-radio-xsmall`: 20px radio circle, small label text (14px)

### Radio States

- **Default**: White background with gray border
- **Hover**: Blue border (primary color)
- **Checked**: Blue border with blue inner dot
- **Disabled**: Reduced opacity (0.45 for circle, 0.2 for label)

### Radio Examples

```html
<!-- Default Radio -->
<label class="input-radio">
  <input type="radio" name="option">
  <span class="input-radio-circle">
    <span class="input-radio-dot"></span>
  </span>
  <span class="input-radio-label">Radio Label</span>
</label>

<!-- Checked Radio -->
<label class="input-radio">
  <input type="radio" name="option" checked>
  <span class="input-radio-circle">
    <span class="input-radio-dot"></span>
  </span>
  <span class="input-radio-label">Radio Label</span>
</label>

<!-- Radio Group -->
<div>
  <label class="input-radio">
    <input type="radio" name="size" value="small">
    <span class="input-radio-circle">
      <span class="input-radio-dot"></span>
    </span>
    <span class="input-radio-label">Small</span>
  </label>
  <label class="input-radio">
    <input type="radio" name="size" value="medium" checked>
    <span class="input-radio-circle">
      <span class="input-radio-dot"></span>
    </span>
    <span class="input-radio-label">Medium</span>
  </label>
  <label class="input-radio">
    <input type="radio" name="size" value="large">
    <span class="input-radio-circle">
      <span class="input-radio-dot"></span>
    </span>
    <span class="input-radio-label">Large</span>
  </label>
</div>

<!-- Small Radio -->
<label class="input-radio input-radio-small">
  <input type="radio" name="option-small">
  <span class="input-radio-circle">
    <span class="input-radio-dot"></span>
  </span>
  <span class="input-radio-label">Radio Label</span>
</label>

<!-- XSmall Radio -->
<label class="input-radio input-radio-xsmall">
  <input type="radio" name="option-xsmall">
  <span class="input-radio-circle">
    <span class="input-radio-dot"></span>
  </span>
  <span class="input-radio-label">Radio Label</span>
</label>

<!-- Disabled Radio -->
<label class="input-radio disabled">
  <input type="radio" name="option-disabled" disabled>
  <span class="input-radio-circle">
    <span class="input-radio-dot"></span>
  </span>
  <span class="input-radio-label">Radio Label</span>
</label>
```

### Radio Features

- **Custom Styling**: Native radio button is hidden and replaced with a custom-styled circle
- **Inner Dot**: Blue dot appears when checked, indicating selection
- **Focus Ring**: Accessible focus indicator with primary color ring
- **Group Behavior**: Radio buttons with the same `name` attribute work as a group (only one can be selected)
- **Accessibility**: Proper label association and keyboard navigation support
- **Responsive**: Adapts to dark mode automatically

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

