import { describe, expect, it } from 'vitest';
import { LANE, POSE, PROGRESS, SCATTER, SPECIAL, STATS, TOSS, UNIT_CAP, px, sec, twisted } from '../src/defs/balance.ts';
import { FACTIONS, eraOf, turretDef, unitDef } from '../src/defs/index.ts';
import type { FactionId } from '../src/defs/types.ts';
import { RIDER_ROW } from '../src/sim/riders.ts';
import type { Rider, Side, SimEvent, SimState, Stamped } from '../src/sim/types.ts';
import { ERA, act, match, place, rich, run } from './helpers.ts';

/**
 * The rules De Toeristen brought in on 24 November 2026 (docs/factions.md,
 * section 5): Influencer-Ivy poses the enemy, Paraplu-Pam scatters into her
 * group, the beer bikes toss beers as well as hit (since later that day; the
 * Zweefbierfiets used to hover out of reach of melee), the cruise ship's day
 * trippers go back on board, and the rent goes up for the locals.
 */

const IVY = 'tr.2025.ranged';
const PAM = 'tr.2025.shield';
const LOST = 'tr.2025.scattered';
const TRIPPER = 'tr.2025.summoned';
const BIERFIETS = 'tr.2025.heavy';
const ZWEEF = 'tr.2050.heavy';
const FATBIKE = 'gs.2025.heavy';
const STUNNED = 1e9;

/** De Toeristen against `foe`, both in `era`. `side` says which seat De Toeristen have. */
function setup(era: number, side: Side = 0, foe: FactionId = 'achterhoek'): SimState {
  const factions: [FactionId, FactionId] = side === 0 ? ['toeristen', foe] : [foe, 'toeristen'];
  const s = match(factions);
  for (const x of [0, 1] as const) {
    s.sides[x].era = era;
    s.sides[x].baseHp = s.sides[x].baseMaxHp = eraOf(factions[x], era).baseHp;
  }
  return s;
}

/** Where a unit of the other side stands when its front is `gap` away from a front at `pos`. */
const facing = (pos: number, gap: number): number => LANE - pos - gap;

/** What unit `id` of `side` took in blows, one entry per blow. */
const blows = (events: readonly SimEvent[], side: Side, id: number): number[] =>
  events.flatMap((e) => (e.t === 'hit' && e.side === side && e.id === id ? [e.amount] : []));

const paid = (events: readonly SimEvent[]): number => events.reduce((sum, e) => sum + (e.t === 'gold' ? e.amount : 0), 0);

function ride(s: SimState, side: Side, pos = 0): Rider {
  const rider: Rider = { id: s.nextId++, def: FATBIKE, row: RIDER_ROW, pos, prevPos: pos, hp: unitDef(FATBIKE).hp, passed: [], arrived: false };
  s.sides[side].riders.push(rider);
  return rider;
}

describe('the temperament: snel en overal', () => {
  it('walks 25% faster, hits 15% softer and costs 10% less in every ordinary role', () => {
    for (const role of ['light', 'ranged', 'heavy', 'shield'] as const) {
      expect(FACTIONS.toeristen.temper[role]).toEqual({ speed: 125, dmg: 85, cost: 90 });
    }
    expect(unitDef('tr.1975.light').speed).toBe(twisted(STATS['1975'].light, { speed: 125 }).speed);
    expect(unitDef('tr.1975.shield').speed).toBeGreaterThan(STATS['1975'].shield!.speed);
  });
});

