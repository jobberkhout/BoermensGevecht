import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { expect, test } from '@playwright/test';

/**
 * BoermensGevecht.html is the whole game in one file, meant to be downloaded
 * and double-clicked. That opens it straight from disk, without a server,
 * which browsers treat more strictly than a web page. So it is opened exactly
 * that way here, in every engine.
 */
const FILE = join(import.meta.dirname, '..', 'BoermensGevecht.html');
const ADDRESS = pathToFileURL(FILE).href;

interface Summary {
  tick: number;
  units: [number, number];
  era: [number, number];
}

interface Hooks {
  advance(n: number): void;
  fund(side: number, gold: number): void;
  progress(side: number, amount: number): void;
  press(side: number, action: string): void;
  summary(): Summary;
}

test('the single file plays when it is opened straight from disk', async ({ page }) => {
  expect(existsSync(FILE), 'BoermensGevecht.html is missing: run `npm run build`').toBe(true);
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  // Everything must be inside the file: it may not ask for anything else, on disk or online.
  const asked: string[] = [];
  page.on('request', (request) => {
    const url = request.url();
    if (!url.startsWith('data:') && !url.startsWith('blob:') && !url.startsWith(ADDRESS)) asked.push(url);
  });

  await page.goto(`${ADDRESS}?test=1`);
  await page.waitForSelector('body[data-ready="1"]');
  await expect(page.locator('.screen:not([hidden]) h1')).toHaveText('Boermens Gevecht');
  await expect(page.locator('#hud')).not.toContainText('Er ging iets mis');

  await page.keyboard.press('Enter');
  await page.keyboard.press('KeyQ');
  await page.keyboard.press('KeyU');
  // The drawings came along: the buttons show pictures, not the letters that stand in for missing art.
  // (Three units a side for now; the fourth button stays hidden until the last era.)
  await expect(page.locator('.btn .pic:visible')).toHaveCount(6);
  await expect(page.locator('.btn .pic.letter')).toHaveCount(0);

  // Both sides walk out, and modernizing swaps in the next era's drawings without a hitch.
  const summary = await page.evaluate(() => {
    const g = (window as unknown as { __game: Hooks }).__game;
    g.advance(150);
    for (const side of [0, 1]) {
      g.progress(side, 100000);
      g.fund(side, 1000);
      g.press(side, 'eraUp');
    }
    g.advance(30);
    return g.summary();
  });
  expect(summary.units).toEqual([1, 1]);
  expect(summary.era).toEqual([1, 1]);
  await expect(page.locator('.btn .pic.letter')).toHaveCount(0);

  expect(asked).toEqual([]);
  expect(errors).toEqual([]);
});

test('opened the way a player opens it, the match runs on the clock with sound', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto(ADDRESS);
  await page.waitForSelector('body[data-ready="1"]');
  await page.keyboard.press('Enter');
  await expect(page.locator('body')).toHaveAttribute('data-audio', /running|suspended/);
  await page.keyboard.press('KeyQ');
  await page.keyboard.press('KeyU');
  await page.waitForTimeout(2500);
  await expect(page.locator('.clock')).not.toHaveText('0:00');
  // The sound setting is remembered between visits; from disk that must not throw either.
  await page.keyboard.press('KeyM');
  await expect(page.locator('.mute')).toHaveAttribute('data-mode', 'effects');
  expect(errors).toEqual([]);
});
