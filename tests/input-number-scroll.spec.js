import { test, expect } from '@playwright/test';

/**
 * Optional input.js helper: wheel over a focused `.input[type="number"]`
 * must not change the value (browser default otherwise does).
 */

test.describe('number input scroll fix', () => {
  test('browser default: wheel changes a focused number input', async ({
    page,
  }) => {
    await page.setContent(`<!DOCTYPE html>
<html lang="en"><body style="min-height:2000px">
  <input type="number" class="input" id="bare" value="50" />
</body></html>`);

    const input = page.locator('#bare');
    await input.focus();
    await input.hover();
    await page.mouse.wheel(0, 120);

    await expect(input).not.toHaveValue('50');
  });

  test('with input.js: wheel leaves value unchanged and blurs the field', async ({
    page,
  }) => {
    await page.goto('/components/input/test.html');
    await page.waitForFunction(
      () => typeof window.preventNumberInputScroll === 'function',
    );

    const input = page.locator('#input-numeric-with-value');
    await expect(input).toHaveValue('100');
    await input.focus();
    await expect(input).toBeFocused();

    await input.hover();
    await page.mouse.wheel(0, 120);

    await expect(input).toHaveValue('100');
    await expect(input).not.toBeFocused();
  });

  test('with input.js: dynamically added number inputs are covered', async ({
    page,
  }) => {
    await page.goto('/components/input/test.html');
    await page.waitForFunction(
      () => typeof window.preventNumberInputScroll === 'function',
    );

    await page.evaluate(() => {
      const el = document.createElement('input');
      el.type = 'number';
      el.className = 'input';
      el.id = 'input-numeric-dynamic';
      el.value = '25';
      document.body.appendChild(el);
    });

    const input = page.locator('#input-numeric-dynamic');
    await input.focus();
    await input.hover();
    await page.mouse.wheel(0, -120);

    await expect(input).toHaveValue('25');
    await expect(input).not.toBeFocused();
  });
});
