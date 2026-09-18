/**
 * WCAG contrast math, shared by the specs that measure color.
 *
 * Colors arrive in two shapes depending on where they were read: `getComputedStyle`
 * yields `rgb()` / `rgba()` strings, while hand-written expectations are hex. Every
 * function here takes either.
 */

/** `#rrggbb`, `rgb()` or `rgba()` to `[r, g, b]` with an `alpha` property. */
export function parseColor(color) {
  if (Array.isArray(color)) return color;

  const hex = String(color).trim().match(/^#?([0-9a-f]{6})$/i);
  if (hex) {
    const rgb = [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16));
    rgb.alpha = 1;
    return rgb;
  }

  const m = String(color).match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/i,
  );
  if (!m) return null;
  const rgb = [Number(m[1]), Number(m[2]), Number(m[3])];
  rgb.alpha = m[4] === undefined ? 1 : Number(m[4]);
  return rgb;
}

/** Relative luminance, 0–1. */
export function relativeLuminance(color) {
  const rgb = parseColor(color);
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
}

export function contrastRatio(a, b) {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** Flatten a translucent color onto what sits behind it; measuring it raw flatters it. */
export function over(fg, bg) {
  const front = parseColor(fg);
  const back = parseColor(bg);
  const a = front.alpha ?? 1;
  if (a === 1) return front;
  return front.map((c, i) => Math.round(c * a + back[i] * (1 - a)));
}
