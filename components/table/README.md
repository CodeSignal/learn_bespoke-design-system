# Table Component

A reusable table presentation layer matching the CodeSignal Design System.

## Usage

Import the CSS file in your HTML or CSS:

```html
<link rel="stylesheet" href="/design-system/components/table/table.css">
```

or

```css
@import url('/design-system/components/table/table.css');
```

## Structure

Tables use a scroll wrapper so wide content can overflow horizontally on small screens:

```html
<div class="table-scroll">
  <table class="table">
    <thead>
      <tr>
        <th>Country</th>
        <th>Capital</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>France</td>
        <td>Paris</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Classes

- `.table-scroll`: Overflow wrapper with border, radius, and horizontal scrolling.
- `.table`: Base table styling for editorial and read-only tables.

## Dependencies

This component relies on variables from:
- `design-system/colors/colors.css`
- `design-system/spacing/spacing.css`
- `design-system/typography/typography.css`
