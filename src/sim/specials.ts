import { LANE } from '../defs/balance.ts';
import { unitDef } from '../defs/index.ts';
import type { SpecialDef } from '../defs/types.ts';
import { frontUnit, toughestUnit } from './lane.ts';
import { BASE, other, type Barrage, type Damage, type Side, type SimEvent, type SimState, type Wave } from './types.ts';

/**
 * Sets a special going. Anything that hurts goes onto `dmg` and lands at the
 * end of the tick with all other damage; flags and healing apply at once. That
 * way two specials used on the same tick never depend on which side is "first".
 */
export function startSpecial(s: SimState, side: Side, def: SpecialDef, events: SimEvent[], dmg: Damage[]): void {
  const me = s.sides[side];
  const foe = other(side);
  events.push({ t: 'special', side, id: def.id });
  switch (def.kind) {
    case 'wave':
      s.waves.push({ id: s.nextId++, side, rig: def.rig, pos: 0, prevPos: 0, speed: def.speed, dmg: def.dmg, hit: [] });
      return;
    case 'stun': {
      const until = s.tick + def.ticks;
      const ids: number[] = [];
      for (const u of s.sides[foe].units) {
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
    case 'snipe': {
      const target = toughestUnit(s.sides[foe].units);
      if (!target) return; // nobody to cancel: the special is wasted
      dmg.push({ side: foe, unit: target.id, amount: def.dmg });
      events.push({ t: 'sniped', side: foe, id: target.id, pos: target.pos });
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
    for (const u of s.sides[foe].units) {
      if (LANE - w.pos - u.pos <= 0 && !w.hit.includes(u.id)) {
        w.hit.push(u.id);
        dmg.push({ side: foe, unit: u.id, amount: w.dmg });
      }
    }
    if (w.pos < LANE) keep.push(w);
  }
  s.waves = keep;
}

/** A barrage strikes the enemy's foremost unit at a steady beat, or the base when the lane is empty. */
export function advanceBarrages(s: SimState, dmg: Damage[], events: SimEvent[]): void {
  const keep: Barrage[] = [];
  for (const b of s.barrages) {
    b.timer--;
    if (b.timer <= 0) {
      const foe = other(b.side);
      const target = frontUnit(s.sides[foe].units);
      dmg.push({ side: foe, unit: target ? target.id : BASE, amount: b.dmg });
      events.push({ t: 'barrageHit', side: foe, id: target ? target.id : BASE, pos: target ? target.pos : 0 });
      b.left--;
      b.timer = b.every;
    }
    if (b.left > 0) keep.push(b);
  }
  s.barrages = keep;
}
