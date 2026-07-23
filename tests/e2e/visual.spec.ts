import { test, expect } from '@playwright/test';

/**
 * Visual regression specs.
 *
 * ⚠️  BASELINES MUST BE LINUX-GENERATED.
 *   These tests are advisory in CI (continue-on-error) until baselines
 *   are committed. To generate/refresh baselines:
 *
 *   RECOMMENDED: Actions → "Update Visual Baselines" → Run workflow
 *   (commits Linux snapshots directly — no Docker needed locally).
 *
 *   See README.md § "Visual Regression Baselines" for full procedure.
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
