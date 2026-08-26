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

async function createIsolatedPanel(
  page,
  options = {},
  size = { width: '800px', height: '400px' },
) {
  return page.evaluate(({ opts, size: dim }) => {
    const root = document.createElement('div');
    root.id = 'isolated-split';
    root.style.width = dim.width;
    root.style.height = dim.height;
    document.body.appendChild(root);
    const panel = new window.SplitPanel(root, {
      initialSplit: 50,
      ...opts,
    });
    window.__testSplitPanels = [panel];
    return true;
  }, { opts: options, size });
}

function hostAndDividerRects(page, rootSelector) {
  return page.evaluate((sel) => {
    const root = document.querySelector(sel);
    const divider = root.querySelector('.split-panel-divider');
    const host = root.getBoundingClientRect();
    const hit = divider.getBoundingClientRect();
    return {
      hostWidth: host.width,
      hostHeight: host.height,
      hostOverflow: getComputedStyle(root).overflow,
      dividerWidth: hit.width,
      dividerHeight: hit.height,
      flexBasis: getComputedStyle(divider).flexBasis,
    };
  }, rootSelector);
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

test.describe('split panel constrained containers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/split-panel/test.html');
    await page.waitForFunction(() => typeof window.SplitPanel === 'function');
  });

  test.afterEach(async ({ page }) => {
    await destroyIsolatedPanels(page);
  });

  test('horizontal divider stays ≥24×24 in a short container', async ({ page }) => {
    await createIsolatedPanel(page, {}, { width: '400px', height: '16px' });

    const state = await hostAndDividerRects(page, '#isolated-split');
    expect(state.hostHeight).toBe(16);
    expect(state.hostOverflow).toBe('visible');
    expect(state.dividerWidth).toBeGreaterThanOrEqual(24);
    expect(state.dividerHeight).toBeGreaterThanOrEqual(24);
    expect(state.flexBasis).toBe('4px');
  });

  test('vertical divider stays ≥24×24 in a narrow container', async ({ page }) => {
    await createIsolatedPanel(
      page,
      { orientation: 'vertical' },
      { width: '16px', height: '400px' },
    );

    const state = await hostAndDividerRects(page, '#isolated-split');
    expect(state.hostWidth).toBe(16);
    expect(state.hostOverflow).toBe('visible');
    expect(state.dividerWidth).toBeGreaterThanOrEqual(24);
    expect(state.dividerHeight).toBeGreaterThanOrEqual(24);
    expect(state.flexBasis).toBe('4px');
  });
});

test.describe('split panel fractional ARIA bounds', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/split-panel/test.html');
    await page.waitForFunction(() => typeof window.SplitPanel === 'function');
  });

  test.afterEach(async ({ page }) => {
    await destroyIsolatedPanels(page);
  });

  test('rounded valuenow stays within rounded min/max at Home and End', async ({
    page,
  }) => {
    await createIsolatedPanel(page, { minLeft: 10.4, minRight: 10.4 });
    const divider = page.locator('#isolated-split .split-panel-divider');

    await divider.focus();
    await page.keyboard.press('End');

    const endState = await dividerState(page, '#isolated-split');
    const endMin = Number(endState.valuemin);
    const endMax = Number(endState.valuemax);
    const endNow = Number(endState.valuenow);
    expect(endMin).toBe(10);
    expect(endMax).toBe(90);
    expect(endNow).toBe(90);
    expect(endNow).toBeGreaterThanOrEqual(endMin);
    expect(endNow).toBeLessThanOrEqual(endMax);
    expect(endState.valuetext).toBe('90%');

    await page.keyboard.press('Home');

    const homeState = await dividerState(page, '#isolated-split');
    const homeMin = Number(homeState.valuemin);
    const homeMax = Number(homeState.valuemax);
    const homeNow = Number(homeState.valuenow);
    expect(homeMin).toBe(10);
    expect(homeMax).toBe(90);
    expect(homeNow).toBe(10);
    expect(homeNow).toBeGreaterThanOrEqual(homeMin);
    expect(homeNow).toBeLessThanOrEqual(homeMax);
    expect(homeState.valuetext).toBe('10%');
  });
});
