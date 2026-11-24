import { LANE, ROWS } from '../defs/balance.ts';
import { unitDef } from '../defs/index.ts';
import { unitDamagePercent } from './overtime.ts';
import { posed } from './tourists.ts';
import { BASE, SIDES, other, type Damage, type Rider, type Side, type SimEvent, type SimState, type Unit } from './types.ts';

/**
 * Riders: the fatbike of De Gasten. The owner's rule of 23 November 2026, in
 * docs/factions.md, section 8:
 *
 * - It is trained in the queue like any unit, but leaves the gate as a rider,
 *   not into the ranks. One per side on the lane at a time; a second one waits
 *   at the gate, trained. It does not count towards the unit cap.
 * - It rides through every enemy unit on its way that does not draw turret
 *   fire, nearest first. Each takes its ram damage and gives it one blow back:
 *   what the unit's own strike would do now, unless it is stunned. Its hit
 *   points count down as it goes, so it stops at the unit that beats it. What
 *   it beats on the way earns its side the bounty, as any kill does.
 * - A unit that draws turret fire is a door. A schild goes down with it,
 *   whatever it had left; a super unit takes the ram damage and stays. Either
 *   way the rider is beaten, and the other side earns its bounty.
 * - If it reaches the enemy gate it rides into the base, which takes its base
 *   damage, and it is gone. Nobody earns anything for that.
 * - Enemy turrets fire at it before anything else (see fireTurrets in step.ts).
 *   Enemy specials do not touch it, and its own side's buffs do not speed it up.
 *   Overtime makes its ram and base damage grow, as it does every unit's blows.
 * - Riders coming from both sides pass each other.
 * - A unit that is posing (sim/tourists.ts) gives a softer blow back, and
 *   Influencer-Ivy, who throws nothing, gives none.
 *
 * Mirrored like everything on the lane: its position is its distance from its
 * own gate, it meets an enemy unit when LANE minus both positions reaches zero,
 * and what it does to the enemy goes onto the damage list, which lands at the
 * end of the tick. Its own hit points are its own side's business.
 */

/** Riders pass in front of the ranks: they are drawn in the row nearest the viewer. Looks only. */
export const RIDER_ROW = ROWS - 1;

/** Sends a trained rider out of the gate. False while this side still has one on the lane: then it waits. */
export function sendRider(s: SimState, side: Side, def: string, events: SimEvent[]): boolean {
  const me = s.sides[side];
  if (me.riders.length > 0) return false;
  const rider: Rider = { id: s.nextId++, def, row: RIDER_ROW, pos: 0, prevPos: 0, hp: unitDef(def).hp, passed: [], arrived: false };
  me.riders.push(rider);
  events.push({ t: 'spawn', side, id: rider.id, def });
  return true;
}

/** The blow unit `u` of `side` gives a rider that rides through it: what its own strike would do right now. */
function blowBack(s: SimState, side: Side, u: Unit): number {
  if (u.stunUntil > s.tick) return 0; // standing watching something else, it does not even see it go by
  const me = s.sides[side];
  const def = unitDef(u.def);
  if (def.poser) return 0; // she films it going by
  const fired = me.buffUntil > s.tick ? Math.floor((def.dmg * me.buffDmgPercent) / 100) : def.dmg;
  return posed(u, Math.floor((fired * unitDamagePercent(s.tick)) / 100));
}

/** The foremost rider of `riders` that a turret reaching `range` from its gate can hit, if any. */
export function riderInReach(riders: readonly Rider[], range: number): Rider | undefined {
  let best: Rider | undefined;
  for (const r of riders) {
    if (LANE - r.pos > range) continue;
    if (!best || r.pos > best.pos || (r.pos === best.pos && r.id < best.id)) best = r;
  }
  return best;
}

/** Moves every rider, after the units have moved. */
export function advanceRiders(s: SimState, dmg: Damage[], events: SimEvent[]): void {
  const percent = unitDamagePercent(s.tick);
  for (const side of SIDES) {
    const foe = other(side);
    const them = s.sides[foe].units;
    for (const r of s.sides[side].riders) {
      r.prevPos = r.pos;
      const def = unitDef(r.def);
      const ram = Math.floor((def.dmg * percent) / 100);
      const next = Math.min(r.pos + def.speed, LANE);
      // The enemy units it reaches on this stretch, nearest first.
      const met = them
        .filter((u) => !r.passed.includes(u.id) && LANE - u.pos <= next)
        .sort((a, b) => b.pos - a.pos || a.id - b.id);
      let stopped = false;
      for (const u of met) {
        const at = Math.max(r.pos, LANE - u.pos);
        const theirs = unitDef(u.def);
        if (theirs.drawsFire) {
          // A door. A schild goes down with it; a super unit takes the knock and walks on.
          dmg.push({ side: foe, unit: u.id, amount: theirs.role === 'super' ? ram : u.hp });
          events.push({ t: 'crashed', side, id: r.id, foe: u.id, pos: at });
          r.hp = 0;
          r.pos = at;
          stopped = true;
          break;
        }
        r.passed.push(u.id);
        dmg.push({ side: foe, unit: u.id, amount: ram });
        events.push({ t: 'rammed', side, id: r.id, foe: u.id, pos: at });
        r.hp -= blowBack(s, foe, u);
        if (r.hp <= 0) {
          r.pos = at;
          stopped = true;
          break;
        }
      }
      if (stopped) continue;
      r.pos = next;
      if (next >= LANE) {
        const amount = Math.floor((def.rider!.baseDmg * percent) / 100);
        dmg.push({ side: foe, unit: BASE, amount });
        events.push({ t: 'arrived', side, id: r.id, amount });
        r.arrived = true;
      }
    }
  }
}
