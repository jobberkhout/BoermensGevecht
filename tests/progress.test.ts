import { describe, expect, it } from 'vitest';
import { INCOME_EVERY, LANE, PROGRESS, SPECIAL, STATS, SUBSIDY, TURRET, TURRET_SLOTS, px } from '../src/defs/balance.ts';
import { TURRETS, eraOf, turretDef, unitDef } from '../src/defs/index.ts';
import { canDo, progressNeeded, subsidyCost, turretPlan } from '../src/sim/commands.ts';
import { turretRange } from '../src/sim/turrets.ts';
import { BASE } from '../src/sim/types.ts';
import { AH, ERA, HM, SUPER, act, match, place, rich, run } from './helpers.ts';

describe('subsidie aanvragen', () => {
  it('costs money now and raises the income for good', () => {
    const s = match();
    s.sides[0].gold = SUBSIDY.cost[0];
    act(s, 0, { t: 'subsidy' });
    expect(s.sides[0].subsidy).toBe(1);
    expect(s.sides[0].gold).toBe(0);
    const tick = s.tick;
    run(s, INCOME_EVERY * 4 - tick + 1);
    expect(s.sides[0].gold).toBe(4 * SUBSIDY.income[1]);
  });

  it('gets dearer every time and stops at the last level', () => {
    const s = match();
    rich(s, 0);
    const prices: number[] = [];
    for (let i = 0; i < 20 && subsidyCost(s, 0) !== null; i++) {
      prices.push(subsidyCost(s, 0)!);
      act(s, 0, { t: 'subsidy' });
    }
    expect(prices).toEqual([...SUBSIDY.cost]);
    expect(s.sides[0].subsidy).toBe(SUBSIDY.cost.length);
    expect(canDo(s, 0, { t: 'subsidy' })).toBe(false);
  });

  it('pays itself back', () => {
    SUBSIDY.cost.forEach((cost, level) => {
      const extra = SUBSIDY.income[level + 1]! - SUBSIDY.income[level]!;
      expect(extra, `level ${level + 1} must add income`).toBeGreaterThan(0);
      expect(cost / extra, `level ${level + 1} pays back within two minutes`).toBeLessThan(120);
    });
  });
});

describe('modernizing', () => {
  it('cannot be bought: it takes vooruitgang', () => {
    const s = match();
    s.sides[0].gold = 1_000_000;
    expect(canDo(s, 0, { t: 'eraUp' })).toBe(false);
    s.sides[0].gold = 0;
    s.sides[0].progress = progressNeeded(s, 0)!;
    const events = act(s, 0, { t: 'eraUp' });
    expect(s.sides[0].era).toBe(ERA.y2025);
    expect(events.some((e) => e.t === 'eraUp' && e.era === ERA.y2025)).toBe(true);
  });

  it('vooruitgang comes with time, and with every unit beaten or lost', () => {
    const s = match();
    run(s, INCOME_EVERY * 5 + 1);
    expect(s.sides[0].progress).toBe(5 * PROGRESS.perInterval);

    const fight = match();
    place(fight, 0, HM.light, LANE / 2 - px(4), 1_000_000);
    place(fight, 1, AH.light, LANE / 2, 1);
    run(fight, 1 + unitDef(HM.light).windup);
    const price = unitDef(AH.light).cost;
    expect(fight.sides[0].progress).toBe(Math.floor((price * PROGRESS.killPercent) / 100));
    expect(fight.sides[1].progress).toBe(Math.floor((price * PROGRESS.lossPercent) / 100));
  });

  it('what was gathered beyond the need counts towards the next era', () => {
    const s = match();
    const needed = progressNeeded(s, 0)!;
    s.sides[0].progress = needed + 70;
    act(s, 0, { t: 'eraUp' });
    expect(s.sides[0].progress).toBe(70);
  });

  it('makes the buy buttons sell the new era and stops at the last one', () => {
    const s = match();
    rich(s, 0);
    s.sides[0].progress = 1_000_000;
    act(s, 0, { t: 'eraUp' });
    act(s, 0, { t: 'buy', slot: 0 });
    expect(s.sides[0].queue[0]!.def).toBe('hm.2025.light');
    act(s, 0, { t: 'eraUp' });
    expect(s.sides[0].era).toBe(ERA.y2050);
    expect(progressNeeded(s, 0)).toBeNull();
    expect(canDo(s, 0, { t: 'eraUp' })).toBe(false);
  });

  it('strengthens the base by the difference and keeps the damage it had taken', () => {
    const s = match();
    s.sides[0].progress = 1_000_000;
    s.sides[0].baseHp -= 500;
    act(s, 0, { t: 'eraUp' });
    expect(s.sides[0].baseMaxHp).toBe(STATS['2025'].baseHp);
    expect(s.sides[0].baseHp).toBe(STATS['2025'].baseHp - 500);
  });

  it('leaves units on the lane and units in training as they were', () => {
    const s = match();
    rich(s, 0);
    s.sides[0].progress = 1_000_000;
    const old = place(s, 0, HM.light, px(200));
    act(s, 0, { t: 'buy', slot: 1 });
    act(s, 0, { t: 'eraUp' });
    expect(old.def).toBe(HM.light);
    expect(s.sides[0].queue[0]!.def).toBe(HM.ranged);
  });

  it('is a big step: a unit of the next era beats two of the last, for twice the price', () => {
    for (const [older, newer] of [['1975', '2025'], ['2025', '2050']] as const) {
      for (const role of ['light', 'ranged', 'heavy'] as const) {
        const a = STATS[older][role];
        const b = STATS[newer][role];
        expect(b.cost, `${newer} ${role} price`).toBe(a.cost * 2);
        expect(b.hp * b.dmg, `${newer} ${role} strength`).toBeGreaterThan(a.hp * a.dmg * 4);
      }
    }
  });
});

