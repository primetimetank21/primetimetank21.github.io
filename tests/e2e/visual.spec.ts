import { test, expect } from '@playwright/test';

/** Blocking visual gate. Refresh baselines only in the pinned official
 * Playwright container, review the PNGs, and follow README's approval/check flow.
 * Local screenshots for design review are not committed baselines. */
for (const theme of ['dark', 'light']) {
  test.describe(`${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(theme => localStorage.setItem('theme', theme), theme);
    });

    for (const viewport of [
      { name: 'desktop', width: 1280, height: 800 },
      { name: 'mobile', width: 390, height: 844 },
    ]) {
      test(`portfolio — ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('/');
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator('h1')).toBeInViewport();
        const name = theme === 'dark' && viewport.name === 'desktop' ? 'homepage.png' : `homepage-${theme}-${viewport.name}.png`;
        await expect(page).toHaveScreenshot(name, { fullPage: true, animations: 'disabled' });
      });

      test(`terminal empty — ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('/');
        await page.evaluate(() => document.fonts.ready);
        const terminal = page.getByTestId('terminal-window');
        await expect(page.locator('#input-ghost')).toHaveText('help');
        await expect(terminal).toHaveScreenshot(`terminal-${theme}-empty-${viewport.name}.png`, { animations: 'disabled' });
      });

      test(`404 — ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('/this-page-does-not-exist');
        await page.evaluate(() => document.fonts.ready);
        await expect(page).toHaveScreenshot(`404-${theme}-${viewport.name}.png`, { animations: 'disabled' });
      });
    }

    test('terminal help output — desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      await page.getByRole('button', { name: 'Start typing' }).click();
      await page.keyboard.type('help');
      await page.keyboard.press('Enter');
      await expect(page.locator('#terminal-output')).toContainText('Available commands');
      await expect(page.getByTestId('terminal-window')).toHaveScreenshot(`terminal-${theme}-post-command-desktop.png`, { animations: 'disabled' });
    });
  });
}
