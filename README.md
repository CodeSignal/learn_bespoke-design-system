# CodeSignal Design System

This directory contains the core design tokens and reusable components for the application.

## Demo

The demo of the design system can be found here: [Demo Site](https://codesignal.github.io/learn_bespoke-design-system/test.html)

## Structure

The design system is organized into **Foundations** and **Components**.

### Foundations

Base definitions that drive the visual style.

- **[Colors](colors/README.md)**: Base scales and semantic color tokens.
- **[Typography](typography/README.md)**: Font families, sizes, and utility classes.
- **[Spacing](spacing/README.md)**: Spacing, sizing, and radius tokens.

### Components

Reusable UI elements built using the foundations.

- **[Button](components/button/README.md)** ([CSS](components/button/button.css)): Primary, secondary, and utility buttons.
- **[Boxes](components/boxes/README.md)** ([CSS](components/boxes/boxes.css)): Container components.
- **[Dropdown](components/dropdown/README.md)** ([CSS](components/dropdown/dropdown.css), [JS](components/dropdown/dropdown.js)): Customizable dropdown menus.
- **[Icons](components/icons/README.md)** ([CSS](components/icons/icons.css)): Scalable SVG icons with size and color variants.
- **[Input](components/input/README.md)** ([CSS](components/input/input.css)): Text and number input fields with various states.
- **[Numeric Slider](components/numeric-slider/README.md)** ([CSS](components/numeric-slider/numeric-slider.css), [JS](components/numeric-slider/numeric-slider.js)): Single value and range sliders with optional input fields.
- **[Tags](components/tags/README.md)** ([CSS](components/tags/tags.css)): Label and status indicator tags.

## Usage

### Styles
Include the relevant CSS files in your HTML. For a full integration, you typically include:

```html
<!-- Fonts (Work Sans) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Design System Foundations -->
<link rel="stylesheet" href="/design-system/colors/colors.css">
<link rel="stylesheet" href="/design-system/spacing/spacing.css">
<link rel="stylesheet" href="/design-system/typography/typography.css">

<!-- Design System Components -->
<link rel="stylesheet" href="/design-system/components/button/button.css">
<link rel="stylesheet" href="/design-system/components/boxes/boxes.css">
<link rel="stylesheet" href="/design-system/components/dropdown/dropdown.css">
<link rel="stylesheet" href="/design-system/components/icons/icons.css">
<link rel="stylesheet" href="/design-system/components/input/input.css">
<link rel="stylesheet" href="/design-system/components/numeric-slider/numeric-slider.css">
<link rel="stylesheet" href="/design-system/components/tags/tags.css">
```

**Note on Fonts:**
- **Work Sans**: Must be imported via Google Fonts (as shown above).
- **Founders Grotesk**: Included via `@font-face` in `typography.css`.
- **JetBrains Mono**: Included via `@font-face` in `typography.css`.

### Components
Components have their own CSS and JS files located within their respective directories. See individual component READMEs for implementation details.

## Test Bed

You can view and test the design system elements by opening the test harness:

`http://[your-server]/design-system/test.html`

This provides a sidebar navigation to explore colors, typography, and interactive component demos.

