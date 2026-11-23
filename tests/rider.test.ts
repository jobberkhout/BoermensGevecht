import { describe, expect, it } from 'vitest';
import { LANE, OVERTIME, PROGRESS, RIDER, STATS, UNIT_CAP, px } from '../src/defs/balance.ts';
import { FACTIONS, eraOf, unitDef } from '../src/defs/index.ts';
import type { FactionId } from '../src/defs/types.ts';
import { unitDamagePercent } from '../src/sim/overtime.ts';
import { RIDER_ROW } from '../src/sim/riders.ts';
import type { Rider, Side, SimEvent, SimState } from '../src/sim/types.ts';
import { ERA, act, match, place, rich, run } from './helpers.ts';

/** The fatbike: De Gasten's heavy of 2025, the one rider in the game. */
const FATBIKE = 'gs.2025.heavy';
const AH = { light: 'ah.2025.light', ranged: 'ah.2025.ranged', heavy: 'ah.2025.heavy', shield: 'ah.2025.shield', super: 'ah.2050.super' } as const;

/** De Gasten against the farmers, both in 2025. `gastenSide` says which seat De Gasten has. */
function setup(gastenSide: Side = 0): SimState {
  const factions: [FactionId, FactionId] = gastenSide === 0 ? ['gasten', 'achterhoek'] : ['achterhoek', 'gasten'];
  const s = match(factions);
  for (const side of [0, 1] as const) {
    s.sides[side].era = ERA.y2025;
    s.sides[side].baseHp = s.sides[side].baseMaxHp = eraOf(factions[side], ERA.y2025).baseHp;
  }
  return s;
}

/** Puts a fatbike straight onto the lane at `pos`, as if it had just been trained. */
function ride(s: SimState, side: Side, pos = 0): Rider {
  const rider: Rider = { id: s.nextId++, def: FATBIKE, row: RIDER_ROW, pos, prevPos: pos, hp: unitDef(FATBIKE).hp, passed: [], arrived: false };
  s.sides[side].riders.push(rider);
  return rider;
}

/** Runs until the rider is off the lane, and a little longer for whatever it set off to land. */
function rideOut(s: SimState, side: Side): SimEvent[] {
  const events: SimEvent[] = [];
  for (let i = 0; i < 200 && s.sides[side].riders.length > 0; i++) events.push(...run(s, 1));
  return events;
}

const blow = (def: string): number => unitDef(def).dmg;

/** What `side` was paid for beating units, apart from its income. */
const paid = (events: readonly SimEvent[], side: Side): number =>
  events.reduce((sum, e) => sum + (e.t === 'gold' && e.side === side ? e.amount : 0), 0);

