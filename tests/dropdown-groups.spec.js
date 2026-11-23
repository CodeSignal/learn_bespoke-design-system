import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from './helpers/a11y.js';

/**
 * Grouped options: a group entry ({ label, items }) renders its options under
 * a heading inside a labelled role="group". Headings are not options, so
 * keyboard navigation and selection behave exactly as in an ungrouped dropdown.
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

    test('renders each group entry as a labelled group of its options', async ({ page }) => {
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

    test('keeps entry order and leaves plain options outside groups', async ({ page }) => {
      const order = await page.evaluate((sel) => {
        const root = document.querySelector(sel);
        return Array.from(root.querySelectorAll('[role="option"]')).map((o) => ({
          value: o.getAttribute('data-value'),
          index: Number(o.getAttribute('data-index')),
          group: o.closest('[role="group"]')
            ? document.getElementById(o.closest('[role="group"]').getAttribute('aria-labelledby')).textContent
            : null,
        }));
      }, GROUPED_LONG);

      expect(order).toEqual([
        { value: 'auto', index: 0, group: null },
        { value: 'gpt-6-luna', index: 1, group: 'OpenAI' },
        { value: 'gpt-6.2-sol', index: 2, group: 'OpenAI' },
        { value: 'gpt-6.1-terra', index: 3, group: 'OpenAI' },
        { value: 'gpt-6.2-astra', index: 4, group: 'OpenAI' },
        { value: 'claude-sonnet-5-5', index: 5, group: 'Anthropic' },
        { value: 'claude-haiku-5-5', index: 6, group: 'Anthropic' },
        { value: 'local-small', index: 7, group: 'Self-hosted' },
      ]);
    });

    test('skips empty groups and renders an unlabelled group as plain options', async ({ page }) => {
      const rendered = await page.evaluate(() => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        const dropdown = new window.Dropdown(host, {
          items: [
            { label: 'Empty', items: [] },
            { items: [{ value: 'plain', label: 'Plain' }] },
            { label: 'Named', items: [{ value: 'named', label: 'Named option' }] },
          ],
        });
        const result = {
          headings: Array.from(host.querySelectorAll('.dropdown-menu-group-label')).map((h) => h.textContent),
          options: Array.from(host.querySelectorAll('[role="option"]')).map((o) => ({
            value: o.getAttribute('data-value'),
            grouped: Boolean(o.closest('[role="group"]')),
          })),
        };
        dropdown.destroy();
        host.remove();
        return result;
      });

      expect(rendered).toEqual({
        headings: ['Named'],
        options: [
          { value: 'plain', grouped: false },
          { value: 'named', grouped: true },
        ],
      });
    });

    test('setValue, getValue and onSelect work with option values inside groups', async ({ page }) => {
      const result = await page.evaluate(() => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        const selections = [];
        const dropdown = new window.Dropdown(host, {
          items: [
            { value: 'auto', label: 'Automatic' },
            { label: 'OpenAI', items: [{ value: 'gpt-6-luna', label: 'GPT-6 Luna' }] },
          ],
          selectedValue: 'gpt-6-luna',
          onSelect: (value, item) => selections.push([value, item]),
        });
        const initialLabel = host.querySelector('.dropdown-toggle-label').textContent;
        dropdown.setValue('OpenAI'); // a group label is not a value
        const afterGroupLabel = dropdown.getValue();
        dropdown.setValue('auto');
        const afterPlain = dropdown.getValue();
        dropdown.setValue('gpt-6-luna');
        const out = {
          initialLabel,
          afterGroupLabel,
          afterPlain,
          final: dropdown.getValue(),
          finalLabel: host.querySelector('.dropdown-toggle-label').textContent,
          selections,
        };
        dropdown.destroy();
        host.remove();
        return out;
      });

      expect(result).toEqual({
        initialLabel: 'GPT-6 Luna',
        afterGroupLabel: 'gpt-6-luna',
        afterPlain: 'auto',
        final: 'gpt-6-luna',
        finalLabel: 'GPT-6 Luna',
        selections: [
          ['auto', { value: 'auto', label: 'Automatic' }],
          ['gpt-6-luna', { value: 'gpt-6-luna', label: 'GPT-6 Luna' }],
        ],
      });
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
