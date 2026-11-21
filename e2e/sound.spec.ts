import { expect, test } from '@playwright/test';

interface Levels {
  seconds: number;
  peak: number;
  rms: number;
  bright: number;
}

type Hooks = { __game: { audioLevels(): Promise<Levels>; musicLevels(bars: number): Promise<Levels> } };

/**
 * Nobody can listen in a test, but the sound code can at least be shown to
 * start, run alongside a real match and switch off without an error.
 */
test('sound starts with the match, survives play, and steps through its three modes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await page.waitForSelector('body[data-ready="1"]');
  await page.keyboard.press('Enter');
  // The match now runs on the real clock, with the tune and the effects playing.
  await expect(page.locator('body')).toHaveAttribute('data-audio', /running|suspended/);
  await page.keyboard.press('KeyQ');
  await page.keyboard.press('KeyU');
  await page.keyboard.press('KeyE'); // refused: not enough money
  await page.waitForTimeout(2500);
  await expect(page.locator('.clock')).not.toHaveText('0:00');

  const button = page.locator('.mute');
  await expect(button).toHaveAttribute('data-mode', 'all');
  await page.keyboard.press('KeyM');
  await expect(button).toHaveAttribute('data-mode', 'effects');
  await page.keyboard.press('Space');
  await expect(page.locator('.screen:not([hidden]) h1')).toHaveText('Pauze');
  await page.keyboard.press('Space');
  await page.keyboard.press('KeyM');
  await expect(button).toHaveAttribute('data-mode', 'off');
  await page.keyboard.press('KeyM');
  await expect(button).toHaveAttribute('data-mode', 'all');
  await page.waitForTimeout(400);

  expect(errors).toEqual([]);
});

test('the tune is soft, and with every effect on top nothing clips', async ({ page }) => {
  await page.goto('/?test=1');
  await page.waitForSelector('body[data-ready="1"]');

  // Rendered offline: sixteen bars of the tune alone.
  const music = await page.evaluate(() => (window as unknown as Hooks).__game.musicLevels(16));
  expect(music.seconds).toBeGreaterThan(30);
  expect(music.rms, 'audible').toBeGreaterThan(0.015);
  expect(music.rms, 'in the background, not in your face').toBeLessThan(0.08);
  expect(music.peak).toBeLessThan(0.6);
  // The first tune, all square waves and hiss, scored 0.18 here and was called annoying.
  expect(music.bright, 'no buzz, no hiss').toBeLessThan(0.07);

  // The busiest stretch of the tune with every effect played over it.
  const all = await page.evaluate(() => (window as unknown as Hooks).__game.audioLevels());
  expect(all.peak, 'louder than full scale means distortion').toBeLessThan(0.98);
  expect(all.rms, 'not silent on average').toBeGreaterThan(0.02);
  expect(all.rms, 'not a wall of noise').toBeLessThan(0.3);
});
