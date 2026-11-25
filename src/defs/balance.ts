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

/**
 * How fast every unit walks, and the fatbike rides, in percent of the speeds
 * written in the tables below. The owner asked for 20% more on 23 November
 * 2026: the armies met too late and there was too little going on.
 */
export const PACE_PERCENT = 120;
/**
 * A walking or riding speed: pixels a second as written in the tables, times
 * the pace. Rounded up, so the slowest unit is not left behind by the rounding.
 */
const walk = (n: number): number => Math.ceil((n * PACE_PERCENT * SUB) / 100 / TPS);

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
 * A unit stuck in its row steps into another row that has room for it where
 * it stands, if it can get at least this much further forward there. Less, and
 * units would hop to and fro between rows for a step or two.
 *
 * That, and close fighters walking past their own throwers once these stand
 * still, are the owner's of 25 November 2026: "melee units are allowed to
 * stand in front of the ranged units to attack if there is space and that
 * units properly cue up in the lanes". Until then a thrower that stopped to
 * fire held up its whole row: in bot matches a close fighter spent 35% of its
 * time on the lane standing behind one, and 16% fighting.
 */
export const SIDESTEP = px(40);
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

/**
 * Units a side may have on the lane at once. It was ten until 25 November
 * 2026. The owner then found that in the future nobody could break through:
 * "I am sitting at 10 units with money piling and unit construction stalls",
 * while one cheap unit at a time from the other side held the whole army up.
 * So twenty: whoever has the money can now overwhelm the other side.
 */
export const UNIT_CAP = 20;
export const QUEUE_MAX = 5;
export const TURRET_SLOTS = 2;

/**
 * Overtime: nobody gets to sit a match out.
 *
 * From `at`, every `every` ticks all units hit `stepPercent` of their normal
 * damage harder than before, on top of the last step, and turrets lose
 * `turretStepPercent` of theirs until they fall silent. So defences fall
 * behind, fights are over in a blow or two, and one side breaks through.
 *
 * If even that does not finish it, from `crumbleAt` both bases also lose
 * `crumblePercent` of their full strength every `crumbleEvery` ticks. That ends
 * any match within about a minute; the less damaged base outlasts the other.
 *
 * The subsidiekraan stays open. For a while it closed in overtime (`income`
 * false), which made bots break through more often. Between people it did the
 * opposite: both purses ran dry, fully upgraded turrets shot down what little
 * was left, and nobody could do anything until the bases crumbled. Now the
 * money keeps coming, and every era has a unit that takes the turrets' fire.
 *
 * Measured from exactly that spot (both sides in the last era, two fully
 * upgraded turrets each, empty purses, 216 bot matches): with the kraan closed
 * the lane stood empty for three minutes in every match. With it open there is
 * always something to buy, but nobody got past the turrets before the bases
 * crumbled. With turrets wearing out by 10% a step, 38% of those matches are
 * decided by play first, and with 20% a step 46%.
 */
export const OVERTIME = {
  at: sec(10 * 60),
  every: sec(10),
  stepPercent: 20,
  /** With every step turrets lose this much of their normal damage, until they fall silent. 0 leaves them alone. */
  turretStepPercent: 10 as number,
  /** Whether the regular income keeps coming in during overtime. Bounties always do. */
  income: true as boolean,
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
  /** Subsidie that modernizing to the next era costs on top of that; null for the last one. */
  eraUpCost: number | null;
}

const SCALE: Record<EraKey, EraScale> = {
  '1975': { power: 1, price: 1, baseHp: 2500, progressNeeded: 1500, eraUpCost: 500 },
  '2025': { power: 2.4, price: 2, baseHp: 5500, progressNeeded: 4200, eraUpCost: 1000 },
  '2050': { power: 5.6, price: 4, baseHp: 12000, progressNeeded: null, eraUpCost: null },
};

/**
 * Vooruitgang: what a side needs before it may modernize. It cannot be bought.
 * It comes with time and with fighting, for the winner of a fight and, less,
 * for the loser, so both sides get the chance to move on and neither is left
 * in the past. Once there is enough of it, modernizing still costs subsidie
 * (eraUpCost), which makes it a choice: save up for the next era, or spend on
 * the army of this one.
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
// Every faction starts from the same numbers for the same role in the same
// era. On top of them comes its temperament, further down: a small twist per
// role that makes it feel like itself.

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
  /**
   * How far a cleaving blow reaches from the unit's front edge. Left out, as far
   * as `range`: the front unit of each row. Further, and it hits the ranks behind them too.
   */
  sweep?: number;
  /** Ranged units only: projectile speed in sub-units per tick. */
  shotSpeed?: number;
  /** Enemy specials have no effect on it. */
  immune?: boolean;
  /** The share of a turret's shot it takes, in percent. Left out: all of it. */
  turretPercent?: number;
  /** Enemy turrets that can reach it fire at it, wherever it stands, instead of at the foremost unit. */
  drawsFire?: boolean;
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
  eraUpCost: number | null;
  light: RoleStats;
  ranged: RoleStats;
  heavy: RoleStats;
  /** The fourth unit of the eras before the last: the answer to turrets. */
  shield?: RoleStats;
  /** The fourth unit of the last era. */
  super?: RoleStats;
  turret: TurretStats;
}

