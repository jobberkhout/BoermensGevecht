import { achterhoek } from './achterhoek.ts';
import { havermelk } from './havermelk.ts';
import type { EraDef, FactionDef, FactionId, TurretDef, UnitDef } from './types.ts';

export const FACTIONS: Record<FactionId, FactionDef> = { havermelk, achterhoek };

/** Left player first: Amsterdam lies west of the Achterhoek. */
export const DEFAULT_FACTIONS: [FactionId, FactionId] = ['havermelk', 'achterhoek'];

export const UNITS: Record<string, UnitDef> = {};
export const TURRETS: Record<string, TurretDef> = {};

for (const faction of Object.values(FACTIONS)) {
  for (const era of faction.eras) {
    for (const unit of era.units) UNITS[unit.id] = unit;
    TURRETS[era.turret.id] = era.turret;
  }
}

export function eraOf(faction: FactionId, era: number): EraDef {
  const def = FACTIONS[faction].eras[era];
  if (!def) throw new Error(`${faction} has no era ${era}`);
  return def;
}

export function unitDef(id: string): UnitDef {
  const def = UNITS[id];
  if (!def) throw new Error(`unknown unit ${id}`);
  return def;
}

export function turretDef(id: string): TurretDef {
  const def = TURRETS[id];
  if (!def) throw new Error(`unknown turret ${id}`);
  return def;
}
