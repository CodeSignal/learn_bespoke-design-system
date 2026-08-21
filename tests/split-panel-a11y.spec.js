import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from './helpers/a11y.js';

/**
 * D2: Split Panel divider needs an accessible name and a ≥24×24 CSS px
 * pointer target. Keyboard arrows already resized; that must stay.
 *
 * Hit area is the divider's getBoundingClientRect() (padding that layout
 * ignores, or a ::before overlay, does not count). D3's hardcoded
 * `#2b3b52` on ::after is out of scope.
 */

const CONSUMER_RESET = `
  html *, body * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

function dividerState(page, rootSelector) {
  return page.evaluate((sel) => {
    const root = document.querySelector(sel);
    const divider = root.querySelector('.split-panel-divider');
    const rect = divider.getBoundingClientRect();
    const style = getComputedStyle(divider);
    const after = getComputedStyle(divider, '::after');
    return {
      role: divider.getAttribute('role'),
      label: divider.getAttribute('aria-label'),
      valuemin: divider.getAttribute('aria-valuemin'),
      valuemax: divider.getAttribute('aria-valuemax'),
      valuenow: divider.getAttribute('aria-valuenow'),
      valuetext: divider.getAttribute('aria-valuetext'),
      tabIndex: divider.tabIndex,
      width: rect.width,
      height: rect.height,
      flexBasis: style.flexBasis,
      boxSizing: style.boxSizing,
      afterWidth: after.width,
      afterHeight: after.height,
      afterBackground: after.backgroundColor,
    };
  }, rootSelector);
}

async function createIsolatedPanel(page, options = {}) {
  return page.evaluate((opts) => {
    const root = document.createElement('div');
    root.id = 'isolated-split';
    root.style.width = '800px';
    root.style.height = '400px';
    document.body.appendChild(root);
    const panel = new window.SplitPanel(root, {
      initialSplit: 50,
      ...opts,
    });
    window.__testSplitPanels = [panel];
    return true;
  }, options);
}

async function destroyIsolatedPanels(page) {
  await page.evaluate(() => {
    (window.__testSplitPanels || []).forEach((p) => p.destroy());
    window.__testSplitPanels = [];
    document.getElementById('isolated-split')?.remove();
  });
}

for (const colorScheme of ['light', 'dark']) {
  test.describe(`split panel divider a11y — ${colorScheme}`, () => {
    test.use({ colorScheme });

    test.beforeEach(async ({ page }) => {
      await page.goto('/components/split-panel/test.html');
      await page.waitForFunction(() => window.testPanels?.basic);
    });

    test('horizontal divider is named and at least 24×24 CSS px', async ({
      page,
    }) => {
      const state = await dividerState(page, '#split-panel-basic');

      expect(state.role).toBe('separator');
      expect(state.label).toBe('Resize reference panel');
      expect(state.valuenow).toBe('50');
      expect(state.valuetext).toBe('50%');
      expect(state.tabIndex).toBe(0);
      expect(state.width).toBeGreaterThanOrEqual(24);
      expect(state.height).toBeGreaterThanOrEqual(24);
      expect(state.flexBasis).toBe('4px');
      expect(state.afterWidth).toBe('2px');
      expect(state.afterBackground).toBe('rgb(43, 59, 82)');

      await expectNoAxeViolations(page, '#split-panel-basic');
    });

    test('vertical divider meets the 24px target on the block axis', async ({
      page,
    }) => {
      const state = await dividerState(page, '#split-panel-vertical');

      expect(state.label).toBe('Resize reference panel');
      expect(state.width).toBeGreaterThanOrEqual(24);
      expect(state.height).toBeGreaterThanOrEqual(24);
      expect(state.flexBasis).toBe('4px');
      expect(state.afterHeight).toBe('2px');
      expect(state.afterBackground).toBe('rgb(43, 59, 82)');
    });

    test('keyboard arrows still resize the split', async ({ page }) => {
      const divider = page.locator('#split-panel-basic .split-panel-divider');
      await divider.focus();
      await page.keyboard.press('ArrowRight');

      await expect(divider).toHaveAttribute('aria-valuenow', '51');
      await expect(divider).toHaveAttribute('aria-valuetext', '51%');

      await page.keyboard.press('Home');
      await expect(divider).toHaveAttribute('aria-valuenow', '10');

      await page.keyboard.press('End');
      await expect(divider).toHaveAttribute('aria-valuenow', '90');
    });
  });
}

test.describe('split panel hit target vs consumer reset', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/split-panel/test.html');
    await page.waitForFunction(() => typeof window.SplitPanel === 'function');
  });

  test.afterEach(async ({ page }) => {
    await destroyIsolatedPanels(page);
  });

  test('getBoundingClientRect stays ≥24px under a global padding/margin reset', async ({
    page,
  }) => {
    await page.addStyleTag({ content: CONSUMER_RESET });
    await createIsolatedPanel(page);

    const state = await dividerState(page, '#isolated-split');
    expect(state.width).toBeGreaterThanOrEqual(24);
    expect(state.height).toBeGreaterThanOrEqual(24);
    expect(state.flexBasis).toBe('4px');
    expect(state.boxSizing).toBe('content-box');
    expect(state.label).toBe('Resize reference panel');
  });
});
