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
