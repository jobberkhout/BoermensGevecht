/**
 * Every tunable number in the game lives here.
 *
 * The simulation runs on integers: time in ticks, distance in lane sub-units.
 * Use px(), sec() and pxPerSec() so the tables below read in pixels and seconds.
 */

export const TPS = 30;
/** Lane sub-units per logical pixel. */
export const SUB = 10;

export const px = (n: number): number => Math.round(n * SUB);
export const sec = (n: number): number => Math.round(n * TPS);
export const pxPerSec = (n: number): number => Math.round((n * SUB) / TPS);

// ---- World (logical pixels; the screen is a 1920x1080 stage) ----------------

export const WORLD_W = 1920;
export const WORLD_H = 1080;
/** x of each side's gate: where its units appear and where the enemy stops. */
export const GATE_X: readonly [number, number] = [320, 1600];
/** y of the road the units walk on. The button panels sit below it. */
export const GROUND_Y = 690;
/** Lane length in sub-units. A unit's position is its distance from its own gate. */
export const LANE = px(GATE_X[1] - GATE_X[0]);

// ---- Lane rules -------------------------------------------------------------

/** Closest two opposing units get to each other. Every unit's range must exceed it. */
export const CONTACT_GAP = px(4);
/** Closest a unit gets to the enemy gate. Every unit's range must exceed it. */
export const BASE_GAP = px(6);
/** Space a unit keeps behind the ally in front of it. */
export const FOLLOW_GAP = px(10);
/**
 * With no enemy unit left to shoot at, ranged units walk up this close to the
 * enemy base before they open fire, so the ranks behind them come into range too.
 */
export const SIEGE_REACH = px(44);
/** How far past its range a shot keeps flying before it fizzles. */
export const SHOT_SLACK = px(40);

/** Units march in this many rows. Up to one melee unit per row fights at the front. */
export const ROWS = 3;
/** Which row a new unit prefers when several are equally empty: middle, far, near. */
export const ROW_ORDER: readonly number[] = [1, 0, 2];

export const UNIT_CAP = 10;
export const QUEUE_MAX = 5;
export const TURRET_SLOTS = 2;

/**
 * Overtime: nobody gets to sit a match out.
 *
 * From `at` two things change. The subsidiekraan closes: the regular income
 * stops, so both sides live off their savings and the bounties they earn. And
 * every `every` ticks all units hit `stepPercent` of their normal damage harder
 * than before, on top of the last step. Turrets and specials do not, so
 * defences fall behind, fights are over in a blow or two, and one side breaks
 * through.
 *
 * If even that does not finish it, from `crumbleAt` both bases also lose
 * `crumblePercent` of their full strength every `crumbleEvery` ticks. That ends
 * any match within about a minute; the less damaged base outlasts the other.
 *
 * Measured over 324 bot matches, a quarter reach overtime. With bases that
 * simply crumbled from the start, none of those were decided by play; with
 * harder hits alone about a third are, with the closed kraan as well more than half.
 */
export const OVERTIME = {
  at: sec(10 * 60),
  every: sec(10),
  stepPercent: 20,
  /** Whether the regular income keeps coming in during overtime. Bounties always do. */
  income: false,
  crumbleAt: sec(13 * 60),
  crumbleEvery: sec(1),
  crumblePercent: 1.5,
} as const;

// ---- Money ------------------------------------------------------------------

export const START_GOLD = 150;
export const INCOME_EVERY = sec(1);

/**
 * "Subsidie aanvragen": pay now, earn more for the rest of the match.
 * `income[n]` is what comes in per INCOME_EVERY at level n; `cost[n]` is the
 * price of going from level n to n + 1.
 */
export const SUBSIDY = {
  income: [12, 18, 26, 36, 48, 62],
  cost: [120, 220, 380, 600, 900],
} as const;

// ---- Eras -------------------------------------------------------------------
// Three eras per faction. Modernizing is meant to hurt the side that did not:
// a unit of the next era has well over twice the strength for twice the price.

export const ERA_KEYS = ['1975', '2025', '2050'] as const;
export type EraKey = (typeof ERA_KEYS)[number];

