# Numeric Slider Component

A customizable numeric slider component matching the CodeSignal Design System. Supports both single value and range (dual-handle) modes, with optional input fields for direct value entry.

## Usage

### 1. Import Assets

Include the CSS and JS files:

```html
<link rel="stylesheet" href="/design-system/components/input/input.css">
<link rel="stylesheet" href="/design-system/components/numeric-slider/numeric-slider.css">
<script type="module">
  import NumericSlider from '/design-system/components/numeric-slider/numeric-slider.js';
  // ... initialization code
</script>
```

### 2. Create Container

Add a container element to your HTML where the slider will be rendered:

```html
<div id="my-slider"></div>
```

### 3. Initialize Component

#### Single Value Slider

```javascript
const slider = new NumericSlider('#my-slider', {
  type: 'single',
  min: 0,
  max: 100,
  value: 50,
  showInputs: false,
  onChange: (value) => {
    console.log('Value changed:', value);
  }
});
```

#### Range Slider

```javascript
const rangeSlider = new NumericSlider('#my-range-slider', {
  type: 'range',
  min: 0,
  max: 100,
  value: [20, 60],
  showInputs: true,
  onChange: (values) => {
    console.log('Range changed:', values[0], 'to', values[1]);
  }
});
```

## Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | String | `'single'` | Slider type: `'single'` for one handle, `'range'` for two handles. |
| `min` | Number | `0` | Minimum value of the slider. Must be less than `max`. |
| `max` | Number | `100` | Maximum value of the slider. Must be greater than `min`. |
| `step` | Number | `1` | Step increment for value changes. Values are automatically snapped to the nearest step. |
| `value` | Number/Array | `null` | Initial value. For single: number (defaults to `min` if not provided). For range: `[minValue, maxValue]` array (defaults to `[min, max]` if not provided). Values are automatically clamped to `min`/`max` bounds. |
| `showInputs` | Boolean | `false` | If `true`, displays input fields for direct value entry. For range sliders, inputs appear on either side of the slider. |
| `theme` | String | `'default'` | Visual theme preset: `'default'` (neutral track, primary filled track, primary handles) or `'primary'` (primary track, primary filled track, primary handles). Ignored if individual theme overrides are provided. |
| `trackTheme` | String | `null` | Override track color: `'neutral'` or `'primary'`. If provided, overrides the `theme` preset for the track. |
| `filledTheme` | String | `null` | Override filled track color: `'neutral'` or `'primary'`. If provided, overrides the `theme` preset for the filled track. |
| `handleTheme` | String | `null` | Override handle color: `'neutral'` or `'primary'`. If provided, overrides the `theme` preset for the handles. Note: Single value sliders use marker-style handles which are always primary colored. |
| `continuousUpdates` | Boolean | `false` | If `true`, fires `onChange` continuously during dragging (throttled by `throttleMs`). If `false` (default), `onChange` only fires on drag end, track click, and keyboard interaction. Final value is always sent on drag end regardless of this setting. |
| `throttleMs` | Number | `16` | Throttle interval in milliseconds for continuous updates during drag (~60fps at 16ms). Only applies when `continuousUpdates` is `true`. Lower values = more frequent updates but potentially lower performance. |
| `disabled` | Boolean | `false` | If `true`, disables the slider and all input fields. |
| `onChange` | Function | `null` | Callback triggered when value changes. Receives `(value, source)` where `value` is the new value(s) and `source` indicates the source of change (`'min'`, `'max'`, `'single'`, or `null`). By default, fires on drag end, track click, and keyboard interaction. If `continuousUpdates` is `true`, also fires during drag (throttled). |
| `onInputChange` | Function | `null` | Callback triggered when value changes via input field. Receives `(value, source)` where `value` is the new value(s) and `source` indicates which input changed (`'min'`, `'max'`, or `'single'`). |

## API Methods

### `getValue()`

Returns the current value(s) of the slider.

**Returns:**
- For single value sliders: `Number` - the current value
- For range sliders: `Array<Number>` - `[minValue, maxValue]` array

**Example:**
```javascript
const slider = new NumericSlider('#slider', { type: 'single', value: 50 });
console.log(slider.getValue()); // 50

const rangeSlider = new NumericSlider('#range', { type: 'range', value: [20, 60] });
console.log(rangeSlider.getValue()); // [20, 60]
```

### `setValue(value, source, triggerCallback)`

Programmatically sets the slider value(s). Values are automatically clamped to `min`/`max` bounds and snapped to the nearest `step`.

**Parameters:**
- `value` (Number|Array): For single value sliders, a number. For range sliders, an array `[minValue, maxValue]`. Values are automatically clamped and validated.
- `source` (String, optional): Source identifier for the change (`'min'`, `'max'`, `'single'`, or `null`). Defaults to `null`.
- `triggerCallback` (Boolean, optional): Whether to trigger the `onChange` callback. Defaults to `true`.

**Throws:**
- `Error`: If called on a range slider without providing an array of two values.

**Example:**
```javascript
const slider = new NumericSlider('#slider', { type: 'single', min: 0, max: 100 });
slider.setValue(75); // Sets value to 75

const rangeSlider = new NumericSlider('#range', { type: 'range', min: 0, max: 100 });
rangeSlider.setValue([25, 75]); // Sets range to 25-75
rangeSlider.setValue([100, 0]); // Automatically corrects to [0, 100]
```

### `setDisabled(disabled)`

Enables or disables the slider. When disabled, the slider and all input fields become non-interactive.

