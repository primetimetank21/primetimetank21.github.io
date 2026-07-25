/**
 * rasterize.mjs — SVG → PNG for social previews and iOS icon
 *
 * Usage: node scripts/rasterize.mjs
 * Run from repo root. Writes to public/.
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

async function rasterize(src, dest, width, height) {
  const buf = readFileSync(resolve(root, src));
  await sharp(buf, { density: 300 })
    .resize(width, height)
    .png()
    .toFile(resolve(root, dest));
  const meta = await sharp(resolve(root, dest)).metadata();
  console.log(`✓ ${dest}  ${meta.width}×${meta.height}`);
}

await rasterize('public/og-image.svg',          'public/og-image.png',          1200, 630);
await rasterize('public/apple-touch-icon.svg',  'public/apple-touch-icon.png',  180,  180);
