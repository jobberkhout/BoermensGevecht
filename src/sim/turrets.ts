import { TURRET } from '../defs/balance.ts';
import type { TurretDef } from '../defs/types.ts';

/**
 * How far from its owner's gate a turret of this level reaches. Every upgrade
 * lets it shoot a step further, and a turret of the next era starts where this
 * one ends (TURRET in defs/balance.ts).
 */
export function turretRange(def: TurretDef, level: number): number {
  return def.range + (level - 1) * TURRET.rangeStep;
}

/** What one shot from a turret of this level does. Every upgrade makes it hit harder. */
export function turretDamage(def: TurretDef, level: number): number {
  return Math.floor((def.dmg * TURRET.damagePercent[level - 1]!) / 100);
}
