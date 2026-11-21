import type { Unit } from './types.ts';

/** The unit furthest from its own gate. Everything on the other side aims at it. */
export function frontUnit(units: readonly Unit[]): Unit | undefined {
  let best: Unit | undefined;
  for (const u of units) {
    if (!best || u.pos > best.pos || (u.pos === best.pos && u.id < best.id)) best = u;
  }
  return best;
}

/** The unit with the most hit points left; the foremost one if several are level. */
export function toughestUnit(units: readonly Unit[]): Unit | undefined {
  let best: Unit | undefined;
  for (const u of units) {
    if (!best || u.hp > best.hp || (u.hp === best.hp && (u.pos > best.pos || (u.pos === best.pos && u.id < best.id)))) {
      best = u;
    }
  }
  return best;
}
