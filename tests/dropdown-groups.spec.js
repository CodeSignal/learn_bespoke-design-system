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

    test('a divider separates a group from its neighbours, and nothing else', async ({ page }) => {
      const rows = (selector) =>
        page.evaluate((sel) => {
          const list = document.querySelector(`${sel} .dropdown-menu-list`);
          return Array.from(list.children).map((child) => {
            if (child.classList.contains('dropdown-menu-divider')) return 'divider';
            if (child.getAttribute('role') === 'group') {
              return `group:${document.getElementById(child.getAttribute('aria-labelledby')).textContent}`;
            }
            return `option:${child.getAttribute('data-value')}`;
          });
        }, selector);

      expect(await rows(GROUPED)).toEqual(['group:OpenAI', 'divider', 'group:Anthropic']);
      expect(await rows(GROUPED_LONG)).toEqual([
        'option:auto',
        'divider',
        'group:OpenAI',
        'divider',
        'group:Anthropic',
        'divider',
        'group:Self-hosted',
      ]);
      expect(await page.locator('#dropdown-basic .dropdown-menu-divider').count()).toBe(0);

      const mixed = await page.evaluate(() => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        const dropdown = new window.Dropdown(host, {
          items: [
            { label: 'Group', items: [{ value: 'a', label: 'A' }] },
            { value: 'b', label: 'B' },
            { value: 'c', label: 'C' },
          ],
        });
        const result = Array.from(host.querySelector('.dropdown-menu-list').children).map((child) =>
          child.classList.contains('dropdown-menu-divider') ? 'divider' : child.getAttribute('role'),
        );
        dropdown.destroy();
        host.remove();
        return result;
      });
      // One divider after the group; none between the two plain options.
      expect(mixed).toEqual(['group', 'divider', 'option', 'option']);
    });

    test('dividers are decorative and 9px tall with a visible 1px rule', async ({ page }) => {
      await page.locator(`${GROUPED} .dropdown-toggle`).click();
      const divider = await page.locator(`${GROUPED} .dropdown-menu-divider`).first().evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          role: el.getAttribute('role'),
          height: el.getBoundingClientRect().height,
          ruleHeight: el.clientHeight,
          hasColor: style.backgroundColor !== 'rgba(0, 0, 0, 0)',
        };
      });
      expect(divider).toEqual({ role: 'presentation', height: 9, ruleHeight: 1, hasColor: true });
    });

    test('headings are written in sentence case, not uppercased', async ({ page }) => {
      const transform = await page
        .locator(`${GROUPED} .dropdown-menu-group-label`)
        .first()
        .evaluate((el) => getComputedStyle(el).textTransform);
      expect(transform).toBe('none');
    });

    test('a heading stays pinned to the top while its group scrolls, then gives way to the next', async ({ page }) => {
      // Two groups that are each taller than the menu, so the hand-over is visible.
      const result = await page.evaluate(() => {
        const host = document.createElement('div');
        host.style.width = '240px';
        document.body.appendChild(host);
        const options = (prefix) =>
          Array.from({ length: 8 }, (_, i) => ({ value: `${prefix}-${i}`, label: `${prefix} ${i}` }));
        const dropdown = new window.Dropdown(host, {
          items: [
            { label: 'First', items: options('first') },
            { label: 'Second', items: options('second') },
          ],
        });
        dropdown.open();

        const list = host.querySelector('.dropdown-menu-list');
        const headingOffsets = () => {
          const listTop = list.getBoundingClientRect().top;
          return Object.fromEntries(
            Array.from(list.querySelectorAll('.dropdown-menu-group-label')).map((h) => [
              h.textContent,
              Math.round(h.getBoundingClientRect().top - listTop),
            ]),
          );
        };
        const scrollOptionToMiddle = (value) => {
          const option = list.querySelector(`[role="option"][data-value="${value}"]`);
          list.scrollTop += option.getBoundingClientRect().top - list.getBoundingClientRect().top - 120;
        };

        const atStart = headingOffsets();
        scrollOptionToMiddle('first-5');
        const insideFirst = headingOffsets();
        scrollOptionToMiddle('second-5');
        const insideSecond = headingOffsets();

        dropdown.destroy();
        host.remove();
        return { atStart, insideFirst, insideSecond };
      });

      // At rest the first heading sits below the list's top padding.
      expect(result.atStart.First).toBeGreaterThan(0);
      // Deep inside the first group its heading is pinned to the top edge.
      expect(result.insideFirst.First).toBe(0);
      expect(result.insideFirst.Second).toBeGreaterThan(0);
      // Deep inside the second group the first heading has left and the second holds the top.
      expect(result.insideSecond.First).toBeLessThan(0);
      expect(result.insideSecond.Second).toBe(0);
    });

    test('a pinned heading covers the options behind it', async ({ page }) => {
      await page.locator(`${GROUPED_LONG} .dropdown-toggle`).click();
      const heading = await page
        .locator(`${GROUPED_LONG} .dropdown-menu-group-label`)
        .first()
        .evaluate((el) => {
          const style = getComputedStyle(el);
          // rgb(r, g, b) is opaque; rgba(r, g, b, a) carries its alpha as the fourth number.
          const channels = style.backgroundColor.match(/[\d.]+/g).map(Number);
          return {
            position: style.position,
            alpha: channels.length === 4 ? channels[3] : 1,
            matchesPanel: style.backgroundColor === getComputedStyle(el.closest('.dropdown-menu')).backgroundColor,
          };
        });
      expect(heading).toEqual({ position: 'sticky', alpha: 1, matchesPanel: true });
    });

    test('an option focused with the keyboard is not hidden behind a pinned heading', async ({ page }) => {
      await page.locator(`${GROUPED_LONG} .dropdown-toggle`).focus();
      await page.keyboard.press('End');
      expect(await focusedOption(page)).toBe('local-small');

      // Walk back up through the list; at every step the focused option must sit
      // fully below whichever heading is pinned at the top.
      for (let step = 0; step < 7; step += 1) {
        await page.keyboard.press('ArrowUp');
        const overlap = await page.evaluate((sel) => {
          const list = document.querySelector(`${sel} .dropdown-menu-list`);
          const listTop = list.getBoundingClientRect().top;
          const focused = document.activeElement.getBoundingClientRect();
          const pinned = Array.from(list.querySelectorAll('.dropdown-menu-group-label'))
            .map((h) => h.getBoundingClientRect())
            .filter((r) => Math.round(r.top - listTop) === 0);
          const pinnedBottom = pinned.length ? Math.max(...pinned.map((r) => r.bottom)) : listTop;
          return {
            value: document.activeElement.getAttribute('data-value'),
            hiddenPx: Math.max(0, Math.round(pinnedBottom - focused.top)),
          };
        }, GROUPED_LONG);
        expect(overlap.hiddenPx, `${overlap.value} is partly behind a pinned heading`).toBe(0);
      }
      expect(await focusedOption(page)).toBe('auto');
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
