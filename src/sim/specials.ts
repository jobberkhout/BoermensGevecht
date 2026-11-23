import { BASE_GAP, CONTACT_GAP, FOLLOW_GAP, LANE, ROW_ORDER } from '../defs/balance.ts';
import { unitDef } from '../defs/index.ts';
import type { SpecialDef } from '../defs/types.ts';
import { byToughness, frontUnit } from './lane.ts';
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
  if (def.kind !== 'buff' && def.kind !== 'heal') {
    // Aimed at the enemy: whoever shrugs specials off gets to say so.
    const unmoved = s.sides[foe].units.filter((u) => unitDef(u.def).immune).map((u) => u.id);
    if (unmoved.length > 0) events.push({ t: 'shrugged', side: foe, ids: unmoved });
  }
  switch (def.kind) {
    case 'wave':
      s.waves.push({ id: s.nextId++, side, rig: def.rig, pos: 0, prevPos: 0, speed: def.speed, dmg: def.dmg, hit: [] });
      return;
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
    case 'snipe': {
      // The outrage starts with the toughest enemy unit and works its way down
      // the list until it is spent. With nobody on the lane it is wasted.
      let left = def.dmg;
      for (const u of byToughness(touchable(s.sides[foe].units))) {
        if (left <= 0) break;
        const amount = Math.min(u.hp, left);
        left -= amount;
        dmg.push({ side: foe, unit: u.id, amount });
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
        dmg.push({ side: foe, unit: u.id, amount: w.dmg });
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
 * How far forward a body of this length can stand in a row without overlapping
 * anyone: at `want`, or else queued up behind whoever is in the way.
 */
function slotIn(units: readonly Unit[], row: number, want: number, len: number): number {
  let front = want;
  // Within a row the list runs front to back.
  for (const u of units) {
    if (u.row !== row) continue;
    if (front - len - FOLLOW_GAP >= u.pos) break; // it fits in front of this one, so of everyone behind it too
    front = Math.min(front, u.pos - unitDef(u.def).len - FOLLOW_GAP);
  }
  return front;
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
    u.turncoat = !u.turncoat;
    // Into the list in front of whoever now stands behind it in its row.
    const behind = mine.findIndex((x) => x.row === row && x.pos < pos);
    if (behind < 0) mine.push(u);
    else mine.splice(behind, 0, u);
    events.push({ t: 'converted', side: m.to, id: u.id, def: u.def, pos });
  }
}
