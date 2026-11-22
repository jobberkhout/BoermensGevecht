import { QUEUE_MAX, SUBSIDY, TURRET } from '../defs/balance.ts';
import { FACTIONS, eraOf } from '../defs/index.ts';
import type { TurretDef } from '../defs/types.ts';
import { kraanDicht } from './overtime.ts';
import { startSpecial } from './specials.ts';
import type { Command, Damage, Side, SimEvent, SimState } from './types.ts';

/** What pressing the turret button would do right now. */
export interface TurretPlan {
  how: 'build' | 'replace' | 'upgrade';
  slot: number;
  cost: number;
  /** The turret that will stand there afterwards. */
  def: TurretDef;
  /** Its level afterwards. */
  level: number;
}

/**
 * One button does three things, in this order: fill an empty slot; replace a
 * turret left over from an older era (the oldest first); upgrade the turret
 * with the lowest level. Null when everything is as good as it gets.
 */
export function turretPlan(s: SimState, side: Side): TurretPlan | null {
  const me = s.sides[side];
  const eras = FACTIONS[me.faction].eras;
  const now = eraOf(me.faction, me.era).turret;

  const empty = me.turrets.indexOf(null);
  if (empty >= 0) return { how: 'build', slot: empty, cost: now.cost, def: now, level: 1 };

  let outdated = -1;
  let oldest = me.era;
  me.turrets.forEach((t, slot) => {
    const era = eras.findIndex((e) => e.turret.id === t!.def);
    if (era < oldest) {
      oldest = era;
      outdated = slot;
    }
  });
  if (outdated >= 0) return { how: 'replace', slot: outdated, cost: now.cost, def: now, level: 1 };

  let lowest = -1;
  me.turrets.forEach((t, slot) => {
    if (t!.level < TURRET.maxLevel && (lowest < 0 || t!.level < me.turrets[lowest]!.level)) lowest = slot;
  });
  if (lowest < 0) return null;
  const level = me.turrets[lowest]!.level;
  return {
    how: 'upgrade',
    slot: lowest,
    cost: Math.round((now.cost * TURRET.upgradePercent[level - 1]!) / 100),
    def: now,
    level: level + 1,
  };
}

/** Price of the next "subsidie aanvragen", or null when there is nothing left to apply for. */
export function subsidyCost(s: SimState, side: Side): number | null {
  return SUBSIDY.cost[s.sides[side].subsidy] ?? null;
}

/** Vooruitgang needed to modernize, or null in the last era. */
export function progressNeeded(s: SimState, side: Side): number | null {
  const me = s.sides[side];
  if (me.era + 1 >= FACTIONS[me.faction].eras.length) return null;
  return eraOf(me.faction, me.era).progressNeeded;
}

/** What modernizing costs in subsidie once there is enough vooruitgang, or null in the last era. */
export function eraUpCost(s: SimState, side: Side): number | null {
  const me = s.sides[side];
  if (me.era + 1 >= FACTIONS[me.faction].eras.length) return null;
  return eraOf(me.faction, me.era).eraUpCost;
}

/** The one place that decides whether a command is allowed. The sim, the HUD and the bots all ask here. */
export function canDo(s: SimState, side: Side, cmd: Command): boolean {
  if (s.winner !== null) return false;
  const me = s.sides[side];
  switch (cmd.t) {
    case 'buy': {
      // The fourth button only sells something in the era that has a super unit.
      const def = eraOf(me.faction, me.era).units[cmd.slot];
      return def !== undefined && me.queue.length < QUEUE_MAX && me.gold >= def.cost;
    }
    case 'turret': {
      const plan = turretPlan(s, side);
      return plan !== null && me.gold >= plan.cost;
    }
    case 'special':
      return s.tick >= me.specialReadyAt;
    case 'eraUp': {
      // Vooruitgang opens the door; it comes from time and fighting and cannot be
      // bought. Walking through it costs subsidie, which is what makes it a choice.
      const needed = progressNeeded(s, side);
      const cost = eraUpCost(s, side);
      return needed !== null && cost !== null && me.progress >= needed && me.gold >= cost;
    }
    case 'subsidy': {
      // Once the kraan is closed in overtime, more subsidie would buy nothing.
      const cost = subsidyCost(s, side);
      return cost !== null && me.gold >= cost && !kraanDicht(s.tick);
    }
  }
}

/** Carries out a command. Call only after canDo said yes. */
export function applyCommand(s: SimState, side: Side, cmd: Command, events: SimEvent[], dmg: Damage[]): void {
  const me = s.sides[side];
  const era = eraOf(me.faction, me.era);
  switch (cmd.t) {
    case 'buy': {
      const def = era.units[cmd.slot]!;
      me.gold -= def.cost;
      me.queue.push({ def: def.id, left: def.buildTicks });
      return;
    }
    case 'turret': {
      const plan = turretPlan(s, side)!;
      me.gold -= plan.cost;
      if (plan.how === 'upgrade') me.turrets[plan.slot]!.level = plan.level;
      else me.turrets[plan.slot] = { def: plan.def.id, level: 1, cd: plan.def.cooldown };
      events.push({ t: 'turretBuilt', side, slot: plan.slot, how: plan.how, level: plan.level });
      return;
    }
    case 'special': {
      me.specialReadyAt = s.tick + era.special.cooldown;
      startSpecial(s, side, era.special, events, dmg);
      return;
    }
    case 'eraUp': {
      // New units, a new special and a stronger base at once. Units already
      // out, units in training and turrets already built stay as they are.
      me.gold -= eraUpCost(s, side)!;
      me.progress -= progressNeeded(s, side)!; // what was gathered beyond the need counts for the next era
      me.era += 1;
      const next = eraOf(me.faction, me.era);
      const gain = next.baseHp - me.baseMaxHp;
      me.baseMaxHp = next.baseHp;
      me.baseHp += Math.max(0, gain);
      events.push({ t: 'eraUp', side, era: me.era });
      return;
    }
    case 'subsidy': {
      me.gold -= subsidyCost(s, side)!;
      me.subsidy += 1;
      events.push({ t: 'subsidy', side, level: me.subsidy });
      return;
    }
  }
}