**Parameters:**
- `disabled` (Boolean): `true` to disable, `false` to enable.

**Example:**
```javascript
const slider = new NumericSlider('#slider', { value: 50 });
slider.setDisabled(true); // Disables the slider
slider.setDisabled(false); // Re-enables the slider
```

### `destroy()`

Removes the slider component from the DOM and cleans up event listeners. Use this when removing the slider from the page.

**Example:**
```javascript
const slider = new NumericSlider('#slider', { value: 50 });
// ... use slider ...
slider.destroy(); // Clean up when done
```

## Examples

### Basic Single Value Slider

```javascript
const slider = new NumericSlider('#slider', {
  type: 'single',
  value: 50
});
```

### Range Slider with Inputs

```javascript
const rangeSlider = new NumericSlider('#range-slider', {
  type: 'range',
  min: 0,
  max: 100,
  value: [20, 60],
  showInputs: true,
  onChange: (values) => {
    console.log(`Range: ${values[0]} - ${values[1]}`);
  }
});
```

### Custom Range with Step

```javascript
const customSlider = new NumericSlider('#custom-slider', {
  type: 'range',
  min: 0,
  max: 1000,
  step: 10,
  value: [200, 800],
  showInputs: true
});
```

### Primary Theme

```javascript
const primarySlider = new NumericSlider('#primary-slider', {
  type: 'single',
  theme: 'primary',
  value: 75
});
```

### Custom Theme Overrides

Control track, filled track, and handles separately:

```javascript
// Custom: neutral track, primary filled, neutral handles
const customSlider = new NumericSlider('#custom-slider', {
  type: 'range',
  trackTheme: 'neutral',
  filledTheme: 'primary',
  handleTheme: 'neutral',
  value: [20, 60]
});

// All primary
const allPrimarySlider = new NumericSlider('#all-primary-slider', {
  type: 'single',
  theme: 'primary' // or use: trackTheme: 'primary', filledTheme: 'primary', handleTheme: 'primary'
});
```

### Continuous Updates During Drag

Enable continuous `onChange` callbacks while dragging (useful for live previews):

```javascript
const liveSlider = new NumericSlider('#live-slider', {
  type: 'single',
  value: 50,
  continuousUpdates: true, // Fire onChange during drag
  throttleMs: 16, // ~60fps (default)
  onChange: (value) => {
    // This fires continuously while dragging (throttled)
    // AND on drag end (always)
    document.querySelector('#preview').textContent = value;
  }
});

// Heavier updates? Increase throttle interval
const heavySlider = new NumericSlider('#heavy-slider', {
  type: 'range',
  value: [20, 80],
  continuousUpdates: true,
  throttleMs: 100, // 10 updates per second
  onChange: (values) => {
    // Expensive operation (e.g., chart re-render)
    updateComplexVisualization(values);
  }
});
```

## Interaction

### Mouse/Touch
- Click and drag handles to adjust values
- Click on the track to move the nearest handle to that position
- For range sliders, handles cannot cross each other

### Keyboard
- **Arrow Left/Down**: Decrease value by step
- **Arrow Right/Up**: Increase value by step
- **Shift + Arrow**: Change value by 10x step
- **Home**: Set to minimum value
- **End**: Set to maximum value

### Input Fields
- When `showInputs` is `true`, input fields allow direct value entry
- For single value sliders: one input field appears on the left side of the slider
- For range sliders: two input fields appear on either side of the slider (min on left, max on right)
- Input fields have `id` and `name` attributes generated from the container element's ID (format: `{containerId}-min`, `{containerId}-max`, or `{containerId}-value`)
- Values are automatically clamped to min/max bounds
- For range sliders, min input cannot exceed max value and vice versa
- Invalid input (non-numeric) is reset to the current value on blur
- Input fields use the same styling as the input component

## Dependencies

This component relies on variables from:
- `design-system/colors/colors.css`
- `design-system/spacing/spacing.css`
- `design-system/typography/typography.css`
- `design-system/components/input/input.css` (for input field styling)

## Value Validation

The slider automatically validates and corrects values:

- **Clamping**: Values are automatically clamped to the `min` and `max` bounds
- **Step Snapping**: Values are snapped to the nearest `step` increment
- **Range Validation**: For range sliders, if min > max, values are automatically swapped
- **Input Validation**: Invalid input field values are reset to the current slider value on blur

## Accessibility

The slider component includes comprehensive accessibility features:

- **ARIA Attributes**:
  - `role="slider"` on the slider wrapper
  - `aria-valuemin`, `aria-valuemax`, `aria-valuenow` attributes
  - `aria-label` attributes on handles and wrapper for screen readers
- **Keyboard Navigation**: Full keyboard support with arrow keys, Home, End, and Shift modifiers
- **Focus Indicators**: Visible focus outlines for keyboard navigation
- **Input Fields**: Proper `id` and `name` attributes for form integration and screen readers
- **Disabled State**: Properly communicates disabled state to assistive technologies

## Error Handling

- **Invalid Container**: Throws `Error` if container element is not found
- **Invalid Range Value**: `setValue()` throws `Error` if called on a range slider without an array of two values
- **Invalid Input**: Input fields reset to current value if invalid input is entered

## Browser Support

The component supports all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- Single value sliders use marker-style handles which are always primary colored, regardless of `handleTheme` setting
- In dark mode, both neutral and primary tracks use the same color (`#060C1C` at 50% opacity)
- Input fields are automatically sized and styled to match the design system
- The component uses CSS custom properties for theming, supporting both light and dark modes automatically

