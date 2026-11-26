import { LANE, SHOT_SLACK } from '../defs/balance.ts';
import { turretDef, unitDef } from '../defs/index.ts';
import { turretDamagePercent } from './overtime.ts';
import { shoveBack, walkSpeed } from './stunts.ts';
import { turretDamage, turretRange } from './turrets.ts';
import { SIDES, other, type Damage, type Peel, type Shot, type Side, type SimEvent, type SimState, type Unit } from './types.ts';

/**
 * Carnaval's rules, 26 November 2026. The owner asked for units "that do
 * something no other unit does, funny and a bit dumb", for specials of kinds
 * nobody had, and for De Reuzenprins to take over an enemy turret. Which units
 * and how is mine (docs/factions.md, section 2). Like everything on the lane
 * these are mirrored: positions are distances from each side's own gate, a
 * side only ever moves its own units directly, and what it does to the enemy
 * goes onto the damage list and lands at the end of the tick.
 *
 * - De Polonaise (a special): a conga line sweeps the lane, and every enemy
 *   unit it passes dances back towards its own base for a while, without
 *   fighting. The line itself is a wave (sim/specials.ts) that hurts nobody.
 * - Elf Kanonschoten (a special): confetti in the enemy's faces; whatever
 *   their units throw misses for a while (see launch() in sim/step.ts).
 * - De Kater (a special): the enemy's units crawl; they can still fight.
 * - De Grote Trom: every turret shot that bounces off the drum is a boom, and
 *   the band around it marches faster for a moment.
 * - Het Bananenpak: beaten, it leaves its peel on the road, and the first
 *   enemy unit to walk over it slips.
 * - De Zuipwagen: every few seconds it drops the beat, and the enemy units
 *   around it stop fighting to party.
 * - De Reuzenprins: with the key of the city it takes over an enemy turret for
 *   a while, which then fires at its own side's units.
 */

/** True while a unit dances in the enemy's polonaise. */
export function dancing(s: SimState, u: Unit): boolean {
  return (u.congaUntil ?? 0) > s.tick;
}

/** True while a unit has confetti in its eyes, so what it throws misses. */
export function blinded(s: SimState, u: Unit): boolean {
  return (u.blindUntil ?? 0) > s.tick;
}

/**
 * Everyone in the enemy's polonaise dances back towards its own gate at its
 * own pace. Called after the ranks have moved. The hindmost go first, so
 * whoever dances behind them makes room before the next one looks; a dancer
 * never passes anyone of its own in its row, and stops at its own gate.
 */
export function dance(s: SimState): void {
  for (const side of SIDES) {
    const units = s.sides[side].units;
    const dancers = units.filter((u) => dancing(s, u)).sort((a, b) => a.pos - b.pos || a.id - b.id);
    for (const u of dancers) u.pos = shoveBack(units, u, walkSpeed(s, u, unitDef(u.def), 100));
  }
}

/**
 * Turret shots bounced off a big drum this tick: each drum that is still
 * standing booms once, and its own side marches in time. `drums` are the ids
 * of the drums that were hit, per side. Only a side's own units change.
 */
export function boom(s: SimState, drums: readonly [ReadonlySet<number>, ReadonlySet<number>], events: SimEvent[]): void {
  for (const side of SIDES) {
    const units = s.sides[side].units;
    for (const id of drums[side]) {
      const drummer = units.find((u) => u.id === id);
      const drum = drummer ? unitDef(drummer.def).drum : undefined;
      if (!drummer || !drum || drummer.hp <= 0) continue;
      const ids: number[] = [];
      for (const u of units) {
        if (u.hp <= 0 || Math.abs(u.pos - drummer.pos) > drum.reach) continue;
        u.beatUntil = Math.max(u.beatUntil ?? 0, s.tick + drum.ticks);
        u.beatPercent = drum.speedPercent;
        ids.push(u.id);
      }
      events.push({ t: 'boomed', side, id: drummer.id, ids });
    }
  }
}

/** Het Bananenpak of `side` was beaten: its peel stays behind, under where its middle was. */
export function dropPeel(s: SimState, side: Side, u: Unit, events: SimEvent[]): void {
  const def = unitDef(u.def);
  if (!def.peel) return;
  const peel: Peel = {
    id: s.nextId++,
    pos: Math.max(0, u.pos - Math.floor(def.len / 2)),
    row: u.row,
    until: s.tick + def.peel.ticks,
    rig: def.peel.rig,
    dazeTicks: def.peel.dazeTicks,
  };
  s.sides[side].peels.push(peel);
  events.push({ t: 'peeled', side, id: u.id, peel: peel.id, pos: peel.pos });
}

/**
 * Called after everyone has moved. An enemy unit whose front came over a peel
 * this tick, in the peel's row, slips: it lies dazed, which lands at the end of
 * the tick with the damage, and the peel is used up. Of several, the foremost.
 * Super units step over it. A peel nobody stepped on goes when its time is up.
 * Each side's peels only look at the other side's units, and only that side's
 * own list changes, so the order of the sides does not matter.
 */
