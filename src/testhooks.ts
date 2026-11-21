import { Sound } from './audio/sound.ts';
import { TPS } from './defs/balance.ts';
import type { Game } from './game.ts';
import type { Side } from './sim/types.ts';
import type { Action } from './ui/input.ts';

/**
 * With ?test=1 in the address the match does not run on the clock. A script
 * steps it tick by tick through window.__game, so a screenshot of tick 300 is
 * the same picture every time.
 */
export interface TestApi {
  start(): void;
  press(side: Side, action: Action): void;
  /** Runs this many ticks, drawing after each as the real loop would. */
  advance(ticks: number): void;
  /** Hands a side money, to stage a scene quickly. */
  fund(side: Side, gold: number): void;
  /** Sets how much is left of a side's base. */
  setBase(side: Side, hp: number): void;
  summary(): { tick: number; winner: unknown; units: [number, number]; baseHp: [number, number] };
  /** Renders the tune and every effect into a buffer and reports how loud it gets. */
  audioLevels(): Promise<Levels>;
  /** The same for the tune alone, over the given number of bars. */
  musicLevels(bars: number): Promise<Levels>;
}

export interface Levels {
  seconds: number;
  /** Largest sample; 1 is full scale. */
  peak: number;
  /** Average level. */
  rms: number;
  /**
   * How harsh it is: the level of the sample-to-sample change relative to the
   * level itself. A soft low tone scores near 0; buzzing and hiss score high.
   */
  bright: number;
}

async function measure(seconds: number, queue: (sound: Sound) => number): Promise<Levels> {
  const rate = 44100;
  const offline = new OfflineAudioContext(1, Math.ceil(rate * seconds), rate);
  const sound = new Sound(true);
  sound.setMode('all');
  sound.unlock(offline);
  const used = queue(sound);
  const samples = (await offline.startRendering()).getChannelData(0);
  const count = Math.min(samples.length, Math.ceil(used * rate));
  let peak = 0;
  let squares = 0;
  let changes = 0;
  for (let i = 1; i < count; i++) {
    const v = samples[i]!;
    const d = v - samples[i - 1]!;
    peak = Math.max(peak, Math.abs(v));
    squares += v * v;
    changes += d * d;
  }
  return { seconds: used, peak, rms: Math.sqrt(squares / count), bright: Math.sqrt(changes / Math.max(squares, 1e-12)) };
}

export function installTestHooks(game: Game): void {
  game.manual = true;
  const api: TestApi = {
    start: () => {
      game.confirm();
      game.draw(0, 1);
    },
    press: (side, action) => game.press(side, action),
    advance: (ticks) => {
      for (let i = 0; i < ticks && game.phase === 'playing'; i++) {
        game.tick();
        game.draw(1 / TPS, 1);
      }
      game.draw(0, 1);
    },
    fund: (side, gold) => {
      if (game.phase === 'playing') game.state.sides[side].gold = gold;
    },
    setBase: (side, hp) => {
      if (game.phase === 'playing') game.state.sides[side].baseHp = hp;
    },
    audioLevels: () => measure(12, (sound) => sound.demo()),
    musicLevels: (bars) => measure(bars * 4 + 4, (sound) => sound.demoMusic(bars)),
    summary: () => ({
      tick: game.state.tick,
      winner: game.state.winner,
      units: [game.state.sides[0].units.length, game.state.sides[1].units.length],
      baseHp: [game.state.sides[0].baseHp, game.state.sides[1].baseHp],
    }),
  };
  (window as unknown as { __game: TestApi }).__game = api;
}
