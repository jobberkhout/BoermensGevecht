import { UNIT_CAP } from '../defs/balance.ts';
import { eraOf, unitDef } from '../defs/index.ts';
import type { Role } from '../defs/types.ts';
import { canDo } from '../sim/commands.ts';
import { nextRng, rngValue } from '../sim/rng.ts';
import { other, type Command, type Side, type SimState } from '../sim/types.ts';

/**
 * Scripted players, used only by tests and the balance script. A bot looks at
 * the match and returns at most one command. The product itself has no AI opponent.
 */
export type Bot = (s: SimState, side: Side) => Command | null;

const BUY: Record<Role, Command> = {
  light: { t: 'buy', slot: 0 },
  ranged: { t: 'buy', slot: 1 },
  heavy: { t: 'buy', slot: 2 },
};
const TURRET: Command = { t: 'turret' };
const SPECIAL: Command = { t: 'special' };

function count(s: SimState, side: Side, role: Role): number {
  let n = 0;
  for (const u of s.sides[side].units) if (unitDef(u.def).role === role) n++;
  for (const q of s.sides[side].queue) if (unitDef(q.def).role === role) n++;
  return n;
}

/**
 * Every bot uses its special the same way: when enough enemies are on the lane
 * to make it count. A stun is only worth it while someone is there to exploit it.
 */
function special(s: SimState, side: Side): Command | null {
  const me = s.sides[side];
  if (s.sides[other(side)].units.length < 3 || !canDo(s, side, SPECIAL)) return null;
  if (eraOf(me.faction, me.era).special.kind === 'stun') {
    const fighting = me.units.filter((u) => u.act === 'attack').length;
    if (fighting < 2) return null;
  }
  return SPECIAL;
}

function tryCmd(s: SimState, side: Side, cmd: Command): Command | null {
  return canDo(s, side, cmd) ? cmd : null;
}

/** Nothing but the cheapest unit, as fast as the money allows. */
export const rush: Bot = (s, side) => special(s, side) ?? tryCmd(s, side, BUY.light);

/** One unit up front to take the blows, ranged units behind it. */
export const archers: Bot = (s, side) => {
  const sp = special(s, side);
  if (sp) return sp;
  if (count(s, side, 'light') === 0) return tryCmd(s, side, BUY.light);
  return tryCmd(s, side, BUY.ranged);
};

/** Saves up for heavies; buys a cheap unit only when the lane is being overrun. */
export const heavies: Bot = (s, side) => {
  const sp = special(s, side);
  if (sp) return sp;
  const heavy = tryCmd(s, side, BUY.heavy);
  if (heavy) return heavy;
  const outnumbered = s.sides[other(side)].units.length > s.sides[side].units.length + s.sides[side].queue.length + 1;
  return outnumbered ? tryCmd(s, side, BUY.light) : null;
};

/** Turrets first, then a defensive line. */
export const turtle: Bot = (s, side) => {
  const sp = special(s, side);
  if (sp) return sp;
  const me = s.sides[side];
  if (me.turrets.includes(null)) {
    // Keep one cheap unit out while saving for the turret.
    if (me.units.length + me.queue.length === 0 && me.gold >= eraOf(me.faction, me.era).turret.cost + 60) {
      return tryCmd(s, side, BUY.light);
    }
    return tryCmd(s, side, TURRET);
  }
  if (count(s, side, 'light') === 0) return tryCmd(s, side, BUY.light);
  return tryCmd(s, side, BUY.ranged);
};

/** A sensible mix: two lights and two ranged for every heavy, plus a turret after the first round. */
export function mixed(): Bot {
  const pattern: Role[] = ['light', 'ranged', 'light', 'ranged', 'heavy'];
  let bought = 0;
  return (s, side) => {
    const sp = special(s, side);
    if (sp) return sp;
    if (bought >= pattern.length && s.sides[side].turrets.includes(null)) {
      return tryCmd(s, side, TURRET);
    }
    const cmd = tryCmd(s, side, BUY[pattern[bought % pattern.length]!]);
    if (cmd) bought++;
    return cmd;
  };
}

/**
 * Plays the way a sensible person would: a front line, ranged units behind it,
 * a turret when it can be afforded, and heavies once the money piles up.
 */
export const adaptive: Bot = (s, side) => {
  const sp = special(s, side);
  if (sp) return sp;
  const me = s.sides[side];
  const era = eraOf(me.faction, me.era);
  const front = count(s, side, 'light') + count(s, side, 'heavy');
  const total = me.units.length + me.queue.length;
  if (total >= 4 && me.turrets.includes(null) && me.gold >= era.turret.cost) return TURRET;
  const heavyCost = era.units[2].cost;
  if (me.gold >= heavyCost + 120 || (total >= UNIT_CAP - 2 && me.gold >= heavyCost)) return tryCmd(s, side, BUY.heavy);
  if (front === 0) return tryCmd(s, side, BUY.light);
  if (count(s, side, 'ranged') < 2 * front + 1) return tryCmd(s, side, BUY.ranged);
  return tryCmd(s, side, BUY.light);
};

/** Presses random buttons. Finds the situations a sensible player would never create. */
export function random(seed: number): Bot {
  let state = seed >>> 0;
  const options: Command[] = [BUY.light, BUY.ranged, BUY.heavy, TURRET, SPECIAL];
  return (s, side) => {
    state = nextRng(state);
    const roll = rngValue(state);
    if (roll % 4 !== 0) return null;
    return tryCmd(s, side, options[(roll >>> 8) % options.length]!);
  };
}

export const BOTS: Record<string, () => Bot> = {
  rush: () => rush,
  archers: () => archers,
  heavies: () => heavies,
  turtle: () => turtle,
  mixed,
  adaptive: () => adaptive,
};