describe('Influencer-Ivy poses the enemy', () => {
  it('is the ranged unit of 2025: she costs and lasts as one, and throws nothing', () => {
    const ivy = unitDef(IVY);
    const ranged = twisted(STATS['2025'].ranged, FACTIONS.toeristen.temper.ranged);
    expect(ivy).toMatchObject({ role: 'ranged', cost: ranged.cost, hp: ranged.hp, range: ranged.range, speed: ranged.speed });
    expect(ivy.shot).toBeUndefined();
    expect(ivy.poser).toEqual({ rig: 'toeristen/2025/pose_frame' });
  });

  /**
   * An enemy unit of `attacker` strikes a stunned dummy of De Toeristen, with
   * `ivys` Ivys behind it. Returns what each blow on the dummy came to.
   */
  function strikeDummy(attacker: string, gap: number, ivys: number, opts: { stunIvy?: boolean; side?: Side; era?: number } = {}): number[] {
    const side = opts.side ?? 0;
    const foe: Side = side === 0 ? 1 : 0;
    const s = setup(opts.era ?? ERA.y2025, side);
    const dummy = place(s, side, 'tr.2025.heavy', px(500), 1_000_000, 1);
    dummy.stunUntil = STUNNED;
    for (let i = 0; i < ivys; i++) {
      const ivy = place(s, side, IVY, px(440) - px(60) * i, 1_000_000, i === 0 ? 0 : 2);
      if (opts.stunIvy) ivy.stunUntil = STUNNED;
    }
    const enemy = place(s, foe, attacker, facing(px(500), gap), 1_000_000, 1);
    const events = run(s, 90);
    expect(enemy.posing).toBe(ivys > 0 && !opts.stunIvy && !unitDef(attacker).immune);
    return blows(events, side, dummy.id);
  }

  it('an enemy unit in her shot strikes half as hard, and only while it is there', () => {
    const full = unitDef('ah.2025.light').dmg;
    expect(strikeDummy('ah.2025.light', px(10), 0)).toEqual(expect.arrayContaining([full]));
    const posed = strikeDummy('ah.2025.light', px(10), 1);
    expect(posed.length).toBeGreaterThan(1);
    expect(new Set(posed)).toEqual(new Set([Math.floor((full * POSE.dmgPercent) / 100)]));
  });

  it('what an enemy throws while it poses lands half as hard', () => {
    const full = unitDef('ah.2025.ranged').dmg;
    const posed = strikeDummy('ah.2025.ranged', px(150), 1);
    expect(posed.length).toBeGreaterThan(0);
    expect(new Set(posed)).toEqual(new Set([Math.floor((full * POSE.dmgPercent) / 100)]));
  });

  it('two Ivys do not make it a quarter: a unit is in a shot or not', () => {
    const full = unitDef('ah.2025.light').dmg;
    expect(new Set(strikeDummy('ah.2025.light', px(10), 2))).toEqual(new Set([Math.floor((full * POSE.dmgPercent) / 100)]));
  });

  it('a stunned Ivy is not filming', () => {
    const full = unitDef('ah.2025.light').dmg;
    expect(new Set(strikeDummy('ah.2025.light', px(10), 1, { stunIvy: true }))).toEqual(new Set([full]));
  });

  it('a super unit shrugs her off', () => {
    const full = unitDef('ah.2050.super').dmg;
    const hits = strikeDummy('ah.2050.super', px(10), 1, { era: ERA.y2050 });
    expect(hits.length).toBeGreaterThan(0);
    expect(new Set(hits)).toEqual(new Set([full]));
  });

  it('deals no damage at all, to units or to the base', () => {
    const s = setup(ERA.y2025);
    const ivy = place(s, 0, IVY, px(400));
    const target = place(s, 1, 'ah.2025.light', facing(px(400), px(100)));
    target.stunUntil = STUNNED;
    const events = run(s, 120);
    expect(events.some((e) => e.t === 'strike' && e.id === ivy.id && e.filming)).toBe(true);
    expect(target.hp).toBe(unitDef('ah.2025.light').hp);
    expect(s.shots).toEqual([]);

    const t = setup(ERA.y2025);
    place(t, 0, IVY, LANE - px(30));
    run(t, 120);
    expect(t.sides[1].baseHp).toBe(t.sides[1].baseMaxHp);
  });

  it('turrets do not pose: a turret shot at a unit next to her lands in full', () => {
    const s = setup(ERA.y2025);
    s.sides[1].turrets[0] = { def: 'ah.2025.turret', level: 1, cd: 0 };
    const dummy = place(s, 0, 'tr.2025.light', LANE - px(200), 1_000_000, 1);
    dummy.stunUntil = STUNNED;
    place(s, 0, IVY, LANE - px(260), 1_000_000, 0).stunUntil = STUNNED;
    const hits = blows(run(s, 60), 0, dummy.id);
    expect(hits.length).toBeGreaterThan(0);
    expect(new Set(hits)).toEqual(new Set([turretDef('ah.2025.turret').dmg]));
  });

  it('a fatbike gets half the blow back from a posing unit, and none from Ivy herself', () => {
    const s = setup(ERA.y2025, 0, 'gasten');
    const light = place(s, 0, 'tr.2025.light', px(300), 1_000_000, 0);
    place(s, 0, IVY, px(200), 1_000_000, 2);
    // An Ivy on the fatbike's side keeps the light unit posing.
    place(s, 1, IVY, facing(px(300), px(150)), 1_000_000, 1);
    const rider = ride(s, 1);
    const met: SimEvent[] = [];
    for (let i = 0; i < 200 && s.sides[1].riders.length > 0; i++) met.push(...run(s, 1));
    expect(met.filter((e) => e.t === 'rammed').length).toBe(2);
    expect(light.posing).toBe(true);
    expect(unitDef(FATBIKE).hp - rider.hp).toBe(Math.floor((unitDef('tr.2025.light').dmg * POSE.dmgPercent) / 100));
  });

  it('plays out the same with the seats swapped', () => {
    expect(strikeDummy('ah.2025.light', px(10), 1, { side: 1 })).toEqual(strikeDummy('ah.2025.light', px(10), 1, { side: 0 }));
    expect(strikeDummy('ah.2025.ranged', px(150), 1, { side: 1 })).toEqual(strikeDummy('ah.2025.ranged', px(150), 1, { side: 0 }));
  });
});

