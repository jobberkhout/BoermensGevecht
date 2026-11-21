import { QUEUE_MAX } from '../defs/balance.ts';
import { FACTIONS, eraOf } from '../defs/index.ts';
import { startSpecial } from './specials.ts';
import type { Command, Side, SimEvent, SimState } from './types.ts';

/** The one place that decides whether a command is allowed. The sim, the HUD and the bots all ask here. */
export function canDo(s: SimState, side: Side, cmd: Command): boolean {
  if (s.winner !== null) return false;
  const me = s.sides[side];
  const era = eraOf(me.faction, me.era);
  switch (cmd.t) {
    case 'buy':
      return me.queue.length < QUEUE_MAX && me.gold >= era.units[cmd.slot].cost;
    case 'turret':
      return me.turrets.includes(null) && me.gold >= era.turret.cost;
    case 'special':
      return s.tick >= me.specialReadyAt;
    case 'eraUp':
      return (
        era.eraUpCost !== null && me.era + 1 < FACTIONS[me.faction].eras.length && me.gold >= era.eraUpCost
      );
  }
}

/** Carries out a command. Call only after canDo said yes. */
export function applyCommand(s: SimState, side: Side, cmd: Command, events: SimEvent[]): void {
  const me = s.sides[side];
  const era = eraOf(me.faction, me.era);
  switch (cmd.t) {
    case 'buy': {
      const def = era.units[cmd.slot];
      me.gold -= def.cost;
      me.queue.push({ def: def.id, left: def.buildTicks });
      return;
    }
    case 'turret': {
      const slot = me.turrets.indexOf(null);
      me.gold -= era.turret.cost;
      me.turrets[slot] = { def: era.turret.id, cd: era.turret.cooldown };
      events.push({ t: 'turretBuilt', side, slot });
      return;
    }
    case 'special': {
      me.specialReadyAt = s.tick + era.special.cooldown;
      startSpecial(s, side, era.special, events);
      return;
    }
    case 'eraUp': {
      me.gold -= era.eraUpCost ?? 0;
      me.era += 1;
      const next = eraOf(me.faction, me.era);
      const gain = next.baseHp - me.baseMaxHp;
      me.baseMaxHp = next.baseHp;
      me.baseHp += Math.max(0, gain);
      events.push({ t: 'eraUp', side, era: me.era });
      return;
    }
  }
}
