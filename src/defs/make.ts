import type { RoleStats, TurretStats } from './balance.ts';
import type { Role, TurretDef, UnitDef } from './types.ts';

interface ShotLook {
  rig: string;
  arc: number;
  spin: number;
}

/** Combines the shared stats for a role with one faction's art. */
export function makeUnit(id: string, role: Role, rig: string, stats: RoleStats, shot?: ShotLook): UnitDef {
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
    def.shot = { rig: shot.rig, arc: shot.arc, spin: shot.spin, speed: stats.shotSpeed };
  }
  return def;
}

export function makeTurret(id: string, rig: string, stats: TurretStats, shot: ShotLook): TurretDef {
  return {
    id,
    rig,
    cost: stats.cost,
    range: stats.range,
    dmg: stats.dmg,
    cooldown: stats.cooldown,
    shot: { rig: shot.rig, arc: shot.arc, spin: shot.spin, speed: stats.shotSpeed },
  };
}
