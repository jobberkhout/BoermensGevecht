import type { FactionId } from '../defs/types.ts';

/** 0 = left player, 1 = right player. */
export type Side = 0 | 1;
export const SIDES: readonly [Side, Side] = [0, 1];
export const other = (side: Side): Side => (side === 0 ? 1 : 0);

export type Command =
  | { t: 'buy'; slot: 0 | 1 | 2 | 3 }
  | { t: 'turret' }
  | { t: 'special' }
  | { t: 'eraUp' }
  | { t: 'subsidy' };

/** A command with the tick it takes effect on. A list of these is a full replay. */
export interface Stamped {
  tick: number;
  side: Side;
  cmd: Command;
}

export interface Replay {
  v: 2;
  seed: number;
  factions: [FactionId, FactionId];
  cmds: Stamped[];
}

export interface Unit {
  id: number;
  /** UnitDef id. */
  def: string;
  /** Which of the ROWS rows it marches in. 0 is furthest from the viewer. */
  row: number;
  /** Front edge, as distance from the unit's own gate. Both sides count up from 0. */
  pos: number;
  /** Position one tick ago, so the renderer can draw between ticks. */
  prevPos: number;
  hp: number;
  act: 'walk' | 'idle' | 'attack';
  /** Ticks into the current attack. The hit lands when this equals the unit's windup. */
  actTick: number;
  /** Can neither walk nor fight before this tick. */
  stunUntil: number;
  /** Bought over: it fights for the side it is listed under, not for the side that trained it. */
  turncoat: boolean;
  /** In the shot of an enemy that poses it (Influencer-Ivy): its blows do less. Worked out afresh every tick. See sim/tourists.ts. */
  posing: boolean;
  /** Tick at which it leaves the lane of its own accord, paying nobody: the day trippers when the ship's horn sounds. 0 for never. */
  leaveAt: number;
  /** Tick from which the one aboard may toss again (the beer bikes, UnitDef.toss). 0 for right away. */
  tossAt: number;
  /** The pole vaulter has used its one leap (UnitDef.vault). */
  vaulted?: true;
  /** Where the pole vaulter lands, decided this tick and carried out once both sides have decided. */
  vaultTo?: number;
  /** The skater has crashed into its first enemy and goes at a normal pace from now on (UnitDef.charge). */
  charged?: true;
  /** Glued with sugar until this tick: it walks and fights at half pace (UnitDef.sticky). */
  stickyUntil?: number;
  /** Tick from which it can send a throw back again (UnitDef.returns). */
  returnAt?: number;
  /** The last tick it took a blow, for a unit that grows back only when left alone (UnitDef.regrows). */
  hitAt?: number;
}

/**
 * A unit that does not join the ranks: the fatbike. It rides from its own gate
 * straight to the enemy base, through every enemy unit on its way. See sim/riders.ts.
 */
export interface Rider {
  id: number;
  /** UnitDef id. */
  def: string;
  /** Row it is drawn in. Looks only. */
  row: number;
  /** Front edge, as distance from its own gate, like a unit's. */
  pos: number;
  prevPos: number;
  hp: number;
  /** Ids of the enemy units it has ridden through, each of which it meets once. */
  passed: number[];
  /** It rode into the enemy base and is gone, without a bounty for anyone. */
  arrived: boolean;
}

export interface QueueItem {
  def: string;
  /** Ticks of training left. */
  left: number;
}

export interface Turret {
  /** TurretDef id. After modernizing this may be an older era's turret, until it is bought again. */
  def: string;
  /** 1 to TURRET.maxLevel. */
  level: number;
  /** Ticks until it can fire again. */
  cd: number;
  /**
   * What went into it at list prices: its own price and its upgrades'. When a
   * turret of a later era replaces it, TURRET.tradeInPercent of this comes off
   * the new one's price.
   */
  value: number;
}

