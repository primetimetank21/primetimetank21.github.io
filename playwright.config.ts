import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration.
 *
 * ⚠️  VISUAL BASELINE RULE (read before generating snapshots):
 *   Visual regression baselines MUST be generated on Linux inside the
 *   official Playwright Docker image to match CI font rendering.
 *   DO NOT commit baselines generated on Windows or macOS — they will
 *   cause flake due to font-hinting differences.
 *
 *   To regenerate baselines locally on Windows:
 *     docker run --rm -v ${PWD}:/work -w /work \
 *       mcr.microsoft.com/playwright:v1.61.1-noble \
 *       npx playwright test --update-snapshots
 *   Then commit the updated files in tests/e2e/__snapshots__/.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },

  // Route all toHaveScreenshot() PNGs into the committed __snapshots__ dir.
  // Default template writes to {testDir}/visual.spec.ts-snapshots/ — this
  // overrides it so files land in tests/e2e/__snapshots__/ as intended.
  snapshotPathTemplate: '{testDir}/__snapshots__/{arg}{-projectName}{-snapshotSuffix}{ext}',

  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    // Uses the built output for production-faithful E2E.
    // Run `npm run build` before `npm run test:e2e` locally if not using preview.
    command: 'npm run preview -- --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
