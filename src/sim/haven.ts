import { LANE } from '../defs/balance.ts';
import { unitDef } from '../defs/index.ts';
import type { SpecialDef, UnitDef } from '../defs/types.ts';
import { payee } from './lane.ts';
import { other, type Damage, type Shot, type Side, type SimEvent, type SimState, type Unit } from './types.ts';

/**
 * Rotterdam's rules, 26 November 2026. The owner asked that "each faction has
 * some units that do something special"; which units and how is mine
 * (docs/factions.md, section 4). Like everything on the lane they are
 * mirrored: positions are distances from each side's own gate, a side only
 * moves its own units directly, and what it does to the enemy goes onto the
 * damage list and lands at the end of the tick.
 *
 * - Lasser Leen's sparks: whoever hits him up close takes part of its blow back.
 * - Gabber Gerrie's tempo: every blow in a row comes sooner than the last.
 * - De Kapsalonkoerier's sauce: the tray splashes on everyone around its target.
 * - De AGV's havengeld: it earns money every second it is on the lane.
 * - De Kraan's lift: now and then its blow picks up the enemy's front unit and
 *   drops it further back, on whoever stands behind it.
 * - De container (a special): it lies across the lane and nobody walks past it.
 * - Mouwen opstropen! (a special): everything the side trains is ready at once.
 * - De kering sluit (a special): the side's units take half of every hit.
 */

/** The pause after a blow, for a unit whose beat speeds up with every blow in a row (UnitDef.tempo). */
export function recoverOf(u: Unit, def: UnitDef): number {
  if (!def.tempo) return def.recover;
  const percent = Math.max(def.tempo.floorPercent, 100 - def.tempo.stepPercent * (u.beat ?? 0));
  return Math.floor((def.recover * percent) / 100);
}

/**
 * A close blow of `amount` by unit `u` of `side` lands on `target`. If that is
 * Lasser Leen, `u` burns on his sparks: part of the blow comes back to it, at
 * the end of the tick with the rest of the damage.
 */
export function sparksOff(s: SimState, side: Side, u: Unit, target: Unit, amount: number, dmg: Damage[], events: SimEvent[]): void {
  const sparks = unitDef(target.def).sparks;
  if (!sparks) return;
  const back = Math.floor((amount * sparks.percent) / 100);
  if (back <= 0) return;
  dmg.push({ side, unit: u.id, amount: back });
  events.push({ t: 'sparked', side: other(side), id: target.id, by: u.id });
}

/**
 * A tray of kapsalon hit `hit`, one of `units`: every other unit among them
 * whose front is within the sauce's reach of `hit`'s front, in any row, gets a
 * share of the damage.
 */
export function splashSauce(shot: Shot, foe: Side, units: readonly Unit[], hit: Unit, dmg: Damage[], events: SimEvent[]): void {
  if (!shot.sauce) return;
  const amount = Math.floor((shot.dmg * shot.sauce.dmgPercent) / 100);
  if (amount <= 0) return;
  const ids: number[] = [];
  for (const u of units) {
    if (u === hit || u.hp <= 0 || Math.abs(u.pos - hit.pos) > shot.sauce.reach) continue;
    dmg.push({ side: foe, unit: u.id, amount });
    ids.push(u.id);
  }
  if (ids.length > 0) events.push({ t: 'sauced', side: foe, ids });
}

/**
 * Pay day at the port: every unit of `side` that earns brings in its havengeld,
 * unless it stands stunned. Called when the income comes in, and paid like it:
 * to the other side while this side's earnings are diverted.
 */
export function earn(s: SimState, side: Side, events: SimEvent[]): void {
  const to = payee(s, side);
  for (const u of s.sides[side].units) {
    const earns = unitDef(u.def).earns;
    if (!earns || u.hp <= 0 || u.stunUntil > s.tick) continue;
    s.sides[to].gold += earns.amount;
    events.push({ t: 'earned', side: to, owner: side, id: u.id, amount: earns.amount });
  }
}

