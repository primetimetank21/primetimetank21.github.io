import { test, expect } from '@playwright/test';

/**
 * Smoke E2E tests — always run (no visual regression here).
 * These prove the pipeline is green end-to-end.
 */
test.describe('homepage', () => {
  test('loads and has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/primetimetank21/i);
  });

  test('has a main heading', async ({ page }) => {
    await page.goto('/');
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });
});
