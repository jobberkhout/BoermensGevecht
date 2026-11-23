import { describe, expect, it } from 'vitest';
import { BOTS } from '../src/bots/bots.ts';
import { CONTACT_GAP, INCOME_EVERY, LANE, PROGRESS, SPECIAL, SUBSIDY, TPS, px } from '../src/defs/balance.ts';
import { eraOf, unitDef } from '../src/defs/index.ts';
import type { FactionId } from '../src/defs/types.ts';
import type { Side, SimState } from '../src/sim/types.ts';
import { NL } from '../src/ui/nl.ts';
import { ERA, SUPER, act, match, place, run } from './helpers.ts';

const TICKS = SPECIAL.succesfee.ticks;
/** How many times the regular income comes in while the special lasts. */
const PAYMENTS = TICKS / INCOME_EVERY;

/** De Zuidas of 2050 on the left with its special ready, a little way into a match. */
function zuidas(against: FactionId = 'achterhoek'): SimState {
  const s = match(['zuidas', against]);
  s.sides[0].era = ERA.y2050;
  s.sides[0].specialReadyAt = 0;
  // Not on a tick that pays out, so the count of payments is the same wherever the special starts.
  s.tick = 1000;
  return s;
}

/** A unit of `side` that is beaten by the first blow of an enemy standing in front of it. Returns the ticks until that blow. */
function doomed(s: SimState, side: Side, victim: string, killer: string): number {
  const foe = side === 0 ? 1 : 0;
  place(s, side, victim, LANE / 2, 1);
  place(s, foe, killer, LANE / 2 - CONTACT_GAP, 1_000_000);
  return 1 + unitDef(killer).windup;
}

