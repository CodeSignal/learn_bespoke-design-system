import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from './helpers/a11y.js';

/**
 * D5: role=slider and value attrs live on each handle; wrapper is not
 * interactive; aria-valuenow is always a single number (range included).
 *
 * Themes use Playwright `colorScheme`, which drives the design-system
 * `@media (prefers-color-scheme: dark)` tokens.
 */

function sliderAriaState(page, rootSelector) {
  return page.evaluate((sel) => {
    const root = document.querySelector(sel);
    const wrapper = root.querySelector('.numeric-slider-wrapper');
    const handles = Array.from(root.querySelectorAll('.numeric-slider-handle'));
    return {
      wrapperRole: wrapper?.getAttribute('role'),
      wrapperTabindex: wrapper?.getAttribute('tabindex'),
      handleCount: handles.length,
      handles: handles.map((h) => ({
        role: h.getAttribute('role'),
        tabindex: h.getAttribute('tabindex'),
        valuemin: h.getAttribute('aria-valuemin'),
        valuemax: h.getAttribute('aria-valuemax'),
        valuenow: h.getAttribute('aria-valuenow'),
        valuetext: h.getAttribute('aria-valuetext'),
        orientation: h.getAttribute('aria-orientation'),
        ariaDisabled: h.getAttribute('aria-disabled'),
        disabled: h.disabled,
        label: h.getAttribute('aria-label'),
      })),
    };
  }, rootSelector);
}

for (const colorScheme of ['light', 'dark']) {
  test.describe(`numeric slider a11y — ${colorScheme}`, () => {
    test.use({ colorScheme });

    test.beforeEach(async ({ page }) => {
      await page.goto('/components/numeric-slider/test.html');
      await page.waitForFunction(() => window.testSliders?.singleDefault);
    });

    test('single slider: handle is the slider; wrapper is not focusable', async ({
      page,
    }) => {
      const state = await sliderAriaState(page, '#slider-single-default');

      expect(state.wrapperRole).toBeNull();
      expect(state.wrapperTabindex).toBeNull();
      expect(state.handleCount).toBe(1);

      const [handle] = state.handles;
      expect(handle.role).toBe('slider');
      expect(handle.tabindex).toBe('0');
      expect(handle.orientation).toBe('horizontal');
      expect(handle.valuemin).toBe('0');
      expect(handle.valuemax).toBe('100');
      expect(handle.valuenow).toBe('50');
      expect(handle.valuetext).toBe('50');
      expect(handle.ariaDisabled).toBe('false');
      expect(Number.isNaN(Number(handle.valuenow))).toBe(false);

      await expectNoAxeViolations(page, '#slider-single-default');
    });

    test('range slider: each handle has its own single-number aria-valuenow', async ({
      page,
    }) => {
      const state = await sliderAriaState(page, '#slider-range-default');

      expect(state.wrapperRole).toBeNull();
      expect(state.wrapperTabindex).toBeNull();
      expect(state.handleCount).toBe(2);

      const [minHandle, maxHandle] = state.handles;
      expect(minHandle.role).toBe('slider');
      expect(maxHandle.role).toBe('slider');
      expect(minHandle.valuenow).toBe('20');
      expect(maxHandle.valuenow).toBe('60');
      expect(minHandle.valuenow.includes(',')).toBe(false);
      expect(maxHandle.valuenow.includes(',')).toBe(false);
      expect(minHandle.label).toBe('Minimum value');
      expect(maxHandle.label).toBe('Maximum value');

      await expectNoAxeViolations(page, '#slider-range-default');
    });

    test('disabled slider exposes aria-disabled and is not tabbable', async ({
      page,
    }) => {
      const state = await sliderAriaState(page, '#slider-disabled-single');
      const [handle] = state.handles;

      expect(handle.tabindex).toBe('-1');
      expect(handle.ariaDisabled).toBe('true');
      expect(handle.disabled).toBe(true);

      // Scope to the track/handles — companion number inputs are unlabeled in
      // the fixture (app labeling is D6 / aria-labelledby), not part of D5.
      await expectNoAxeViolations(
        page,
        '#slider-disabled-single .numeric-slider-wrapper',
      );
    });

    test('keyboard arrows update aria-valuenow on the focused handle', async ({
      page,
    }) => {
      const handle = page.locator(
        '#slider-single-default .numeric-slider-handle',
      );
      await handle.focus();
      await page.keyboard.press('ArrowRight');

      await expect(handle).toHaveAttribute('aria-valuenow', '51');
      await expect(handle).toHaveAttribute('aria-valuetext', '51');

      await page.keyboard.press('Home');
      await expect(handle).toHaveAttribute('aria-valuenow', '0');

      await page.keyboard.press('End');
      await expect(handle).toHaveAttribute('aria-valuenow', '100');
    });
  });
}
