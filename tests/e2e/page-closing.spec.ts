import { test, expect, type Page } from '@playwright/test';
import { CASE_STUDIES } from '../../src/lib/content';
import { textContrast } from './helpers/contrast';

const routes = [
  { path: '/', nextLink: 'Explore projects', preceding: '#terminal' },
  { path: '/about/', nextLink: 'dev-setup — Development environment automation', preceding: 'section[aria-labelledby="contact-heading"]' },
  { path: '/experience/', nextLink: 'Download résumé (PDF)', preceding: '.public-work' },
  ...CASE_STUDIES.map(project => ({ path: project.caseStudy.path, nextLink: '← Back to projects', preceding: '.case-study' })),
];

async function expectNativeScroll(page: Page, start: number, target: number, reducedMotion: 'reduce' | 'no-preference') {
  // Test-process polling works even when page rAF/listeners are disabled.
  const positions: number[] = [];
  await expect.poll(async () => {
    const y = await page.evaluate(() => window.scrollY);
    positions.push(y);
    return Math.abs(y - target);
  }, { intervals: [16] }).toBeLessThanOrEqual(1);
  const intermediate = positions.filter(y => y > Math.min(start, target) + 1 && y < Math.max(start, target) - 1);
  if (reducedMotion === 'reduce') expect(intermediate).toEqual([]);
  else expect(intermediate.length).toBeGreaterThan(2);
}

// Generalized from Experience: exercise native motion, not just computed CSS.
// Both activation methods work with scripts on/off and either motion preference.
for (const javaScriptEnabled of [true, false]) {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    test.describe(`page closing, JS ${javaScriptEnabled}, ${reducedMotion}`, () => {
      test.use({ javaScriptEnabled, contextOptions: { reducedMotion } });
      for (const width of [1280, 320]) {
        for (const route of routes) {
          test(`${route.path} native ${width === 320 ? 'keyboard' : 'pointer'} return at ${width}px`, async ({ page, context }) => {
            await page.setViewportSize({ width, height: 844 });
            expect((await page.goto(route.path))?.status()).toBe(200);
            await page.evaluate(() => document.fonts.ready);
            await expect(page.locator('html')).toHaveCSS('scroll-behavior', reducedMotion === 'reduce' ? 'auto' : 'smooth');
            const main = page.locator('#main-content');
            await expect(main).toHaveCount(1);
            await expect(main).toHaveAttribute('tabindex', '-1');
            const targetTop = await main.evaluate(el => el.getBoundingClientRect().top + window.scrollY);
            const back = page.getByRole('link', { name: 'Back to top', exact: true });
            await expect(back).toHaveCount(1);
            await expect(back).toHaveAttribute('href', '#main-content');
            for (const attribute of ['target', 'role', 'tabindex', 'onclick', 'onkeydown']) {
              expect(await back.getAttribute(attribute)).toBeNull();
            }
            if (width === 320) {
              // Real Tab traversal also checks that the homepage terminal is not a trap.
              for (let i = 0; i < 60 && !await back.evaluate(el => el === document.activeElement); i++) {
                await page.keyboard.press('Tab');
              }
              await expect(back).toBeFocused();
              expect(await back.evaluate(el => el.matches(':focus-visible'))).toBe(true);
              await expect(back).toHaveCSS('outline-width', '2px');
            }
            await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
            await expect(back).toBeInViewport();
            const start = await page.evaluate(() => window.scrollY);
            expect(start).toBeGreaterThan(targetTop + 100); // Short studies still have a meaningful scroll distance.
            if (width === 320) await page.keyboard.press('Enter');
            else await back.click();
            await expect(page).toHaveURL(`${route.path}#main-content`);
            await expect(main).toBeFocused();
            await expectNativeScroll(page, start, targetTop, reducedMotion);
            await expect(main.locator('h1')).toBeInViewport();
            await page.keyboard.press('Tab');
            await expect(main.getByRole('link', { name: route.nextLink, exact: true }).first()).toBeFocused();
            expect(context.pages()).toHaveLength(1);
          });
        }
      }

      for (const width of [1280, 320]) {
        test(`homepage fragments settle before subsequent native navigation at ${width}px`, async ({ page }) => {
          await page.setViewportSize({ width, height: 844 });
          await page.goto('/');
          await page.evaluate(() => document.fonts.ready);
          for (const section of ['projects', 'contact', 'terminal']) {
            await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
            const target = await page.locator(`#${section}`).evaluate(el => Math.min(
              el.getBoundingClientRect().top + window.scrollY - parseFloat(getComputedStyle(el).scrollMarginTop),
              document.documentElement.scrollHeight - innerHeight,
            ));
            await page.getByRole('navigation').locator(`a[href="/#${section}"]`).click();
            await expect(page).toHaveURL(`/#${section}`);
            await expectNativeScroll(page, 0, target, reducedMotion);
            await expect(page.locator(`#${section}-heading`)).toBeInViewport();
          }
          await page.getByRole('navigation').getByRole('link', { name: 'Home', exact: true }).click();
          await expect(page).toHaveURL('/');
          await expect(page.locator('h1')).toBeInViewport();
          // A fresh fragment URL also completes before activating a link in that section.
          await page.goto('/#about');
          const target = await page.locator('#about').evaluate(el =>
            el.getBoundingClientRect().top + window.scrollY - parseFloat(getComputedStyle(el).scrollMarginTop),
          );
          await expect.poll(async () => Math.abs(await page.evaluate(() => window.scrollY) - target)).toBeLessThanOrEqual(1);
          await page.getByRole('link', { name: 'More about me', exact: true }).click();
          await expect(page).toHaveURL('/about/');
          await expect(page.locator('#about-title')).toBeInViewport();
        });
      }

      test('404 has no page closing and retains instant native scrolling', async ({ page }) => {
        expect((await page.goto('/missing-back-to-top-page/'))?.status()).toBe(404);
        await expect(page.locator('.page-closing')).toHaveCount(0);
        await expect(page.getByRole('link', { name: 'Back to top', exact: true })).toHaveCount(0);
        await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
      });
    });
  }
}

