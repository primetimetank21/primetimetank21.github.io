import { test, expect } from '@playwright/test';

/**
 * Visual regression specs — BLOCKING gate in CI.
 *
 * Baselines MUST be Linux-generated (same pinned Playwright image as CI).
 * Windows/macOS font rendering differs → committing non-Linux baselines = flake.
 *
 * ── Blessing intentional UI changes (PR flow) ────────────────────────────────
 *   1. Make your change, push to your PR branch.
 *   2. If the visual check fails (expected for visible layout changes):
 *        Actions → "Update Visual Baselines" → Run workflow
 *        branch input: <your-pr-branch>   (e.g. squad/issue-26-m4-polish)
 *   3. The workflow regenerates baselines in the Linux container and commits
 *      them directly to your PR branch. The visual check re-runs automatically
 *      and turns green once the commit lands.
 *   4. Review the new PNGs in your PR diff before merging — they ARE the record
 *      of what the site looks like.
 *
 * ── Updating baselines after a merge to main ─────────────────────────────────
 *   Same workflow, branch input: main (the default). This creates a
 *   baselines/auto-<run-id> branch + PR (branch protection on main prevents
 *   direct push). Earl can also merge manually: gh pr merge --admin --squash.
 *
 * ── Local alternative (requires Docker) ─────────────────────────────────────
 *   See README.md § "Visual Regression Baselines".
 */

// ─── Homepage (legacy) ────────────────────────────────────────────────────────

test.describe('visual regression', () => {
  test('homepage matches snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('homepage.png', {
      animations: 'disabled',
    });
  });
});

// ─── Terminal — dark theme ────────────────────────────────────────────────────

test.describe('terminal dark theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  });

  test('empty state — desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('terminal-dark-empty-desktop.png', {
      animations: 'disabled',
    });
  });

  test('post-command (help) — desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('#terminal-input').pressSequentially('help');
    await page.locator('#terminal-input').press('Enter');
    // Wait for output to appear
    await page.locator('#terminal-output').waitFor({ state: 'visible' });
    await expect(page).toHaveScreenshot('terminal-dark-post-command-desktop.png', {
      animations: 'disabled',
    });
  });

  test('empty state — mobile (390×844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('terminal-dark-empty-mobile.png', {
      animations: 'disabled',
    });
  });
});

// ─── Terminal — light theme ───────────────────────────────────────────────────

test.describe('terminal light theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'light'));
  });

  test('empty state — desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('terminal-light-empty-desktop.png', {
      animations: 'disabled',
    });
  });

  test('post-command (help) — desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('#terminal-input').pressSequentially('help');
    await page.locator('#terminal-input').press('Enter');
    await page.locator('#terminal-output').waitFor({ state: 'visible' });
    await expect(page).toHaveScreenshot('terminal-light-post-command-desktop.png', {
      animations: 'disabled',
    });
  });

  test('empty state — mobile (390×844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('terminal-light-empty-mobile.png', {
      animations: 'disabled',
    });
  });
});

// ─── 404 page ─────────────────────────────────────────────────────────────────

test.describe('404 page', () => {
  test('404 dark theme — desktop', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/this-page-does-not-exist');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('404-dark-desktop.png', {
      animations: 'disabled',
    });
  });

  test('404 light theme — desktop', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'light'));
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/this-page-does-not-exist');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('404-light-desktop.png', {
      animations: 'disabled',
    });
  });

  test('404 dark theme — mobile (390×844)', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/this-page-does-not-exist');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('404-dark-mobile.png', {
      animations: 'disabled',
    });
  });

  test('404 light theme — mobile (390×844)', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'light'));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/this-page-does-not-exist');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('404-light-mobile.png', {
      animations: 'disabled',
    });
  });
});
