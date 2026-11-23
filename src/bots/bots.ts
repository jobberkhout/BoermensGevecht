import { LANE, SUBSIDY } from '../defs/balance.ts';
import { eraOf, unitDef } from '../defs/index.ts';
import type { Role } from '../defs/types.ts';
import { canDo, progressNeeded, subsidyCost, turretPlan } from '../sim/commands.ts';
import { frontUnit } from '../sim/lane.ts';
import { kraanDicht } from '../sim/overtime.ts';
import { nextRng, rngValue } from '../sim/rng.ts';
import { other, type Command, type Side, type SimState } from '../sim/types.ts';

/**
 * Scripted players, used only by tests and the balance script. A bot looks at
 * the match and returns at most one command. The product itself has no AI opponent.
 */
export type Bot = (s: SimState, side: Side) => Command | null;

/** The fourth button sells the schild in the first two eras and the super unit in the last. */
const FOURTH: Command = { t: 'buy', slot: 3 };
const BUY: Record<Role, Command> = {
  light: { t: 'buy', slot: 0 },
  ranged: { t: 'buy', slot: 1 },
  heavy: { t: 'buy', slot: 2 },
  shield: FOURTH,
  super: FOURTH,
};
const TURRET: Command = { t: 'turret' };
const SPECIAL: Command = { t: 'special' };
const ERA_UP: Command = { t: 'eraUp' };
const SUBSIDY_CMD: Command = { t: 'subsidy' };

function tryCmd(s: SimState, side: Side, cmd: Command): Command | null {
  return canDo(s, side, cmd) ? cmd : null;
}

/** Every bot uses its special the same way: when it would clearly pay off, whatever kind it is. */
function special(s: SimState, side: Side): Command | null {
  if (!canDo(s, side, SPECIAL)) return null;
  const me = s.sides[side];
  const foe = s.sides[other(side)];
  const fighting = me.units.filter((u) => u.act === 'attack').length;
  const kind = eraOf(me.faction, me.era).special.kind;
  let worth = false;
  switch (kind) {
    case 'wave':
    case 'barrage':
      worth = foe.units.length >= 3;
      break;
    case 'snipe':
      worth = foe.units.length >= 3 || foe.units.some((u) => unitDef(u.def).role === 'heavy');
      break;
    case 'convert':
      // Worth it for anything big; a light unit is not worth a takeover.
      worth = foe.units.some((u) => unitDef(u.def).role === 'heavy') || foe.units.length >= 4;
      break;
    case 'stun':
      worth = foe.units.length >= 3 && fighting >= 2;
      break;
    case 'divert':
      // The income comes this way whenever it is used. It pays most while units
      // are being beaten, because the enemy's bounties come along: so in a fight.
      worth = fighting >= 1 || foe.units.some((u) => u.act === 'attack');
      break;
    case 'buff':
      worth = fighting >= 2;
      break;
    case 'heal': {
      let missing = 0;
      let full = 0;
      for (const u of me.units) {
        full += unitDef(u.def).hp;
        missing += unitDef(u.def).hp - u.hp;
      }
      worth = me.units.length >= 2 && missing * 100 >= full * 35;
      break;
    }
  }
  return worth ? SPECIAL : null;
}

export interface Style {
  /** The order in which it buys ordinary units, over and over. */
  units: Exclude<Role, 'shield' | 'super'>[];
  /** In the last era it saves up for a super unit whenever it has none out. */
  supers?: boolean;
  /** Against an enemy with turrets it keeps one schild out, to take their fire. */
  shields?: boolean;
  /** How many times it applies for subsidie in the first era; one more in each later era. */
  eco: number;
  /** False for a bot that stays in the first era whatever happens. */
  modernizes: boolean;
  turrets: boolean;
  /** Units it wants out before it starts saving for anything. */
  guard: number;
}

