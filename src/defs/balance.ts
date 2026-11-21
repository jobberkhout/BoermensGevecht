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
export const GATE_X: readonly [number, number] = [250, 1670];
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

/** Past this point both bases lose `percent` of their full strength every `every` ticks. */
export const OVERTIME = { at: sec(7 * 60), every: sec(1), percent: 1.5 } as const;

// ---- Economy ----------------------------------------------------------------

export const START_GOLD = 150;
export const INCOME_EVERY = sec(1);

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
  /** Subsidie per INCOME_EVERY ticks. */
  income: number;
  /** Price of modernizing to the next era; null for the last one. */
  eraUpCost: number | null;
  light: RoleStats;
  ranged: RoleStats;
  heavy: RoleStats;
  turret: TurretStats;
}

export const STATS = {
  e4: {
    baseHp: 2000,
    income: 12,
    eraUpCost: null,
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
      bounty: 20,
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
      bounty: 32,
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
      bounty: 92,
    },
    turret: {
      cost: 190,
      range: px(300),
      dmg: 11,
      cooldown: sec(1.0),
      shotSpeed: pxPerSec(520),
    },
  },
} satisfies Record<string, EraStats>;

// ---- Specials ---------------------------------------------------------------

export const SPECIAL = {
  /** Earliest moment a special can be used. */
  firstReady: sec(25),
  cooldown: sec(50),
  // Tuned against each other: in a clash of equal armies a well-timed stun and
  // the wave decide the fight by a similar margin (see scripts/balance.ts).
  wave: { speed: pxPerSec(520), dmg: 20 },
  stun: { ticks: sec(5) },
} as const;
