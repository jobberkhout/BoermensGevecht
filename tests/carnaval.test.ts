import { describe, expect, it } from 'vitest';
import { DRUM, KEYS, LANE, PARTY, PEEL, SPECIAL, TURRET, px } from '../src/defs/balance.ts';
import { eraOf, turretDef, unitDef } from '../src/defs/index.ts';
import type { FactionId } from '../src/defs/types.ts';
import { turretRange } from '../src/sim/turrets.ts';
import type { Side, SimEvent, SimState, Unit } from '../src/sim/types.ts';
import { act, match, place, rich, run } from './helpers.ts';

/**
 * Carnaval's rules (sim/carnaval.ts): the three specials of kinds nobody else
 * has (De Polonaise, Elf Kanonschoten, De Kater), and the units that do
 * something of their own (De Grote Trom, Het Bananenpak, De Zuipwagen, De
 * Reuzenprins and the key of the city).
 */

const HOSSER = 'cv.1975.light';
const TROM = 'cv.1975.shield';
const BANAAN = 'cv.2025.light';
const ZUIPWAGEN = 'cv.2025.heavy';
const PRINS = 'cv.2050.super';
const SPECIAL_CMD = { t: 'special' } as const;

/** `a` on the left and `b` on the right, both in `era`. */
function setup(a: FactionId, b: FactionId, era = 0): SimState {
  const s = match([a, b]);
  for (const x of [0, 1] as const) {
    s.sides[x].era = era;
    s.sides[x].baseHp = s.sides[x].baseMaxHp = eraOf(s.sides[x].faction, era).baseHp;
  }
  return s;
}

/** Where a unit of the other side stands when its front is `gap` away from a front at `pos`. */
const facing = (pos: number, gap: number): number => LANE - pos - gap;

const damageTo = (events: readonly SimEvent[], side: Side, id: number): number =>
  events.reduce((sum, e) => sum + ((e.t === 'hit' || e.t === 'glance') && e.side === side && e.id === id ? e.amount : 0), 0);

/** Carnaval on `side`, the Achterhoek on the other. */
function carnavalOn(side: Side, era = 0): SimState {
  return setup(side === 0 ? 'carnaval' : 'achterhoek', side === 0 ? 'achterhoek' : 'carnaval', era);
}

describe('De Polonaise', () => {
  for (const side of [0, 1] as const) {
    it(`pulls every enemy unit it passes into the line, and they dance home without fighting (seat ${side})`, () => {
      const foe = side === 0 ? 1 : 0;
      const s = carnavalOn(side);
      rich(s, side);
      // Nobody of Carnaval's own is on the lane, so any harm would be the line's.
      const them = [place(s, foe, 'ah.1975.light', px(300)), place(s, foe, 'ah.1975.heavy', px(500), undefined, 0)];
      const all = act(s, side, SPECIAL_CMD);
      expect(s.waves).toHaveLength(1);
      // Where each stood when the line reached it.
      const joined = new Map<number, number>();
      for (let i = 0; i < 90; i++) {
        for (const e of run(s, 1)) {
          all.push(e);
          if (e.t === 'conga') joined.set(e.id, them.find((u) => u.id === e.id)!.pos);
        }
      }
      // Everyone it passed joined in, nobody was hurt by the line, and they went back towards their own gate.
      for (const u of them) {
        expect(joined.has(u.id), u.def).toBe(true);
        expect(damageTo(all, foe, u.id), u.def).toBe(0);
        expect(u.pos, u.def).toBeLessThan(joined.get(u.id)!);
      }
      const dancer = them[1]!;
      expect(dancer.congaUntil! - s.tick).toBeLessThanOrEqual(SPECIAL.polonaise.ticks);
    });
  }

  it('does no damage, and a dancer does not strike', () => {
    const s = carnavalOn(0);
    rich(s, 0);
    const u = place(s, 1, 'ah.1975.light', px(200));
    const events = [...act(s, 0, SPECIAL_CMD), ...run(s, 100)];
    expect(u.congaUntil).toBeGreaterThan(s.tick);
    expect(damageTo(events, 1, u.id)).toBe(0);
    expect(events.some((e) => e.t === 'strike' && e.side === 1 && e.id === u.id)).toBe(false);
    expect(u.act).toBe('idle');
  });

  it('lets a super unit be, which says so', () => {
    const s = carnavalOn(0, 2);
    s.sides[0].era = 0;
    rich(s, 0);
    const giant = place(s, 1, 'ah.2050.super', px(300));
    const events = [...act(s, 0, SPECIAL_CMD), ...run(s, 120)];
    expect(events.some((e) => e.t === 'shrugged' && e.ids.includes(giant.id))).toBe(true);
    expect(giant.congaUntil ?? 0).toBe(0);
  });

  it('never moves a dancer past its own gate or through one of its own', () => {
    const s = carnavalOn(0);
    rich(s, 0);
    const back = place(s, 1, 'ah.1975.light', px(20));
    back.act = 'idle';
    const front = place(s, 1, 'ah.1975.light', px(100));
    act(s, 0, SPECIAL_CMD);
    run(s, 100);
    expect(back.pos).toBeGreaterThanOrEqual(0);
    expect(front.pos - unitDef(front.def).len).toBeGreaterThanOrEqual(back.pos);
  });
});

