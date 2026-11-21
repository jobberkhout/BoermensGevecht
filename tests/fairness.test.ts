import { describe, expect, it } from 'vitest';
import { BASE_GAP, CONTACT_GAP } from '../src/defs/balance.ts';
import { FACTIONS, UNITS } from '../src/defs/index.ts';
import { mixed, random, rush } from '../src/bots/bots.ts';
import { runMatch, runReplay } from '../src/bots/runMatch.ts';
import type { SideState, SimState } from '../src/sim/types.ts';

/** A side's state without the things that legitimately differ between sides: ids. */
function shape(side: SideState): unknown {
  return {
    era: side.era,
    gold: side.gold,
    baseHp: side.baseHp,
    queue: side.queue,
    turrets: side.turrets,
    specialReadyAt: side.specialReadyAt,
    units: side.units.map((u) => ({ ...u, id: 0 })),
  };
}

describe('determinism', () => {
  it('the same seed and the same bots give the same match', () => {
    const a = runMatch({ seed: 7, bots: [mixed(), random(3)] });
    const b = runMatch({ seed: 7, bots: [mixed(), random(3)] });
    expect(a.hash).toBe(b.hash);
    expect(a.ticks).toBe(b.ticks);
  });

  it('replaying the recorded commands reproduces the match exactly', () => {
    const live = runMatch({ seed: 11, bots: [random(5), mixed()] });
    const again = runReplay(live.replay);
    expect(again.hash).toBe(live.hash);
    expect(again.state.winner).toBe(live.winner);
  });
});

describe('no side has a built-in advantage', () => {
  for (const faction of ['havermelk', 'achterhoek'] as const) {
    it(`${faction} against itself with identical play stays a perfect mirror`, () => {
      let checked = 0;
      const result = runMatch({
        seed: 1,
        factions: [faction, faction],
        bots: [mixed(), mixed()],
        onTick: (s: SimState) => {
          expect(shape(s.sides[0])).toEqual(shape(s.sides[1]));
          checked++;
        },
      });
      expect(checked).toBeGreaterThan(1000);
      expect(result.winner).toBe('draw');
    });
  }

  it('swapping the two bots swaps the outcome', () => {
    const a = runMatch({ seed: 2, factions: ['achterhoek', 'achterhoek'], bots: [rush, mixed()] });
    const b = runMatch({ seed: 2, factions: ['achterhoek', 'achterhoek'], bots: [mixed(), rush] });
    expect(a.ticks).toBe(b.ticks);
    expect(a.baseHp[0]).toBe(b.baseHp[1]);
    expect(a.baseHp[1]).toBe(b.baseHp[0]);
  });
});

describe('the data makes sense', () => {
  it('every unit can reach what it stops in front of', () => {
    for (const def of Object.values(UNITS)) {
      expect(def.range, `${def.id} range vs contact gap`).toBeGreaterThan(CONTACT_GAP);
      expect(def.range, `${def.id} range vs base gap`).toBeGreaterThan(BASE_GAP);
      expect(def.speed, `${def.id} speed`).toBeGreaterThan(0);
      expect(def.windup, `${def.id} windup`).toBeGreaterThan(0);
      expect(def.recover, `${def.id} recover`).toBeGreaterThan(0);
      expect(def.bounty, `${def.id} bounty below cost`).toBeLessThan(def.cost);
    }
  });

  it('the factions field the same roles with the same numbers', () => {
    const [a, b] = [FACTIONS.havermelk, FACTIONS.achterhoek];
    expect(a.eras.length).toBe(b.eras.length);
    a.eras.forEach((era, i) => {
      const twin = b.eras[i]!;
      expect(era.baseHp).toBe(twin.baseHp);
      expect(era.income).toBe(twin.income);
      era.units.forEach((u, slot) => {
        const v = twin.units[slot]!;
        const { id: _a, rig: _b, shot: _c, ...stats } = u;
        const { id: _d, rig: _e, shot: _f, ...twinStats } = v;
        expect(stats).toEqual(twinStats);
        expect(u.shot?.speed).toBe(v.shot?.speed);
      });
    });
  });

  it('unit ids are unique', () => {
    const ids = Object.values(FACTIONS).flatMap((f) => f.eras.flatMap((e) => e.units.map((u) => u.id)));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