describe('Paraplu-Pam scatters', () => {
  it('is the schild of 2025, half again as dear, and slower than any other schild and any unit of hers but the giant', () => {
    const pam = unitDef(PAM);
    const schild = STATS['2025'].shield!;
    expect(pam).toMatchObject({ role: 'shield', drawsFire: true, turretPercent: schild.turretPercent });
    expect(pam.cost).toBe(360);
    expect(pam.cost).toBe((schild.cost * SCATTER.costPercent) / 100);
    expect(pam.speed).toBe(Math.round((schild.speed * SCATTER.speedPercent) / 100));
    // MS Kolossaal walks at the super unit's shared speed, which nobody may twist: a hair slower still.
    for (const era of FACTIONS.toeristen.eras) for (const u of era.units) if (u.id !== PAM && u.role !== 'super') expect(u.speed, u.id).toBeGreaterThan(pam.speed);
    for (const faction of Object.values(FACTIONS)) {
      for (const era of faction.eras) for (const u of era.units) if (u.role === 'shield' && u.id !== PAM) expect(u.speed, u.id).toBeGreaterThan(pam.speed);
    }
    expect(pam.scatter).toEqual({ unit: LOST, count: SCATTER.count });
  });

  it('her group is weak, free and pays no bounty', () => {
    const lost = unitDef(LOST);
    const light = STATS['2025'].light;
    expect(lost).toMatchObject({ role: 'light', summoned: true, cost: 0, bounty: 0 });
    expect(lost.hp).toBe(Math.round((light.hp * SCATTER.group.hp) / 100));
    expect(lost.dmg).toBe(Math.round((light.dmg * SCATTER.group.dmg) / 100));
    expect(lost.speed).toBe(light.speed);
    expect(eraOf('toeristen', ERA.y2025).units.map((u) => u.id)).not.toContain(LOST);
  });

  /** Pam with one hit point left in front of an enemy light unit, until she falls. */
  function fall(side: Side, extra = 0): { s: SimState; events: SimEvent[]; pamId: number } {
    const foe: Side = side === 0 ? 1 : 0;
    const s = setup(ERA.y2025, side);
    for (let i = 0; i < extra; i++) place(s, side, 'tr.2025.light', px(100) + px(70) * Math.floor(i / 3), 1_000_000, i % 3).stunUntil = STUNNED;
    const pam = place(s, side, PAM, px(500), 1, 1);
    place(s, foe, 'ah.2025.light', facing(px(500), px(10)), 1_000_000, 1).stunUntil = 0;
    const events = run(s, 40);
    return { s, events, pamId: pam.id };
  }

  it('when she falls, her group of four comes onto the lane where she stood, for her side', () => {
    const { s, events, pamId } = fall(0);
    expect(events.some((e) => e.t === 'defeat' && e.id === pamId)).toBe(true);
    const scattered = events.find((e): e is Extract<SimEvent, { t: 'scattered' }> => e.t === 'scattered');
    expect(scattered).toMatchObject({ side: 0, pos: px(500) });
    expect(scattered!.ids).toHaveLength(SCATTER.count);
    const group = s.sides[0].units.filter((u) => u.def === LOST);
    expect(group.length).toBeGreaterThan(0);
    for (const u of group) expect(u.pos).toBeLessThanOrEqual(px(500) + unitDef(LOST).speed * 40);
    expect(s.sides[1].units.some((u) => u.def === LOST)).toBe(false);
  });

  it('they come whatever the unit cap', () => {
    const { s, events } = fall(0, UNIT_CAP - 1);
    const scattered = events.find((e): e is Extract<SimEvent, { t: 'scattered' }> => e.t === 'scattered')!;
    expect(scattered.ids).toHaveLength(SCATTER.count);
    expect(s.sides[0].units.length).toBeGreaterThan(UNIT_CAP - 1);
  });

  it('a lost tourist that is beaten pays nobody anything', () => {
    const s = setup(ERA.y2025);
    place(s, 0, LOST, px(500), 1);
    place(s, 1, 'ah.2025.heavy', facing(px(500), px(10)), 1_000_000);
    const events = run(s, 60);
    expect(events.some((e) => e.t === 'defeat' && e.def === LOST)).toBe(true);
    expect(paid(events)).toBe(0);
  });

  it('a fatbike that crashes into her scatters the group as well', () => {
    const s = setup(ERA.y2025, 0, 'gasten');
    const pam = place(s, 0, PAM, px(600));
    ride(s, 1);
    const events: SimEvent[] = [];
    for (let i = 0; i < 200 && s.sides[1].riders.length > 0; i++) events.push(...run(s, 1));
    events.push(...run(s, 2));
    expect(events.some((e) => e.t === 'crashed' && e.foe === pam.id)).toBe(true);
    expect(events.some((e) => e.t === 'scattered' && e.side === 0 && e.ids.length === SCATTER.count)).toBe(true);
  });

  it('if De Zuidas bought her, the group follows the umbrella to De Zuidas', () => {
    const s = setup(ERA.y2025, 0, 'zuidas');
    rich(s, 1);
    const pam = place(s, 0, PAM, px(500));
    act(s, 1, { t: 'special' });
    expect(s.sides[1].units.find((u) => u.id === pam.id)?.turncoat).toBe(true);
    const bought = s.sides[1].units.find((u) => u.id === pam.id)!;
    bought.hp = 1;
    place(s, 0, 'tr.2025.light', facing(bought.pos, px(10)));
    const events = run(s, 40);
    expect(events.some((e) => e.t === 'scattered' && e.side === 1)).toBe(true);
    const group = s.sides[1].units.filter((u) => u.def === LOST);
    expect(group.length).toBeGreaterThan(0);
    for (const u of group) expect(u.turncoat).toBe(true);
  });

  it('plays out the same with the seats swapped', () => {
    const shape = (side: Side) => {
      const { s } = fall(side, 4);
      return s.sides[side].units.map((u) => [u.def, u.row, u.pos, u.hp, u.act]);
    };
    expect(shape(1)).toEqual(shape(0));
  });
});

