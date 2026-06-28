# Architecture — GroveSite QA Agentic Solution

## Overview

This test suite uses the **Page Object Model (POM)** pattern with standard OOP principles to create a maintainable, readable, and reusable automation layer. The architecture cleanly separates *what the page contains* (page objects) from *what we assert* (test specs).

```
Live Site (GroveSite)
        │
        ▼
  site.config.json  ←── Playwright Config reads baseURL
        │
        ▼
  Page Object Classes (src/pages/)
        │
        ▼
  Custom Fixtures (src/fixtures/)
        │
        ▼
  Test Specs (tests/)
```

---

## Page Object Model (POM)

### Why POM?

Without POM, a selector like `.hero-title` appears in every test that checks the homepage heading. When the site updates the class to `.hero-heading`, every test breaks. With POM, the selector lives in exactly one place (`home.page.ts`) and all tests share it via the page object.

### Class Hierarchy

```
BasePage (src/pages/base.page.ts)
├── HomePage
├── NavigationPage
├── ContactFormPage
└── <Feature>Page  ← one per discovered page
```

**`BasePage`** provides:
- `navigate(path)` — go to a path relative to `baseURL`
- `waitForLoad()` — wait for `domcontentloaded` + network idle
- `getTitle()` — return `document.title`
- `getConsoleErrors()` — collect JS errors during the test

**Page classes** add:
- `readonly Locator` properties for each key element
- Methods for user-intent actions (`clickPrimaryNav`, `openMobileMenu`, `fillContactField`)

### OOP Principles Applied

| Principle | How it's applied |
|-----------|-----------------|
| **Encapsulation** | Locators are `readonly` — callers cannot mutate them after construction |
| **Abstraction** | Tests call `homePage.clickGetStarted()`, not `page.locator('.hero-cta').click()` |
| **Inheritance** | All page objects inherit shared helpers from `BasePage` |
| **Single Responsibility** | Each class models one page; `BasePage` handles cross-cutting concerns |
| **Open/Closed** | Add a new page by adding a class — no changes to existing classes needed |

---

## Custom Fixtures

`src/fixtures/site.fixture.ts` wraps Playwright's `test` and `expect` to inject page objects:

```typescript
export const test = base.extend<SiteFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  navigationPage: async ({ page }, use) => {
    await use(new NavigationPage(page));
  },
  // ... one fixture per page class
});
```

Every spec file imports `test` and `expect` from this fixture rather than from `@playwright/test` directly. This ensures:
- Page objects are instantiated once per test with the correct `page` context
- Adding a new page object requires one change in one file
- TypeScript infers the correct types for fixture arguments

---

## Configuration

`site.config.json` is the single source of truth for the target site:

```json
{
  "name": "GroveSite",
  "url": "http://www.grovesite.com",
  "hasContactForm": true,
  "expectedNavItems": [],
  "viewports": ["desktop", "mobile", "tablet"],
  "skipVisual": false,
  "skipForms": false,
  "auth": { "required": false }
}
```

`playwright.config.ts` reads this file at startup and sets `baseURL`. All test files use `baseURL` via Playwright config — never a hardcoded string.

The `SITE_URL` environment variable can override the config URL for CI or staging runs.

---

## Test Projects (Browsers)

| Project | Emulates | Viewport |
|---------|----------|----------|
| `chromium-desktop` | Desktop Chrome | 1280×720 |
| `mobile-chrome` | Pixel 5 | 390×844 |
| `tablet` | iPad Mini | 768×1024 |

Visual tests run on all three. Smoke and navigation tests run on desktop only by default (configurable in `playwright.config.ts`).

---

## Reporters

Three reporters run simultaneously:

- **HTML** → `playwright-report/index.html` (open with `npm run report`)
- **JSON** → `test-results/results.json` (consumed by `/generate-report` skill)
- **List** → terminal output (human-readable during local runs)

---

## Visual Regression

Screenshots are stored in `__snapshots__/` using the path template:
```
{snapshotDir}/{testFilePath}/{arg}-{projectName}{ext}
```

Snapshots are platform-specific. CI runs on Linux; local runs may produce different pixel values. To avoid false failures:
- Commit only snapshots generated on the same OS as CI
- Use `/update-baseline` to regenerate after intentional design changes
- Visual test failures mean the site changed — confirm whether intentional before running baseline

---

## Utilities

| File | Purpose |
|------|---------|
| `src/utils/link-checker.ts` | HEAD-request each nav link; collect status codes |
| `src/utils/visual-helper.ts` | Pre-screenshot helpers: dismiss banners, pause animations |

---

## Global Setup

`global-setup.ts` runs before all tests and performs a reachability check against the target URL. If the site returns a non-2xx status, the test run aborts early with a clear error rather than failing every test with a timeout.
