import { test, expect } from '@playwright/test';

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

  test('terminal input is focused on page load', async ({ page }) => {
    const input = page.locator('#terminal-input');
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
    await expect(links).toHaveCount(3);
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
