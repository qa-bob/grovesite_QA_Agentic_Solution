---
paths:
  - "src/**/*.ts"
  - "tests/**/*.ts"
---

# TypeScript Rules

These rules apply to all TypeScript files in `src/` and `tests/`.

## Strict Mode

TypeScript strict mode is enabled. This enforces:
- `noImplicitAny` — every variable must have an explicit or inferred type
- `strictNullChecks` — `null` and `undefined` are not assignable to other types without explicit handling
- `strictFunctionTypes` — function parameter types are checked contravariantly

Never use `// @ts-ignore` or `// @ts-nocheck`. Fix the type error.

## No `any`

Never use `any` unless there is no alternative, and always add a comment explaining why:

```typescript
// wrong
const data: any = JSON.parse(raw);

// correct
const data: SiteConfig = JSON.parse(raw) as SiteConfig;

// acceptable with comment explaining why
const legacyData = response as any; // third-party API has no type definition
```

## Async/Await

Always use `async/await`. Never use `.then()` chains or callback-style async.

```typescript
// correct
async navigate(path: string): Promise<void> {
  await this.page.goto(path);
}

// wrong
navigate(path: string): Promise<void> {
  return this.page.goto(path).then(() => {});
}
```

## Path Aliases

Use path aliases defined in `tsconfig.json`, not relative paths that cross directory boundaries:

```typescript
// correct
import { test, expect } from '@fixtures/site.fixture';
import { BasePage } from '@pages/base.page';

// wrong (from a test file)
import { test, expect } from '../../src/fixtures/site.fixture';
```

## Interface Naming

TypeScript interfaces use PascalCase with no `I` prefix:

```typescript
// correct
interface SiteConfig { ... }

// wrong
interface ISiteConfig { ... }
```

## Return Types

Always declare return types on public methods:

```typescript
// correct
async getTitle(): Promise<string> { ... }
async clickCta(): Promise<void> { ... }

// wrong (relies on inference for public API)
async getTitle() { ... }
```

## Verify Before Committing

Run `npx tsc --noEmit` before finishing any change. Zero TypeScript errors is required.