describe('the beer bikes toss beers', () => {
  const BIKES = [
    { id: BIERFIETS, era: ERA.y2025, key: '2025' },
    { id: ZWEEF, era: ERA.y2050, key: '2050' },
  ] as const;

  it('are heavies of their era, a third dearer and much faster than one, and one aboard throws as their ranged unit does', () => {
    for (const { id, key } of BIKES) {
      const bike = unitDef(id);
      const heavy = STATS[key].heavy;
      const ranged = twisted(STATS[key].ranged, FACTIONS.toeristen.temper.ranged);
      const own = twisted(heavy, { ...FACTIONS.toeristen.temper.heavy, cost: TOSS.costPercent, speed: TOSS.speedPercent });
      expect(bike, id).toMatchObject({ role: 'heavy', cleave: true, hp: heavy.hp, range: heavy.range, cost: own.cost, speed: own.speed });
      expect(bike.dmg, `${id} hits with the temperament`).toBe(twisted(heavy, FACTIONS.toeristen.temper.heavy).dmg);
      expect(bike.cost, `${id} costs more than a heavy`).toBeGreaterThan(heavy.cost);
      expect(bike.speed, `${id} is faster than the temperament makes a heavy`).toBeGreaterThan(twisted(heavy, FACTIONS.toeristen.temper.heavy).speed);
      expect(bike.toss, id).toMatchObject({
        dmg: Math.round((ranged.dmg * TOSS.dmgPercent) / 100),
        range: Math.round((ranged.range * TOSS.rangePercent) / 100),
        every: TOSS.every,
      });
      expect(bike.toss!.shot.speed, id).toBe(ranged.shotSpeed);
      expect(bike.shot, `${id} hits as a heavy; the throw comes on top`).toBeUndefined();
    }
    // Nobody else has anyone aboard who throws.
    const others = Object.values(FACTIONS).flatMap((f) => f.eras.flatMap((e) => e.units)).filter((u) => u.toss);
    expect(others.map((u) => u.id).sort()).toEqual([BIERFIETS, ZWEEF].sort());
  });

  /** A beer bike of De Toeristen on `side` with a stunned enemy dummy `gap` in front of it. */
  function facingDummy(bike: string, era: number, gap: number, side: Side = 0) {
    const foe: Side = side === 0 ? 1 : 0;
    const s = setup(era, side);
    const me = place(s, side, bike, px(400), 1_000_000);
    const dummy = place(s, foe, era === ERA.y2025 ? 'ah.2025.light' : 'ah.2050.light', facing(px(400), gap), 1_000_000);
    dummy.stunUntil = STUNNED;
    return { s, me, dummy, side, foe };
  }

  it('tosses on its own beat while it is still rolling up', () => {
    for (const { id, era } of BIKES) {
      const toss = unitDef(id).toss!;
      const { s, me, dummy, foe } = facingDummy(id, era, toss.range - px(20));
      const events: SimEvent[] = [];
      // Long enough for a few throws, short enough that it has not rolled into melee reach yet.
      for (let i = 0; i < toss.every * 2 + 20 && me.act === 'walk'; i++) events.push(...run(s, 1));
      expect(events.filter((e) => e.t === 'toss' && e.id === me.id).length, id).toBeGreaterThan(0);
      const took = blows(events, foe, dummy.id);
      expect(took.length, id).toBeGreaterThan(0);
      expect(new Set(took), `${id}: every blow so far is a beer`).toEqual(new Set([toss.dmg]));
    }
  });

  it('keeps tossing while it fights, on top of its own blows, and enemy blows reach it', () => {
    for (const { id, era } of BIKES) {
      const def = unitDef(id);
      const { s, me, dummy, side, foe } = facingDummy(id, era, px(10));
      dummy.stunUntil = 0;
      const events = run(s, def.toss!.every * 4);
      const took = blows(events, foe, dummy.id);
      expect(took.filter((n) => n === def.dmg).length, `${id} hits`).toBeGreaterThan(0);
      expect(took.filter((n) => n === def.toss!.dmg).length, `${id} throws`).toBe(4);
      expect(blows(events, side, me.id).length, `${id} is hit back`).toBeGreaterThan(0);
    }
  });

  it('throws nothing when nobody is within throwing range, or while it is stunned', () => {
    const toss = unitDef(BIERFIETS).toss!;
    const far = facingDummy(BIERFIETS, ERA.y2025, toss.range + px(200));
    far.me.stunUntil = STUNNED; // it would roll into range otherwise
    expect(run(far.s, toss.every * 3).some((e) => e.t === 'toss')).toBe(false);

    const near = facingDummy(BIERFIETS, ERA.y2025, px(10));
    near.me.stunUntil = STUNNED;
    expect(run(near.s, toss.every * 3).some((e) => e.t === 'toss')).toBe(false);
  });

  it('a fatbike runs into it like into any unit', () => {
    const s = setup(ERA.y2050, 0, 'gasten');
    const zweef = place(s, 0, ZWEEF, px(500));
    zweef.stunUntil = STUNNED;
    ride(s, 1);
    const events: SimEvent[] = [];
    for (let i = 0; i < 200 && s.sides[1].riders.length > 0; i++) events.push(...run(s, 1));
    expect(events.some((e) => (e.t === 'rammed' || e.t === 'crashed') && e.foe === zweef.id)).toBe(true);
  });

  it('plays out the same with the seats swapped', () => {
    const shape = (side: Side) => {
      const { s, foe } = facingDummy(ZWEEF, ERA.y2050, px(10), side);
      const events = run(s, 200);
      return {
        tosses: events.filter((e) => e.t === 'toss').length,
        units: [...s.sides[side].units, ...s.sides[foe].units].map((u) => [u.def, u.pos, u.hp, u.act]),
      };
    };
    expect(shape(1)).toEqual(shape(0));
  });
});

