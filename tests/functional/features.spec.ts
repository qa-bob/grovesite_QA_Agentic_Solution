/**
 * tests/functional/features.spec.ts
 *
 * Functional tests for the Features page (/Features).
 * Note: The four main section headers (Secure Online Workspaces, Cloud Databases,
 * Project Management, Collaboration Tools) are rendered as CSS background images.
 * Tests focus on the text-based subsections and feature lists that ARE in the DOM.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Features Page @functional', () => {
  test.beforeEach(async ({ featuresPage }) => {
    await featuresPage.navigate();
    await featuresPage.page.waitForLoadState('networkidle');
  });

  // ── Page load ────────────────────────────────────────────────────────────────

  test('Features page loads with content @functional', async ({ featuresPage }) => {
    const loaded = await featuresPage.isLoaded();
    expect(loaded, 'Features page should render content').toBeTruthy();
  });

  test('Features page has a descriptive title @functional', async ({ featuresPage }) => {
    const title = await featuresPage.getTitle();
    expect(title.trim().length, 'Features page should have a non-empty <title>').toBeGreaterThan(0);
  });

  // ── Collaboration Tools (DOM text-based section) ───────────────────────────────

  test('Collaboration Tools section is present @functional', async ({ featuresPage }) => {
    const hasSection = await featuresPage.hasSection(/collaboration tools/i);
    expect(
      hasSection,
      '"Collaboration Tools" section should be present on the Features page'
    ).toBeTruthy();
  });

  // ── Feature subsections (h3 level, text-based) ────────────────────────────────

  test('features page lists security subsection @functional', async ({ featuresPage }) => {
    const bodyText = await featuresPage.page.locator('body').innerText();
    expect(bodyText, 'Features page should mention "Security" as a feature').toMatch(/security/i);
  });

  test('features page lists document management subsection @functional', async ({ featuresPage }) => {
    const bodyText = await featuresPage.page.locator('body').innerText();
    expect(bodyText, 'Features page should mention "Document Management"').toMatch(/document management/i);
  });

  test('features page lists project timelines subsection @functional', async ({ featuresPage }) => {
    const bodyText = await featuresPage.page.locator('body').innerText();
    expect(bodyText, 'Features page should mention "Project Timelines"').toMatch(/project timelines/i);
  });

  // ── Feature item count ────────────────────────────────────────────────────────

  test('features page has multiple feature items listed @functional', async ({ featuresPage }) => {
    const count = await featuresPage.getFeatureItemCount();
    expect(
      count,
      'Features page should list multiple individual feature items'
    ).toBeGreaterThan(4);
  });

  // ── Contact form ──────────────────────────────────────────────────────────────

  test('features page has a contact form @functional', async ({ contactPage }) => {
    const form = await contactPage.findContactForm();
    expect(
      form,
      'A contact form should be present on the features page'
    ).not.toBeNull();
  });
});