describe('Elf Kanonschoten', () => {
  it('puts confetti in the faces of the enemy on the lane: what they throw misses, and later hits again', () => {
    const s = carnavalOn(0, 1);
    rich(s, 0);
    // A target that stands still and does nothing, so the thrower stays where it is.
    const target = place(s, 0, 'cv.2025.heavy', px(300));
    target.act = 'idle';
    target.partyAt = 1e9;
    target.stunUntil = 1e9;
    const thrower = place(s, 1, 'ah.2025.ranged', facing(px(300), px(150)));
    thrower.act = 'idle';
    const events = act(s, 0, SPECIAL_CMD);
    expect(events.find((e) => e.t === 'blinded')).toMatchObject({ side: 1, ids: [thrower.id], ticks: SPECIAL.kanonschoten.ticks });
    const during = run(s, SPECIAL.kanonschoten.ticks - 2);
    expect(during.some((e) => e.t === 'strike' && e.id === thrower.id)).toBe(true);
    expect(damageTo(during, 0, target.id)).toBe(0);
    const after = run(s, 120);
    expect(damageTo(after, 0, target.id)).toBeGreaterThan(0);
  });

  it('misses melee nothing: blows up close still land', () => {
    const s = carnavalOn(0, 1);
    rich(s, 0);
    const target = place(s, 0, 'cv.2025.shield', px(300));
    target.act = 'idle';
    const brawler = place(s, 1, 'ah.2025.light', facing(px(300), px(10)));
    act(s, 0, SPECIAL_CMD);
    expect(brawler.blindUntil).toBeGreaterThan(s.tick);
    expect(damageTo(run(s, 60), 0, target.id)).toBeGreaterThan(0);
  });
});

describe('De Kater', () => {
  it('makes the enemy crawl, and they can still fight', () => {
    const s = carnavalOn(0, 2);
    rich(s, 0);
    const walker = place(s, 1, 'ah.2050.light', px(100), undefined, 0);
    const fighter = place(s, 1, 'ah.2050.light', px(700));
    const mine = place(s, 0, 'cv.2050.heavy', facing(px(700), px(10)));
    mine.act = 'idle';
    const events = act(s, 0, SPECIAL_CMD);
    expect(events.find((e) => e.t === 'slowed')).toMatchObject({ side: 1, ticks: SPECIAL.kater.ticks });
    const at = walker.pos;
    const later = run(s, 30);
    const crawled = walker.pos - at;
    const normal = unitDef(walker.def).speed * 30;
    expect(crawled).toBeGreaterThan(0);
    expect(crawled).toBeLessThanOrEqual(Math.ceil((normal * SPECIAL.kater.speedPercent) / 100) + 1);
    expect(damageTo(later, 0, mine.id)).toBeGreaterThan(0);
    expect(fighter.slowUntil).toBeGreaterThan(s.tick);
  });
});

describe('De Grote Trom', () => {
  it('booms with every turret shot off its drum, and the band around it marches faster', () => {
    const s = carnavalOn(0);
    rich(s, 1);
    act(s, 1, { t: 'turret' });
    const range = turretRange(turretDef(s.sides[1].turrets[0]!.def), 1);
    const drum = place(s, 0, TROM, LANE - range + px(20));
    drum.act = 'idle';
    const friend = place(s, 0, HOSSER, drum.pos - px(100), undefined, 0);
    friend.act = 'idle';
    const events = run(s, 60);
    const boom = events.find((e) => e.t === 'boomed');
    expect(boom).toMatchObject({ side: 0, id: drum.id });
    expect(boom && boom.t === 'boomed' ? boom.ids : []).toContain(friend.id);
    expect(friend.beatUntil! - s.tick).toBeLessThanOrEqual(DRUM.ticks);
  });

  it('marching to the beat is faster', () => {
    const s = carnavalOn(0);
    const plain = place(s, 0, HOSSER, px(100), undefined, 0);
    const beat = place(s, 0, HOSSER, px(100), undefined, 2);
    beat.beatUntil = 1e9;
    beat.beatPercent = DRUM.speedPercent;
    run(s, 1);
    expect(plain.pos - px(100)).toBe(unitDef(HOSSER).speed);
    expect(beat.pos - px(100)).toBe(Math.floor((unitDef(HOSSER).speed * DRUM.speedPercent) / 100));
  });
});

