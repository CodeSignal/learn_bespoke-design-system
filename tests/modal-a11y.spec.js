import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from './helpers/a11y.js';

/**
 * D8: unique `modal-title-${n}` per instance, wired through aria-labelledby.
 * D10: document keydown listeners attach on open and detach on close; Escape
 *      closes only the topmost stacked modal.
 * D11: in-modal hash links honor prefers-reduced-motion.
 */

async function createModal(page, options) {
  return page.evaluate((opts) => {
    const modal = new window.Modal(opts);
    if (!window.__testModals) window.__testModals = [];
    window.__testModals.push(modal);
    return window.__testModals.length - 1;
  }, options);
}

async function modalState(page, index) {
  return page.evaluate((i) => {
    const modal = window.__testModals[i];
    const title = modal.title;
    return {
      isOpen: modal.isOpen,
      titleId: title?.id ?? null,
      labelledBy: modal.overlay.getAttribute('aria-labelledby'),
      overlayOpen: modal.overlay.classList.contains('open'),
      listenersBound: modal.documentListenersBound,
    };
  }, index);
}

async function destroyTestModals(page) {
  await page.evaluate(() => {
    (window.__testModals || []).forEach((m) => m.destroy());
    window.__testModals = [];
  });
}

test.describe('modal a11y hygiene (D8 / D10 / D11)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/modal/test.html');
    await page.waitForFunction(() => typeof window.Modal === 'function');
  });

  test.afterEach(async ({ page }) => {
    await destroyTestModals(page);
  });

  test('each instance gets a unique title id wired to aria-labelledby', async ({
    page,
  }) => {
    const a = await createModal(page, { title: 'Settings', content: '<p>A</p>' });
    const b = await createModal(page, { title: 'Confirm', content: '<p>B</p>' });

    const stateA = await modalState(page, a);
    const stateB = await modalState(page, b);

    expect(stateA.titleId).toMatch(/^modal-title-\d+$/);
    expect(stateB.titleId).toMatch(/^modal-title-\d+$/);
    expect(stateA.titleId).not.toBe(stateB.titleId);
    expect(stateA.labelledBy).toBe(stateA.titleId);
    expect(stateB.labelledBy).toBe(stateB.titleId);

    const duplicateScan = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll('.modal-title')).map(
        (el) => el.id,
      );
      return { ids, uniqueCount: new Set(ids).size };
    });
    expect(duplicateScan.uniqueCount).toBe(duplicateScan.ids.length);
    expect(duplicateScan.ids).toContain(stateA.titleId);
    expect(duplicateScan.ids).toContain(stateB.titleId);
  });

  test('updateTitle on a title-less modal assigns the instance id', async ({
    page,
  }) => {
    const index = await createModal(page, {
      title: null,
      content: '<p>No title yet</p>',
      footerButtons: [{ label: 'Close', type: 'primary' }],
    });

    let state = await modalState(page, index);
    expect(state.titleId).toBeNull();
    expect(state.labelledBy).toBeNull();

    await page.evaluate((i) => {
      window.__testModals[i].updateTitle('Added later');
    }, index);

    state = await modalState(page, index);
    expect(state.titleId).toMatch(/^modal-title-\d+$/);
    expect(state.labelledBy).toBe(state.titleId);
  });

  test('Escape closes only the top stacked modal', async ({ page }) => {
    const a = await createModal(page, {
      title: 'Bottom',
      content: '<p>Bottom modal</p>',
    });
    const b = await createModal(page, {
      title: 'Top',
      content: '<p>Top modal</p>',
    });

    await page.evaluate((i) => window.__testModals[i].open(), a);
    await page.evaluate((i) => window.__testModals[i].open(), b);

    expect((await modalState(page, a)).isOpen).toBe(true);
    expect((await modalState(page, b)).isOpen).toBe(true);

    await page.keyboard.press('Escape');

    expect((await modalState(page, b)).isOpen).toBe(false);
    expect((await modalState(page, a)).isOpen).toBe(true);

    await page.keyboard.press('Escape');

    expect((await modalState(page, a)).isOpen).toBe(false);
    expect((await modalState(page, b)).isOpen).toBe(false);
  });

  test('close detaches document keydown listeners; reopen reattaches', async ({
    page,
  }) => {
    const index = await createModal(page, {
      title: 'Once',
      content: '<p>Listener lifecycle</p>',
    });

    expect((await modalState(page, index)).listenersBound).toBe(false);

    await page.evaluate((i) => window.__testModals[i].open(), index);
    expect((await modalState(page, index)).listenersBound).toBe(true);

    await page.evaluate((i) => window.__testModals[i].close(), index);
    expect((await modalState(page, index)).listenersBound).toBe(false);

    await page.evaluate((i) => window.__testModals[i].open(), index);
    expect((await modalState(page, index)).listenersBound).toBe(true);
  });

  test('hash links use smooth scroll by default', async ({ page }) => {
    await page.evaluate(() => {
      const orig = Element.prototype.scrollIntoView;
      window.__scrollIntoViewCalls = [];
      Element.prototype.scrollIntoView = function scrollIntoViewSpy(opts) {
        window.__scrollIntoViewCalls.push(
          opts && typeof opts === 'object' ? { ...opts } : opts,
        );
        return orig.apply(this, arguments);
      };
    });

    await page.evaluate(() => {
      const template = document.querySelector('#help-modal-template');
      const modal = window.Modal.createHelpModal({
        title: 'Help',
        content: template.content.cloneNode(true),
      });
      window.__testModals = [modal];
      modal.open();
    });

    await page.locator('.modal-overlay.open a[href="#features"]').click();

    const calls = await page.evaluate(() => window.__scrollIntoViewCalls);
    expect(calls.some((c) => c?.behavior === 'smooth')).toBe(true);
  });

  test('hash links skip smooth scroll when reduced motion is requested', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => {
      const orig = Element.prototype.scrollIntoView;
      window.__scrollIntoViewCalls = [];
      Element.prototype.scrollIntoView = function scrollIntoViewSpy(opts) {
        window.__scrollIntoViewCalls.push(
          opts && typeof opts === 'object' ? { ...opts } : opts,
        );
        return orig.apply(this, arguments);
      };
    });

    await page.evaluate(() => {
      const template = document.querySelector('#help-modal-template');
      const modal = window.Modal.createHelpModal({
        title: 'Help',
        content: template.content.cloneNode(true),
      });
      window.__testModals = [modal];
      modal.open();
    });

    await page.locator('.modal-overlay.open a[href="#features"]').click();

    const calls = await page.evaluate(() => window.__scrollIntoViewCalls);
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.every((c) => c?.behavior !== 'smooth')).toBe(true);
    expect(calls.some((c) => c?.behavior === 'auto')).toBe(true);
  });
});

for (const colorScheme of ['light', 'dark']) {
  test.describe(`modal axe — ${colorScheme}`, () => {
    test.use({ colorScheme });

    test('open titled modal has no axe violations', async ({ page }) => {
      await page.goto('/components/modal/test.html');
      await page.waitForFunction(() => typeof window.Modal === 'function');

      await page.evaluate(() => {
        const modal = new window.Modal({
          title: 'Settings',
          content: '<p class="body-medium">Temperature and thinking.</p>',
          footerButtons: [{ label: 'Close', type: 'primary' }],
        });
        window.__testModals = [modal];
        modal.open();
      });

      await expectNoAxeViolations(page, '.modal-overlay.open');
      await page.evaluate(() => {
        (window.__testModals || []).forEach((m) => m.destroy());
        window.__testModals = [];
      });
    });
  });
}