describe('De Succesfee', () => {
  it('is what De Zuidas of 2050 has, and lasts a whole number of paydays', () => {
    const special = eraOf('zuidas', ERA.y2050).special;
    expect(special.kind).toBe('divert');
    expect(TICKS % INCOME_EVERY).toBe(0);
    expect(PAYMENTS).toBeGreaterThanOrEqual(5);
  });

  it('says in its description how long it lasts', () => {
    const words: Record<number, string> = { 3: 'drie', 4: 'vier', 5: 'vijf', 6: 'zes', 7: 'zeven', 8: 'acht', 10: 'tien' };
    expect(NL.blurbs['za.2050.special']!.toLowerCase()).toContain(`${words[TICKS / TPS]} tellen`);
  });

  it('for as long as it lasts the enemy income is paid to De Zuidas, on top of its own', () => {
    const s = zuidas();
    s.sides[1].subsidy = 2;
    const mine = SUBSIDY.income[0];
    const theirs = SUBSIDY.income[2];
    const before = [s.sides[0].gold, s.sides[1].gold];

    const events = [...act(s, 0, { t: 'special' }), ...run(s, TICKS - 1)];
    expect(s.sides[0].gold).toBe(before[0]! + PAYMENTS * (mine + theirs));
    expect(s.sides[1].gold).toBe(before[1]!);
    expect(events.filter((e) => e.t === 'diverted')).toEqual([{ t: 'diverted', side: 1, ticks: TICKS }]);
    const skimmed = events.filter((e) => e.t === 'skimmed');
    expect(skimmed).toHaveLength(PAYMENTS);
    expect(skimmed[0]).toEqual({ t: 'skimmed', side: 0, amount: theirs });
  });

  it('is over exactly on time: the next payday is the enemy’s again', () => {
    const s = zuidas();
    act(s, 0, { t: 'special' });
    run(s, TICKS - 1);
    const before = [s.sides[0].gold, s.sides[1].gold];
    const events = run(s, INCOME_EVERY);
    expect(s.sides[0].gold).toBe(before[0]! + SUBSIDY.income[0]);
    expect(s.sides[1].gold).toBe(before[1]! + SUBSIDY.income[0]);
    expect(events.some((e) => e.t === 'skimmed')).toBe(false);
  });

  it('leaves what the enemy already has alone, and what they spend', () => {
    const s = zuidas();
    s.sides[1].gold = 5000;
    act(s, 0, { t: 'special' });
    expect(s.sides[1].gold).toBe(5000);
    // They can still buy with it.
    act(s, 1, { t: 'buy', slot: 0 });
    expect(s.sides[1].gold).toBe(5000 - unitDef('ah.1975.light').cost);
  });

  it('pays De Zuidas the bounty for its own unit when the enemy beats it', () => {
    const s = zuidas();
    act(s, 0, { t: 'special' });
    const before = [s.sides[0].gold, s.sides[1].gold];
    const victim = unitDef('za.2050.heavy');
    const events = run(s, doomed(s, 0, victim.id, 'ah.1975.light'));

    expect(s.sides[0].units).toHaveLength(0);
    expect(s.sides[0].gold - before[0]!).toBe(victim.bounty);
    expect(s.sides[1].gold - before[1]!).toBe(0);
    // The coin that floats up belongs to De Zuidas, and says where it came from.
    const gold = events.filter((e) => e.t === 'gold');
    expect(gold).toEqual([{ t: 'gold', side: 0, amount: victim.bounty, pos: LANE / 2, diverted: true }]);
  });

  it('diverts money only: the enemy still learns from the fight', () => {
    const s = zuidas();
    act(s, 0, { t: 'special' });
    const victim = unitDef('za.2050.heavy');
    const progress = [s.sides[0].progress, s.sides[1].progress];
    run(s, doomed(s, 0, victim.id, 'ah.1975.light'));
    expect(s.sides[1].progress - progress[1]!).toBe(Math.floor((victim.cost * PROGRESS.killPercent) / 100));
    expect(s.sides[0].progress - progress[0]!).toBe(Math.floor((victim.cost * PROGRESS.lossPercent) / 100));
  });

  it('leaves alone what De Zuidas earns itself', () => {
    const s = zuidas();
    act(s, 0, { t: 'special' });
    const before = [s.sides[0].gold, s.sides[1].gold];
    const victim = unitDef('ah.1975.heavy');
    const events = run(s, doomed(s, 1, victim.id, 'za.2050.light'));
    expect(s.sides[0].gold - before[0]!).toBe(victim.bounty);
    expect(s.sides[1].gold - before[1]!).toBe(0);
    expect(events.filter((e) => e.t === 'gold')).toEqual([{ t: 'gold', side: 0, amount: victim.bounty, pos: LANE / 2 }]);
  });

  it('without the special a bounty goes to whoever beat the unit', () => {
    const s = zuidas();
    const before = [s.sides[0].gold, s.sides[1].gold];
    const victim = unitDef('za.2050.heavy');
    run(s, doomed(s, 0, victim.id, 'ah.1975.light'));
    expect(s.sides[0].gold - before[0]!).toBe(0);
    expect(s.sides[1].gold - before[1]!).toBe(victim.bounty);
  });

  it('is not aimed at units, so a super unit has nothing to shrug off', () => {
    const s = zuidas();
    place(s, 1, SUPER.ah, px(300));
    const events = act(s, 0, { t: 'special' });
    expect(events.some((e) => e.t === 'shrugged')).toBe(false);
    expect(s.sides[1].divertedUntil).toBe(1000 + TICKS);
  });

  it('two sides that do it to each other swap what they earn, whoever is on the left', () => {
    const play = (levels: [number, number]): [number, number] => {
      const s = zuidas('zuidas');
      s.sides[1].era = ERA.y2050;
      s.sides[1].specialReadyAt = 0;
      s.sides[0].subsidy = levels[0];
      s.sides[1].subsidy = levels[1];
      const before = [s.sides[0].gold, s.sides[1].gold];
      run(s, 1, [
        { tick: s.tick, side: 0, cmd: { t: 'special' } },
        { tick: s.tick, side: 1, cmd: { t: 'special' } },
      ]);
      // And each loses a unit to the other while it lasts: the bounty comes back to its owner.
      place(s, 0, 'za.2050.heavy', LANE / 2 - CONTACT_GAP, 1);
      place(s, 1, 'za.2050.heavy', LANE / 2, 1);
      run(s, TICKS - 1);
      return [s.sides[0].gold - before[0]!, s.sides[1].gold - before[1]!];
    };
    const bounty = unitDef('za.2050.heavy').bounty;
    const [left, right] = play([1, 4]);
    expect(left).toBe(PAYMENTS * SUBSIDY.income[4] + bounty);
    expect(right).toBe(PAYMENTS * SUBSIDY.income[1] + bounty);
    // The same with the seats swapped.
    expect(play([4, 1])).toEqual([right, left]);
  });

  it('a bot uses it once there is a fight to earn from', () => {
    const s = zuidas();
    const bot = BOTS.mixed!();
    // Nothing on the lane yet: nothing to gain beyond the income, so it waits for a better moment.
    s.sides[0].gold = 0;
    expect(bot(s, 0)).toBeNull();
    const mine = place(s, 0, 'za.2050.light', LANE / 2 - CONTACT_GAP);
    place(s, 1, 'ah.1975.light', LANE / 2);
    mine.act = 'attack';
    expect(bot(s, 0)).toEqual({ t: 'special' });
  });
});
