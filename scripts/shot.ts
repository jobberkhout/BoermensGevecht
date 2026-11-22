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

/** One step of the staged battle: set things up, press, run some ticks, maybe take a picture. */
interface Stage {
  run: number;
  press?: Press[];
  /** Subsidie for both sides. */
  fund?: number;
  /** Vooruitgang for both sides, so they can modernize. */
  progress?: number;
  /** Makes both specials ready. */
  charge?: boolean;
  base?: [0 | 1, number];
  shot?: string;
  /** Also saves a close-up of both button panels. */
  panels?: boolean;
}

const ARMY: Press[] = [[0, 'buy2'], [0, 'buy1'], [0, 'buy0'], [0, 'buy1'], [1, 'buy2'], [1, 'buy0'], [1, 'buy1'], [1, 'buy1']];
const MORE: Press[] = [[0, 'buy1'], [1, 'buy1'], [0, 'buy0'], [1, 'buy2'], [0, 'buy2'], [1, 'buy0']];
const TURRETS: Press[] = [[0, 'turret'], [1, 'turret']];
const MODERNIZE: Press[] = [[0, 'eraUp'], [1, 'eraUp']];

/** A staged battle that walks through all three eras, every special and the end screen. */
const BATTLE: Stage[] = [
  // 1975
  { run: 0, fund: 900, press: ARMY },
  { run: 240, press: [...TURRETS, [0, 'subsidy'], [1, 'subsidy'], [0, 'buy0'], [1, 'buy0']], shot: '1975-march' },
  { run: 330, fund: 900, press: MORE, shot: '1975-clash' },
  { run: 45, charge: true, press: [[1, 'special']], shot: '1975-hoken' },
  { run: 22, press: [[0, 'special']], shot: '1975-lovein' },
  // 2025: the old turrets stay until they are bought again, then get upgraded
  { run: 2, progress: 1500, shot: '1975-ready', panels: true },
  { run: 8, press: MODERNIZE, shot: '2025-modernized' },
  { run: 150, fund: 6000, press: [...TURRETS, ...ARMY], shot: '2025-old-and-new' },
  { run: 240, fund: 6000, press: [...TURRETS, ...TURRETS, ...MORE], shot: '2025-clash' },
  { run: 14, charge: true, press: [[1, 'special']], shot: '2025-kolonne' },
  { run: 90, press: [[0, 'buy1'], [0, 'buy0']] },
  { run: 20, press: [[0, 'special']], shot: '2025-wegblokkade' },
  // 2050
  { run: 8, progress: 4200, press: MODERNIZE, shot: '2050-modernized' },
  { run: 200, fund: 20000, press: [...TURRETS, ...TURRETS, [0, 'buy3'], [1, 'buy3'], ...ARMY] },
  { run: 260, fund: 20000, press: [...TURRETS, ...TURRETS, ...TURRETS, ...MORE], shot: '2050-clash', panels: true },
  { run: 30, charge: true, press: [[1, 'special']], shot: '2050-zwerm' },
  { run: 60, fund: 20000, press: [[1, 'buy2'], [1, 'buy0']] },
  { run: 6, press: [[0, 'special']], shot: '2050-algoritme' },
  { run: 300, shot: '2050-late' },
  // From here only the right player keeps buying, so the left base falls and the end screen shows.
  ...Array.from({ length: 10 }, (): Stage => ({
    run: 300,
    fund: 20000,
    base: [0, 300],
    press: [[1, 'buy2'], [1, 'buy0'], [1, 'buy1'], [1, 'buy1'], [1, 'buy0']],
  })),
  { run: 0, shot: 'win' },
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
          for (const side of [0, 1]) {
            if (st.fund !== undefined) g.fund(side, st.fund);
            if (st.progress !== undefined) g.progress(side, st.progress);
            if (st.charge) g.charge(side);
          }
          if (st.base) g.setBase(st.base[0], st.base[1]);
          for (const [side, action] of st.press ?? []) g.press(side, action);
          g.advance(st.run);
        }, stage);
        if (stage.shot) {
          const file = `screens/${engineName}/battle-${stage.shot}.png`;
          await page.screenshot({ path: file });
          console.log(file, JSON.stringify(await page.evaluate(() => (window as any).__game.summary())));
          if (stage.panels) {
            for (const where of ['left', 'right']) {
              await page.locator(`.panel.${where}`).screenshot({ path: `screens/${engineName}/panel-${stage.shot}-${where}.png` });
            }
          }
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
