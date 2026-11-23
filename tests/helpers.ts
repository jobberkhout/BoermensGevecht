import { unitDef } from '../src/defs/index.ts';
import type { FactionId } from '../src/defs/types.ts';
import { createMatch } from '../src/sim/create.ts';
import { step } from '../src/sim/step.ts';
import type { Command, Side, SimEvent, SimState, Stamped, Unit } from '../src/sim/types.ts';

/** Unit ids of the first era, the one every match starts in. */
export const HM = { light: 'hm.1975.light', ranged: 'hm.1975.ranged', heavy: 'hm.1975.heavy' } as const;
export const AH = { light: 'ah.1975.light', ranged: 'ah.1975.ranged', heavy: 'ah.1975.heavy' } as const;

export const ZA = { light: 'za.1975.light', ranged: 'za.1975.ranged', heavy: 'za.1975.heavy' } as const;

/** The schild of the first era: the unit that takes the turrets' fire. */
export const SHIELD = { hm: 'hm.1975.shield', ah: 'ah.1975.shield', za: 'za.1975.shield' } as const;

/** The super units, which only the last era has. */
export const SUPER = { hm: 'hm.2050.super', ah: 'ah.2050.super', za: 'za.2050.super' } as const;

/** Era indices, for tests that need a side to be further along. */
export const ERA = { y1975: 0, y2025: 1, y2050: 2 } as const;

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
    turncoat: false,
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

/** Gives a side enough money for anything and makes its special ready now. */
export function rich(s: SimState, side: Side): void {
  s.sides[side].gold = 1_000_000;
  s.sides[side].specialReadyAt = 0;
}
