import { test, expect, type Page, type Locator } from '@playwright/test';
import { textContrast } from './helpers/contrast';

async function tabTo(page: Page, target: Locator, backwards = false) {
  for (let i = 0; i < 50; i++) {
    if (await target.evaluate(el => el === document.activeElement)) return;
    await page.keyboard.press(backwards ? 'Shift+Tab' : 'Tab');
  }
  await expect(target).toBeFocused();
}

/**
 * Terminal E2E tests — always run (not advisory).
 *
 * Requires `npm run build` before running (uses preview server).
 */

test.describe('terminal interaction', () => {
  test.beforeEach(async ({ page }) => {
    // Set dark as the default ONLY if nothing is already stored.
    // This lets the persistence test verify that a toggle-saved value survives a reload
    // (addInitScript runs before every navigation, including reloads).
    await page.addInitScript(() => {
      if (!localStorage.getItem('theme')) {
        localStorage.setItem('theme', 'dark');
      }
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // ── Focus ──────────────────────────────────────────────────────────────────

  test('terminal only takes focus after intentional entry', async ({ page }) => {
    const input = page.locator('#terminal-input');
    await expect(input).not.toBeFocused();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await page.getByRole('button', { name: 'Start typing' }).click();
    await expect(input).toBeFocused();
  });

  // ── Ghost text / autocomplete ──────────────────────────────────────────────

  test('ghost text shows "help" seed when input is empty', async ({ page }) => {
    const ghost = page.locator('#input-ghost');
    await expect(ghost).toHaveText('help');
  });

  test('typing pr → Tab accepts "projects"', async ({ page }) => {
    const input = page.locator('#terminal-input');
    await input.pressSequentially('pr');
    await input.press('Tab');
    await expect(input).toHaveValue('projects');
  });

  test('typing pr → ArrowRight accepts "projects"', async ({ page }) => {
    const input = page.locator('#terminal-input');
    await input.pressSequentially('pr');
    await input.press('ArrowRight');
    await expect(input).toHaveValue('projects');
  });

  test('ghost text clears on no-match input', async ({ page }) => {
    const input = page.locator('#terminal-input');
    const ghost = page.locator('#input-ghost');
    await input.pressSequentially('xyz');
    await expect(ghost).toHaveText('');
  });

  test('mobile tab chip appears when ghost text is active', async ({ page }) => {
    const input = page.locator('#terminal-input');
    const chip = page.locator('#tab-chip');
    await input.pressSequentially('pr');
    await expect(chip).toBeVisible();
  });

  test('mobile tab chip visible on empty input (seed ghost)', async ({ page }) => {
    const chip = page.locator('#tab-chip');
    // Seed ghost 'help' is shown on empty input → chip must be visible
    await expect(chip).toBeVisible();
  });

  test('mobile tab chip hidden when no match and input is non-empty', async ({ page }) => {
    const input = page.locator('#terminal-input');
    const chip = page.locator('#tab-chip');
    await input.pressSequentially('xyz');
    await expect(chip).toBeHidden();
  });

  test('Tab on empty input accepts seed "help"', async ({ page }) => {
    const input = page.locator('#terminal-input');
    await expect(input).toHaveValue('');
    await input.press('Tab');
    await expect(input).toHaveValue('help');
  });

  test('ArrowRight on empty input accepts seed "help"', async ({ page }) => {
    const input = page.locator('#terminal-input');
    await input.press('ArrowRight');
    await expect(input).toHaveValue('help');
  });

  // ── Command execution ──────────────────────────────────────────────────────

  test('about command shows real content', async ({ page }) => {
    const input = page.locator('#terminal-input');
    const output = page.locator('#terminal-output');
    await input.pressSequentially('about');
    await input.press('Enter');
    await expect(output).toContainText('Microsoft');
    await expect(output).toContainText('MAIDAP');
  });

  test('projects command shows real projects with GitHub links', async ({ page }) => {
    const input = page.locator('#terminal-input');
    const output = page.locator('#terminal-output');
    await input.pressSequentially('projects');
    await input.press('Enter');
    await expect(output).toContainText('github.com');
  });

  test('skills command shows tech stack', async ({ page }) => {
    const input = page.locator('#terminal-input');
    const output = page.locator('#terminal-output');
    await input.pressSequentially('skills');
    await input.press('Enter');
    await expect(output).toContainText('Python');
    await expect(output).toContainText('TypeScript');
  });

  test('tech command is alias for skills', async ({ page }) => {
    const input = page.locator('#terminal-input');
    const output = page.locator('#terminal-output');
    await input.pressSequentially('tech');
    await input.press('Enter');
    await expect(output).toContainText('Python');
  });

  test('links command shows real links', async ({ page }) => {
    const input = page.locator('#terminal-input');
    const output = page.locator('#terminal-output');
    await input.pressSequentially('links');
    await input.press('Enter');
    await expect(output).toContainText('github.com/primetimetank21');
    await expect(output).toContainText('linkedin.com');
  });

  test('links command renders URLs as clickable anchors', async ({ page }) => {
    const input = page.locator('#terminal-input');
    await input.pressSequentially('links');
    await input.press('Enter');
    const link = page.locator('#terminal-output a[href="https://github.com/primetimetank21"]');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('projects command renders URLs as clickable anchors', async ({ page }) => {
    const input = page.locator('#terminal-input');
    await input.pressSequentially('projects');
    await input.press('Enter');
    const links = page.locator('#terminal-output a[href^="https://github.com/primetimetank21/"]');
    await expect(links).toHaveCount(6);
  });

  test('projects command shows status tags', async ({ page }) => {
    const input = page.locator('#terminal-input');
    const output = page.locator('#terminal-output');
    await input.pressSequentially('projects');
    await input.press('Enter');
    await expect(output).toContainText('[active]');
    await expect(output).toContainText('[completed]');
  });

  test('contact command shows real links', async ({ page }) => {
    const input = page.locator('#terminal-input');
    const output = page.locator('#terminal-output');
    await input.pressSequentially('contact');
    await input.press('Enter');
    await expect(output).toContainText('github.com/primetimetank21');
  });

  test('typing help + Enter shows output', async ({ page }) => {
    const input = page.locator('#terminal-input');
    const output = page.locator('#terminal-output');
    await input.pressSequentially('help');
    await input.press('Enter');
    await expect(output).toContainText('Available commands');
  });

  test('input clears after submitting a command', async ({ page }) => {
    const input = page.locator('#terminal-input');
    await input.pressSequentially('help');
    await input.press('Enter');
    await expect(input).toHaveValue('');
  });

  test('unknown command shows friendly not-found message', async ({ page }) => {
    const input = page.locator('#terminal-input');
    const output = page.locator('#terminal-output');
    await input.pressSequentially('boguscommand');
    await input.press('Enter');
    await expect(output).toContainText('not found');
  });

  test('clear command empties the output', async ({ page }) => {
    const input = page.locator('#terminal-input');
    const output = page.locator('#terminal-output');
    // Run a command first
    await input.pressSequentially('help');
    await input.press('Enter');
    await expect(output).toContainText('Available commands');
    // Now clear
    await input.pressSequentially('clear');
    await input.press('Enter');
    // Output should no longer contain the help text
    await expect(output).not.toContainText('Available commands');
  });

  // ── History ────────────────────────────────────────────────────────────────

  test('ArrowUp recalls previous command', async ({ page }) => {
    const input = page.locator('#terminal-input');
    await input.pressSequentially('help');
    await input.press('Enter');
    await input.press('ArrowUp');
    await expect(input).toHaveValue('help');
  });

  test('ArrowDown returns to empty input after ArrowUp', async ({ page }) => {
    const input = page.locator('#terminal-input');
    await input.pressSequentially('help');
    await input.press('Enter');
    await input.press('ArrowUp');
    await input.press('ArrowDown');
    await expect(input).toHaveValue('');
  });

  // ── Escape ─────────────────────────────────────────────────────────────────

  test('Escape clears current input', async ({ page }) => {
    const input = page.locator('#terminal-input');
    await input.pressSequentially('partial');
    await input.press('Escape');
    await expect(input).toHaveValue('');
  });

  // ── Theme toggle ───────────────────────────────────────────────────────────

  test('theme toggle button flips the theme', async ({ page }) => {
    const btn = page.locator('[data-testid="theme-toggle"]');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await btn.click();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('theme toggle persists across page reload', async ({ page }) => {
    const btn = page.locator('[data-testid="theme-toggle"]');
    await btn.click();
    const theme = await page.locator('html').getAttribute('data-theme');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme!);
  });

  test('terminal `theme` command toggles the theme', async ({ page }) => {
    const input = page.locator('#terminal-input');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await input.pressSequentially('theme');
    await input.press('Enter');
    await expect(html).toHaveAttribute('data-theme', 'light');
  });
});

// ── Accessibility ─────────────────────────────────────────────────────────────

test.describe('accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('terminal input has accessible label', async ({ page }) => {
    const input = page.locator('#terminal-input');
    const label = await input.getAttribute('aria-label');
    expect(label).toBeTruthy();
  });

  test('output region has role=log', async ({ page }) => {
    const output = page.locator('#terminal-output');
    await expect(output).toHaveAttribute('role', 'log');
  });

  test('output region has aria-live=polite', async ({ page }) => {
    const output = page.locator('#terminal-output');
    await expect(output).toHaveAttribute('aria-live', 'polite');
  });

  test('theme toggle button has accessible label', async ({ page }) => {
    const btn = page.locator('[data-testid="theme-toggle"]');
    const label = await btn.getAttribute('aria-label');
    expect(label).toBeTruthy();
  });

  test('theme toggle has aria-pressed reflecting current state', async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('theme', 'dark'); });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('[data-testid="theme-toggle"]');
    // Dark mode is default — aria-pressed should be false (light is not active)
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
    await btn.click();
    // Light mode is now active — aria-pressed should be true
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  test('skip-to-content link is focusable and visible on focus', async ({ page }) => {
    // Real first Tab, not a programmatic focus shortcut.
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeAttached();
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeInViewport();
    await expect(skipLink).toBeFocused();
  });

  test('theme toggle is keyboard operable when focused', async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('theme', 'dark'); });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('[data-testid="theme-toggle"]');
    const html = page.locator('html');
    await tabTo(page, btn);
    await expect(btn).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('terminal window has region role and label', async ({ page }) => {
    const terminal = page.locator('[data-testid="terminal-window"]');
    await expect(terminal).toHaveAttribute('role', 'region');
    const label = await terminal.getAttribute('aria-label');
    expect(label).toBeTruthy();
  });
});

// ── Reduced-motion ────────────────────────────────────────────────────────────

test.describe('reduced-motion', () => {
  test('theme toggle still works with reduced-motion preference', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto('/');
    const btn = page.locator('[data-testid="theme-toggle"]');
    await btn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});

// These paths deliberately never call locator.focus()/press(), which would mask a Tab trap.
test.describe('keyboard navigation', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/'); });

  test('ordinary navigation reaches projects, terminal, output links, and footer', async ({ page }) => {
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    await page.keyboard.press('Tab');
    const projectsNav = page.getByRole('navigation').getByRole('link', { name: 'Projects', exact: true });
    await expect(projectsNav).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#projects-heading')).toBeInViewport();
    await page.keyboard.press('Tab');
    await expect(page.locator('#projects a').first()).toBeFocused();
    await tabTo(page, page.locator('#terminal-start'));
    await page.keyboard.press('Enter');
    const input = page.locator('#terminal-input');
    await expect(input).toBeFocused();
    await page.keyboard.type('links');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#terminal-start')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#terminal-output a').last()).toBeFocused();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(input).toBeFocused();
    await page.keyboard.type('zzzzzz');
    await page.keyboard.press('Tab');
    await expect(page.locator('footer a').first()).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('footer a').last()).toBeFocused();
  });

  for (const value of ['', 'pr', 'help', 'c', 'zzzzzz']) {
    test(`Shift+Tab preserves backward navigation for ${JSON.stringify(value)}`, async ({ page }) => {
      await tabTo(page, page.locator('#terminal-input'));
      await page.keyboard.type(value);
      await page.keyboard.press('Shift+Tab');
      await expect(page.locator('#terminal-start')).toBeFocused();
      await expect(page.locator('#terminal-input')).toHaveValue(value);
    });
  }

  for (const value of ['help', 'c', 'zzzzzz']) {
    test(`Tab exits without a changing completion for ${value}`, async ({ page }) => {
      await tabTo(page, page.locator('#terminal-input'));
      await page.keyboard.type(value);
      await page.keyboard.press('Tab');
      await expect(page.locator('footer a').first()).toBeFocused();
    });
  }

  test('accept a suggestion once, then Tab out with a visible focus indicator', async ({ page }) => {
    await tabTo(page, page.locator('#terminal-input'));
    const outline = await page.locator('.input-wrap').evaluate(el => getComputedStyle(el).outlineWidth);
    expect(parseFloat(outline)).toBeGreaterThanOrEqual(2);
    await page.keyboard.type('pr');
    await page.keyboard.press('Tab');
    await expect(page.locator('#terminal-input')).toHaveValue('projects');
    await page.keyboard.press('Tab');
    await expect(page.locator('footer a').first()).toBeFocused();
  });
});

test('text-only scrollback can be reached and scrolled with the keyboard', async ({ page }) => {
  await page.goto('/');
  await tabTo(page, page.locator('#terminal-input'));
  await page.keyboard.type('clear');
  await page.keyboard.press('Enter');
  for (let i = 0; i < 5; i++) {
    await page.keyboard.type('about');
    await page.keyboard.press('Enter');
  }
  const log = page.getByRole('log', { name: 'Terminal output' });
  await expect(log).toHaveAttribute('tabindex', '0');
  await expect(log.locator('a')).toHaveCount(0);
  await expect.poll(() => log.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#terminal-start')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(log).toBeFocused();
  expect(parseFloat(await log.evaluate(el => getComputedStyle(el).outlineWidth))).toBeGreaterThanOrEqual(2);
  const before = await log.evaluate(el => el.scrollTop);
  await page.keyboard.press('PageUp');
  await expect.poll(() => log.evaluate(el => el.scrollTop)).toBeLessThan(before);
});

for (const composition of [
  { name: 'active composition', isComposing: true, keyCode: 13 },
  { name: 'compositionend before keydown', isComposing: false, keyCode: 229 },
]) {
  test(`IME Enter confirms without submitting during ${composition.name}`, async ({ page }) => {
    await page.goto('/');
    const input = page.locator('#terminal-input');
    const log = page.getByRole('log');
    await input.fill('about');
    const before = await log.innerText();
    if (!composition.isComposing) {
      await input.dispatchEvent('compositionend', { data: 'about' });
    }
    await input.dispatchEvent('keydown', { key: 'Enter', isComposing: composition.isComposing, keyCode: composition.keyCode });
    await expect(input).toHaveValue('about');
    expect(await log.innerText()).toBe(before);
    await expect(log.locator('.entry-cmd')).toHaveCount(0);
    await input.press('Enter');
    await expect(input).toHaveValue('');
    await expect(log.locator('.entry-cmd')).toHaveCount(1);
    await expect(log.locator('.entry-cmd')).toHaveText('about');
  });
}

for (const theme of ['dark', 'light']) {
  test(`meaningful text has 4.5:1 contrast in ${theme} theme`, async ({ page }) => {
    await page.addInitScript(theme => localStorage.setItem('theme', theme), theme);
    await page.goto('/');
    const input = page.locator('#terminal-input');
    for (const command of ['about', 'projects', 'skills', 'contact', 'help']) {
      await input.fill(command);
      await input.press('Enter');
    }
    const samples = await page.evaluate(textContrast);
    expect(samples.length).toBeGreaterThan(80);
    expect(samples.filter(sample => sample.ratio < 4.5)).toEqual([]);
    expect(samples.some(sample => sample.selector === 'input-ghost')).toBe(true);
    await page.goto('/unknown-contrast-route');
    expect((await page.evaluate(textContrast)).filter(sample => sample.ratio < 4.5)).toEqual([]);
  });
}

test('long mobile input preserves native scrolling, caret navigation, selection, and editing', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const input = page.locator('#terminal-input');
  await input.click();
  const value = 'long-command-'.repeat(15);
  await page.keyboard.type(value);

  async function geometry() {
    return input.evaluate(el => {
      const input = el as HTMLInputElement;
      const mirror = document.getElementById('input-mirror')!;
      const typed = document.getElementById('mirror-content')!;
      const actual = getComputedStyle(input);
      const visual = getComputedStyle(mirror);
      const matrix = new DOMMatrix(getComputedStyle(typed).transform);
      return {
        font: actual.font, mirrorFont: visual.font,
        spacing: actual.letterSpacing, mirrorSpacing: visual.letterSpacing,
        scroll: input.scrollLeft, offset: -matrix.m41 || 0,
        start: input.selectionStart, end: input.selectionEnd,
        color: actual.color, fontSize: parseFloat(actual.fontSize),
      };
    });
  }
  await expect.poll(async () => (await geometry()).scroll).toBeGreaterThan(500);
  await expect.poll(async () => Math.abs((await geometry()).scroll - (await geometry()).offset)).toBeLessThan(1);
  let metrics = await geometry();
  expect(metrics.font).toBe(metrics.mirrorFont);
  expect(metrics.spacing).toBe(metrics.mirrorSpacing);
  expect(metrics.fontSize).toBeGreaterThanOrEqual(16);
  expect(metrics.color).not.toBe('rgba(0, 0, 0, 0)');
  expect(metrics.start).toBe(value.length);
  await page.keyboard.press('Home');
  await expect.poll(async () => (await geometry()).scroll).toBe(0);
  await expect.poll(async () => (await geometry()).offset).toBe(0);
  await page.keyboard.press('End');
  for (let i = 0; i < 7; i++) await page.keyboard.press('Shift+ArrowLeft');
  metrics = await geometry();
  expect(metrics.end! - metrics.start!).toBe(7);
  await page.keyboard.type('edited');
  await expect(input).toHaveValue(value.slice(0, -7) + 'edited');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Backspace');
  await expect(input).toHaveValue(value.slice(0, -7) + 'editd');
  await expect.poll(async () => Math.abs((await geometry()).scroll - (await geometry()).offset)).toBeLessThan(1);
  // Pointer caret placement is native too, with the mirror following its scroll.
  await input.click({ position: { x: 25, y: 12 } });
  metrics = await geometry();
  expect(metrics.start).toBe(metrics.end);
  expect(metrics.start).toBeLessThan(value.length);
  await expect.poll(async () => Math.abs((await geometry()).scroll - (await geometry()).offset)).toBeLessThan(1);
  await input.fill('pr');
  await page.keyboard.press('Shift+ArrowRight');
  await expect(input).toHaveValue('pr'); // Modified arrows keep native selection semantics.
  await page.keyboard.press('Home');
  await page.keyboard.press('Shift+End');
  await page.keyboard.press('ArrowRight');
  await expect(input).toHaveValue('pr'); // Collapse selection, do not accept completion.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await input.fill('help');
  await page.keyboard.press('Enter');
  await expect.poll(() => page.locator('#terminal-output').evaluate(el =>
    Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop),
  )).toBeLessThanOrEqual(1);
  const lastLine = await page.locator('#terminal-output .entry-line').last().boundingBox();
  const scrollback = await page.locator('#terminal-output').boundingBox();
  expect(lastLine!.y + lastLine!.height).toBeLessThanOrEqual(scrollback!.y + scrollback!.height);
});

