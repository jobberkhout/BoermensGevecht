import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';

/** The tray's answer to a torso and arm track: the same keys, the other way, so it stays flat on his hand. */
function level(torso: readonly Key[], arm = 0): Key[] {
  return torso.map((k): Key => [k[0], -k[1] - arm, k[2]]);
}

const STILL: Key[] = [[0, 0]];
/** The tray leaves with the throw and a fresh one comes out of the bag near the end. */
const TRAY: Key[] = [[0, 1], [0.44, 1, 'hold'], [0.46, 0, 'hold'], [0.8, 0, 'hold'], [0.9, 1, 'backOut'], [1, 1]];
const GONE: Track = { sx: STILL, sy: STILL };

const WALK_TORSO = bob(2, 9);
const RUN_TORSO = bob(3, 16);

/**
 * De Kapsalonkoerier: always on his way to the next address. He carries the
 * kapsalon on his flat hand like a waiter, keeps an eye on the phone on his
 * strap, and flings the tray like a frisbee. He reaches over his shoulder into
 * the bag for the next one. The garlic sauce goes everywhere; that is the game's
 * part.
 */
const kapsalonkoerier: ClipSet = {
  idle: idle(
    { seconds: 2.6, breathe: 0.03, armSway: 0 },
    {
      // A look down at the phone on his strap, a look up the road: where is number 37?
      head: {
        rot: [[0, 0], [0.15, 14, 'inOut'], [0.4, 14, 'hold'], [0.55, -4, 'inOut'], [0.8, -4, 'hold'], [1, 0, 'inOut']],
        y: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']],
      },
      arm_front: { rot: STILL },
      tray: { rot: STILL, y: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']] },
      steam: { sy: [[0, 0.7], [0.5, 1.15, 'sineInOut'], [1, 0.7, 'sineInOut']], sx: [[0, 1], [0.5, 0.85, 'sineInOut'], [1, 1, 'sineInOut']], rate: 2 },
      // He shifts from one foot to the other: he has been standing too long already.
      leg_back: { rot: [[0, 0], [0.6, 0, 'hold'], [0.7, -10, 'out'], [0.8, 0, 'in'], [1, 0]] },
      bag: { rot: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  ),

  walk: walk(
    { stride: 54, legSwing: 32, legLen: 38, armSwing: 24, lean: 9, sway: 2, headNod: 2 },
    {
      // Hurrying, the tray held level whatever the rest of him does.
      torso: { rot: WALK_TORSO },
      arm_front: { rot: STILL },
      tray: { rot: level(WALK_TORSO) },
      bag: { rot: [[0, 1], [0.25, -2, 'sineInOut'], [0.5, 1, 'sineInOut'], [0.75, -2, 'sineInOut'], [1, 1, 'sineInOut']], y: bob(-1.4) },
      steam: { rot: swing(-14, -16) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      // Back with the tray, and a frisbee throw. Then over the shoulder into the bag for the next one.
      torso: { rot: [[0, 0], [0.26, -10, 'out'], [0.45, 10, 'in'], [0.62, 2, 'out'], [0.8, -4, 'inOut'], [1, 0, 'inOut']] },
      hips: { x: [[0, 0], [0.26, -3, 'out'], [0.45, 4, 'in'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, -4, 'out'], [0.45, 4, 'in'], [0.66, 12, 'inOut'], [0.85, 12, 'hold'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.26, 40, 'out'], [0.45, -42, 'in'], [0.56, -50, 'out'], [0.74, 150, 'inOut'], [0.86, 150, 'hold'], [1, 0, 'inOut']] },
      tray: { rot: [[0, 0], [0.26, -24, 'out'], [0.45, 30, 'in'], [0.74, -150, 'hold'], [0.86, -150, 'hold'], [1, 0, 'inOut']], sx: TRAY, sy: TRAY },
      steam: GONE,
      bag: { rot: [[0, 0], [0.45, 0, 'hold'], [0.74, -4, 'inOut'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 6, 'out'], [0.45, -14, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -4, 'out'], [0.45, 10, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    // The kapsalon wobbles; nothing falls off. He is a professional.
    arm_front: { rot: [[0, 0], [0.3, -10, 'out'], [1, 0, 'inOut']] },
    tray: { rot: rattle(10, 3) },
    bag: { rot: [[0, 0], [0.3, 4, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 70 },
    {
      // Off home with the empty bag bouncing on his back and nothing on his hand.
      torso: { rot: RUN_TORSO },
      arm_front: { rot: swing(20, 30) },
      tray: GONE,
      steam: GONE,
      bag: { rot: swing(5, 2), rate: 2 },
    },
  ),
};

export default kapsalonkoerier;
