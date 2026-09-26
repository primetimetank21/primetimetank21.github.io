import { test, expect } from '@playwright/test';
import { PROFILE, ABOUT_PARAGRAPHS, SKILL_GROUPS, CASE_STUDIES, CONTACT } from '../../src/lib/content';
import { textContrast } from './helpers/contrast';

test.describe('static About page', () => {
  test.use({ javaScriptEnabled: false });

  for (const width of [1280, 390, 320]) {
    test(`shared content and native navigation work without JavaScript at ${width}px`, async ({ page, context }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');
      const aboutNav = page.getByRole('navigation').getByRole('link', { name: 'About', exact: true });
      await expect(aboutNav).toHaveAttribute('href', '/about/');
      await aboutNav.click();
      await expect(page).toHaveURL('/about/');
      expect(context.pages()).toHaveLength(1);
      await page.goto('/#about');
      await expect(page.locator('#about-heading')).toBeInViewport();
      await expect(page.locator('#about .biography p').filter({ hasNot: page.locator('a') })).toHaveText([...ABOUT_PARAGRAPHS]);
      const more = page.locator('#about').getByRole('link', { name: 'More about me', exact: true });
      await expect(more).toBeVisible();
      await expect(more).toHaveAttribute('href', '/about/');
      expect(await more.getAttribute('target')).toBeNull();
      const responsePromise = page.waitForResponse(response => new URL(response.url()).pathname === '/about/');
      await more.click();
      expect((await responsePromise).status()).toBe(200);
      await expect(page).toHaveURL('/about/');
      expect(context.pages()).toHaveLength(1);

      const main = page.locator('main');
      await expect(main.locator('h1')).toHaveText(PROFILE.name);
      await expect(main.locator('.role')).toHaveText(PROFILE.role);
      await expect(main.locator('.summary')).toHaveText(PROFILE.summary);
      await expect(main.locator('h2')).toHaveText(['How I work', 'Skills & tools', 'Public work', 'Contact']);
      await expect(main.locator('h3, h4, h5, h6')).toHaveCount(0);
      await expect(main.locator('.biography p')).toHaveText([...ABOUT_PARAGRAPHS]);
      await expect(main.locator('.skills dt')).toHaveText(SKILL_GROUPS.map(group => group.label));
      await expect(main.locator('.skills dd')).toHaveText(SKILL_GROUPS.map(group => group.items.join(' · ')));
      await expect(main.getByText(CONTACT.summary, { exact: true })).toBeVisible();
      await expect(main.locator('a')).toHaveCount(CASE_STUDIES.length + CONTACT.links.length);
      for (const contact of CONTACT.links) {
        const link = main.getByRole('link', { name: contact.label, exact: true });
        await expect(link).toHaveAttribute('href', contact.url);
        await expect(link).toBeVisible();
        expect(await link.getAttribute('target')).toBeNull();
      }
      await expect(page.getByTestId('theme-toggle')).toBeHidden();
      await expect(page.locator('#terminal-input, details')).toHaveCount(0);
      await page.evaluate(() => document.fonts.ready);
      expect(await main.locator('h1').evaluate(el => getComputedStyle(el).fontFamily)).toContain('JetBrains Mono');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

      const nav = page.getByRole('navigation', { name: 'Site navigation' });
      await expect(nav.getByRole('link')).toHaveText(['Home', 'About', 'Projects', 'Contact', 'Terminal']);
      await expect(nav.locator('[aria-current]')).toHaveCount(1);
      const current = nav.getByRole('link', { name: 'About', exact: true });
      await expect(current).toHaveAttribute('href', '/about/');
      await expect(current).toHaveAttribute('aria-current', 'page');
      expect(await current.getAttribute('target')).toBeNull();
      for (const [label, href] of [['Home', '/'], ['Projects', '/#projects'], ['Contact', '/#contact'], ['Terminal', '/#terminal']]) {
        const link = nav.getByRole('link', { name: label, exact: true });
        await expect(link).toHaveAttribute('href', href);
        expect(await link.getAttribute('target')).toBeNull();
        await link.click();
        await expect(page).toHaveURL(href);
        if (label !== 'Home') await expect(page.locator(`#${label.toLowerCase()}-heading`)).toBeInViewport();
        expect(context.pages()).toHaveLength(1);
        await page.goBack();
        await expect(page).toHaveURL('/about/');
      }
      for (const project of CASE_STUDIES) {
        const link = main.getByRole('link', { name: `${project.name} — ${project.caseStudy.title}`, exact: true });
        await expect(link).toHaveAttribute('href', project.caseStudy.path);
        expect(await link.getAttribute('target')).toBeNull();
        await link.click();
        await expect(page).toHaveURL(project.caseStudy.path);
        await expect(page.locator('h1')).toHaveText(project.caseStudy.title);
        expect(context.pages()).toHaveLength(1);
        await page.goBack();
        await expect(page).toHaveURL('/about/');
      }
    });
  }

  test('has About-specific metadata and root-relative working assets', async ({ page, request }) => {
    expect((await page.goto('/about/'))?.status()).toBe(200);
    const title = `About | ${PROFILE.name}`;
    const description = `${PROFILE.role}. ${PROFILE.summary}`;
    const canonical = 'https://primetimetank21.github.io/about/';
    await expect(page).toHaveTitle(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
      await expect(page.locator(selector)).toHaveAttribute('content', title);
    }
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
      await expect(page.locator(selector)).toHaveAttribute('content', description);
    }
    const assets = await page.locator('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="stylesheet"], script[src]').evaluateAll(elements =>
      elements.map(el => el.getAttribute('href') ?? el.getAttribute('src')!),
    );
    expect(assets.length).toBeGreaterThan(3);
    for (const asset of assets) {
      expect(asset).toMatch(/^\/(?!\/|about\/)/);
      expect((await request.get(asset)).status()).toBe(200);
    }
  });

  test('public contact links navigate in the same tab without JavaScript', async ({ page, context }) => {
    for (const contact of CONTACT.links) {
      // Exercise native navigation without depending on external services.
      await page.route(contact.url, route => route.fulfill({ contentType: 'text/html', body: '<h1>Contact destination</h1>' }));
      await page.goto('/about/');
      await page.locator('main').getByRole('link', { name: contact.label, exact: true }).click();
      await expect(page).toHaveURL(contact.url);
      await expect(page.locator('h1')).toHaveText('Contact destination');
      expect(context.pages()).toHaveLength(1);
    }
  });
});

