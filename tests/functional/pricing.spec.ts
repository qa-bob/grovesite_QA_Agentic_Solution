/**
 * tests/functional/pricing.spec.ts
 *
 * Functional tests for the Pricing page (/Pricing).
 * Verifies all four plan tiers render, prices are visible, and CTAs are present.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Pricing Page @functional', () => {
  test.beforeEach(async ({ pricingPage }) => {
    await pricingPage.navigate();
    await pricingPage.page.waitForLoadState('load');
  });

  // ── Page load ────────────────────────────────────────────────────────────────

  test('pricing page loads with a title @functional', async ({ pricingPage }) => {
    const title = await pricingPage.getTitle();
    expect(title.trim().length, 'Pricing page should have a non-empty <title>').toBeGreaterThan(0);
  });

  // ── Tier visibility ──────────────────────────────────────────────────────────

  test('Basic pricing tier is visible @functional', async ({ pricingPage }) => {
    const hasBasic = await pricingPage.hasTier(/basic/i);
    expect(hasBasic, 'Basic tier heading should be visible on the pricing page').toBeTruthy();
  });

  test('Pro pricing tier is visible @functional', async ({ pricingPage }) => {
    const hasPro = await pricingPage.hasTier(/\bpro\b/i);
    expect(hasPro, 'Pro tier heading should be visible on the pricing page').toBeTruthy();
  });

  test('Pro Plus pricing tier is visible @functional', async ({ pricingPage }) => {
    const hasProPlus = await pricingPage.hasTier(/pro plus/i);
    expect(hasProPlus, 'Pro Plus tier heading should be visible on the pricing page').toBeTruthy();
  });

  test('Enterprise pricing tier is visible @functional', async ({ pricingPage }) => {
    const hasEnterprise = await pricingPage.hasTier(/enterprise/i);
    expect(hasEnterprise, 'Enterprise tier heading should be visible on the pricing page').toBeTruthy();
  });

  // ── Price display ────────────────────────────────────────────────────────────

  test('pricing page displays dollar amounts @functional', async ({ pricingPage }) => {
    const bodyText = await pricingPage.page.locator('body').innerText();
    expect(
      bodyText,
      'Pricing page body should contain at least one dollar amount'
    ).toMatch(/\$\d+/);
  });

  // ── CTAs ─────────────────────────────────────────────────────────────────────

  test('Get Started CTA is present for paid tiers @functional', async ({ pricingPage }) => {
    const ctaCount = await pricingPage.ctaButtons.count();
    expect(
      ctaCount,
      'At least one "Get Started" CTA should appear on the pricing page'
    ).toBeGreaterThan(0);
  });

  test('Enterprise tier has a Contact Sales CTA @functional', async ({ pricingPage }) => {
    const hasContactSales = await pricingPage.enterpriseCTA.count();
    expect(
      hasContactSales,
      'Enterprise tier should have a "Contact Sales" CTA'
    ).toBeGreaterThan(0);
  });

  // ── Contact form ─────────────────────────────────────────────────────────────

  test('contact form is present on pricing page @functional', async ({ contactPage, pricingPage }) => {
    const form = await contactPage.findContactForm();
    expect(
      form,
      'A contact form should be present on the pricing page'
    ).not.toBeNull();
  });
});
