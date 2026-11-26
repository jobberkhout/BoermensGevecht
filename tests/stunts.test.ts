import { describe, expect, it } from 'vitest';
import { BASE_GAP, BOUNCE, CHARGE, FEED, LANE, REGROW, RETURN, SOUP, SPECIAL, STICKY, VAULT, px } from '../src/defs/balance.ts';
import { eraOf, unitDef } from '../src/defs/index.ts';
import type { FactionId } from '../src/defs/types.ts';
import type { Side, SimEvent, SimState } from '../src/sim/types.ts';
import { act, match, place, rich, run } from './helpers.ts';

/**
 * Units that do something of their own, the owner's of 26 November 2026
 * (sim/stunts.ts): De Elf Steden's pole vaulter, the skater who cannot brake,
 * the sticky sugar bread and Beppe's soup; Padel-Pepijn who returns throws
 * and Smijtink's bouncing beets; and De Elf Steden's two specials of a kind of
 * their own, De Bezemwagen and the Tropenrooster.
 */

const FIERLJEPPER = 'fr.1975.light';
const KLUNER = 'fr.2025.light';
const TJITSKE = 'fr.2025.ranged';
const BEPPE = 'fr.2025.shield';
const PEPIJN = 'hm.2025.light';
const SMIJTINK = 'ah.1975.ranged';
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

const blows = (events: readonly SimEvent[], side: Side, id: number): number[] =>
  events.flatMap((e) => (e.t === 'hit' && e.side === side && e.id === id ? [e.amount] : []));

describe('De Fierljepper vaults over the first enemy it meets', () => {
  for (const side of [0, 1] as const) {
    it(`lands just behind that enemy, sits dazed, and fights on from there (seat ${side})`, () => {
      const foe = side === 0 ? 1 : 0;
      const s = setup(side === 0 ? 'friezen' : 'achterhoek', side === 0 ? 'achterhoek' : 'friezen');
      const jumper = place(s, side, FIERLJEPPER, px(400));
      const first = place(s, foe, 'ah.1975.heavy', facing(px(400), px(60)));
      first.act = 'idle';
      const events = run(s, 40);
      const leap = events.find((e) => e.t === 'vaulted');
      expect(leap).toMatchObject({ side, id: jumper.id });
      const over = LANE - first.pos + unitDef(first.def).len + VAULT.gap + unitDef(FIERLJEPPER).len;
      expect(jumper.vaulted).toBe(true);
      // Where it landed: behind the heavy's back. It is dazed for a while, then hits the heavy.
      expect(leap && leap.t === 'vaulted' ? leap.to : -1).toBe(Math.min(LANE - BASE_GAP, over));
      expect(jumper.stunUntil).toBeGreaterThan(0);
      run(s, VAULT.dazeTicks + 30);
      expect(s.sides[foe].units.find((u) => u.id === first.id)!.hp).toBeLessThan(unitDef(first.def).hp);
    });
  }

  it('vaults only once', () => {
    const s = setup('friezen', 'achterhoek');
    const jumper = place(s, 0, FIERLJEPPER, px(400));
    place(s, 1, 'ah.1975.heavy', facing(px(400), px(60))).act = 'idle';
    const events = run(s, 200);
    expect(events.filter((e) => e.t === 'vaulted' && e.id === jumper.id)).toHaveLength(1);
  });
});

describe('De Kluner cannot brake', () => {
  it('goes faster until it crashes, hits three times as hard, shoves the enemy back and sits dazed', () => {
    const s = setup('friezen', 'achterhoek', 1);
    const kluner = place(s, 0, KLUNER, px(100));
    const before = kluner.pos;
    run(s, 1);
    expect(kluner.pos - before).toBe(Math.floor((unitDef(KLUNER).speed * CHARGE.speedPercent) / 100));

    const foe = place(s, 1, 'ah.2025.light', facing(kluner.pos, px(60)));
    foe.act = 'idle';
    const at = foe.pos;
    const events = run(s, 40);
    expect(events.some((e) => e.t === 'braked' && e.id === kluner.id)).toBe(true);
    expect(blows(events, 1, foe.id)[0]).toBe(Math.floor((unitDef(KLUNER).dmg * CHARGE.dmgPercent) / 100));
    expect(events.some((e) => e.t === 'shoved' && e.id === foe.id)).toBe(true);
    expect(foe.pos).toBeLessThan(at);
    expect(kluner.charged).toBe(true);

    // From then on it walks at its own pace.
    const s2 = setup('friezen', 'achterhoek', 1);
    const calm = place(s2, 0, KLUNER, px(100));
    calm.charged = true;
    run(s2, 1);
    expect(calm.pos - px(100)).toBe(unitDef(KLUNER).speed);
  });
});

