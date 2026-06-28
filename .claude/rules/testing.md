---
paths:
  - "tests/**/*.spec.ts"
  - "tests/**/*.test.ts"
---

# Test File Rules

These rules apply when writing or editing spec files in `tests/`.

## Imports

Always import `test` and `expect` from the custom fixture, never from `@playwright/test` directly:

```typescript
// correct
import { test, expect } from '@fixtures/site.fixture';

// wrong — bypasses custom fixtures
import { test, expect } from '@playwright/test';
```

## Tags

Every `test()` block must have at least one tag from:
`@smoke` `@navigation` `@forms` `@functional` `@visual` `@responsive`

Tags go in the `test.describe` label or directly in the `test()` name string.

## Independence

Each `test()` must be fully independent — no relying on state left by a previous test. Use `test.beforeEach` for navigation, not `test.beforeAll` with shared page state.

## No Form Submission

Never click a submit button or programmatically submit a form (`form.submit()`). Test only field rendering and client-side validation.

## No Real Credentials

Never fill a password field or a username field with real values. If the config has `auth.required: false`, skip all auth-related tests.

## Waiting

Never use `page.waitForTimeout()` with a duration over 500ms. Use:
- `await expect(locator).toBeVisible()` — waits for element
- `await page.waitForSelector(selector)` — waits for DOM presence
- `await page.waitForLoadState('networkidle')` — waits for network quiet

## Assertions

One logical claim per `expect()`. Split complex checks into separate named tests.

## No Hardcoded URLs

Use `page.goto('/path')` with `baseURL` from config. Never:
```typescript
await page.goto('https://www.grovesite.com/contact'); // wrong
await page.goto('/contact');                           // correct
```
