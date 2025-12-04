# Horizontal Cards Component

A horizontal scrolling card carousel component matching the CodeSignal Design System. Displays cards in a horizontal scrollable container with optional navigation buttons and visual indicators for scrollable content.

## Usage

### 1. Import Assets

Include the CSS and JS files:

```html
<link rel="stylesheet" href="/design-system/components/horizontal-cards/horizontal-cards.css">
<script type="module">
  import HorizontalCards from '/design-system/components/horizontal-cards/horizontal-cards.js';
  // ... initialization code
</script>
```

### 2. Create Container

Add a container element to your HTML where the horizontal cards will be rendered:

```html
<div id="my-horizontal-cards"></div>
```

### 3. Initialize Component

```javascript
const horizontalCards = new HorizontalCards('#my-horizontal-cards', {
  cards: [
    {
      title: 'Card Title',
      description: 'Card description text',
      actionPlaceholder: 'Add label'
    },
    {
      title: 'Another Card',
      description: 'More description text',
      actionHtml: '<button class="button button-primary">Action</button>'
    }
  ],
  onCardChange: (index, card) => {
    console.log('Current card:', index, card);
  }
});
```

## Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `cards` | Array | `[]` | Array of card objects. Each card can have `title`, `description`, `actionPlaceholder`, or `actionHtml`. |
| `cardWidth` | Number | `480` | Width of each card in pixels. |
| `cardGap` | Number | `24` | Gap between cards in pixels (matches `--UI-Spacing-spacing-mxl`). |
| `scrollOffset` | Number | `520` | Number of pixels to scroll per navigation action (typically `cardWidth + cardGap`). |
| `showNavigation` | Boolean | `true` | If `true`, displays previous/next navigation buttons. |
| `onCardChange` | Function | `null` | Callback function triggered when the visible card changes. Receives `(index, card)`. |

## Card Object Structure

Each card in the `cards` array can have the following properties:

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | No | Card title displayed as a heading. Supports HTML content (e.g., `<strong>`, `<em>`, `<code>`, links, etc.). |
| `description` | String | No | Card description text. Supports HTML content (e.g., `<strong>`, `<em>`, `<code>`, links, spans with styling, etc.). |
| `actionPlaceholder` | String | No | Placeholder text for the action area (displays in a dashed border box). |
| `actionHtml` | String | No | Custom HTML content for the action area. If provided, `actionPlaceholder` is ignored. |

## API Methods

- **`getCurrentIndex()`**: Returns the current visible card index (0-based).
- **`getCurrentCard()`**: Returns the current visible card object.
- **`scrollToNext()`**: Scrolls to the next card.
- **`scrollToPrevious()`**: Scrolls to the previous card.
- **`scrollToIndex(index)`**: Scrolls to a specific card by index.
- **`destroy()`**: Removes event listeners and clears the container.

## Features

- **Smooth Scrolling**: Cards scroll smoothly when navigating.
- **Visual Indicators**: Fade gradients appear on the left/right edges when content is scrollable.
- **Keyboard Navigation**: Arrow keys (Left/Right) navigate between cards.
- **Touch/Swipe Support**: Swipe gestures on touch devices.
- **Responsive**: Adapts to different screen sizes.
- **Accessibility**: Proper ARIA attributes and keyboard support.
- **Dark Mode**: Automatically adapts to dark mode preferences.

## Examples

### Basic Usage

```javascript
const cards = new HorizontalCards('#my-cards', {
  cards: [
    {
      title: 'Boss 1',
      description: 'Description text here',
      actionPlaceholder: 'Add label'
    },
    {
      title: 'Boss 2',
      description: 'More description text',
      actionPlaceholder: 'Add label'
    }
  ]
});
```

### Without Navigation Buttons

```javascript
const cards = new HorizontalCards('#my-cards', {
  cards: sampleCards,
  showNavigation: false
});
```

### Custom Action Area

```javascript
const cards = new HorizontalCards('#my-cards', {
  cards: [
    {
      title: 'Custom Card',
      description: 'Card with custom action',
      actionHtml: '<button class="button button-primary">Click Me</button>'
    }
  ]
});
```

### HTML Content in Title and Description

```javascript
const cards = new HorizontalCards('#my-cards', {
  cards: [
    {
      title: 'Card with <strong>Bold Title</strong>',
      description: 'This description has <strong>bold text</strong>, <em>italic text</em>, and a <a href="#">link</a>.',
      actionPlaceholder: 'Add label'
    },
    {
      title: 'Card with <em>Italic</em> and <code>Code</code>',
      description: 'You can use <span style="color: red;">colored spans</span> and other HTML elements.',
      actionPlaceholder: 'Add label'
    }
  ]
});
```

### Programmatic Navigation

```javascript
const cards = new HorizontalCards('#my-cards', {
  cards: sampleCards
});

// Scroll to specific card
cards.scrollToIndex(2);

// Get current card
const currentCard = cards.getCurrentCard();
console.log('Current card:', currentCard);
```

## Dependencies

This component relies on variables from:
- `design-system/colors/colors.css`
- `design-system/spacing/spacing.css`
- `design-system/typography/typography.css`

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Supports touch devices with swipe gestures
- Keyboard navigation support

