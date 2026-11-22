import { achterhoek } from './achterhoek.ts';
import { havermelk } from './havermelk.ts';
import type { EraDef, FactionDef, FactionId, SpecialDef, TurretDef, UnitDef } from './types.ts';

export const FACTIONS: Record<FactionId, FactionDef> = { havermelk, achterhoek };

/** Left player first: Amsterdam lies west of the Achterhoek. */
export const DEFAULT_FACTIONS: [FactionId, FactionId] = ['havermelk', 'achterhoek'];

export const UNITS: Record<string, UnitDef> = {};
export const TURRETS: Record<string, TurretDef> = {};
export const SPECIALS: Record<string, SpecialDef> = {};

for (const faction of Object.values(FACTIONS)) {
  for (const era of faction.eras) {
    for (const unit of era.units) UNITS[unit.id] = unit;
    TURRETS[era.turret.id] = era.turret;
    SPECIALS[era.special.id] = era.special;
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

export function specialDef(id: string): SpecialDef {
  const def = SPECIALS[id];
  if (!def) throw new Error(`unknown special ${id}`);
  return def;
}

/** Which era of its faction a turret belongs to. */
export function turretEra(faction: FactionId, id: string): number {
  return FACTIONS[faction].eras.findIndex((era) => era.turret.id === id);
}
