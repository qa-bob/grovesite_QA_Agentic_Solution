import { test as base, expect } from '@playwright/test';
import { loadSiteConfig, type SiteConfig } from '@site-types/site-config.types';
import { HomePage } from '@pages/home.page';
import { NavigationPage } from '@pages/navigation.page';
import { ContactFormPage } from '@pages/contact.page';
import { PricingPage } from '@pages/pricing.page';
import { ProductPage } from '@pages/product.page';
import { FeaturesPage } from '@pages/features.page';
import { ResourcesPage } from '@pages/resources.page';

// ── Fixture type definitions ─────────────────────────────────────────────────

export interface Fixtures {
  siteConfig: SiteConfig;
  homePage: HomePage;
  navigationPage: NavigationPage;
  contactPage: ContactFormPage;
  pricingPage: PricingPage;
  productPage: ProductPage;
  featuresPage: FeaturesPage;
  resourcesPage: ResourcesPage;
}

// ── Extended test object ─────────────────────────────────────────────────────

export const test = base.extend<Fixtures>({
  siteConfig: async ({}, use) => {
    const config = loadSiteConfig();
    await use(config);
  },

  homePage: async ({ page, siteConfig }, use) => {
    const homePage = new HomePage(page, siteConfig);
    await homePage.navigate();
    await use(homePage);
  },

  navigationPage: async ({ page, siteConfig }, use) => {
    const navigationPage = new NavigationPage(page, siteConfig);
    await use(navigationPage);
  },

  contactPage: async ({ page, siteConfig }, use) => {
    const contactPage = new ContactFormPage(page, siteConfig);
    await use(contactPage);
  },

  pricingPage: async ({ page, siteConfig }, use) => {
    const pricingPage = new PricingPage(page, siteConfig);
    await use(pricingPage);
  },

  productPage: async ({ page, siteConfig }, use) => {
    const productPage = new ProductPage(page, siteConfig);
    await use(productPage);
  },

  featuresPage: async ({ page, siteConfig }, use) => {
    const featuresPage = new FeaturesPage(page, siteConfig);
    await use(featuresPage);
  },

  resourcesPage: async ({ page, siteConfig }, use) => {
    const resourcesPage = new ResourcesPage(page, siteConfig);
    await use(resourcesPage);
  },
});

export { expect };
