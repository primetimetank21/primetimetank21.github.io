import { test, expect } from '@playwright/test';
import { EXPERIENCE, PROFILE, RESUME } from '../../src/lib/content';
import { textContrast } from './helpers/contrast';

for (const javaScriptEnabled of [true, false]) {
  test.describe(`static Experience page, JavaScript ${javaScriptEnabled ? 'on' : 'off'}`, () => {
    test.use({ javaScriptEnabled });

    for (const width of [320, 390, 844, 1362]) {
      test(`approved content, native links and responsive layout at ${width}px`, async ({ page, context }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.goto('/#about');
        const entry = page.locator('#about .biography').getByRole('link', { name: 'View experience', exact: true });
        await expect(entry).toHaveAttribute('href', '/experience/');
        expect(await entry.getAttribute('target')).toBeNull();
        await expect(page.locator('#about').getByRole('link', { name: 'More about me', exact: true })).toHaveAttribute('href', '/about/');
        const responsePromise = page.waitForResponse(response => new URL(response.url()).pathname === '/experience/');
        await entry.click();
        expect((await responsePromise).status()).toBe(200);
        await expect(page).toHaveURL('/experience/');
        expect(context.pages()).toHaveLength(1);

        const main = page.locator('main');
        await expect(main.locator('h1')).toHaveText('Experience');
        await expect(main.locator('.intro')).toHaveText(EXPERIENCE.intro);
        await expect(main.locator('.engagement')).toHaveCount(4);
        await expect(main.locator('h2')).toHaveText([
          ...EXPERIENCE.engagements.map(engagement => engagement.employer), EXPERIENCE.publicWork.heading,
        ]);
        await expect(main.locator('h3')).toHaveText(EXPERIENCE.engagements.flatMap(engagement => engagement.contributions.map(contribution => contribution.title)));
        await expect(main.locator('h4, h5, h6, details, #terminal-input')).toHaveCount(0);
        await expect(main.locator('.current')).toHaveText(['Current role']);
        await expect(main).not.toContainText(/—|112%|LOCAL PROTOTYPE|Lavish|Annotate|live site|live PDF|new tab|local review only/i);
        await expect(main.locator('a[target], a[onclick], button')).toHaveCount(0);
        await expect(main.locator('a[download]')).toHaveCount(1);
        await expect(main.locator('.document-meta')).toHaveText(`The one-page version · updated ${RESUME.updated}`);
        await expect(main.locator('.public-work > p')).toHaveText(EXPERIENCE.publicWork.intro);
        await expect(main.locator('.study-links > li > span')).toHaveText(EXPERIENCE.publicWork.links.map(link => link.description));

        for (const engagement of EXPERIENCE.engagements) {
          const section = main.locator(`.engagement[aria-labelledby="${engagement.id}"]`);
          await expect(section).toHaveAccessibleName(engagement.employer);
          await expect(section.locator('.role')).toHaveText(engagement.role);
          await expect(section.locator('.period')).toHaveText(engagement.period);
          for (let index = 0; index < engagement.contributions.length; index++) {
            const contribution = engagement.contributions[index];
            const body = section.locator('.contribution').nth(index);
            await expect(body.locator('h3')).toHaveText(contribution.title);
            await expect(body.locator('.contribution-description')).toHaveText(contribution.description);
            if ('period' in contribution) {
              await expect(body.locator('.contribution-period')).toHaveText(contribution.period);
              const label = contribution.technologies.length === 1 ? 'Technology used: ' : 'Technologies used: ';
              await expect(body.locator('.technologies')).toHaveText(label + contribution.technologies.join(' · '));
              await expect(body.locator('.sr-only')).toHaveText(label.trim());
            } else {
              await expect(body.locator('.contribution-period, .technologies')).toHaveCount(0);
            }
          }
        }
        await page.evaluate(() => document.fonts.ready);
        expect(await main.locator('h1').evaluate(el => getComputedStyle(el).fontFamily)).toContain('JetBrains Mono');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect((await main.locator('.experience-page').boundingBox())!.width).toBeLessThanOrEqual(1080);
        for (const section of await main.locator('.engagement').all()) {
          const meta = (await section.locator('.engagement-meta').boundingBox())!;
          const contributions = (await section.locator('.contributions').boundingBox())!;
          if (width <= 600) {
            expect(contributions.x).toBeCloseTo(meta.x, 0);
            expect(contributions.y).toBeGreaterThan(meta.y + meta.height);
          } else {
            expect(contributions.x).toBeGreaterThan(meta.x + meta.width);
            expect(contributions.y).toBeCloseTo(meta.y, 0);
          }
        }
        // Visible text must wrap within its element, not merely fit the document width.
        const overflowingText = await main.evaluate(root => {
          const failures: string[] = [];
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          let node: Node | null;
          while ((node = walker.nextNode())) {
            const el = node.parentElement!;
            if (!node.textContent?.trim() || el.closest('.sr-only')) continue;
            const box = el.getBoundingClientRect();
            const range = document.createRange();
            range.selectNodeContents(node);
            if ([...range.getClientRects()].some(rect => rect.left < box.left - 1 || rect.right > box.right + 1)) {
              failures.push(node.textContent.trim());
            }
          }
          return failures;
        });
        expect(overflowingText).toEqual([]);
        if (!javaScriptEnabled) await expect(page.getByTestId('theme-toggle')).toBeHidden();

        for (const link of [...EXPERIENCE.publicWork.links, { label: 'More about how I work', url: '/about/' }]) {
          const anchor = main.getByRole('link', { name: link.label, exact: true });
          await expect(anchor).toHaveAttribute('href', link.url);
          expect(await anchor.getAttribute('target')).toBeNull();
          await anchor.click();
          await expect(page).toHaveURL(link.url);
          expect(context.pages()).toHaveLength(1);
          await page.goBack();
          await expect(page).toHaveURL('/experience/');
        }
        await main.getByRole('link', { name: 'Back to top', exact: true }).click();
        await expect(page).toHaveURL('/experience/#main-content');
        await expect(main).toBeFocused();
        await expect(main.locator('h1')).toBeInViewport();
      });
    }

    for (const width of [320, 1362]) {
      test(`keyboard reaches all body links and returns focus to main at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.goto('/experience/');
        await page.keyboard.press('Tab');
        await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(page.locator('main')).toBeFocused();
        for (const label of ['Download résumé (PDF)', 'dev-setup', 'Phission', 'More about how I work', 'Back to top']) {
          await page.keyboard.press('Tab');
          const link = page.locator('main').getByRole('link', { name: label, exact: true });
          await expect(link).toBeFocused();
          await expect(link).toBeInViewport();
          expect(parseFloat(await link.evaluate(el => getComputedStyle(el).outlineWidth))).toBeGreaterThanOrEqual(2);
        }
        await page.keyboard.press('Enter');
        await expect(page.locator('main')).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(page.getByRole('link', { name: 'Download résumé (PDF)', exact: true })).toBeFocused();
      });
    }
  });
}

for (const width of [320, 390, 844, 1362]) {
  for (const theme of ['dark', 'light'] as const) {
    test(`Experience ${theme} theme, contrast and persistence at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.addInitScript(theme => {
        if (!localStorage.getItem('theme')) localStorage.setItem('theme', theme);
      }, theme);
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('/experience/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const samples = await page.evaluate(textContrast);
      expect(samples.length).toBeGreaterThan(45);
      expect(samples.filter(sample => sample.ratio < 4.5)).toEqual([]);
      const next = theme === 'dark' ? 'light' : 'dark';
      const toggle = page.getByTestId('theme-toggle');
      await expect(toggle).toHaveAccessibleName(`Switch to ${next} theme`);
      await toggle.click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', next);
      await expect(toggle).toHaveAccessibleName(`Switch to ${theme} theme`);
      await expect(toggle).toHaveAttribute('aria-pressed', String(next === 'light'));
      expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(next);
      expect(await page.evaluate(() => localStorage.getItem('experience-prototype-theme'))).toBeNull();
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-theme', next);
      await page.locator('.study-links a').first().click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', next);
      await page.goBack();
      await expect(page).toHaveURL('/experience/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', next);
      await page.getByRole('navigation').getByRole('link', { name: 'Home', exact: true }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', next);
      expect(errors).toEqual([]);
    });
  }
}

for (const javaScriptEnabled of [true, false]) {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    test.describe(`Experience back-to-top motion, JS ${javaScriptEnabled}, ${reducedMotion}`, () => {
      test.use({ javaScriptEnabled, contextOptions: { reducedMotion } });
      for (const width of [1280, 390]) {
        test(`native scrolling preserves preference and focus at ${width}px`, async ({ page }) => {
          await page.setViewportSize({ width, height: 844 });
          await page.goto('/experience/');
          await page.evaluate(() => document.fonts.ready);
          expect(await page.locator('html').evaluate(el => getComputedStyle(el).scrollBehavior))
            .toBe(reducedMotion === 'reduce' ? 'auto' : 'smooth');
          const main = page.locator('main');
          const targetTop = await main.evaluate(el => el.getBoundingClientRect().top + window.scrollY);
          const back = main.getByRole('link', { name: 'Back to top', exact: true });
          await expect(back).toHaveAttribute('href', '#main-content');
          await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
          await expect(back).toBeInViewport();
          const start = await page.evaluate(() => window.scrollY);
          expect(start).toBeGreaterThan(targetTop + 500);
          if (javaScriptEnabled) await back.click();
          else { await back.focus(); await page.keyboard.press('Enter'); }
          await expect(page).toHaveURL('/experience/#main-content');
          await expect(main).toBeFocused();
          // Sample from the test process: page rAF/event callbacks do not run
          // with JavaScript disabled, but native CSS scrolling still does.
          const positions: number[] = [];
          await expect.poll(async () => {
            const y = await page.evaluate(() => window.scrollY);
            positions.push(y);
            return y;
          }, { intervals: [16] }).toBeLessThanOrEqual(Math.ceil(targetTop));
          const intermediate = positions.filter(y => y < start - 1 && y > targetTop + 1);
          if (reducedMotion === 'reduce') expect(intermediate).toEqual([]);
          else expect(intermediate.length).toBeGreaterThan(2);
          await expect(main.locator('h1')).toBeInViewport();
          await page.keyboard.press('Tab');
          await expect(main.getByRole('link', { name: 'Download résumé (PDF)', exact: true })).toBeFocused();
          await page.goto('/about/');
          expect(await page.locator('html').evaluate(el => getComputedStyle(el).scrollBehavior)).toBe('auto');
        });
      }
    });
  }
}

test('Experience metadata and production assets have no prototype wrapper', async ({ page, request }) => {
  const response = await page.goto('/experience/');
  expect(response?.status()).toBe(200);
  expect(await response!.text()).not.toMatch(/experience-prototype-theme|prototype-note|LOCAL PROTOTYPE|Lavish|data:font|{{/);
  const title = `Experience | ${PROFILE.name}`;
  const canonical = 'https://primetimetank21.github.io/experience/';
  await expect(page).toHaveTitle(title);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
  for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
    await expect(page.locator(selector)).toHaveAttribute('content', title);
  }
  for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
    await expect(page.locator(selector)).toHaveAttribute('content', EXPERIENCE.intro);
  }
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  const assets = await page.locator('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="stylesheet"], script[src]').evaluateAll(elements =>
    elements.map(el => el.getAttribute('href') ?? el.getAttribute('src')!),
  );
  expect(assets.length).toBeGreaterThan(3);
  for (const asset of assets) {
    expect(asset).toMatch(/^\/(?!\/|experience\/)/);
    expect((await request.get(asset)).status()).toBe(200);
  }
});
