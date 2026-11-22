import { expect, test, type Page } from '@playwright/test';

interface Summary {
  phase: string;
  factions: [string, string];
  tick: number;
  winner: unknown;
  units: [number, number];
  baseHp: [number, number];
  era: [number, number];
  subsidy: [number, number];
  turrets: [number[], number[]];
}

interface Hooks {
  pick(side: number, faction: string): Promise<void>;
  start(): void;
  quit(): void;
  factions(): string[];
  advance(n: number): void;
  summary(): Summary;
  setBase(side: number, hp: number): void;
  fund(side: number, gold: number): void;
  progress(side: number, amount: number): void;
  charge(side: number): void;
  press(side: number, action: string): void;
}

/** Runs the match for a number of ticks and reports where it stands. */
function advance(page: Page, ticks: number): Promise<Summary> {
  return page.evaluate((n) => {
    const g = (window as unknown as { __game: Hooks }).__game;
    g.advance(n);
    return g.summary();
  }, ticks);
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
  expect(summary.baseHp).toEqual([2500, 2500]);
  expect(summary.era).toEqual([0, 0]);

  expect(errors).toEqual([]);
});

test('subsidie, turret levels and modernizing work from the keyboard', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  const hooks = <T>(fn: (g: Hooks) => T): Promise<T> =>
    page.evaluate(`(${fn.toString()})(window.__game)`) as Promise<T>;

  await page.goto('/?test=1');
  await page.waitForSelector('body[data-ready="1"]');
  await page.keyboard.press('Enter');
  await expect(page.locator('.team.left .title small')).toHaveText("Jaren '70");

  // Subsidie aanvragen: D for the left player, L for the right. It costs money and raises the income.
  await expect(page.locator('.panel.left .purse small')).toContainText('+12/s');
  await page.keyboard.press('KeyD');
  await page.keyboard.press('KeyL');
  let summary = await advance(page, 2);
  expect(summary.subsidy).toEqual([1, 1]);
  await expect(page.locator('.panel.left .purse small')).toContainText('+18/s');
  await expect(page.locator('.panel.left .btn.subsidy .sub')).toContainText('+18 → +26/s');

  // One turret button: it fills both slots, then upgrades the lowest.
  await hooks((g) => g.fund(0, 5000));
  await expect(page.locator('.panel.left .btn.turret .sub')).toHaveText('bouwen');
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('KeyA');
    summary = await advance(page, 2);
  }
  expect(summary.turrets[0]).toEqual([2, 1]);
  await expect(page.locator('.panel.left .btn.turret .sub')).toContainText('verbeteren');

  // Modernizing takes vooruitgang first: without it the button says no, whatever is in the purse.
  await page.keyboard.press('KeyF');
  await expect(page.locator('.panel.left .why')).toHaveText('Nog niet genoeg vooruitgang');
  expect((await advance(page, 2)).era).toEqual([0, 0]);

  // With the bar full it costs subsidie. The left player has it; the right player has to save up.
  await hooks((g) => {
    g.progress(0, 1500);
    g.progress(1, 1500);
    g.fund(1, 100);
  });
  await advance(page, 1);
  await expect(page.locator('.panel.left .btn.eraUp .cost')).toHaveText('500');
  await expect(page.locator('.panel.left .btn.eraUp')).toHaveClass(/ready/);
  await expect(page.locator('.panel.left .btn.eraUp .sub')).toHaveText("→ Jaren '20");
  await expect(page.locator('.panel.right .btn.eraUp')).toHaveClass(/full/);
  await expect(page.locator('.panel.right .btn.eraUp')).not.toHaveClass(/ready/);
  await page.keyboard.press('Semicolon');
  await expect(page.locator('.panel.right .why')).toHaveText('Te weinig subsidie');
  expect((await advance(page, 2)).era).toEqual([0, 0]);

  // Both step into the next era, each with their own key, and the price leaves the purse.
  await hooks((g) => g.fund(1, 520));
  await page.keyboard.press('KeyF');
  await page.keyboard.press('Semicolon');
  summary = await advance(page, 2);
  expect(summary.era).toEqual([1, 1]);
  expect(summary.baseHp).toEqual([5500, 5500]);
  // 520 went in and 500 came out; at most one second of income arrived in between.
  expect(Number(await page.locator('.panel.right .purse b').textContent())).toBeLessThan(100);
  await expect(page.locator('.team.left .title small')).toHaveText("Jaren '20");
  await expect(page.locator('.panel.left .btn .label').first()).toHaveText('Padel-Pepijn');
  await expect(page.locator('.panel.right .btn .label').first()).toHaveText('Quadink');

  // The old turrets keep standing, but the button now offers to replace them, back at level 1.
  await expect(page.locator('.panel.left .btn.turret .label')).toHaveText('Podcaststudio');
  await expect(page.locator('.panel.left .btn.turret .sub')).toHaveText('oude vervangen');
  await page.keyboard.press('KeyA');
  summary = await advance(page, 2);
  expect(summary.turrets[0]).toEqual([1, 1]);

  // Every era has four units to choose from. Until the last era the fourth is the schild, on R.
  await expect(page.locator('.panel.left .btn:not(.small):visible')).toHaveCount(4);
  await expect(page.locator('.panel.left .btn:not(.small) .label').nth(3)).toHaveText('Sup-Sanne');
  await page.keyboard.press('KeyR');
  expect((await advance(page, 3 * 30 + 5)).units[0]).toBe(1);

  // In the last era there is nothing left to modernize to, and the button makes way.
  await hooks((g) => g.progress(0, 4200));
  await page.keyboard.press('KeyF');
  summary = await advance(page, 2);
  expect(summary.era).toEqual([2, 1]);
  await expect(page.locator('.panel.left .btn.eraUp')).toBeHidden();
  await expect(page.locator('.panel.right .btn.eraUp')).toBeVisible();

  // There the fourth unit is the super unit, on R for the left player and P for the right.
  await expect(page.locator('.panel.left .btn:not(.small):visible')).toHaveCount(4);
  await expect(page.locator('.panel.right .btn:not(.small):visible')).toHaveCount(4);
  await expect(page.locator('.panel.left .btn:not(.small) .label').nth(3)).toHaveText('Havermelkreus');
  await expect(page.locator('.panel.right .btn:not(.small) .label').nth(3)).toHaveText('Balink');
  await hooks((g) => g.fund(0, 3000));
  await page.keyboard.press('KeyR');
  summary = await advance(page, 12 * 30 + 5);
  expect(summary.units[0]).toBe(2);
  await hooks((g) => {
    g.progress(1, 4200);
    g.fund(1, 1000);
    g.press(1, 'eraUp');
    g.advance(2);
    g.fund(1, 3000);
  });
  await page.keyboard.press('KeyP');
  summary = await advance(page, 12 * 30 + 5);
  expect(summary.units[1]).toBe(1);
  await expect(page.locator('.panel.right .btn:not(.small) .label').nth(3)).toHaveText('Kolossink');

  expect(errors).toEqual([]);
});

