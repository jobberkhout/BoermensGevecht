import { describe, expect, it } from 'vitest';
import {
  FOLLOW_GAP,
  INCOME_EVERY,
  LANE,
  QUEUE_MAX,
  ROWS,
  START_GOLD,
  SUBSIDY,
  TURRET_SLOTS,
  UNIT_CAP,
  px,
} from '../src/defs/balance.ts';
import { turretDef, unitDef } from '../src/defs/index.ts';
import { canDo } from '../src/sim/commands.ts';
import { AH, HM, act, match, place, run } from './helpers.ts';

describe('money', () => {
  it('subsidie arrives once per interval', () => {
    const s = match();
    const income = SUBSIDY.income[0];
    run(s, INCOME_EVERY * 3 + 1);
    expect(s.sides[0].gold).toBe(START_GOLD + 3 * income);
    expect(s.sides[1].gold).toBe(START_GOLD + 3 * income);
  });

  it('buying costs money and is refused without it', () => {
    const s = match();
    act(s, 0, { t: 'buy', slot: 0 });
    expect(s.sides[0].gold).toBe(START_GOLD - unitDef(HM.light).cost);
    s.sides[0].gold = 0;
    expect(canDo(s, 0, { t: 'buy', slot: 0 })).toBe(false);
    act(s, 0, { t: 'buy', slot: 0 });
    expect(s.sides[0].queue).toHaveLength(1);
  });
});

describe('training', () => {
  it('a unit walks out exactly buildTicks after it was bought', () => {
    const s = match();
    const def = unitDef(HM.light);
    act(s, 0, { t: 'buy', slot: 0 });
    run(s, def.buildTicks - 1);
    expect(s.sides[0].units).toHaveLength(0);
    const events = run(s, 1);
    expect(s.sides[0].units).toHaveLength(1);
    expect(events.some((e) => e.t === 'spawn' && e.def === HM.light)).toBe(true);
  });

  it('the queue trains one unit at a time and holds at most QUEUE_MAX', () => {
    const s = match();
    s.sides[0].gold = 100000;
    for (let i = 0; i < QUEUE_MAX + 3; i++) act(s, 0, { t: 'buy', slot: 0 });
    expect(s.sides[0].queue.length + s.sides[0].units.length).toBe(QUEUE_MAX);
    expect(s.sides[0].queue[1]!.left).toBe(unitDef(HM.light).buildTicks);
  });

  it('a new unit waits until a row is clear at the gate', () => {
    const s = match();
    s.sides[0].gold = 100000;
    const blockers = [0, 1, 2].map((row) => {
      const b = place(s, 0, HM.heavy, unitDef(HM.heavy).len + FOLLOW_GAP - 1, undefined, row);
      b.stunUntil = 1e9;
      return b;
    });
    act(s, 0, { t: 'buy', slot: 0 });
    run(s, unitDef(HM.light).buildTicks + 30);
    expect(s.sides[0].units).toHaveLength(ROWS);
    blockers[2]!.pos += 1;
    run(s, 1);
    expect(s.sides[0].units).toHaveLength(ROWS + 1);
    expect(s.sides[0].units.at(-1)!.row).toBe(2);
  });

  it('new units spread over the rows, middle row first', () => {
    const s = match();
    s.sides[0].gold = 100000;
    for (let i = 0; i < 3; i++) act(s, 0, { t: 'buy', slot: 0 });
    run(s, unitDef(HM.light).buildTicks * 3 + 5);
    expect(s.sides[0].units.map((u) => u.row)).toEqual([1, 0, 2]);
  });

  it('no more than UNIT_CAP units stand on the lane', () => {
    const s = match();
    s.sides[0].gold = 1000000;
    for (let i = 0; i < 4000; i++) {
      act(s, 0, { t: 'buy', slot: 0 });
      expect(s.sides[0].units.length).toBeLessThanOrEqual(UNIT_CAP);
    }
  });
});

describe('turrets', () => {
  it('fills the empty slots one by one', () => {
    const s = match();
    s.sides[0].gold = 100000;
    for (let i = 0; i < TURRET_SLOTS; i++) {
      expect(canDo(s, 0, { t: 'turret' })).toBe(true);
      act(s, 0, { t: 'turret' });
    }
    expect(s.sides[0].turrets.every((t) => t !== null && t.level === 1)).toBe(true);
  });

  it('shoots enemies within range and leaves the rest alone', () => {
    const s = match();
    s.sides[0].gold = 100000;
    act(s, 0, { t: 'turret' });
    const def = turretDef('hm.1975.turret');

    const far = place(s, 1, AH.heavy, LANE - def.range - px(50), 100000);
    far.stunUntil = 1e9;
    run(s, def.cooldown * 3);
    expect(far.hp).toBe(100000);

    far.pos = LANE - def.range + px(20);
    run(s, def.cooldown * 3);
    expect(far.hp).toBeLessThan(100000);
  });

  it('never fires faster than its cooldown', () => {
    const s = match();
    s.sides[0].gold = 100000;
    act(s, 0, { t: 'turret' });
    const def = turretDef('hm.1975.turret');
    const target = place(s, 1, AH.heavy, LANE - px(100), 100000);
    target.stunUntil = 1e9;
    const events = run(s, def.cooldown * 10);
    const shots = events.filter((e) => e.t === 'turretFire').length;
    expect(shots).toBeGreaterThanOrEqual(9);
    expect(shots).toBeLessThanOrEqual(10);
  });
});

