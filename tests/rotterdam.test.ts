import { describe, expect, it } from 'vitest';
import { HAKKEN, HAVENGELD, HIJS, INCOME_EVERY, LANE, SAUS, SPECIAL, SUBSIDY, VONK, px } from '../src/defs/balance.ts';
import { eraOf, unitDef } from '../src/defs/index.ts';
import type { FactionId } from '../src/defs/types.ts';
import { wallFor } from '../src/sim/haven.ts';
import type { SimEvent, SimState } from '../src/sim/types.ts';
import { act, match, place, rich, run } from './helpers.ts';

/**
 * Rotterdam's rules (sim/haven.ts): Lasser Leen's sparks, Gabber Gerrie's
 * tempo, the kapsalon's garlic sauce, De AGV's havengeld, De Poetsrobot that
 * shrugs specials off, De Kraan's lift, and the three specials of kinds of
 * their own: Mouwen opstropen! (rush), De container (block) and De kering
 * sluit (shelter).
 */

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

const strikes = (events: readonly SimEvent[], id: number): number[] =>
  events.flatMap((e, i) => (e.t === 'strike' && e.id === id ? [i] : []));

describe('Lasser Leen burns whoever hits him up close', () => {
  for (const side of [0, 1] as const) {
    it(`a close blow on him comes back in part to whoever struck it (seat ${side})`, () => {
      const foe = side === 0 ? 1 : 0;
      const s = setup(side === 0 ? 'rotterdam' : 'achterhoek', side === 0 ? 'achterhoek' : 'rotterdam');
      const leen = place(s, side, 'rt.1975.shield', px(400));
      leen.act = 'idle';
      const hitter = place(s, foe, 'ah.1975.light', facing(px(400), px(10)));
      const events = run(s, 40);
      const burns = events.filter((e) => e.t === 'sparked' && e.id === leen.id);
      expect(burns.length).toBeGreaterThan(0);
      const blow = unitDef(hitter.def).dmg;
      // Leen hits back too: what the hitter lost is his sparks plus his own blows.
      const own = events.filter((e) => e.t === 'hit' && e.side === foe && e.id === hitter.id).map((e) => (e.t === 'hit' ? e.amount : 0));
      expect(own).toContain(Math.floor((blow * VONK.percent) / 100));
    });
  }

  it("turret shots on him make no sparks: only blows up close do", () => {
    const s = setup('rotterdam', 'achterhoek');
    place(s, 0, 'rt.1975.shield', LANE - px(200)).act = 'idle';
    s.sides[1].turrets[0] = { def: eraOf('achterhoek', 0).turret.id, level: 1, cd: 0, value: 0 };
    const events = run(s, 90);
    expect(events.some((e) => e.t === 'turretFire' && e.side === 1)).toBe(true);
    expect(events.some((e) => e.t === 'sparked')).toBe(false);
  });
});

describe('Gabber Gerrie hakt faster with every blow', () => {
  it('his pause between blows shrinks blow by blow down to the floor, and is back once he walks', () => {
    const s = setup('rotterdam', 'achterhoek', 1);
    const gerrie = place(s, 0, 'rt.2025.light', px(400), 1_000_000);
    const target = place(s, 1, 'ah.2025.heavy', facing(px(400), px(10)), 1_000_000);
    target.act = 'idle';
    const ticks: number[] = [];
    for (let t = 0; t < 400 && ticks.length < 9; t++) {
      if (run(s, 1).some((e) => e.t === 'strike' && e.id === gerrie.id)) ticks.push(s.tick);
    }
    const gaps = ticks.slice(1).map((t, i) => t - ticks[i]!);
    const def = unitDef(gerrie.def);
    expect(gaps[0]).toBeGreaterThan(gaps[gaps.length - 1]!);
    expect(gaps[gaps.length - 1]).toBe(def.windup + Math.floor((def.recover * HAKKEN.floorPercent) / 100));
    expect(gerrie.beat).toBeGreaterThan(1);
    // The enemy is gone: he walks again and has lost the beat.
    s.sides[1].units = [];
    run(s, 30);
    expect(gerrie.beat ?? 0).toBe(0);
  });
});

