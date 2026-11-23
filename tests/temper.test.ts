import { describe, expect, it } from 'vitest';
import { BOUNTY_PERCENT, ERA_KEYS, PRICE_STEP, STATS, TWIST_LIMIT, twisted } from '../src/defs/balance.ts';
import { FACTIONS, unitDef } from '../src/defs/index.ts';

/**
 * Every faction starts from the same numbers and puts its own twist on them:
 * its temperament. These tests hold the twists small, keep what must stay
 * equal for everyone equal, and pin down what each faction is like.
 */

/** The numbers a twist may change. */
const TWISTABLE = ['cost', 'buildTicks', 'hp', 'speed', 'range', 'dmg', 'recover'] as const;

describe('temperament', () => {
  it('a twist is a percentage of the shared number, and the bounty follows the price', () => {
    const shared = STATS['1975'].heavy;
    const mine = twisted(shared, { cost: 110, hp: 115, speed: 90 });
    expect(mine.cost).toBe(255); // 253, rounded to a price
    expect(mine.bounty).toBe(Math.round((255 * BOUNTY_PERCENT) / 100));
    expect(mine.hp).toBe(Math.round(shared.hp * 1.15));
    expect(mine.speed).toBe(Math.round(shared.speed * 0.9));
    // What the twist does not name stays as it is.
    expect(mine.dmg).toBe(shared.dmg);
    expect(mine.buildTicks).toBe(shared.buildTicks);
    expect(twisted(shared, undefined)).toBe(shared);
  });

  it('every twist is small', () => {
    for (const faction of Object.values(FACTIONS)) {
      for (const [role, twist] of Object.entries(faction.temper)) {
        for (const [stat, percent] of Object.entries(twist)) {
          expect(Math.abs(percent - 100), `${faction.id} ${role} ${stat}`).toBeLessThanOrEqual(TWIST_LIMIT);
        }
      }
    }
  });

  it('only melee units keep their reach: a twist on range is for units that throw', () => {
    for (const faction of Object.values(FACTIONS)) {
      for (const [role, twist] of Object.entries(faction.temper)) {
        if (role !== 'ranged') expect(twist.range, `${faction.id} ${role}`).toBeUndefined();
      }
    }
  });

  it('the factions field the same roles from the same numbers, each with its own twist', () => {
    for (const faction of Object.values(FACTIONS)) {
      expect(faction.eras.map((era) => era.key), faction.id).toEqual([...ERA_KEYS]);
      for (const era of faction.eras) {
        const shared = STATS[era.key];
        // Bases, the way to the next era and turrets are the same for everyone.
        expect(era.baseHp, era.id).toBe(shared.baseHp);
        expect(era.progressNeeded, era.id).toBe(shared.progressNeeded);
        expect(era.eraUpCost, era.id).toBe(shared.eraUpCost);
        const { id: _id, rig: _rig, shot, ...turret } = era.turret;
        expect({ ...turret, shotSpeed: shot.speed }, era.turret.id).toEqual(shared.turret);

        expect(era.units.map((u) => u.role), era.id).toEqual(['light', 'ranged', 'heavy', shared.super ? 'super' : 'shield']);
        for (const unit of era.units) {
          // A rider has numbers of its own (RIDER), tested in tests/rider.test.ts.
          if (unit.rider) continue;
          const base = shared[unit.role]!;
          const twist = faction.temper[unit.role] ?? {};
          for (const stat of TWISTABLE) {
            if (twist[stat] === undefined) {
              expect(unit[stat], `${unit.id} ${stat}`).toBe(base[stat]);
            } else {
              // Within the limit, give or take the rounding to whole ticks, sub-units and prices.
              const percent = (unit[stat] / base[stat]) * 100;
              expect(Math.abs(percent - 100), `${unit.id} ${stat}`).toBeLessThanOrEqual(TWIST_LIMIT + 5);
              expect(Math.sign(percent - 100), `${unit.id} ${stat} goes the way its twist says`).toBe(Math.sign(twist[stat]! - 100));
            }
          }
          // What makes a role the role it is, is nobody's to twist.
          expect(unit.len, unit.id).toBe(base.len);
          expect(unit.windup, unit.id).toBe(base.windup);
          expect(unit.cleave, unit.id).toBe(base.cleave ?? false);
          expect(unit.immune, unit.id).toBe(base.immune ?? false);
          expect(unit.turretPercent, unit.id).toBe(base.turretPercent ?? 100);
          expect(unit.drawsFire, unit.id).toBe(base.drawsFire ?? false);
          expect(unit.shot?.speed, unit.id).toBe(base.shotSpeed);
          expect(unit.bounty, unit.id).toBe(Math.round((unit.cost * BOUNTY_PERCENT) / 100));
          expect(unit.cost % PRICE_STEP, `${unit.id} price`).toBe(0);
        }
      }
    }
  });

  it('a super unit is the same for everyone, apart from its price', () => {
    for (const faction of Object.values(FACTIONS)) {
      expect(Object.keys(faction.temper.super ?? {}).filter((stat) => stat !== 'cost'), faction.id).toEqual([]);
    }
  });
});

describe('what each faction is like', () => {
  const of = (prefix: string, era: string, role: string) => unitDef(`${prefix}.${era}.${role}`);

  for (const era of ['1975', '2025', '2050']) {
    it(`${era}: farmers are tough and slow`, () => {
      for (const role of ['light', 'heavy']) {
        expect(of('ah', era, role).hp, role).toBeGreaterThan(of('za', era, role).hp);
        expect(of('ah', era, role).speed, role).toBeLessThan(of('za', era, role).speed);
        expect(of('ah', era, role).recover, role).toBeGreaterThan(of('hm', era, role).recover);
      }
      // What they throw lands harder than anyone's.
      expect(of('ah', era, 'ranged').dmg).toBeGreaterThan(of('za', era, 'ranged').dmg);
    });

    it(`${era}: the havermelkelite is quick and frail`, () => {
      for (const role of ['light', 'heavy']) {
        expect(of('hm', era, role).speed, role).toBeGreaterThan(of('za', era, role).speed);
        expect(of('hm', era, role).hp, role).toBeLessThan(of('za', era, role).hp);
      }
      // Everything it fields costs less than anyone else's, the Havermelkreus excepted.
      for (const role of ['light', 'ranged', 'heavy', ...(era === '2050' ? [] : ['shield'])]) {
        expect(of('hm', era, role).cost, role).toBeLessThan(of('ah', era, role).cost);
      }
      // It throws from further away than anyone, and softer.
      expect(of('hm', era, 'ranged').range).toBeGreaterThan(of('ah', era, 'ranged').range);
      expect(of('hm', era, 'ranged').dmg).toBeLessThan(of('za', era, 'ranged').dmg);
    });

    it(`${era}: De Zuidas is dear and in a hurry`, () => {
      for (const role of ['light', 'ranged', 'heavy']) {
        expect(of('za', era, role).buildTicks, role).toBeLessThan(of('ah', era, role).buildTicks);
        expect(of('za', era, role).recover, role).toBeLessThan(of('hm', era, role).recover);
      }
      // Everything it fields costs more than anyone else's.
      for (const role of ['light', 'ranged', 'heavy', era === '2050' ? 'super' : 'shield']) {
        expect(of('za', era, role).cost, role).toBeGreaterThan(of('ah', era, role).cost);
      }
      for (const role of ['ranged', 'heavy']) {
        expect(of('za', era, role).dmg, role).toBeGreaterThan(of('hm', era, role).dmg);
      }
    });
  }
});