/** The first era's numbers. Later eras are these, scaled. */
const FIRST = {
  light: {
    cost: 50,
    buildTicks: sec(1.6),
    hp: 120,
    speed: walk(60),
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
    speed: walk(45),
    len: px(48),
    // The owner asked for 250 on 25 November 2026 and went back to 220 the same day: with close
    // fighters now walking past their throwers, the longer throws made bot matches a minute
    // longer still (median 10:53 against 9:50), and the point is bases that fall sooner.
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
    speed: walk(32),
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
export const BOUNTY_PERCENT = 40;

/**
 * Every era has a fourth unit, and it is the answer to turrets.
 *
 * In the first two eras that is the schild: someone behind something big.
 * Every enemy turret that can reach it fires at it, wherever it stands in the
 * ranks, and their shots do it very little. For as long as it stands, the army
 * around it is safe from turrets: two fully upgraded ones need about a quarter
 * of a minute to wear one down. Against units it is a pushover, and that is
 * how to stop it: turrets alone no longer hold a base.
 */
const SHIELD: Omit<RoleStats, 'bounty'> = {
  cost: 120,
  buildTicks: sec(3),
  hp: 260,
  speed: walk(50),
  len: px(80),
  range: px(18),
  dmg: 10,
  windup: sec(0.4),
  recover: sec(0.6),
  turretPercent: 20,
  drawsFire: true,
};

/**
 * In the last era the fourth unit is one machine that is an army by itself. It
 * costs a fortune and takes a long time to build, it hits everything within
 * reach, and enemy specials have no effect on it: it cannot be cancelled,
 * glued down, run over, bought or picked out by drones. It draws the fire of
 * turrets and shrugs it off, as the schild does. Only units really hurt it.
 *
 * Its blow sweeps further than a heavy's: 120 pixels from its front, so two
 * small units deep in every row, where a heavy reaches only the front one (30
 * pixels, as the super unit did too). The owner, 25 November 2026: "the Big
 * Super unit should do splash damage like the fat units. Otherwise you can just
 * spam the smaller units all the time because it walks slow". 150 pixels,
 * three deep, at first; the same day "slightly lower". A heavy unit is longer
 * than the sweep, so against heavies it still hits only the front rank.
 *
 * Tuned so that one of them beats its own price in any mix of units, but loses
 * to six heavies: the best buy late in the match, and still stoppable by an
 * opponent who keeps heavies and turrets coming.
 */
const SUPER: Omit<RoleStats, 'bounty'> = {
  cost: 3000,
  buildTicks: sec(12),
  hp: 12000,
  speed: walk(26),
  len: px(150),
  range: px(30),
  dmg: 460,
  cleave: true,
  sweep: px(120),
  windup: sec(0.6),
  recover: sec(0.9),
  immune: true,
  turretPercent: 20,
  drawsFire: true,
};

/**
 * A rider: the fatbike of De Gasten, which takes the heavy slot of 2025. It is
 * not a unit in the ranks. It rides through every enemy unit on its way,
 * hitting each once and taking one blow back from each, and goes for the
 * enemy base. A schild stops it and both go down; a super unit stops it and
 * walks on. Turrets fire at it before anything else. Enemy specials do not
 * touch it. One per side on the lane at a time, outside the unit cap.
 * The owner's rule of 23 November 2026, in docs/factions.md, section 8.
 *
 * Price and hit points are the owner's of 23 November 2026: 300, about two
 * thirds of a heavy of its era, and 400 hit points, about 40% more than a
 * light unit. Two fully upgraded turrets alone no longer quite stop it.
 * Fast enough to cross the lane in a little over three seconds.
 */
export const RIDER = {
  cost: 300,
  buildTicks: sec(4),
  hp: 400,
  speed: walk(330),
  len: px(160),
  /** What every enemy unit it rides through takes, and a super unit it crashes into. */
  ram: 130,
  /** What the enemy base takes when it gets there. */
  baseDmg: 500,
} as const;

/** A rider as a unit definition's numbers. Reach and blow timing are a light unit's, unused: it never stops to fight. */
export const RIDER_STATS: RoleStats = {
  cost: RIDER.cost,
  buildTicks: RIDER.buildTicks,
  hp: RIDER.hp,
  speed: RIDER.speed,
  len: RIDER.len,
  range: FIRST.light.range,
  dmg: RIDER.ram,
  windup: FIRST.light.windup,
  recover: FIRST.light.recover,
  bounty: Math.round((RIDER.cost * BOUNTY_PERCENT) / 100),
};

/**
 * Influencer-Ivy, the ranged unit of De Toeristen in 2025, throws nothing. Every
 * enemy unit within her reach is in her shot and poses: its blows and throws
 * do this share of their damage for as long as it stays there. Two Ivys do not
 * make it less: a unit is in a shot or not. Turrets and super units do not pose.
 * The owner's rule of 24 November 2026, in docs/factions.md, section 5.
 */
export const POSE = { dmgPercent: 50 } as const;

/**
 * Paraplu-Pam, the schild of De Toeristen in 2025. The owner, 24 November 2026:
 * "make the unit cost more and the scattered units weak and make Pam move quite
 * a bit slower then other shield units". Her price and walking speed are these
 * shares of the shared schild's, in place of the temperament: 360 instead of
 * 240, and the slowest unit De Toeristen have. When she falls her group of
 * `count` scatters where she stood: free lost tourists with these shares of a
 * light unit's numbers (the shared ones, not the faction's), who walk on.
 */
export const SCATTER = {
  costPercent: 150,
  speedPercent: 60,
  count: 4,
  group: { hp: 25, dmg: 50, speed: 100 },
} as const;

/**
 * The beer bikes, the heavies of De Toeristen in 2025 and 2050 (De Bierfiets,
 * De Zweefbierfiets): a heavy that hits as one, and one of the party aboard
 * tosses beers on top of that. The owner, 24 November 2026: dearer than a
 * heavy by about 30% ("around 30% more expensive compared to the normal heavy
 * unit price"), faster ("bierfiets go fast"), a melee blow and "1 person
 * tossing beers". Before that the Zweefbierfiets hovered out of reach of melee
 * instead; measured, no army without throwers could scratch it.
 *
 * `costPercent` and `speedPercent` are shares of the shared heavy's numbers,
 * in place of the temperament's; the damage of its blows keeps the
 * temperament. The toss is a share of the faction's own ranged unit of the
 * era: its damage and reach, every `every` ticks. A beer did a throw's damage
 * at first; the owner found the bike "quite weak for the price", so half again
 * as much: the 185 a Bierfiets costs over De Toeristen's plain heavy is more
 * than one of their ranged units, and now the beer throws a little more than
 * one does in the same time.
 */
export const TOSS = {
  costPercent: 130,
  speedPercent: 175,
  dmgPercent: 150,
  rangePercent: 80,
  every: sec(1.5),
} as const;

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
    eraUpCost: s.eraUpCost,
    light: scaleRole(FIRST.light, s),
    ranged: scaleRole(FIRST.ranged, s),
    heavy: scaleRole(FIRST.heavy, s),
    turret: { ...FIRST.turret, cost: Math.round(FIRST.turret.cost * s.price), dmg: Math.round(FIRST.turret.dmg * s.power) },
  };
}

