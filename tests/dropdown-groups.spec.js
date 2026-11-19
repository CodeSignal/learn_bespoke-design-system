import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from './helpers/a11y.js';

/**
 * Grouped options: items with a `group` render under a heading inside a
 * labelled role="group". Headings are not options, so keyboard navigation and
 * selection behave exactly as in an ungrouped dropdown.
 */

const GROUPED = '#dropdown-grouped';
const GROUPED_LONG = '#dropdown-grouped-long';


function focusedOption(page) {
  return page.evaluate(() => {
    const active = document.activeElement;
    return active?.getAttribute('role') === 'option' ? active.getAttribute('data-value') : null;
  });
}

/** Group names with their option values, read through the accessibility attributes. */
function groupStructure(page, selector) {
  return page.evaluate((sel) => {
    const root = document.querySelector(sel);
    return Array.from(root.querySelectorAll('[role="group"]')).map((group) => {
      const label = document.getElementById(group.getAttribute('aria-labelledby'));
      return {
        name: label?.textContent ?? null,
        labelIsFocusable: label ? label.tabIndex >= 0 : null,
        labelRole: label?.getAttribute('role') ?? null,
        options: Array.from(group.querySelectorAll('[role="option"]')).map((o) => o.getAttribute('data-value')),
      };
    });
  }, selector);
}

