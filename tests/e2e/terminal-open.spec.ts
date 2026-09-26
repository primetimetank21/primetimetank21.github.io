import { test, expect, type Page } from '@playwright/test';
import { CASE_STUDIES } from '../../src/lib/content';

type OpenCall = { path: string; target?: string; features?: string; active: boolean; inEnter: boolean; entries: number; returnedNull?: boolean };
type ObservedWindow = Window & { openCalls: OpenCall[] };

async function observeOpen(page: Page, mode: 'real' | 'null' | 'throw' = 'real') {
  await page.addInitScript(mode => {
    const observed = window as unknown as ObservedWindow;
    observed.openCalls = [];
    let inEnter = false;
    // Wrap the actual input listener: browsers may run a microtask checkpoint
    // between capture and target listeners, so a capture-phase flag is not proof.
    const addListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if (type === 'keydown' && this instanceof HTMLInputElement && this.id === 'terminal-input' && typeof listener === 'function') {
        return addListener.call(this, type, function (this: EventTarget, event: Event) {
          inEnter = event instanceof KeyboardEvent && event.key === 'Enter' && event.isTrusted;
          try { listener.call(this, event); } finally { inEnter = false; }
        }, options);
      }
      return addListener.call(this, type, listener, options);
    };
    const original = window.open.bind(window);
    window.open = (url, target, features) => {
      const call: OpenCall = {
        path: String(url), target, features,
        active: navigator.userActivation.isActive, inEnter,
        entries: document.querySelectorAll('#terminal-output .entry-cmd').length,
      };
      observed.openCalls.push(call);
      if (mode === 'throw') throw new Error('Simulated window.open failure');
      const result = mode === 'null' ? null : original(url, target, features);
      call.returnedNull = result === null;
      return result;
    };
  }, mode);
}

async function calls(page: Page) {
  return page.evaluate(() => (window as unknown as ObservedWindow).openCalls);
}

async function checkNewTab(tab: Page, source: Page, path: string, title: string) {
  await tab.waitForURL(path);
  await expect(tab.locator('h1')).toHaveText(title);
  expect(new URL(tab.url()).origin).toBe(new URL(source.url()).origin);
  expect(await tab.evaluate(() => window.opener === null)).toBe(true);
  await tab.close();
}

for (const project of CASE_STUDIES) {
  for (const width of [1280, 390]) {
    test(`open ${project.name} requests a real isolated tab synchronously at ${width}px`, async ({ page, context }) => {
      await page.setViewportSize({ width, height: 844 });
      await observeOpen(page);
      // Exercise the real animated path too; open must precede output animation.
      await page.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
      await page.goto('/');
      const input = page.locator('#terminal-input');
      await input.fill(`  OpEn \t ${project.name.toUpperCase()}  `);
      const tabPromise = context.waitForEvent('page');
      await input.press('Enter');
      await checkNewTab(await tabPromise, page, project.caseStudy.path, project.caseStudy.title);
      expect(await calls(page)).toEqual([{
        path: project.caseStudy.path, target: '_blank', features: 'noopener,noreferrer',
        active: true, inEnter: true, entries: 0, returnedNull: true,
      }]);
      await expect(input).toHaveValue('');
      const output = page.locator('#terminal-output .terminal-entry').last();
      await expect(output).toContainText('New tab requested. If it did not appear, use the link below:');
      await expect(output).not.toContainText(/blocked|tab opened/i);
      const fallback = output.getByRole('link', { name: `${project.name} (opens in a new tab)` });
      await expect(fallback).toHaveAttribute('href', project.caseStudy.path);
      await expect(fallback).toHaveAttribute('target', '_blank');
      await expect(fallback).toHaveAttribute('rel', 'noopener noreferrer');
      const fallbackTab = context.waitForEvent('page');
      await fallback.click();
      await checkNewTab(await fallbackTab, page, project.caseStudy.path, project.caseStudy.title);
      expect(await calls(page)).toHaveLength(1); // the fallback uses native anchor behavior
      expect(new URL(page.url()).pathname).toBe('/');
    });
  }

  for (const mode of ['null', 'throw'] as const) {
    test(`${mode} window.open for ${project.name} keeps an honest usable fallback and terminal`, async ({ page, context }) => {
      await observeOpen(page, mode);
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('/');
      const input = page.locator('#terminal-input');
      await input.fill(`open ${project.name}`);
      await input.press('Enter');
      expect(context.pages()).toHaveLength(1);
      expect(await calls(page)).toHaveLength(1);
      const entry = page.locator('#terminal-output .terminal-entry').last();
      await expect(entry).toContainText(mode === 'throw' ? 'Could not request a new tab. Use the link below:' : 'New tab requested. If it did not appear, use the link below:');
      await expect(entry).not.toContainText(/blocked|tab opened/i);
      const fallback = entry.getByRole('link', { name: `${project.name} (opens in a new tab)` });
      const tabPromise = context.waitForEvent('page');
      await fallback.click();
      await checkNewTab(await tabPromise, page, project.caseStudy.path, project.caseStudy.title);
      await input.press('ArrowUp');
      await expect(input).toHaveValue(`open ${project.name}`);
      await input.press('Escape');
      await input.fill('help');
      await input.press('Enter');
      await expect(page.locator('#terminal-output')).toContainText('Available commands');
      await expect(input).toHaveValue('');
      await expect(input).toBeFocused();
      expect(errors).toEqual([]);
    });
  }
}