export const STATS: Record<EraKey, EraStats> = {
  '1975': { ...scaleEra('1975'), shield: scaleRole(SHIELD, SCALE['1975']) },
  '2025': { ...scaleEra('2025'), shield: scaleRole(SHIELD, SCALE['2025']) },
  '2050': { ...scaleEra('2050'), super: { ...SUPER, bounty: Math.round((SUPER.cost * BOUNTY_PERCENT) / 100) } },
};

// ---- Temperament ------------------------------------------------------------
// What makes one faction play differently from another, besides its specials:
// a twist per role on the shared numbers above, the same in every era. Farmers
// are tough and slow, the havermelkelite is quick and frail, De Zuidas is dear
// and prompt. Each faction's table is in its own sheet, src/defs/<faction>.ts.
//
// The twists are small on purpose, and a test holds them to TWIST_LIMIT: the
// factions should feel different, not play a different game. Bases, turrets,
// income and the price of modernizing are the same for everyone.

/** What a faction changes about a role, each in percent of the shared number. Left out means 100: as everyone. */
export interface Twist {
  cost?: number;
  /** Time in training. Less is sooner out of the door. */
  buildTicks?: number;
  hp?: number;
  speed?: number;
  /** Reach. Only for units that throw: a melee unit must keep reaching what it stops in front of. */
  range?: number;
  dmg?: number;
  /** The pause after a blow before the next one starts. More is a slower hitter. */
  recover?: number;
}

export type Temper = Partial<Record<'light' | 'ranged' | 'heavy' | 'shield' | 'super', Twist>>;

/** No number may stray further than this from the shared one, in percent. */
export const TWIST_LIMIT = 30;

