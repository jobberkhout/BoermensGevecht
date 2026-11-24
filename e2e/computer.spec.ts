import { expect, test } from '@playwright/test';

interface Summary {
  phase: string;
  factions: [string, string];
  tick: number;
  units: [number, number];
  gold: [number, number];
  subsidy: [number, number];
  turrets: [number[], number[]];
}

interface Hooks {
  advance(n: number): void;
  summary(): Summary;
}

test('someone alone hands a side to the computer, and the computer plays it', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  const advance = (ticks: number): Promise<Summary> =>
    page.evaluate((n) => {
      const g = (window as unknown as { __game: Hooks }).__game;
      g.advance(n);
      return g.summary();
    }, ticks);

  await page.goto('/?test=1');
  await page.waitForSelector('body[data-ready="1"]');
  const right = page.locator('.screen:not([hidden]) .side').last();
  await expect(right).toHaveAttribute('data-player', 'human');

  // On the title card the right player's special key hands that side to the computer.
  await page.keyboard.press('KeyK');
  await expect(right).toHaveAttribute('data-player', 'computer');
  await expect(right.locator('.player')).toContainText('Computer');
  await expect(right.locator('h3 small')).toContainText('Computer');

  await page.keyboard.press('Enter');
  await expect(page.locator('.screen:not([hidden])')).toHaveCount(0);
  await expect(page.locator('.team.right .title')).toContainText('Computer');
  await expect(page.locator('.team.left .title')).not.toContainText('Computer');

  // Its keys are the computer's now: a person pressing them buys nothing.
  await page.keyboard.press('KeyU');
  await page.keyboard.press('KeyI');
  const first = await advance(1);
  expect(first.gold[1]).toBe(first.gold[0]);

  // Within a minute it has applied for subsidie and sent units out, all by itself.
  const later = await advance(60 * 30);
  expect(later.phase).toBe('playing');
  expect(later.subsidy[1]).toBeGreaterThan(0);
  expect(later.units[1] + later.turrets[1].filter((level) => level > 0).length).toBeGreaterThan(0);
  // The left side, which nobody touched, did nothing.
  expect(later.subsidy[0]).toBe(0);
  expect(later.units[0]).toBe(0);

  // Back on the title card the choice is still there, and a click hands the side back.
  await page.keyboard.press('Space');
  await page.keyboard.press('Escape');
  await expect(right).toHaveAttribute('data-player', 'computer');
  await right.locator('.player').click();
  await expect(right).toHaveAttribute('data-player', 'human');

  expect(errors).toEqual([]);
});