export interface SideState {
  faction: FactionId;
  /** Index into the faction's era list. */
  era: number;
  gold: number;
  /** How often "subsidie aanvragen" was bought; decides the income. */
  subsidy: number;
  /** Vooruitgang gathered in the current era. Enough of it allows modernizing. */
  progress: number;
  baseHp: number;
  baseMaxHp: number;
  /** In the order they walked out. Within one row that is front to back, because nobody overtakes in a row. */
  units: Unit[];
  /** Riders on the lane: at most one. They are not units and do not count towards the unit cap. */
  riders: Rider[];
  /**
   * Units a special called in that have not come out yet, by definition id.
   * They come out at the gate before the queue, as soon as a row has room,
   * whatever the unit cap.
   */
  arrivals: { def: string; leaveAt: number }[];
  queue: QueueItem[];
  turrets: (Turret | null)[];
  /** Tick from which the special can be used. */
  specialReadyAt: number;
  /** Own units hit harder and move faster until this tick. */
  buffUntil: number;
  buffDmgPercent: number;
  buffSpeedPercent: number;
  /** Until this tick whatever this side earns is paid to the other side instead: its income and its bounties. */
  divertedUntil: number;
  /**
   * From `hikeFrom` until before `hikeUntil` everything this side buys costs
   * `hikePercent` of its price: the Huurverhoging. It starts on the tick after
   * the enemy pressed it, so what either side buys on that tick does not
   * depend on which of them is handled first. See price() in sim/commands.ts.
   */
  hikeFrom: number;
  hikeUntil: number;
  hikePercent: number;
  /** Units of this side that were beaten, by definition id, the most recent last, for De Bezemwagen to pick up. At most FALLEN_KEEP. */
  fallen: string[];
  /** This side's turrets do not fire until this tick: the enemy's Tropenrooster. */
  siestaUntil: number;
}

export interface Shot {
  id: number;
  /** Who fired it. Position is measured from that side's gate. */
  side: Side;
  pos: number;
  prevPos: number;
  origin: number;
  /** Distance to the target when fired; the renderer uses it to shape the arc. */
  dist0: number;
  /** The shot fizzles once it passes this position. */
  limit: number;
  speed: number;
  dmg: number;
  rig: string;
  arc: number;
  spin: number;
  /** Id of the unit that fired it, or -1 for a turret's shot. Looks only. */
  src: number;
  /** Row it flies along. Looks only. */
  row: number;
  /** Turret slot it came from, or -1 for a unit's shot. */
  slot: number;
  /**
   * Id of the unit a turret aimed it at because that unit draws fire; it flies
   * on until it reaches that unit. -1 for every other shot, which hits the
   * first body it meets.
   */
  aim: number;
  /** Whoever it hits is glued with sugar for this many ticks (UnitDef.sticky). */
  sticky?: number;
  /** It bounces on to the unit behind the one it hits (UnitDef.bounce). */
  bounce?: { dmgPercent: number; reach: number };
}

export interface Wave {
  id: number;
  side: Side;
  rig: string;
  pos: number;
  prevPos: number;
  speed: number;
  dmg: number;
  /** Ids of enemy units it has already hit. */
  hit: number[];
}

/** Blows still to come from a barrage special. */
export interface Barrage {
  id: number;
  /** The side that launched it. */
  side: Side;
  /** Strikes still to land. */
  left: number;
  every: number;
  /** Ticks until the next strike. */
  timer: number;
  dmg: number;
  rig: string;
}

export interface SimState {
  tick: number;
  rng: number;
  nextId: number;
  winner: Side | 'draw' | null;
  sides: [SideState, SideState];
  shots: Shot[];
  waves: Wave[];
  barrages: Barrage[];
}

/** `unit` value that means "the base". */
export const BASE = -1;

/**
 * What waits for the end of the tick, so that everything that happens at the
 * same moment lands together: a blow, or a unit that is bought over.
 */
export interface Damage {
  /** The side that takes it. */
  side: Side;
  /** Unit id, or BASE. */
  unit: number;
  amount: number;
  /** Not a blow: this unit of `side` was bought and changes sides, if it is still standing. */
  bought?: boolean;
  /** Not a blow: this unit of `side` is cancelled and falls, whatever hit points it has left. `amount` is ignored. */
  cancelled?: boolean;
  /** It comes from a turret, so a unit that shrugs turrets off takes only its share of it. */
  turret?: boolean;
  /** If it is still standing, the unit is shoved this far back towards its own gate: the skater who cannot brake. */
  shove?: number;
  /** The unit is glued with sugar for this many ticks. */
  sticky?: number;
  /** Id of the unit whose blow this is, when that unit feeds on what it hits (UnitDef.feeds). */
  from?: number;
}

