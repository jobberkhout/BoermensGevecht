import { describe, expect, it } from 'vitest';
import { BASE_GAP, CONTACT_GAP, FOLLOW_GAP, INCOME_EVERY, LANE, OVERTIME, SUBSIDY, px } from '../src/defs/balance.ts';
import { turretDef, unitDef } from '../src/defs/index.ts';
import { canDo } from '../src/sim/commands.ts';
import { overtimeLevel, turretDamagePercent } from '../src/sim/overtime.ts';
import { SIDES } from '../src/sim/types.ts';
import { AH, HM, act, match, place, rich, run, unit } from './helpers.ts';

describe('walking', () => {
  it('a lone unit advances by its speed every tick', () => {
    const s = match();
    const u = place(s, 0, HM.light, 0);
    run(s, 10);
    expect(u.pos).toBe(10 * unitDef(HM.light).speed);
    expect(u.act).toBe('walk');
  });

  it('both sides walk at the same pace, measured from their own gate', () => {
    const s = match();
    const a = place(s, 0, HM.light, 0);
    const b = place(s, 1, AH.light, 0);
    run(s, 25);
    expect(a.pos).toBe(b.pos);
  });

  it('a unit keeps its distance from the ally in front', () => {
    const s = match();
    const slow = place(s, 0, HM.heavy, px(400));
    const fast = place(s, 0, HM.light, 0);
    for (let i = 0; i < 400; i++) {
      run(s, 1);
      expect(fast.pos).toBeLessThanOrEqual(slow.pos - unitDef(HM.heavy).len - FOLLOW_GAP);
    }
    // It caught up and is now held back at exactly the follow distance.
    expect(fast.pos).toBe(slow.pos - unitDef(HM.heavy).len - FOLLOW_GAP);
  });

  it('a faster unit passes a slower ally in another row', () => {
    const s = match();
    const slow = place(s, 0, HM.heavy, px(300), undefined, 0);
    const fast = place(s, 0, HM.light, 0, undefined, 1);
    run(s, 400);
    expect(fast.pos).toBeGreaterThan(slow.pos);
  });

  it('nobody walks past the enemy front line, whatever row they are in', () => {
    const s = match();
    const wall = place(s, 1, AH.heavy, LANE / 2, 1000000, 0);
    wall.stunUntil = 1e9;
    const a = place(s, 0, HM.light, 0, 1000000, 1);
    const b = place(s, 0, HM.light, 0, 1000000, 2);
    for (let i = 0; i < 900; i++) {
      run(s, 1);
      expect(a.pos + wall.pos).toBeLessThanOrEqual(LANE - CONTACT_GAP);
      expect(b.pos + wall.pos).toBeLessThanOrEqual(LANE - CONTACT_GAP);
    }
    // Both walked up until the wall was within reach and now fight side by side.
    const reach = unitDef(HM.light).range;
    expect(LANE - a.pos - wall.pos).toBeLessThanOrEqual(reach);
    expect(LANE - a.pos - wall.pos).toBeGreaterThan(reach - unitDef(HM.light).speed);
    expect(b.pos).toBe(a.pos);
    expect(a.act).toBe('attack');
    expect(b.act).toBe('attack');
  });

  it('opposing units meet without ever crossing', () => {
    const s = match();
    const a = place(s, 0, HM.light, 0);
    const b = place(s, 1, AH.heavy, 0);
    for (let i = 0; i < 600 && unit(s, 0, a.id) && unit(s, 1, b.id); i++) {
      run(s, 1);
      expect(a.pos + b.pos).toBeLessThanOrEqual(LANE - CONTACT_GAP);
    }
  });

  it('a unit stops short of the enemy gate and attacks the base', () => {
    const s = match();
    const u = place(s, 0, HM.light, 0);
    run(s, 2000);
    expect(u.pos).toBeLessThanOrEqual(LANE - BASE_GAP);
    expect(LANE - u.pos).toBeLessThanOrEqual(unitDef(HM.light).range);
    expect(s.sides[1].baseHp).toBeLessThan(s.sides[1].baseMaxHp);
  });
});

