import { FOLLOW_GAP } from '../defs/balance.ts';
import { unitDef } from '../defs/index.ts';
import { other, type Side, type SimState, type Unit } from './types.ts';

/** The unit furthest from its own gate. Everything on the other side aims at it. */
export function frontUnit(units: readonly Unit[]): Unit | undefined {
  let best: Unit | undefined;
  for (const u of units) {
    if (!best || u.pos > best.pos || (u.pos === best.pos && u.id < best.id)) best = u;
  }
  return best;
}

/** Units from the toughest (most hit points left) down; the foremost first among equals. */
export function byToughness(units: readonly Unit[]): Unit[] {
  return [...units].sort((a, b) => b.hp - a.hp || b.pos - a.pos || a.id - b.id);
}

/**
 * The side that is paid what `side` earns on this tick: itself, unless its
 * earnings are being diverted. Money that arrives this way is not earned by
 * the side that gets it, so two sides that divert each other simply swap.
 */
export function payee(s: SimState, side: Side): Side {
  return s.tick < s.sides[side].divertedUntil ? other(side) : side;
}

/**
 * How far forward a body of this length can stand in a row without overlapping
 * anyone: at `want`, or else queued up behind whoever is in the way.
 */
export function slotIn(units: readonly Unit[], row: number, want: number, len: number): number {
  let front = want;
  // Within a row the list runs front to back.
  for (const u of units) {
    if (u.row !== row) continue;
    if (front - len - FOLLOW_GAP >= u.pos) break; // it fits in front of this one, so of everyone behind it too
    front = Math.min(front, u.pos - unitDef(u.def).len - FOLLOW_GAP);
  }
  return front;
}

/** Puts a unit that did not walk out of the gate into the list, in front of whoever now stands behind it in its row. */
export function insertInRow(units: Unit[], u: Unit): void {
  const behind = units.findIndex((x) => x.row === u.row && x.pos < u.pos);
  if (behind < 0) units.push(u);
  else units.splice(behind, 0, u);
}
