import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { sourceHash } from '../scripts/source-hash.ts';

/**
 * BoermensGevecht.html in the root of the repository is the game as one
 * double-clickable file. It is built, not written, so it can go stale; this
 * test notices.
 */
const FILE = join(import.meta.dirname, '..', 'BoermensGevecht.html');

describe('the single-file game', () => {
  it('is up to date with the source', async () => {
    expect(existsSync(FILE), 'BoermensGevecht.html is missing: run `npm run build`').toBe(true);
    const built = /<meta name="built-from" content="([0-9a-f]+)"/.exec(readFileSync(FILE, 'utf8'))?.[1];
    expect(built, 'BoermensGevecht.html is older than the source: run `npm run build` and commit it').toBe(await sourceHash());
  });

  it('needs nothing but itself', () => {
    const html = readFileSync(FILE, 'utf8');
    // Outside the inlined code there must be no reference to any other file or address.
    const shell = html.replace(/<style>[\s\S]*?<\/style>/, '').replace(/<script type="module">[\s\S]*<\/script>/, '');
    expect(shell).not.toMatch(/\s(?:src|href)=/);
    expect(html).not.toMatch(/https?:\/\/(?!www\.w3\.org\/)/);
  });
});
