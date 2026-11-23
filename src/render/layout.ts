import { GATE_X, GROUND_Y, SUB, WORLD_W } from '../defs/balance.ts';
import type { Side } from '../sim/types.ts';

/** Where sim positions land on the 1920x1080 stage. */

/** +1 for the left player (walks right), -1 for the right player. */
export const dirOf = (side: Side): number => (side === 0 ? 1 : -1);

/** Vertical distance between two rows. */
export const ROW_DY = 26;
export const rowY = (row: number): number => GROUND_Y + (row - 1) * ROW_DY;
/** Nearer rows are drawn a little larger. */
export const rowScale = (row: number): number => 1 + (row - 1) * 0.06;

/** Stage x of a lane position (sub-units from `side`'s gate). */
export const laneX = (side: Side, pos: number): number => GATE_X[side] + dirOf(side) * (pos / SUB);

/** Turret scenes are drawn larger than their art, so the jokes in them can be seen. */
export const TURRET_SCALE = 1.4;

/**
 * Where turret scenes stand when the base art has no markers for them (the grey
 * box): stacked like two floors. `dx` is measured from the gate into the base,
 * `dy` up from the road.
 */
export const TURRET_SPOTS: readonly { dx: number; dy: number }[] = [
  { dx: -150, dy: -150 },
  { dx: -150, dy: -300 },
];

/**
 * Where the scene of a special stands that lasts a while (a band, a gong, a
 * fee on a cloud): beside its owner's base, on the verge behind the road. `dx` is
 * measured from the gate onto the lane, `dy` up from the road.
 */
export const BAND_SPOT = { dx: 160, dy: -56 } as const;

/** Where a side's purse is written in the HUD, as a spot on the stage: money that changes hands leaves from here. */
export const purseSpot = (side: Side): { x: number; y: number } => ({ x: side === 0 ? 110 : WORLD_W - 110, y: 790 });
