import { BASE_GAP, CONTACT_GAP, LANE, ROW_ORDER } from '../defs/balance.ts';
import { unitDef } from '../defs/index.ts';
import type { SpecialDef } from '../defs/types.ts';
import { byToughness, frontUnit, insertInRow, slotIn } from './lane.ts';
import { BASE, SIDES, other, type Barrage, type Damage, type Side, type SimEvent, type SimState, type Unit, type Wave } from './types.ts';

/** The units a special can do something to: everyone except those that shrug specials off. */
function touchable(units: readonly Unit[]): Unit[] {
  return units.filter((u) => !unitDef(u.def).immune);
}

/**
 * Sets a special going. Anything that hurts goes onto `dmg` and lands at the
 * end of the tick with all other damage; flags and healing apply at once. That
 * way two specials used on the same tick never depend on which side is "first".
 */
export function startSpecial(s: SimState, side: Side, def: SpecialDef, events: SimEvent[], dmg: Damage[]): void {
  const me = s.sides[side];
  const foe = other(side);
  events.push({ t: 'special', side, id: def.id });
  const selfOrTurrets = ['buff', 'heal', 'divert', 'summon', 'hike', 'revive', 'siesta'];
  if (!selfOrTurrets.includes(def.kind)) {
    // Aimed at the enemy's units: whoever shrugs specials off gets to say so.
    const unmoved = s.sides[foe].units.filter((u) => unitDef(u.def).immune).map((u) => u.id);
    if (unmoved.length > 0) events.push({ t: 'shrugged', side: foe, ids: unmoved });
  }
  switch (def.kind) {
    case 'wave':
      s.waves.push({ id: s.nextId++, side, rig: def.rig, pos: 0, prevPos: 0, speed: def.speed, dmg: def.dmg, hit: [] });
      return;
    case 'conga':
      // A wave that hurts nobody: whoever it passes joins the line and dances home (sim/carnaval.ts).
      s.waves.push({ id: s.nextId++, side, rig: def.rig, pos: 0, prevPos: 0, speed: def.speed, dmg: 0, hit: [], conga: def.ticks });
      return;
    case 'blind': {
      // Confetti in their faces: what the enemy units on the lane throw misses for a while (launch() in sim/step.ts).
      const until = s.tick + def.ticks;
      const ids: number[] = [];
      for (const u of touchable(s.sides[foe].units)) {
        u.blindUntil = until;
        ids.push(u.id);
      }
      events.push({ t: 'blinded', side: foe, ids, ticks: def.ticks });
      return;
    }
    case 'slow': {
      // The morning after: the enemy units on the lane crawl, and can still fight.
      const until = s.tick + def.ticks;
      const ids: number[] = [];
      for (const u of touchable(s.sides[foe].units)) {
        u.slowUntil = until;
        u.slowPercent = def.speedPercent;
        ids.push(u.id);
      }
      events.push({ t: 'slowed', side: foe, ids, ticks: def.ticks });
      return;
    }
    case 'stun': {
      const until = s.tick + def.ticks;
      const ids: number[] = [];
      for (const u of touchable(s.sides[foe].units)) {
        u.stunUntil = until;
        ids.push(u.id);
      }
      events.push({ t: 'stunned', side: foe, ids, ticks: def.ticks });
      return;
    }
    case 'buff':
      me.buffUntil = s.tick + def.ticks;
      me.buffDmgPercent = def.dmgPercent;
      me.buffSpeedPercent = def.speedPercent;
      events.push({ t: 'buffed', side, ticks: def.ticks });
      return;
    case 'heal': {
      const ids: number[] = [];
      for (const u of me.units) {
        const full = unitDef(u.def).hp;
        if (u.hp >= full) continue;
        u.hp = Math.min(full, u.hp + Math.round((full * def.healPercent) / 100));
        ids.push(u.id);
      }
      events.push({ t: 'healed', side, ids });
      return;
    }
    case 'barrage':
      s.barrages.push({ id: s.nextId++, side, left: def.strikes, every: def.every, timer: def.every, dmg: def.dmg, rig: def.rig ?? '' });
      return;
    case 'convert': {
      // The toughest enemy unit that can be bought changes sides. It does so at
      // the end of the tick, with the damage, so two takeovers on the same tick
      // do not depend on who pressed first. With nobody for sale it is wasted.
      const target = byToughness(touchable(s.sides[foe].units))[0];
      if (target) dmg.push({ side: foe, unit: target.id, amount: 0, bought: true });
      return;
    }
    case 'divert':
      // From this tick on whatever the enemy earns comes this way. It is a flag
      // on their purse and touches nothing they already have, so two sides
      // that do it to each other on the same tick simply swap earnings.
      s.sides[foe].divertedUntil = s.tick + def.ticks;
      events.push({ t: 'diverted', side: foe, ticks: def.ticks });
      return;
    case 'summon': {
      // The whole family is on its way. They come out at the gate in the
      // economy step, ahead of anyone in training, as rows make room. With a
      // time limit, all of them leave together when it is up (sim/tourists.ts).
      const leaveAt = def.ticks ? s.tick + def.ticks : 0;
      for (let i = 0; i < def.count; i++) me.arrivals.push({ def: def.unit, leaveAt });
      events.push({ t: 'summoned', side, count: def.count, ticks: def.ticks ?? 0 });
      return;
    }
    case 'hike': {
      // A flag on the enemy's prices, read wherever a price is checked and paid
      // (price() in sim/commands.ts). It starts on the next tick, so what either
      // side buys on this one does not depend on which of them is handled first,
      // and two sides that do it to each other both pay more.
      const them = s.sides[foe];
      them.hikeFrom = s.tick + 1;
      them.hikeUntil = s.tick + 1 + def.ticks;
      them.hikePercent = def.pricePercent;
      events.push({ t: 'hiked', side: foe, ticks: def.ticks, percent: def.pricePercent });
      return;
    }
    case 'revive': {
      // The broom wagon picks up whoever dropped out, the most recent first.
      // They come out at the gate in the economy step, as the family of De
      // Familie-app does, and they are themselves again: bought units, with a
      // bounty and everything. With nobody to pick up it is wasted.
      const picked = me.fallen.splice(Math.max(0, me.fallen.length - def.count)).reverse();
      for (const unit of picked) me.arrivals.push({ def: unit, leaveAt: 0 });
      events.push({ t: 'revived', side, count: picked.length });
      return;
    }
    case 'siesta': {
      // A flag on the enemy's turrets, read where they fire (sim/step.ts).
      // Turrets fire after every command of the tick is in, so two sides that
      // do it to each other on the same tick are both silenced at once.
      s.sides[foe].siestaUntil = s.tick + def.ticks;
      events.push({ t: 'siesta', side: foe, ticks: def.ticks });
      return;
    }
    case 'snipe': {
      // The toughest enemy units are cancelled, gone whatever their hit points.
      // They fall at the end of the tick, with the damage, so a heal on the same
      // tick does not save them. With fewer on the lane it cancels whoever is
      // there; with nobody it is wasted.
      for (const u of byToughness(touchable(s.sides[foe].units)).slice(0, def.count)) {
        dmg.push({ side: foe, unit: u.id, amount: 0, cancelled: true });
        events.push({ t: 'sniped', side: foe, id: u.id, pos: u.pos });
      }
      return;
    }
  }
}

