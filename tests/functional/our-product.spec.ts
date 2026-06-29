/**
 * tests/functional/our-product.spec.ts
 *
 * Functional tests for the Our Product page (/Our-Product).
 * Verifies all three product category sections render and tab navigation works.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Our Product Page @functional', () => {
  test.beforeEach(async ({ productPage }) => {
    await productPage.navigate();
    await productPage.page.waitForLoadState('networkidle');
  });

  // ── Page load ────────────────────────────────────────────────────────────────

  test('Our Product page loads with content @functional', async ({ productPage }) => {
    const loaded = await productPage.isLoaded();
    expect(loaded, 'Our Product page should render at least one heading').toBeTruthy();
  });

  // ── Product sections ─────────────────────────────────────────────────────────

  test('Product Lifecycle Management section is present @functional', async ({ productPage }) => {
    const hasSection = await productPage.hasSection(/product lifecycle management/i);
    expect(
      hasSection,
      '"Product Lifecycle Management" section heading should be visible'
    ).toBeTruthy();
  });

  test('Quality Management section is present @functional', async ({ productPage }) => {
    const hasSection = await productPage.hasSection(/quality management/i);
    expect(
      hasSection,
      '"Quality Management" section heading should be visible'
    ).toBeTruthy();
  });

  test('Cloud Collaboration section is present @functional', async ({ productPage }) => {
    const hasSection = await productPage.hasSection(/cloud collaboration/i);
    expect(
      hasSection,
      '"Cloud Collaboration" section heading should be visible'
    ).toBeTruthy();
  });

  // ── Tab navigation ───────────────────────────────────────────────────────────

  test('page has tab or section navigation elements @functional', async ({ productPage }) => {
    const tabCount = await productPage.getTabCount();

    if (tabCount === 0) {
      // If no role="tab" elements, verify the three sections are all visible without tabs
      const headings = await productPage.getSectionHeadings();
      const hasPlm = headings.some((h) => /product lifecycle/i.test(h));
      const hasQm = headings.some((h) => /quality management/i.test(h));
      const hasCollab = headings.some((h) => /cloud collaboration/i.test(h));
      expect(
        hasPlm && hasQm && hasCollab,
        'Without tabs, all three product sections should be simultaneously visible'
      ).toBeTruthy();
    } else {
      expect(
        tabCount,
        `Expected at least 3 tab elements, found ${tabCount}`
      ).toBeGreaterThanOrEqual(3);
    }
  });

  test('clicking a product tab reveals content @functional', async ({ productPage }) => {
    const tabCount = await productPage.getTabCount();
    if (tabCount === 0) {
      test.skip(true, 'No role="tab" elements detected — page uses static sections');
      return;
    }

    await productPage.clickTab(0);
    const bodyText = await productPage.page.locator('body').innerText();
    expect(bodyText.trim().length, 'Page body should have content after clicking a tab').toBeGreaterThan(100);
  });
});
