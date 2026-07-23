import { test, expect } from '@playwright/test';

/**
 * Visual regression smoke tests.
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
test.describe('visual regression', () => {
  test('homepage matches snapshot', async ({ page }) => {
    await page.goto('/');
    // Wait for page to settle before snapshotting
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('homepage.png', {
      animations: 'disabled',
    });
  });
});
