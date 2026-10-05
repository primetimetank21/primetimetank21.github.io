# primetimetank21.github.io

> Browsable software-engineering portfolio with an optional interactive terminal — built with Astro, animated with GSAP + CSS View Transitions, Tokyo Night themed.
> Live at **https://primetimetank21.github.io**

## Portfolio experience

- Professional identity, selected experience, project case studies, skills, and contact links are rendered at build time and work without JavaScript.
- Featured DevSetup and Phission cards start compact. Native **See more** disclosures expand independently with keyboard, touch, or JavaScript disabled. All flow, problem, approach, trade-off, evidence, and evidence links are present in the built HTML.
- Visible **Read case study** links navigate normally in the same tab to `/projects/dev-setup/` and `/projects/phission/`. These static pages show the full studies, support no-JS navigation back to projects, and share the homepage's detail-body renderer and copy in `src/lib/content.ts`.
- **More about me** in the existing homepage About section opens `/about/` in the same tab. The static About page shares identity, biography, skills/tools, and public contact data from `src/lib/content.ts`, links to the two existing studies, and supports no-JS navigation. The homepage's `#about` section and direct fragment links remain intact.
- **View experience** beside More about me opens `/experience/`. This static page presents selected engineering contributions in four employer/engagement groups, keeping current Microsoft employment separate from internships and each internship's dates explicit. Edit the approved introduction, roles, dates, contributions, technology labels, and public-work references in the `EXPERIENCE` export in `src/lib/content.ts`; the page renders that data without an accordion or terminal interaction. About remains the biography and working approach; Experience describes where the work happened and what was built or improved.
- All content pages use the shared **Home → About → Experience → Projects → Contact → Terminal** bar in `SiteNavLinks.astro`. About and Experience use `/about/` and `/experience/`; Projects/Contact/Terminal use homepage fragments. Home, About, and Experience identify only their exact current page with `aria-current="page"`. The shared skip link stays clipped within the viewport until focused and moves keyboard focus to main content.
- The seven projects and two studies remain the full public selection. This is **partial issue #9**: no additional studies or 404 redesign. Unknown and nested routes (including `/about/nested/` and `/experience/nested/`) remain real 404s. Phission remains a synthetic-only demo with the existing evidence and limitations; no live detection or historical usability claims are added.
- The terminal retains commands, history, completion, and theme switching, with normal keyboard navigation, focusable scrollback, and native mobile text editing.
- **Download résumé (PDF)** in the homepage hero, About contact list, and Experience heading uses the same-origin, native download link and unchanged PDF bytes, including without JavaScript. Explore projects remains the primary homepage action; terminal commands are unchanged.

## Public résumé

The approved PDF is served unchanged from [`public/resume/earl_tankard_jr-swe_resume-2026-10-04.pdf`](public/resume/earl_tankard_jr-swe_resume-2026-10-04.pdf) at `/resume/earl_tankard_jr-swe_resume-2026-10-04.pdf`. It is public, including the contact details in the document. The shared `RESUME` export in `src/lib/content.ts` supplies the URL, suggested download filename, and displayed updated date (`RESUME.updated`), separately from `CONTACT` and terminal output. Browser settings ultimately control download handling.

To update it, obtain approval for the exact replacement PDF and its public contents, copy only that PDF into `public/resume/` under a new dated filename, and update `RESUME.url`, `RESUME.filename`, and `RESUME.updated`. Update the accepted byte count/hash in `src/__tests__/unit/content.test.ts` and `tests/e2e/smoke.spec.ts`, plus this documented path. Do not publish companion sources or private notes. Run type-check, unit tests, build, and E2E; review the affected visual baselines in the pinned Playwright container before merging. Publishing a new filename does not remove older public copies; review any retirement separately. Merge and deployment remain separate approval gates.

## Terminal commands and page routes

| Command | Behavior |
|---------|----------|
| `help` | List commands |
| `about` | Professional background |
| `projects` | All seven projects and source links |
| `skills` / `tech` | Skills and tools |
| `contact` / `links` | Public contact links |
| `open` | List exactly About, DevSetup, and Phission as clickable page links; does not open a tab itself |
| `open about` | Request `/about/` in a new tab |
| `open dev-setup` | Request `/projects/dev-setup/` in a new tab |
| `open phission` | Request `/projects/phission/` in a new tab |
| `theme` | Toggle light/dark theme |
| `clear` | Clear terminal output |

