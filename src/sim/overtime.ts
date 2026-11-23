import { OVERTIME } from '../defs/balance.ts';

/** How many times overtime has turned the screw by this tick: 0 before overtime, 1 at its first moment. */
export function overtimeLevel(tick: number): number {
  return tick < OVERTIME.at ? 0 : 1 + Math.floor((tick - OVERTIME.at) / OVERTIME.every);
}

/** How hard units hit at this tick, as a percentage of their normal damage. */
export function unitDamagePercent(tick: number): number {
  return 100 + overtimeLevel(tick) * OVERTIME.stepPercent;
}

/** How hard turrets hit at this tick, as a percentage of their normal damage. In overtime they wear out. */
export function turretDamagePercent(tick: number): number {
  return Math.max(0, 100 - overtimeLevel(tick) * OVERTIME.turretStepPercent);
}

/** True once the subsidiekraan is closed: no more regular income, and no point in applying for more. */
export function kraanDicht(tick: number): boolean {
  return !OVERTIME.income && tick >= OVERTIME.at;
}