describe('the fatbike', () => {
  it("is De Gasten's heavy of 2025, a rider with its own numbers, and the only rider there is", () => {
    const def = unitDef(FATBIKE);
    expect(def.role).toBe('heavy');
    expect(def.rider).toEqual({ baseDmg: RIDER.baseDmg });
    expect({ cost: def.cost, buildTicks: def.buildTicks, hp: def.hp, speed: def.speed, dmg: def.dmg }).toEqual({
      cost: RIDER.cost,
      buildTicks: RIDER.buildTicks,
      hp: RIDER.hp,
      speed: RIDER.speed,
      dmg: RIDER.ram,
    });
    // The owner's numbers: 300, and a fifth more hit points than a light unit of its era.
    expect(def.cost).toBe(300);
    expect(def.hp).toBe(Math.floor(STATS['2025'].light.hp * 1.2));
    const riders = Object.values(FACTIONS).flatMap((f) => f.eras.flatMap((e) => e.units.filter((u) => u.rider).map((u) => u.id)));
    expect(riders).toEqual([FATBIKE]);
  });

  it('is trained in the queue and leaves the gate as a rider, not into the ranks, also when the ranks are full', () => {
    const s = setup();
    rich(s, 0);
    for (let i = 0; i < UNIT_CAP; i++) place(s, 0, 'gs.2025.light', px(10), 1_000_000, i % 3);
    act(s, 0, { t: 'buy', slot: 2 });
    run(s, RIDER.buildTicks + 2);
    expect(s.sides[0].units.length).toBe(UNIT_CAP);
    expect(s.sides[0].riders.map((r) => r.def)).toEqual([FATBIKE]);
  });

  it('goes one at a time: the next one waits at the gate, trained, until the first is gone', () => {
    const s = setup();
    ride(s, 0);
    s.sides[0].queue.push({ def: FATBIKE, left: 0 });
    run(s, 3);
    expect(s.sides[0].riders.length).toBe(1);
    expect(s.sides[0].queue.length).toBe(1);
    rideOut(s, 0);
    run(s, 2);
    expect(s.sides[0].riders.length).toBe(1);
    expect(s.sides[0].queue.length).toBe(0);
  });

  it('rides through an enemy unit: the unit takes its ram, it takes one blow back, and it rides on', () => {
    const s = setup();
    const rider = ride(s, 0);
    const light = place(s, 1, AH.light, LANE / 2);
    run(s, 70);
    expect(light.hp).toBe(unitDef(AH.light).hp - RIDER.ram);
    expect(rider.hp).toBe(RIDER.hp - blow(AH.light));
    expect(rider.pos).toBeGreaterThan(LANE - light.pos);
  });

  it('is not hit back by a unit that is stunned', () => {
    const s = setup();
    const rider = ride(s, 0);
    const light = place(s, 1, AH.light, LANE / 2);
    light.stunUntil = 1e9;
    run(s, 70);
    expect(light.hp).toBe(unitDef(AH.light).hp - RIDER.ram);
    expect(rider.hp).toBe(RIDER.hp);
  });

  it('earns its side the bounty and the vooruitgang for what it beats on the way', () => {
    const s = setup();
    ride(s, 0);
    place(s, 1, AH.light, LANE / 2, 50);
    const progress = [s.sides[0].progress, s.sides[1].progress];
    const events = run(s, 70);
    expect(s.sides[1].units.length).toBe(0);
    expect(paid(events, 0)).toBe(unitDef(AH.light).bounty);
    // Both gain the same with time; on top of that the winner of the fight learns more than the loser.
    const cost = unitDef(AH.light).cost;
    expect(s.sides[0].progress - progress[0]! - (s.sides[1].progress - progress[1]!)).toBe(
      Math.floor((cost * PROGRESS.killPercent) / 100) - Math.floor((cost * PROGRESS.lossPercent) / 100),
    );
  });

  it('is worn down by a crowd and stops at the unit that beats it; what it did on the way stays done', () => {
    const s = setup();
    ride(s, 0);
    const heavies = [0, 1, 2, 3].map((i) => place(s, 1, AH.heavy, LANE / 2 - px(40) * i, 1_000_000, i % 3));
    // How many heavies it gets through: the blows add up until they reach its hit points.
    let left = RIDER.hp;
    let through = 0;
    while (left > 0) {
      left -= blow(AH.heavy);
      through++;
    }
    const events = rideOut(s, 0);
    expect(events.filter((e) => e.t === 'rammed').length).toBe(through);
    expect(heavies.filter((h) => h.hp < 1_000_000).length).toBe(through);
    expect(events.some((e) => e.t === 'defeat' && e.side === 0)).toBe(true);
    expect(paid(events, 1)).toBe(unitDef(FATBIKE).bounty);
    expect(s.sides[1].baseHp).toBe(s.sides[1].baseMaxHp);
  });

  it('crashes into a schild, and both go down; each side earns the other one', () => {
    const s = setup();
    ride(s, 0);
    const schild = place(s, 1, AH.shield, LANE / 2);
    const events = rideOut(s, 0);
    expect(events.filter((e) => e.t === 'crashed').length).toBe(1);
    expect(s.sides[1].units.find((u) => u.id === schild.id)).toBeUndefined();
    expect(paid(events, 0)).toBe(unitDef(AH.shield).bounty);
    expect(paid(events, 1)).toBe(unitDef(FATBIKE).bounty);
    expect(s.sides[1].baseHp).toBe(s.sides[1].baseMaxHp);
  });

  it('cannot ride through a super unit either: the super unit takes the knock and walks on', () => {
    const s = setup();
    s.sides[1].era = ERA.y2050;
    ride(s, 0);
    const giant = place(s, 1, AH.super, LANE / 2);
    const events = rideOut(s, 0);
    expect(events.filter((e) => e.t === 'crashed').length).toBe(1);
    expect(giant.hp).toBe(unitDef(AH.super).hp - RIDER.ram);
    expect(s.sides[1].units).toContain(giant);
  });

  it('rides into the base when it gets there: the base takes its blow, it is gone, and nobody is paid', () => {
    const s = setup();
    ride(s, 0);
    const events = rideOut(s, 0);
    expect(events.filter((e) => e.t === 'arrived').length).toBe(1);
    expect(s.sides[1].baseHp).toBe(s.sides[1].baseMaxHp - RIDER.baseDmg);
    expect(paid(events, 0) + paid(events, 1)).toBe(0);
  });

  it('is what turrets fire at first, before a schild or the front unit', () => {
    const s = setup();
    rich(s, 1);
    act(s, 1, { t: 'turret' });
    s.sides[1].turrets[0]!.level = 3;
    s.sides[1].turrets[0]!.cd = 0;
    // A schild of De Gasten well within reach, and the fatbike just coming into it.
    place(s, 0, 'gs.2025.shield', LANE - px(200), 1_000_000);
    const rider = ride(s, 0, LANE - px(640));
    run(s, 1);
    expect(s.shots.length).toBe(1);
    expect(s.shots[0]!.aim).toBe(rider.id);
    const events = rideOut(s, 0);
    expect(events.some((e) => e.t === 'hit' && e.side === 0 && e.id === rider.id)).toBe(true);
  });

  it('is untouched by enemy specials', () => {
    const s = match(['gasten', 'havermelk']);
    s.sides[0].era = ERA.y2025;
    s.sides[1].era = ERA.y2025; // the blokkade: a stun
    rich(s, 1);
    place(s, 0, 'gs.2025.light', px(200));
    const rider = ride(s, 0);
    act(s, 1, { t: 'special' });
    const before = rider.pos;
    run(s, 5);
    expect(rider.pos).toBe(before + 5 * RIDER.speed);
  });

  it('passes a rider coming the other way', () => {
    const s = match(['gasten', 'gasten']);
    s.sides[0].era = ERA.y2025;
    s.sides[1].era = ERA.y2025;
    const a = ride(s, 0);
    const b = ride(s, 1);
    run(s, 80);
    expect(a.hp).toBe(RIDER.hp);
    expect(b.hp).toBe(RIDER.hp);
    expect(a.pos).toBeGreaterThan(LANE / 2);
  });

  it('hits harder in overtime, as every unit does', () => {
    const s = setup();
    s.tick = OVERTIME.at + OVERTIME.every * 2;
    s.sides[0].baseHp = s.sides[1].baseHp = 1_000_000;
    ride(s, 0);
    const light = place(s, 1, AH.light, LANE / 2, 1_000_000);
    const percent = unitDamagePercent(s.tick);
    expect(percent).toBeGreaterThan(100);
    run(s, 70);
    expect(1_000_000 - light.hp).toBe(Math.floor((RIDER.ram * percent) / 100));
  });

  it('plays out the same with the seats swapped', () => {
    const outcome = (gastenSide: Side) => {
      const s = setup(gastenSide);
      const foe = gastenSide === 0 ? 1 : 0;
      ride(s, gastenSide);
      const units = [
        place(s, foe, AH.light, LANE / 2, undefined, 0),
        place(s, foe, AH.ranged, LANE / 2 - px(60), undefined, 1),
        place(s, foe, AH.heavy, LANE / 3, undefined, 2),
      ];
      const events = rideOut(s, gastenSide);
      return {
        hp: units.map((u) => u.hp),
        base: s.sides[foe].baseHp,
        gold: [s.sides[gastenSide].gold, s.sides[foe].gold],
        rammed: events.filter((e) => e.t === 'rammed').length,
      };
    };
    expect(outcome(1)).toEqual(outcome(0));
  });
});