Commands ignore case and normalize whitespace. `open` accepts only `about`, `dev-setup`, and `phission`, not URLs, paths, aliases, or extra arguments. The bare `about` command still prints the existing biography without navigating. Experience is a normal page/navigation destination only: no `experience` or `open experience` command is provided. Command-name completion includes `open`; argument completion is not provided.

New-tab requests run synchronously from Enter with `noopener,noreferrer`. The terminal **always supplies an ordinary clickable fallback link**, labeled with new-tab intent. It never claims a tab definitely opened or was blocked: `window.open` can return `null` even on success with `noopener`. If the call throws, the link remains usable and the terminal continues working. Browsers and user preferences ultimately control tab/window behavior. Homepage **Read case study**, **More about me**, and **View experience** links, plus shared navigation and the About/Experience pages' study and biography links, retain normal same-tab and native link controls.

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

# Baseline workflow contract + mocked shell checks (Node + Bash; no GitHub writes)
node --test tests/workflows/update-visual-baselines.test.mjs

# E2E smoke + interaction tests (Playwright — requires built dist)
npm run build
npm run test:e2e

# Run all (unit + E2E smoke)
npm run build
npm run test
```

---

## Visual Regression Baselines

> ⚠️ **Generate baselines in the exact CI Playwright container: `mcr.microsoft.com/playwright:v1.61.1-noble`.**
> A Linux host alone is not enough: differing fonts/browser libraries can change rendering. Do not commit host-generated screenshots as CI baselines.

The visual suite covers collapsed and expanded homepages, About, Experience, both full case-study pages, terminal states, and 404s in light/dark desktop/mobile viewports. Viewports are emulated, not physical-device checks. Functional E2E separately covers native disclosures, no-JS pages, same-tab links, exact Experience copy, résumé downloads, shared keyboard navigation/skip links, page metadata and sitemap membership, theme persistence, contrast, overflow, actual isolated new tabs, and fallback behavior. Experience layout checks include 320/390/844/1362px widths. New Experience baselines and intentionally affected content-page baselines must be generated and reviewed in the pinned container before the visual gate can pass; do not generate host baselines.

### The visual check is a BLOCKING gate

The `Visual Regression (Linux baselines)` job in CI compares every PR's screenshots against committed Linux baselines. A diff = failure = the PR cannot merge. This is intentional: it catches accidental layout regressions.

**When you make an intentional UI change** (new feature, style fix, a11y tweak), the baselines need to be refreshed so CI sees the intended result. That's what `Update Visual Baselines` is for. The update script uses `--update-snapshots=all`: even a small change inside the comparison tolerance must replace the old image so the reviewed baseline reflects the current page.

### Generate artifacts for review and a manual commit (review-first flow)

1. Push the intended UI changes to a PR branch.
2. Go to **Actions** → **Update Visual Baselines** → **Run workflow**.
3. Set **branch** to the source branch to render, and uncheck **commit_baselines** (`false`). The separate **Use workflow from** selector chooses the workflow version; when testing workflow changes, select the branch containing the updated workflow.
4. The workflow builds and generates snapshots in the pinned Playwright container, then uploads the **visual-snapshots** artifact. The entire commit job is skipped: no commits, pushes, PR creation, or merge actions.
5. Download the artifact from that run and review the PNGs. Copy the reviewed snapshots into `tests/e2e/__snapshots__/` on the matching source branch; regenerate if the UI has changed since the run.
6. Make and push a reviewed commit with your own credentials and accurate authorship/AI attribution where applicable. This route supports attributed AI-assisted updates without marking future human-only workflow commits as AI-created. Do not use CI-skip markers in commit messages. Verify all four required checks on the latest PR commit before merging.

### Commit intentional UI baselines automatically on a PR branch

1. Push your changes to a PR branch (e.g. `squad/issue-26-m4-polish`).
2. If the `Visual Regression` check fails due to intentional changes, run **Update Visual Baselines** with **branch** set to your PR branch and **commit_baselines** left checked (`true`, the default).
3. The workflow generates and uploads snapshots in the pinned container, then commits changed baselines **directly to your PR branch**. Unchanged snapshots produce no commit.
4. Review the updated PNGs in the PR diff. They are the visual record of the intended site, not proof that the change is correct.
5. Follow the check-verification steps below; a bot commit does **not** guarantee an automatic rerun or a passing result.

### Required checks after automated commits

The workflow uses `GITHUB_TOKEN`. [GitHub limits workflow runs caused by this token](https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-when-your-workflow-runs/triggering-a-workflow): token-originated pushes do not trigger push workflows, and PR workflow runs may require maintainer approval rather than start automatically.

- Inspect the PR/Actions for the **latest PR commit**. If GitHub offers **Approve workflows to run**, a maintainer with write access must review and approve them.
- If no check run exists for that commit, a maintainer must cause a new PR event with their own credentials, such as pushing a reviewed follow-up commit. Re-running an older workflow run only checks its original commit, not the new baseline commit.
- All four [required status checks](#ci--cd) must pass on the latest PR commit before merging. Do not bypass missing checks with an admin merge. Auto-merge does not start missing checks or override branch protection.

### Update baselines after a merge to main

Run the same workflow with **branch = main** and **commit_baselines = true** (the defaults). If snapshots changed, the workflow creates a `baselines/auto-<run-id>` branch, opens a PR, and requests auto-merge instead of pushing to protected main. A maintainer must still review the PNGs and verify the latest PR commit's required checks as described above. Auto-merge only proceeds when GitHub's requirements are satisfied; enabling it is not a guarantee of completion.

After review and successful checks, a maintainer can also merge with their own credentials:

```sh
gh pr merge baselines/auto-<run-id> --squash
```

Verify **Deploy to GitHub Pages** ran successfully for the merged main commit. A merge performed with `GITHUB_TOKEN` can suppress the push-triggered deployment; do not assume an automated merge published the site. Use the artifact-only/manual-commit path and a maintainer-authenticated merge when a normal check/deployment-triggering event is needed.

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
| `Build & Check` | Pull request → `main` | Build · Type-check · Unit tests · E2E (smoke + terminal + case studies + About + Experience) · **Visual Regression (blocking)** |
| `Deploy to GitHub Pages` | Push to `main` | Build · Deploy |
| `Update Visual Baselines` | Manual (`workflow_dispatch`, `branch` and `commit_baselines` inputs) | Regenerate + upload Linux snapshots; optionally commit/update branches and PRs (default: true) |

**Deploy gate:** pushes to `main` are the publication path; PRs never deploy. `GITHUB_TOKEN`-originated pushes do not trigger the deployment workflow, so verify the deployment run after any automated merge.

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
│   ├── resume/                        ← Approved, dated public PDF only
│   ├── favicon.svg                    ← Terminal prompt glyph (❯), Tokyo Night
│   ├── favicon.ico                    ← Fallback .ico (32×32)
│   ├── apple-touch-icon.svg           ← Apple touch icon (SVG; PNG regen needed for full iOS)
│   ├── og-image.svg                   ← Social preview card (1200×630)
│   └── robots.txt
├── src/
│   ├── __tests__/unit/        ← Vitest unit tests
│   ├── components/
│   │   ├── ProjectCard.astro           ← Compact cards + native disclosures
│   │   ├── CaseStudyBody.astro         ← Shared full study body (home + detail pages)
│   │   ├── Terminal/
│   │   │   └── TerminalShell.astro    ← Interactive terminal island
│   │   └── ThemeToggle.astro
│   ├── layouts/
│   │   └── Layout.astro               ← SEO/OG meta, theme injection, slots
│   ├── lib/
│   │   ├── content.ts                 ← Shared homepage + detail-page + terminal copy
│   │   └── terminal.ts                ← Pure terminal logic (Vitest-importable)
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro                ← Static biography, skills + public links
│   │   ├── experience.astro           ← Selected contributions, roles + distinct periods
│   │   ├── projects/[slug].astro      ← Exactly two prerendered case-study routes
│   │   └── 404.astro                  ← Truthful route-error page
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
│       ├── terminal-open.spec.ts      ← Real isolated tabs, fallbacks + invalid input
│       ├── case-studies.spec.ts       ← Disclosures, no-JS routes, metadata + 404s
│       ├── about.spec.ts              ← Shared content, no-JS links, metadata + theme
│       ├── experience.spec.ts         ← Approved copy, native links, layout + themes
│       └── visual.spec.ts             ← Visual regression (blocking)
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