test('every faction plays through all three eras, with every unit and every special', async ({ page }) => {
  // A new faction is covered here without touching this file: the list comes from the game.
  test.setTimeout(240_000);
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/?test=1');
  await page.waitForSelector('body[data-ready="1"]');
  const factions = await page.evaluate(() => (window as unknown as { __game: Hooks }).__game.factions());
  expect(factions.length).toBeGreaterThanOrEqual(2);

  // Each faction once on the left and once on the right: against the next one in the list.
  for (let i = 0; i < factions.length; i++) {
    const pair = [factions[i]!, factions[(i + 1) % factions.length]!];
    await page.evaluate(async ([left, right]) => {
      const g = (window as unknown as { __game: Hooks }).__game;
      g.quit();
      await g.pick(0, left!);
      await g.pick(1, right!);
      g.start();
    }, pair);
    for (const era of [0, 1, 2]) {
      const summary = await page.evaluate((eraNow) => {
        const g = (window as unknown as { __game: Hooks }).__game;
        if (eraNow > 0) {
          for (const side of [0, 1]) {
            g.progress(side, 100000);
            g.fund(side, 100000);
            g.press(side, 'eraUp');
          }
          g.advance(2);
        }
        // Both sides build a turret and send one of everything, then each uses the special of this era.
        for (const side of [0, 1]) {
          g.fund(side, 100000);
          for (const action of ['turret', 'buy2', 'buy0', 'buy3', 'buy1', 'buy0']) g.press(side, action);
        }
        g.advance(520);
        for (const side of [0, 1]) {
          g.charge(side);
          g.press(side, 'special');
        }
        g.advance(240);
        return g.summary();
      }, era);
      expect(summary.factions, pair.join(' v ')).toEqual(pair);
      expect(summary.era, pair.join(' v ')).toEqual([era, era]);
      expect(summary.winner, pair.join(' v ')).toBeNull();
      // Every drawing is there: no button falls back to the letter that stands in for missing art.
      await expect(page.locator('.btn .pic.letter'), pair.join(' v ')).toHaveCount(0);
    }
    // The special buttons are recharging, which shows they were really used.
    await expect(page.locator('.panel.left .btn.special')).toHaveClass(/off/);
    await expect(page.locator('.panel.right .btn.special')).toHaveClass(/off/);
  }
  expect(errors).toEqual([]);
});

