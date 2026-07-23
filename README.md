# primetimetank21.github.io

> Terminal-style personal portfolio — built with Astro, animated with GSAP + CSS View Transitions, Tokyo Night themed.  
> Live at **https://primetimetank21.github.io**

## Stack

| Layer | Choice |
|-------|--------|
| Framework | [Astro](https://astro.build) v7 (static output) |
| Hosting | GitHub Pages (user site — root URL `/`) |
| Unit tests | [Vitest](https://vitest.dev) v4 |
| E2E + visual | [Playwright](https://playwright.dev) v1.61.1 |
| CI/CD | GitHub Actions |
| Animation (M1+) | GSAP + CSS View Transitions + CSS transitions |
| Theme (M1+) | Tokyo Night (dark) / Tokyo Night Day (light) |

---

## Local Development

```sh
# Install
npm install

# Dev server (hot reload, fast iteration)
npm run dev          # http://localhost:4321

# Production-faithful preview (builds first, then serves)
npm run build
npm run preview      # http://localhost:4321

# Type-check
npm run check
```

---

## Testing

```sh
# Unit tests (Vitest)
npm run test:unit
npm run test:unit:watch    # watch mode

# E2E smoke tests (Playwright — requires built dist)
npm run build
npm run test:e2e

# Run all (unit + E2E smoke)
npm run build
npm run test
```

---

## Visual Regression Baselines

> ⚠️ **Baselines MUST be generated on Linux** (inside the official Playwright Docker image).  
> Windows and macOS produce different font-rendering output than CI — committing Windows-generated baselines will cause flake on every PR.

### Generate / update baselines (run on any OS, Docker required)

```sh
# Pull the pinned image (same version as CI)
docker pull mcr.microsoft.com/playwright:v1.61.1-noble

# Build the site first
npm run build

# Generate Linux baselines and write to tests/e2e/__snapshots__/
docker run --rm \
  -v "$(pwd):/work" \
  -w /work \
  mcr.microsoft.com/playwright:v1.61.1-noble \
  npx playwright test tests/e2e/visual.spec.ts --update-snapshots

# Commit the result
git add tests/e2e/__snapshots__/
git commit -m "test(visual): update Linux baselines"
```

> **Windows users (PowerShell):** replace `$(pwd)` with `${PWD}`.

### Rules
- Baselines live in `tests/e2e/__snapshots__/` and are **committed** to the repo.
- Visual tests are **advisory** in PR CI (non-blocking) until baselines stabilize. They become a required gate in M4 (final polish).
- `toHaveScreenshot` is globally configured with `animations: 'disabled'` — always snapshot settled end-states, never mid-animation frames.
- Mask dynamic regions (timestamps, cursor blink) with `mask: [page.locator(...)]` when added.

---

## CI / CD

| Workflow | Trigger | Jobs |
|----------|---------|------|
| `Build & Check` | Pull request → `main` | Build · Type-check · Link check · Unit tests · E2E smoke · Visual (advisory) |
| `Deploy to GitHub Pages` | Push to `main` | Build · Deploy |

**Deploy gate:** merging to `main` = publish. PRs never deploy.

### Branch Protection (manual step — see below if not yet applied)

Required check to enable on `main` in repo Settings → Branches → Branch protection rules:
- ✅ Require status checks to pass before merging
- ✅ Required checks: `Build, Type-check & Link-check`, `Unit Tests (Vitest)`, `E2E Tests (Playwright)`

---

## Project Structure

```
/
├── .github/
│   └── workflows/
│       ├── build-check.yml    ← PR checks (build + tests)
│       └── deploy.yml         ← Pages deploy on push to main
├── public/
├── src/
│   ├── __tests__/unit/        ← Vitest unit tests
│   └── pages/
│       └── index.astro
├── tests/
│   └── e2e/
│       ├── smoke.spec.ts      ← E2E navigation tests
│       └── visual.spec.ts     ← Visual regression (Linux baselines)
├── astro.config.mjs
├── playwright.config.ts
└── vitest.config.ts
```

---

## Milestones

| Milestone | Status | Scope |
|-----------|--------|-------|
| **M0** | ✅ Done | Scaffold · CI harness · deploy pipeline |
| M1 | Pending | Design system · Tokyo Night tokens · terminal island |
| M2 | Pending | Content (projects, about, contact) |
| M3 | Pending | Motion (GSAP hero, View Transitions theme toggle) |
| M4 | Pending | Polish · visual baseline lock · a11y audit |
