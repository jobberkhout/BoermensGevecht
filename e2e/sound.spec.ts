import { expect, test } from '@playwright/test';

/**
 * Nobody can listen in a test, but the sound code can at least be shown to
 * start, run alongside a real match and switch off without an error.
 */
test('sound starts with the match, survives play, and can be muted', async ({ page }) => {
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

  await page.keyboard.press('KeyM');
  await expect(page.locator('.mute')).toHaveClass(/muted/);
  await page.keyboard.press('Space');
  await expect(page.locator('.screen:not([hidden]) h1')).toHaveText('Pauze');
  await page.keyboard.press('Space');
  await page.keyboard.press('KeyM');
  await expect(page.locator('.mute')).not.toHaveClass(/muted/);
  await page.waitForTimeout(400);

  expect(errors).toEqual([]);
});

test('the tune and the effects are audible and do not clip', async ({ page }) => {
  await page.goto('/?test=1');
  await page.waitForSelector('body[data-ready="1"]');
  const levels = await page.evaluate(() =>
    (window as unknown as { __game: { audioLevels(): Promise<{ seconds: number; peak: number; rms: number }> } }).__game.audioLevels(),
  );
  // Rendered offline: the whole tune once, with every effect played over it.
  expect(levels.seconds).toBeGreaterThan(8);
  expect(levels.peak, 'louder than full scale means distortion').toBeLessThan(0.98);
  expect(levels.peak, 'something should be clearly audible').toBeGreaterThan(0.15);
  expect(levels.rms, 'not silent on average').toBeGreaterThan(0.02);
  expect(levels.rms, 'not a wall of noise').toBeLessThan(0.3);
});
