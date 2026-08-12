# Dropdown Component

A customizable, accessible dropdown component matching the CodeSignal Design System.

## Usage

### 1. Import Assets

Include the CSS and JS files:

```html
<link rel="stylesheet" href="/design-system/components/dropdown/dropdown.css">
<script type="module">
  import Dropdown from '/design-system/components/dropdown/dropdown.js';
  // ... initialization code
</script>
```

### 2. Create Container

Add a container element to your HTML where the dropdown will be rendered:

```html
<div id="my-dropdown"></div>
```

### 3. Initialize Component

```javascript
const dropdown = new Dropdown('#my-dropdown', {
  placeholder: 'Select an option',
  items: [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' }
  ],
  onSelect: (value, item) => {
    console.log('Selected:', value);
  }
});
```

## Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `items` | Array | `[]` | Array of objects with `value` and `label` properties. |
| `placeholder` | String | `'Select option'` | Text displayed when no item is selected. |
| `selectedValue` | String | `null` | Initial selected value. |
| `width` | String/Number | `'auto'` | Fixed width of the dropdown (e.g., `200`, `'100%'`). Ignored if `growToFit` is true. |
| `growToFit` | Boolean | `false` | If `true`, the dropdown automatically resizes to fit the selected content. |
| `onSelect` | Function | `null` | Callback function triggered when an item is selected. Receives `(value, item)`. |

## Keyboard

- **Enter / Space** on the toggle opens or closes the menu. On open, focus moves to the selected option (or the first option).
- **ArrowDown / ArrowUp / Home / End** on the toggle open the menu and move focus into the list.
- **ArrowDown / ArrowUp / Home / End** in the menu move among options.
- **Enter / Space** on an option selects it and returns focus to the toggle.
- **Escape** closes the menu and returns focus to the toggle (does not dismiss an enclosing modal).

## API Methods

- **`getValue()`**: Returns the current selected value.
- **`setValue(value)`**: Programmatically sets the selected value.
- **`open()`**: Opens the dropdown menu.
- **`close()`**: Closes the dropdown menu.
- **`toggleOpen()`**: Toggles the open state.
- **`destroy()`**: Removes event listeners and clears the container.

## Dependencies

This component relies on variables from:
- `design-system/colors/colors.css`
- `design-system/spacing/spacing.css`
- `design-system/typography/typography.css`

