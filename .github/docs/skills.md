# Skills Reference — GroveSite QA Agentic Solution

Skills are slash commands you invoke inside a Claude Code session. They define repeatable workflows that load only when needed, keeping normal sessions lean.

Skills live in `.claude/commands/`. See also the root [`Skills.md`](../../Skills.md) for a quick reference.

---

## Available Skills

### `/generate-full-suite`

**File**: `.claude/commands/generate-full-suite.md`

The primary skill for onboarding. Performs a full end-to-end analysis of the target site and generates the complete test suite.

**Steps:**
1. Read `site.config.json`
2. `WebFetch` the homepage and all discovered pages
3. Plan POM classes for each page
4. Write page object TypeScript classes to `src/pages/`
5. Update `src/fixtures/site.fixture.ts`
6. Write spec files: smoke, navigation, forms, functional, visual, responsive
7. Update `site.config.json` with discovered values
8. Run `npx tsc --noEmit` and fix errors

**When to use:**
- First-time setup for a new site
- After a major site redesign
- When test coverage has significant gaps

---

### `/analyze-site [url]`

**File**: `.claude/commands/analyze-site.md`

Crawls the target site and produces an updated `site.config.json`.

**Steps:**
1. Navigate to the URL (or the URL in `site.config.json`)
2. Extract: title, meta description, nav links, forms, H1, HTTPS status
3. Check contact page paths for forms
4. Assess responsiveness at 390px
5. Output completed `site.config.json` + issues checklist

**When to use:**
- Before writing any tests on a new or updated site
- To verify `site.config.json` is still accurate after a site redesign

---

### `/run-smoke`

**File**: `.claude/commands/run-smoke.md`

Runs smoke tests and displays a clean pass/fail summary.

**Steps:**
1. `npm run test:smoke`
2. Parse `test-results/results.json`
3. Display formatted table: test name, status, duration
4. For failures: error message + suggested fix

**When to use:**
- After any deployment to verify the site is reachable
- Quick health check before running the full suite

---

### `/update-baseline`

**File**: `.claude/commands/update-baseline.md`

Updates visual regression snapshot baselines.

**Steps:**
1. `npm run baseline`
2. List updated files from `__snapshots__/`
3. Remind you to review before committing

**When to use:**
- After an intentional site redesign
- After first-time setup (no baselines exist yet)
- After changing viewport sizes in `playwright.config.ts`

> Always review screenshots before committing. Committing unreviewed baselines defeats the purpose of visual regression.

---

### `/generate-report`

**File**: `.claude/commands/generate-report.md`

Parses test results and generates a structured summary.

**Steps:**
1. Parse `test-results/results.json`
2. Display per-suite breakdown: total, passed, failed, flaky
3. List failed tests with error messages
4. Suggest next steps

**When to use:**
- After any test run to get a shareable summary
- After CI completes to understand what failed

---

## How Skills Work in Claude Code

Skills are markdown files in `.claude/commands/`. When you type `/skill-name`, Claude Code loads the file and executes the instructions defined inside it.

- Skills load **on demand** — they don't consume context in sessions where you don't invoke them
- Skills can call agents, run shell commands, read files, and use `WebFetch`
- You can chain skills: `/analyze-site` updates the config, then `/generate-full-suite` uses the updated config

## Adding a New Skill

1. Create `.claude/commands/<skill-name>.md`
2. Write the skill instructions using markdown
3. Include: **Usage**, **What this command does** (numbered steps), **Output format**, **Edge cases**
4. The skill is immediately available as `/<skill-name>` in the next Claude Code session

## Skills vs CLAUDE.md vs Rules

| Mechanism | When loaded | Best for |
|-----------|-------------|----------|
| `CLAUDE.md` | Every session | Architecture facts, do/don't rules, build commands |
| `.claude/rules/*.md` | When working in matching files | Path-scoped conventions (e.g., TypeScript rules only for `.ts` files) |
| `.claude/commands/*.md` (Skills) | When invoked | Multi-step procedures, repeatable workflows |
| `.claude/agents/*.md` | When Claude spawns a subagent | Specialized sub-tasks with defined I/O |
