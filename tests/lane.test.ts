import { describe, expect, it } from 'vitest';
import { BASE_GAP, CONTACT_GAP, FOLLOW_GAP, LANE, OVERTIME, px } from '../src/defs/balance.ts';
import { unitDef } from '../src/defs/index.ts';
import { SIDES } from '../src/sim/types.ts';
import { AH, HM, match, place, run, unit } from './helpers.ts';

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
      });
    }
    run(s, 1);
    expect(s.winner).toBe('draw');
  });

  it('in overtime both bases crumble, so the more damaged one loses', () => {
    const s = match();
    s.sides[0].baseHp -= 10;
    s.tick = OVERTIME.at;
    const events = run(s, OVERTIME.every * 200);
    expect(events.some((e) => e.t === 'overtime')).toBe(true);
    expect(s.winner).toBe(1);
  });

  it('untouched bases in overtime end in a draw', () => {
    const s = match();
    s.tick = OVERTIME.at;
    run(s, OVERTIME.every * 200);
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