describe('fighting', () => {
  it('a blow lands exactly on the windup tick', () => {
    const s = match();
    const def = unitDef(HM.light);
    place(s, 0, HM.light, LANE / 2 - CONTACT_GAP);
    const victim = place(s, 1, AH.heavy, LANE / 2);
    run(s, 1); // both notice each other and start their attack
    run(s, def.windup - 1);
    expect(victim.hp).toBe(unitDef(AH.heavy).hp);
    run(s, 1);
    expect(victim.hp).toBe(unitDef(AH.heavy).hp - def.dmg);
  });

  it('attacks repeat every windup + recover ticks', () => {
    const s = match();
    const def = unitDef(HM.light);
    place(s, 0, HM.light, LANE / 2 - CONTACT_GAP, 100000); // tough enough to survive the heavy
    const victim = place(s, 1, AH.heavy, LANE / 2);
    const cycle = def.windup + def.recover;
    run(s, 1 + def.windup + 3 * cycle);
    expect(victim.hp).toBe(unitDef(AH.heavy).hp - 4 * def.dmg);
  });

  it('two units that strike on the same tick both go down', () => {
    const s = match();
    const a = place(s, 0, HM.light, LANE / 2 - CONTACT_GAP, 1);
    const b = place(s, 1, AH.light, LANE / 2, 1);
    const events = run(s, 1 + unitDef(HM.light).windup);
    expect(unit(s, 0, a.id)).toBeUndefined();
    expect(unit(s, 1, b.id)).toBeUndefined();
    expect(events.filter((e) => e.t === 'defeat')).toHaveLength(2);
  });

  it('beating a unit pays its bounty to the other side', () => {
    const s = match();
    place(s, 0, HM.light, LANE / 2 - CONTACT_GAP);
    place(s, 1, AH.light, LANE / 2, 1);
    const before = s.sides[0].gold;
    run(s, 1 + unitDef(HM.light).windup);
    expect(s.sides[0].gold).toBe(before + unitDef(AH.light).bounty);
  });

  it('a ranged unit stops at range and its shot does damage only on arrival', () => {
    const s = match();
    const def = unitDef(HM.ranged);
    const archer = place(s, 0, HM.ranged, 0);
    const target = place(s, 1, AH.heavy, px(300), 100000);
    target.stunUntil = 1e9; // stays put
    let firstShotTick = -1;
    let firstHitTick = -1;
    for (let i = 0; i < 1500 && firstHitTick < 0; i++) {
      const events = run(s, 1);
      if (firstShotTick < 0 && s.shots.length > 0) firstShotTick = s.tick;
      if (events.some((e) => e.t === 'hit' && e.id === target.id)) firstHitTick = s.tick;
    }
    const gap = LANE - archer.pos - target.pos;
    expect(gap).toBeLessThanOrEqual(def.range);
    expect(gap).toBeGreaterThan(def.range - def.speed); // it did not walk further than needed
    expect(firstShotTick).toBeGreaterThan(0);
    expect(firstHitTick).toBeGreaterThan(firstShotTick);
    expect(target.hp).toBe(100000 - def.dmg);
  });

  it('ranged units shoot over the ally in front of them', () => {
    const s = match();
    place(s, 0, HM.heavy, LANE / 2 - CONTACT_GAP);
    const archer = place(s, 0, HM.ranged, LANE / 2 - CONTACT_GAP - unitDef(HM.heavy).len - FOLLOW_GAP);
    place(s, 1, AH.heavy, LANE / 2, 100000);
    const events = run(s, 60);
    expect(events.some((e) => e.t === 'strike' && e.id === archer.id && e.ranged)).toBe(true);
  });

  it('a shot with nothing to hit fizzles instead of reaching the base', () => {
    const s = match();
    const def = unitDef(HM.ranged);
    place(s, 0, HM.ranged, px(100));
    const target = place(s, 1, AH.light, LANE - px(100) - def.range, 1);
    target.stunUntil = 1e9;
    run(s, 1 + def.windup); // the shot is in the air
    s.sides[1].units = []; // the target leaves before it arrives
    run(s, 200);
    expect(s.shots).toHaveLength(0);
    expect(s.sides[1].baseHp).toBe(s.sides[1].baseMaxHp);
  });
});