describe('Het Bananenpak', () => {
  for (const side of [0, 1] as const) {
    it(`leaves its peel when beaten, and the first enemy to walk over it slips (seat ${side})`, () => {
      const foe = side === 0 ? 1 : 0;
      const s = carnavalOn(side, 1);
      const banana = place(s, side, BANAAN, px(500), 1);
      banana.act = 'idle';
      const walker = place(s, foe, 'ah.2025.light', facing(px(500), px(10)));
      const events = run(s, 20);
      const peeled = events.find((e) => e.t === 'peeled');
      expect(peeled).toMatchObject({ side, id: banana.id });
      // Walking on, the enemy comes to the peel and goes down.
      const later = run(s, 60);
      const slip = later.find((e) => e.t === 'slipped');
      expect(slip).toMatchObject({ side: foe, id: walker.id, ticks: PEEL.dazeTicks });
      expect(s.sides[side].peels).toHaveLength(0);
    });
  }

  it('a peel lies in its own row, and goes when nobody steps on it', () => {
    const s = carnavalOn(0, 1);
    const banana = place(s, 0, BANAAN, px(500), 1, 0);
    banana.act = 'idle';
    place(s, 1, 'ah.2025.heavy', facing(px(500), px(10)), undefined, 0).act = 'idle';
    run(s, 40);
    expect(s.sides[0].peels).toHaveLength(1);
    expect(s.sides[0].peels[0]!.row).toBe(0);
    // Someone in another row walks past it without slipping.
    const passer = place(s, 1, 'ah.2025.light', facing(px(600), 0), undefined, 2);
    const events = run(s, 60);
    expect(events.some((e) => e.t === 'slipped' && e.id === passer.id)).toBe(false);
    run(s, PEEL.ticks);
    expect(s.sides[0].peels).toHaveLength(0);
  });

  it('a super unit steps right over it', () => {
    const s = carnavalOn(0, 1);
    s.sides[1].era = 2;
    s.sides[0].peels.push({ id: 999, pos: px(600), row: 1, until: 1e9, rig: '', dazeTicks: PEEL.dazeTicks });
    const giant = place(s, 1, 'ah.2050.super', facing(px(600), px(20)));
    const events = run(s, 60);
    expect(events.some((e) => e.t === 'slipped' && e.id === giant.id)).toBe(false);
    expect(s.sides[0].peels).toHaveLength(1);
  });
});

describe('De Zuipwagen', () => {
  it('drops the beat every so often, and whoever stands in reach stops to party', () => {
    const s = carnavalOn(0, 1);
    const wagen = place(s, 0, ZUIPWAGEN, px(400));
    // Tough enough to still be there when the beat drops again.
    const near = place(s, 1, 'ah.2025.light', facing(px(400), px(20)), 1e6);
    const far = place(s, 1, 'ah.2025.ranged', facing(px(400), PARTY.reach + px(80)), undefined, 0);
    far.act = 'idle';
    const events = run(s, 2);
    expect(events.find((e) => e.t === 'dropped')).toMatchObject({ side: 0, id: wagen.id });
    expect(events.find((e) => e.t === 'partied')).toMatchObject({ side: 1, ids: [near.id], ticks: PARTY.ticks });
    expect(near.stunUntil).toBeGreaterThan(s.tick);
    expect(far.stunUntil).toBe(0);
    // Not again until its time comes round.
    const next = run(s, PARTY.every - 4);
    expect(next.some((e) => e.t === 'dropped')).toBe(false);
    expect(run(s, 6).some((e) => e.t === 'dropped')).toBe(true);
  });

  it('a super unit keeps its head', () => {
    const s = carnavalOn(0, 1);
    s.sides[1].era = 2;
    place(s, 0, ZUIPWAGEN, px(400));
    const giant = place(s, 1, 'ah.2050.super', facing(px(400), px(20)));
    const events = run(s, 3);
    expect(events.some((e) => e.t === 'dropped')).toBe(false);
    expect(giant.stunUntil).toBe(0);
  });
});