for (const colorScheme of ['light', 'dark']) {
  test.describe(`dropdown groups — ${colorScheme}`, () => {
    test.use({ colorScheme });

    test.beforeEach(async ({ page }) => {
      await page.goto('/components/dropdown/test.html');
      await page.waitForFunction(() => window.testDropdowns?.grouped);
    });

    test('renders consecutive items with the same group under one labelled group', async ({ page }) => {
      expect(await groupStructure(page, GROUPED)).toEqual([
        {
          name: 'OpenAI',
          labelIsFocusable: false,
          labelRole: 'presentation',
          options: ['gpt-6-luna', 'gpt-6.2-sol'],
        },
        {
          name: 'Anthropic',
          labelIsFocusable: false,
          labelRole: 'presentation',
          options: ['claude-sonnet-5-5', 'claude-haiku-5-5'],
        },
      ]);
    });

    test('keeps item order, leaves ungrouped items outside groups and starts a new group when the name changes', async ({
      page,
    }) => {
      const order = await page.evaluate((sel) => {
        const root = document.querySelector(sel);
        return Array.from(root.querySelectorAll('[role="option"]')).map((o) => ({
          value: o.getAttribute('data-value'),
          group: o.closest('[role="group"]')
            ? document.getElementById(o.closest('[role="group"]').getAttribute('aria-labelledby')).textContent
            : null,
        }));
      }, GROUPED_LONG);

      expect(order).toEqual([
        { value: 'auto', group: null },
        { value: 'gpt-6-luna', group: 'OpenAI' },
        { value: 'gpt-6.2-sol', group: 'OpenAI' },
        { value: 'claude-sonnet-5-5', group: 'Anthropic' },
        { value: 'claude-haiku-5-5', group: 'Anthropic' },
        { value: 'gpt-6.1-terra', group: 'OpenAI' },
        { value: 'gpt-6.2-astra', group: 'OpenAI' },
        { value: 'local-small', group: 'Self-hosted' },
      ]);
      // "OpenAI" appears twice because its items are not consecutive.
      expect((await groupStructure(page, GROUPED_LONG)).map((g) => g.name)).toEqual([
        'OpenAI',
        'Anthropic',
        'OpenAI',
        'Self-hosted',
      ]);
    });

    test('arrow keys, Home and End move across groups and skip headings', async ({ page }) => {
      const toggle = page.locator(`${GROUPED} .dropdown-toggle`);
      await toggle.focus();
      await page.keyboard.press('ArrowDown');
      expect(await focusedOption(page)).toBe('gpt-6-luna');

      await page.keyboard.press('ArrowDown');
      expect(await focusedOption(page)).toBe('gpt-6.2-sol');
      await page.keyboard.press('ArrowDown');
      expect(await focusedOption(page)).toBe('claude-sonnet-5-5');
      await page.keyboard.press('ArrowUp');
      expect(await focusedOption(page)).toBe('gpt-6.2-sol');

      await page.keyboard.press('End');
      expect(await focusedOption(page)).toBe('claude-haiku-5-5');
      await page.keyboard.press('ArrowDown');
      expect(await focusedOption(page)).toBe('gpt-6-luna');
      await page.keyboard.press('Home');
      expect(await focusedOption(page)).toBe('gpt-6-luna');
    });

    test('selecting a grouped option updates the value, toggle label and aria-selected', async ({ page }) => {
      const toggle = page.locator(`${GROUPED} .dropdown-toggle`);
      await toggle.click();
      await page.locator(`${GROUPED} [role="option"][data-value="claude-sonnet-5-5"]`).click();

      await expect(page.locator('#output-grouped')).toHaveText('claude-sonnet-5-5');
      await expect(page.locator(`${GROUPED} .dropdown-toggle-label`)).toHaveText('Claude Sonnet 5.5');
      await expect(page.locator(GROUPED)).not.toHaveClass(/open/);
      await expect(toggle).toBeFocused();

      const selected = await page.evaluate(
        (sel) =>
          Array.from(document.querySelectorAll(`${sel} [role="option"][aria-selected="true"]`)).map((o) =>
            o.getAttribute('data-value'),
          ),
        GROUPED,
      );
      expect(selected).toEqual(['claude-sonnet-5-5']);
      expect(await page.evaluate(() => window.testDropdowns.grouped.getValue())).toBe('claude-sonnet-5-5');
    });

    test('clicking a heading does not select anything or close the menu', async ({ page }) => {
      await page.locator(`${GROUPED} .dropdown-toggle`).click();
      await page.locator(`${GROUPED} .dropdown-menu-group-label`).first().click();

      await expect(page.locator(GROUPED)).toHaveClass(/open/);
      await expect(page.locator('#output-grouped')).toHaveText('None');
    });

    test('opening focuses the preselected option inside its group', async ({ page }) => {
      await page.locator(`${GROUPED_LONG} .dropdown-toggle`).focus();
      await page.keyboard.press('Enter');
      expect(await focusedOption(page)).toBe('claude-haiku-5-5');
    });

    test('menu height fits headings without scrolling when short, and scrolls when long', async ({ page }) => {
      await page.locator(`${GROUPED} .dropdown-toggle`).click();
      const short = await page.evaluate((sel) => {
        const list = document.querySelector(`${sel} .dropdown-menu-list`);
        const menu = document.querySelector(`${sel} .dropdown-menu`);
        return {
          clipped: list.scrollHeight > menu.clientHeight,
          scrollable: getComputedStyle(list).overflowY === 'auto',
        };
      }, GROUPED);
      expect(short).toEqual({ clipped: false, scrollable: false });
      await page.keyboard.press('Escape');

      await page.locator(`${GROUPED_LONG} .dropdown-toggle`).click();
      const long = await page.evaluate((sel) => {
        const list = document.querySelector(`${sel} .dropdown-menu-list`);
        const menu = document.querySelector(`${sel} .dropdown-menu`);
        return {
          scrollable: getComputedStyle(list).overflowY === 'auto' && list.scrollHeight > list.clientHeight,
          menuHeight: menu.getBoundingClientRect().height,
        };
      }, GROUPED_LONG);
      expect(long.scrollable).toBe(true);
      expect(Math.round(long.menuHeight)).toBeLessThanOrEqual(286);
    });

    test('heading height matches the value used for the menu height calculation', async ({ page }) => {
      await page.locator(`${GROUPED} .dropdown-toggle`).click();
      const height = await page
        .locator(`${GROUPED} .dropdown-menu-group-label`)
        .first()
        .evaluate((el) => el.getBoundingClientRect().height);
      expect(height).toBe(28);
    });

    test('dropdowns without groups render no group elements', async ({ page }) => {
      expect(await page.locator('#dropdown-basic [role="group"]').count()).toBe(0);
      expect(await page.locator('#dropdown-basic .dropdown-menu-group-label').count()).toBe(0);
    });

    test('has no axe violations closed or open', async ({ page }) => {
      await expectNoAxeViolations(page, GROUPED);
      await page.locator(`${GROUPED} .dropdown-toggle`).click();
      await expectNoAxeViolations(page, GROUPED);
      // The scrolling grouped menu is not scanned here: any scrolling menu,
      // grouped or not, currently reports axe's scrollable-region-focusable.
    });
  });
}
