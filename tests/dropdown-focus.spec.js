import { test, expect } from '@playwright/test';

/**
 * D3 focus regression: options are tabindex=-1, so Tab leaves the widget.
 * The open listbox must close when focus exits toggle/menu, and stay open
 * when Shift+Tab moves from an option back to the toggle.
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

test.describe('dropdown focus (Tab / Shift+Tab)', () => {
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
});
