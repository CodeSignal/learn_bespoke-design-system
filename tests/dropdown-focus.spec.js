import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from './helpers/a11y.js';

/**
 * D3 focus regression: options are tabindex=-1, so Tab leaves the widget.
 * The open listbox must close when focus exits toggle/menu, and stay open
 * when Shift+Tab moves from an option back to the toggle.
 *
 * Themes use Playwright `colorScheme`, which drives the design-system
 * `@media (prefers-color-scheme: dark)` tokens (same approach as ChatCPT audits).
 */

async function injectTabNeighbors(page) {
  await page.evaluate(() => {
    const root = document.querySelector('#dropdown-basic');
    if (!root || document.getElementById('focus-before')) return;

    const before = document.createElement('button');
    before.id = 'focus-before';
    before.type = 'button';
    before.textContent = 'Before';

    const after = document.createElement('button');
    after.id = 'focus-after';
    after.type = 'button';
    after.textContent = 'After';

    root.parentElement.insertBefore(before, root);
    root.parentElement.insertBefore(after, root.nextSibling);
  });
}

function dropdownState(page) {
  return page.evaluate(() => {
    const root = document.querySelector('#dropdown-basic');
    const toggle = root.querySelector('.dropdown-toggle');
    const active = document.activeElement;
    return {
      open: root.classList.contains('open'),
      ariaExpanded: toggle.getAttribute('aria-expanded'),
      focusId: active?.id || null,
      focusRole: active?.getAttribute?.('role') || null,
      onToggle: active?.classList?.contains('dropdown-toggle') ?? false,
      onOption: active?.getAttribute?.('role') === 'option',
    };
  });
}

for (const colorScheme of ['light', 'dark']) {
  test.describe(`dropdown focus (Tab / Shift+Tab) — ${colorScheme}`, () => {
    test.use({ colorScheme });

    test.beforeEach(async ({ page }) => {
      await page.goto('/components/dropdown/test.html');
      await page.waitForFunction(() => window.testDropdowns?.basic);
      await injectTabNeighbors(page);
    });

    test('Tab from an option closes the menu and lands on the next control', async ({
      page,
    }) => {
      await page.locator('#dropdown-basic .dropdown-toggle').focus();
      await page.keyboard.press('ArrowDown');

      let state = await dropdownState(page);
      expect(state.open).toBe(true);
      expect(state.onOption).toBe(true);

      await page.keyboard.press('Tab');
      state = await dropdownState(page);

      expect(state.open).toBe(false);
      expect(state.ariaExpanded).toBe('false');
      expect(state.focusId).toBe('focus-after');
    });

    test('Shift+Tab from an option moves to the toggle and keeps the menu open', async ({
      page,
    }) => {
      await page.locator('#dropdown-basic .dropdown-toggle').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Shift+Tab');

      const state = await dropdownState(page);
      expect(state.open).toBe(true);
      expect(state.ariaExpanded).toBe('true');
      expect(state.onToggle).toBe(true);
      expect(state.focusRole).toBe('combobox');
    });

    test('Shift+Tab from the open toggle closes and lands on the previous control', async ({
      page,
    }) => {
      await page.locator('#dropdown-basic .dropdown-toggle').focus();
      await page.keyboard.press('ArrowDown');
      // Return focus to toggle without leaving the widget
      await page.locator('#dropdown-basic .dropdown-toggle').focus();

      let state = await dropdownState(page);
      expect(state.open).toBe(true);
      expect(state.onToggle).toBe(true);

      await page.keyboard.press('Shift+Tab');
      state = await dropdownState(page);

      expect(state.open).toBe(false);
      expect(state.ariaExpanded).toBe('false');
      expect(state.focusId).toBe('focus-before');
    });

    test('Tab from the open toggle closes and lands on the next control', async ({
      page,
    }) => {
      await page.locator('#dropdown-basic .dropdown-toggle').focus();
      await page.keyboard.press('Enter');
      await page.locator('#dropdown-basic .dropdown-toggle').focus();

      let state = await dropdownState(page);
      expect(state.open).toBe(true);
      expect(state.onToggle).toBe(true);

      await page.keyboard.press('Tab');
      state = await dropdownState(page);

      expect(state.open).toBe(false);
      expect(state.ariaExpanded).toBe('false');
      expect(state.focusId).toBe('focus-after');
    });

    test('open dropdown has no axe violations', async ({ page }) => {
      await page.locator('#dropdown-basic .dropdown-toggle').focus();
      await page.keyboard.press('ArrowDown');
      await expect(page.locator('#dropdown-basic')).toHaveClass(/open/);
      await expectNoAxeViolations(page, '#dropdown-basic');
    });
  });

  test.describe(`dropdown selection (aria-selected) — ${colorScheme}`, () => {
    test.use({ colorScheme });

    test.beforeEach(async ({ page }) => {
      await page.goto('/components/dropdown/test.html');
      await page.waitForFunction(() => window.testDropdowns?.basic);
    });

    test('preselected value exposes aria-selected on exactly one option', async ({
      page,
    }) => {
      await page.locator('#dropdown-preselected .dropdown-toggle').focus();
      await page.keyboard.press('ArrowDown');

      const state = await selectionState(page, '#dropdown-preselected');
      expect(state.total).toBeGreaterThan(0);
      expect(state.selectedCount).toBe(1);
      expect(state.selectedValues).toEqual(['option-2']);
      expect(state.allHaveAriaSelected).toBe(true);
      expect(state.falseCount).toBe(state.total - 1);

      await expectNoAxeViolations(page, '#dropdown-preselected');
    });

    test('selecting an option updates aria-selected on all options', async ({
      page,
    }) => {
      const basic = page.locator('#dropdown-basic');
      await basic.locator('.dropdown-toggle').focus();
      await page.keyboard.press('ArrowDown');

      let state = await selectionState(page, '#dropdown-basic');
      expect(state.selectedCount).toBe(0);
      expect(state.allHaveAriaSelected).toBe(true);
      expect(state.falseCount).toBe(state.total);

      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      await expect(basic).not.toHaveClass(/open/);
      await basic.locator('.dropdown-toggle').focus();
      await page.keyboard.press('ArrowDown');

      state = await selectionState(page, '#dropdown-basic');
      expect(state.selectedCount).toBe(1);
      expect(state.selectedValues).toEqual(['option-2']);
      expect(state.allHaveAriaSelected).toBe(true);
      expect(state.falseCount).toBe(state.total - 1);

      await expectNoAxeViolations(page, '#dropdown-basic');
    });
  });
}

/** aria-selected snapshot for options under a dropdown root. */
function selectionState(page, rootSelector) {
  return page.evaluate((sel) => {
    const root = document.querySelector(sel);
    const options = Array.from(root.querySelectorAll('[role="option"]'));
    const selected = options.filter(
      (o) => o.getAttribute('aria-selected') === 'true',
    );
    return {
      total: options.length,
      selectedCount: selected.length,
      selectedValues: selected.map((o) => o.getAttribute('data-value')),
      falseCount: options.filter(
        (o) => o.getAttribute('aria-selected') === 'false',
      ).length,
      allHaveAriaSelected: options.every((o) => {
        const v = o.getAttribute('aria-selected');
        return v === 'true' || v === 'false';
      }),
    };
  }, rootSelector);
}
