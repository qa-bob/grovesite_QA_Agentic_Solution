import { type Page, type Locator } from '@playwright/test';
import type { SiteConfig } from '@site-types/site-config.types';
import { BasePage } from '@pages/base.page';

export class ResourcesPage extends BasePage {
  readonly mainHeading: Locator;
  readonly youtubeLink: Locator;
  readonly watchNowButton: Locator;
  readonly helpDeskLink: Locator;
  readonly trainingSection: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);
    this.mainHeading = page.locator('h1, h2').first();
    this.youtubeLink = page.locator('a[href*="youtube"]');
    this.watchNowButton = page.getByRole('link', { name: /watch now/i });
    // Help Desk is accessed via a "Sign In" link on the resources page
    this.helpDeskLink = page.getByRole('link', { name: /sign in/i });
    this.trainingSection = page.locator('h2, h3').filter({ hasText: /training/i });
  }

  async navigate(): Promise<void> {
    await this.page.goto('/Resources', { waitUntil: 'domcontentloaded' });
  }

  async hasYouTubeLink(): Promise<boolean> {
    return (await this.youtubeLink.count()) > 0;
  }

  async hasWatchNowButton(): Promise<boolean> {
    return (await this.watchNowButton.count()) > 0;
  }

  async hasHelpDeskLink(): Promise<boolean> {
    return (await this.helpDeskLink.count()) > 0;
  }

  async hasGuideContent(): Promise<boolean> {
    const bodyText = await this.page.locator('body').innerText();
    return /edit information|customize site|enroll members|create new/i.test(bodyText);
  }

  async isLoaded(): Promise<boolean> {
    return (await this.mainHeading.count()) > 0;
  }
}
