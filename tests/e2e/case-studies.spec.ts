import { test, expect } from '@playwright/test';
import { CASE_STUDIES, PROFILE } from '../../src/lib/content';

for (const javaScriptEnabled of [true, false]) {
  test.describe(`native disclosures with JavaScript ${javaScriptEnabled ? 'on' : 'off'}`, () => {
    test.use({ javaScriptEnabled });

    for (const width of [1280, 390]) {
      test(`keyboard toggling is independent and keeps focus at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.goto('/');
        const cards = page.locator('.featured-projects article');
        const first = cards.nth(0).locator('details');
        const second = cards.nth(1).locator('details');
        await expect(first).not.toHaveAttribute('open');
        await expect(second).not.toHaveAttribute('open');
        const summary = first.locator('summary');
        await expect(summary).toHaveAccessibleName('See more about dev-setup');
        await expect(second.locator('summary')).toHaveAccessibleName('See more about phission');
        const closedHeight = (await cards.nth(1).boundingBox())!.height;
        // Reach the actual summary with native keyboard navigation, not focus().
        for (let i = 0; i < 20 && !await summary.evaluate(el => el === document.activeElement); i++) {
          await page.keyboard.press('Tab');
        }
        await expect(summary).toBeFocused();
        expect(parseFloat(await summary.evaluate(el => getComputedStyle(el).outlineWidth))).toBeGreaterThanOrEqual(2);
        expect((await summary.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        await page.keyboard.press('Enter');
        await expect(first).toHaveAttribute('open');
        await expect(second).not.toHaveAttribute('open');
        await expect(summary).toBeFocused();
        expect((await cards.nth(1).boundingBox())!.height).toBeCloseTo(closedHeight, 0);
        await expect(first.getByRole('heading', { name: 'Evidence', exact: true })).toBeVisible();
        await page.keyboard.press('Space');
        await expect(first).not.toHaveAttribute('open');
        await expect(summary).toBeFocused();
        await second.locator('summary').click();
        await expect(first).not.toHaveAttribute('open');
        await expect(second).toHaveAttribute('open');
        await summary.click();
        await expect(first).toHaveAttribute('open');
        await expect(second).toHaveAttribute('open');
        await summary.click();
        await expect(first).not.toHaveAttribute('open');
        await expect(second).toHaveAttribute('open');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      });
    }
  });
}

test.describe('static case-study pages', () => {
  test.use({ javaScriptEnabled: false });

  for (const project of CASE_STUDIES) {
    for (const width of [1280, 390]) {
      test(`${project.name} has the same full content, metadata and navigation at ${width}px`, async ({ page, context, request }) => {
        const study = project.caseStudy;
        await page.setViewportSize({ width, height: 844 });
        await page.goto('/');
        const card = page.getByRole('article', { name: project.name, exact: true });
        await card.locator('summary').click();
        const homeBody = await card.locator('.case-study').innerText();
        const link = card.getByRole('link', { name: `Read case study for ${project.name}` });
        expect(await link.getAttribute('target')).toBeNull();
        const responsePromise = page.waitForResponse(response => new URL(response.url()).pathname === study.path);
        await link.click();
        expect((await responsePromise).status()).toBe(200);
        await expect(page).toHaveURL(study.path);
        expect(context.pages()).toHaveLength(1); // ordinary same-tab navigation
        expect(await page.locator('.case-study').innerText()).toBe(homeBody);
        await expect(page.locator('details')).toHaveCount(0);
        await expect(page.locator('h1')).toHaveText(study.title);
        await expect(page.locator('h2')).toHaveText(['Problem', 'Approach', 'Engineering trade-off', 'Evidence']);
        await expect(page.locator('h3, h4, h5, h6')).toHaveCount(0);
        await expect(page.getByRole('list', { name: 'Technologies', exact: true }).getByRole('listitem')).toHaveText([...study.technologies]);
        await expect(page.getByRole('list', { name: 'Architecture flow', exact: true }).getByRole('listitem')).toHaveText([...study.flow]);
        for (const field of ['problem', 'approach', 'tradeoff', 'evidence'] as const) {
          await expect(page.getByText(study[field], { exact: true })).toBeVisible();
        }
        for (const evidence of study.links) {
          await expect(page.getByRole('link', { name: evidence.label })).toHaveAttribute('href', evidence.url);
          await expect(page.getByRole('link', { name: evidence.label })).toBeVisible();
        }
        await expect(page.getByRole('link', { name: `Source for ${project.name}` })).toHaveAttribute('href', project.url);
        const title = `${project.name} — ${study.title} | ${PROFILE.name}`;
        await expect(page).toHaveTitle(title);
        await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', project.description);
        await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
        await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', project.description);
        const canonical = `https://primetimetank21.github.io${study.path}`;
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
        await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
        // Public and bundled assets must resolve at nested URLs, not under /projects/.
        const assets = await page.locator('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="stylesheet"], script[src]').evaluateAll(elements =>
          elements.map(el => el.getAttribute('href') ?? el.getAttribute('src')!),
        );
        expect(assets.length).toBeGreaterThan(3);
        for (const asset of assets) {
          expect(asset).toMatch(/^\/(?!\/|projects\/)/);
          expect((await request.get(asset)).status()).toBe(200);
        }
        await page.evaluate(() => document.fonts.ready);
        expect(await page.locator('h1').evaluate(el => getComputedStyle(el).fontFamily)).toContain('JetBrains Mono');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect(page.getByTestId('theme-toggle')).toBeHidden(); // no dead control without JS
        for (const [label, href] of [['Home', '/'], ['Projects', '/#projects'], ['Contact', '/#contact'], ['Terminal', '/#terminal']]) {
          await expect(page.getByRole('navigation').getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href);
        }
        await page.getByRole('link', { name: '← Back to projects' }).last().click();
        await expect(page).toHaveURL('/#projects');
        await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeInViewport();
      });
    }
  }

  for (const path of ['/projects/missing/', '/projects/dev-setup/nested/', '/projects/phission/nested/', '/projects/apple-music-playlist-converter/', '/about/']) {
    test(`${path} remains a real 404`, async ({ page }) => {
      expect((await page.goto(path))?.status()).toBe(404);
      await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Page not found');
      await expect(page.locator('main')).not.toContainText('/404');
      await page.getByRole('link', { name: 'Return to portfolio' }).click();
      await expect(page).toHaveURL('/');
    });
  }
});

test('sitemap contains exactly home and the two case-study routes', async ({ request }) => {
  const index = await request.get('/sitemap-index.xml');
  expect(index.status()).toBe(200);
  const sitemapURL = (await index.text()).match(/<loc>(.*?)<\/loc>/)![1];
  const sitemap = await request.get(new URL(sitemapURL).pathname);
  expect(sitemap.status()).toBe(200);
  const locations = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  expect(locations.sort()).toEqual([
    'https://primetimetank21.github.io/',
    ...CASE_STUDIES.map(project => `https://primetimetank21.github.io${project.caseStudy.path}`),
  ].sort());
});

for (const project of CASE_STUDIES) {
  test(`${project.name} theme toggle works and persists through back navigation`, async ({ page }) => {
    await page.addInitScript(() => { if (!localStorage.getItem('theme')) localStorage.setItem('theme', 'dark'); });
    await page.goto(project.caseStudy.path);
    const toggle = page.getByTestId('theme-toggle');
    await expect(toggle).toHaveAccessibleName('Switch to light theme');
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(toggle).toHaveAccessibleName('Switch to dark theme');
    await page.getByRole('link', { name: '← Back to projects' }).first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
}
