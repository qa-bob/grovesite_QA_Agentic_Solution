/**
 * tests/navigation/footer-links.spec.ts
 *
 * Navigation tests for the site footer: legal pages, Free Trial, and Sign In.
 * Complements nav-links.spec.ts which only checks the primary nav bar.
 *
 * Tag: @navigation
 */

import { test, expect } from '@fixtures/site.fixture';
import { checkLink } from '@utils/link-checker';

test.describe('Footer Links @navigation', () => {
  test.beforeEach(async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
  });

  // ── Footer presence ──────────────────────────────────────────────────────────

  test('footer element is present on the homepage @navigation', async ({ page }) => {
    const footer = page.locator('footer, [role="contentinfo"]');
    const count = await footer.count();
    expect(count, 'Page should have a <footer> or role="contentinfo" element').toBeGreaterThan(0);
  });

  // ── Legal pages ───────────────────────────────────────────────────────────────

  test('Privacy Policy link is present and reachable @navigation', async ({ page, siteConfig }) => {
    const link = page.locator('a').filter({ hasText: /privacy policy/i }).first();
    const count = await link.count();
    expect(count, '"Privacy Policy" link should be present in the footer').toBeGreaterThan(0);

    const href = await link.getAttribute('href');
    expect(href, 'Privacy Policy link should have an href').not.toBeNull();

    const result = await checkLink(href!, siteConfig.url, page);
    expect(
      result.ok,
      `Privacy Policy link returned HTTP ${result.status} — expected 200`
    ).toBeTruthy();
  });

  test('Terms link is present and reachable @navigation', async ({ page, siteConfig }) => {
    const link = page.locator('a').filter({ hasText: /^terms$/i }).first();
    const count = await link.count();
    expect(count, '"Terms" link should be present in the footer').toBeGreaterThan(0);

    const href = await link.getAttribute('href');
    expect(href, 'Terms link should have an href').not.toBeNull();

    const result = await checkLink(href!, siteConfig.url, page);
    expect(
      result.ok,
      `Terms link returned HTTP ${result.status} — expected 200`
    ).toBeTruthy();
  });

  test('Acceptable Use Policy link is present and reachable @navigation', async ({ page, siteConfig }) => {
    const link = page.locator('a').filter({ hasText: /acceptable use/i }).first();
    const count = await link.count();
    expect(count, '"Acceptable Use Policy" link should be present in the footer').toBeGreaterThan(0);

    const href = await link.getAttribute('href');
    expect(href, 'Acceptable Use Policy link should have an href').not.toBeNull();

    const result = await checkLink(href!, siteConfig.url, page);
    expect(
      result.ok,
      `Acceptable Use Policy link returned HTTP ${result.status} — expected 200`
    ).toBeTruthy();
  });

  // ── Key footer CTAs ───────────────────────────────────────────────────────────

  test('"Free Trial" link is present in the footer @navigation', async ({ page }) => {
    const link = page.locator('a').filter({ hasText: /free trial/i });
    const count = await link.count();
    expect(count, '"Free Trial" link should appear in the footer').toBeGreaterThan(0);
  });

  test('"Book a Demo" appears in the footer @navigation', async ({ page }) => {
    const link = page.locator('a').filter({ hasText: /book a demo/i });
    const count = await link.count();
    expect(count, '"Book a Demo" link should appear in the footer').toBeGreaterThan(0);
  });

  // ── Sign In ───────────────────────────────────────────────────────────────────

  test('Sign In link is present and points to secure subdomain @navigation', async ({ page }) => {
    const signIn = page.locator('a').filter({ hasText: /sign in/i }).first();
    const count = await signIn.count();
    expect(count, '"Sign In" link should be present').toBeGreaterThan(0);

    const href = await signIn.getAttribute('href');
    expect(href, 'Sign In link should have an href').not.toBeNull();
    expect(
      href,
      'Sign In link should point to the secure subdomain (secure.grovesite.com)'
    ).toMatch(/secure\.grovesite\.com/i);
  });

  test('Sign In link destination is reachable @navigation', async ({ page, siteConfig }) => {
    const signIn = page.locator('a').filter({ hasText: /sign in/i }).first();
    if (await signIn.count() === 0) {
      test.skip(true, 'No Sign In link found');
      return;
    }

    const href = await signIn.getAttribute('href');
    if (!href) {
      test.skip(true, 'Sign In link has no href');
      return;
    }

    const result = await checkLink(href, siteConfig.url, page);
    expect(
      result.ok,
      `Sign In link (${href}) returned HTTP ${result.status} — expected 200`
    ).toBeTruthy();
  });

  // ── LinkedIn ──────────────────────────────────────────────────────────────────

  test('LinkedIn social link is present in the footer @navigation', async ({ page }) => {
    const linkedin = page.locator('a[href*="linkedin"]');
    const count = await linkedin.count();
    expect(count, 'A LinkedIn link should be present on the page').toBeGreaterThan(0);
  });
});
