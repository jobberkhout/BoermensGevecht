/**
 * Renders the app icon, pages/icon.svg, to the two PNG sizes phones ask for
 * when the game is put on the home screen. The PNGs are committed; run this
 * again after changing the drawing: `node scripts/icons.ts`.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const PAGES = join(import.meta.dirname, '..', 'pages');
const svg = await readFile(join(PAGES, 'icon.svg'), 'utf8');

const browser = await chromium.launch();
for (const size of [192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(
    `<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
  );
  await page.screenshot({ path: join(PAGES, `icon-${size}.png`), omitBackground: false });
  await page.close();
  console.log(`pages/icon-${size}.png`);
}
await browser.close();
