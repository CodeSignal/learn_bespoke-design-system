import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from './helpers/a11y.js';

/**
 * D1: inactive Horizontal Cards must not use opacity that drops text
 * below 4.5:1. P6 fades chrome (shadow / border), not type.
 *
 * Contrast composites ancestor opacity the same way the Activities
 * audit sampler does.
 */

function inactiveCardMetrics(page, rootSelector) {
  return page.evaluate((sel) => {
    const parseRgba = (str) => {
      if (!str || str === 'transparent') return [0, 0, 0, 0];
      const m = String(str).match(
        /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i,
      );
      if (!m) return [0, 0, 0, 0];
      return [
        Number(m[1]),
        Number(m[2]),
        Number(m[3]),
        m[4] === undefined ? 1 : Number(m[4]),
      ];
    };
    const composite = (fg, bg) => {
      const a = fg[3];
      if (a >= 1) return [fg[0], fg[1], fg[2], 1];
      return [
        fg[0] * a + bg[0] * (1 - a),
        fg[1] * a + bg[1] * (1 - a),
        fg[2] * a + bg[2] * (1 - a),
        1,
      ];
    };
    const relLum = (rgb) => {
      const f = (c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
    };
    const contrastRatio = (a, b) => {
      const l1 = relLum(a);
      const l2 = relLum(b);
      const hi = Math.max(l1, l2);
      const lo = Math.min(l1, l2);
      return (hi + 0.05) / (lo + 0.05);
    };
    const effectiveOpacity = (el) => {
      let o = 1;
      let n = el;
      while (n && n !== document.documentElement) {
        const op = getComputedStyle(n).opacity;
        o *= op === '' ? 1 : Number(op);
        n = n.parentElement;
      }
      return o;
    };
    const effectiveBackground = (el) => {
      let bg = [255, 255, 255, 1];
      const stack = [];
      let n = el;
      while (n && n !== document.documentElement) {
        stack.push(n);
        n = n.parentElement;
      }
      stack.push(document.documentElement);
      stack.reverse();
      for (const node of stack) {
        const style = getComputedStyle(node);
        const parsed = parseRgba(style.backgroundColor);
        const op = style.opacity === '' ? 1 : Number(style.opacity);
        const withOp = [parsed[0], parsed[1], parsed[2], parsed[3] * op];
        if (withOp[3] > 0) bg = composite(withOp, bg);
      }
      return bg;
    };
    const textContrast = (el) => {
      const style = getComputedStyle(el);
      const fg = parseRgba(style.color);
      const op = effectiveOpacity(el);
      const painted = [fg[0], fg[1], fg[2], fg[3] * op];
      const bg = effectiveBackground(el);
      return contrastRatio(composite(painted, bg), bg);
    };

    const card = document.querySelector(
      `${sel} .horizontal-cards-card:not(.horizontal-cards-card-active)`,
    );
    const title = card?.querySelector('.horizontal-cards-card-title');
    const description = card?.querySelector('.horizontal-cards-card-description');
    const placeholder = card?.querySelector(
      '.horizontal-cards-card-action-placeholder',
    );
    return {
      found: !!card,
      opacity: card ? effectiveOpacity(card) : null,
      ariaHidden: card?.getAttribute('aria-hidden'),
      titleRatio: title ? textContrast(title) : null,
      descriptionRatio: description ? textContrast(description) : null,
      placeholderRatio: placeholder ? textContrast(placeholder) : null,
    };
  }, rootSelector);
}

for (const colorScheme of ['light', 'dark']) {
  test.describe(`horizontal cards inactive contrast (${colorScheme})`, () => {
    test.use({ colorScheme });

    test.beforeEach(async ({ page }) => {
      await page.goto('/components/horizontal-cards/test.html');
      await page.waitForFunction(() => window.testHorizontalCards?.basic);
    });

    test('inactive card text stays ≥4.5:1 without dimming the card', async ({
      page,
    }) => {
      const metrics = await inactiveCardMetrics(page, '#horizontal-cards-basic');

      expect(metrics.found).toBe(true);
      expect(metrics.opacity).toBe(1);
      expect(metrics.ariaHidden).toBeNull();
      expect(metrics.titleRatio).toBeGreaterThanOrEqual(4.5);
      expect(metrics.descriptionRatio).toBeGreaterThanOrEqual(4.5);
      expect(metrics.placeholderRatio).toBeGreaterThanOrEqual(4.5);

      await expectNoAxeViolations(
        page,
        '#horizontal-cards-basic .horizontal-cards-card:not(.horizontal-cards-card-active)',
      );
    });

    test('after scrolling, the previous card still has full-contrast text', async ({
      page,
    }) => {
      await page.evaluate(() => window.testHorizontalCards.basic.scrollToIndex(1));
      await page.waitForFunction(() =>
        document
          .querySelector(
            '#horizontal-cards-basic .horizontal-cards-card[data-index="1"]',
          )
          ?.classList.contains('horizontal-cards-card-active'),
      );

      const metrics = await inactiveCardMetrics(page, '#horizontal-cards-basic');
      expect(metrics.found).toBe(true);
      expect(metrics.opacity).toBe(1);
      expect(metrics.titleRatio).toBeGreaterThanOrEqual(4.5);
      expect(metrics.descriptionRatio).toBeGreaterThanOrEqual(4.5);
    });
  });
}
