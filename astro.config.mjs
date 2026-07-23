// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://primetimetank21.github.io',
  // base stays '/' — this is a GitHub Pages USER SITE (username.github.io), not a project site
  output: 'static',
  integrations: [sitemap()],
});
