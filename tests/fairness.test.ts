import { describe, expect, it } from 'vitest';
import { BASE_GAP, CONTACT_GAP } from '../src/defs/balance.ts';
import { FACTIONS, FACTION_IDS, UNITS } from '../src/defs/index.ts';
import { BOTS, mixed, random } from '../src/bots/bots.ts';
import { runMatch, runReplay } from '../src/bots/runMatch.ts';
import type { Block, SideState, SimState } from '../src/sim/types.ts';

/** A side's state without the things that legitimately differ between sides: ids. `blocks` are the containers it dropped. */
function shape(side: SideState, blocks: readonly Block[] = []): unknown {
  // A turret taken over with the key names the unit that holds it, by id.
  const turrets = side.turrets.map((t) => (t && t.heldBy !== undefined ? { ...t, heldBy: 0 } : t));
  return {
    rush: side.rushUntil,
    shelter: [side.shelterUntil, side.shelterPercent],
    blocks: blocks.map((b) => [b.at, b.width, b.until]),
    era: side.era,
    gold: side.gold,
    baseHp: side.baseHp,
    queue: side.queue,
    turrets,
    subsidy: side.subsidy,
    progress: side.progress,
    buffUntil: side.buffUntil,
    divertedUntil: side.divertedUntil,
    hike: [side.hikeFrom, side.hikeUntil, side.hikePercent],
    arrivals: side.arrivals,
    specialReadyAt: side.specialReadyAt,
    // Ids differ between the seats by construction; a pole vaulter's prey is an id of the other side's.
    units: side.units.map((u) => ({ ...u, id: 0, ...(u.prey === undefined ? {} : { prey: 0 }) })),
    riders: side.riders.map((r) => ({ ...r, id: 0, passed: r.passed.length })),
    peels: side.peels.map((p) => ({ ...p, id: 0 })),
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
  for (const faction of FACTION_IDS) {
    it(`${faction} against itself with identical play stays a perfect mirror`, () => {
      let checked = 0;
      let maxEra = 0;
      const result = runMatch({
        seed: 1,
        factions: [faction, faction],
        bots: [mixed(), mixed()],
        onTick: (s: SimState) => {
          const dropped = (side: 0 | 1) => s.blocks.filter((b) => b.side === side);
          expect(shape(s.sides[0], dropped(0))).toEqual(shape(s.sides[1], dropped(1)));
          maxEra = Math.max(maxEra, s.sides[0].era);
          checked++;
        },
      });
      expect(checked).toBeGreaterThan(1000);
      expect(result.winner).toBe('draw');
      // A real match, not two bots standing still: both got at least to the second era.
      expect(maxEra).toBeGreaterThanOrEqual(1);
    });
  }

  it('swapping the two bots swaps the outcome', () => {
    const a = runMatch({ seed: 2, factions: ['achterhoek', 'achterhoek'], bots: [BOTS.rush!(), mixed()] });
    const b = runMatch({ seed: 2, factions: ['achterhoek', 'achterhoek'], bots: [mixed(), BOTS.rush!()] });
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
      // Whoever a special calls in is free and pays nothing; everyone else pays back less than it cost.
      if (def.summoned) expect([def.cost, def.bounty], `${def.id} free`).toEqual([0, 0]);
      else expect(def.bounty, `${def.id} bounty below cost`).toBeLessThan(def.cost);
    }
  });

  it('unit ids are unique', () => {
    const ids = Object.values(FACTIONS).flatMap((f) => f.eras.flatMap((e) => [...e.units, ...e.extras].map((u) => u.id)));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
