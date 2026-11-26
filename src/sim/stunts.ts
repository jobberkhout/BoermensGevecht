import { BASE_GAP, FALLEN_KEEP, FOLLOW_GAP, LANE, SHOT_SLACK } from '../defs/balance.ts';
import { unitDef } from '../defs/index.ts';
import type { UnitDef } from '../defs/types.ts';
import { frontUnit } from './lane.ts';
import { SIDES, type Damage, type Shot, type Side, type SimEvent, type SimState, type Unit } from './types.ts';

/**
 * Units that do something their role does not: the owner's of 26 November
 * 2026 (docs/factions.md, section 3, and "Units that do something of their
 * own"). Like everything on the lane they are mirrored: positions are
 * distances from each side's own gate, a unit only ever changes its own
 * side's ranks directly, and what it does to the enemy lands at the end of
 * the tick, with the damage.
 *
 * - The pole vaulter (De Fierljepper): at the first enemy unit it meets it
 *   vaults over it, lands just behind that unit's back and sits dazed. From
 *   there it fights on as anyone does, in the middle of the enemy ranks.
 * - The skater who cannot brake (De Kluner): fast until its first blow, which
 *   hits three times as hard and shoves the enemy back; then it sits dazed.
 * - Sticky throws (Bakker Tjitske): whoever is hit walks and fights at half pace.
 * - Soup (Beppe's Koek-en-zopie): her own units around her get a little back every second.
 * - Returning throws (Padel-Pepijn): an enemy throw that would hit him goes back.
 * - Bouncing throws (Smijtink): a beet bounces on to the unit behind the one it hit.
 */

/** True while a unit is glued with sugar. Units that shrug specials off are never glued. */
export function sticky(s: SimState, u: Unit): boolean {
  return (u.stickyUntil ?? 0) > s.tick;
}

/**
 * How far a walking unit gets in a tick: its speed, at the pace of its side,
 * faster before a skater's crash and to the beat of a big drum, half while
 * glued, a crawl while hung over.
 */
export function walkSpeed(s: SimState, u: Unit, def: UnitDef, pacePercent: number): number {
  let percent = pacePercent;
  if (def.charge && !u.charged) percent = Math.floor((percent * def.charge.speedPercent) / 100);
  if ((u.beatUntil ?? 0) > s.tick) percent = Math.floor((percent * (u.beatPercent ?? 100)) / 100);
  if (sticky(s, u)) percent = Math.floor(percent / 2);
  if ((u.slowUntil ?? 0) > s.tick) percent = Math.floor((percent * (u.slowPercent ?? 100)) / 100);
  return Math.floor((def.speed * percent) / 100);
}

/**
 * The pole vaulter meets its first enemy: it will land just behind that
 * unit's back, at the far end of the lane at most. Only decided here; the leap
 * itself happens in applyVaults, once both sides have looked at the lane.
 */
export function startVault(u: Unit, def: UnitDef, foe: Unit): void {
  if (!def.vault) return;
  const over = LANE - foe.pos + unitDef(foe.def).len + def.vault.gap + def.len;
  u.vaulted = true;
  u.vaultTo = Math.min(LANE - BASE_GAP, Math.max(u.pos, over));
  u.act = 'idle';
  u.actTick = 0;
}

/** Every pole vaulter that took off this tick lands, and sits dazed. */
export function applyVaults(s: SimState, events: SimEvent[]): boolean {
  let any = false;
  for (const side of SIDES) {
    for (const u of s.sides[side].units) {
      if (u.vaultTo === undefined) continue;
      const def = unitDef(u.def);
      const from = u.pos;
      u.pos = u.vaultTo;
      u.prevPos = u.vaultTo;
      delete u.vaultTo;
      u.stunUntil = s.tick + (def.vault?.dazeTicks ?? 0);
      events.push({ t: 'vaulted', side, id: u.id, from, to: u.pos });
      any = true;
    }
  }
  return any;
}

/**
 * A skater's first blow: harder, and it shoves whoever it hits. Returns the
 * damage the blow does. The skater sits dazed afterwards; the shove lands at
 * the end of the tick with the damage.
 */
export function crash(s: SimState, side: Side, u: Unit, def: UnitDef, amount: number, events: SimEvent[]): number {
  if (!def.charge || u.charged) return amount;
  u.charged = true;
  u.stunUntil = s.tick + def.charge.dazeTicks;
  events.push({ t: 'braked', side, id: u.id });
  return Math.floor((amount * def.charge.dmgPercent) / 100);
}

/**
 * Pushes unit `u` back towards its own gate by up to `by`, as far as whoever
 * stands behind it in its row leaves room. It never passes anyone.
 */
export function shoveBack(units: readonly Unit[], u: Unit, by: number): number {
  const len = unitDef(u.def).len;
  let to = Math.max(0, u.pos - by);
  for (const x of units) {
    if (x === u || x.row !== u.row || x.pos > u.pos) continue;
    to = Math.max(to, Math.min(u.pos, x.pos + len + FOLLOW_GAP));
  }
  return to;
}