/** A bot that follows a style: an army recipe plus how greedy it is with money and progress. */
export function brain(style: Style): Bot {
  let bought = 0;
  return (s, side) => {
    const sp = special(s, side);
    if (sp) return sp;
    if (style.modernizes && canDo(s, side, ERA_UP)) return ERA_UP;

    const me = s.sides[side];
    const foe = s.sides[other(side)];
    const mine = me.units.length + me.queue.length;
    const pressed = foe.units.length > mine;

    // Enough vooruitgang but not the money yet: it keeps the purse shut until
    // it can pay, as long as it has a few units out and the enemy is not on
    // its doorstep. That is the choice modernizing asks for: a thinner army
    // now for a better one in a moment.
    const needed = progressNeeded(s, side);
    if (style.modernizes && needed !== null && me.progress >= needed) {
      const theirs = frontUnit(foe.units);
      const safe = !theirs || theirs.pos < (LANE * 6) / 10;
      if (safe && mine >= Math.min(style.guard, 3) && foe.units.length <= mine + 2) return null;
    }

    if (!pressed && mine >= style.guard) {
      // Money first, then defences. While it is close to affording the next
      // step it stops buying units, as a person saving up would.
      const eco = Math.min(SUBSIDY.cost.length, style.eco + me.era);
      const ecoCost = subsidyCost(s, side);
      if (me.subsidy < eco && ecoCost !== null && !kraanDicht(s.tick)) {
        if (me.gold >= ecoCost) return SUBSIDY_CMD;
        if (me.gold * 2 >= ecoCost) return null;
      }
      // The big one. With its guard out and no super unit of its own on the
      // lane, it keeps the purse shut until it can pay for one. That is the
      // real trade: a thin army now for a giant later.
      const fourth = eraOf(me.faction, me.era).units[3];
      const big = style.supers && fourth?.role === 'super' ? fourth : undefined;
      const has = big !== undefined && (me.units.some((u) => u.def === big.id) || me.queue.some((q) => q.def === big.id));
      if (big && !has) return me.gold >= big.cost ? BUY.super : null;
      const plan = style.turrets ? turretPlan(s, side) : null;
      if (plan && me.gold >= plan.cost) return TURRET;
    }

    // Turrets on the other side: one schild goes along with the army to take their fire.
    const schild = eraOf(me.faction, me.era).units[3];
    if (style.shields && schild?.role === 'shield' && foe.turrets.some((t) => t !== null) && mine >= 2) {
      const out = me.units.some((u) => u.def === schild.id) || me.queue.some((q) => q.def === schild.id);
      if (!out && canDo(s, side, BUY.shield)) return BUY.shield;
    }

    const cmd = tryCmd(s, side, BUY[style.units[bought % style.units.length]!]);
    if (cmd) bought++;
    return cmd;
  };
}

/** Presses random buttons. Finds the situations a sensible player would never create. */
export function random(seed: number): Bot {
  let state = seed >>> 0;
  const options: Command[] = [BUY.light, BUY.ranged, BUY.heavy, BUY.light, BUY.ranged, FOURTH, TURRET, SPECIAL, ERA_UP, SUBSIDY_CMD];
  return (s, side) => {
    state = nextRng(state);
    const roll = rngValue(state);
    if (roll % 4 !== 0) return null;
    return tryCmd(s, side, options[(roll >>> 8) % options.length]!);
  };
}

export const BOTS: Record<string, () => Bot> = {
  /** Nothing but the cheapest unit, and it never modernizes. */
  rush: () => brain({ units: ['light'], eco: 0, modernizes: false, turrets: false, guard: 99 }),
  /** Cheap units only, but it does move with the times. */
  swarm: () => brain({ units: ['light', 'light', 'ranged'], eco: 0, modernizes: true, turrets: false, guard: 99, shields: true }),
  /** One unit up front, ranged behind it. */
  archers: () => brain({ units: ['light', 'ranged', 'ranged', 'ranged'], eco: 1, modernizes: true, turrets: false, guard: 4, shields: true }),
  /** Saves for heavies, and for the super unit once there is one. */
  heavies: () => brain({ units: ['heavy'], supers: true, eco: 1, modernizes: true, turrets: false, guard: 1, shields: true }),
  /** Defences and a firing line. */
  turtle: () => brain({ units: ['light', 'ranged', 'ranged'], eco: 2, modernizes: true, turrets: true, guard: 3 }),
  /** A bit of everything, the super unit included. */
  mixed: () => brain({ units: ['light', 'ranged', 'light', 'ranged', 'heavy'], supers: true, eco: 1, modernizes: true, turrets: true, guard: 4, shields: true }),
  /** The same army without ever buying a super unit: the yardstick for how much one is worth. */
  plain: () => brain({ units: ['light', 'ranged', 'light', 'ranged', 'heavy'], eco: 1, modernizes: true, turrets: true, guard: 4, shields: true }),
  /** Subsidie first, everything else later. */
  banker: () => brain({ units: ['light', 'ranged', 'ranged'], supers: true, eco: 4, modernizes: true, turrets: true, guard: 2, shields: true }),
};

/** A sensible all-rounder, for tests that need two identical players. */
export const mixed = BOTS.mixed!;
