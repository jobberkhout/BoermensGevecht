/**
 * Folds the built site into one file, BoermensGevecht.html, that plays when it
 * is double-clicked: no server, no install, no other files, no internet.
 *
 * `npm run build` runs this after Vite. The result is written next to the
 * built site in dist/ and to the root of the repository, where it is committed
 * so that anyone who downloads the repository can play straight away.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { sourceHash } from './source-hash.ts';

const ROOT = join(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');
const NAME = 'BoermensGevecht.html';

const page = await readFile(join(DIST, 'index.html'), 'utf8');
const script = /[ \t]*<script type="module"[^>]*\ssrc="([^"]+)"[^>]*><\/script>\n?/.exec(page);
const style = /[ \t]*<link rel="stylesheet"[^>]*\shref="([^"]+)"[^>]*>\n?/.exec(page);
if (!script || !style) throw new Error('dist/index.html does not look like a fresh build: run `vite build` first');

const shell = page.replace(script[0], '').replace(style[0], '');
if (/\s(?:src|href)=/.test(shell)) throw new Error('dist/index.html still points at another file; it would be missing from the single file');

const css = await readFile(join(DIST, style[1]!), 'utf8');
if (/<\/style/i.test(css)) throw new Error('the stylesheet contains "</style", which would end the inlined block early');

// Inside a <script> block the browser reads "</script" as the end of it and
// "<!--" as the start of something else, even in the middle of a string. The
// drawings are full of both, so they are written as \x3C, which means the same.
const js = (await readFile(join(DIST, script[1]!), 'utf8')).replace(/<(\/script|!--)/gi, '\\x3C$1');

const head = [
  `    <meta name="built-from" content="${await sourceHash()}" />`,
  `    <style>${css.trim()}</style>`,
  '',
].join('\n');
const note = '<!-- Boermens Gevecht: het hele spel in één bestand. Dubbelklik om te spelen. Gemaakt door `npm run build`; niet met de hand aanpassen. -->';

// Function replacements: the bundle is full of "$" and must be inserted as it is.
const single = shell
  .replace('<!doctype html>', () => `<!doctype html>\n${note}`)
  .replace(/[ \t]*<\/head>/, (end) => head + end)
  .replace(/[ \t]*<\/body>/, (end) => `    <script type="module">${js.trim()}</script>\n${end}`);

if (!single.includes(note) || !single.includes('<style>') || !single.includes('<script type="module">')) {
  throw new Error('could not put the single file together: the shape of dist/index.html changed');
}

await writeFile(join(DIST, NAME), single);
await writeFile(join(ROOT, NAME), single);
console.log(`${NAME}  ${(Buffer.byteLength(single) / 1024).toFixed(0)} kB, the whole game in one file`);
