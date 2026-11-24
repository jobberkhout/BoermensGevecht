import { describe, expect, it } from 'vitest';
import { PROGRESS, SPECIAL, STATS, UNIT_CAP, px, twisted } from '../src/defs/balance.ts';
import { FACTIONS, eraOf, unitDef } from '../src/defs/index.ts';
import type { FactionId } from '../src/defs/types.ts';
import type { Side, SimEvent, SimState } from '../src/sim/types.ts';
import { ERA, act, match, place, rich, run } from './helpers.ts';

/** De Gasten's specials since 24 November 2026: the Toeterstoet sweeps the lane, the Familie-app calls the family in. */

const COUSIN = 'gs.2050.summoned';

/** De Gasten against the farmers, both in `era`. `gastenSide` says which seat De Gasten has. */
function setup(era: number, gastenSide: Side = 0): SimState {
  const factions: [FactionId, FactionId] = gastenSide === 0 ? ['gasten', 'achterhoek'] : ['achterhoek', 'gasten'];
  const s = match(factions);
  for (const side of [0, 1] as const) {
    s.sides[side].era = era;
    s.sides[side].baseHp = s.sides[side].baseMaxHp = eraOf(factions[side], era).baseHp;
  }
  return s;
}

const cousins = (s: SimState, side: Side) => s.sides[side].units.filter((u) => u.def === COUSIN);

describe('De Toeterstoet', () => {
  it('is a sweep like the Trekkerkolonne, with the same numbers', () => {
    const special = eraOf('gasten', ERA.y2025).special;
    const kolonne = eraOf('achterhoek', ERA.y2025).special;
    if (special.kind !== 'wave' || kolonne.kind !== 'wave') throw new Error('both should be sweeps');
    expect([special.speed, special.dmg]).toEqual([kolonne.speed, kolonne.dmg]);
  });

  it('hits every enemy unit on the lane once and spares the base', () => {
    const s = setup(ERA.y2025);
    rich(s, 0);
    const a = place(s, 1, 'ah.2025.heavy', px(300), 100000);
    const b = place(s, 1, 'ah.2025.light', px(40), 100000, 0);
    a.stunUntil = b.stunUntil = 1e9;
    act(s, 0, { t: 'special' });
    run(s, 400);
    expect([a.hp, b.hp]).toEqual([100000 - SPECIAL.toeterstoet.dmg, 100000 - SPECIAL.toeterstoet.dmg]);
    expect(s.waves).toHaveLength(0);
    expect(s.sides[1].baseHp).toBe(s.sides[1].baseMaxHp);
  });
});

describe('De Familie-app', () => {
  it("is De Gasten's special of 2050, and calls units in for good", () => {
    const special = eraOf('gasten', ERA.y2050).special;
    expect(special).toMatchObject({ kind: 'summon', unit: COUSIN, count: SPECIAL.familieApp.count });
    expect(special).not.toHaveProperty('ticks');
    // The other one is De Toeristen's cruise ship, whose day trippers go back on board: tests/tourists.test.ts.
    const summons = Object.values(FACTIONS).flatMap((f) => f.eras.filter((e) => e.special.kind === 'summon').map((e) => e.id));
    expect(summons).toEqual(['gs.2050', 'tr.2025']);
  });

  it('calls in a light unit of 2050 with the temperament of De Gasten, free and not for sale', () => {
    const cousin = unitDef(COUSIN);
    const light = twisted(STATS['2050'].light, FACTIONS.gasten.temper.light);
    expect(cousin).toMatchObject({ role: 'light', summoned: true, cost: 0, bounty: 0, hp: light.hp, dmg: light.dmg, speed: light.speed });
    expect(eraOf('gasten', ERA.y2050).units.map((u) => u.id)).not.toContain(COUSIN);
  });

  it('brings four cousins out at the gate, as fast as the rows make room', () => {
    const s = setup(ERA.y2050);
    rich(s, 0);
    const events = act(s, 0, { t: 'special' });
    expect(events).toContainEqual({ t: 'summoned', side: 0, count: SPECIAL.familieApp.count, ticks: 0 });
    // Three rows: three at once, the fourth when a row has room again.
    expect(cousins(s, 0)).toHaveLength(3);
    run(s, 60);
    expect(cousins(s, 0)).toHaveLength(SPECIAL.familieApp.count);
    expect(s.sides[0].arrivals).toEqual([]);
  });

  it('brings them also when the ranks are full, and before anyone in training', () => {
    const s = setup(ERA.y2050);
    rich(s, 0);
    for (let i = 0; i < UNIT_CAP; i++) place(s, 0, 'gs.2050.light', px(400) + px(60) * i, 1_000_000, i % 3);
    s.sides[0].queue.push({ def: 'gs.2050.ranged', left: 0 });
    act(s, 0, { t: 'special' });
    const spawned: string[] = [];
    for (const e of run(s, 120)) if (e.t === 'spawn') spawned.push(e.def);
    expect(cousins(s, 0)).toHaveLength(SPECIAL.familieApp.count);
    expect(s.sides[0].units.length).toBe(UNIT_CAP + SPECIAL.familieApp.count);
    // The one in training waits: the ranks are over the cap now, and it would have come after the family anyway.
    expect(spawned.filter((d) => d !== COUSIN)).toEqual([]);
    expect(s.sides[0].queue).toHaveLength(1);
  });

  it('pays nothing when a cousin is beaten, and nobody learns from it', () => {
    const s = setup(ERA.y2050);
    place(s, 0, COUSIN, px(600), 1);
    place(s, 1, 'ah.2050.heavy', px(600) - px(10), 1_000_000);
    const before = [s.sides[0].progress, s.sides[1].progress];
    const gold = [s.sides[0].gold, s.sides[1].gold];
    const events = run(s, 60);
    expect(events.some((e) => e.t === 'defeat' && e.def === COUSIN)).toBe(true);
    expect(events.filter((e): e is Extract<SimEvent, { t: 'gold' }> => e.t === 'gold')).toEqual([]);
    // Time teaches both sides the same; the fight taught nobody anything.
    expect(s.sides[0].progress - before[0]!).toBe(s.sides[1].progress - before[1]!);
    expect(s.sides[0].gold - gold[0]!).toBe(s.sides[1].gold - gold[1]!);
    expect(PROGRESS.killPercent).toBeGreaterThan(0);
  });

  it('plays out the same with the seats swapped', () => {
    const outcome = (gastenSide: Side) => {
      const s = setup(ERA.y2050, gastenSide);
      const foe = gastenSide === 0 ? 1 : 0;
      rich(s, gastenSide);
      place(s, foe, 'ah.2050.light', px(500), undefined, 0);
      place(s, foe, 'ah.2050.heavy', px(450), undefined, 1);
      act(s, gastenSide, { t: 'special' });
      run(s, 300);
      return {
        mine: s.sides[gastenSide].units.map((u) => [u.def, u.row, u.pos, u.hp]),
        theirs: s.sides[foe].units.map((u) => [u.def, u.row, u.pos, u.hp]),
      };
    };
    expect(outcome(1)).toEqual(outcome(0));
  });
});
