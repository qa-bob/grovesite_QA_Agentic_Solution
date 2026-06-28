# Test Writing Guide

This guide covers everything you need to write a new test for this suite — from picking the right category to selector strategy to common patterns.

---

## Before You Write Anything

1. **Read `site.config.json`** — know the URL and which flags are set (`skipForms`, `skipVisual`, `auth.required`)
2. **Inspect the live page** — use DevTools or `WebFetch` in Claude Code to see real HTML before writing selectors
3. **Find the right page object** — check `src/pages/` for an existing class; add to it rather than creating a new one unless you need a new page

---

## Test Structure

Every spec file follows this pattern:

```typescript
import { test, expect } from '@fixtures/site.fixture';

test.describe('Feature Name @tag', () => {
  test.beforeEach(async ({ pageObject }) => {
    await pageObject.navigate('/path');
  });

  test('should do something specific', async ({ pageObject }) => {
    await expect(pageObject.someLocator).toBeVisible();
  });
});
```

Key points:
- Import from `@fixtures/site.fixture`, never `@playwright/test` directly
- `test.describe` label includes the tag (e.g., `@functional`) for the whole describe block
- Individual tests can add more specific tags
- `beforeEach` handles navigation so each test is independent

---

## Deciding Which Category

| Question | Tag |
|----------|-----|
| Does it verify the site is up and basic content loads? | `@smoke` |
| Does it click a nav link or verify routing? | `@navigation` |
| Does it interact with a form field? | `@forms` |
| Does it verify a business feature (pricing, features list, FAQ)? | `@functional` |
| Does it compare a screenshot? | `@visual` |
| Does it check layout at a specific viewport? | `@responsive` |

A test can have multiple tags: `@functional @smoke` for a pricing page basic load test.

---

## Writing Smoke Tests

Smoke tests answer: "Is the site alive and basically working?"

```typescript
test('homepage loads with 200 status @smoke', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
});

test('page title is not empty @smoke', async ({ page, homePage }) => {
  await homePage.navigate('/');
  const title = await homePage.getTitle();
  expect(title.length).toBeGreaterThan(0);
});

test('no console errors on load @smoke', async ({ page, homePage }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await homePage.navigate('/');
  expect(errors).toHaveLength(0);
});
```

---

## Writing Navigation Tests

Navigation tests verify links route to the correct destination.

```typescript
test('primary nav links are all reachable @navigation', async ({ navigationPage }) => {
  await navigationPage.navigate('/');
  const brokenLinks = await navigationPage.checkNavLinks();
  expect(brokenLinks).toHaveLength(0);
});

test('mobile menu opens on small viewport @navigation', async ({ page, navigationPage }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await navigationPage.navigate('/');
  await navigationPage.openMobileMenu();
  await expect(navigationPage.mobileMenu).toBeVisible();
});
```

---

## Writing Form Tests

Form tests verify fields render and validate — **never** submit the form.

```typescript
test('contact form renders with expected fields @forms', async ({ contactPage }) => {
  await contactPage.navigate('/contact');
  await expect(contactPage.nameField).toBeVisible();
  await expect(contactPage.emailField).toBeVisible();
  await expect(contactPage.messageField).toBeVisible();
});

test('email field rejects invalid format @forms', async ({ contactPage, page }) => {
  await contactPage.navigate('/contact');
  await contactPage.emailField.fill('not-an-email');
  await contactPage.emailField.blur();
  // Check for validation message — do NOT click submit
  await expect(page.locator('[class*="error"], [aria-invalid="true"]')).toBeVisible();
});

test('required fields have accessible labels @forms', async ({ contactPage }) => {
  await contactPage.navigate('/contact');
  // Each input should have an associated label
  await expect(contactPage.nameField).toHaveAttribute('id');
  const id = await contactPage.nameField.getAttribute('id');
  await expect(contactPage.page.locator(`label[for="${id}"]`)).toBeVisible();
});
```

---

## Writing Functional Tests

Functional tests verify business-logic features on specific pages.

```typescript
// tests/functional/features.spec.ts
test.describe('Features Page @functional', () => {
  test.beforeEach(async ({ featuresPage }) => {
    await featuresPage.navigate('/features');
  });

  test('all feature cards are visible', async ({ featuresPage }) => {
    const count = await featuresPage.featureCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('each feature card has a heading and description', async ({ featuresPage }) => {
    const cards = featuresPage.featureCards;
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i).locator('h2, h3')).toBeVisible();
      await expect(cards.nth(i).locator('p')).not.toBeEmpty();
    }
  });
});
```

---

## Writing Visual Tests

Visual tests capture screenshots and compare against baselines.

```typescript
import { test, expect } from '@fixtures/site.fixture';

test.describe('Visual Regression @visual', () => {
  test('homepage desktop baseline', async ({ page, homePage }) => {
    await homePage.navigate('/');
    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
```

Run `/update-baseline` to capture baselines. Visual tests skip (not fail) when no baseline exists yet.

---

## Writing Responsive Tests

Responsive tests check layout at specific viewport sizes.

```typescript
test('nav collapses to hamburger at 390px @responsive', async ({ page, navigationPage }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await navigationPage.navigate('/');
  await expect(navigationPage.hamburgerButton).toBeVisible();
  await expect(navigationPage.desktopNav).not.toBeVisible();
});

test('no horizontal scroll at 390px @responsive', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});
```

---

## Adding a New Page Object

1. Create `src/pages/<name>.page.ts`:

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class PricingPage extends BasePage {
  readonly planCards: Locator;
  readonly planHeadings: Locator;
  readonly ctaButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.planCards = page.locator('[class*="plan"], [class*="pricing-card"]');
    this.planHeadings = this.planCards.locator('h2, h3');
    this.ctaButtons = this.planCards.getByRole('link');
  }
}
```

2. Add it to `src/fixtures/site.fixture.ts`:

```typescript
pricingPage: async ({ page }, use) => {
  await use(new PricingPage(page));
},
```

3. Write tests in `tests/functional/pricing.spec.ts`

---

## Selector Priority

1. `getByRole` — most resilient, tests accessibility too
2. `getByLabel` — great for form fields
3. `getByTestId` — when `data-testid` attributes exist
4. `getByText` — for unique visible text
5. `locator('[class*="semantic-keyword"]')` — partial class match
6. `locator('h1')` + `.first()` — last resort

Avoid XPath, `:nth-child`, or full class names that encode design tokens.

---

## Common Pitfalls

| Mistake | Fix |
|---------|-----|
| `await page.waitForTimeout(2000)` | Use `await expect(locator).toBeVisible()` instead |
| `page.locator('.exact-class-name')` | Use `[class*="keyword"]` or role selectors |
| Hardcoded URL `'https://grovesite.com/pricing'` | Use `await page.goto('/pricing')` with baseURL |
| `expect()` inside a page object method | Move to the test spec |
| Testing after form submission | Stop at field interaction and validation |