describe('turret button', () => {
  it('upgrades the lowest turret once both slots are filled, up to the top level', () => {
    const s = match();
    rich(s, 0);
    for (let i = 0; i < TURRET_SLOTS; i++) act(s, 0, { t: 'turret' });
    const levels = (): number[] => s.sides[0].turrets.map((t) => t!.level);
    expect(turretPlan(s, 0)!.how).toBe('upgrade');
    act(s, 0, { t: 'turret' });
    expect(levels()).toEqual([2, 1]);
    act(s, 0, { t: 'turret' });
    expect(levels()).toEqual([2, 2]);
    act(s, 0, { t: 'turret' });
    act(s, 0, { t: 'turret' });
    expect(levels()).toEqual([TURRET.maxLevel, TURRET.maxLevel]);
    expect(turretPlan(s, 0)).toBeNull();
    expect(canDo(s, 0, { t: 'turret' })).toBe(false);
  });

  it('charges a share of the turret price for each upgrade', () => {
    const s = match();
    rich(s, 0);
    for (let i = 0; i < TURRET_SLOTS; i++) act(s, 0, { t: 'turret' });
    const price = turretDef('hm.1975.turret').cost;
    expect(turretPlan(s, 0)!.cost).toBe(Math.round((price * TURRET.upgradePercent[0]) / 100));
  });

  it('a higher level hits harder', () => {
    const hits: number[] = [];
    for (const level of [1, 2, 3]) {
      const s = match();
      rich(s, 0);
      act(s, 0, { t: 'turret' });
      s.sides[0].turrets[0]!.level = level;
      const target = place(s, 1, AH.heavy, LANE - px(100), 1_000_000);
      target.stunUntil = 1e9;
      run(s, turretDef('hm.1975.turret').cooldown * 3);
      hits.push(1_000_000 - target.hp);
    }
    expect(hits[1]).toBeGreaterThan(hits[0]!);
    expect(hits[2]).toBeGreaterThan(hits[1]!);
  });

  it('a higher level reaches further down the lane', () => {
    const def = turretDef('hm.1975.turret');
    // Fires at an enemy standing `away` pixels from the turret owner's gate?
    const fires = (level: number, away: number): boolean => {
      const s = match();
      rich(s, 0);
      act(s, 0, { t: 'turret' });
      s.sides[0].turrets[0]!.level = level;
      const target = place(s, 1, AH.heavy, LANE - px(away), 1_000_000);
      target.stunUntil = 1e9;
      return run(s, def.cooldown * 3).some((e) => e.t === 'turretFire');
    };
    expect([1, 2, 3].map((level) => turretRange(def, level))).toEqual([px(300), px(480), px(660)]);
    expect(fires(1, 290)).toBe(true);
    expect(fires(1, 400)).toBe(false);
    expect(fires(2, 400)).toBe(true);
    expect(fires(2, 600)).toBe(false);
    expect(fires(3, 600)).toBe(true);
    expect(fires(3, 700)).toBe(false);
  });

  it('a fully upgraded turret joins the fight in the middle, and no turret reaches the enemy base', () => {
    for (const def of Object.values(TURRETS)) {
      expect(turretRange(def, 1), `${def.id} level 1`).toBeLessThan(LANE / 2);
      expect(turretRange(def, TURRET.maxLevel), `${def.id} at its best`).toBeGreaterThan(LANE / 2);
      expect(turretRange(def, TURRET.maxLevel), `${def.id} at its best`).toBeLessThan(LANE - px(300));
    }
  });

  it('after modernizing, old turrets keep working until they are bought again, oldest first', () => {
    const s = match();
    rich(s, 0);
    act(s, 0, { t: 'turret' });
    act(s, 0, { t: 'turret' });
    act(s, 0, { t: 'turret' }); // slot 0 to level 2
    s.sides[0].progress = 1_000_000;
    act(s, 0, { t: 'eraUp' });
    expect(s.sides[0].turrets.map((t) => t!.def)).toEqual(['hm.1975.turret', 'hm.1975.turret']);

    const plan = turretPlan(s, 0)!;
    expect(plan.how).toBe('replace');
    expect(plan.cost).toBe(turretDef('hm.2025.turret').cost);
    act(s, 0, { t: 'turret' });
    act(s, 0, { t: 'turret' });
    // Both replaced, both back at level 1: the upgrades have to be earned again.
    expect(s.sides[0].turrets.map((t) => [t!.def, t!.level])).toEqual([
      ['hm.2025.turret', 1],
      ['hm.2025.turret', 1],
    ]);
    expect(turretPlan(s, 0)!.how).toBe('upgrade');
  });
});