/** A twisted price is rounded to this, so it still looks like a price. */
export const PRICE_STEP = 5;

/** The shared numbers of a role with a faction's twist on them. The bounty follows the price. */
export function twisted(stats: RoleStats, twist: Twist | undefined): RoleStats {
  if (!twist) return stats;
  const by = (value: number, percent: number | undefined): number =>
    percent === undefined ? value : Math.max(1, Math.round((value * percent) / 100));
  const cost = twist.cost === undefined ? stats.cost : Math.round((stats.cost * twist.cost) / 100 / PRICE_STEP) * PRICE_STEP;
  return {
    ...stats,
    cost,
    bounty: cost === stats.cost ? stats.bounty : Math.round((cost * BOUNTY_PERCENT) / 100),
    buildTicks: by(stats.buildTicks, twist.buildTicks),
    hp: by(stats.hp, twist.hp),
    speed: by(stats.speed, twist.speed),
    range: by(stats.range, twist.range),
    dmg: by(stats.dmg, twist.dmg),
    recover: by(stats.recover, twist.recover),
  };
}

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
  /** 1975, De Zuidas: the gong opens trading. The same kind of trick as Høken, with the same numbers. */
  gong: { ticks: sec(7), dmgPercent: 135, speedPercent: 140 },
  /**
   * 2050, De Zuidas: the success fee. For this long everything the enemy
   * earns is paid to De Zuidas instead: the income that comes in every second
   * and what they get for beating units. What they already have stays theirs.
   */
  succesfee: { ticks: sec(5) },
  /**
   * 2050, Amsterdam: the algorithm cancels the `count` toughest enemy units on
   * the lane, gone at once, whatever their hit points.
   *
   * Until 25 November 2026 it was 4500 damage that started with the toughest
   * and carried what was left over to the next. That was hit or miss: a fresh
   * De Vreter has more hit points than that and soaked up all of it, so in bot
   * matches against the Achterhoek half of the uses beat nobody, while against
   * small units it cleared the lane. The owner picked this instead, "so it is
   * also more consistent". Bots won about as often with it as with the old one.
   */
  algoritme: { count: 2 },
  /** 1975, De Gasten: eerst thee. Every own unit on the lane is patched up. The same kind of trick as the love-in, with the same numbers. */
  thee: { healPercent: 100 },
  /**
   * 2025, De Gasten: a wedding convoy honks its way down the lane and hits
   * every enemy unit once. The same kind of trick as the Trekkerkolonne, with
   * the same numbers; until 24 November 2026 it was a stun like the blokkade.
   */
  toeterstoet: { speed: pxPerSec(520), dmg: 48 },
  /**
   * 2050, De Gasten: one message in the family group chat and everyone comes.
   * This many hologram cousins come out at the gate, light units of the era
   * that are not for sale and pay no bounty. The owner's pick of 24 November
   * 2026, in place of Nee is nee; the only special of its kind.
   *
   * The owner, 25 November 2026: "only 4 light units for a super power", and
   * asked for cousins that fight up close and from afar, with a bit more hit
   * points. So they have `hp` percent of the shared light unit's hit points
   * (874 in place of the 571 of De Gasten's own), and as well as swatting with
   * the selfie stick each sends a voice message on its own beat, the way the
   * beer bikes toss beers: a share of a Prijzenvader's throw, its damage and
   * reach, every `every` ticks.
   */
  familieApp: { count: 4, hp: 130, toss: { dmgPercent: 100, rangePercent: 80, every: sec(1.5) } },
  /** 1975, De Toeristen: four hundred holiday slides and the enemy nods off. The same kind of trick as the Wegblokkade, with the same numbers. */
  diaAvond: { ticks: sec(5) },
  /**
   * 2025, De Toeristen: a cruise ship moors behind the base and this many day
   * trippers run out of the gate, whatever the unit cap. Weak but fast, with
   * these shares of a light unit's numbers (the shared ones). After `ticks` the
   * horn sounds and whoever is still on the lane is back on board, paying
   * nobody anything. The summon of De Familie-app, with the time limit added.
   */
  cruiseschip: { count: 8, ticks: sec(20), hp: 50, dmg: 50, speed: 160 },
  /**
   * 2050, De Toeristen: rent increase for the locals. For this long everything
   * the enemy buys costs this share of its price: units, turrets, subsidie and
   * modernizing. The owner's idea of 24 November 2026, in place of a lockout.
   * It lasted ten seconds at first. The owner, the same day: "if you have stuff
   * in que and 10s is quite short", then "20s 100% increase sounds good". Bots
   * had valued the ten seconds at about nothing in 2050: given to another
   * faction in place of its own special it won as often as with no special at all.
   */
  huurverhoging: { ticks: sec(20), pricePercent: 200 },
} as const;