export function slipOnPeels(s: SimState, dmg: Damage[], events: SimEvent[]): void {
  for (const side of SIDES) {
    const me = s.sides[side];
    if (me.peels.length === 0) continue;
    const foe = other(side);
    const them = s.sides[foe].units;
    const left: Peel[] = [];
    for (const p of me.peels) {
      if (p.until <= s.tick) continue;
      const at = LANE - p.pos;
      let slipper: Unit | undefined;
      for (const u of them) {
        if (u.row !== p.row || unitDef(u.def).immune) continue;
        if (u.prevPos < at && u.pos >= at && (!slipper || u.pos > slipper.pos || (u.pos === slipper.pos && u.id < slipper.id))) slipper = u;
      }
      if (!slipper) {
        left.push(p);
        continue;
      }
      dmg.push({ side: foe, unit: slipper.id, amount: 0, slip: p.dazeTicks });
      events.push({ t: 'slipped', side: foe, id: slipper.id, peel: p.id, ticks: p.dazeTicks });
    }
    me.peels = left;
  }
}

/**
 * De Zuipwagen drops the beat: when its time has come and enemy units stand
 * within reach of its front, every one of them parties for a moment. A
 * stunned or dancing Zuipwagen does not. Super units keep their heads.
 */
export function dropTheBeat(s: SimState, side: Side, u: Unit, events: SimEvent[], dmg: Damage[]): void {
  const party = unitDef(u.def).party;
  if (!party || (u.partyAt ?? 0) > s.tick) return;
  const foe = other(side);
  const near = s.sides[foe].units.filter((f) => !unitDef(f.def).immune && LANE - u.pos - f.pos <= party.reach);
  if (near.length === 0) return;
  u.partyAt = s.tick + party.every;
  for (const f of near) dmg.push({ side: foe, unit: f.id, amount: 0, party: party.ticks });
  events.push({ t: 'dropped', side, id: u.id });
}

/**
 * The key of the city. First every turret whose time is up, or whose prince is
 * no longer on the lane, gets its key back. Then every Reuzenprins that may
 * and that an enemy turret can reach takes over the most upgraded of those, the
 * nearer slot on a tie, one each. Both sides decide on the lane as it stands
 * before either takes anything, so the order of the sides does not matter.
 */
export function passKeys(s: SimState, events: SimEvent[]): void {
  for (const side of SIDES) {
    const thieves = s.sides[other(side)].units;
    s.sides[side].turrets.forEach((t, slot) => {
      if (!t || t.heldBy === undefined) return;
      if ((t.heldUntil ?? 0) > s.tick && thieves.some((u) => u.id === t.heldBy && u.hp > 0)) return;
      delete t.heldBy;
      delete t.heldUntil;
      events.push({ t: 'unkeyed', side, slot });
    });
  }
  const takes = SIDES.map((side) => {
    const out: { unit: Unit; slot: number }[] = [];
    const turrets = s.sides[other(side)].turrets;
    for (const u of s.sides[side].units) {
      const def = unitDef(u.def);
      if (!def.keys || (u.keyAt ?? 0) > s.tick || u.stunUntil > s.tick) continue;
      if (turrets.some((t) => t?.heldBy === u.id)) continue;
      let best = -1;
      turrets.forEach((t, slot) => {
        if (!t || t.heldBy !== undefined || out.some((o) => o.slot === slot)) return;
        if (LANE - u.pos > turretRange(turretDef(t.def), t.level)) return;
        if (best < 0 || t.level > turrets[best]!.level) best = slot;
      });
      if (best >= 0) out.push({ unit: u, slot: best });
    }
    return out;
  });
  for (const side of SIDES) {
    for (const { unit, slot } of takes[side]) {
      const keys = unitDef(unit.def).keys!;
      const t = s.sides[other(side)].turrets[slot]!;
      t.heldBy = unit.id;
      t.heldUntil = s.tick + keys.ticks;
      unit.keyAt = t.heldUntil + keys.rest;
      events.push({ t: 'keyed', side, id: unit.id, slot, ticks: keys.ticks });
    }
  }
}

/**
 * A turret of `side` that the enemy holds fires for them: at `side`'s own
 * unit nearest to its own gate within its reach. Returns the shot, or null.
 */
export function turnedShot(s: SimState, side: Side, slot: number): Shot | null {
  const t = s.sides[side].turrets[slot]!;
  const def = turretDef(t.def);
  const range = turretRange(def, t.level);
  let target: Unit | undefined;
  for (const u of s.sides[side].units) {
    if (u.pos - unitDef(u.def).len > range) continue;
    if (!target || u.pos < target.pos || (u.pos === target.pos && u.id < target.id)) target = u;
  }
  if (!target) return null;
  const at = Math.max(1, target.pos - Math.floor(unitDef(target.def).len / 2));
  return {
    id: s.nextId++,
    side,
    pos: 0,
    prevPos: 0,
    origin: 0,
    dist0: at,
    limit: range + SHOT_SLACK,
    speed: def.shot.speed,
    dmg: Math.floor((turretDamage(def, t.level) * turretDamagePercent(s.tick)) / 100),
    rig: def.shot.rig,
    arc: def.shot.arc,
    spin: def.shot.spin,
    src: -1,
    row: target.row,
    slot,
    aim: target.id,
    turned: true,
  };
}

/**
 * A turned turret's shot flies on. It hits its own side's unit it was aimed
 * at once it reaches the middle of that unit; if that one is gone, it comes
 * down at its limit. Returns true while it is still in the air.
 */
export function flyTurned(s: SimState, shot: Shot, dmg: Damage[]): boolean {
  const target = s.sides[shot.side].units.find((u) => u.id === shot.aim);
  if (target && shot.pos >= target.pos - Math.floor(unitDef(target.def).len / 2)) {
    dmg.push({ side: shot.side, unit: target.id, amount: shot.dmg, turret: true });
    return false;
  }
  return shot.pos <= shot.limit;
}