interface EraScale {
  /** Multiplies hit points and damage. */
  power: number;
  /** Multiplies prices and bounties. */
  price: number;
  baseHp: number;
  /** Vooruitgang needed to modernize to the next era; null for the last one. */
  progressNeeded: number | null;
}

const SCALE: Record<EraKey, EraScale> = {
  '1975': { power: 1, price: 1, baseHp: 2500, progressNeeded: 1500 },
  '2025': { power: 2.4, price: 2, baseHp: 5500, progressNeeded: 4200 },
  '2050': { power: 5.6, price: 4, baseHp: 12000, progressNeeded: null },
};

/**
 * Vooruitgang: what a side needs to modernize. It cannot be bought. It comes
 * with time and with fighting, for the winner of a fight and, less, for the
 * loser, so both sides move through the eras and neither is left in the past.
 */
export const PROGRESS = {
  /** Gained every INCOME_EVERY ticks, whatever happens. */
  perInterval: 3,
  /** Gained for beating a unit, as a percentage of its price. */
  killPercent: 50,
  /** Gained for losing a unit, as a percentage of its price. */
  lossPercent: 25,
} as const;

// ---- Stats per role ---------------------------------------------------------
// Both factions use the same numbers for the same role in the same era, so the
// only differences between them are looks, projectiles and specials.

export interface RoleStats {
  cost: number;
  buildTicks: number;
  hp: number;
  /** Sub-units per tick. */
  speed: number;
  /** Body length along the lane. */
  len: number;
  /** Reach measured from the unit's front edge. */
  range: number;
  dmg: number;
  /** Ticks from the start of an attack until it lands. */
  windup: number;
  /** Ticks after the hit before the next attack can start. */
  recover: number;
  /** Subsidie the opponent earns for beating this unit. */
  bounty: number;
  /** A melee blow hits every enemy unit within reach instead of only the foremost. */
  cleave?: boolean;
  /** Ranged units only: projectile speed in sub-units per tick. */
  shotSpeed?: number;
  /** Enemy specials have no effect on it. */
  immune?: boolean;
}

export interface TurretStats {
  cost: number;
  range: number;
  dmg: number;
  cooldown: number;
  shotSpeed: number;
}

export interface EraStats {
  baseHp: number;
  progressNeeded: number | null;
  light: RoleStats;
  ranged: RoleStats;
  heavy: RoleStats;
  /** The fourth unit. Only the last era has one. */
  super?: RoleStats;
  turret: TurretStats;
}

/** The first era's numbers. Later eras are these, scaled. */
const FIRST = {
  light: {
    cost: 50,
    buildTicks: sec(1.6),
    hp: 120,
    speed: pxPerSec(60),
    len: px(54),
    range: px(18),
    dmg: 18,
    windup: sec(0.3),
    recover: sec(0.4),
  },
  ranged: {
    cost: 80,
    buildTicks: sec(2.4),
    hp: 65,
    speed: pxPerSec(45),
    len: px(48),
    range: px(220),
    dmg: 13,
    windup: sec(0.4),
    recover: sec(0.7),
    shotSpeed: pxPerSec(430),
  },
  heavy: {
    cost: 230,
    buildTicks: sec(5.5),
    hp: 800,
    speed: pxPerSec(32),
    len: px(190),
    range: px(26),
    dmg: 55,
    cleave: true,
    windup: sec(0.5),
    recover: sec(1.0),
  },
  turret: {
    cost: 190,
    range: px(300),
    dmg: 20,
    cooldown: sec(1.0),
    shotSpeed: pxPerSec(520),
  },
} satisfies { light: Omit<RoleStats, 'bounty'>; ranged: Omit<RoleStats, 'bounty'>; heavy: Omit<RoleStats, 'bounty'>; turret: TurretStats };

/** Share of a unit's price that the opponent earns for beating it. */
const BOUNTY_PERCENT = 40;

