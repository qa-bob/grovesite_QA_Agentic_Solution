# Agents — GroveSite QA Agentic Solution

> This file describes the agents and coding conventions for this repository. It is intended for AI coding agents (GitHub Copilot Workspace, Cursor, OpenAI Codex, etc.). Claude Code reads `CLAUDE.md` instead — see that file for Claude-specific instructions.

---

## Repository Summary

This repository is a **Playwright + TypeScript automated test suite** for [GroveSite](http://www.grovesite.com/), a B2B SaaS platform for online collaboration and database management. It uses the Page Object Model (POM) design pattern and OOP principles.

**Target site**: configured in `site.config.json`
**Test framework**: Playwright with TypeScript strict mode
**Architecture**: Page Object Model (POM) — see `src/pages/`
**Test runner**: `npx playwright test` or the npm scripts in `package.json`

---

## Agents in This Repo

Agents live in `.claude/agents/`. Each agent has a defined role, inputs, and output contract.

### `site-analyzer`
**File**: `.claude/agents/site-analyzer.md`
**Role**: Crawl a live website and produce a fully-populated `site.config.json`.
**Invoked by**: `/analyze-site` slash command, or automatically on first setup.
**Output**: Updated `site.config.json` + issues checklist.

### `test-generator`
**File**: `.claude/agents/test-generator.md`
**Role**: Read `site.config.json` and generate site-specific Playwright test files.
**Invoked by**: `/generate-full-suite` slash command.
**Output**: TypeScript spec files in `tests/custom/` and updated page objects in `src/pages/`.

---

## Slash Commands (Skills)

| Command | File | Purpose |
|---------|------|---------|
| `/generate-full-suite` | `.claude/commands/generate-full-suite.md` | Full site analysis + POM + all test suites |
| `/analyze-site` | `.claude/commands/analyze-site.md` | Site crawl → updated `site.config.json` |
| `/run-smoke` | `.claude/commands/run-smoke.md` | Run smoke tests, display pass/fail table |
| `/update-baseline` | `.claude/commands/update-baseline.md` | Update visual regression snapshots |
| `/generate-report` | `.claude/commands/generate-report.md` | Parse results.json → structured report |

---

## Coding Conventions

When writing or editing code in this repository, follow these rules:

### Page Object Model (POM)
- Every page or major section has one TypeScript class in `src/pages/`
- All page classes extend `BasePage` from `./base.page`
- Locators are declared as `readonly Locator` properties on the class
- Methods represent **user actions**, not assertions (`clickPrimaryNav`, `fillContactForm`)
- Never put `expect()` calls inside page object methods — assertions belong in tests
- One class per page — keep it single-responsibility

### Tests
- Import page objects through the custom fixture: `import { test, expect } from '@fixtures/site.fixture'`
- Tag every test with at least one of: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`
- Do not hardcode URLs — always use `baseURL` from Playwright config
- Never submit forms — test field interactions and validation only
- Never create accounts or enter real credentials
- Use `waitForSelector` or Playwright auto-waiting instead of `waitForTimeout`

### TypeScript
- Strict mode is enabled — no implicit `any`
- All page object properties must have explicit types
- Run `npx tsc --noEmit` before finishing any change

### Key Files
| File | Purpose |
|------|---------|
| `site.config.json` | Target site URL and feature flags |
| `playwright.config.ts` | Browser projects, reporters, baseURL |
| `src/pages/base.page.ts` | BasePage superclass all page objects extend |
| `src/fixtures/site.fixture.ts` | Custom Playwright fixture — import test from here |
| `src/types/site-config.types.ts` | TypeScript interfaces for site.config.json |

### Do Not
- Submit any form
- Create accounts or log in (unless `auth.required: true` in `site.config.json`)
- Hardcode the base URL in any test
- Put `expect()` inside page object methods
- Use `page.waitForTimeout()` with durations > 500ms
- Use `any` type without an explicit comment explaining why