describe('De Reuzenprins and the key of the city', () => {
  /** Carnaval on `side` in 2050 with its prince on the lane, and two enemy turrets of 2050, the first fully upgraded. */
  function stage(side: Side): { s: SimState; prins: Unit; foe: Side } {
    const foe = side === 0 ? 1 : 0;
    const s = carnavalOn(side, 2);
    rich(s, foe);
    // Build, build, then upgrade the lower one each time: three, then two stars.
    for (let i = 0; i < 2 + TURRET.maxLevel; i++) act(s, foe, { t: 'turret' });
    expect(s.sides[foe].turrets.map((t) => t?.level)).toEqual([3, 2]);
    const prins = place(s, side, PRINS, px(200));
    prins.act = 'idle';
    return { s, prins, foe };
  }

  it('takes turrets their full damage, unlike other super units', () => {
    expect(unitDef(PRINS).turretPercent).toBe(KEYS.turretPercent);
    expect(unitDef(PRINS).turretPercent).toBe(100);
    expect(unitDef('ah.2050.super').turretPercent).toBeLessThan(100);
    expect(unitDef(PRINS)).toMatchObject({ immune: true, drawsFire: true });
  });

  for (const side of [0, 1] as const) {
    it(`takes over the most upgraded enemy turret that reaches him, which then fires at its own side (seat ${side})`, () => {
      const { s, prins, foe } = stage(side);
      const reach = turretRange(turretDef(s.sides[foe].turrets[0]!.def), 3);
      prins.pos = LANE - reach + px(10);
      prins.prevPos = prins.pos;
      const victim = place(s, foe, 'ah.2050.light', px(60));
      victim.act = 'idle';
      const events = run(s, 3);
      expect(events.find((e) => e.t === 'keyed')).toMatchObject({ side, id: prins.id, slot: 0, ticks: KEYS.ticks });
      expect(s.sides[foe].turrets[0]!.heldBy).toBe(prins.id);
      const gold = s.sides[side].gold;
      const later = run(s, 300);
      expect(damageTo(later, foe, victim.id)).toBeGreaterThan(0);
      // Whoever its own turret beats pays Carnaval the bounty.
      if (!s.sides[foe].units.includes(victim)) expect(s.sides[side].gold).toBeGreaterThan(gold);
    });
  }

  it('gives the key back when the time is up, and takes one again after a rest', () => {
    const { s, prins, foe } = stage(0);
    prins.pos = LANE - px(500);
    prins.prevPos = prins.pos;
    prins.hp = 1e9;
    const events = run(s, KEYS.ticks + 5);
    expect(events.filter((e) => e.t === 'keyed')).toHaveLength(1);
    expect(events.some((e) => e.t === 'unkeyed' && e.side === foe)).toBe(true);
    expect(s.sides[foe].turrets.every((t) => t!.heldBy === undefined)).toBe(true);
    const again = run(s, KEYS.rest + 5);
    expect(again.filter((e) => e.t === 'keyed')).toHaveLength(1);
  });

  it('gives the key back when he is beaten', () => {
    const { s, prins, foe } = stage(0);
    prins.pos = LANE - px(500);
    prins.prevPos = prins.pos;
    run(s, 3);
    expect(s.sides[foe].turrets.some((t) => t!.heldBy === prins.id)).toBe(true);
    prins.hp = 0;
    const events = run(s, 2);
    expect(events.some((e) => e.t === 'unkeyed')).toBe(true);
    expect(s.sides[foe].turrets.every((t) => t!.heldBy === undefined)).toBe(true);
  });

  it('a held turret does not fire at Carnaval', () => {
    const { s, prins, foe } = stage(0);
    prins.pos = LANE - px(500);
    prins.prevPos = prins.pos;
    prins.hp = 1e9;
    run(s, 3);
    const held = s.sides[foe].turrets.findIndex((t) => t!.heldBy === prins.id);
    const events = run(s, 200);
    // The one it holds fires only at its own side, which has nobody on the lane: it stays quiet.
    expect(events.some((e) => e.t === 'turretFire' && e.side === foe && e.slot === held)).toBe(false);
    expect(events.some((e) => e.t === 'turretFire' && e.side === foe && e.slot !== held)).toBe(true);
  });
});

describe('two Carnavals that do the same on the same tick stay a mirror', () => {
  for (const era of [0, 1, 2]) {
    it(`both press the special of era ${era} at once`, () => {
      const s = setup('carnaval', 'carnaval', era);
      for (const side of [0, 1] as const) {
        rich(s, side);
        for (const [pos, row] of [[px(400), 1], [px(250), 0], [px(150), 2]] as const) place(s, side, eraOf('carnaval', era).units[row === 1 ? 2 : row === 0 ? 1 : 0]!.id, pos, undefined, row);
      }
      run(s, 1, [
        { tick: s.tick, side: 0, cmd: SPECIAL_CMD },
        { tick: s.tick, side: 1, cmd: SPECIAL_CMD },
      ]);
      for (let i = 0; i < 300; i++) {
        run(s, 1);
        const shape = (side: Side) => s.sides[side].units.map((u) => ({ ...u, id: 0 }));
        expect(shape(0)).toEqual(shape(1));
      }
    });
  }
});
