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
  queue: QueueItem[];
  turrets: (Turret | null)[];
  /** Tick from which the special can be used. */
  specialReadyAt: number;
  /** Own units hit harder and move faster until this tick. */
  buffUntil: number;
  buffDmgPercent: number;
  buffSpeedPercent: number;
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
  /** Turret slot it came from, or -1 for a unit's shot. Looks only. */
  slot: number;
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
}

/** What happened during one tick, for effects and sound. `pos` is in the frame of `side`. */
export type SimEvent =
  | { t: 'spawn'; side: Side; id: number; def: string }
  | { t: 'attack'; side: Side; id: number }
  | { t: 'strike'; side: Side; id: number; ranged: boolean }
  | { t: 'hit'; side: Side; id: number; amount: number; pos: number }
  | { t: 'defeat'; side: Side; id: number; def: string; pos: number }
  | { t: 'gold'; side: Side; amount: number; pos: number }
  | { t: 'baseHit'; side: Side; amount: number }
  | { t: 'turretBuilt'; side: Side; slot: number; how: 'build' | 'replace' | 'upgrade'; level: number }
  | { t: 'turretFire'; side: Side; slot: number }
  | { t: 'subsidy'; side: Side; level: number }
  | { t: 'eraUp'; side: Side; era: number }
  | { t: 'special'; side: Side; id: string }
  | { t: 'stunned'; side: Side; ids: number[]; ticks: number }
  | { t: 'buffed'; side: Side; ticks: number }
  | { t: 'healed'; side: Side; ids: number[] }
  /** Unit `id` was bought over and now fights for `side`, standing at `pos` in that side's frame. */
  | { t: 'converted'; side: Side; id: number; def: string; pos: number }
  /** An enemy special had no effect on these units of `side`. */
  | { t: 'shrugged'; side: Side; ids: number[] }
  /** The algorithm came down on unit `id` of `side`. */
  | { t: 'sniped'; side: Side; id: number; pos: number }
  /** A barrage blow landed on `side`: on unit `id`, or on the base when `id` is BASE. */
  | { t: 'barrageHit'; side: Side; id: number; pos: number }
  | { t: 'overtime' }
  /** Overtime turned the screw: units now hit `percent` of their normal damage harder. */
  | { t: 'escalate'; level: number; percent: number }
  /** Overtime has gone on so long that both bases start to crumble. */
  | { t: 'crumble' }
  | { t: 'win'; winner: Side | 'draw' };