describe('the end of a match', () => {
  it('a base at zero loses and the match stops', () => {
    const s = match();
    s.sides[1].baseHp = 1;
    place(s, 0, HM.light, LANE - BASE_GAP);
    const events = run(s, 60);
    expect(s.winner).toBe(0);
    expect(events.some((e) => e.t === 'win')).toBe(true);
    const tick = s.tick;
    run(s, 10);
    expect(s.tick).toBe(tick);
  });

  it('both bases falling on the same tick is a draw', () => {
    const s = match();
    s.sides[0].baseHp = 1;
    s.sides[1].baseHp = 1;
    // One shot from each side, both about to arrive.
    for (const side of SIDES) {
      s.shots.push({
        id: s.nextId++,
        side,
        pos: LANE - 1,
        prevPos: LANE - 1,
        origin: 0,
        dist0: LANE,
        limit: LANE * 2,
        speed: 10,
        dmg: 5,
        rig: 'test',
        arc: 0,
        spin: 0,
        src: -1,
        row: 1,
        slot: -1,
        aim: -1,
      });
    }
    run(s, 1);
    expect(s.winner).toBe('draw');
  });
});

describe('overtime', () => {
  it('announces itself, and then turns the screw at a steady beat', () => {
    const s = match();
    s.tick = OVERTIME.at;
    const events = run(s, OVERTIME.every * 3);
    expect(events.filter((e) => e.t === 'overtime')).toHaveLength(1);
    const steps = events.filter((e) => e.t === 'escalate').map((e) => (e.t === 'escalate' ? e.percent : 0));
    expect(steps).toEqual([OVERTIME.stepPercent, OVERTIME.stepPercent * 2, OVERTIME.stepPercent * 3]);
  });

  it('wears turrets out with each step, until they fall silent', () => {
    const turret = turretDef('hm.1975.turret');
    // What one shot does to a target on the doorstep, fired at the given moment of the match.
    const shot = (tick: number): number => {
      const s = match();
      rich(s, 0);
      act(s, 0, { t: 'turret' });
      s.tick = tick;
      const target = place(s, 1, AH.heavy, LANE - px(100), 1_000_000);
      target.stunUntil = 1e9;
      // Exactly one shot leaves and lands in this stretch.
      run(s, turret.cooldown + 12);
      return 1_000_000 - target.hp;
    };
    expect(turretDamagePercent(OVERTIME.at - 1)).toBe(100);
    expect(shot(100)).toBe(turret.dmg);
    const sixSteps = OVERTIME.at + OVERTIME.every * 5;
    expect(shot(sixSteps)).toBe(Math.floor((turret.dmg * (100 - 6 * OVERTIME.turretStepPercent)) / 100));
    // Well before the bases start to crumble there is nothing left of them: the first step comes at once.
    const silentAt = OVERTIME.at + OVERTIME.every * (Math.ceil(100 / OVERTIME.turretStepPercent) - 1);
    expect(turretDamagePercent(silentAt - 1)).toBeGreaterThan(0);
    expect(turretDamagePercent(silentAt)).toBe(0);
    expect(silentAt).toBeLessThan(OVERTIME.crumbleAt);
    expect(shot(silentAt)).toBe(0);
  });

  it('makes every unit hit harder with each step', () => {
    const def = unitDef(HM.light);
    // What one blow does to a target, landed at the given moment of the match.
    const blow = (tick: number): number => {
      const s = match();
      s.tick = tick;
      place(s, 0, HM.light, LANE / 2 - px(4), 1_000_000);
      const target = place(s, 1, AH.heavy, LANE / 2, 1_000_000);
      target.stunUntil = 1e9;
      run(s, 1 + def.windup);
      return 1_000_000 - target.hp;
    };
    expect(overtimeLevel(OVERTIME.at - 1)).toBe(0);
    expect(blow(OVERTIME.at - 100)).toBe(def.dmg);
    expect(blow(OVERTIME.at)).toBe(Math.floor((def.dmg * (100 + OVERTIME.stepPercent)) / 100));
    expect(blow(OVERTIME.at + OVERTIME.every * 4)).toBe(Math.floor((def.dmg * (100 + OVERTIME.stepPercent * 5)) / 100));
  });

  it('leaves the subsidiekraan open: the income keeps coming, and so do bounties', () => {
    const s = match();
    s.tick = OVERTIME.at - INCOME_EVERY * 2;
    const before = s.sides[0].gold;
    run(s, INCOME_EVERY * 12);
    expect(s.sides[0].gold).toBe(before + 12 * SUBSIDY.income[0]);

    // Beating a unit pays as always.
    const purse = s.sides[0].gold;
    place(s, 0, HM.light, LANE / 2 - px(4), 1_000_000);
    place(s, 1, AH.light, LANE / 2, 1);
    run(s, 1 + unitDef(HM.light).windup);
    expect(s.sides[0].gold).toBeGreaterThanOrEqual(purse + unitDef(AH.light).bounty);

    // And more subsidie can still be applied for.
    s.sides[0].gold = 100000;
    expect(canDo(s, 0, { t: 'subsidy' })).toBe(true);
  });

  it('does not touch the bases until the long stop', () => {
    const s = match();
    s.tick = OVERTIME.at;
    run(s, OVERTIME.crumbleAt - OVERTIME.at - 1);
    expect(s.sides.map((side) => side.baseHp)).toEqual(s.sides.map((side) => side.baseMaxHp));
    expect(s.winner).toBeNull();
  });

  it('from the long stop both bases crumble, so the more damaged one loses', () => {
    const s = match();
    s.sides[0].baseHp -= 10;
    s.tick = OVERTIME.crumbleAt;
    const events = run(s, OVERTIME.crumbleEvery * 200);
    expect(events.some((e) => e.t === 'crumble')).toBe(true);
    expect(s.winner).toBe(1);
  });

  it('untouched bases that crumble end in a draw', () => {
    const s = match();
    s.tick = OVERTIME.crumbleAt;
    run(s, OVERTIME.crumbleEvery * 200);
    expect(s.winner).toBe('draw');
  });
});