test('bare open completes, lists exactly two native new-tab links and does not call window.open', async ({ page, context }) => {
  await observeOpen(page, 'throw');
  await page.goto('/');
  const input = page.locator('#terminal-input');
  await input.fill('op');
  await input.press('Tab');
  await expect(input).toHaveValue('open');
  await input.press('Enter');
  const links = page.locator('#terminal-output .entry-output a');
  await expect(links).toHaveCount(2);
  for (const project of CASE_STUDIES) {
    const link = links.filter({ hasText: `${project.name} (opens in a new tab)` });
    await expect(link).toHaveAttribute('href', project.caseStudy.path);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    const tabPromise = context.waitForEvent('page');
    await link.click();
    await checkNewTab(await tabPromise, page, project.caseStudy.path, project.caseStudy.title);
  }
  expect(await calls(page)).toEqual([]);
  await input.fill('help');
  await input.press('Enter');
  await expect(page.locator('#terminal-output')).toContainText('open <name> requests a new tab');
});

test('invalid arguments never call window.open or create arbitrary output links; echo is plain', async ({ page, context }) => {
  await observeOpen(page, 'throw');
  await page.goto('/');
  const input = page.locator('#terminal-input');
  for (const argument of [
    'missing', 'dev-setup extra', 'phission dev-setup', '/projects/dev-setup/', '../phission',
    'https://example.com', 'https://primetimetank21.github.io/projects/phission/', '//example.com',
    'javascript:alert(1)', 'constructor', '__proto__', 'toString', 'hasOwnProperty',
    '<img src=x onerror=alert(1)>', 'dev-setup/', 'phission#evidence',
  ]) {
    await test.step(argument, async () => {
      await input.fill(`open ${argument}`);
      await input.press('Enter');
      const entry = page.locator('#terminal-output .terminal-entry').last();
      await expect(entry.locator('.entry-cmd')).toHaveText(`open ${argument}`);
      await expect(entry.locator('.entry-output')).toHaveText('Usage: open [dev-setup | phission]Type `help` to see available commands.');
      await expect(entry.locator('a, img, script')).toHaveCount(0);
      await expect(input).toHaveValue('');
      expect(await calls(page)).toEqual([]);
      expect(context.pages()).toHaveLength(1);
    });
  }
});

for (const composition of [{ isComposing: true, keyCode: 13 }, { isComposing: false, keyCode: 229 }]) {
  test(`IME confirming Enter does not open a tab (${composition.keyCode})`, async ({ page }) => {
    await observeOpen(page, 'null');
    await page.goto('/');
    const input = page.locator('#terminal-input');
    await input.fill('open phission');
    await input.dispatchEvent('keydown', { key: 'Enter', ...composition });
    await expect(input).toHaveValue('open phission');
    expect(await calls(page)).toEqual([]);
    await input.press('Enter');
    expect(await calls(page)).toHaveLength(1);
  });
}
