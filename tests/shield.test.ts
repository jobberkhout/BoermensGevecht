import { describe, expect, it } from 'vitest';
import { LANE, STATS, TURRET, px } from '../src/defs/balance.ts';
import { FACTIONS, FACTION_IDS, turretDef, unitDef } from '../src/defs/index.ts';
import { canDo } from '../src/sim/commands.ts';
import { turretDamage } from '../src/sim/turrets.ts';
import type { SimState, Unit } from '../src/sim/types.ts';
import { AH, ERA, HM, SHIELD, SUPER, act, match, place, rich, run } from './helpers.ts';

const TURRET_ID = 'hm.1975.turret';

/** Amsterdam on the left with one turret at this level, ready to fire. */
function guarded(level = 1): SimState {
  const s = match();
  rich(s, 0);
  act(s, 0, { t: 'turret' });
  s.sides[0].turrets[0]!.level = level;
  s.sides[0].turrets[0]!.cd = 0;
  return s;
}

/** Puts an enemy unit this many pixels from the left gate, standing still and very hard to beat. */
function target(s: SimState, def: string, fromGate: number): Unit {
  const unit = place(s, 1, def, LANE - px(fromGate), 1_000_000);
  unit.stunUntil = 1e9;
  return unit;
}

const lost = (unit: Unit): number => 1_000_000 - unit.hp;

describe('the schild', () => {
  it('is the fourth unit of the first two eras, for every faction', () => {
    for (const id of FACTION_IDS) {
      const roles = FACTIONS[id].eras.map((era) => era.units[3]?.role);
      expect(roles, id).toEqual(['shield', 'shield', 'super']);
    }
    const s = match();
    rich(s, 0);
    expect(canDo(s, 0, { t: 'buy', slot: 3 })).toBe(true);
    act(s, 0, { t: 'buy', slot: 3 });
    expect(s.sides[0].queue[0]!.def).toBe(SHIELD.hm);
  });

  it('draws the fire of a turret that can reach it, even from behind the front line', () => {
    const s = guarded();
    const front = target(s, AH.heavy, 100);
    const schild = target(s, SHIELD.ah, 250);
    run(s, turretDef(TURRET_ID).cooldown * 4);
    expect(lost(front)).toBe(0);
    expect(lost(schild)).toBeGreaterThan(0);
  });

  it('takes only a fifth of what a turret throws at it', () => {
    const s = guarded();
    const schild = target(s, SHIELD.ah, 100);
    const events = run(s, turretDef(TURRET_ID).cooldown * 3);
    const shots = events.filter((e) => e.t === 'glance').length;
    expect(shots).toBeGreaterThan(0);
    const full = turretDamage(turretDef(TURRET_ID), 1);
    expect(unitDef(SHIELD.ah).turretPercent).toBe(20);
    expect(lost(schild)).toBe(shots * Math.floor((full * 20) / 100));
    // It bounced off: no ordinary hit is reported for it.
    expect(events.some((e) => e.t === 'hit' && e.id === schild.id)).toBe(false);
  });

  it('out of reach it draws nothing: the turret fires at the foremost unit as always', () => {
    const s = guarded();
    const front = target(s, AH.heavy, 100);
    const schild = target(s, SHIELD.ah, 600);
    run(s, turretDef(TURRET_ID).cooldown * 4);
    expect(lost(front)).toBeGreaterThan(0);
    expect(lost(schild)).toBe(0);
  });

  it('a shot on its way to a schild that is gone falls on the first body it meets', () => {
    const s = guarded();
    const front = target(s, AH.heavy, 100);
    const schild = target(s, SHIELD.ah, 250);
    // Until a shot is in the air, aimed at the schild.
    let ticks = 0;
    while (s.shots.length === 0 && ticks++ < 100) run(s, 1);
    expect(s.shots[0]!.aim).toBe(schild.id);
    s.sides[1].units = s.sides[1].units.filter((u) => u !== schild);
    run(s, 40);
    expect(lost(front)).toBeGreaterThan(0);
  });

  it('is hurt in full by units, and is no match for one', () => {
    const s = match();
    const schild = place(s, 1, SHIELD.ah, LANE / 2);
    const light = place(s, 0, HM.light, LANE / 2 - px(4));
    run(s, 1 + unitDef(HM.light).windup);
    expect(unitDef(SHIELD.ah).hp - schild.hp).toBe(unitDef(HM.light).dmg);
    // Left to it, the cheapest unit beats a schild that costs more than twice as much.
    run(s, 3000);
    expect(s.sides[1].units).toEqual([]);
    expect(s.sides[0].units).toEqual([light]);
    expect(unitDef(SHIELD.ah).cost).toBeGreaterThan(unitDef(HM.light).cost * 2);
  });

  it('keeps two fully upgraded turrets busy for about a quarter of a minute', () => {
    for (const key of ['1975', '2025'] as const) {
      const perSecond = (2 * STATS[key].turret.dmg * TURRET.damagePercent[2]! * STATS[key].shield!.turretPercent!) / 100 / 100;
      const seconds = STATS[key].shield!.hp / perSecond;
      expect(seconds, key).toBeGreaterThan(10);
      expect(seconds, key).toBeLessThan(25);
    }
  });

  it('can be bought over like any other unit, and then draws the fire of its old side', () => {
    const s = match(['zuidas', 'achterhoek']);
    s.sides[0].era = ERA.y2025;
    rich(s, 0);
    rich(s, 1);
    act(s, 1, { t: 'turret' });
    s.sides[1].turrets[0]!.cd = 0;
    const schild = place(s, 1, SHIELD.ah, px(500));
    act(s, 0, { t: 'special' });
    expect(s.sides[0].units).toEqual([schild]);
    // It now walks at the farm, whose turret is welcome to try.
    schild.hp = 1_000_000;
    schild.pos = LANE - px(100);
    schild.stunUntil = 1e9;
    const events = run(s, 90);
    expect(events.some((e) => e.t === 'glance' && e.id === schild.id)).toBe(true);
  });
});

describe('the super unit and turrets', () => {
  it('draws their fire and shrugs it off, as the schild does', () => {
    const s = guarded(3);
    s.sides[1].era = ERA.y2050;
    const front = target(s, AH.heavy, 100);
    const giant = target(s, SUPER.ah, 300);
    const events = run(s, turretDef(TURRET_ID).cooldown * 4);
    expect(lost(front)).toBe(0);
    const shots = events.filter((e) => e.t === 'glance' && e.id === giant.id).length;
    expect(shots).toBeGreaterThan(0);
    expect(lost(giant)).toBe(shots * Math.floor((turretDamage(turretDef(TURRET_ID), 3) * unitDef(SUPER.ah).turretPercent) / 100));
  });
});