describe('Cruiseschip legt aan', () => {
  it('calls in eight fast, weak day trippers for twenty seconds', () => {
    const special = eraOf('toeristen', ERA.y2025).special;
    expect(special).toMatchObject({ kind: 'summon', unit: TRIPPER, count: 8, ticks: SPECIAL.cruiseschip.ticks });
    const tripper = unitDef(TRIPPER);
    const light = STATS['2025'].light;
    expect(tripper).toMatchObject({ role: 'light', summoned: true, cost: 0, bounty: 0 });
    expect(tripper.hp).toBe(Math.round(light.hp / 2));
    expect(tripper.dmg).toBe(Math.round(light.dmg / 2));
    expect(tripper.speed).toBe(Math.round((light.speed * SPECIAL.cruiseschip.speed) / 100));
  });

  const trippers = (s: SimState, side: Side) => s.sides[side].units.filter((u) => u.def === TRIPPER);

  it('they all come out, whatever the unit cap, and all go back on board when the horn sounds', () => {
    const s = setup(ERA.y2025);
    rich(s, 0);
    for (let i = 0; i < UNIT_CAP; i++) place(s, 0, 'tr.2025.light', px(500) + px(60) * i, 1_000_000, i % 3).stunUntil = STUNNED;
    const start = s.tick;
    const first = act(s, 0, { t: 'special' });
    expect(first).toContainEqual({ t: 'summoned', side: 0, count: 8, ticks: SPECIAL.cruiseschip.ticks });
    run(s, 90);
    expect(trippers(s, 0)).toHaveLength(8);
    const out = trippers(s, 0).map((u) => u.id);
    const gold = [s.sides[0].gold, s.sides[1].gold];
    const progress = [s.sides[0].progress, s.sides[1].progress];
    const events = run(s, start + SPECIAL.cruiseschip.ticks - s.tick + 1);
    expect(trippers(s, 0)).toEqual([]);
    const horn = events.filter((e): e is Extract<SimEvent, { t: 'recalled' }> => e.t === 'recalled');
    expect(horn).toHaveLength(1);
    expect(horn[0]!.ids.sort()).toEqual(out.sort());
    // Leaving pays nobody: both purses and both bars moved by the same amount, time alone.
    expect(s.sides[0].gold - gold[0]!).toBe(s.sides[1].gold - gold[1]!);
    expect(s.sides[0].progress - progress[0]!).toBe(s.sides[1].progress - progress[1]!);
    expect(PROGRESS.killPercent).toBeGreaterThan(0);
  });

  it('whoever has not come out of the gate by then stays on board', () => {
    const s = setup(ERA.y2025);
    rich(s, 0);
    // Every row is blocked at the gate, so nobody can come out.
    for (let row = 0; row < 3; row++) place(s, 0, 'tr.2025.light', px(10), 1_000_000, row).stunUntil = STUNNED;
    act(s, 0, { t: 'special' });
    expect(s.sides[0].arrivals).toHaveLength(8);
    run(s, SPECIAL.cruiseschip.ticks);
    expect(s.sides[0].arrivals).toEqual([]);
    expect(trippers(s, 0)).toEqual([]);
  });

  it('plays out the same with the seats swapped', () => {
    const outcome = (side: Side) => {
      const foe: Side = side === 0 ? 1 : 0;
      const s = setup(ERA.y2025, side);
      rich(s, side);
      place(s, foe, 'ah.2025.light', px(500), undefined, 0);
      place(s, foe, 'ah.2025.heavy', px(450), undefined, 1);
      act(s, side, { t: 'special' });
      const events = run(s, SPECIAL.cruiseschip.ticks + 10);
      return {
        mine: s.sides[side].units.map((u) => [u.def, u.row, u.pos, u.hp]),
        theirs: s.sides[foe].units.map((u) => [u.def, u.row, u.pos, u.hp]),
        horn: events.filter((e) => e.t === 'recalled').length,
      };
    };
    expect(outcome(1)).toEqual(outcome(0));
  });
});

