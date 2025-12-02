# Icons Component

Scalable SVG icons using standard CodeSignal Design System tokens. Icons are embedded as CSS content using SVG data URIs.

## Usage

Import the CSS file:

```html
<link rel="stylesheet" href="/design-system/components/icons/icons.css">
```

or

```css
@import url('/design-system/components/icons/icons.css');
```

## Classes

### Base Class
- `.icon`: Required base class. Sets display, size, and positioning properties.

### Icon Names
Use the specific icon class to set the SVG image. Icon names are derived from SVG filenames (e.g., `Icon=Academy.svg` becomes `.icon-academy`):

- `.icon-academy`
- `.icon-assessment`
- `.icon-ellipse`
- `.icon-interview`
- `.icon-jobs`
- `.icon-course`
- ... (see `icons.css` for full list of 80+ icons)

### Sizes
- `.icon-small` or `.icon.icon-small`: 16px
- `.icon-medium` or `.icon.icon-medium`: 24px (default)
- `.icon-large` or `.icon.icon-large`: 32px
- `.icon-xlarge` or `.icon.icon-xlarge`: 48px

### Colors
Icons use `currentColor` by default, meaning they will take the text color of their parent or their own `color` property. Color utility classes are also available:

- `.icon-primary` or `.icon.icon-primary`: Primary brand color
- `.icon-secondary` or `.icon.icon-secondary`: Secondary neutral color
- `.icon-success` or `.icon.icon-success`: Success green color
- `.icon-danger` or `.icon.icon-danger`: Danger red color
- `.icon-warning` or `.icon.icon-warning`: Warning yellow color

## HTML Example

```html
<!-- Default Icon (24px, inherited color) -->
<span class="icon icon-jobs"></span>

<!-- Large Primary Icon -->
<span class="icon icon-jobs icon-large icon-primary"></span>

<!-- Small Success Icon -->
<span class="icon icon-assessment icon-small icon-success"></span>

<!-- Medium Icon with custom color -->
<span class="icon icon-interview icon-medium" style="color: var(--Colors-Base-Primary-500)"></span>
```

## Dependencies

This component relies on variables from:
- `design-system/colors/colors.css`
- `design-system/spacing/spacing.css`
- `design-system/typography/typography.css`

