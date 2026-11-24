import { RIDER, RIDER_STATS, SPECIAL, STATS, twisted, type EraKey, type RoleStats, type Temper, type TurretStats } from './balance.ts';
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
    immune: stats.immune ?? false,
    turretPercent: stats.turretPercent ?? 100,
    drawsFire: stats.drawsFire ?? false,
  };
  if (shot) {
    if (stats.shotSpeed === undefined) throw new Error(`${id}: a shot needs shotSpeed in its role stats`);
    def.shot = { ...shot, speed: stats.shotSpeed };
  }
  return def;
}

/** A rider in the heavy slot: its own numbers, no temperament. See RIDER in defs/balance.ts. */
function makeRider(id: string, rig: string): UnitDef {
  return { ...makeUnit(id, 'heavy', rig, RIDER_STATS), rider: { baseDmg: RIDER.baseDmg } };
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
  /** The heavy slot sells a rider instead, with its own numbers: the fatbike. */
  heavyRides?: boolean;
  /** The fourth unit: the schild in the first two eras, the super unit in the last. */
  shield?: string;
  super?: string;
  /**
   * The drawing of whoever a summoning special calls in. It comes as
   * `<era id>.summoned`: a light unit of the era with the faction's temperament,
   * free, and not for sale.
   */
  summoned?: string;
  turret: string;
  turretShot: Look;
  special: SpecialKind;
}

/** A special without the bookkeeping fields, which makeEra fills in. */
export type SpecialKind = SpecialDef extends infer S ? (S extends unknown ? Omit<S, 'id' | 'cooldown' | 'firstReady'> : never) : never;

/**
 * Builds one era for one faction: the shared numbers for that era with the
 * faction's temperament on them, and this faction's drawings. `prefix` is the
 * short id ('hm', 'ah'), `folder` the art folder.
 */
export function makeEra(prefix: string, folder: string, look: EraLook, temper: Temper = {}): EraDef {
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
  const units = [
    makeUnit(`${id}.light`, 'light', art(look.light), twisted(stats.light, temper.light)),
    makeUnit(`${id}.ranged`, 'ranged', art(look.ranged), twisted(stats.ranged, temper.ranged), withArt(look.rangedShot)),
    look.heavyRides ? makeRider(`${id}.heavy`, art(look.heavy)) : makeUnit(`${id}.heavy`, 'heavy', art(look.heavy), twisted(stats.heavy, temper.heavy)),
  ];
  if (stats.shield) {
    if (!look.shield) throw new Error(`${id}: this era has a schild, so it needs a drawing for one`);
    units.push(makeUnit(`${id}.shield`, 'shield', art(look.shield), twisted(stats.shield, temper.shield)));
  }
  if (stats.super) {
    if (!look.super) throw new Error(`${id}: this era has a super unit, so it needs a drawing for one`);
    units.push(makeUnit(`${id}.super`, 'super', art(look.super), twisted(stats.super, temper.super)));
  }
  const extras: UnitDef[] = [];
  if (look.special.kind === 'summon') {
    if (!look.summoned) throw new Error(`${id}: its special calls units in, so it needs a drawing for them`);
    if (look.special.unit !== `${id}.summoned`) throw new Error(`${id}: the special must call in ${id}.summoned`);
    const light = twisted(stats.light, temper.light);
    extras.push({ ...makeUnit(`${id}.summoned`, 'light', art(look.summoned), { ...light, cost: 0, buildTicks: 0, bounty: 0 }), summoned: true });
  }
  return {
    id,
    key: look.key,
    year: look.year,
    baseRig: art('base'),
    baseHp: stats.baseHp,
    progressNeeded: stats.progressNeeded,
    eraUpCost: stats.eraUpCost,
    units,
    extras,
    turret: makeTurret(`${id}.turret`, art(look.turret), stats.turret, withArt(look.turretShot)),
    special,
  };
}
