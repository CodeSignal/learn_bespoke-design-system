# Typography Design System

This directory contains the typography system definitions for the application.

## Usage

Import the CSS file in your HTML or CSS:

```html
<link rel="stylesheet" href="/design-system/typography/typography.css">
```

or

```css
@import url('/design-system/typography/typography.css');
```

## Font Families

The system uses two main font families:

- **Body & Labels**: `Work Sans` (Variable, sans-serif)
- **Headings & Elegant**: `Founders Grotesk` (sans-serif)
- **Code**: `JetBrains Mono` (monospace)

## CSS Classes

Use these utility classes to apply typography styles to your elements.

### Body Text
Standard body text styles using `Work Sans`.

- `.body-xxsmall` (13px)
- `.body-xsmall` (14px)
- `.body-small` (15px)
- `.body-medium` (16px)
- `.body-large` (17px)
- `.body-xlarge` (19px)
- `.body-xxlarge` (21px)
- `.body-xxxlarge` (24px)

### Body Elegant
Elegant body styles using `Founders Grotesk`.

- `.body-elegant-xxsmall` (22px)
- `.body-elegant-xsmall` (26px)
- `.body-elegant-small` (32px)
- `.body-elegant-medium` (38px)

### Headings
Heading styles using `Founders Grotesk` with medium weight (500).

- `.heading-xxxsmall` (16px)
- `.heading-xxsmall` (22px)
- `.heading-xsmall` (22px)
- `.heading-small` (24px)
- `.heading-medium` (32px)
- `.heading-large` (38px)
- `.heading-xlarge` (48px)
- `.heading-xxlarge` (64px)

### Labels
Uppercase labels using `Work Sans` with semi-bold weight (600).

- `.label-small` (10px)
- `.label-medium` (11px)
- `.label-large` (14px)

### Label Numbers
Numeric labels using `Work Sans` with medium weight (500).

- `.label-number-xsmall` (11px)
- `.label-number-small` (12px)
- `.label-number-medium` (14px)
- `.label-number-large` (15px)

### Code
Code/monospace text styles using `JetBrains Mono` with semi-bold weight (600).

- `.code-small` (11px)
- `.code-medium` (16px)
- `.code-large` (17px)
- `.code` (19px)

### Blockquote
Blockquote styles for quoted text. All `<blockquote>` elements automatically receive styling.

- `blockquote` or `.blockquote` - Base blockquote style with left border
- `blockquote.quote` or `.blockquote.quote` - Italicized style for blockquotes starting with quote characters

**Note**: Blockquotes that start with quote characters (", ', «, », etc.) can be automatically detected and italicized using the JavaScript helper (see JavaScript Helpers section below).

## CSS Variables

While classes are preferred for consistency, you can access the raw values via CSS variables if needed for custom components.

Pattern: `--Fonts-[Category]-[Size]`

Examples:
- `--Fonts-Body-Default-md`
- `--Fonts-Headlines-xl`
- `--Fonts-Special-sm`

## JavaScript Helpers

The typography system includes a JavaScript helper for enhanced functionality.

### Quote Detection

The `typography.js` helper automatically detects blockquotes that start with quote characters and applies italic styling.

**Usage as Script Tag:**

```html
<script src="/design-system/typography/typography.js"></script>
```

The helper auto-initializes on page load. You can also call it manually:

```javascript
// Detect quotes in all blockquotes
detectQuoteBlockquotes();

// Detect quotes within a specific container
const container = document.querySelector('.my-container');
detectQuoteBlockquotes(container);
```

**Usage as ES Module:**

```javascript
import { detectQuoteBlockquotes, initTypography } from '/design-system/typography/typography.js';

// Auto-detect quotes (auto-runs on import)
initTypography();

// Or manually detect quotes
detectQuoteBlockquotes();
```

**Supported Quote Characters:**
- Straight quotes: `"` `'`
- Curly quotes: `"` `"` `'` `'`
- Guillemets: `«` `»`
- Other: `„` `‚`

When a blockquote starts with any of these characters, it automatically receives the `.quote` class and `data-starts-with-quote="true"` attribute, which applies italic styling.