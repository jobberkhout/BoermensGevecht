import { LANE, SUBSIDY, sec } from '../defs/balance.ts';
import { eraOf, turretDef, unitDef } from '../defs/index.ts';
import type { Role } from '../defs/types.ts';
import { canDo, progressNeeded, subsidyCost, turretPlan, unitPrice } from '../sim/commands.ts';
import { frontUnit } from '../sim/lane.ts';
import { kraanDicht } from '../sim/overtime.ts';
import { turretRange } from '../sim/turrets.ts';
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
/**
 * A bot sends a rider only when the enemy has at most this many units on the lane. Sent
 * into every crowd and every schild, as at first, they fed the enemy so much bounty and
 * vooruitgang that De Gasten won one match in five against Amsterdam and the farmers.
 */
const RIDER_GAP = 5;

/** How often a bot gets to act, in ticks: five times a second. People don't press thirty buttons a second either. */
export const THINK_EVERY = 6;
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
    case 'divert': {
      // What the enemy earns for beating a unit comes this way while it lasts.
      // So a player waits until one of their own big units is about to go down,
      // the Gouden Handdruk above all, and then the fee pays for most of it.
      // Once it has waited a while for that, it takes the income and whatever
      // falls in the fight at hand.
      const falling = me.units.some((u) => {
        const def = unitDef(u.def);
        return (def.role === 'super' || def.role === 'heavy') && u.hp * 4 <= def.hp;
      });
      const waited = s.tick - me.specialReadyAt >= sec(20);
      worth = falling || (waited && (fighting >= 1 || foe.units.some((u) => u.act === 'attack')));
      break;
    }
    case 'buff':
      worth = fighting >= 2;
      break;
    case 'summon':
      // The family comes for a fight worth joining, or when the gate is nearly bare.
      worth = foe.units.length >= 3 || (foe.units.length >= 1 && me.units.length <= 1);
      break;
    case 'hike': {
      // Best just before the enemy has to spend a lot: when it could modernize,
      // or sits on enough for a heavy unit. Once it has waited a while for that,
      // it does it anyway: twenty seconds of double prices always slow them down.
      const needed = progressNeeded(s, other(side));
      const modernizing = needed !== null && foe.progress >= needed;
      const heavy = eraOf(foe.faction, foe.era).units[2]!;
      const waited = s.tick - me.specialReadyAt >= sec(15);
      worth = modernizing || foe.gold >= heavy.cost || waited;
      break;
    }
    case 'revive':
      // The broom wagon is worth it once a few have dropped out, or after a while for whoever there is.
      worth = me.fallen.length >= 3 || (me.fallen.length >= 1 && s.tick - me.specialReadyAt >= sec(15));
      break;
    case 'siesta': {
      // Best when the enemy's turrets are what holds the army up: some of it stands in their reach.
      let reach = 0;
      for (const t of foe.turrets) if (t) reach = Math.max(reach, turretRange(turretDef(t.def), t.level));
      worth = reach > 0 && me.units.filter((u) => u.pos >= LANE - reach).length >= 2;
      break;
    }
    case 'rush':
      // Rolling up the sleeves pays when there is something in the queue to be ready at once.
      worth = me.queue.length >= 2 || (me.queue.length >= 1 && s.tick - me.specialReadyAt >= sec(15));
      break;
    case 'block': {
      // The container: when the enemy is about to reach the base, or in a fight with a crowd under it.
      const theirs = frontUnit(foe.units);
      worth = theirs !== undefined && (theirs.pos >= (LANE * 6) / 10 || (foe.units.length >= 3 && fighting >= 2));
      break;
    }
    case 'shelter':
      // The storm barrier: for a fight that is on.
      worth = fighting >= 2 && foe.units.length >= 2;
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
      if (big && !has) return me.gold >= unitPrice(s, side, big) ? BUY.super : null;
      const plan = style.turrets ? turretPlan(s, side) : null;
      if (plan && me.gold >= plan.cost) return TURRET;
    }

    // Turrets on the other side: one schild goes along with the army to take their fire.
    // A schild is also the door that stops a rider, so against a side that can send one it keeps one out too.
    const schild = eraOf(me.faction, me.era).units[3];
    const riders = foe.riders.length > 0 || eraOf(foe.faction, foe.era).units.some((u) => u.rider);
    if (style.shields && schild?.role === 'shield' && (foe.turrets.some((t) => t !== null) || riders) && mine >= 2) {
      const out = me.units.some((u) => u.def === schild.id) || me.queue.some((q) => q.def === schild.id);
      if (!out && canDo(s, side, BUY.shield)) return BUY.shield;
    }

    let role = style.units[bought % style.units.length]!;
    // A ranged unit that poses the enemy (Influencer-Ivy) does no damage, and a second one in
    // reach adds nothing: with one out or in training, a light unit goes instead.
    const thrower = eraOf(me.faction, me.era).units[1];
    if (role === 'ranged' && thrower?.poser && [...me.units, ...me.queue].some((u) => u.def === thrower.id)) role = 'light';
    // A rider is sent when it can get through: no door on the lane to crash into, and only a few
    // enemies to ride past. Otherwise it is skipped this round, as a person would. One at a time.
    const def = eraOf(me.faction, me.era).units.find((u) => u.role === role);
    if (def?.rider) {
      const waiting = me.riders.length > 0 || me.queue.some((q) => unitDef(q.def).rider);
      const door = foe.units.some((u) => unitDef(u.def).drawsFire);
      if (waiting || door || foe.units.length > RIDER_GAP) {
        bought++;
        return null;
      }
    }
    const cmd = tryCmd(s, side, BUY[role]);
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

/**
 * The computer, for someone who plays alone: it takes one side of the title
 * card and plays a bit of everything, as the owner asked on 24 November 2026
 * ("make it play mixed and as good as possible").
 *
 * Found by bot matches over every pair of factions, both seats: 448 mixed
 * styles against the bots above, the best of them varied again and played
 * against each other. What wins is subsidie early (four applications in the
 * first era), a light guard of two before saving, a firing line of mostly
 * ranged units behind a light one and a heavy, turrets, and the super unit.
 * It beats the bots above in 99 matches out of 100 with every faction; the
 * mixed bot it replaces as the opponent won 62 of 100. People are another
 * matter: it was tuned against bots only.
 */
export const COMPUTER_STYLE: Style = { units: ['ranged', 'light', 'ranged', 'heavy', 'ranged'], supers: true, eco: 4, modernizes: true, turrets: true, guard: 2, shields: true };
export const computerPlayer = (): Bot => brain(COMPUTER_STYLE);
