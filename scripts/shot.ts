/**
 * Takes screenshots so the art can be checked without opening a browser by hand.
 *
 *   node scripts/shot.ts gallery                 every rig, rest pose
 *   node scripts/shot.ts rig <id> [zoom]         one rig with all its clips
 *   node scripts/shot.ts page <path> [name]      any page of the dev server
 *   node scripts/shot.ts battle                  the title screen and a staged battle at set moments
 *   add --engine=firefox|webkit|all              default is chromium
 *   add --size=1920x1080                         viewport, default 1600x1000
 *
 * Files land in screens/<engine>/. Console errors from the page are printed.
 */
import { mkdir } from 'node:fs/promises';
import { chromium, firefox, webkit, type BrowserType } from '@playwright/test';
import { createServer } from 'vite';

const ENGINES: Record<string, BrowserType> = { chromium, firefox, webkit };

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const flags = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [k, v] = a.slice(2).split('=');
      return [k, v ?? '1'];
    }),
);
const engineNames = flags.engine === 'all' ? Object.keys(ENGINES) : [flags.engine ?? 'chromium'];
const [vw, vh] = (flags.size ?? '1600x1000').split('x').map(Number);

interface Job {
  path: string;
  name: string;
  fullPage: boolean;
}

type Press = [side: 0 | 1, action: string];

/** A staged battle: what gets pressed when, and when to take a picture. */
const BATTLE: { run: number; press?: Press[]; fund?: number; base?: [0 | 1, number]; shot?: string }[] = [
  { run: 0, fund: 900, press: [[0, 'buy2'], [0, 'buy1'], [0, 'buy0'], [0, 'buy1'], [1, 'buy2'], [1, 'buy0'], [1, 'buy1'], [1, 'buy1']] },
  { run: 240, press: [[0, 'turret'], [1, 'turret'], [0, 'buy0'], [1, 'buy0']], shot: 'march' },
  { run: 330, press: [[0, 'buy1'], [1, 'buy1'], [0, 'buy0'], [1, 'buy2']], shot: 'clash' },
  { run: 200, press: [[0, 'buy2'], [1, 'buy1'], [1, 'buy0']] },
  { run: 14, press: [[1, 'special']], shot: 'kolonne' },
  { run: 90, press: [[0, 'buy1'], [0, 'buy0']] },
  { run: 20, press: [[0, 'special']], shot: 'wegblokkade' },
  { run: 400, base: [0, 30], shot: 'late' },
  { run: 3000, shot: 'win' },
];

function jobs(): Job[] {
  const [mode, a, b] = args;
  switch (mode) {
    case 'gallery':
      return [{ path: 'gallery.html?zoom=2', name: 'gallery', fullPage: true }];
    case 'rig': {
      if (!a) throw new Error('usage: shot.ts rig <id> [zoom]');
      return [{ path: `gallery.html?rig=${encodeURIComponent(a)}&zoom=${b ?? 3}`, name: `rig-${a.replace(/\//g, '-')}`, fullPage: true }];
    }
    case 'page': {
      if (!a) throw new Error('usage: shot.ts page <path> [name]');
      return [{ path: a, name: b ?? a.replace(/[^a-z0-9]+/gi, '-'), fullPage: false }];
    }
    case 'battle':
      return [];
    default:
      throw new Error('usage: shot.ts gallery | rig <id> [zoom] | page <path> [name] | battle');
  }
}

const server = await createServer({ logLevel: 'error', server: { port: 5199, strictPort: false } });
await server.listen();
const origin = server.resolvedUrls?.local[0];
if (!origin) throw new Error('the dev server did not report an address');

let failed = false;
try {
  for (const engineName of engineNames) {
    const engine = ENGINES[engineName];
    if (!engine) throw new Error(`unknown engine ${engineName}`);
    await mkdir(`screens/${engineName}`, { recursive: true });
    const browser = await engine.launch();
    const page = await browser.newPage({ viewport: { width: vw!, height: vh! }, deviceScaleFactor: 1 });
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') console.log(`  [${engineName} ${msg.type()}] ${msg.text()}`);
    });
    page.on('pageerror', (err) => {
      failed = true;
      console.log(`  [${engineName} page error] ${err.message}`);
    });
    if (args[0] === 'battle') {
      await page.goto(origin + '?test=1');
      await page.waitForSelector('body[data-ready="1"]', { timeout: 20000 });
      await page.screenshot({ path: `screens/${engineName}/title.png` });
      console.log(`screens/${engineName}/title.png`);
      await page.evaluate(() => (window as any).__game.start());
      for (const stage of BATTLE) {
        await page.evaluate((st) => {
          const g = (window as any).__game;
          if (st.fund !== undefined) {
            g.fund(0, st.fund);
            g.fund(1, st.fund);
          }
          if (st.base) g.setBase(st.base[0], st.base[1]);
          for (const [side, action] of st.press ?? []) g.press(side, action);
          g.advance(st.run);
        }, stage);
        if (stage.shot) {
          const file = `screens/${engineName}/battle-${stage.shot}.png`;
          await page.screenshot({ path: file });
          console.log(file, JSON.stringify(await page.evaluate(() => (window as any).__game.summary())));
        }
      }
      await browser.close();
      continue;
    }
    for (const job of jobs()) {
      await page.goto(origin + job.path);
      await page.waitForSelector('body[data-ready="1"]', { timeout: 20000 });
      const file = `screens/${engineName}/${job.name}.png`;
      await page.screenshot({ path: file, fullPage: job.fullPage });
      const bad = await page.locator('.bad').allTextContents();
      if (bad.length > 0) {
        failed = true;
        console.log(`  [${engineName}] problems on ${job.path}:\n    ${bad.join('\n    ')}`);
      }
      console.log(file);
    }
    await browser.close();
  }
} finally {
  await server.close();
}
process.exit(failed ? 1 : 0);
