import { test, expect } from '@playwright/test';
import { ABOUT_PARAGRAPHS, PROJECTS, SKILL_GROUPS, CONTACT, PROFILE } from '../../src/lib/content';

/**
 * Smoke E2E tests — always run (no visual regression here).
 * These prove the pipeline is green end-to-end.
 */
test.describe('homepage', () => {
  test('loads and has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Earl Tankard Jr.*Software Engineer/i);
  });

  test('has a main heading', async ({ page }) => {
    await page.goto('/');
    const heading = page.locator('h1');
    await expect(heading).toHaveText(PROFILE.name);
    await expect(heading).toBeInViewport();
    await expect(page.locator('.role')).toHaveText(PROFILE.role);
    await expect(page.locator('.summary')).toBeInViewport();
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

  test('shows truthful path-independent error message', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Page not found');
    await expect(page.locator('main')).not.toContainText('/404');
    await expect(page.locator('main')).not.toContainText('GET ');
    expect(new URL(page.url()).pathname).toBe('/this-does-not-exist');
  });

  test('has a link back to home', async ({ page }) => {
    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();
    await homeLink.click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(PROFILE.name);
  });

  test('404 page has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/404/i);
  });
});


// Substantive HTML must be available without terminal interaction or JavaScript.
test.describe('static portfolio', () => {
  test.use({ javaScriptEnabled: false });

  for (const width of [1280, 390]) {
    test(`content and navigation without JavaScript at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');
      const main = page.locator('main');
      await expect(main.getByRole('heading', { level: 1 })).toHaveText(PROFILE.name);
      for (const section of ['Projects', 'About', 'Contact', 'Terminal']) {
        await expect(page.getByRole('navigation').getByRole('link', { name: section, exact: true }))
          .toHaveAttribute('href', `#${section.toLowerCase()}`);
        await expect(main.locator(`#${section.toLowerCase()}`)).toBeVisible();
      }
      for (const paragraph of ABOUT_PARAGRAPHS) await expect(main).toContainText(paragraph);
      for (const project of PROJECTS) {
        const card = main.getByRole('article', { name: project.name, exact: true });
        await expect(card).toContainText(project.description);
        await expect(card.locator(`a[href="${project.url}"]`)).toBeVisible();
        if (project.caseStudy) {
          await expect(card.getByRole('heading', { level: 3 })).toHaveText(project.caseStudy.title);
          await expect(card.getByRole('list', { name: 'Technologies', exact: true }).getByRole('listitem'))
            .toHaveText([...project.caseStudy.technologies]);
          await expect(card.getByRole('list', { name: 'Architecture flow', exact: true }).getByRole('listitem'))
            .toHaveText([...project.caseStudy.flow]);
          for (const field of ['problem', 'approach', 'tradeoff', 'evidence'] as const) {
            await expect(card).toContainText(project.caseStudy[field]);
          }
          for (const link of project.caseStudy.links) {
            await expect(card.getByRole('link', { name: link.label })).toHaveAttribute('href', link.url);
          }
        } else {
          await expect(card.getByRole('heading', { level: 3 })).toHaveText(project.name);
          await expect(card.locator('.case-study')).toHaveCount(0);
        }
      }
      await expect(main.locator('#projects article')).toHaveCount(7);
      await expect(main.locator('.featured-projects article')).toHaveCount(2);
      await expect(main.locator('.featured-projects .repo-name')).toHaveText(['dev-setup', 'phission']);
      await expect(main.locator('.other-projects article')).toHaveCount(5);
      await expect(main.locator('.other-projects article').first()).toHaveAttribute('aria-label', 'apple-music-playlist-converter');
      for (const group of SKILL_GROUPS) {
        for (const skill of group.items) await expect(main.locator('.skills')).toContainText(skill);
      }
      for (const link of CONTACT.links) {
        await expect(main.locator('#contact').getByRole('link', { name: link.label })).toHaveAttribute('href', link.url);
      }
      await expect(page.locator('.no-script')).toBeVisible();
      await expect(page.locator('#terminal-input')).toBeHidden();
      await page.getByRole('navigation').getByRole('link', { name: 'Contact', exact: true }).click();
      await expect(main.getByRole('heading', { name: 'Contact', exact: true })).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }

  test('unknown URL returns the real 404 even without JavaScript', async ({ page }) => {
    const response = await page.goto('/unknown-portfolio-route/nested');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await expect(page.locator('main')).not.toContainText('/404');
  });
});
