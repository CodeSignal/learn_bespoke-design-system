# Modal Component

A customizable modal component matching the CodeSignal Design System. Supports declarative content insertion and flexible configuration.

## Usage

### 1. Import Assets

Include the CSS and JS files:

```html
<link rel="stylesheet" href="/design-system/components/modal/modal.css">
<script type="module">
  import Modal from '/design-system/components/modal/modal.js';
  // ... initialization code
</script>
```

### 2. Initialize Component

```javascript
import Modal from './modal.js';

const modal = new Modal({
  size: 'medium',
  title: 'Modal Title',
  content: '<p>Modal content goes here</p>',
  footerButtons: [
    { label: 'Cancel', type: 'secondary' },
    { label: 'Save', type: 'primary', onClick: () => console.log('Saved!') }
  ]
});

// Open the modal
modal.open();
```

## Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `size` | String | `'medium'` | Modal size: `'small'` (400px), `'medium'` (600px), `'large'` (900px), `'xlarge'` (1200px). |
| `title` | String | `null` | Modal title text. If `null`, header is hidden. |
| `content` | String/Element | `null` | Modal content. Can be HTML string, DOM element, or CSS selector. |
| `showCloseButton` | Boolean | `true` | If `true`, displays close button (X) in header. |
| `footerButtons` | Array | `null` | Array of button configs `[{label, type, onClick}]`. If `null`, footer is hidden. |
| `closeOnOverlayClick` | Boolean | `true` | If `true`, clicking overlay closes modal. |
| `closeOnEscape` | Boolean | `true` | If `true`, pressing Escape closes modal. |
| `onOpen` | Function | `null` | Callback triggered when modal opens. Receives `(modal)` instance. |
| `onClose` | Function | `null` | Callback triggered when modal closes. Receives `(modal)` instance. |

## Declarative Content

The modal supports multiple ways to set content declaratively:

### HTML String

```javascript
const modal = new Modal({
  title: 'Simple Modal',
  content: '<p class="body-medium">This is simple HTML content.</p>'
});
modal.open();
```

### DOM Element

```javascript
const contentDiv = document.createElement('div');
contentDiv.innerHTML = '<p class="body-medium">Content from DOM element</p>';

const modal = new Modal({
  title: 'DOM Element Modal',
  content: contentDiv
});
modal.open();
```

### CSS Selector

```javascript
// Use existing element in the page (cloned)
const modal = new Modal({
  title: 'Selector Modal',
  content: '#my-content-element' // or '.my-content-class'
});
modal.open();
```

### Template Element

```html
<!-- In your HTML -->
<template id="modal-template">
  <div>
    <h3 class="heading-small">Template Content</h3>
    <p class="body-medium">This content comes from a template.</p>
  </div>
</template>

<script type="module">
  import Modal from './modal.js';
  
  const template = document.querySelector('#modal-template');
  const modal = new Modal({
    title: 'Template Modal',
    content: template.content.cloneNode(true)
  });
  modal.open();
</script>
```

## API Methods

### `open()`

Opens the modal and locks body scroll.

```javascript
modal.open();
```

### `close()`

Closes the modal and restores body scroll.

```javascript
modal.close();
```

### `updateContent(content)`

Updates the modal content dynamically. Accepts same content types as constructor.

```javascript
modal.updateContent('<p>New content</p>');
modal.updateContent(document.querySelector('#new-content'));
```

### `updateTitle(title)`

Updates the modal title. Creates title element if it doesn't exist.

```javascript
modal.updateTitle('New Title');
```

### `destroy()`

Removes the modal from DOM and cleans up event listeners.

```javascript
modal.destroy();
```

## Examples

### Basic Modal

```javascript
const modal = new Modal({
  title: 'Basic Modal',
  content: '<p class="body-medium">This is a basic modal with just content.</p>'
});
modal.open();
```

### Modal with Footer Buttons

```javascript
const modal = new Modal({
  size: 'large',
  title: 'Confirm Action',
  content: '<p class="body-medium">Are you sure you want to proceed?</p>',
  footerButtons: [
    {
      label: 'Cancel',
      type: 'secondary',
      onClick: () => {
        console.log('Cancelled');
        modal.close();
      }
    },
    {
      label: 'Confirm',
      type: 'primary',
      onClick: () => {
        console.log('Confirmed');
        modal.close();
      }
    }
  ]
});
modal.open();
```

### Modal with Form Content

```javascript
const formHTML = `
  <form>
    <div style="margin-bottom: 16px;">
      <label class="body-small" style="display: block; margin-bottom: 8px;">Name</label>
      <input type="text" class="input" placeholder="Enter name">
    </div>
    <div style="margin-bottom: 16px;">
      <label class="body-small" style="display: block; margin-bottom: 8px;">Email</label>
      <input type="email" class="input" placeholder="Enter email">
    </div>
  </form>
`;

const modal = new Modal({
  title: 'User Information',
  content: formHTML,
  footerButtons: [
    { label: 'Cancel', type: 'secondary' },
    { label: 'Save', type: 'primary' }
  ]
});
modal.open();
```

### Modal Without Footer

```javascript
const modal = new Modal({
  title: 'Information',
  content: '<p class="body-medium">This modal has no footer buttons.</p>',
  footerButtons: null
});
modal.open();
```

### Modal Without Title

```javascript
const modal = new Modal({
  title: null,
  content: '<p class="body-medium">This modal has no title.</p>',
  footerButtons: [
    { label: 'Close', type: 'primary' }
  ]
});
modal.open();
```

### Dynamic Content Update

```javascript
const modal = new Modal({
  title: 'Dynamic Content',
  content: '<p class="body-medium">Initial content</p>'
});
modal.open();

// Update content after 2 seconds
setTimeout(() => {
  modal.updateContent('<p class="body-medium">Updated content!</p>');
}, 2000);
```

## Button Types

Footer buttons support the following types:

- `'primary'`: Primary button (default)
- `'secondary'`: Secondary/outlined button
- `'tertiary'`: Tertiary/ghost button

## Accessibility

The modal component includes:

- **ARIA Attributes**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- **Focus Management**: Automatically focuses close button or title when opened
- **Keyboard Navigation**: Escape key closes modal
- **Focus Trap**: Focus is managed within the modal
- **Body Scroll Lock**: Prevents background scrolling when modal is open

## Dependencies

This component relies on variables from:
- `design-system/colors/colors.css`
- `design-system/spacing/spacing.css`
- `design-system/typography/typography.css`
- `design-system/components/button/button.css` (for footer buttons)

