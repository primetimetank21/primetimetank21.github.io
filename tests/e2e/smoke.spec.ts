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

// ── Meta tags ─────────────────────────────────────────────────────────────────

test.describe('SEO meta tags', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has meta description', async ({ page }) => {
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
    expect(desc!.length).toBeGreaterThan(10);
  });

  test('has og:title', async ({ page }) => {
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
  });

  test('has og:description', async ({ page }) => {
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content');
    expect(ogDesc).toBeTruthy();
  });

  test('has og:image', async ({ page }) => {
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toBeTruthy();
    expect(ogImage).toContain('primetimetank21.github.io');
  });

  test('has og:url', async ({ page }) => {
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    expect(ogUrl).toBeTruthy();
    expect(ogUrl).toContain('primetimetank21.github.io');
  });

  test('has twitter:card', async ({ page }) => {
    const card = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    expect(card).toBe('summary_large_image');
  });

  test('has canonical link', async ({ page }) => {
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBeTruthy();
    expect(canonical).toContain('primetimetank21.github.io');
  });

  test('has favicon SVG', async ({ page }) => {
    const favicon = await page.locator('link[rel="icon"][type="image/svg+xml"]').getAttribute('href');
    expect(favicon).toBe('/favicon.svg');
  });

  test('has apple-touch-icon', async ({ page }) => {
    const atIcon = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
    expect(atIcon).toBeTruthy();
  });

  test('html has lang attribute', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('en');
  });

  test('has theme-color meta', async ({ page }) => {
    const themeColor = await page.locator('meta[name="theme-color"]').first().getAttribute('content');
    expect(themeColor).toBeTruthy();
  });
});

// ── 404 page ──────────────────────────────────────────────────────────────────

test.describe('404 page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/this-does-not-exist');
  });

  test('shows 404 terminal window', async ({ page }) => {
    const notFound = page.locator('[data-testid="not-found-page"]');
    await expect(notFound).toBeVisible();
  });

  test('shows command-not-found error message', async ({ page }) => {
    await expect(page.locator('body')).toContainText('command not found');
  });

  test('has a link back to home', async ({ page }) => {
    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();
  });

  test('404 page has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/404/i);
  });
});

