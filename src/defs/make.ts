import { RIDER, RIDER_STATS, SCATTER, SPECIAL, STATS, TOSS, twisted, type EraKey, type RoleStats, type Temper, type TurretStats, type Twist } from './balance.ts';
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
  /** What the ranged unit throws. Not needed when it poses the enemy instead. */
  rangedShot?: Look;
  /**
   * The ranged unit throws nothing and poses the enemy instead: Influencer-Ivy.
   * This is the drawing of the mark over a posing unit. See POSE in defs/balance.ts.
   */
  rangedPoses?: string;
  heavy: string;
  /** The heavy slot sells a rider instead, with its own numbers: the fatbike. */
  heavyRides?: boolean;
  /**
   * One aboard the heavy tosses this as well as the heavy's own blows, and the
   * heavy has its own price and speed: the beer bikes. See TOSS in defs/balance.ts.
   */
  heavyTosses?: Look;
  /** The fourth unit: the schild in the first two eras, the super unit in the last. */
  shield?: string;
  /**
   * The schild scatters into a group when it falls, and has its own price and
   * speed: Paraplu-Pam. This is the drawing of one of the group, who comes as
   * `<era id>.scattered`. See SCATTER in defs/balance.ts.
   */
  shieldScatters?: string;
  super?: string;
  /**
   * The drawing of whoever a summoning special calls in. It comes as
   * `<era id>.summoned`: a light unit of the era with the faction's temperament,
   * free, and not for sale.
   */
  summoned?: string;
  /** Numbers of its own for whoever is called in, as shares of the shared light unit's, in place of the temperament. */
  summonedStats?: Twist;
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
  const extras: UnitDef[] = [];
  /** A unit that is not trained: free, not for sale, and nobody is paid for beating it. */
  const extra = (extraId: string, name: string, numbers: RoleStats): UnitDef => ({
    ...makeUnit(extraId, 'light', art(name), { ...numbers, cost: 0, buildTicks: 0, bounty: 0 }),
    summoned: true,
  });

  let ranged: UnitDef;
  if (look.rangedPoses) {
    ranged = { ...makeUnit(`${id}.ranged`, 'ranged', art(look.ranged), twisted(stats.ranged, temper.ranged)), poser: { rig: art(look.rangedPoses) } };
  } else {
    if (!look.rangedShot) throw new Error(`${id}: the ranged unit needs something to throw, or to pose the enemy`);
    ranged = makeUnit(`${id}.ranged`, 'ranged', art(look.ranged), twisted(stats.ranged, temper.ranged), withArt(look.rangedShot));
  }
  let heavy: UnitDef;
  if (look.heavyRides) {
    heavy = makeRider(`${id}.heavy`, art(look.heavy));
  } else if (look.heavyTosses) {
    const own = twisted(stats.heavy, { ...temper.heavy, cost: TOSS.costPercent, speed: TOSS.speedPercent });
    const thrower = twisted(stats.ranged, temper.ranged);
    const toss = {
      dmg: Math.round((thrower.dmg * TOSS.dmgPercent) / 100),
      range: Math.round((thrower.range * TOSS.rangePercent) / 100),
      every: TOSS.every,
      shot: { ...withArt(look.heavyTosses), speed: thrower.shotSpeed! },
    };
    heavy = { ...makeUnit(`${id}.heavy`, 'heavy', art(look.heavy), own), toss };
  } else {
    heavy = makeUnit(`${id}.heavy`, 'heavy', art(look.heavy), twisted(stats.heavy, temper.heavy));
  }
  const units = [makeUnit(`${id}.light`, 'light', art(look.light), twisted(stats.light, temper.light)), ranged, heavy];
  if (stats.shield) {
    if (!look.shield) throw new Error(`${id}: this era has a schild, so it needs a drawing for one`);
    if (look.shieldScatters) {
      const own = twisted(stats.shield, { ...temper.shield, cost: SCATTER.costPercent, speed: SCATTER.speedPercent });
      const group = `${id}.scattered`;
      units.push({ ...makeUnit(`${id}.shield`, 'shield', art(look.shield), own), scatter: { unit: group, count: SCATTER.count } });
      extras.push(extra(group, look.shieldScatters, twisted(stats.light, SCATTER.group)));
    } else {
      units.push(makeUnit(`${id}.shield`, 'shield', art(look.shield), twisted(stats.shield, temper.shield)));
    }
  }
  if (stats.super) {
    if (!look.super) throw new Error(`${id}: this era has a super unit, so it needs a drawing for one`);
    units.push(makeUnit(`${id}.super`, 'super', art(look.super), twisted(stats.super, temper.super)));
  }
  if (look.special.kind === 'summon') {
    if (!look.summoned) throw new Error(`${id}: its special calls units in, so it needs a drawing for them`);
    if (look.special.unit !== `${id}.summoned`) throw new Error(`${id}: the special must call in ${id}.summoned`);
    const light = look.summonedStats ? twisted(stats.light, look.summonedStats) : twisted(stats.light, temper.light);
    extras.push(extra(`${id}.summoned`, look.summoned, light));
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