describe("De Kapsalonkoerier's garlic sauce", () => {
  it('splashes on every other enemy unit near the one it hits, in any row, and not on those further off', () => {
    const s = setup('rotterdam', 'achterhoek', 1);
    const thrower = place(s, 0, 'rt.2025.ranged', px(300));
    thrower.act = 'idle';
    const first = place(s, 1, 'ah.2025.heavy', facing(px(300), px(150)), 1_000_000);
    first.act = 'idle';
    const near = place(s, 1, 'ah.2025.light', first.pos - SAUS.reach + px(10), 1_000_000, 0);
    near.act = 'idle';
    const far = place(s, 1, 'ah.2025.light', first.pos - SAUS.reach - px(40), 1_000_000, 2);
    far.act = 'idle';
    // Keep them where they are: nobody of theirs walks.
    const events: SimEvent[] = [];
    for (let i = 0; i < 90; i++) {
      for (const u of s.sides[1].units) u.stunUntil = s.tick + 2;
      events.push(...run(s, 1));
    }
    const sauced = events.filter((e) => e.t === 'sauced');
    expect(sauced.length).toBeGreaterThan(0);
    expect(sauced.every((e) => e.t === 'sauced' && e.ids.includes(near.id) && !e.ids.includes(far.id))).toBe(true);
    const splash = Math.floor((unitDef(thrower.def).dmg * SAUS.dmgPercent) / 100);
    expect(1_000_000 - near.hp).toBe(splash * sauced.length);
    expect(far.hp).toBe(1_000_000);
  });
});

describe('De AGV brings in havengeld', () => {
  it('every second it stands on the lane, on top of the income, and to the enemy while earnings are diverted', () => {
    const s = setup('rotterdam', 'achterhoek', 1);
    place(s, 0, 'rt.2025.heavy', px(100)).stunUntil = 0;
    s.sides[0].gold = 0;
    s.tick = INCOME_EVERY * 5;
    const events = run(s, 1);
    expect(s.sides[0].gold).toBe(SUBSIDY.income[0] + HAVENGELD.amount);
    expect(events.some((e) => e.t === 'earned' && e.side === 0 && e.owner === 0)).toBe(true);
    s.sides[0].divertedUntil = s.tick + INCOME_EVERY * 2;
    const before = s.sides[1].gold;
    run(s, INCOME_EVERY);
    expect(s.sides[1].gold - before).toBe(SUBSIDY.income[0] * 2 + HAVENGELD.amount);
  });
});

describe('De Poetsrobot shrugs specials off', () => {
  it('walks on through a stun that stops the units next to it', () => {
    const s = setup('havermelk', 'rotterdam', 2);
    const robot = place(s, 1, 'rt.2050.light', px(200));
    const ranged = place(s, 1, 'rt.2050.ranged', px(200), undefined, 0);
    place(s, 0, 'hm.2050.light', px(100)).act = 'idle';
    s.sides[0].era = 1; // Amsterdam's 2025 special is the Wegblokkade, a stun.
    rich(s, 0);
    const events = act(s, 0, SPECIAL_CMD);
    expect(events.some((e) => e.t === 'shrugged' && e.ids.includes(robot.id))).toBe(true);
    expect(ranged.stunUntil).toBeGreaterThan(s.tick);
    expect(robot.stunUntil).toBe(0);
  });
});

describe('De Kraan lifts the front unit and drops it on the one behind', () => {
  it('now and then, not every blow; the one it lands on takes half the blow; a super unit is too big', () => {
    const s = setup('rotterdam', 'achterhoek', 2);
    const kraan = place(s, 0, 'rt.2050.super', px(500));
    const front = place(s, 1, 'ah.2050.light', facing(px(500), px(10)), 1_000_000);
    front.act = 'idle';
    const behind = place(s, 1, 'ah.2050.light', front.pos - unitDef(front.def).len - px(60), 1_000_000);
    behind.act = 'idle';
    const events: SimEvent[] = [];
    const at: number[] = [];
    for (let i = 0; i < HIJS.every * 2 + 60; i++) {
      const now = run(s, 1);
      if (now.some((e) => e.t === 'lifted')) at.push(s.tick);
      events.push(...now);
    }
    expect(at.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < at.length; i++) expect(at[i]! - at[i - 1]!).toBeGreaterThanOrEqual(HIJS.every);
    const lift = events.find((e) => e.t === 'lifted')!;
    expect(lift.t === 'lifted' && lift.id === front.id && lift.from - lift.to).toBeGreaterThan(0);
    // It came down against the one behind, which took half a blow on top of the sweep.
    const blow = unitDef(kraan.def).dmg;
    const hurt = events.filter((e) => e.t === 'hit' && e.id === behind.id).map((e) => (e.t === 'hit' ? e.amount : 0));
    expect(hurt).toContain(Math.floor((blow * HIJS.dmgPercent) / 100));

    const t = setup('rotterdam', 'achterhoek', 2);
    place(t, 0, 'rt.2050.super', px(500));
    place(t, 1, 'ah.2050.super', facing(px(500), px(10)), 1_000_000).act = 'idle';
    expect(run(t, HIJS.every + 60).some((e) => e.t === 'lifted')).toBe(false);
  });
});

