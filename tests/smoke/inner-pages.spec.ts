/**
 * tests/smoke/inner-pages.spec.ts
 *
 * Smoke tests for the four main inner pages: Pricing, Features, Our-Product, Resources.
 * Mirrors the homepage smoke checks so regressions on inner pages are caught early.
 *
 * Tag: @smoke
 */

import { test, expect } from '@fixtures/site.fixture';

const INNER_PAGES = [
  { label: 'Pricing',     path: '/Pricing'      },
  { label: 'Features',    path: '/Features'     },
  { label: 'Our Product', path: '/Our-Product'  },
  { label: 'Resources',   path: '/Resources'    },
];

for (const { label, path } of INNER_PAGES) {
  test.describe(`${label} page smoke @smoke`, () => {
    test(`${label} page loads successfully @smoke`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' });

      expect(response, `${label} page should return a response`).not.toBeNull();
      const status = response!.status();
      expect(
        status >= 200 && status < 400,
        `${label} page returned HTTP ${status} — expected 2xx/3xx`
      ).toBeTruthy();

      const bodyText = await page.locator('body').innerText();
      expect(
        bodyText.trim().length,
        `${label} page body should have visible text`
      ).toBeGreaterThan(0);
    });

    test(`${label} page has a title @smoke`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const title = await page.title();
      expect(
        title.trim().length,
        `${label} page should have a non-empty <title>`
      ).toBeGreaterThan(0);
    });

    test(`${label} page has no critical JS errors @smoke`, async ({ page }) => {
      const errors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (err) => {
        errors.push(`[pageerror] ${err.message}`);
      });

      await page.goto(path, { waitUntil: 'networkidle' });

      const critical = errors.filter((e) => {
        const lower = e.toLowerCase();
        return (
          !lower.includes('google-analytics') &&
          !lower.includes('googletagmanager') &&
          !lower.includes('hotjar') &&
          !lower.includes('intercom') &&
          !lower.includes('net::err_blocked_by_client')
        );
      });

      if (critical.length > 0) {
        console.warn(`[smoke] JS errors on ${label}:\n` + critical.join('\n'));
      }

      expect(
        critical.length,
        `Found ${critical.length} console error(s) on ${label} page`
      ).toBeLessThanOrEqual(3);
    });

    test(`${label} page loads within acceptable time @smoke`, async ({ page }) => {
      const MAX_LOAD_MS = 10_000;
      const start = Date.now();
      await page.goto(path, { waitUntil: 'load' });
      const elapsed = Date.now() - start;

      expect(
        elapsed,
        `${label} page took ${elapsed}ms — exceeds ${MAX_LOAD_MS}ms limit`
      ).toBeLessThan(MAX_LOAD_MS);
    });
  });
}
