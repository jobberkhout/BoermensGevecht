/**
 * Animations are plain data: for each part, a few keyframes per channel.
 * The helpers in humanoid.ts and vehicle.ts return this same data, so there is
 * one sampler and nothing magic.
 */

export type Ease =
  | 'linear'
  | 'in' // starts slow
  | 'out' // ends slow
  | 'inOut'
  | 'sineIn'
  | 'sineOut'
  | 'sineInOut'
  | 'backOut' // overshoots a little, then settles
  | 'hold'; // keeps the previous value until this key, then jumps

/** [when (0..1), value, how to arrive at this value]. Rotation is in degrees, clockwise on screen. */
export type Key = readonly [u: number, value: number, ease?: Ease];

export interface Track {
  rot?: readonly Key[];
  x?: readonly Key[];
  y?: readonly Key[];
  sx?: readonly Key[];
  sy?: readonly Key[];
  /** Runs this track several times per cycle of the clip, e.g. a small wheel that turns twice as often. */
  rate?: number;
}

export interface Clip {
  /** By part id. Parts without a track stay in their rest pose. */
  tracks: Record<string, Track>;
  loop: boolean;
  /** Length in seconds, for clips that run on the clock (idle, hit, die). */
  seconds?: number;
  /** Pixels travelled per cycle, for clips driven by movement (walk, wheels). No sliding feet. */
  stride?: number;
  /**
   * Attack clips say where the blow lands (0..1). The game decides when that
   * is; the renderer stretches the clip so this moment falls on that tick.
   */
  markers?: { hit: number };
}

export interface ClipSet {
  idle: Clip;
  walk: Clip;
  attack: Clip;
  /** Laid on top of whatever else is playing when the unit is struck. */
  hit: Clip;
  /** Loops while a beaten unit slinks off home. */
  die: Clip;
  /** Laid on top of whatever else is playing when one aboard tosses something: the beer bikes (UnitDef.toss). */
  toss?: Clip;
  /**
   * The pole vaulter's leap over the first enemy it meets (UnitDef.vault). Played once, from the
   * start of the leap to the landing; the game carries the body along the arc, so the feet stay at
   * the origin and the clip does the pole, the limbs and the tumble.
   */
  vault?: Clip;
  /** Loops in place of idle while a unit sits dazed after a stunt of its own: the vaulter after landing, the skater who could not brake. */
  dazed?: Clip;
}

/** The clips every unit has. */
export const CLIP_NAMES: readonly (keyof ClipSet)[] = ['idle', 'walk', 'attack', 'hit', 'die'];
/** Clips laid on top of whatever else is playing, rather than played by themselves. */
export const OVERLAY_CLIPS: readonly (keyof ClipSet)[] = ['hit', 'toss'];