test('normal animation startup and output complete without stealing focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    // Observe real GSAP style mutations; simply overriding webdriver is not proof of execution.
    const observed = window as unknown as { animatedTerminal: boolean; animatedOutput: boolean };
    observed.animatedTerminal = false;
    observed.animatedOutput = false;
    new MutationObserver(records => {
      for (const record of records) {
        if (!(record.target instanceof HTMLElement)) continue;
        // With a busy render thread a tween may finish before this callback.
        // Attribute history still proves it actually ran, unlike final CSS alone.
        const styles = `${record.oldValue ?? ''};${record.target.getAttribute('style') ?? ''}`;
        if (!styles.includes('transform:') || !styles.includes('opacity:')) continue;
        if (record.target.matches('.terminal-window')) observed.animatedTerminal = true;
        if (record.target.matches('.entry-output')) observed.animatedOutput = true;
      }
    }).observe(document, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['style'] });
  });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => (window as unknown as { animatedTerminal: boolean }).animatedTerminal)).toBe(true);
  const welcome = page.locator('.terminal-entry--system .entry-line');
  await expect(welcome.first()).toHaveText("Welcome to primetimetank21's terminal.");
  await expect(welcome.last()).toHaveCSS('opacity', '1');
  await expect(page.locator('.terminal-window')).toHaveCSS('transform', 'none');
  await expect(page.locator('#terminal-input')).not.toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.getByRole('button', { name: 'Start typing' }).click();
  await page.keyboard.type('help');
  await page.keyboard.press('Enter');
  const output = page.locator('.entry-output').last();
  await expect(output).toContainText('Available commands');
  await expect.poll(() => page.evaluate(() => (window as unknown as { animatedOutput: boolean }).animatedOutput)).toBe(true);
  await expect(output).toHaveCSS('opacity', '1');
  await expect(output).toHaveCSS('transform', 'none');
  expect(errors).toEqual([]);
});
