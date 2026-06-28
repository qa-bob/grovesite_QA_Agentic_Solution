# Contributing to GroveSite QA Agentic Solution

Thanks for contributing to this test suite. This document covers the rules every contributor (human or AI) must follow.

---

## Golden Rules

1. **Never submit a form.** Test field interactions, input validation, and accessibility — not submission outcomes.
2. **Never create accounts or enter real credentials.** If `auth.required` is false in `site.config.json`, skip all auth flows.
3. **Never hardcode the base URL.** Always use `baseURL` from Playwright config, which reads from `site.config.json`.
4. **No assertions inside page objects.** Page objects are actions; tests are assertions.
5. **No `waitForTimeout` over 500ms.** Use Playwright's built-in auto-waiting or `waitForSelector`.
6. **No `any` type without a comment.** Strict TypeScript is enforced. Explain every exception.

---

## Branching

- `main` — stable, always green CI
- Feature branches: `feat/<description>`
- Bug fixes: `fix/<description>`
- Test additions: `test/<description>`

Open a PR against `main`. Squash merge preferred.

---

## Before Opening a PR

```bash
npm run typecheck    # Zero TypeScript errors
npm run lint         # Zero ESLint errors
npm run test:smoke   # All smoke tests pass
```

Visual tests (`@visual`) may fail if `__snapshots__/` is out of date. Run `/update-baseline` and review the diffs before committing updated snapshots.

---

## Writing Page Objects

Page objects live in `src/pages/`. One class per page or major section.

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ExamplePage extends BasePage {
  readonly heroHeading: Locator;
  readonly ctaButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heroHeading = page.locator('h1');
    this.ctaButton = page.getByRole('link', { name: /get started/i });
  }

  async clickCta(): Promise<void> {
    await this.ctaButton.click();
    await this.waitForLoad();
  }
}
```

Rules:
- Extend `BasePage`
- `readonly Locator` properties only — no reassignment after construction
- Methods represent user intent, not DOM operations
- No `expect()` in page objects

After creating a class, add it to `src/fixtures/site.fixture.ts`.

---

## Writing Tests

Tests live in `tests/<category>/`. Import from the custom fixture:

```typescript
import { test, expect } from '@fixtures/site.fixture';

test.describe('Example Page @functional', () => {
  test.beforeEach(async ({ examplePage }) => {
    await examplePage.navigate('/example');
  });

  test('hero heading is visible', async ({ examplePage }) => {
    await expect(examplePage.heroHeading).toBeVisible();
  });
});
```

Rules:
- Use the fixture — never `import { test } from '@playwright/test'` directly in spec files
- Tag every test: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, or `@responsive`
- Independent tests — no shared state between `test()` blocks
- One assertion per logical claim — split into separate tests if needed

---

## Test Categories

| Tag | Folder | What to test |
|-----|--------|-------------|
| `@smoke` | `tests/smoke/` | Site loads, title present, no console errors |
| `@navigation` | `tests/navigation/` | Nav links route correctly, mobile menu works |
| `@forms` | `tests/forms/` | Fields render, validation triggers, no submission |
| `@functional` | `tests/functional/` | Business features: pricing, features, accordions |
| `@visual` | `tests/visual/` | `toHaveScreenshot()` baselines |
| `@responsive` | `tests/responsive/` | Layout at 390px, 768px, 1280px viewports |

---

## Selectors

Prefer selectors in this priority order:

1. ARIA roles: `page.getByRole('button', { name: /submit/i })`
2. Labels: `page.getByLabel('Email address')`
3. Test IDs: `page.getByTestId('hero-cta')`
4. Text: `page.getByText(/get started/i)`
5. CSS class containing a semantic keyword: `page.locator('[class*="hero-heading"]')`
6. Positional fallback: `page.locator('h1').first()`

Avoid:
- `nth-child` or positional selectors that break on reorder
- XPath
- Deeply nested CSS chains

---

## Visual Regression

Visual tests use `toHaveScreenshot()` and compare against snapshots in `__snapshots__/`. Snapshots are platform-specific (OS + browser).

- Run `/update-baseline` to capture new baselines
- Always review updated screenshots before committing
- Do not commit snapshots captured on a different OS than CI

---

## Commit Message Format

```
type(scope): short description

feat(smoke): add HTTPS redirect assertion
fix(forms): correct email validation selector for mobile
test(functional): add pricing page plan count test
chore(deps): upgrade playwright to 1.45.0
```

Types: `feat`, `fix`, `test`, `chore`, `docs`, `refactor`

---

## Getting Help

- Architecture overview: [`.github/docs/architecture.md`](docs/architecture.md)
- Test writing guide: [`.github/docs/test-writing-guide.md`](docs/test-writing-guide.md)
- Agent reference: [`.github/docs/agents.md`](docs/agents.md)
- Skills reference: [`.github/docs/skills.md`](docs/skills.md)
- Claude Code instructions: [`CLAUDE.md`](../CLAUDE.md)
