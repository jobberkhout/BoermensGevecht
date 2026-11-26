import { devices, expect, test, type Page } from '@playwright/test';

/**
 * The game on a phone: a Pixel held sideways, played with a finger. Only
 * Chromium can pretend to be a phone with a touch screen, and Chrome is what
 * an Android phone plays in, so these run there alone.
 */
const { defaultBrowserType: _, ...pixel } = devices['Pixel 7 landscape'];
const { defaultBrowserType: __, ...upright } = devices['Pixel 7'];

interface Hooks {
  advance(n: number): void;
  fund(side: number, gold: number): void;
  summary(): { units: [number, number] };
}

function advance(page: Page, ticks: number): Promise<{ units: [number, number] }> {
  return page.evaluate((n) => {
    const g = (window as unknown as { __game: Hooks }).__game;
    g.fund(0, 2000);
    g.fund(1, 2000);
    g.advance(n);
    return g.summary();
  }, ticks);
}

/** Height and font size of the first button of a panel that matches. */
function measure(page: Page, selector: string): Promise<{ height: number; font: number }> {
  return page.locator(selector).first().evaluate((node) => ({
    height: node.getBoundingClientRect().height,
    font: parseFloat(getComputedStyle(node.querySelector('.label')!).fontSize),
  }));
}

test.describe('on a phone', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'only Chromium plays a phone');
  test.use({ ...pixel, viewport: { width: 915, height: 412 } });

  test('alone against the computer, with big buttons and fingers', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/?test=1');
    await page.waitForSelector('body[data-ready="1"]');

    // The title card speaks of tapping, and on a phone the computer takes the right side to begin with.
    await expect(page.locator('.screen:not([hidden]) .go')).toHaveText('Tik hier om te beginnen');
    await expect(page.locator('.side.right')).toHaveAttribute('data-player', 'computer');
    await expect(page.locator('.side:not(.right)')).toHaveAttribute('data-player', 'human');
    await expect(page.locator('#turn')).toBeHidden();

    await page.locator('.screen:not([hidden]) .go').tap();
    await expect(page.locator('.screen:not([hidden])')).toHaveCount(0);

    // Only the player's own panel, one row of buttons a thumb can hit and names that can be read.
    await expect(page.locator('.panel.right')).toBeHidden();
    await expect(page.locator('.btn kbd').first()).toBeHidden();
    const unit = await measure(page, '.panel.left .btn:not(.small)');
    expect(unit.height).toBeGreaterThanOrEqual(60);
    expect(unit.font).toBeGreaterThanOrEqual(10);
    const action = await measure(page, '.panel.left .btn.small');
    expect(action.height).toBeGreaterThanOrEqual(60);

    // A tap buys a unit, and it walks out.
    await page.locator('.panel.left .btn').first().tap();
    expect((await advance(page, 120)).units[0]).toBe(1);

    // Pause is a button too, and so is carrying on.
    await page.locator('.pause').tap();
    await expect(page.locator('.screen:not([hidden]) h1')).toHaveText('Pauze');
    await page.locator('.screen:not([hidden]) .go').first().tap();
    await expect(page.locator('.screen:not([hidden])')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('two players on one phone each get half of it', async ({ page }) => {
    await page.goto('/?test=1');
    await page.waitForSelector('body[data-ready="1"]');
    await page.locator('.side.right .player').tap();
    await expect(page.locator('.side.right')).toHaveAttribute('data-player', 'human');
    await page.locator('.screen:not([hidden]) .go').tap();

    await expect(page.locator('.panel.left')).toBeVisible();
    await expect(page.locator('.panel.right')).toBeVisible();
    for (const side of ['left', 'right']) {
      const unit = await measure(page, `.panel.${side} .btn:not(.small)`);
      expect(unit.height).toBeGreaterThanOrEqual(48);
      expect(unit.font).toBeGreaterThanOrEqual(9);
    }
    // The two halves do not overlap.
    const left = (await page.locator('.panel.left').boundingBox())!;
    const right = (await page.locator('.panel.right').boundingBox())!;
    expect(left.x + left.width).toBeLessThanOrEqual(right.x);

    await page.locator('.panel.left .btn').first().tap();
    await page.locator('.panel.right .btn').first().tap();
    expect((await advance(page, 120)).units).toEqual([1, 1]);
  });
});

test.describe('on a phone held upright', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'only Chromium plays a phone');
  test.use(upright);

  test('asks to be turned', async ({ page }) => {
    await page.goto('/?test=1');
    await page.waitForSelector('body[data-ready="1"]');
    await expect(page.locator('#turn')).toBeVisible();
    await expect(page.locator('#turn')).toContainText('Draai je telefoon');
  });
});

test('on a computer the keys stay on the buttons, and pause is a button as well', async ({ page }) => {
  await page.goto('/?test=1');
  await page.waitForSelector('body[data-ready="1"]');
  await expect(page.locator('#turn')).toHaveCount(0);
  await expect(page.locator('.side.right')).toHaveAttribute('data-player', 'human');
  await page.keyboard.press('Enter');
  await expect(page.locator('.panel.left .btn kbd').first()).toBeVisible();
  await expect(page.locator('.panel.right')).toBeVisible();
  await page.locator('.pause').click();
  await expect(page.locator('.screen:not([hidden]) h1')).toHaveText('Pauze');
  await page.keyboard.press('Space');
  await expect(page.locator('.screen:not([hidden])')).toHaveCount(0);
});
