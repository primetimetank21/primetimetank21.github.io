# primetimetank21.github.io

> Terminal-style personal portfolio — built with Astro, animated with GSAP + CSS View Transitions, Tokyo Night themed.
> Live at **https://primetimetank21.github.io**

## Stack

| Layer | Choice |
|-------|--------|
| Framework | [Astro](https://astro.build) v7 (static output) |
| Hosting | GitHub Pages (user site — root URL `/`) |
| Animation | GSAP v3 + CSS View Transitions + CSS transitions |
| Theme | Tokyo Night (dark) / Tokyo Night Day (light) |
| Font | JetBrains Mono (self-hosted via `@fontsource`) |
| Unit tests | [Vitest](https://vitest.dev) v4 |
| E2E + visual | [Playwright](https://playwright.dev) v1.61.1 |
| CI/CD | GitHub Actions |

---

## Local Development

```sh
# Install dependencies
npm install

# Dev server (hot reload, fast iteration)
npm run dev          # http://localhost:4321

# Production-faithful preview (build first, then serve)
npm run build
npm run preview      # http://localhost:4321

# TypeScript type-check
npm run check
```

---

## Testing

```sh
# Unit tests (Vitest)
npm run test:unit
npm run test:unit:watch    # watch mode

# E2E smoke + interaction tests (Playwright — requires built dist)
npm run build
npm run test:e2e

# Run all (unit + E2E smoke)
npm run build
npm run test
```

---

## Visual Regression Baselines

> ⚠️ **Baselines MUST be generated on Linux.**
> Windows and macOS produce different font-rendering output than CI — committing non-Linux baselines causes flake on every PR.

### The visual check is a BLOCKING gate

The `Visual Regression (Linux baselines)` job in CI compares every PR's screenshots against committed Linux baselines. A diff = failure = the PR cannot merge. This is intentional: it catches accidental layout regressions.

**When you make an intentional UI change** (new feature, style fix, a11y tweak), the baselines need to be refreshed so CI sees the intended result. That's what `Update Visual Baselines` is for.

### Bless intentional UI changes on a PR branch (recommended flow)

1. Push your changes to a PR branch (e.g. `squad/issue-26-m4-polish`).
2. If the `Visual Regression` check fails: go to **Actions** → **Update Visual Baselines** → **Run workflow**.
3. Set the **branch** input to your PR branch name (e.g. `squad/issue-26-m4-polish`). Click **Run workflow**.
4. The workflow runs in the Linux Playwright container, generates fresh baselines, and commits them **directly to your PR branch**.
5. The visual check re-runs automatically once the commit lands — it should turn green.
6. Review the updated PNGs in your PR diff. They ARE the visual record of what the site looks like. Approve them before merging.

### Update baselines after a merge to main

Run the same workflow with **branch = main** (the default). Since branch protection blocks direct pushes to main, the workflow creates a `baselines/auto-<run-id>` branch and opens a PR with auto-merge enabled. It lands once CI passes. Earl can also merge manually:

```sh
gh pr merge baselines/auto-<run-id> --admin --squash
```

### Local alternative (optional, requires Docker)

If you prefer to run locally and have Docker available:

```sh
docker pull mcr.microsoft.com/playwright:v1.61.1-noble
npm run build

docker run --rm \
  -v "$(pwd):/work" \
  -w /work \
  mcr.microsoft.com/playwright:v1.61.1-noble \
  npx playwright test tests/e2e/visual.spec.ts --update-snapshots

git add tests/e2e/__snapshots__/
git commit -m "test(visual): update Linux baselines"
```

> **Windows users (PowerShell):** replace `$(pwd)` with `${PWD}`.

---

## CI / CD

| Workflow | Trigger | Jobs |
|----------|---------|------|
| `Build & Check` | Pull request → `main` | Build · Type-check · Unit tests · E2E (smoke + terminal) · **Visual Regression (blocking)** |
| `Deploy to GitHub Pages` | Push to `main` | Build · Deploy |
| `Update Visual Baselines` | Manual (`workflow_dispatch`, `branch` input) | Regenerate + commit Linux snapshots |

**Deploy gate:** merging to `main` = publish. PRs never deploy.

**Required status checks (all blocking):**
- `Build, Type-check & Link-check`
- `Unit Tests (Vitest)`
- `E2E Tests (Playwright)`
- `Visual Regression (Linux baselines)` ← promoted from advisory in M4

---

## Project Structure

```
/
├── .github/
│   └── workflows/
│       ├── build-check.yml            ← PR checks (build + tests)
│       ├── deploy.yml                 ← Pages deploy on push to main
│       └── update-visual-baselines.yml ← Manual: regenerate Linux snapshots
├── public/
│   ├── favicon.svg                    ← Terminal prompt glyph (❯), Tokyo Night
│   ├── favicon.ico                    ← Fallback .ico (32×32)
│   ├── apple-touch-icon.svg           ← Apple touch icon (SVG; PNG regen needed for full iOS)
│   ├── og-image.svg                   ← Social preview card (1200×630)
│   └── robots.txt
├── src/
│   ├── __tests__/unit/        ← Vitest unit tests
│   ├── components/
│   │   ├── Terminal/
│   │   │   └── TerminalShell.astro    ← Interactive terminal island
│   │   └── ThemeToggle.astro
│   ├── layouts/
│   │   └── Layout.astro               ← SEO/OG meta, theme injection, slots
│   ├── lib/
│   │   ├── content.ts                 ← Portfolio copy (single edit point)
│   │   └── terminal.ts                ← Pure terminal logic (Vitest-importable)
│   ├── pages/
│   │   ├── index.astro
│   │   └── 404.astro                  ← On-brand "command not found" error page
│   ├── styles/
│   │   ├── tokens.css                 ← Design tokens (Tokyo Night dark + day)
│   │   └── global.css
│   └── utils/
│       ├── animations.ts              ← GSAP animation primitives
│       └── motion.ts                  ← shouldAnimate / prefersReducedMotion
├── tests/
│   └── e2e/
│       ├── __snapshots__/             ← Linux-generated visual baselines
│       ├── smoke.spec.ts              ← Page load + heading
│       ├── terminal.spec.ts           ← Terminal interaction + a11y + reduced-motion
│       └── visual.spec.ts             ← Visual regression (advisory)
├── astro.config.mjs
├── playwright.config.ts
└── vitest.config.ts
```

---

## Milestones

| Milestone | Status | Scope |
|-----------|--------|-------|
| **M0** | ✅ Done | Scaffold · CI harness · deploy pipeline |
| **M1** | ✅ Done | Design system · Tokyo Night tokens · terminal island |
| **M2** | ✅ Done | Content (projects, about, contact, skills) |
| **M3** | ✅ Done | Motion (GSAP boot-up, typewriter, View Transitions theme toggle) |
| **M4** | ✅ Done | SEO/OG · a11y audit · perf · mobile · 404 · sitemap · README |