/** A wave sweeps from its owner's gate to the enemy gate and hits each enemy unit once on the way. */
export function advanceWaves(s: SimState, dmg: Damage[]): void {
  const keep: Wave[] = [];
  for (const w of s.waves) {
    w.prevPos = w.pos;
    w.pos += w.speed;
    const foe = other(w.side);
    for (const u of touchable(s.sides[foe].units)) {
      if (LANE - w.pos - u.pos <= 0 && !w.hit.includes(u.id)) {
        w.hit.push(u.id);
        dmg.push({ side: foe, unit: u.id, amount: w.dmg, ...(w.conga ? { conga: w.conga } : {}) });
      }
    }
    if (w.pos < LANE) keep.push(w);
  }
  s.waves = keep;
}

/**
 * A barrage strikes the enemy's foremost unit at a steady beat. It passes over
 * units that shrug specials off; with nobody else on the lane it strikes the base.
 */
export function advanceBarrages(s: SimState, dmg: Damage[], events: SimEvent[]): void {
  const keep: Barrage[] = [];
  for (const b of s.barrages) {
    b.timer--;
    if (b.timer <= 0) {
      const foe = other(b.side);
      const target = frontUnit(touchable(s.sides[foe].units));
      dmg.push({ side: foe, unit: target ? target.id : BASE, amount: b.dmg });
      events.push({ t: 'barrageHit', side: foe, id: target ? target.id : BASE, pos: target ? target.pos : 0 });
      b.left--;
      b.timer = b.every;
    }
    if (b.left > 0) keep.push(b);
  }
  s.barrages = keep;
}

/**
 * Units that were bought this tick change sides, all at once. `sold` holds the
 * ids per side that loses them.
 *
 * A bought unit turns round where it stands: what was its back is now its
 * front. It never ends up beyond the line its old side still holds, so one that
 * is bought out of the back ranks comes forward to its new side's front line.
 * There it takes the row with the most room, and it keeps the hit points it had.
 */
export function applyTakeovers(s: SimState, sold: readonly [readonly number[], readonly number[]], events: SimEvent[]): void {
  const moving: { unit: Unit; to: Side; pos: number }[] = [];
  for (const from of SIDES) {
    const list = s.sides[from].units;
    for (const id of sold[from]) {
      const at = list.findIndex((u) => u.id === id);
      if (at < 0) continue; // beaten on this very tick: there is nobody left to buy
      moving.push({ unit: list.splice(at, 1)[0]!, to: other(from), pos: 0 });
    }
  }
  for (const m of moving) {
    const held = frontUnit(s.sides[other(m.to)].units);
    const limit = held ? LANE - held.pos - CONTACT_GAP : LANE - BASE_GAP;
    m.pos = Math.min(LANE - m.unit.pos + unitDef(m.unit.def).len, limit);
  }
  // Two units bought from each other on the same tick would turn their backs on
  // each other. They give way by the same amount until they face each other again.
  const [a, b] = moving;
  if (a && b && a.to !== b.to) {
    const over = a.pos + b.pos - (LANE - CONTACT_GAP);
    if (over > 0) {
      const back = Math.ceil(over / 2);
      a.pos -= back;
      b.pos -= back;
    }
  }
  for (const m of moving) {
    const mine = s.sides[m.to].units;
    const len = unitDef(m.unit.def).len;
    let row = m.unit.row;
    let pos = slotIn(mine, row, m.pos, len);
    for (const r of ROW_ORDER) {
      const there = slotIn(mine, r, m.pos, len);
      if (there > pos) {
        row = r;
        pos = there;
      }
    }
    pos = Math.max(0, pos);
    const u = m.unit;
    u.row = row;
    u.pos = pos;
    u.prevPos = pos;
    u.act = 'idle';
    u.actTick = 0;
    u.stunUntil = 0;
    // Whoever was dancing in a polonaise stops: the line is the other side's now.
    delete u.congaUntil;
    u.turncoat = !u.turncoat;
    insertInRow(mine, u);
    events.push({ t: 'converted', side: m.to, id: u.id, def: u.def, pos });
  }
}
