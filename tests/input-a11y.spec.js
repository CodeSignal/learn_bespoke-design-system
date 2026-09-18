import { test, expect } from '@playwright/test';
import { contrastRatio, over } from './helpers/contrast.js';

const SURFACE_HELPER = () => {
  window.__paintedSurfaceBehind = (el) => {
    for (let p = el.parentElement; p; p = p.parentElement) {
      const bg = getComputedStyle(p).backgroundColor;
      if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) return bg;
    }
    return 'rgb(255, 255, 255)';
  };
};

function restingState(page, controlSelector) {
  return page.evaluate((sel) => {
    const control = document.querySelector(sel);
    const style = getComputedStyle(control);
    return {
      borderColor: style.borderTopColor,
      borderWidth: style.borderTopWidth,
      fill: style.backgroundColor,
      surface: window.__paintedSurfaceBehind(control),
    };
  }, controlSelector);
}

async function focusVisibleState(page, inputSelector, controlSelector) {
  await page.evaluate((sel) => {
    document.querySelector(sel).focus();
  }, inputSelector);
  // Chromium only matches :focus-visible once it has seen keyboard input.
  await page.keyboard.press('Shift');

  return page.evaluate(
    ([inputSel, ctrlSel]) => {
      const input = document.querySelector(inputSel);
      const control = document.querySelector(ctrlSel);
      const style = getComputedStyle(control);

      return {
        surface: window.__paintedSurfaceBehind(control),
        matchesFocusVisible: input.matches(':focus-visible'),
        outlineColor: style.outlineColor,
        outlineWidth: style.outlineWidth,
        outlineStyle: style.outlineStyle,
        outlineOffset: style.outlineOffset,
      };
    },
    [inputSelector, controlSelector],
  );
}

const CONTROLS = [
  {
    name: 'checkbox',
    input: '.input-checkbox input[type="checkbox"]',
    control: '.input-checkbox-box',
  },
  {
    name: 'radio',
    input: '.input-radio input[type="radio"]',
    control: '.input-radio-circle',
  },
];

for (const colorScheme of ['light', 'dark']) {
  test.describe(`checkbox / radio contrast — ${colorScheme}`, () => {
    test.use({ colorScheme });

    test.beforeEach(async ({ page }) => {
      await page.addInitScript(SURFACE_HELPER);
      await page.goto('/components/input/test.html');
      await page.waitForFunction(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--Colors-Stroke-Stronger')
          .trim(),
      );
    });

    for (const { name, input, control } of CONTROLS) {
      test(`unselected ${name} border meets 3:1 against its own fill`, async ({
        page,
      }) => {
        const state = await restingState(page, control);
        const fill = over(state.fill, state.surface);
        const ratio = contrastRatio(state.borderColor, fill);

        expect(
          ratio,
          `${state.borderColor} on composited fill rgb(${fill.join(', ')}) = ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(3);
        expect(parseFloat(state.borderWidth)).toBeGreaterThan(0);
      });

      test(`${name} focus ring is a real indicator at 3:1`, async ({ page }) => {
        const state = await focusVisibleState(page, input, control);

        expect(state.matchesFocusVisible).toBe(true);
        expect(state.outlineStyle).toBe('solid');
        expect(parseFloat(state.outlineWidth)).toBeGreaterThanOrEqual(2);
        expect(parseFloat(state.outlineOffset)).toBeGreaterThanOrEqual(2);

        const ratio = contrastRatio(state.outlineColor, state.surface);
        expect(
          ratio,
          `${state.outlineColor} on ${state.surface} = ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(3);
      });
    }

    test('matrix radio in a table cell is not clipped by its container', async ({
      page,
    }) => {
      const cellRadio = 'td.input-radio-cell .input-radio-circle';
      const state = await focusVisibleState(
        page,
        'td.input-radio-cell input[type="radio"]',
        cellRadio,
      );
      expect(parseFloat(state.outlineOffset)).toBeGreaterThanOrEqual(2);

      const clipped = await page.evaluate(
        ([sel, reach]) => {
          const control = document.querySelector(sel);
          const box = control.getBoundingClientRect();
          const need = {
            top: box.top - reach,
            bottom: box.bottom + reach,
            left: box.left - reach,
            right: box.right + reach,
          };

          for (let el = control.parentElement; el; el = el.parentElement) {
            const style = getComputedStyle(el);
            const clips = /auto|hidden|scroll|clip/.test(
              style.overflowX + style.overflowY,
            );
            if (!clips) continue;
            const r = el.getBoundingClientRect();
            if (
              need.top < r.top ||
              need.bottom > r.bottom ||
              need.left < r.left ||
              need.right > r.right
            ) {
              return {
                by: el.className || el.tagName,
                overflow: style.overflowX + ' / ' + style.overflowY,
              };
            }
          }
          return null;
        },
        [
          cellRadio,
          parseFloat(state.outlineWidth) + parseFloat(state.outlineOffset),
        ],
      );

      expect(
        clipped,
        clipped ? `focus ring cropped by ${clipped.by} (${clipped.overflow})` : '',
      ).toBeNull();
    });
  });
}

/**
 * Forced colors overrides author colors, which flattens the checked fill to
 * Canvas and paints the mask-drawn mark in Canvas too. Both controls then
 * render identically whether or not they are checked.
 */
test.describe('checked state survives forced colors', () => {
  test.beforeEach(async ({ page }) => {
    // The `forcedColors` context option only flips the media query; emulateMedia
    // is what makes Chromium actually override the author colors.
    await page.emulateMedia({ forcedColors: 'active', colorScheme: 'light' });
    await page.goto('/components/input/test.html');
    await page.waitForFunction(
      () => matchMedia('(forced-colors: active)').matches,
    );
  });

  for (const { name, wrapper, control, mark } of [
    {
      name: 'checkbox',
      wrapper: '.input-checkbox',
      control: '.input-checkbox-box',
      mark: '.input-checkbox-checkmark',
    },
    {
      name: 'radio',
      wrapper: '.input-radio',
      control: '.input-radio-circle',
      mark: '.input-radio-dot',
    },
  ]) {
    test(`${name} reads as checked`, async ({ page }) => {
      const state = await page.evaluate(
        ([wrapperSel, controlSel, markSel]) => {
          const wrappers = [...document.querySelectorAll(wrapperSel)];
          const checked = wrappers.find((w) => w.querySelector('input')?.checked);
          const unchecked = wrappers.find(
            (w) => !w.querySelector('input')?.checked,
          );
          const box = checked.querySelector(controlSel);
          return {
            checkedFill: getComputedStyle(box).backgroundColor,
            uncheckedFill: getComputedStyle(
              unchecked.querySelector(controlSel),
            ).backgroundColor,
            mark: getComputedStyle(box.querySelector(markSel), '::before')
              .backgroundColor,
          };
        },
        [wrapper, control, mark],
      );

      expect(state.checkedFill).not.toBe(state.uncheckedFill);
      expect(state.mark).not.toBe(state.checkedFill);
    });
  }
});
