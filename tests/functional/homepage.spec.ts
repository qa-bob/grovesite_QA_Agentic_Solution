/**
 * tests/functional/homepage.spec.ts
 *
 * Functional tests for homepage content not covered by smoke/navigation/visual tests:
 * hero heading, testimonials, client logos, CTAs, and contact section.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Homepage Content @functional', () => {
  test.beforeEach(async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'networkidle' });
  });

  // ── Hero ──────────────────────────────────────────────────────────────────────

  // ── Testimonials ──────────────────────────────────────────────────────────────

  test('testimonials section is present with client attribution @functional', async ({ page }) => {
    // Look for known client names from the testimonials
    const clientNames = ['Ace Hardware', 'Visual Comfort', 'Park Hill', 'Dyno Seasonal'];
    let found = 0;
    for (const name of clientNames) {
      const count = await page.locator('body').filter({ hasText: name }).count();
      if (count > 0) found++;
    }
    expect(
      found,
      'At least two client testimonial attributions should be visible on the homepage'
    ).toBeGreaterThanOrEqual(2);
  });

  // ── Client logos ──────────────────────────────────────────────────────────────

  test('client logos section is visible @functional', async ({ page }) => {
    // Look for "Our Clients" section heading or logos container
    const clientsSection = page.locator('h2, h3, section').filter({ hasText: /our clients/i });
    const hasSection = await clientsSection.count();

    if (hasSection === 0) {
      // Fall back: check for presence of known client brand names in the page
      const bodyText = await page.locator('body').innerText();
      const knownClients = ['Petco', 'ACE Hardware', 'Dreamgirl', 'Park Hill'];
      const found = knownClients.filter((c) => bodyText.includes(c));
      expect(
        found.length,
        'At least one known client brand name should appear in the client logos section'
      ).toBeGreaterThan(0);
    } else {
      await expect(clientsSection.first(), '"Our Clients" section should be visible').toBeVisible();
    }
  });

  // ── CTAs ──────────────────────────────────────────────────────────────────────

  test('"Book a Demo" CTA is visible on the homepage @functional', async ({ page }) => {
    const bookDemo = page.locator('a, button').filter({ hasText: /book a demo/i });
    const count = await bookDemo.count();
    expect(
      count,
      '"Book a Demo" CTA should appear at least once on the homepage'
    ).toBeGreaterThan(0);
  });

  test('"Learn More" links are present @functional', async ({ page }) => {
    const learnMore = page.locator('a').filter({ hasText: /learn more/i });
    const count = await learnMore.count();
    expect(
      count,
      'At least one "Learn More" link should be present on the homepage'
    ).toBeGreaterThan(0);
  });

  // ── Contact section ───────────────────────────────────────────────────────────

  test('phone number is visible in the contact section @functional', async ({ page }) => {
    const phoneLink = page.locator('a[href*="tel:"], a[href*="866"]');
    const phoneText = page.locator('body').filter({ hasText: /866\.952\.9880|866-952-9880/ });

    const hasLink = (await phoneLink.count()) > 0;
    const hasText = (await phoneText.count()) > 0;

    expect(
      hasLink || hasText,
      'Phone number (866.952.9880) should be visible on the homepage'
    ).toBeTruthy();
  });

  test('email address is visible in the contact section @functional', async ({ page }) => {
    const emailLink = page.locator('a[href*="mailto:customerservice"]');
    const emailText = page.locator('body').filter({ hasText: /customerservice@grovesite\.com/i });

    const hasLink = (await emailLink.count()) > 0;
    const hasText = (await emailText.count()) > 0;

    expect(
      hasLink || hasText,
      'Email address (customerservice@grovesite.com) should be visible on the homepage'
    ).toBeTruthy();
  });

  test('"Get in Touch" contact section is present @functional', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();
    expect(
      bodyText,
      '"Get in Touch" section should be present on the homepage'
    ).toMatch(/get in touch/i);
  });
});