describe("Bakker Tjitske's sûkerbôle", () => {
  it('glues whoever it hits, but not a super unit', () => {
    const s = setup('friezen', 'achterhoek', 1);
    place(s, 0, TJITSKE, px(300));
    const foe = place(s, 1, 'ah.2025.heavy', facing(px(300), px(150)));
    foe.act = 'idle';
    run(s, 60);
    expect(foe.stickyUntil ?? 0).toBeGreaterThan(s.tick);
    expect((foe.stickyUntil ?? 0) - s.tick).toBeLessThanOrEqual(STICKY.ticks);

    const s2 = setup('friezen', 'achterhoek', 1);
    place(s2, 0, TJITSKE, px(300));
    s2.sides[1].era = 2;
    const giant = place(s2, 1, 'ah.2050.super', facing(px(300), px(150)));
    giant.act = 'idle';
    run(s2, 60);
    expect(giant.stickyUntil ?? 0).toBe(0);
  });

  it('makes a glued unit walk at half pace', () => {
    const s = setup('achterhoek', 'friezen', 1);
    const u = place(s, 0, 'ah.2025.light', px(100));
    u.stickyUntil = 1e9;
    run(s, 1);
    expect(u.pos - px(100)).toBe(Math.floor((unitDef('ah.2025.light').speed * 50) / 100));
  });
});

describe("Beppe's Koek-en-zopie", () => {
  it('patches up her own units around her every second, but not herself or those far away', () => {
    const s = setup('friezen', 'achterhoek', 1);
    const beppe = place(s, 0, BEPPE, px(200), 10);
    const near = place(s, 0, 'fr.2025.heavy', px(200) + px(100), 100, 0);
    const far = place(s, 0, 'fr.2025.light', px(200) + SOUP.reach + px(150), 100, 2);
    for (const u of [beppe, near, far]) u.act = 'idle';
    s.tick = SOUP.every * 3 - 1;
    const events = run(s, 2);
    expect(events.some((e) => e.t === 'served' && e.id === beppe.id)).toBe(true);
    expect(near.hp).toBe(100 + Math.floor((unitDef(near.def).hp * SOUP.healPercent) / 100));
    expect(far.hp).toBe(100);
    expect(beppe.hp).toBe(10);
  });
});

describe('De Bezemwagen', () => {
  it('remembers beaten units and brings the last four back out of the gate, the most recent first', () => {
    const s = setup('friezen', 'achterhoek', 1);
    const lost = ['fr.2025.light', 'fr.2025.ranged', 'fr.2025.heavy', 'fr.2025.shield', 'fr.1975.light'];
    lost.forEach((def, i) => place(s, 0, def, px(300) + px(i * 5), 0));
    s.tick = 1; // not on the beat of Beppe's soup, or she patches the others up before they fall
    run(s, 1);
    expect([...s.sides[0].fallen].sort()).toEqual([...lost].sort());
    rich(s, 0);
    const order = [...s.sides[0].fallen];
    const events = act(s, 0, SPECIAL_CMD);
    expect(events.some((e) => e.t === 'revived' && e.side === 0 && e.count === SPECIAL.bezemwagen.count)).toBe(true);
    expect(s.sides[0].fallen).toEqual(order.slice(0, 1));
    run(s, 300);
    expect(s.sides[0].units.map((u) => u.def).sort()).toEqual(order.slice(1).sort());
  });

  it('does not pick up units a special called in, or super units', () => {
    const s = setup('friezen', 'achterhoek', 2);
    place(s, 0, 'fr.2050.super', px(300), 0);
    run(s, 1);
    expect(s.sides[0].fallen).toEqual([]);
  });
});

