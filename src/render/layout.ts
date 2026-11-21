import { GATE_X, GROUND_Y, SUB } from '../defs/balance.ts';
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

/** Where turrets sit when the base art does not say (grey-box fallback). `dy` is measured up from the road. */
export const TURRET_SPOTS: readonly { dx: number; dy: number }[] = [
  { dx: -70, dy: -250 },
  { dx: -130, dy: -160 },
];
