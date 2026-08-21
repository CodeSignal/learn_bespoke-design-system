import { test, expect } from '@playwright/test';

/**
 * D9: optional accessible-name overrides. English remains the default.
 * Consumers pass already-translated strings; the DS has no i18n runtime.
 */

test.describe('modal closeButtonLabel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/modal/test.html');
    await page.waitForFunction(() => typeof window.Modal === 'function');
  });

  test.afterEach(async ({ page }) => {
    await page.evaluate(() => {
      (window.__testModals || []).forEach((m) => m.destroy());
      window.__testModals = [];
    });
  });

  test('defaults to English Close modal', async ({ page }) => {
    const label = await page.evaluate(() => {
      const modal = new window.Modal({
        title: 'Settings',
        content: '<p>Body</p>',
      });
      window.__testModals = [modal];
      return modal.closeButton.getAttribute('aria-label');
    });
    expect(label).toBe('Close modal');
  });

  test('uses closeButtonLabel when provided', async ({ page }) => {
    const label = await page.evaluate(() => {
      const modal = new window.Modal({
        title: 'Ajustes',
        content: '<p>Cuerpo</p>',
        closeButtonLabel: 'Cerrar modal',
      });
      window.__testModals = [modal];
      return modal.closeButton.getAttribute('aria-label');
    });
    expect(label).toBe('Cerrar modal');
  });
});

test.describe('slider handle labels', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/numeric-slider/test.html');
    await page.waitForFunction(() => window.testSliders?.singleDefault);
  });

  test('defaults remain English', async ({ page }) => {
    const labels = await page.evaluate(() => {
      const single = document.querySelector(
        '#slider-single-default .numeric-slider-handle',
      );
      const range = Array.from(
        document.querySelectorAll('#slider-range-default .numeric-slider-handle'),
      );
      return {
        single: single?.getAttribute('aria-label'),
        min: range[0]?.getAttribute('aria-label'),
        max: range[1]?.getAttribute('aria-label'),
      };
    });
    expect(labels.single).toBe('Value');
    expect(labels.min).toBe('Minimum value');
    expect(labels.max).toBe('Maximum value');
  });

  test('accepts translated handle labels', async ({ page }) => {
    const labels = await page.evaluate(() => {
      const singleRoot = document.createElement('div');
      const rangeRoot = document.createElement('div');
      document.body.append(singleRoot, rangeRoot);
      const single = new window.NumericSlider(singleRoot, {
        type: 'single',
        value: 50,
        handleLabel: 'Temperatura',
      });
      const range = new window.NumericSlider(rangeRoot, {
        type: 'range',
        value: [20, 80],
        minHandleLabel: 'Valor mínimo',
        maxHandleLabel: 'Valor máximo',
      });
      window.__testSlidersExtra = [single, range];
      return {
        single: single.handle.getAttribute('aria-label'),
        min: range.minHandle.getAttribute('aria-label'),
        max: range.maxHandle.getAttribute('aria-label'),
      };
    });
    expect(labels.single).toBe('Temperatura');
    expect(labels.min).toBe('Valor mínimo');
    expect(labels.max).toBe('Valor máximo');

    await page.evaluate(() => {
      (window.__testSlidersExtra || []).forEach((s) => s.destroy());
    });
  });
});

test.describe('dropdown placeholder is the accessible name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/dropdown/test.html');
    await page.waitForFunction(() => window.testDropdowns?.basic);
  });

  test('default placeholder is Select option', async ({ page }) => {
    const name = await page.locator('#dropdown-basic .dropdown-toggle').getAttribute(
      'aria-labelledby',
    );
    const text = await page.locator(`#${name}`).textContent();
    expect(text).toBe('Select option');
  });

  test('custom placeholder becomes the combobox name', async ({ page }) => {
    const name = await page.locator('#dropdown-custom .dropdown-toggle').getAttribute(
      'aria-labelledby',
    );
    const text = await page.locator(`#${name}`).textContent();
    expect(text).toBe('Dropdown Toggle');
  });
});

test.describe('split panel dividerLabel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/split-panel/test.html');
    await page.waitForFunction(() => window.testPanels?.basic);
  });

  test.afterEach(async ({ page }) => {
    await page.evaluate(() => {
      (window.__testSplitPanels || []).forEach((p) => p.destroy());
      window.__testSplitPanels = [];
      document.getElementById('isolated-split-name')?.remove();
    });
  });

  test('defaults to English Resize reference panel', async ({ page }) => {
    const label = await page
      .locator('#split-panel-basic .split-panel-divider')
      .getAttribute('aria-label');
    expect(label).toBe('Resize reference panel');
  });

  test('uses dividerLabel when provided', async ({ page }) => {
    const label = await page.evaluate(() => {
      const root = document.createElement('div');
      root.id = 'isolated-split-name';
      root.style.width = '400px';
      root.style.height = '200px';
      document.body.append(root);
      const panel = new window.SplitPanel(root, {
        dividerLabel: 'Redimensionar panel de referencia',
      });
      window.__testSplitPanels = [panel];
      return panel.divider.getAttribute('aria-label');
    });
    expect(label).toBe('Redimensionar panel de referencia');
  });
});
