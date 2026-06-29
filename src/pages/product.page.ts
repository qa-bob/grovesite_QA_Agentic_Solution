import { type Page, type Locator } from '@playwright/test';
import type { SiteConfig } from '@site-types/site-config.types';
import { BasePage } from '@pages/base.page';

export class ProductPage extends BasePage {
  readonly mainHeading: Locator;
  readonly tabs: Locator;
  readonly sectionHeadings: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);
    this.mainHeading = page.locator('h1, h2').first();
    // role="tab" is the semantic choice; fall back to common class patterns
    this.tabs = page.locator('[role="tab"], [class*="tab-"]:not([class*="table"]), [class*="-tab"]:not([class*="table"])');
    this.sectionHeadings = page.locator('h2, h3');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/Our-Product', { waitUntil: 'domcontentloaded' });
  }

  async getTabCount(): Promise<number> {
    return this.tabs.count();
  }

  async getTabNames(): Promise<string[]> {
    const all = await this.tabs.all();
    return Promise.all(all.map(async (t) => (await t.textContent())?.trim() ?? ''));
  }

  async clickTab(index: number): Promise<void> {
    await this.tabs.nth(index).click();
    await this.page.waitForLoadState('networkidle');
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

  async isLoaded(): Promise<boolean> {
    return (await this.mainHeading.count()) > 0;
  }
}