/**
 * The crane's blow of `amount` on `front`, the enemy's foremost unit: if its
 * hook is free again it lifts that unit and drops it further back, onto
 * whoever of its own side stands behind it in its row within the drop, who
 * takes a share of the blow. The move itself is a shove, made at the end of
 * the tick (sim/step.ts, resolve). A unit that shrugs specials off is too
 * big to lift.
 */
export function lift(s: SimState, side: Side, u: Unit, def: UnitDef, front: Unit, amount: number, dmg: Damage[]): void {
  if (!def.lift || s.tick < (u.liftAt ?? 0) || unitDef(front.def).immune) return;
  u.liftAt = s.tick + def.lift.every;
  const foe = other(side);
  dmg.push({ side: foe, unit: front.id, amount: 0, shove: def.lift.shove, lift: true });
  // Whoever it lands on: the nearest unit behind it in its row, within the drop.
  let under: Unit | undefined;
  for (const f of s.sides[foe].units) {
    if (f === front || f.row !== front.row || f.pos >= front.pos || front.pos - f.pos > def.lift.shove + unitDef(front.def).len) continue;
    if (!under || f.pos > under.pos || (f.pos === under.pos && f.id < under.id)) under = f;
  }
  if (under) dmg.push({ side: foe, unit: under.id, amount: Math.floor((amount * def.lift.dmgPercent) / 100) });
}

/** True while everything `side` trains is ready at once. */
export function rushing(s: SimState, side: Side): boolean {
  return s.sides[side].rushUntil > s.tick;
}

/** The share of a hit that lands on a unit of `side`: all of it, or less while its storm barrier is shut. */
export function sheltered(s: SimState, side: Side, amount: number): number {
  const me = s.sides[side];
  return me.shelterUntil > s.tick ? Math.floor((amount * me.shelterPercent) / 100) : amount;
}

/**
 * Drops a container of `def` for `side` on the enemy's foremost unit: it is
 * centred on that unit's front and stays until its time is up. Every enemy
 * unit whose front lies under it is hurt, and the units of both sides whose
 * front lies under it are pushed out to its near edge, at the end of the tick,
 * so the two front lines end up a container apart. With nobody on the lane it
 * falls in the middle. Units that shrug specials off are neither hurt nor
 * pushed; walking past it, nobody can.
 */
export function dropContainer(s: SimState, side: Side, def: Extract<SpecialDef, { kind: 'block' }>, dmg: Damage[], events: SimEvent[]): void {
  const foe = other(side);
  let front: Unit | undefined;
  for (const u of s.sides[foe].units) if (!front || u.pos > front.pos || (u.pos === front.pos && u.id < front.id)) front = u;
  // In the dropping side's frame, the middle of the container.
  const at = front ? LANE - front.pos : Math.floor(LANE / 2);
  const half = Math.floor(def.width / 2);
  const ids: number[] = [];
  for (const who of [side, foe] as const) {
    const mid = who === side ? at : LANE - at;
    for (const u of s.sides[who].units) {
      if (u.pos < mid - half || u.pos > mid + half || unitDef(u.def).immune) continue;
      const hurt = who === foe ? def.dmg : 0;
      dmg.push({ side: who, unit: u.id, amount: hurt, shove: u.pos - (mid - half) });
      if (hurt > 0) ids.push(u.id);
    }
  }
  s.blocks.push({ id: s.nextId++, side, at, width: def.width, until: s.tick + def.ticks, rig: def.rig ?? '' });
  events.push({ t: 'blocked', side, at, ticks: def.ticks, ids });
}

/**
 * How far forward the units of `side` may walk with the containers on the
 * lane: up to the near side of each, from either side. Whoever already stands
 * under one stays where it is. Infinity with none.
 */
export function wallFor(s: SimState, side: Side): number {
  let wall = Infinity;
  for (const b of s.blocks) {
    const mid = b.side === side ? b.at : LANE - b.at;
    wall = Math.min(wall, mid - Math.floor(b.width / 2));
  }
  return wall;
}

/** Containers whose time is up are lifted off the lane. */
export function clearBlocks(s: SimState): void {
  if (s.blocks.some((b) => b.until <= s.tick)) s.blocks = s.blocks.filter((b) => b.until > s.tick);
}
