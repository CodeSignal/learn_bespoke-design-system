import { test, expect } from '@playwright/test';

/**
 * A7 / A8 — measure semantic token contrast against Backgrounds-Main-Top
 * (and secondary button text on the same surface) in light and dark.
 */

function contrastRatio(fgHex, bgHex) {
  const rel = (hex) => {
    const h = hex.replace('#', '');
    const rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    const f = (c) =>
      c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
  };
  const L1 = rel(fgHex);
  const L2 = rel(bgHex);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

async function readTokens(page) {
  return page.evaluate(() => {
    const toHex = (rgb) => {
      const m = String(rgb).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (!m) return String(rgb);
      return (
        '#' +
        [m[1], m[2], m[3]]
          .map((n) => Number(n).toString(16).padStart(2, '0'))
          .join('')
      );
    };

    const probe = document.getElementById('probe');
    const sample = (cssColor) => {
      probe.style.color = cssColor;
      void probe.offsetHeight;
      return toHex(getComputedStyle(probe).color);
    };
    const sampleBg = (cssBg) => {
      probe.style.backgroundColor = cssBg;
      void probe.offsetHeight;
      return toHex(getComputedStyle(probe).backgroundColor);
    };

    return {
      bg: sampleBg('var(--Colors-Backgrounds-Main-Top)'),
      primaryDefault: sample('var(--Colors-Primary-Default)'),
      bodyLighter: sample('var(--Colors-Text-Body-Lighter)'),
      bodyLight: sample('var(--Colors-Text-Body-Light)'),
      secondaryText: sample('var(--Colors-Buttons-Secondary-Default-Text)'),
    };
  });
}

for (const colorScheme of ['light', 'dark']) {
  test.describe(`contrast tokens — ${colorScheme}`, () => {
    test.use({ colorScheme });

    test.beforeEach(async ({ page }) => {
      await page.goto('/tests/fixtures/contrast-tokens.html');
      await page.waitForFunction(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--Colors-Primary-Default')
          .trim(),
      );
    });

    test('Primary-Default focus-ring color meets 3:1 on Main-Top', async ({
      page,
    }) => {
      const t = await readTokens(page);
      const ratio = contrastRatio(t.primaryDefault, t.bg);
      expect(
        ratio,
        `${t.primaryDefault} on ${t.bg} = ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(3);
    });

    test('Text-Body-Lighter meets 4.5:1 on Main-Top', async ({ page }) => {
      const t = await readTokens(page);
      const ratio = contrastRatio(t.bodyLighter, t.bg);
      expect(
        ratio,
        `${t.bodyLighter} on ${t.bg} = ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(4.5);
    });

    test('Text-Body-Light meets 4.5:1 and stays stronger than Lighter', async ({
      page,
    }) => {
      const t = await readTokens(page);
      const light = contrastRatio(t.bodyLight, t.bg);
      const lighter = contrastRatio(t.bodyLighter, t.bg);
      expect(
        light,
        `${t.bodyLight} on ${t.bg} = ${light.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(4.5);
      expect(light).toBeGreaterThanOrEqual(lighter);
    });

    test('button-secondary text meets 4.5:1 on Main-Top', async ({ page }) => {
      const t = await readTokens(page);
      const ratio = contrastRatio(t.secondaryText, t.bg);
      expect(
        ratio,
        `${t.secondaryText} on ${t.bg} = ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(4.5);
    });
  });
}
