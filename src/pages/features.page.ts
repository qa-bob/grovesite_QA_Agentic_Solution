import { type Page, type Locator } from '@playwright/test';
import type { SiteConfig } from '@site-types/site-config.types';
import { BasePage } from '@pages/base.page';

export class FeaturesPage extends BasePage {
  readonly sectionHeadings: Locator;
  readonly featureItems: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);
    this.sectionHeadings = page.locator('h2, h3');
    this.featureItems = page.locator('li, [class*="feature"], [class*="item"]');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/Features', { waitUntil: 'domcontentloaded' });
  }

  async hasSection(text: string | RegExp): Promise<boolean> {
    if (await this.sectionHeadings.filter({ hasText: text }).count() > 0) return true;
    // Fallback: CMS sites often use styled divs instead of semantic heading elements
    const bodyText = await this.page.locator('body').innerText();
    return typeof text === 'string'
      ? bodyText.toLowerCase().includes(text.toLowerCase())
      : text.test(bodyText);
  }

  async getSectionHeadings(): Promise<string[]> {
    const all = await this.sectionHeadings.all();
    return Promise.all(all.map(async (h) => (await h.textContent())?.trim() ?? ''));
  }

  async getFeatureItemCount(): Promise<number> {
    return this.featureItems.count();
  }

  async isLoaded(): Promise<boolean> {
    return (await this.sectionHeadings.count()) > 0;
  }
}
