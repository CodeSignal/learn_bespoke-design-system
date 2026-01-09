# Split Panel Component

A resizable split panel component matching the CodeSignal Design System. Allows two panels to be split horizontally (or vertically) with a draggable divider between them.

## Usage

Import the CSS and JavaScript files in your HTML:

```html
<link rel="stylesheet" href="/design-system/components/split-panel/split-panel.css">
<script type="module" src="/design-system/components/split-panel/split-panel.js"></script>
```

or

```css
@import url('/design-system/components/split-panel/split-panel.css');
```

```javascript
import SplitPanel from '/design-system/components/split-panel/split-panel.js';
```

## Basic Example

```html
<div id="my-split-panel" style="width: 800px; height: 400px;"></div>

<script type="module">
  import SplitPanel from '/design-system/components/split-panel/split-panel.js';
  
  const splitPanel = new SplitPanel('#my-split-panel', {
    initialSplit: 50, // 50% split
    onChange: (percent) => {
      console.log('Split changed to:', percent + '%');
    }
  });

  // Add content to panels
  splitPanel.getLeftPanel().innerHTML = '<p>Left Panel Content</p>';
  splitPanel.getRightPanel().innerHTML = '<p>Right Panel Content</p>';
</script>
```

## Configuration Options

### `orientation` (string)
- **Default:** `'horizontal'`
- **Options:** `'horizontal'` or `'vertical'`
- **Description:** Sets the orientation of the split panel. Horizontal splits left/right, vertical splits top/bottom.

### `initialSplit` (number)
- **Default:** `50`
- **Range:** `0` to `100`
- **Description:** Initial split percentage for the left (or top) panel.

### `minLeft` (number)
- **Default:** `10`
- **Range:** `0` to `100`
- **Description:** Minimum percentage allowed for the left (or top) panel.

### `minRight` (number)
- **Default:** `10`
- **Range:** `0` to `100`
- **Description:** Minimum percentage allowed for the right (or bottom) panel.

### `disabled` (boolean)
- **Default:** `false`
- **Description:** Disables resizing of the split panel.

### `onChange` (function)
- **Default:** `null`
- **Description:** Callback function called when the split changes. Receives the new split percentage as an argument.

## Methods

### `setSplit(percent, skipCallback)`
Sets the split percentage programmatically.

- **Parameters:**
  - `percent` (number): The split percentage (0-100)
  - `skipCallback` (boolean, optional): If `true`, skips calling the `onChange` callback

### `getSplit()`
Returns the current split percentage.

- **Returns:** `number` - Current split percentage (0-100)

### `getLeftPanel()`
Returns the left (or top) panel element.

- **Returns:** `HTMLElement` - The left/top panel element

### `getRightPanel()`
Returns the right (or bottom) panel element.

- **Returns:** `HTMLElement` - The right/bottom panel element

### `setDisabled(disabled)`
Enables or disables the split panel.

- **Parameters:**
  - `disabled` (boolean): Whether to disable the panel

### `destroy()`
Removes the split panel and cleans up event listeners.

## HTML Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Split Panel Example</title>
  <link rel="stylesheet" href="/design-system/colors/colors.css">
  <link rel="stylesheet" href="/design-system/spacing/spacing.css">
  <link rel="stylesheet" href="/design-system/components/split-panel/split-panel.css">
</head>
<body>
  <div id="split-panel" style="width: 100%; height: 600px;"></div>

  <script type="module">
    import SplitPanel from '/design-system/components/split-panel/split-panel.js';
    
    const panel = new SplitPanel('#split-panel', {
      initialSplit: 40,
      minLeft: 20,
      minRight: 20,
      onChange: (percent) => {
        console.log('Split:', percent + '%');
      }
    });

    // Add content
    panel.getLeftPanel().innerHTML = `
      <div style="padding: 20px;">
        <h2>Left Panel</h2>
        <p>This is the left panel content.</p>
      </div>
    `;

    panel.getRightPanel().innerHTML = `
      <div style="padding: 20px;">
        <h2>Right Panel</h2>
        <p>This is the right panel content.</p>
      </div>
    `;
  </script>
</body>
</html>
```

## Interaction

- **Mouse:** Click and drag the divider to resize panels
- **Touch:** Touch and drag the divider on touch devices
- **Keyboard:** Focus the divider and use arrow keys to adjust:
  - `ArrowLeft` / `ArrowRight` (horizontal): Decrease/Increase left panel size
  - `ArrowUp` / `ArrowDown` (vertical): Decrease/Increase top panel size
  - `Shift + Arrow`: Adjust by 10% increments
  - `Home`: Set to minimum left/top size
  - `End`: Set to maximum left/top size

## Dependencies

This component relies on variables from:
- `design-system/colors/colors.css`
- `design-system/spacing/spacing.css`
