import { SPECIAL, STATS, type EraKey, type RoleStats, type TurretStats } from './balance.ts';
import type { EraDef, Role, ShotDef, SpecialDef, TurretDef, UnitDef } from './types.ts';

type Look = Omit<ShotDef, 'speed'>;

/** Combines the shared stats for a role with one faction's art. */
function makeUnit(id: string, role: Role, rig: string, stats: RoleStats, shot?: Look): UnitDef {
  const def: UnitDef = {
    id,
    role,
    rig,
    cost: stats.cost,
    buildTicks: stats.buildTicks,
    hp: stats.hp,
    speed: stats.speed,
    len: stats.len,
    range: stats.range,
    dmg: stats.dmg,
    windup: stats.windup,
    recover: stats.recover,
    bounty: stats.bounty,
    cleave: stats.cleave ?? false,
  };
  if (shot) {
    if (stats.shotSpeed === undefined) throw new Error(`${id}: a shot needs shotSpeed in its role stats`);
    def.shot = { ...shot, speed: stats.shotSpeed };
  }
  return def;
}

function makeTurret(id: string, rig: string, stats: TurretStats, shot: Look): TurretDef {
  return {
    id,
    rig,
    cost: stats.cost,
    range: stats.range,
    dmg: stats.dmg,
    cooldown: stats.cooldown,
    shot: { ...shot, speed: stats.shotSpeed },
  };
}

/** What a faction supplies for one era: names of drawings and how its projectiles fly. */
export interface EraLook {
  key: EraKey;
  year: number;
  /** Art file names inside art/<faction>/<era>/. */
  light: string;
  ranged: string;
  rangedShot: Look;
  heavy: string;
  turret: string;
  turretShot: Look;
  special: SpecialKind;
}

/** A special without the bookkeeping fields, which makeEra fills in. */
export type SpecialKind = SpecialDef extends infer S ? (S extends unknown ? Omit<S, 'id' | 'cooldown' | 'firstReady'> : never) : never;

/**
 * Builds one era for one faction: the shared numbers for that era, with this
 * faction's drawings. `prefix` is the short id ('hm', 'ah'), `folder` the art folder.
 */
export function makeEra(prefix: string, folder: string, look: EraLook): EraDef {
  const stats = STATS[look.key];
  const id = `${prefix}.${look.key}`;
  const art = (name: string): string => `${folder}/${look.key}/${name}`;
  const withArt = (shot: Look): Look => ({ ...shot, rig: art(shot.rig) });
  const special = {
    ...look.special,
    ...(look.special.rig ? { rig: art(look.special.rig) } : {}),
    id: `${id}.special`,
    cooldown: SPECIAL.cooldown,
    firstReady: SPECIAL.firstReady,
  } as SpecialDef;
  return {
    id,
    key: look.key,
    year: look.year,
    baseRig: art('base'),
    baseHp: stats.baseHp,
    progressNeeded: stats.progressNeeded,
    units: [
      makeUnit(`${id}.light`, 'light', art(look.light), stats.light),
      makeUnit(`${id}.ranged`, 'ranged', art(look.ranged), stats.ranged, withArt(look.rangedShot)),
      makeUnit(`${id}.heavy`, 'heavy', art(look.heavy), stats.heavy),
    ],
    turret: makeTurret(`${id}.turret`, art(look.turret), stats.turret, withArt(look.turretShot)),
    special,
  };
}