/** Beppe ladles soup: every so often her own units around her get a little back. A stunned Beppe does not. */
export function serveSoup(s: SimState, side: Side, events: SimEvent[]): void {
  const units = s.sides[side].units;
  for (const cook of units) {
    const soup = unitDef(cook.def).soup;
    if (!soup || cook.stunUntil > s.tick || s.tick % soup.every !== 0) continue;
    const ids: number[] = [];
    for (const u of units) {
      if (u === cook || Math.abs(u.pos - cook.pos) > soup.reach) continue;
      const full = unitDef(u.def).hp;
      if (u.hp >= full) continue;
      u.hp = Math.min(full, u.hp + Math.max(1, Math.floor((full * soup.healPercent) / 100)));
      ids.push(u.id);
    }
    if (ids.length > 0) events.push({ t: 'served', side, id: cook.id, ids });
  }
}

/**
 * A throw is about to hit unit `u` of `side`. If `u` sends throws back and
 * its racket is ready, the throw goes back down the lane, now `side`'s own, and
 * does `u` nothing. Returns the throw that goes back, or null.
 */
export function sendBack(s: SimState, side: Side, u: Unit, shot: Shot, events: SimEvent[]): Shot | null {
  const returns = unitDef(u.def).returns;
  if (!returns || shot.slot >= 0 || (u.returnAt ?? 0) > s.tick || u.stunUntil > s.tick) return null;
  u.returnAt = s.tick + returns.every;
  events.push({ t: 'returned', side, id: u.id, pos: u.pos });
  return {
    ...shot,
    id: s.nextId++,
    side,
    pos: u.pos,
    prevPos: u.pos,
    origin: u.pos,
    dist0: Math.max(1, shot.pos - shot.origin),
    limit: u.pos + (shot.limit - shot.origin),
    src: u.id,
    row: u.row,
    aim: -1,
  };
}

/**
 * A bouncing throw has hit unit `hit` of the enemy: it bounces on to the
 * enemy unit behind it, the foremost of the rest, if that one stands within
 * reach of the first one's back. Returns the throw that bounces on, or null.
 */
export function bounceOn(s: SimState, shot: Shot, units: readonly Unit[], hit: Unit): Shot | null {
  if (!shot.bounce) return null;
  const next = frontUnit(units.filter((u) => u !== hit && u.pos <= hit.pos));
  // Measured from the back of the one it hit: over a long heavy it still reaches whoever is next.
  if (!next || hit.pos - unitDef(hit.def).len - next.pos > shot.bounce.reach) return null;
  const at = LANE - hit.pos;
  return {
    ...shot,
    id: s.nextId++,
    pos: at,
    prevPos: at,
    origin: at,
    dist0: Math.max(1, hit.pos - next.pos),
    limit: LANE - next.pos + SHOT_SLACK,
    dmg: Math.floor((shot.dmg * shot.bounce.dmgPercent) / 100),
    arc: Math.max(20, Math.floor(shot.arc / 2)),
    row: next.row,
    aim: next.id,
    bounce: undefined,
  };
}

/** De Kweekvleesblob grows back: once nobody has hit it for a while, it gets a share of its hit points back every so often. */
export function regrow(s: SimState, side: Side, events: SimEvent[]): void {
  for (const u of s.sides[side].units) {
    const def = unitDef(u.def);
    if (!def.regrows || s.tick % def.regrows.every !== 0 || u.hp >= def.hp || u.hp <= 0) continue;
    if (u.hitAt !== undefined && s.tick - u.hitAt < def.regrows.rest) continue;
    const amount = Math.min(def.hp - u.hp, Math.max(1, Math.floor((def.hp * def.regrows.healPercent) / 100)));
    u.hp += amount;
    events.push({ t: 'mended', side, id: u.id, amount });
  }
}

/**
 * De Vreter eats what it hits. Called once all the damage of the tick has
 * landed: every unit that feeds gets its share of what its blows did, once,
 * and only if it is still standing. Each side's units only heal themselves,
 * so the order of the sides does not matter.
 */
export function feed(s: SimState, dmg: readonly Damage[], events: SimEvent[]): void {
  const eaten = new Map<number, number>();
  for (const d of dmg) if (d.from !== undefined && d.unit >= 0 && d.amount > 0) eaten.set(d.from, (eaten.get(d.from) ?? 0) + d.amount);
  for (const side of SIDES) {
    for (const u of s.sides[side].units) {
      const meal = eaten.get(u.id);
      const feeds = unitDef(u.def).feeds;
      if (meal === undefined || !feeds || u.hp <= 0) continue;
      const amount = Math.min(unitDef(u.def).hp - u.hp, Math.floor((meal * feeds.percent) / 100));
      if (amount <= 0) continue;
      u.hp += amount;
      events.push({ t: 'mended', side, id: u.id, amount });
    }
  }
}

/** A unit of `side` was beaten: remember it, so De Bezemwagen can pick it up. Not one a special called in, and not a super unit. */
export function remember(s: SimState, side: Side, u: Unit): void {
  const def = unitDef(u.def);
  if (def.summoned || def.role === 'super' || def.rider) return;
  const fallen = s.sides[side].fallen;
  fallen.push(def.id);
  if (fallen.length > FALLEN_KEEP) fallen.splice(0, fallen.length - FALLEN_KEEP);
}