describe('Huurverhoging voor de locals', () => {
  const TICKS = SPECIAL.huurverhoging.ticks;

  it('is De Toeristen’s special of 2050: twenty seconds of double prices', () => {
    expect(TICKS).toBe(sec(20));
    expect(eraOf('toeristen', ERA.y2050).special).toMatchObject({ kind: 'hike', ticks: TICKS, pricePercent: 200 });
  });

  /** De Toeristen in 2050 press it; the enemy is in `foeEra` with money and the vooruitgang to modernize. */
  function hiked(side: Side = 0, foeEra: number = ERA.y2025): SimState {
    const foe: Side = side === 0 ? 1 : 0;
    const s = setup(ERA.y2050, side);
    s.sides[foe].era = foeEra;
    rich(s, side);
    s.sides[foe].gold = 100_000;
    s.sides[foe].progress = 100_000;
    act(s, side, { t: 'special' });
    return s;
  }

  it('from the next tick, everything the enemy buys costs double: units, turrets, subsidie and modernizing', () => {
    const s = hiked();
    const era = eraOf('achterhoek', ERA.y2025);
    const spend = (cmd: Parameters<typeof act>[2]): number => {
      const before = s.sides[1].gold;
      act(s, 1, cmd);
      return before - s.sides[1].gold;
    };
    expect(spend({ t: 'buy', slot: 0 })).toBe(era.units[0]!.cost * 2);
    expect(spend({ t: 'turret' })).toBe(era.turret.cost * 2);
    expect(spend({ t: 'subsidy' })).toBe(120 * 2);
    expect(spend({ t: 'eraUp' })).toBe(era.eraUpCost! * 2);
  });

  it('their own prices stay as they are, and so does whatever is already in their queue', () => {
    const s = setup(ERA.y2050);
    rich(s, 0);
    s.sides[1].gold = 100_000;
    act(s, 1, { t: 'buy', slot: 2 });
    const queued = s.sides[1].queue.map((q) => ({ ...q }));
    act(s, 0, { t: 'special' });
    const before = s.sides[0].gold;
    act(s, 0, { t: 'buy', slot: 0 });
    expect(before - s.sides[0].gold).toBe(unitDef('tr.2050.light').cost);
    expect(s.sides[1].queue.map((q) => q.def)).toEqual(queued.map((q) => q.def));
  });

  it('is over after twenty seconds', () => {
    const s = hiked();
    run(s, TICKS);
    const before = s.sides[1].gold;
    act(s, 1, { t: 'buy', slot: 0 });
    expect(before - s.sides[1].gold).toBe(eraOf('achterhoek', ERA.y2025).units[0]!.cost);
  });

  it('what the enemy buys on the very tick it is pressed costs the old price, whichever seat presses', () => {
    for (const side of [0, 1] as const) {
      const foe: Side = side === 0 ? 1 : 0;
      const s = setup(ERA.y2050, side);
      rich(s, side);
      s.sides[foe].gold = 100_000;
      const cmds: Stamped[] = [
        { tick: s.tick, side, cmd: { t: 'special' } },
        { tick: s.tick, side: foe, cmd: { t: 'buy', slot: 0 } },
      ];
      run(s, 1, cmds);
      expect(100_000 - s.sides[foe].gold, `seat ${side}`).toBe(unitDef('ah.2050.light').cost);
    }
  });

  it('two sides that do it to each other both pay double', () => {
    const s = match(['toeristen', 'toeristen']);
    for (const side of [0, 1] as const) {
      s.sides[side].era = ERA.y2050;
      rich(s, side);
    }
    run(s, 1, [
      { tick: s.tick, side: 0, cmd: { t: 'special' } },
      { tick: s.tick, side: 1, cmd: { t: 'special' } },
    ]);
    for (const side of [0, 1] as const) {
      const before = s.sides[side].gold;
      act(s, side, { t: 'buy', slot: 0 });
      expect(before - s.sides[side].gold).toBe(unitDef('tr.2050.light').cost * 2);
    }
  });

  it('is not aimed at units, so a super unit has nothing to shrug off', () => {
    const s = setup(ERA.y2050);
    rich(s, 0);
    place(s, 1, 'ah.2050.super', px(400));
    const events = act(s, 0, { t: 'special' });
    expect(events.some((e) => e.t === 'shrugged')).toBe(false);
    expect(events).toContainEqual({ t: 'hiked', side: 1, ticks: TICKS, percent: 200 });
  });
});

describe('De Dia-avond', () => {
  it('is a stun with the numbers of the Wegblokkade', () => {
    const dia = eraOf('toeristen', ERA.y1975).special;
    const blokkade = eraOf('havermelk', ERA.y2025).special;
    if (dia.kind !== 'stun' || blokkade.kind !== 'stun') throw new Error('both should be stuns');
    expect(dia.ticks).toBe(blokkade.ticks);
  });
});
