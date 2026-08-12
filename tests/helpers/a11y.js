import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** WCAG tags aligned with the ChatCPT audit harness. */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * Run axe against a scoped selector and fail on any violations.
 * Theme is controlled by Playwright `colorScheme` / `emulateMedia`.
 */
export async function expectNoAxeViolations(page, includeSelector) {
  const builder = new AxeBuilder({ page }).withTags(TAGS);
  if (includeSelector) builder.include(includeSelector);
  const results = await builder.analyze();
  expect(results.violations, formatViolations(results.violations)).toEqual([]);
}

function formatViolations(violations) {
  if (!violations?.length) return 'axe violations';
  return violations
    .map((v) => {
      const nodes = v.nodes.map((n) => n.target.join(' ')).join('; ');
      return `${v.id} (${v.impact}): ${v.help} — ${nodes}`;
    })
    .join('\n');
}
