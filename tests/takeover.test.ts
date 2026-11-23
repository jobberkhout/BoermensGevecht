import { describe, expect, it } from 'vitest';
import { CONTACT_GAP, LANE, SPECIAL, px } from '../src/defs/balance.ts';
import { eraOf, unitDef } from '../src/defs/index.ts';
import type { SimState } from '../src/sim/types.ts';
import { AH, ERA, SUPER, ZA, act, match, place, rich, run } from './helpers.ts';

/** De Zuidas of 2025 on the left with its special ready, against the Achterhoek. */
function zuidas(): SimState {
  const s = match(['zuidas', 'achterhoek']);
  s.sides[0].era = ERA.y2025;
  rich(s, 0);
  return s;
}

/** Makes a unit stand still, so a test can reason about where things are. */
function freeze<T extends { stunUntil: number }>(unit: T): T {
  unit.stunUntil = 1e9;
  return unit;
}

describe('Vijandige overname', () => {
  it('buys the toughest enemy unit, which from then on fights for the buyer', () => {
    const s = zuidas();
    const light = place(s, 1, AH.light, px(300));
    const heavy = place(s, 1, AH.heavy, px(500), 321);
    const events = act(s, 0, { t: 'special' });
    expect(s.sides[1].units).toEqual([light]);
    expect(s.sides[0].units).toEqual([heavy]);
    expect(heavy.turncoat).toBe(true);
    expect(heavy.hp).toBe(321);
    expect(events.some((e) => e.t === 'converted' && e.side === 0 && e.id === heavy.id)).toBe(true);

    // It really fights: the light unit it used to march with is now its target.
    freeze(light).hp = 1_000_000;
    run(s, 600);
    expect(light.hp).toBeLessThan(1_000_000);
  });

  it('costs nothing but the special, and pays no bounty', () => {
    const s = zuidas();
    place(s, 1, AH.heavy, px(500));
    act(s, 0, { t: 'special' });
    expect(s.sides[0].gold).toBe(1_000_000);
    expect(s.sides[0].progress).toBe(0);
    expect(s.sides[1].progress).toBe(0);
  });

  it('the bought unit turns round where it stands: its back becomes its front', () => {
    const s = zuidas();
    const heavy = freeze(place(s, 1, AH.heavy, px(500)));
    act(s, 0, { t: 'special' });
    expect(heavy.pos).toBe(LANE - px(500) + unitDef(AH.heavy).len);
    expect(heavy.stunUntil).toBe(0);
    // And off it goes, towards the gate it came out of.
    const from = heavy.pos;
    run(s, 10);
    expect(heavy.pos).toBeGreaterThan(from);
  });

  it('never ends up beyond the line its old side still holds', () => {
    const s = zuidas();
    const front = freeze(place(s, 1, AH.light, px(700)));
    const heavy = freeze(place(s, 1, AH.heavy, px(400)));
    act(s, 0, { t: 'special' });
    // Bought out of the back ranks, it comes forward to face its old front line.
    expect(heavy.pos).toBe(LANE - front.pos - CONTACT_GAP);
  });

  it('takes a free row at the front instead of standing inside an ally', () => {
    const s = zuidas();
    const line = px(600);
    const heavy = freeze(place(s, 1, AH.heavy, line, undefined, 1));
    freeze(place(s, 1, AH.light, line, undefined, 0));
    const mine = freeze(place(s, 0, ZA.light, LANE - line - CONTACT_GAP, undefined, 1));
    act(s, 0, { t: 'special' });
    expect(heavy.pos).toBe(mine.pos);
    expect(heavy.row).not.toBe(mine.row);
  });

  it('with every row taken at the front it queues up behind, and nobody overlaps', () => {
    const s = zuidas();
    const line = px(600);
    const heavy = freeze(place(s, 1, AH.heavy, line, undefined, 1));
    freeze(place(s, 1, AH.light, line, undefined, 0));
    const mine = [0, 1, 2].map((row) => freeze(place(s, 0, ZA.light, LANE - line - CONTACT_GAP, undefined, row)));
    act(s, 0, { t: 'special' });
    const ahead = mine.find((u) => u.row === heavy.row)!;
    expect(heavy.pos).toBeLessThan(ahead.pos - unitDef(ZA.light).len);
    // Within a row the list still runs front to back.
    const row = s.sides[0].units.filter((u) => u.row === heavy.row);
    expect(row.map((u) => u.id)).toEqual([ahead.id, heavy.id]);
  });

  it('cannot buy a super unit: it takes the next toughest, or nobody', () => {
    const s = zuidas();
    s.sides[1].era = ERA.y2050;
    const giant = place(s, 1, SUPER.ah, px(500));
    const events = act(s, 0, { t: 'special' });
    expect(s.sides[1].units).toEqual([giant]);
    expect(s.sides[0].units).toEqual([]);
    expect(events.some((e) => e.t === 'shrugged' && e.ids.includes(giant.id))).toBe(true);
    expect(events.some((e) => e.t === 'converted')).toBe(false);

    s.sides[0].specialReadyAt = 0;
    const light = place(s, 1, AH.light, px(200));
    act(s, 0, { t: 'special' });
    expect(s.sides[0].units).toEqual([light]);
    expect(s.sides[1].units).toEqual([giant]);
  });

  it('a unit that is beaten on the same tick is gone, not bought', () => {
    const s = zuidas();
    const def = unitDef(ZA.light);
    place(s, 0, ZA.light, LANE / 2 - px(4), 1_000_000);
    place(s, 1, AH.light, LANE / 2, 1);
    // The blow that beats it lands on the tick the deal is signed.
    run(s, def.windup);
    const events = act(s, 0, { t: 'special' });
    expect(events.some((e) => e.t === 'defeat')).toBe(true);
    expect(events.some((e) => e.t === 'converted')).toBe(false);
    expect(s.sides[1].units).toEqual([]);
    expect(s.sides[0].units.length).toBe(1);
  });

  it('two takeovers on the same tick: the units swap sides and face each other again', () => {
    const s = match(['zuidas', 'zuidas']);
    s.sides[0].era = ERA.y2025;
    s.sides[1].era = ERA.y2025;
    rich(s, 0);
    rich(s, 1);
    const mid = (LANE - CONTACT_GAP) / 2;
    const left = freeze(place(s, 0, ZA.heavy, mid));
    const right = freeze(place(s, 1, ZA.heavy, mid));
    run(s, 1, [
      { tick: s.tick, side: 0, cmd: { t: 'special' } },
      { tick: s.tick, side: 1, cmd: { t: 'special' } },
    ]);
    expect(s.sides[0].units).toEqual([right]);
    expect(s.sides[1].units).toEqual([left]);
    // Neither side came out ahead, and they are not standing past each other.
    expect(left.pos).toBe(right.pos);
    expect(left.pos + right.pos).toBeLessThanOrEqual(LANE - CONTACT_GAP);
  });

  it('a bought unit can be bought back', () => {
    const s = match(['zuidas', 'zuidas']);
    s.sides[0].era = ERA.y2025;
    s.sides[1].era = ERA.y2025;
    rich(s, 0);
    rich(s, 1);
    const heavy = freeze(place(s, 1, ZA.heavy, px(500)));
    act(s, 0, { t: 'special' });
    expect(heavy.turncoat).toBe(true);
    freeze(heavy);
    act(s, 1, { t: 'special' });
    expect(s.sides[1].units).toEqual([heavy]);
    expect(heavy.turncoat).toBe(false);
  });
});

describe('De Zuidas', () => {
  it('opens with the gong, which fires its units up exactly as Høken does', () => {
    const special = eraOf('zuidas', ERA.y1975).special;
    expect(special.kind).toBe('buff');
    expect(SPECIAL.gong).toEqual(SPECIAL.hoken);
  });
});
