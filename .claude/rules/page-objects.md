---
paths:
  - "src/pages/**/*.ts"
---

# Page Object Rules

These rules apply when writing or editing files in `src/pages/`.

## Class Structure

Every page class must:
1. Import `Page` and `Locator` from `@playwright/test`
2. Extend `BasePage` from `./base.page`
3. Declare all key elements as `readonly Locator` properties
4. Initialize all locators in the `constructor` via `page.locator(...)` or `page.getBy...()`
5. Expose user-action methods that return `Promise<void>` or typed data

## No Assertions

Never call `expect()` inside a page object method. Assertions belong in test specs. Page objects model *actions*, not *expectations*.

```typescript
// wrong
async clickCta(): Promise<void> {
  await this.ctaButton.click();
  await expect(this.page).toHaveURL(/thank-you/); // NO
}

// correct
async clickCta(): Promise<void> {
  await this.ctaButton.click();
  await this.waitForLoad();
}
```

## Readonly Locators

Locators are `readonly` to prevent callers from reassigning them:

```typescript
// correct
readonly heroHeading: Locator;

// wrong
heroHeading: Locator;
```

## Selector Priority

Choose selectors in this order:
1. `page.getByRole(...)` — most resilient
2. `page.getByLabel(...)` — great for form fields
3. `page.getByTestId(...)` — when data-testid exists
4. `page.getByText(...)` — unique visible text
5. `page.locator('[class*="semantic-keyword"]')` — partial class
6. `page.locator('h1').first()` — last resort

Avoid XPath, `:nth-child`, or exact class name strings.

## Constructor Pattern

```typescript
constructor(page: Page) {
  super(page);
  this.heroHeading = page.locator('h1');
  this.ctaButton = page.getByRole('link', { name: /get started/i });
  this.featureCards = page.locator('[class*="feature-card"]');
}
```

## Fixture Registration

After creating a new page class, immediately add it to `src/fixtures/site.fixture.ts`.
