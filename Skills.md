# Skills — GroveSite QA Agentic Solution

> Slash commands and subagent skills available in this Claude Code project. Invoke any skill by typing `/skill-name` inside a Claude Code session.

---

## Slash Commands

Skills live in `.claude/commands/`. Each file is a markdown document that Claude Code loads when the command is invoked.

---

### `/generate-full-suite`

**File**: `.claude/commands/generate-full-suite.md`
**When to use**: Onboarding a new site, or after a major site redesign that requires regenerating all test suites.

Performs a complete end-to-end analysis and test generation pipeline:

1. Reads `site.config.json` for the target URL and flags
2. Crawls the live site using `WebFetch` — homepage plus all discovered pages
3. Plans Page Object Model classes based on discovered structure
4. Writes TypeScript page object files to `src/pages/`
5. Updates `src/fixtures/site.fixture.ts` with new page objects
6. Writes spec files across all categories: smoke, navigation, forms, functional, visual, responsive
7. Updates `site.config.json` with discovered values
8. Runs `npx tsc --noEmit` and fixes any TypeScript errors

**Output**: Complete test suite covering every discoverable page feature, without submitting forms or creating accounts.

---

### `/analyze-site`

**File**: `.claude/commands/analyze-site.md`
**Usage**: `/analyze-site [url]` — omit URL to use `site.config.json`
**When to use**: Before writing tests on a new site, or to verify an existing config after a site update.

1. Navigates to the site, dismisses cookie banners
2. Extracts: title, meta description, nav links, form presence, H1, viewport meta, HTTPS status
3. Follows `/contact`, `/contact-us`, and `/get-in-touch` to detect contact forms
4. Checks mobile layout at 390px viewport
5. Outputs a completed `site.config.json` block ready to paste into the repo
6. Reports a checklist of issues found (missing meta description, broken links, no HTTPS, etc.)

---

### `/run-smoke`

**File**: `.claude/commands/run-smoke.md`
**When to use**: Quick health check after deployment or site change.

1. Runs `npm run test:smoke`
2. Parses `test-results/results.json`
3. Displays a formatted pass/fail table with durations
4. For failures: shows the error message and a suggested fix
5. Exits with the test process exit code (0 = all pass, non-zero = failure)

---

### `/update-baseline`

**File**: `.claude/commands/update-baseline.md`
**When to use**: After an intentional design change, viewport change, or first-time baseline capture.

1. Runs `npm run baseline` (Playwright with `--update-snapshots`)
2. Lists all updated screenshot files from `__snapshots__/`
3. Reminds you to review each image before committing
4. Reports any failures during capture

> Warning: always review updated screenshots before committing. Committing without review defeats the purpose of visual regression.

---

### `/generate-report`

**File**: `.claude/commands/generate-report.md`
**When to use**: After any test run, to get a structured summary suitable for sharing.

1. Parses `test-results/results.json`
2. Displays a per-suite breakdown: total, passed, failed, flaky
3. Lists all failed tests with error messages and retry counts
4. Suggests next steps: fix broken links, investigate flaky tests, run `/update-baseline` for intentional visual changes
5. In CI (no GUI): outputs to terminal only, skips `playwright show-report`

---

## Subagents

Subagents live in `.claude/agents/`. Claude Code spawns these automatically or when a skill needs deeper analysis.

### `site-analyzer`

**File**: `.claude/agents/site-analyzer.md`
**Role**: Crawl a live website and produce a fully-populated `site.config.json`.

Handles edge cases: SPAs (waits for `networkidle`), auth-gated content, redirect chains, cookie banners, lazy-loaded hamburger menus.

Outputs:
1. Complete `site.config.json` JSON block
2. Issues checklist
3. Confidence assessment (High / Medium / Low)

### `test-generator`

**File**: `.claude/agents/test-generator.md`
**Role**: Read `site.config.json` and generate site-specific Playwright test files beyond the shared framework.

Outputs TypeScript files to `tests/custom/`. Each file:
- Starts with a JSDoc explaining what is tested and why it is site-specific
- Imports from `@fixtures/site.fixture`
- Tags all tests appropriately
- Follows strict TypeScript conventions

---

## Adding a New Skill

1. Create `.claude/commands/<skill-name>.md`
2. Write the skill instructions in markdown — describe inputs, step-by-step actions, and output format
3. The skill is immediately available as `/<skill-name>` in Claude Code

Skills load only when invoked, so long instruction files cost no context in normal sessions.