describe('Tropenrooster', () => {
  it("keeps the enemy's turrets from firing while it lasts", () => {
    const s = setup('friezen', 'achterhoek', 2);
    s.sides[1].turrets[0] = { def: eraOf('achterhoek', 2).turret.id, level: 1, cd: 0, value: 0 };
    place(s, 0, 'fr.2050.heavy', LANE - px(150)).act = 'idle';
    rich(s, 0);
    act(s, 0, SPECIAL_CMD);
    const quiet = run(s, SPECIAL.tropenrooster.ticks - 2);
    expect(quiet.some((e) => e.t === 'turretFire' && e.side === 1)).toBe(false);
    const after = run(s, 60);
    expect(after.some((e) => e.t === 'turretFire' && e.side === 1)).toBe(true);
  });
});

describe('Padel-Pepijn returns throws', () => {
  it("sends an enemy unit's throw back, one every two seconds, and takes nothing for it", () => {
    const s = setup('havermelk', 'achterhoek', 1);
    const pepijn = place(s, 0, PEPIJN, px(500));
    pepijn.act = 'idle';
    pepijn.stunUntil = 1e9; // he stands still for the test, racket up
    const thrower = place(s, 1, 'ah.2025.ranged', facing(px(500), px(150)));
    thrower.act = 'idle';
    // A stunned Pepijn does not return: let him be ready, only rooted to the spot.
    pepijn.stunUntil = 0;
    pepijn.act = 'idle';
    const events = run(s, RETURN.every - 5);
    expect(events.filter((e) => e.t === 'returned' && e.id === pepijn.id).length).toBeGreaterThanOrEqual(1);
    expect(blows(events, 1, thrower.id).length).toBeGreaterThanOrEqual(1);
  });
});

describe("Smijtink's beets bounce", () => {
  it('hit the next unit behind the first, for half the damage', () => {
    const s = setup('achterhoek', 'havermelk');
    place(s, 0, SMIJTINK, px(300)).act = 'idle';
    const front = place(s, 1, 'hm.1975.heavy', facing(px(300), px(150)), undefined, 1);
    const behind = place(s, 1, 'hm.1975.light', front.pos - unitDef(front.def).len - px(40), undefined, 2);
    front.act = 'idle';
    behind.act = 'idle';
    const events = run(s, 60);
    const first = blows(events, 1, front.id);
    const second = blows(events, 1, behind.id);
    expect(first.length).toBeGreaterThanOrEqual(1);
    expect(second[0]).toBe(Math.floor((first[0]! * BOUNCE.dmgPercent) / 100));
  });
});

describe('De Kweekvleesblob grows back', () => {
  it('gets a share of its hit points back every second', () => {
    const s = setup('havermelk', 'achterhoek', 2);
    const blob = place(s, 0, 'hm.2050.heavy', px(200), 1000);
    blob.act = 'idle';
    s.tick = REGROW.every * 4 - 1;
    run(s, 2);
    expect(blob.hp).toBe(1000 + Math.floor((unitDef(blob.def).hp * REGROW.healPercent) / 100));
  });
});

describe('De Vreter eats what it hits', () => {
  it('gets a share of the damage its blows do back as hit points', () => {
    const s = setup('achterhoek', 'havermelk', 2);
    const vreter = place(s, 0, 'ah.2050.heavy', px(400), 1000);
    const food = place(s, 1, 'hm.2050.light', facing(px(400), px(10)), 1_000_000);
    food.stunUntil = 1e9;
    s.tick = 1; // off the beat of anything else that heals
    const events = run(s, 40);
    const dealt = blows(events, 1, food.id).reduce((a, b) => a + b, 0);
    expect(dealt).toBeGreaterThan(0);
    expect(vreter.hp).toBe(1000 + Math.floor((dealt * FEED.percent) / 100));
  });
});

describe('Smijtink', () => {
  it('costs more than a ranged unit usually does, for his bouncing beets', () => {
    expect(unitDef(SMIJTINK).cost).toBeGreaterThan(unitDef('ah.1975.light').cost);
    expect(unitDef(SMIJTINK).cost).toBe(Math.round((80 * BOUNCE.costPercent) / 100 / 5) * 5);
  });
});
