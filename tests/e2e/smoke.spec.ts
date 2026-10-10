import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { ABOUT_PARAGRAPHS, PROJECTS, CASE_STUDIES, SKILL_GROUPS, CONTACT, PROFILE, RESUME } from '../../src/lib/content';
import { textContrast } from './helpers/contrast';

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

// ── Native résumé download ───────────────────────────────────────────────────

const resumeLabel = 'Download résumé (PDF)';
const resumeSHA256 = 'e83599523c5a8bd34fa2b6c2f26f6f1b6680b7271419d51f2ce7dc6c403cc4b9';
const acceptedResume = readFileSync(new URL(`../../public${RESUME.url}`, import.meta.url));

test('public résumé URL serves the exact accepted PDF with its media type', async ({ request, baseURL }) => {
  const response = await request.get(RESUME.url);
  expect(response.status()).toBe(200);
  expect(response.url()).toBe(new URL(RESUME.url, baseURL).href);
  expect(response.headers()['content-type']).toMatch(/^application\/pdf(?:;|$)/);
  const bytes = await response.body();
  expect(bytes.length).toBe(73992);
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(resumeSHA256);
  expect(bytes.equals(acceptedResume)).toBe(true);
});

for (const route of ['/', '/about/', '/experience/']) {
  // Without JavaScript the existing site uses its default dark theme.
  for (const mode of [
    { javaScriptEnabled: true, colorScheme: 'dark' },
    { javaScriptEnabled: true, colorScheme: 'light' },
    { javaScriptEnabled: false, colorScheme: 'dark' },
  ] as const) {
    test.describe(`résumé on ${route}, JS ${mode.javaScriptEnabled}, ${mode.colorScheme}`, () => {
      test.use({ ...mode, contextOptions: { reducedMotion: 'reduce' } });

      for (const width of [1280, 960, 390, 320]) {
        test(`native keyboard and pointer downloads, contrast and layout at ${width}px`, async ({ page, context }) => {
          await page.setViewportSize({ width, height: 844 });
          await page.goto(route);
          await page.evaluate(() => document.fonts.ready);
          if (mode.javaScriptEnabled) await expect(page.locator('html')).toHaveAttribute('data-theme', mode.colorScheme);
          const group = page.locator(route === '/' ? '.hero-actions' : route === '/about/' ? '.about-page .contact-links' : '.experience-page .page-actions');
          const link = group.getByRole('link', { name: resumeLabel, exact: true });
          await expect(page.locator('a[download]')).toHaveCount(1);
          await expect(link).toBeVisible();
          await expect(link).toHaveAttribute('href', RESUME.url);
          await expect(link).toHaveAttribute('download', RESUME.filename);
          await expect(link).toHaveAttribute('type', 'application/pdf');
          for (const attribute of ['target', 'role', 'tabindex', 'onclick', 'onkeydown']) {
            expect(await link.getAttribute(attribute)).toBeNull();
          }
          if (route === '/') {
            await expect(group.getByRole('link')).toHaveText([
              'Explore projects ↓', resumeLabel, 'Connect on LinkedIn ↗',
            ]);
            await expect(group.locator('.primary-link')).toHaveAttribute('href', '#projects');
            await expect(group.getByRole('link', { name: 'Connect on LinkedIn' })).toHaveAttribute('href', CONTACT.links[1].url);
          } else if (route === '/about/') {
            await expect(group.getByRole('link')).toHaveText([...CONTACT.links.map(contact => contact.label), resumeLabel]);
          } else {
            await expect(group.getByRole('link')).toHaveText([resumeLabel]);
            await expect(group.locator('.document-meta')).toHaveText(`The one-page version · updated ${RESUME.updated}`);
          }
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          expect(await group.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
          for (const action of await group.getByRole('link').all()) {
            const box = (await action.boundingBox())!;
            expect(box.x).toBeGreaterThanOrEqual(0);
            expect(box.x + box.width).toBeLessThanOrEqual(width);
          }
          const samples = (await page.evaluate(textContrast)).filter(sample => sample.text === resumeLabel);
          expect(samples).toHaveLength(1);
          expect(samples[0].ratio).toBeGreaterThanOrEqual(4.5);

          for (const activation of ['keyboard', 'pointer']) {
            if (activation === 'keyboard') {
              // Reach the link with real Tab navigation rather than focus().
              for (let i = 0; i < 20 && !await link.evaluate(el => el === document.activeElement); i++) {
                await page.keyboard.press('Tab');
              }
              await expect(link).toBeFocused();
              await expect(link).toBeInViewport();
              expect(await link.evaluate(el => el.matches(':focus-visible'))).toBe(true);
              expect(parseFloat(await link.evaluate(el => getComputedStyle(el).outlineWidth))).toBeGreaterThanOrEqual(2);
            } else {
              await link.hover();
            }
            const activeSamples = (await page.evaluate(textContrast)).filter(sample => sample.text === resumeLabel);
            expect(activeSamples).toHaveLength(1);
            expect(activeSamples[0].ratio).toBeGreaterThanOrEqual(4.5);
            const downloadPromise = page.waitForEvent('download');
            if (activation === 'keyboard') await page.keyboard.press('Enter');
            else await link.click();
            const download = await downloadPromise;
            expect(download.url()).toBe(new URL(RESUME.url, page.url()).href);
            expect(download.suggestedFilename()).toBe(RESUME.filename);
            expect(await download.failure()).toBeNull();
            const bytes = readFileSync((await download.path())!);
            expect(bytes.length).toBe(73992);
            expect(createHash('sha256').update(bytes).digest('hex')).toBe(resumeSHA256);
            expect(bytes.equals(acceptedResume)).toBe(true);
            await expect(page).toHaveURL(route);
            expect(context.pages()).toHaveLength(1);
            await expect(link).toBeFocused();
          }
          if (route === '/') {
            await page.keyboard.press('Tab');
            await expect(group.getByRole('link', { name: 'Connect on LinkedIn' })).toBeFocused();
          }
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        });
      }
    });
  }
}

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


const navigation = [
  ['Home', '/'], ['About', '/about/'], ['Experience', '/experience/'], ['Projects', '/#projects'],
  ['Contact', '/#contact'], ['Terminal', '/#terminal'],
] as const;

for (const route of ['/', '/about/', '/experience/', ...CASE_STUDIES.map(project => project.caseStudy.path)]) {
  for (const javaScriptEnabled of [true, false]) {
    test.describe(`shared navigation on ${route}, JS ${javaScriptEnabled}`, () => {
      test.use({ javaScriptEnabled });
      for (const width of [1280, 390]) {
        test(`same ordered native links at ${width}px`, async ({ page, context }) => {
          await page.setViewportSize({ width, height: 844 });
          await page.goto(route);
          const nav = page.getByRole('navigation', { name: 'Site navigation' });
          await expect(nav.getByRole('link')).toHaveText(navigation.map(([label]) => label));
          for (const [label, href] of navigation) {
            const link = nav.getByRole('link', { name: label, exact: true });
            await expect(link).toHaveAttribute('href', href);
            expect(await link.getAttribute('target')).toBeNull();
          }
          const current = nav.locator('[aria-current]');
          const currentLink = navigation.find(([, href]) => href === route);
          if (currentLink) {
            await expect(current).toHaveCount(1);
            await expect(current).toHaveText(currentLink[0]);
            await expect(current).toHaveAttribute('aria-current', 'page');
          } else await expect(current).toHaveCount(0);
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          await nav.getByRole('link', { name: 'About', exact: true }).click();
          await expect(page).toHaveURL('/about/');
          await nav.getByRole('link', { name: 'Experience', exact: true }).click();
          await expect(page).toHaveURL('/experience/');
          await expect(nav.locator('[aria-current]')).toHaveText('Experience');
          await nav.getByRole('link', { name: 'Projects', exact: true }).click();
          await expect(page).toHaveURL('/#projects');
          await expect(page.locator('#projects-heading')).toBeInViewport();
          await nav.getByRole('link', { name: 'Home', exact: true }).click();
          await expect(page).toHaveURL('/');
          await expect(page.locator('h1')).toBeInViewport();
          expect(context.pages()).toHaveLength(1);
        });
      }
    });
  }
  if (route !== '/about/') for (const width of [1280, 390]) {
    test(`shared keyboard order on ${route} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(route);
      await page.keyboard.press('Tab');
      await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
      for (const [label] of navigation) {
        await page.keyboard.press('Tab');
        await expect(page.getByRole('navigation').getByRole('link', { name: label, exact: true })).toBeFocused();
      }
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('theme-toggle')).toBeFocused();
    });
  }
}

for (const javaScriptEnabled of [true, false]) {
  test.describe(`shared skip link, JS ${javaScriptEnabled}`, () => {
    test.use({ javaScriptEnabled });
    for (const width of [320, 1362]) {
      test(`bounded hiding, first-Tab reveal and Enter-to-main on every route at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        for (const route of ['/', '/about/', '/experience/', ...CASE_STUDIES.map(project => project.caseStudy.path), '/experience/nested/']) {
          await page.goto(route);
          const skip = page.getByRole('link', { name: 'Skip to content', exact: true });
          const hiddenBox = (await skip.boundingBox())!;
          expect(hiddenBox.width).toBe(1);
          expect(hiddenBox.height).toBe(1);
          expect(hiddenBox.x).toBeGreaterThanOrEqual(0);
          expect(hiddenBox.x + hiddenBox.width).toBeLessThanOrEqual(width);
          expect(await skip.evaluate(el => getComputedStyle(el).clipPath)).toBe('inset(50%)');
          await page.keyboard.press('Tab');
          await expect(skip).toBeFocused();
          await expect(skip).toBeInViewport();
          const visibleBox = (await skip.boundingBox())!;
          expect(visibleBox.width).toBeGreaterThan(1);
          expect(visibleBox.x).toBeGreaterThanOrEqual(0);
          expect(visibleBox.x + visibleBox.width).toBeLessThanOrEqual(width);
          expect(await skip.evaluate(el => getComputedStyle(el).clipPath)).toBe('none');
          expect(parseFloat(await skip.evaluate(el => getComputedStyle(el).outlineWidth))).toBeGreaterThanOrEqual(2);
          await page.keyboard.press('Enter');
          await expect(page.locator('main')).toBeFocused();
          await expect(page).toHaveURL(`${route}#main-content`);
        }
      });
    }
  });
}

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
          .toHaveAttribute('href', section === 'About' ? '/about/' : `/#${section.toLowerCase()}`);
        await expect(main.locator(`#${section.toLowerCase()}`)).toBeVisible();
      }
      for (const paragraph of ABOUT_PARAGRAPHS) await expect(main).toContainText(paragraph);
      for (const project of PROJECTS) {
        const card = main.getByRole('article', { name: project.name, exact: true });
        await expect(card).toContainText(project.description);
        await expect(card.locator(`a[href="${project.url}"]`)).toBeVisible();
        if (project.featured && project.caseStudy) {
          await expect(card.getByRole('heading', { level: 3 })).toHaveText(project.caseStudy.title);
          await expect(card.getByRole('list', { name: 'Technologies', exact: true }).getByRole('listitem'))
            .toHaveText([...project.caseStudy.technologies]);
          const details = card.locator('details');
          await expect(details).not.toHaveAttribute('open');
          const readLink = card.getByRole('link', { name: `Read case study for ${project.name}` });
          await expect(readLink).toBeVisible();
          await expect(readLink).toHaveAttribute('href', project.caseStudy.path);
          expect(await readLink.getAttribute('target')).toBeNull();
          await card.locator('summary').click();
          await expect(details).toHaveAttribute('open');
          await expect(card.getByRole('list', { name: 'Architecture flow', exact: true }).getByRole('listitem'))
            .toHaveText([...project.caseStudy.flow]);
          for (const field of ['problem', 'approach', 'tradeoff', 'evidence'] as const) {
            await expect(card).toContainText(project.caseStudy[field]);
          }
          for (const link of project.caseStudy.links) {
            await expect(card.getByRole('link', { name: link.label })).toHaveAttribute('href', link.url);
            await expect(card.getByRole('link', { name: link.label })).toBeVisible();
          }
        } else {
          await expect(card.getByRole('heading', { level: 3 })).toHaveText(project.name);
          await expect(card.locator('details, .case-study, .technologies')).toHaveCount(0);
          await expect(card).not.toHaveClass(/featured/);
          const readLink = card.getByRole('link', { name: `Read case study for ${project.name}` });
          if (project.caseStudy) {
            await expect(readLink).toHaveAttribute('href', project.caseStudy.path);
            await expect(readLink).toBeVisible();
            expect(await readLink.getAttribute('target')).toBeNull();
          } else await expect(readLink).toHaveCount(0);
        }
      }
      await expect(main.locator('#projects article')).toHaveCount(7);
      await expect(main.locator('.featured-projects article')).toHaveCount(2);
      await expect(main.locator('.featured-projects .repo-name')).toHaveText(['dev-setup', 'phission']);
      await expect(main.locator('.other-projects article')).toHaveCount(5);
      await expect(main.locator('.other-projects a[href^="/projects/"]')).toHaveCount(4);
      await expect(main.locator('#projects details')).toHaveCount(2);
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
