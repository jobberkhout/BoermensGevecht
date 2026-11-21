import { expect, test } from '@playwright/test';

interface Summary {
  tick: number;
  winner: unknown;
  units: [number, number];
  baseHp: [number, number];
}

test('a match can be played from the title screen to a winner', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/?test=1');
  await page.waitForSelector('body[data-ready="1"]');
  await expect(page.locator('.screen:not([hidden]) h1')).toHaveText('Boermens Gevecht');

  // Enter starts the match; each player buys their first unit with their own key.
  await page.keyboard.press('Enter');
  await expect(page.locator('.screen:not([hidden])')).toHaveCount(0);
  await page.keyboard.press('KeyQ');
  await page.keyboard.press('KeyU');
  let summary = await page.evaluate(() => {
    const g = (window as unknown as { __game: { advance(n: number): void; summary(): Summary } }).__game;
    g.advance(120);
    return g.summary();
  });
  expect(summary.units).toEqual([1, 1]);

  // The on-screen buttons do the same as the keys.
  await page.locator('.panel.right .btn').first().dispatchEvent('pointerdown');
  summary = await page.evaluate(() => {
    const g = (window as unknown as { __game: { advance(n: number): void; summary(): Summary } }).__game;
    g.advance(120);
    return g.summary();
  });
  expect(summary.units[1]).toBe(2);

  // A press that cannot be afforded is refused and says why.
  await page.keyboard.press('KeyE');
  await expect(page.locator('.panel.left .why')).toHaveText('Te weinig subsidie');

  // Play it out: the right base is nearly down and the left player sends a crowd.
  summary = await page.evaluate(() => {
    const g = (window as unknown as {
      __game: {
        advance(n: number): void;
        summary(): Summary;
        setBase(side: number, hp: number): void;
        fund(side: number, gold: number): void;
        press(side: number, action: string): void;
      };
    }).__game;
    g.setBase(1, 20);
    g.fund(0, 2000);
    for (let i = 0; i < 5; i++) g.press(0, 'buy0');
    g.advance(4000);
    return g.summary();
  });
  expect(summary.winner).toBe(0);
  await expect(page.locator('.screen:not([hidden]) h1')).toHaveText('De Havermelkelite wint!');

  // Enter starts a fresh match.
  await page.keyboard.press('Enter');
  summary = await page.evaluate(() => (window as unknown as { __game: { summary(): Summary } }).__game.summary());
  expect(summary.tick).toBe(0);
  expect(summary.baseHp).toEqual([2000, 2000]);

  expect(errors).toEqual([]);
});
