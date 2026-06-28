# GroveSite — QA Agentic Solution

> Playwright + TypeScript regression test suite for [GroveSite](http://www.grovesite.com/), a B2B online collaboration and database platform. Built with the Page Object Model (POM) and Object-Oriented Programming (OOP) patterns. Designed for agentic execution via Claude Code.

---

## Table of Contents

- [Project Purpose](#project-purpose)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Architecture](#architecture)
- [Test Categories](#test-categories)
- [Available Agents & Skills](#available-agents--skills)
- [Contributor Rules](#contributor-rules)
- [Project Structure](#project-structure)

---

## Project Purpose

This repo tests **GroveSite** (`http://www.grovesite.com`), a Phoenix-based B2B SaaS platform for online collaboration and database management. Founded in 2003 and self-funded, GroveSite serves small teams needing lightweight shared workspaces.

The test suite covers every discoverable feature of the public site — smoke, navigation, forms, functional, visual regression, and responsive layout — without requiring account creation or form submission.

The suite is configured via `site.config.json`, making it trivially portable to any other site: update one file and the agents regenerate the full test suite for the new target.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Playwright](https://playwright.dev/) | Browser automation across Chromium, mobile Chrome, and tablet |
| TypeScript (strict) | Strongly typed test code and page objects |
| Page Object Model (POM) | Encapsulate page structure; keep assertions in tests, actions in page objects |
| Claude Code | Agentic test generation, site analysis, and reporting via slash commands |
| GitHub Actions | CI/CD pipeline (see `.github/workflows/`) |

---

## Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later
- A Claude Code subscription (for agentic slash commands)

---

## Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd grovesite_QA_Agentic_Solution

# 2. Install Node dependencies
npm install

# 3. Install Playwright browsers
npx playwright install --with-deps

# 4. Copy env example (optional — for overriding base URL)
cp .env.example .env
```

The target site URL is read from `site.config.json`. To override it for a local run without editing the config:

```bash
SITE_URL=https://staging.grovesite.com npx playwright test
```

---

## Running Tests

```bash
npm test                    # All tests, all browsers
npm run test:smoke          # @smoke only
npm run test:navigation     # @navigation only
npm run test:forms          # @forms only
npm run test:visual         # @visual (screenshot regression)
npm run test:responsive     # @responsive (layout checks)
npm run test:headed         # Open browser window while running
npm run report              # Open last HTML report
npm run baseline            # Update visual snapshots
npm run lint                # ESLint
npm run typecheck           # TypeScript check (no emit)
```

Tests run across three browser projects defined in `playwright.config.ts`:

| Project | Viewport | Device |
|---------|----------|--------|
| `chromium-desktop` | 1280×720 | Desktop Chrome |
| `mobile-chrome` | 390×844 | Pixel 5 |
| `tablet` | 768×1024 | iPad Mini |

---

## Architecture

### Page Object Model (POM)

Every page or major section has a TypeScript class in `src/pages/`. Page classes follow OOP principles:

- **Encapsulation**: locators are `readonly Locator` properties — callers cannot reassign them
- **Abstraction**: methods expose user-intent actions (`clickPrimaryNav`, `fillContactForm`) not raw DOM operations
- **Inheritance**: all page classes extend `BasePage` which provides shared `navigate()`, `waitForLoad()`, and `getTitle()` helpers
- **Single Responsibility**: one class per page or logical section

```
src/pages/
├── base.page.ts         ← Base class: shared navigation & wait helpers
├── home.page.ts         ← HomePage: hero, CTA, feature sections
├── navigation.page.ts   ← NavigationPage: header nav, mobile menu, footer
├── contact.page.ts      ← ContactFormPage: form fields & validation helpers
└── <feature>.page.ts    ← One class per discovered page
```

### Fixtures

`src/fixtures/site.fixture.ts` extends Playwright's built-in `test` fixture with typed instances of every page object, plus the parsed `site.config.json`. All spec files import from the fixture:

```typescript
import { test, expect } from '@fixtures/site.fixture';

test('hero heading is visible @smoke', async ({ homePage }) => {
  await homePage.navigate('/');
  await expect(homePage.heroHeading).toBeVisible();
});
```

### Path Aliases

`tsconfig.json` defines `@fixtures/*` → `src/fixtures/*` and `@pages/*` → `src/pages/*`. Use these in imports, not relative paths.

---

## Test Categories

| Tag | Folder | What it covers |
|-----|--------|---------------|
| `@smoke` | `tests/smoke/` | Site loads, title present, no console errors, HTTPS |
| `@navigation` | `tests/navigation/` | Nav links, routing, mobile menu, footer links |
| `@forms` | `tests/forms/` | Form fields, required-field validation, email format (no submission) |
| `@functional` | `tests/functional/` | Business features: pricing, features, accordions, video, search |
| `@visual` | `tests/visual/` | Screenshot regression with `toHaveScreenshot()` |
| `@responsive` | `tests/responsive/` | Hamburger menu, overflow, text size at 390px and 768px |

---

## Available Agents & Skills

Slash commands are invoked inside a Claude Code session (prefix `/`). Full documentation in [`.github/docs/skills.md`](.github/docs/skills.md).

| Command | What it does |
|---------|-------------|
| `/generate-full-suite` | Analyze the live site and generate complete POM classes + all test suites |
| `/analyze-site` | Crawl the site, return updated `site.config.json` + issues list |
| `/run-smoke` | Run smoke suite, display pass/fail table, suggest fixes for failures |
| `/update-baseline` | Capture new visual regression baselines after intentional design changes |
| `/generate-report` | Parse `test-results/results.json` and render a structured summary |

Subagents (`.claude/agents/`) that Claude Code spawns automatically:

| Agent | Role |
|-------|------|
| `site-analyzer` | Crawls a site and produces a fully-populated `site.config.json` |
| `test-generator` | Reads config and generates site-specific Playwright spec files |

Full agent documentation: [`.github/docs/agents.md`](.github/docs/agents.md)

---

## Contributor Rules

See [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md) for the full guide. Key rules:

1. **Never submit forms** — test field interactions and validation only
2. **Never create accounts** — no real credentials, no sign-up flows
3. **No hardcoded URLs** — always use `baseURL` from Playwright config
4. **No assertions in page objects** — `expect()` belongs in test files only
5. **No `waitForTimeout`** — use Playwright auto-waiting or `waitForSelector`
6. **No `any` type** — use explicit TypeScript types or generics
7. **Tag every test** — at least one of `@smoke @navigation @forms @functional @visual @responsive`
8. **Run `npm run typecheck` before committing** — zero TypeScript errors required
9. **One page class per page** — keep classes focused and single-responsibility
10. **Selectors from real HTML** — inspect the live site before writing locators

---

## Project Structure

```
grovesite_QA_Agentic_Solution/
├── site.config.json              ← Target site URL, flags, nav items
├── playwright.config.ts          ← Browser projects, reporters, global setup
├── global-setup.ts               ← Pre-run reachability check
├── tsconfig.json                 ← Strict TypeScript + path aliases
├── package.json
├── CLAUDE.md                     ← Claude Code project instructions
├── AGENTS.md                     ← Agent registry (for non-Claude AI tools)
├── Skills.md                     ← Slash command reference
│
├── src/
│   ├── pages/                    ← Page Object Model classes (OOP)
│   │   ├── base.page.ts
│   │   ├── home.page.ts
│   │   ├── navigation.page.ts
│   │   └── contact.page.ts
│   ├── fixtures/
│   │   └── site.fixture.ts       ← Custom Playwright fixture
│   ├── utils/
│   │   ├── link-checker.ts
│   │   └── visual-helper.ts
│   └── types/
│       └── site-config.types.ts
│
├── tests/
│   ├── smoke/                    ← @smoke
│   ├── navigation/               ← @navigation
│   ├── forms/                    ← @forms
│   ├── functional/               ← @functional
│   ├── visual/                   ← @visual
│   └── responsive/               ← @responsive
│
├── .claude/
│   ├── agents/                   ← Claude Code subagent definitions
│   ├── commands/                 ← Slash command skill files
│   ├── rules/                    ← Path-scoped instruction rules
│   └── hooks/                    ← Pre/post test hooks
│
└── .github/
    ├── CONTRIBUTING.md
    ├── docs/
    │   ├── architecture.md
    │   ├── agents.md
    │   ├── skills.md
    │   └── test-writing-guide.md
    └── workflows/
        └── playwright.yml
```

---

*Part of the Phoenix Startup QA Agentic Solutions project. Tests GroveSite (Phoenix, AZ — founded 2003).*