describe('specials', () => {
  it('is not available at the start and recharges after use', () => {
    const s = match();
    expect(canDo(s, 0, { t: 'special' })).toBe(false);
    run(s, SPECIAL.firstReady);
    expect(canDo(s, 0, { t: 'special' })).toBe(true);
    act(s, 0, { t: 'special' });
    expect(canDo(s, 0, { t: 'special' })).toBe(false);
    run(s, SPECIAL.cooldown);
    expect(canDo(s, 0, { t: 'special' })).toBe(true);
  });

  it('each era has its own special', () => {
    for (const faction of ['havermelk', 'achterhoek'] as const) {
      const kinds = [0, 1, 2].map((era) => eraOf(faction, era).special.kind);
      expect(new Set(kinds).size, `${faction}: ${kinds.join(', ')}`).toBe(3);
    }
  });

  it('Høken! makes own units hit harder and move faster, for a while', () => {
    const s = match();
    rich(s, 1);
    const walker = place(s, 1, AH.light, px(100));
    const fighter = place(s, 1, AH.light, LANE / 2, 1_000_000);
    const foe = place(s, 0, HM.heavy, LANE / 2 - px(4), 1_000_000);
    foe.stunUntil = 1e9;
    const def = unitDef(AH.light);
    act(s, 1, { t: 'special' });
    const start = walker.pos;
    run(s, 10);
    expect(walker.pos - start).toBe(10 * Math.floor((def.speed * SPECIAL.hoken.speedPercent) / 100));
    run(s, def.windup + def.recover);
    const buffedBlow = Math.floor((def.dmg * SPECIAL.hoken.dmgPercent) / 100);
    expect((1_000_000 - foe.hp) % buffedBlow).toBe(0);
    expect(fighter.act).toBe('attack');

    // And it wears off.
    run(s, SPECIAL.hoken.ticks);
    const later = walker.pos;
    run(s, 10);
    expect(walker.pos - later).toBeLessThanOrEqual(10 * def.speed);
  });

  it('the Love-in patches up own units and nobody else', () => {
    const s = match();
    rich(s, 0);
    const hurt = place(s, 0, HM.heavy, px(100), 10);
    const fine = place(s, 0, HM.light, px(300));
    const enemy = place(s, 1, AH.heavy, px(100), 10);
    const events = act(s, 0, { t: 'special' });
    expect(hurt.hp).toBe(unitDef(HM.heavy).hp);
    expect(fine.hp).toBe(unitDef(HM.light).hp);
    expect(enemy.hp).toBe(10);
    const healed = events.find((e) => e.t === 'healed');
    expect(healed && healed.t === 'healed' ? healed.ids : []).toEqual([hurt.id]);
  });

  it('the Trekkerkolonne hits every enemy unit once and spares the base', () => {
    const s = match();
    s.sides[1].era = ERA.y2025;
    rich(s, 1);
    const a = place(s, 0, HM.heavy, px(300), 100000);
    const b = place(s, 0, HM.heavy, px(40), 100000);
    a.stunUntil = 1e9;
    b.stunUntil = 1e9;
    act(s, 1, { t: 'special' });
    run(s, 400);
    expect(a.hp).toBe(100000 - SPECIAL.kolonne.dmg);
    expect(b.hp).toBe(100000 - SPECIAL.kolonne.dmg);
    expect(s.waves).toHaveLength(0);
    expect(s.sides[0].baseHp).toBe(s.sides[0].baseMaxHp);
  });

  it('the Wegblokkade stops enemy units from walking and from fighting', () => {
    const s = match();
    s.sides[0].era = ERA.y2025;
    rich(s, 0);
    const walker = place(s, 1, AH.light, px(100));
    const fighter = place(s, 1, AH.light, LANE / 2);
    const foe = place(s, 0, HM.heavy, LANE / 2 - px(4), 100000);
    foe.stunUntil = 1e9; // keep it harmless so only the special is measured
    act(s, 0, { t: 'special' });
    const walkerPos = walker.pos;
    run(s, SPECIAL.blokkade.ticks - 2);
    expect(walker.pos).toBe(walkerPos);
    expect(fighter.act).toBe('idle');
    expect(foe.hp).toBe(100000);
    run(s, 40);
    expect(walker.pos).toBeGreaterThan(walkerPos); // free again
    expect(foe.hp).toBeLessThan(100000); // and hitting again
  });

  it('units that walk out after the Wegblokkade are not affected', () => {
    const s = match();
    s.sides[0].era = ERA.y2025;
    rich(s, 0);
    act(s, 0, { t: 'special' });
    const late = place(s, 1, AH.light, 0);
    run(s, 10);
    expect(late.pos).toBe(10 * unitDef(AH.light).speed);
  });

  it('the Dronezwerm strikes the foremost enemy again and again, then the base', () => {
    const s = match();
    s.sides[1].era = ERA.y2050;
    rich(s, 1);
    const front = place(s, 0, HM.heavy, px(300), SPECIAL.zwerm.dmg * 3);
    const back = place(s, 0, HM.heavy, px(40), 1_000_000);
    front.stunUntil = 1e9;
    back.stunUntil = 1e9;
    act(s, 1, { t: 'special' });
    const events = run(s, SPECIAL.zwerm.every * SPECIAL.zwerm.strikes + 5);
    const hits = events.filter((e) => e.t === 'barrageHit');
    expect(hits).toHaveLength(SPECIAL.zwerm.strikes);
    // Three blows finish the front unit; the rest land on the one behind it.
    expect(s.sides[0].units.map((u) => u.id)).toEqual([back.id]);
    expect(back.hp).toBe(1_000_000 - SPECIAL.zwerm.dmg * (SPECIAL.zwerm.strikes - 3));
    expect(s.barrages).toHaveLength(0);

    const empty = match();
    empty.sides[1].era = ERA.y2050;
    rich(empty, 1);
    act(empty, 1, { t: 'special' });
    const baseHits = run(empty, SPECIAL.zwerm.every * 2 + 1).filter((e) => e.t === 'barrageHit');
    expect(baseHits.every((e) => e.t === 'barrageHit' && e.id === BASE)).toBe(true);
    expect(empty.sides[0].baseHp).toBe(empty.sides[0].baseMaxHp - SPECIAL.zwerm.dmg * 2);
  });

  it('the Algoritme takes it out on the toughest enemy unit', () => {
    const s = match();
    s.sides[0].era = ERA.y2050;
    rich(s, 0);
    const weak = place(s, 1, AH.light, px(400));
    const tough = place(s, 1, AH.heavy, px(100), 1_000_000);
    const events = act(s, 0, { t: 'special' });
    expect(weak.hp).toBe(unitDef(AH.light).hp);
    expect(tough.hp).toBe(1_000_000 - SPECIAL.algoritme.dmg);
    expect(events.some((e) => e.t === 'sniped' && e.id === tough.id)).toBe(true);
  });

  it('what the Algoritme has left over goes to the next toughest, and so on', () => {
    const s = match();
    s.sides[0].era = ERA.y2050;
    rich(s, 0);
    const pool = SPECIAL.algoritme.dmg;
    const first = place(s, 1, AH.heavy, px(100), pool - 1500);
    const second = place(s, 1, AH.heavy, px(400), 1000);
    const third = place(s, 1, AH.heavy, px(700), 900);
    for (const u of [first, second, third]) u.stunUntil = 1e9;
    const events = act(s, 0, { t: 'special' });
    // 1500 is left after the first, the second takes 1000 of it, the third the last 500.
    expect(s.sides[1].units.map((u) => u.id)).toEqual([third.id]);
    expect(third.hp).toBe(400);
    expect(events.filter((e) => e.t === 'sniped')).toHaveLength(3);
    expect(events.filter((e) => e.t === 'defeat')).toHaveLength(2);
  });

  it('two specials used on the same tick both count, whoever is on the left', () => {
    // The love-in heals at once; the algorithm's blow lands at the end of the tick, after it.
    const s = match();
    s.sides[1].era = ERA.y2050;
    rich(s, 0);
    rich(s, 1);
    const unitHp = unitDef(HM.heavy).hp;
    const target = place(s, 0, HM.heavy, px(100), 10);
    run(s, 1, [
      { tick: s.tick, side: 0, cmd: { t: 'special' } },
      { tick: s.tick, side: 1, cmd: { t: 'special' } },
    ]);
    // Achterhoek's 2050 special is the swarm, not the algorithm, so use the mirrored set-up as well.
    expect(target.hp).toBe(unitHp);

    const m = match(['achterhoek', 'havermelk']);
    m.sides[1].era = ERA.y2050;
    rich(m, 1);
    const victim = place(m, 0, AH.heavy, px(100), 1_000_000);
    act(m, 1, { t: 'special' });
    expect(victim.hp).toBe(1_000_000 - SPECIAL.algoritme.dmg);
  });
});