test('each player picks a faction on the title card, and any pair can play', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  const summary = (): Promise<Summary> => page.evaluate(() => (window as unknown as { __game: Hooks }).__game.summary());

  await page.goto('/?test=1');
  await page.waitForSelector('body[data-ready="1"]');
  const left = page.locator('.screen:not([hidden]) .side').first();
  const right = page.locator('.screen:not([hidden]) .side').last();
  await expect(left).toHaveAttribute('data-faction', 'havermelk');
  await expect(right).toHaveAttribute('data-faction', 'achterhoek');

  // Each player steps through the factions with two of their own keys: D is next for the left
  // player, J is previous for the right player. That swaps the two sides around.
  await page.keyboard.press('KeyD');
  await page.keyboard.press('KeyJ');
  await expect(left).toHaveAttribute('data-faction', 'achterhoek');
  await expect(right).toHaveAttribute('data-faction', 'havermelk');
  await expect(left.locator('h3 .who')).toContainText('Achterhoek');
  await expect(left.locator('.keys b').first()).toHaveText('Klein Mepperink');

  // Enter starts as soon as the art of the new picks is in.
  await page.keyboard.press('Enter');
  await expect(page.locator('.screen:not([hidden])')).toHaveCount(0);
  expect((await summary()).factions).toEqual(['achterhoek', 'havermelk']);
  await expect(page.locator('.team.left .title')).toContainText('Achterhoek');
  await expect(page.locator('.panel.left .btn .label').first()).toHaveText('Klein Mepperink');
  await expect(page.locator('.panel.right .btn .label').first()).toHaveText('Kraker Sjors');
  await expect(page.locator('.panel.left .purse small')).toContainText('landbouwsubsidie');
  // During a match those keys do what they always do, not pick factions.
  await page.keyboard.press('KeyD');
  expect((await summary()).factions).toEqual(['achterhoek', 'havermelk']);

  // The farmers win from the left, and the end card says so.
  await page.evaluate(() => {
    const g = (window as unknown as { __game: Hooks }).__game;
    g.setBase(1, 20);
    g.fund(0, 2000);
    for (let i = 0; i < 5; i++) g.press(0, 'buy0');
    g.advance(4000);
  });
  await expect(page.locator('.screen:not([hidden]) h1')).toHaveText('De Achterhoek wint!');

  // Escape goes back to the title card, where the same faction may be picked twice.
  await page.keyboard.press('Escape');
  await expect(page.locator('.screen:not([hidden]) h1')).toHaveText('Boermens Gevecht');
  expect((await summary()).phase).toBe('title');
  await right.locator('.arrow').last().click();
  await expect(right).toHaveAttribute('data-faction', 'achterhoek');
  await page.keyboard.press('Enter');
  await expect(page.locator('.screen:not([hidden])')).toHaveCount(0);
  expect((await summary()).factions).toEqual(['achterhoek', 'achterhoek']);

  // Space pauses; from the pause card Escape gives the match up.
  await page.keyboard.press('Space');
  await expect(page.locator('.screen:not([hidden]) h1')).toHaveText('Pauze');
  await page.keyboard.press('Escape');
  await expect(page.locator('.screen:not([hidden]) h1')).toHaveText('Boermens Gevecht');

  expect(errors).toEqual([]);
});

test('De Zuidas plays, and its takeover makes an enemy unit change sides', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/?test=1');
  await page.waitForSelector('body[data-ready="1"]');
  const pickable = await page.evaluate(() => (window as unknown as { __game: Hooks }).__game.factions());
  test.skip(!pickable.includes('zuidas'), 'De Zuidas is not in the list of factions yet');
  const before = await page.evaluate(async () => {
    const g = (window as unknown as { __game: Hooks }).__game;
    await g.pick(0, 'zuidas');
    g.start();
    // The farmers send a tractor; the Zuidas modernizes to the era of the takeover.
    g.fund(1, 1000);
    g.press(1, 'buy2');
    g.press(1, 'buy0');
    g.progress(0, 100000);
    g.fund(0, 100000);
    g.press(0, 'eraUp');
    g.advance(400);
    return g.summary();
  });
  expect(before.factions).toEqual(['zuidas', 'achterhoek']);
  expect(before.era).toEqual([1, 0]);
  expect(before.units).toEqual([0, 2]);
  await expect(page.locator('.team.left .title')).toContainText('De Zuidas');
  await expect(page.locator('.panel.left .purse small')).toContainText('bonussen');
  await expect(page.locator('.panel.left .btn.special .label')).toHaveText('Vijandige overname');
  // Every drawing of the new faction is there: no button falls back to a letter.
  await expect(page.locator('.btn .pic.letter')).toHaveCount(0);

  const after = await page.evaluate(() => {
    const g = (window as unknown as { __game: Hooks }).__game;
    g.charge(0);
    g.press(0, 'special');
    g.advance(2);
    return g.summary();
  });
  expect(after.units).toEqual([1, 1]);

  // The bought tractor fights on without errors, and the match can still be won.
  const end = await page.evaluate(() => {
    const g = (window as unknown as { __game: Hooks }).__game;
    g.advance(300);
    g.setBase(1, 20);
    g.fund(0, 5000);
    for (let i = 0; i < 5; i++) g.press(0, 'buy0');
    g.advance(4000);
    return g.summary();
  });
  expect(end.winner).toBe(0);
  await expect(page.locator('.screen:not([hidden]) h1')).toHaveText('De Zuidas wint!');
  expect(errors).toEqual([]);
});