describe('Mouwen opstropen!', () => {
  it('makes whatever is in training ready at once while it lasts', () => {
    const s = setup('rotterdam', 'achterhoek');
    rich(s, 0);
    act(s, 0, { t: 'buy', slot: 2 });
    act(s, 0, { t: 'buy', slot: 2 });
    expect(s.sides[0].queue.length).toBe(2);
    const events = [...act(s, 0, SPECIAL_CMD), ...run(s, 60)];
    expect(events.filter((e) => e.t === 'spawn' && e.side === 0)).toHaveLength(2);
    // Without it, one heavy alone takes far longer than that.
    expect(unitDef('rt.1975.heavy').buildTicks).toBeGreaterThan(60);
    // Afterwards training takes its time again.
    run(s, SPECIAL.mouwen.ticks);
    act(s, 0, { t: 'buy', slot: 2 });
    expect(run(s, 30).some((e) => e.t === 'spawn' && e.side === 0)).toBe(false);
  });
});

describe('De container', () => {
  for (const side of [0, 1] as const) {
    it(`lands on the enemy's front, hurts whoever is under it, parts the two lines and holds them (seat ${side})`, () => {
      const foe = side === 0 ? 1 : 0;
      const s = setup(side === 0 ? 'rotterdam' : 'achterhoek', side === 0 ? 'achterhoek' : 'rotterdam', 1);
      const mine = place(s, side, side === 0 ? 'rt.2025.light' : 'rt.2025.light', px(600), 1_000_000);
      const theirs = place(s, foe, 'ah.2025.light', facing(px(600), px(10)), 1_000_000);
      rich(s, side);
      const events = act(s, side, SPECIAL_CMD);
      const drop = events.find((e) => e.t === 'blocked');
      expect(drop && drop.t === 'blocked' && drop.ids).toEqual([theirs.id]);
      expect(theirs.hp).toBe(1_000_000 - SPECIAL.container.dmg);
      // The two fronts are now a container apart, and stay so while it lies there.
      run(s, SPECIAL.container.ticks - 5);
      expect(LANE - mine.pos - theirs.pos).toBeGreaterThanOrEqual(SPECIAL.container.width);
      expect(theirs.hp).toBe(1_000_000 - SPECIAL.container.dmg);
      expect(wallFor(s, side)).toBeLessThan(Infinity);
      // Then it is lifted away and they meet again.
      run(s, 120);
      expect(s.blocks).toHaveLength(0);
      expect(theirs.hp).toBeLessThan(1_000_000 - SPECIAL.container.dmg);
    });
  }
});

describe('De kering sluit', () => {
  it("halves every hit on the side's own units while it lasts, and not on its base", () => {
    const s = setup('rotterdam', 'achterhoek', 2);
    const mine = place(s, 0, 'rt.2050.heavy', px(500), 1_000_000);
    mine.act = 'idle';
    const hitter = place(s, 1, 'ah.2050.light', facing(px(500), px(10)));
    rich(s, 0);
    act(s, 0, SPECIAL_CMD);
    const events = run(s, 60);
    const blows = events.filter((e) => e.t === 'hit' && e.id === mine.id).map((e) => (e.t === 'hit' ? e.amount : 0));
    expect(blows.length).toBeGreaterThan(0);
    expect(blows.every((b) => b === Math.floor((unitDef(hitter.def).dmg * SPECIAL.kering.percent) / 100))).toBe(true);
    run(s, SPECIAL.kering.ticks);
    const later = run(s, 60).filter((e) => e.t === 'hit' && e.id === mine.id).map((e) => (e.t === 'hit' ? e.amount : 0));
    expect(later.every((b) => b === unitDef(hitter.def).dmg)).toBe(true);
  });
});