describe('the super unit', () => {
  it('can only be bought in the last era', () => {
    const s = match();
    rich(s, 0);
    for (const era of [ERA.y1975, ERA.y2025]) {
      s.sides[0].era = era;
      expect(canDo(s, 0, { t: 'buy', slot: 3 }), `era ${era}`).toBe(false);
    }
    s.sides[0].era = ERA.y2050;
    expect(canDo(s, 0, { t: 'buy', slot: 3 })).toBe(true);
    act(s, 0, { t: 'buy', slot: 3 });
    expect(s.sides[0].queue[0]!.def).toBe(SUPER.hm);
    expect(s.sides[0].gold).toBe(1_000_000 - unitDef(SUPER.hm).cost);
  });

  it('is an army by itself: it beats three heavies of its own era, but not six', () => {
    const heavy = 'ah.2050.heavy';
    const fight = (heavies: number): { giant: boolean; pack: number } => {
      const s = match();
      s.sides[0].baseHp = s.sides[1].baseHp = 1e9; // a long fight must not end on a base
      const giant = place(s, 0, SUPER.hm, LANE / 2 - px(4));
      // Three abreast, the rest queued up behind them.
      for (let i = 0; i < heavies; i++) place(s, 1, heavy, LANE / 2 - px(Math.floor(i / 3) * 220), undefined, i % 3);
      run(s, 90 * 30);
      return { giant: s.sides[0].units.some((u) => u.id === giant.id), pack: s.sides[1].units.length };
    };
    // Three heavies cost a little less than one super unit, six nearly twice as much.
    expect(unitDef(heavy).cost * 3).toBeLessThan(unitDef(SUPER.hm).cost);
    expect(fight(3)).toEqual({ giant: true, pack: 0 });
    const six = fight(6);
    expect(six.giant).toBe(false);
    expect(six.pack).toBeGreaterThan(0);
  });

  it('cannot be cancelled: the Algoritme goes for the next toughest instead', () => {
    const s = match();
    s.sides[0].era = ERA.y2050;
    rich(s, 0);
    const giant = place(s, 1, SUPER.ah, px(400));
    const heavy = place(s, 1, 'ah.2050.heavy', px(100));
    const events = act(s, 0, { t: 'special' });
    expect(giant.hp).toBe(unitDef(SUPER.ah).hp);
    expect(heavy.hp).toBe(unitDef('ah.2050.heavy').hp - Math.min(unitDef('ah.2050.heavy').hp, SPECIAL.algoritme.dmg));
    const shrugged = events.find((e) => e.t === 'shrugged');
    expect(shrugged && shrugged.t === 'shrugged' ? shrugged.ids : []).toEqual([giant.id]);
  });

  it('with only a super unit on the lane the Algoritme is wasted', () => {
    const s = match();
    s.sides[0].era = ERA.y2050;
    rich(s, 0);
    const giant = place(s, 1, SUPER.ah, px(400));
    const events = act(s, 0, { t: 'special' });
    expect(giant.hp).toBe(unitDef(SUPER.ah).hp);
    expect(events.some((e) => e.t === 'sniped')).toBe(false);
  });

  it('the Dronezwerm passes it by: the next unit takes the strikes, or the base', () => {
    const s = match();
    s.sides[1].era = ERA.y2050;
    rich(s, 1);
    const giant = place(s, 0, SUPER.hm, px(500));
    const behind = place(s, 0, HM.heavy, px(100), 1_000_000);
    giant.stunUntil = 1e9;
    behind.stunUntil = 1e9;
    act(s, 1, { t: 'special' });
    run(s, SPECIAL.zwerm.every * SPECIAL.zwerm.strikes + 5);
    expect(giant.hp).toBe(unitDef(SUPER.hm).hp);
    expect(behind.hp).toBe(1_000_000 - SPECIAL.zwerm.dmg * SPECIAL.zwerm.strikes);

    const alone = match();
    alone.sides[1].era = ERA.y2050;
    rich(alone, 1);
    const only = place(alone, 0, SUPER.hm, px(500));
    only.stunUntil = 1e9;
    act(alone, 1, { t: 'special' });
    run(alone, SPECIAL.zwerm.every * 2 + 1);
    expect(only.hp).toBe(unitDef(SUPER.hm).hp);
    expect(alone.sides[0].baseHp).toBe(alone.sides[0].baseMaxHp - SPECIAL.zwerm.dmg * 2);
  });

  it('cannot be glued down or run over either', () => {
    // A side still in the twenties uses its special on a super unit from the future.
    const glue = match();
    glue.sides[0].era = ERA.y2025;
    rich(glue, 0);
    const walker = place(glue, 1, SUPER.ah, px(100));
    const other = place(glue, 1, AH.light, px(50));
    act(glue, 0, { t: 'special' });
    const before = walker.pos;
    run(glue, 10);
    expect(walker.pos).toBe(before + 10 * unitDef(SUPER.ah).speed);
    expect(other.stunUntil).toBeGreaterThan(glue.tick);

    const convoy = match();
    convoy.sides[1].era = ERA.y2025;
    rich(convoy, 1);
    const giant = place(convoy, 0, SUPER.hm, px(300));
    giant.stunUntil = 1e9;
    act(convoy, 1, { t: 'special' });
    run(convoy, 400);
    expect(giant.hp).toBe(unitDef(SUPER.hm).hp);
  });

  it('is still hurt by ordinary units and turrets', () => {
    const s = match();
    rich(s, 0);
    act(s, 0, { t: 'turret' });
    const giant = place(s, 1, SUPER.ah, LANE - px(100));
    giant.stunUntil = 1e9;
    place(s, 0, HM.light, px(96));
    run(s, 120);
    expect(giant.hp).toBeLessThan(unitDef(SUPER.ah).hp);
  });

  it('own specials still work on it', () => {
    const s = match();
    rich(s, 0); // the seventies: the Love-in
    const giant = place(s, 0, SUPER.hm, px(100), 10);
    act(s, 0, { t: 'special' });
    expect(giant.hp).toBe(unitDef(SUPER.hm).hp);
  });
});
