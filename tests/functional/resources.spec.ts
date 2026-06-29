/**
 * tests/functional/resources.spec.ts
 *
 * Functional tests for the Resources page (/Resources).
 * Verifies training content, YouTube link, Help Desk link, and how-to guides.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Resources Page @functional', () => {
  test.beforeEach(async ({ resourcesPage }) => {
    await resourcesPage.navigate();
    await resourcesPage.page.waitForLoadState('networkidle');
  });

  // ── Page load ────────────────────────────────────────────────────────────────

  test('Resources page loads with content @functional', async ({ resourcesPage }) => {
    const loaded = await resourcesPage.isLoaded();
    expect(loaded, 'Resources page should render a main heading').toBeTruthy();
  });

  test('Resources page has a descriptive title @functional', async ({ resourcesPage }) => {
    const title = await resourcesPage.getTitle();
    expect(title.trim().length, 'Resources page should have a non-empty <title>').toBeGreaterThan(0);
  });

  // ── Training resources ────────────────────────────────────────────────────────

  test('Training Resources section is present @functional', async ({ resourcesPage }) => {
    const hasTraining = await resourcesPage.trainingSection.count();
    expect(
      hasTraining,
      'A "Training Resources" section heading should be visible'
    ).toBeGreaterThan(0);
  });

  test('YouTube link is present @functional', async ({ resourcesPage }) => {
    const hasYouTube = await resourcesPage.hasYouTubeLink();
    expect(
      hasYouTube,
      'A link to the GroveSite YouTube channel should be present'
    ).toBeTruthy();
  });

  test('Watch Now CTA is visible @functional', async ({ resourcesPage }) => {
    const hasWatchNow = await resourcesPage.hasWatchNowButton();
    expect(
      hasWatchNow,
      'A "Watch Now" call-to-action link should be visible on the Resources page'
    ).toBeTruthy();
  });

  // ── Help desk ────────────────────────────────────────────────────────────────

  test('Help Desk access link (Sign In) is present @functional', async ({ resourcesPage }) => {
    const hasHelpDesk = await resourcesPage.hasHelpDeskLink();
    expect(
      hasHelpDesk,
      'A "Sign In" link for Help Desk access should be visible on the Resources page'
    ).toBeTruthy();
  });

  // ── How-to guides ─────────────────────────────────────────────────────────────

  test('how-to guide content is present @functional', async ({ resourcesPage }) => {
    const hasGuides = await resourcesPage.hasGuideContent();
    expect(
      hasGuides,
      'How-to guide topics (Edit, Customize, Enroll, Create) should be present on the Resources page'
    ).toBeTruthy();
  });
});
