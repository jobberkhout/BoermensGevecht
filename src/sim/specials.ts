import { LANE } from '../defs/balance.ts';
import type { SpecialDef } from '../defs/types.ts';
import { other, type Damage, type Side, type SimEvent, type SimState, type Wave } from './types.ts';

export function startSpecial(s: SimState, side: Side, def: SpecialDef, events: SimEvent[]): void {
  events.push({ t: 'special', side, id: def.id });
  switch (def.kind) {
    case 'wave':
      s.waves.push({
        id: s.nextId++,
        side,
        rig: def.rig,
        pos: 0,
        prevPos: 0,
        speed: def.speed,
        dmg: def.dmg,
        hit: [],
      });
      return;
    case 'stun': {
      const foe = other(side);
      const until = s.tick + def.ticks;
      const ids: number[] = [];
      for (const u of s.sides[foe].units) {
        u.stunUntil = until;
        ids.push(u.id);
      }
      events.push({ t: 'stunned', side: foe, ids, ticks: def.ticks });
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
