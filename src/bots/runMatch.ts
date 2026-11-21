import { TPS } from '../defs/balance.ts';
import { DEFAULT_FACTIONS } from '../defs/index.ts';
import type { FactionId } from '../defs/types.ts';
import { createMatch } from '../sim/create.ts';
import { hashState } from '../sim/hash.ts';
import { step } from '../sim/step.ts';
import { SIDES, type Replay, type Side, type SimEvent, type SimState, type Stamped } from '../sim/types.ts';
import type { Bot } from './bots.ts';

export interface MatchResult {
  winner: Side | 'draw' | null;
  ticks: number;
  hash: string;
  baseHp: [number, number];
  replay: Replay;
}

export interface MatchOptions {
  seed: number;
  bots: [Bot, Bot];
  factions?: [FactionId, FactionId];
  /** Give up after this long; the result then has winner null. */
  maxTicks?: number;
  /** How often a bot may act. People don't press thirty buttons a second either. */
  thinkEvery?: number;
  onTick?: (s: SimState, events: SimEvent[]) => void;
}

/** Plays a whole match between two bots without any rendering. */
export function runMatch(opts: MatchOptions): MatchResult {
  const factions = opts.factions ?? DEFAULT_FACTIONS;
  const maxTicks = opts.maxTicks ?? 20 * 60 * TPS;
  const thinkEvery = opts.thinkEvery ?? 6;
  const s = createMatch(opts.seed, factions);
  const all: Stamped[] = [];
  const events: SimEvent[] = [];

  while (s.winner === null && s.tick < maxTicks) {
    const now: Stamped[] = [];
    if (s.tick % thinkEvery === 0) {
      for (const side of SIDES) {
        const cmd = opts.bots[side](s, side);
        if (cmd) now.push({ tick: s.tick, side, cmd });
      }
    }
    all.push(...now);
    events.length = 0;
    step(s, now, events);
    opts.onTick?.(s, events);
  }

  return {
    winner: s.winner,
    ticks: s.tick,
    hash: hashState(s),
    baseHp: [s.sides[0].baseHp, s.sides[1].baseHp],
    replay: { v: 1, seed: opts.seed, factions, cmds: all },
  };
}

/** Plays a recorded match back. Same replay, same result, every time. */
export function runReplay(replay: Replay, maxTicks = 20 * 60 * TPS): { state: SimState; hash: string } {
  const s = createMatch(replay.seed, replay.factions);
  const byTick = new Map<number, Stamped[]>();
  for (const c of replay.cmds) {
    const list = byTick.get(c.tick);
    if (list) list.push(c);
    else byTick.set(c.tick, [c]);
  }
  const events: SimEvent[] = [];
  const none: Stamped[] = [];
  while (s.winner === null && s.tick < maxTicks) {
    events.length = 0;
    step(s, byTick.get(s.tick) ?? none, events);
  }
  return { state: s, hash: hashState(s) };
}