for (const width of [1280, 390]) {
  for (const theme of ['dark', 'light'] as const) {
    test(`About supports ${theme} theme, contrast and persistence at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.addInitScript(theme => {
        if (!localStorage.getItem('theme')) localStorage.setItem('theme', theme);
      }, theme);
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('/');
      await page.getByRole('link', { name: 'More about me', exact: true }).click();
      await expect(page).toHaveURL('/about/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.locator('.biography p')).toHaveText([...ABOUT_PARAGRAPHS]);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const samples = await page.evaluate(textContrast);
      expect(samples.length).toBeGreaterThan(20);
      expect(samples.filter(sample => sample.ratio < 4.5)).toEqual([]);

      const next = theme === 'dark' ? 'light' : 'dark';
      const toggle = page.getByTestId('theme-toggle');
      await expect(toggle).toHaveAccessibleName(`Switch to ${next} theme`);
      await toggle.click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', next);
      await expect(toggle).toHaveAccessibleName(`Switch to ${theme} theme`);
      await expect(toggle).toHaveAttribute('aria-pressed', String(next === 'light'));
      expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(next);
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-theme', next);
      await page.locator('.study-links a').first().click();
      await expect(page).toHaveURL('/projects/dev-setup/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', next);
      await page.goBack();
      await expect(page).toHaveURL('/about/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', next);
      await page.getByRole('navigation').getByRole('link', { name: 'Home', exact: true }).click();
      await expect(page).toHaveURL('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', next);
      expect(errors).toEqual([]);
    });
  }

  test(`About keyboard navigation exposes skip, current-page link and theme control at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto('/about/');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    await page.goto('/about/');
    const nav = page.getByRole('navigation');
    await page.keyboard.press('Tab'); // Skip link
    for (const label of ['Home', 'About', 'Projects', 'Contact', 'Terminal']) {
      await page.keyboard.press('Tab');
      const link = nav.getByRole('link', { name: label, exact: true });
      await expect(link).toBeFocused();
      expect(parseFloat(await link.evaluate(el => getComputedStyle(el).outlineWidth))).toBeGreaterThanOrEqual(2);
    }
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('theme-toggle')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
}