/** What happened during one tick, for effects and sound. `pos` is in the frame of `side`. */
export type SimEvent =
  | { t: 'spawn'; side: Side; id: number; def: string }
  | { t: 'attack'; side: Side; id: number }
  /** `filming`: it throws nothing and poses the enemy instead, Influencer-Ivy. */
  | { t: 'strike'; side: Side; id: number; ranged: boolean; filming?: true }
  /** One aboard a beer bike tosses a beer, whatever the bike itself is doing. */
  | { t: 'toss'; side: Side; id: number }
  | { t: 'hit'; side: Side; id: number; amount: number; pos: number }
  | { t: 'defeat'; side: Side; id: number; def: string; pos: number }
  /** `side` is paid for a unit beaten at `pos`. With `diverted` it was the other side that beat it, and the money was sent this way. */
  | { t: 'gold'; side: Side; amount: number; pos: number; diverted?: true }
  | { t: 'baseHit'; side: Side; amount: number }
  | { t: 'turretBuilt'; side: Side; slot: number; how: 'build' | 'replace' | 'upgrade'; level: number }
  | { t: 'turretFire'; side: Side; slot: number }
  | { t: 'subsidy'; side: Side; level: number }
  | { t: 'eraUp'; side: Side; era: number }
  | { t: 'special'; side: Side; id: string }
  | { t: 'stunned'; side: Side; ids: number[]; ticks: number }
  | { t: 'buffed'; side: Side; ticks: number }
  | { t: 'healed'; side: Side; ids: number[] }
  /** A turret's shot bounced off unit `id` of `side`, which shrugs turrets off; `amount` is what little got through. */
  | { t: 'glance'; side: Side; id: number; amount: number; pos: number }
  /** Unit `id` was bought over and now fights for `side`, standing at `pos` in that side's frame. */
  | { t: 'converted'; side: Side; id: number; def: string; pos: number }
  /** For the next `ticks` ticks whatever `side` earns is paid to the other side instead. */
  | { t: 'diverted'; side: Side; ticks: number }
  /** `count` units are called in for `side`; with `ticks` above 0 they leave again after that long. */
  | { t: 'summoned'; side: Side; count: number; ticks: number }
  /** A unit of `side` that scatters fell at `pos`, and its group, `ids`, came onto the lane there. */
  | { t: 'scattered'; side: Side; ids: number[]; pos: number }
  /** The time of the units `ids` of `side` is up and they leave the lane: the ship's horn. */
  | { t: 'recalled'; side: Side; ids: number[] }
  /** For `ticks` ticks from the next one, everything `side` buys costs `percent` of its price. */
  | { t: 'hiked'; side: Side; ticks: number; percent: number }
  /** The regular income of the other side was paid to `side` instead. */
  | { t: 'skimmed'; side: Side; amount: number }
  /** An enemy special had no effect on these units of `side`. */
  | { t: 'shrugged'; side: Side; ids: number[] }
  /** Rider `id` of `side` rode through enemy unit `foe`, at `pos` in the rider's frame. */
  | { t: 'rammed'; side: Side; id: number; foe: number; pos: number }
  /** Rider `id` of `side` crashed into enemy unit `foe`, a schild or a super unit, and is done. */
  | { t: 'crashed'; side: Side; id: number; foe: number; pos: number }
  /** Rider `id` of `side` rode into the enemy base and is gone; the base took `amount`. */
  | { t: 'arrived'; side: Side; id: number; amount: number }
  /** The algorithm came down on unit `id` of `side`. */
  | { t: 'sniped'; side: Side; id: number; pos: number }
  /** A barrage blow landed on `side`: on unit `id`, or on the base when `id` is BASE. */
  | { t: 'barrageHit'; side: Side; id: number; pos: number }
  | { t: 'overtime' }
  /** Overtime turns the screw: units now hit `percent` harder than normal, and turrets have `turrets` percent of their damage left. */
  | { t: 'escalate'; level: number; percent: number; turrets: number }
  /** Overtime has gone on so long that both bases start to crumble. */
  | { t: 'crumble' }
  | { t: 'win'; winner: Side | 'draw' }
  /** The pole vaulter `id` of `side` leapt from `from` to `to` over the first enemy it met, and sits dazed. */
  | { t: 'vaulted'; side: Side; id: number; from: number; to: number }
  /** The skater `id` of `side` could not brake, crashed into its first enemy and sits dazed. */
  | { t: 'braked'; side: Side; id: number }
  /** Unit `id` of `side` was shoved back from `from` to `to`. */
  | { t: 'shoved'; side: Side; id: number; from: number; to: number }
  /** Unit `id` of `side` ladled soup, and the units `ids` got hit points back. */
  | { t: 'served'; side: Side; id: number; ids: number[] }
  /** `count` beaten units of `side` are picked up and come back out of its gate. */
  | { t: 'revived'; side: Side; count: number }
  /** For the next `ticks` ticks the turrets of `side` do not fire: the enemy's Tropenrooster. */
  | { t: 'siesta'; side: Side; ticks: number }
  /** Unit `id` of `side` got `amount` hit points back by itself: it grew back, or it ate. */
  | { t: 'mended'; side: Side; id: number; amount: number }
  /** Unit `id` of `side` sent an enemy throw back down the lane. */
  | { t: 'returned'; side: Side; id: number; pos: number };
