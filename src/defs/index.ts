import { achterhoek } from './achterhoek.ts';
import { havermelk } from './havermelk.ts';
import type { EraDef, FactionDef, FactionId, SpecialDef, TurretDef, UnitDef } from './types.ts';
import { zuidas } from './zuidas.ts';

export const FACTIONS: Record<FactionId, FactionDef> = { havermelk, achterhoek, zuidas };

/**
 * Every faction that can be picked, in the order the players step through
 * them. A faction that is still being drawn is in FACTIONS above, so its rules
 * and texts are tested, but not in this list until its last drawing is there.
 *
 * De Zuidas is waiting for two things: the drawing of De brandkast (1975) and
 * the animations of De Gouden Handdruk (2050). See docs/new-faction.md.
 */
export const FACTION_IDS: readonly FactionId[] = ['havermelk', 'achterhoek'];

/** What a match starts with until the players pick something else. Amsterdam lies west of the Achterhoek. */
export const DEFAULT_FACTIONS: [FactionId, FactionId] = ['havermelk', 'achterhoek'];

export const UNITS: Record<string, UnitDef> = {};
export const TURRETS: Record<string, TurretDef> = {};
export const SPECIALS: Record<string, SpecialDef> = {};
/** Which faction trained a unit, by unit id. A unit that was bought over still talks like where it came from. */
const HOME: Record<string, FactionId> = {};
/** The colour of the puff a projectile leaves where it lands, by the id of its drawing. */
export const SPLASH: Record<string, string> = {};

for (const faction of Object.values(FACTIONS)) {
  for (const era of faction.eras) {
    for (const unit of era.units) {
      UNITS[unit.id] = unit;
      HOME[unit.id] = faction.id;
      if (unit.shot) SPLASH[unit.shot.rig] = unit.shot.splash;
    }
    TURRETS[era.turret.id] = era.turret;
    SPLASH[era.turret.shot.rig] = era.turret.shot.splash;
    SPECIALS[era.special.id] = era.special;
  }
}

/** Every piece of art a match between these factions can show, backdrops excepted. */
export function artFor(factions: readonly FactionId[]): Set<string> {
  const ids = new Set<string>();
  for (const id of factions) {
    const faction = FACTIONS[id];
    ids.add(faction.flagRig);
    for (const era of faction.eras) {
      ids.add(era.baseRig);
      ids.add(era.turret.rig);
      ids.add(era.turret.shot.rig);
      if (era.special.rig) ids.add(era.special.rig);
      for (const unit of era.units) {
        ids.add(unit.rig);
        if (unit.shot) ids.add(unit.shot.rig);
      }
    }
  }
  return ids;
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

/** The faction a unit was trained by, whoever it fights for now. */
export function homeOf(unitId: string): FactionId {
  const home = HOME[unitId];
  if (!home) throw new Error(`unknown unit ${unitId}`);
  return home;
}

/** Which era of its faction a turret belongs to. */
export function turretEra(faction: FactionId, id: string): number {
  return FACTIONS[faction].eras.findIndex((era) => era.turret.id === id);
}
