# Box Component

A flexible container component matching the CodeSignal Design System.

## Usage

Import the CSS file in your HTML or CSS:

```html
<link rel="stylesheet" href="/design-system/components/boxes/boxes.css">
```

or

```css
@import url('/design-system/components/boxes/boxes.css');
```

## Classes

### Base Class
- `.box`: The base class required for all box containers. Provides default padding, radius, and background.

### Variants
- `.box.selected`: Selected state with a primary color border.
- `.box.emphasized`: Emphasized state with a neutral border (useful for active states).
- `.box.shadowed`: Adds a soft shadow (`--Colors-Shadow-Soft`).
- `.box.card`: Adds a card-style shadow (`--Colors-Shadow-Card`).
- `.box.input-group`: Input group variant with reduced padding and gap spacing, designed for grouping input elements together.

### States
The component supports standard pseudo-classes (`:hover`, `:focus`, `:active`) and utility classes for manual state application:
- `.hover`
- `.focus`
- `.selected` (acts as active/checked state)

## Examples

```html
<!-- Default Box -->
<div class="box">
  Content
</div>

<!-- Selected Box -->
<div class="box selected">
  Selected Content
</div>

<!-- Card Style Box -->
<div class="box card">
  Card Content
</div>

<!-- Input Group Box -->
<div class="box input-group">
  <input type="text" class="input" placeholder="Input 1">
  <input type="text" class="input" placeholder="Input 2">
</div>
```

## Dependencies

This component relies on variables from:
- `design-system/colors/colors.css`
- `design-system/spacing/spacing.css`
