import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { expect, test } from '@playwright/test';

/**
 * Every drawing is cut into parts and put back together by the game. In its
 * rest pose the result must be the same picture as the SVG file itself, in
 * every browser engine. This catches a browser that renders a part differently.
 */

const ART = join(import.meta.dirname, '..', 'art');

function rigIds(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return rigIds(path);
    return entry.name.endsWith('.svg') ? [relative(ART, path).replace(/\\/g, '/').replace(/\.svg$/, '')] : [];
  });
}

for (const id of rigIds(ART)) {
  test(`${id} assembles into the picture its file shows`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto(`/gallery.html?rig=${encodeURIComponent(id)}&zoom=2`);
    await page.waitForSelector('body[data-ready="1"]');
    expect(await page.locator('.bad').allTextContents()).toEqual([]);
    const difference = Number(await page.locator('body').getAttribute('data-rest-diff'));
    // The measure forgives a one-pixel shift (browsers place edges a fraction of a pixel apart);
    // beyond that, nothing may move, vanish or change colour.
    expect(difference).toBeLessThan(0.005);
    // The same comparison on a puppet shoved out of place must see the damage,
    // or a silently broken comparison would pass everything.
    const control = Number(await page.locator('body').getAttribute('data-rest-diff-control'));
    expect(control).toBeGreaterThan(0.01);
    expect(errors).toEqual([]);
  });
}
