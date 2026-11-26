import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The website (GitHub Pages) is the single file plus a few files in pages/
 * that make it an app on a phone. They name each other; this test notices
 * when one of them names a file that is not there or not published.
 */
const ROOT = join(import.meta.dirname, '..');
const PAGES = join(ROOT, 'pages');
const workflow = readFileSync(join(ROOT, '.github', 'workflows', 'pages.yml'), 'utf8');
const manifest = JSON.parse(readFileSync(join(PAGES, 'manifest.webmanifest'), 'utf8')) as {
  name: string;
  start_url: string;
  display: string;
  orientation: string;
  icons: { src: string; sizes: string }[];
};
const worker = readFileSync(join(PAGES, 'sw.js'), 'utf8');
const phone = readFileSync(join(ROOT, 'src', 'ui', 'phone.ts'), 'utf8');

/** Is this file in pages/ and copied onto the site by the workflow? */
function published(file: string): boolean {
  return existsSync(join(PAGES, file)) && workflow.includes(`pages/${file}`);
}

describe('the website', () => {
  it('has the single file as its front page', () => {
    expect(workflow).toContain('cp BoermensGevecht.html site/index.html');
  });

  it('opens as an app: fullscreen, sideways, with icons in the sizes phones ask for', () => {
    expect(manifest.name).toBe('Boermens Gevecht');
    expect(manifest.start_url).toBe('./');
    expect(manifest.display).toBe('fullscreen');
    expect(manifest.orientation).toBe('landscape');
    const sizes = manifest.icons.map((icon) => icon.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    for (const icon of manifest.icons) expect(published(icon.src), icon.src).toBe(true);
  });

  it('publishes every file the page and the service worker ask for', () => {
    const shell = /const SHELL = \[([^\]]*)\]/.exec(worker)![1]!.match(/'([^']+)'/g)!.map((s) => s.slice(1, -1));
    for (const file of shell.filter((f) => f !== './')) expect(published(file), file).toBe(true);
    for (const file of ['manifest.webmanifest', 'sw.js', 'icon-192.png']) {
      expect(phone, `src/ui/phone.ts should ask for ${file}`).toContain(`'${file}'`);
      expect(published(file), file).toBe(true);
    }
  });
});
