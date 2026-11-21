import { unitDef } from '../src/defs/index.ts';
import type { FactionId } from '../src/defs/types.ts';
import { createMatch } from '../src/sim/create.ts';
import { step } from '../src/sim/step.ts';
import type { Command, Side, SimEvent, SimState, Stamped, Unit } from '../src/sim/types.ts';

export const HM = { light: 'hm.e4.light', ranged: 'hm.e4.ranged', heavy: 'hm.e4.heavy' } as const;
export const AH = { light: 'ah.e4.light', ranged: 'ah.e4.ranged', heavy: 'ah.e4.heavy' } as const;

export function match(factions?: [FactionId, FactionId]): SimState {
  return createMatch(1, factions);
}

/** Puts a unit straight onto the lane, skipping the purchase and the training. */
export function place(s: SimState, side: Side, def: string, pos: number, hp?: number, row = 1): Unit {
  const d = unitDef(def);
  const unit: Unit = {
    id: s.nextId++,
    def,
    row,
    pos,
    prevPos: pos,
    hp: hp ?? d.hp,
    act: 'walk',
    actTick: 0,
    stunUntil: 0,
  };
  const units = s.sides[side].units;
  units.push(unit);
  units.sort((a, b) => b.pos - a.pos); // front first
  return unit;
}

/** Runs `ticks` ticks and returns every event that happened. */
export function run(s: SimState, ticks: number, cmds: Stamped[] = []): SimEvent[] {
  const all: SimEvent[] = [];
  const events: SimEvent[] = [];
  for (let i = 0; i < ticks; i++) {
    events.length = 0;
    step(s, cmds, events);
    all.push(...events);
  }
  return all;
}

/** Issues one command on the current tick and advances one tick. */
export function act(s: SimState, side: Side, cmd: Command): SimEvent[] {
  return run(s, 1, [{ tick: s.tick, side, cmd }]);
}

export function unit(s: SimState, side: Side, id: number): Unit | undefined {
  return s.sides[side].units.find((u) => u.id === id);
}
