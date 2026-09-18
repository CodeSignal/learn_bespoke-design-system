import { test, expect } from '@playwright/test';
import { contrastRatio, relativeLuminance } from './helpers/contrast.js';

/**
 * A7 / A8 — measure semantic token contrast against Backgrounds-Main-Top
 * (and secondary button text on the same surface) in light and dark.
 * D12 — assert stroke / tertiary-border tokens dark-adapt (not near-white).
 */

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
      strokeDefault: sample('var(--Colors-Stroke-Default)'),
      strokeLight: sample('var(--Colors-Stroke-Light)'),
      strokeStrong: sample('var(--Colors-Stroke-Strong)'),
      strokeStronger: sample('var(--Colors-Stroke-Stronger)'),
      strokePrimary: sample('var(--Colors-Stroke-Primary)'),
      tertiaryDefault: sample('var(--Colors-Buttons-Tertiary-Default)'),
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

    test('Stroke-Stronger, the control-outline step, meets 3:1 on Main-Top', async ({
      page,
    }) => {
      const t = await readTokens(page);
      const ratio = contrastRatio(t.strokeStronger, t.bg);
      expect(
        ratio,
        `${t.strokeStronger} on ${t.bg} = ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(3);
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

test.describe('stroke tokens dark-adapt (D12)', () => {
  test('dark Stroke-Default / Light / Strong are not the light near-white scale', async ({
    browser,
  }) => {
    const lightCtx = await browser.newContext({ colorScheme: 'light' });
    const darkCtx = await browser.newContext({ colorScheme: 'dark' });
    const lightPage = await lightCtx.newPage();
    const darkPage = await darkCtx.newPage();
    await lightPage.goto('/tests/fixtures/contrast-tokens.html');
    await darkPage.goto('/tests/fixtures/contrast-tokens.html');
    await Promise.all([
      lightPage.waitForFunction(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--Colors-Stroke-Default')
          .trim(),
      ),
      darkPage.waitForFunction(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--Colors-Stroke-Default')
          .trim(),
      ),
    ]);

    const light = await readTokens(lightPage);
    const dark = await readTokens(darkPage);

    expect(dark.strokeDefault).not.toBe(light.strokeDefault);
    expect(dark.strokeLight).not.toBe(light.strokeLight);
    expect(dark.strokeStrong).not.toBe(light.strokeStrong);

    // On dark Main-Top, adapted strokes must be darker than the light-mode
    // near-white values (relative luminance much lower).
    expect(relativeLuminance(dark.strokeDefault)).toBeLessThan(0.2);
    expect(relativeLuminance(dark.strokeLight)).toBeLessThan(0.2);
    expect(relativeLuminance(light.strokeDefault)).toBeGreaterThan(0.7);

    // Stronger rank: Strong more luminous than Default on dark (more contrast).
    expect(relativeLuminance(dark.strokeStrong)).toBeGreaterThan(
      relativeLuminance(dark.strokeDefault),
    );

    // Tertiary Default is the border color — same near-white failure class.
    expect(dark.tertiaryDefault).not.toBe(light.tertiaryDefault);
    expect(relativeLuminance(dark.tertiaryDefault)).toBeLessThan(0.2);

    await lightCtx.close();
    await darkCtx.close();
  });
});
