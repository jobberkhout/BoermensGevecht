import { LANE, POSE, ROW_ORDER } from '../defs/balance.ts';
import { unitDef } from '../defs/index.ts';
import { insertInRow, slotIn } from './lane.ts';
import { SIDES, other, type Side, type SimEvent, type SimState, type Unit } from './types.ts';

/**
 * Rules that came with De Toeristen, the owner's of 24 November 2026 (in
 * docs/factions.md, section 5). Like everything on the lane they are mirrored:
 * positions are distances from each side's own gate, and nothing here looks at
 * which side is on the left. The beer bikes' tossing, the third, is in
 * decide() in sim/step.ts.
 *
 * - Posing, Influencer-Ivy: she throws nothing. Every enemy unit within her
 *   reach is in her shot and poses for it: its blows and throws do
 *   POSE.dmgPercent of their damage while it is. A unit is in a shot or not,
 *   so two of her change nothing. Super units shrug her off, as they shrug off
 *   specials, and turrets do not pose. A stunned Ivy is not filming.
 * - Scattering, Paraplu-Pam: when a unit that scatters is beaten, by any
 *   cause, its group comes onto the lane where it stood, for the side it was
 *   on. They follow whoever holds the umbrella, so a Pam that De Zuidas bought
 *   scatters on De Zuidas' side. Free, no bounty, whatever the unit cap.
 * - Leaving, the cruise ship's day trippers: a unit with a time to leave is
 *   gone at that tick, back on board, and nobody is paid anything.
 */

/**
 * Works out afresh who is in the shot of an enemy poser, from the lane as it
 * stands. Called once a tick, before anyone decides what to do, so both sides
 * see the same thing whoever is handled first.
 */
export function markPosing(s: SimState): void {
  for (const side of SIDES) {
    const posers = s.sides[other(side)].units.filter((p) => unitDef(p.def).poser && p.stunUntil <= s.tick);
    for (const u of s.sides[side].units) {
      u.posing = posers.length > 0 && !unitDef(u.def).immune && posers.some((p) => LANE - p.pos - u.pos <= unitDef(p.def).range);
    }
  }
}

/** What a blow or throw of `amount` from unit `u` comes to: less while it is posing. */
export function posed(u: Unit, amount: number): number {
  return u.posing ? Math.floor((amount * POSE.dmgPercent) / 100) : amount;
}

/**
 * Unit `fallen` of `side` has just been beaten. If it scatters, its group
 * comes onto the lane where it stood: each one takes the row with the most
 * room there, behind whoever is in the way. Only `side`'s own ranks change.
 */
export function scatterGroup(s: SimState, side: Side, fallen: Unit, events: SimEvent[]): void {
  const scatter = unitDef(fallen.def).scatter;
  if (!scatter) return;
  const mine = s.sides[side].units;
  const group = unitDef(scatter.unit);
  const ids: number[] = [];
  for (let i = 0; i < scatter.count; i++) {
    let row = fallen.row;
    let pos = slotIn(mine, row, fallen.pos, group.len);
    for (const r of ROW_ORDER) {
      const there = slotIn(mine, r, fallen.pos, group.len);
      if (there > pos) {
        row = r;
        pos = there;
      }
    }
    pos = Math.max(0, pos);
    const u: Unit = {
      id: s.nextId++,
      def: group.id,
      row,
      pos,
      prevPos: pos,
      hp: group.hp,
      act: 'idle',
      actTick: 0,
      stunUntil: 0,
      turncoat: fallen.turncoat,
      posing: false,
      leaveAt: 0,
      tossAt: 0,
    };
    insertInRow(mine, u);
    ids.push(u.id);
  }
  events.push({ t: 'scattered', side, ids, pos: fallen.pos });
}

/**
 * The ship's horn: whoever of `side` has a time to leave and has reached it
 * goes back on board, paying nobody anything, and whoever had not come out of
 * the gate yet stays on board. Only `side`'s own ranks change.
 */
export function recall(s: SimState, side: Side, events: SimEvent[]): void {
  const me = s.sides[side];
  const due = (leaveAt: number): boolean => leaveAt > 0 && leaveAt <= s.tick;
  if (me.arrivals.some((a) => due(a.leaveAt))) me.arrivals = me.arrivals.filter((a) => !due(a.leaveAt));
  const leaving = me.units.filter((u) => due(u.leaveAt));
  if (leaving.length === 0) return;
  me.units = me.units.filter((u) => !due(u.leaveAt));
  events.push({ t: 'recalled', side, ids: leaving.map((u) => u.id) });
}
