import { SUBSIDY } from '../defs/balance.ts';
import { eraOf, unitDef } from '../defs/index.ts';
import type { Role } from '../defs/types.ts';
import { canDo, subsidyCost, turretPlan } from '../sim/commands.ts';
import { nextRng, rngValue } from '../sim/rng.ts';
import { other, type Command, type Side, type SimState } from '../sim/types.ts';

/**
 * Scripted players, used only by tests and the balance script. A bot looks at
 * the match and returns at most one command. The product itself has no AI opponent.
 */
export type Bot = (s: SimState, side: Side) => Command | null;

const BUY: Record<Role, Command> = {
  light: { t: 'buy', slot: 0 },
  ranged: { t: 'buy', slot: 1 },
  heavy: { t: 'buy', slot: 2 },
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
      worth = foe.units.length >= 4 || foe.units.some((u) => unitDef(u.def).role === 'heavy');
      break;
    case 'stun':
      worth = foe.units.length >= 3 && fighting >= 2;
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
  /** The order in which it buys units, over and over. */
  units: Role[];
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
    // Modernizing costs nothing but the vooruitgang that has been gathered, so take it when it is there.
    if (style.modernizes && canDo(s, side, ERA_UP)) return ERA_UP;

    const me = s.sides[side];
    const foe = s.sides[other(side)];
    const mine = me.units.length + me.queue.length;
    const pressed = foe.units.length > mine;

    if (!pressed && mine >= style.guard) {
      // Money first, then defences. While it is close to affording the next
      // step it stops buying units, as a person saving up would.
      const eco = Math.min(SUBSIDY.cost.length, style.eco + me.era);
      const ecoCost = subsidyCost(s, side);
      if (me.subsidy < eco && ecoCost !== null) {
        if (me.gold >= ecoCost) return SUBSIDY_CMD;
        if (me.gold * 2 >= ecoCost) return null;
      }
      const plan = style.turrets ? turretPlan(s, side) : null;
      if (plan && me.gold >= plan.cost) return TURRET;
    }

    const cmd = tryCmd(s, side, BUY[style.units[bought % style.units.length]!]);
    if (cmd) bought++;
    return cmd;
  };
}

/** Presses random buttons. Finds the situations a sensible player would never create. */
export function random(seed: number): Bot {
  let state = seed >>> 0;
  const options: Command[] = [BUY.light, BUY.ranged, BUY.heavy, BUY.light, BUY.ranged, TURRET, SPECIAL, ERA_UP, SUBSIDY_CMD];
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
  swarm: () => brain({ units: ['light', 'light', 'ranged'], eco: 0, modernizes: true, turrets: false, guard: 99 }),
  /** One unit up front, ranged behind it. */
  archers: () => brain({ units: ['light', 'ranged', 'ranged', 'ranged'], eco: 1, modernizes: true, turrets: false, guard: 4 }),
  /** Saves for heavies. */
  heavies: () => brain({ units: ['heavy'], eco: 1, modernizes: true, turrets: false, guard: 1 }),
  /** Defences and a firing line. */
  turtle: () => brain({ units: ['light', 'ranged', 'ranged'], eco: 2, modernizes: true, turrets: true, guard: 3 }),
  /** A bit of everything. */
  mixed: () => brain({ units: ['light', 'ranged', 'light', 'ranged', 'heavy'], eco: 1, modernizes: true, turrets: true, guard: 4 }),
  /** Subsidie first, everything else later. */
  banker: () => brain({ units: ['light', 'ranged', 'ranged'], eco: 4, modernizes: true, turrets: true, guard: 2 }),
};

/** A sensible all-rounder, for tests that need two identical players. */
export const mixed = BOTS.mixed!;
