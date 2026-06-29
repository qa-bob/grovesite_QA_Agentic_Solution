import { type Page, type Locator } from '@playwright/test';
import type { SiteConfig } from '@site-types/site-config.types';
import { BasePage } from '@pages/base.page';

export class PricingPage extends BasePage {
  readonly tierHeadings: Locator;
  readonly ctaButtons: Locator;
  readonly enterpriseCTA: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);
    this.tierHeadings = page.locator('h2, h3').filter({ hasText: /^(basic|pro\b|pro plus|enterprise)$/i });
    this.ctaButtons = page.getByRole('button', { name: /get started now/i });
    this.enterpriseCTA = page.getByRole('button', { name: /contact sales/i });
  }

  async navigate(): Promise<void> {
    await this.page.goto('/Pricing', { waitUntil: 'domcontentloaded' });
  }

  async getTierNames(): Promise<string[]> {
    const headings = await this.tierHeadings.all();
    return Promise.all(headings.map(async (h) => (await h.textContent())?.trim() ?? ''));
  }

  async getTierCount(): Promise<number> {
    return this.tierHeadings.count();
  }

  async hasTier(name: string | RegExp): Promise<boolean> {
    return (await this.page.locator('h2, h3').filter({ hasText: name }).count()) > 0;
  }

  async hasPriceVisible(): Promise<boolean> {
    return (await this.page.locator('body').filter({ hasText: /\$\d+/ }).count()) > 0;
  }

  async isLoaded(): Promise<boolean> {
    return (await this.page.locator('h1, h2').count()) > 0;
  }
}
