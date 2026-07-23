import { test, expect } from '@playwright/test';

/**
 * Visual regression smoke tests.
 *
 * ⚠️  BASELINES MUST BE LINUX-GENERATED.
 *   These tests are advisory in CI (continue-on-error) until baselines
 *   are committed. To generate/refresh baselines:
 *
 *   docker run --rm -v ${PWD}:/work -w /work \
 *     mcr.microsoft.com/playwright:v1.61.1-noble \
 *     npx playwright test tests/e2e/visual.spec.ts --update-snapshots
 *
 *   Then commit the updated files in tests/e2e/__snapshots__/.
 *   See README.md § "Visual regression baselines" for full procedure.
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
