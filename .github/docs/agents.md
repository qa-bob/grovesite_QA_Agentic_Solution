# Agent Reference — GroveSite QA Agentic Solution

This document describes the Claude Code subagents available in this project, their roles, inputs, and outputs.

Agents live in `.claude/agents/`. Claude Code may invoke them automatically or they are triggered by slash commands.

---

## `site-analyzer`

**File**: `.claude/agents/site-analyzer.md`
**Triggered by**: `/analyze-site` slash command, or automatically when `site.config.json` needs population.

### Role

Crawls a live website and produces a fully-populated `site.config.json`. Handles SPAs, redirect chains, cookie banners, auth-gated content, and lazy-rendered navigation.

### Inputs

| Input | Required | Default |
|-------|----------|---------|
| `url` | Yes | From `site.config.json` if omitted |
| `companyName` | No | Inferred from `<title>` or `og:site_name` |

### Process

1. Issue a HEAD request and follow all redirects — use the final canonical URL
2. Navigate with `waitUntil: 'networkidle'`; wait extra 2s for SPA hydration if body is empty
3. Dismiss cookie consent banners
4. Extract: `<title>`, meta description, nav links (text + href), form presence, H1, viewport meta, HTTPS status
5. Check `/contact`, `/contact-us`, `/get-in-touch` for contact forms
6. Infer industry from H1/H2/P content
7. Assess `skipVisual` (true only for uncontrollable animations)
8. Detect auth redirect — set `auth.required: true` if any page redirected to a login URL

### Output

1. Complete `site.config.json` JSON block
2. Issues checklist (missing meta description, no HTTPS, broken nav links, etc.)
3. Confidence assessment: **High** / **Medium** / **Low** with reasoning

### Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| SPA (React/Vue/Angular) | Extra 2s wait after `networkidle` |
| Auth-gated content | `auth.required: true`, sets `skipForms: true`, `skipVisual: true` |
| HTTP → HTTPS redirect | Uses HTTPS as canonical URL |
| No visible nav | Tries scrolling to 20%, sets `expectedNavItems: []` if still none |
| Shadow DOM nav | Uses `page.evaluate()` to pierce shadow boundary |

---

## `test-generator`

**File**: `.claude/agents/test-generator.md`
**Triggered by**: `/generate-full-suite` slash command.

### Role

Reads a populated `site.config.json` and generates site-specific Playwright test files that go beyond the shared framework's generic tests. Output files land in `tests/custom/`.

### Inputs

| Input | Required | Description |
|-------|----------|-------------|
| `siteConfig` | Yes | Populated `site.config.json` |
| `testScenarios` | No | Specific scenarios to cover |
| `pagesToTest` | No | List of page paths (e.g., `/pricing`) |

### Process

1. Read `site.config.json`
2. Identify gaps in the shared test suites (unique pages, interactive elements, known issues)
3. Plan test scenarios — outputs a brief list before writing code
4. Generate page object additions if needed: new methods on existing classes, or a new class in `src/pages/`
5. Write spec files to `tests/custom/<kebab-case-name>.spec.ts`

### Output Requirements

Every generated file must:
- Start with a JSDoc comment: what is being tested, why it is site-specific, date, site name
- Import from `@fixtures/site.fixture`
- Tag all tests (`@custom` plus any applicable shared tag)
- Follow strict TypeScript (no implicit `any`)
- Use `async/await` throughout
- Not rely on fixed timeouts > 500ms
- Not submit any form

### Naming Convention

```
tests/custom/<kebab-case-description>.spec.ts
```

Examples: `tests/custom/pricing-page.spec.ts`, `tests/custom/faq-accordion.spec.ts`

---

## How Agents Differ from Skills

| | Skills (`.claude/commands/`) | Agents (`.claude/agents/`) |
|-|------------------------------|---------------------------|
| **Invoked by** | User typing `/command-name` | Claude Code automatically, or by a skill |
| **Purpose** | Multi-step agentic workflow | Specialized sub-task with defined I/O |
| **Output** | Interactive — shown in session | Structured data or files |
| **Scope** | High-level orchestration | Focused single responsibility |

---

## Adding a New Agent

1. Create `.claude/agents/<agent-name>.md`
2. Define: **Role**, **When to invoke**, **Capabilities**, **Inputs**, **Outputs**, **Step-by-step instructions**, **Edge cases**
3. Reference the agent from a skill if you want it invocable via `/command`

Keep agent instruction files focused. A well-defined agent does one thing well. If an agent is trying to do analysis AND code generation, split it into two agents.