describe('heavies', () => {
  it('a heavy hits every enemy within its reach with one blow', () => {
    const s = match();
    const def = unitDef(HM.heavy);
    const heavy = place(s, 0, HM.heavy, LANE / 2, 100000, 1);
    const near = [0, 1, 2].map((row) => place(s, 1, AH.light, LANE / 2 - CONTACT_GAP, 100000, row));
    const far = place(s, 1, AH.ranged, LANE / 2 - CONTACT_GAP - def.range - px(60), 100000, 1);
    for (const u of [...near, far]) u.stunUntil = 1e9;
    run(s, 1 + def.windup);
    for (const u of near) expect(u.hp).toBe(100000 - def.dmg);
    expect(far.hp).toBe(100000);
    expect(heavy.act).toBe('attack');
  });

  it('a light hits only the foremost enemy', () => {
    const s = match();
    const def = unitDef(HM.light);
    place(s, 0, HM.light, LANE / 2, 100000, 1);
    const near = [0, 1, 2].map((row) => place(s, 1, AH.light, LANE / 2 - CONTACT_GAP, 100000, row));
    for (const u of near) u.stunUntil = 1e9;
    run(s, 1 + def.windup);
    expect(near.filter((u) => u.hp < 100000)).toHaveLength(1);
  });
});
