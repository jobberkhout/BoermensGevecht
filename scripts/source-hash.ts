/**
 * A fingerprint of everything the playable file is made from. The build stamps
 * it into BoermensGevecht.html and a test compares the two, so the file in the
 * repository can never quietly fall behind the source.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const INPUTS = ['index.html', 'art', 'src'];
/** Only real source: a stray .DS_Store must not change the fingerprint. */
const KINDS = ['.ts', '.css', '.svg', '.html'];

async function filesUnder(path: string): Promise<string[]> {
  if (!(await stat(join(ROOT, path))).isDirectory()) return [path];
  const found: string[] = [];
  for (const entry of await readdir(join(ROOT, path), { withFileTypes: true })) {
    const child = `${path}/${entry.name}`;
    if (entry.isDirectory()) found.push(...(await filesUnder(child)));
    else if (KINDS.some((kind) => entry.name.endsWith(kind))) found.push(child);
  }
  return found;
}

export async function sourceHash(): Promise<string> {
  const hash = createHash('sha256');
  const files = (await Promise.all(INPUTS.map(filesUnder))).flat().sort();
  for (const file of files) {
    hash.update(`${file}\n`);
    // Line endings differ between machines; the game does not care, so neither does the fingerprint.
    hash.update((await readFile(join(ROOT, file), 'utf8')).replace(/\r\n/g, '\n'));
    hash.update('\0');
  }
  return hash.digest('hex').slice(0, 16);
}