for (const colorScheme of ['dark', 'light'] as const) {
  test.describe(`page closing layout, ${colorScheme}`, () => {
    test.use({ colorScheme, contextOptions: { reducedMotion: 'reduce' } });
    for (const width of [1280, 390, 320]) {
      test(`end placement, return links, theme, contrast and overflow at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        for (const route of routes) {
          await test.step(route.path, async () => {
            await page.goto(route.path);
            await page.evaluate(() => document.fonts.ready);
            await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
            const closing = page.locator('.page-closing');
            await expect(closing).toHaveCount(1);
            expect(await closing.evaluate(el => el.nextElementSibling)).toBeNull();
            expect(await closing.evaluate((el, selector) => el.previousElementSibling?.matches(selector), route.preceding)).toBe(true);
            await expect(closing).toHaveCSS('display', 'flex');
            await expect(closing).toHaveCSS('justify-content', 'space-between');
            await expect(closing).toHaveCSS('flex-wrap', 'wrap');
            await expect(closing).toHaveCSS('gap', '16px');
            await expect(closing).toHaveCSS('margin-top', width <= 600 ? '24px' : '28px');
            await expect(closing).toHaveCSS('font-size', '13px');
            const back = closing.getByRole('link', { name: 'Back to top', exact: true });
            const box = (await closing.boundingBox())!;
            const backBox = (await back.boundingBox())!;
            expect(backBox.x + backBox.width).toBeCloseTo(box.x + box.width, 1);
            if (route.path === '/' || route.path === '/about/') {
              await expect(closing.getByRole('link')).toHaveCount(1);
            } else {
              const isExperience = route.path === '/experience/';
              const label = isExperience ? 'More about how I work' : '← Back to projects';
              const returnLink = closing.getByRole('link', { name: label, exact: true });
              await expect(closing.getByRole('link')).toHaveCount(2);
              await expect(returnLink).toHaveAttribute('href', isExperience ? '/about/' : '/#projects');
              expect(await returnLink.getAttribute('target')).toBeNull();
              expect((await returnLink.boundingBox())!.x).toBeCloseTo(box.x, 1);
              if (!isExperience) await expect(page.getByRole('link', { name: label, exact: true })).toHaveCount(2);
            }
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
            expect(await closing.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
            for (const link of await closing.getByRole('link').all()) {
              const linkBox = (await link.boundingBox())!;
              expect(linkBox.x).toBeGreaterThanOrEqual(box.x);
              expect(linkBox.x + linkBox.width).toBeLessThanOrEqual(box.x + box.width);
            }
            for (const hovered of [false, true]) {
              if (hovered) await back.hover();
              const samples = (await page.evaluate(textContrast)).filter(sample => sample.text === 'Back to top');
              expect(samples).toHaveLength(1);
              expect(samples[0].ratio).toBeGreaterThanOrEqual(4.5);
            }
          });
        }
      });
    }
  });
}
