import { Sound } from './audio/sound.ts';
import { TPS } from './defs/balance.ts';
import { FACTION_IDS } from './defs/index.ts';
import type { FactionId } from './defs/types.ts';
import type { Game } from './game.ts';
import type { Side } from './sim/types.ts';
import type { Action } from './ui/input.ts';

/**
 * With ?test=1 in the address the match does not run on the clock. A script
 * steps it tick by tick through window.__game, so a screenshot of tick 300 is
 * the same picture every time.
 */
export interface TestApi {
  /** On the title card: puts a faction on a side. Resolves when its art is loaded. */
  pick(side: Side, faction: FactionId): Promise<void>;
  start(): void;
  /** From the end of a match, or from the pause card, back to the title card. */
  back(): void;
  /** Gives up whatever is going on and goes back to the title card. */
  quit(): void;
  /** Every faction that can be picked, in the order of the title card. */
  factions(): FactionId[];
  press(side: Side, action: Action): void;
  /** Runs this many ticks, drawing after each as the real loop would. */
  advance(ticks: number): void;
  /** Hands a side money, to stage a scene quickly. */
  fund(side: Side, gold: number): void;
  /** Sets how much is left of a side's base. */
  setBase(side: Side, hp: number): void;
  /** Hands a side vooruitgang, so it can modernize. */
  progress(side: Side, amount: number): void;
  /** Makes a side's special ready now. */
  charge(side: Side): void;
  /** Moves the match clock to this many seconds, to stage overtime without playing ten minutes. */
  setClock(seconds: number): void;
  summary(): Summary;
  /** Renders the tune and every effect into a buffer and reports how loud it gets. */
  audioLevels(): Promise<Levels>;
  /** The same for the tune alone, over the given number of bars. */
  musicLevels(bars: number): Promise<Levels>;
}

export interface Summary {
  phase: string;
  factions: [string, string];
  tick: number;
  winner: unknown;
  units: [number, number];
  baseHp: [number, number];
  era: [number, number];
  subsidy: [number, number];
  /** Per side, the level of the turret in each slot; 0 for an empty slot. */
  turrets: [number[], number[]];
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
    pick: (side, faction) => game.choose(side, faction),
    back: () => {
      game.back();
      game.draw(0, 1);
    },
    quit: () => {
      if (game.phase === 'playing' && !game.paused) game.togglePause();
      game.back();
      game.draw(0, 1);
    },
    factions: () => [...FACTION_IDS],
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
    progress: (side, amount) => {
      if (game.phase === 'playing') game.state.sides[side].progress = amount;
    },
    charge: (side) => {
      if (game.phase === 'playing') game.state.sides[side].specialReadyAt = 0;
    },
    setClock: (seconds) => {
      if (game.phase === 'playing') game.state.tick = Math.round(seconds * TPS);
    },
    // Long enough for every effect in the list; measure() stops where the demo does.
    audioLevels: () => measure(30, (sound) => sound.demo()),
    musicLevels: (bars) => measure(bars * 4 + 4, (sound) => sound.demoMusic(bars)),
    summary: () => ({
      phase: game.phase,
      factions: [game.state.sides[0].faction, game.state.sides[1].faction],
      tick: game.state.tick,
      winner: game.state.winner,
      units: [game.state.sides[0].units.length, game.state.sides[1].units.length],
      baseHp: [game.state.sides[0].baseHp, game.state.sides[1].baseHp],
      era: [game.state.sides[0].era, game.state.sides[1].era],
      subsidy: [game.state.sides[0].subsidy, game.state.sides[1].subsidy],
      turrets: [game.state.sides[0].turrets.map((t) => t?.level ?? 0), game.state.sides[1].turrets.map((t) => t?.level ?? 0)],
    }),
  };
  (window as unknown as { __game: TestApi }).__game = api;
}