/**
 * The last era has a fourth unit: one machine that is an army by itself. It
 * costs a fortune and takes a long time to build, it hits everything within
 * reach, and enemy specials have no effect on it: it cannot be cancelled,
 * glued down, run over or picked out by drones. Units and turrets still hurt it.
 *
 * Tuned so that one of them beats its own price in any mix of units and a full
 * ten-unit army only just, but loses to six heavies: the best buy late in the
 * match, and still stoppable by an opponent who keeps heavies and turrets coming.
 */
const SUPER: Omit<RoleStats, 'bounty'> = {
  cost: 3000,
  buildTicks: sec(12),
  hp: 12000,
  speed: pxPerSec(26),
  len: px(150),
  range: px(30),
  dmg: 460,
  cleave: true,
  windup: sec(0.6),
  recover: sec(0.9),
  immune: true,
};

function scaleRole(base: Omit<RoleStats, 'bounty'>, s: EraScale): RoleStats {
  const cost = Math.round(base.cost * s.price);
  return {
    ...base,
    cost,
    hp: Math.round(base.hp * s.power),
    dmg: Math.round(base.dmg * s.power),
    bounty: Math.round((cost * BOUNTY_PERCENT) / 100),
  };
}

function scaleEra(key: EraKey): EraStats {
  const s = SCALE[key];
  return {
    baseHp: s.baseHp,
    progressNeeded: s.progressNeeded,
    light: scaleRole(FIRST.light, s),
    ranged: scaleRole(FIRST.ranged, s),
    heavy: scaleRole(FIRST.heavy, s),
    turret: { ...FIRST.turret, cost: Math.round(FIRST.turret.cost * s.price), dmg: Math.round(FIRST.turret.dmg * s.power) },
  };
}

export const STATS: Record<EraKey, EraStats> = {
  '1975': scaleEra('1975'),
  '2025': scaleEra('2025'),
  '2050': { ...scaleEra('2050'), super: { ...SUPER, bounty: Math.round((SUPER.cost * BOUNTY_PERCENT) / 100) } },
};

// ---- Turret levels ----------------------------------------------------------
// A turret can be upgraded twice. Every upgrade makes it hit harder and reach
// further down the lane: a new turret only guards the doorstep, a fully
// upgraded one reaches just past the middle and joins the fight there. That is
// what makes them worth their money: against the same player without turrets,
// a bot that bought them won 24% of its matches when they only reached the
// doorstep, and 58% with these numbers.
// After modernizing, the old turrets stay until they are bought again; the new
// one replaces the oldest and starts at level 1.

export const TURRET = {
  maxLevel: 3,
  /** Damage at each level, as a percentage of the turret's own damage. */
  damagePercent: [100, 150, 200],
  /** Reach at each level, as a percentage of the turret's own range: 300, 480 and 660 pixels of a 1280 pixel lane. */
  rangePercent: [100, 160, 220],
  /** Price of each upgrade, as a percentage of the turret's price: level 1 to 2, level 2 to 3. */
  upgradePercent: [60, 100],
} as const;

// ---- Specials ---------------------------------------------------------------
// One per era per faction, each a different kind of trick.

export const SPECIAL = {
  /** Earliest moment a special can be used. */
  firstReady: sec(25),
  cooldown: sec(50),
  /** 1975, Achterhoek: boerenrock. Own units hit harder and move faster for a while. */
  hoken: { ticks: sec(7), dmgPercent: 135, speedPercent: 140 },
  /** 1975, Amsterdam: a love-in. Every own unit on the lane is patched up. */
  loveIn: { healPercent: 100 },
  /** 2025, Achterhoek: a convoy sweeps the lane and hits every enemy unit once. */
  kolonne: { speed: pxPerSec(520), dmg: 48 },
  /** 2025, Amsterdam: activists glue themselves down; enemy units can neither walk nor fight. */
  blokkade: { ticks: sec(5) },
  /** 2050, Achterhoek: drones dive on the foremost enemy, one after another. */
  zwerm: { strikes: 10, every: sec(0.4), dmg: 300 },
  /**
   * 2050, Amsterdam: the algorithm cancels the toughest enemy unit on the lane,
   * and whatever outrage is left over goes to the next toughest, and so on.
   */
  algoritme: { dmg: 4500 },
} as const;
