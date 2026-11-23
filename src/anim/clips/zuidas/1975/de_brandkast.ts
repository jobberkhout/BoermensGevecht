import { bob, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

const STILL: Key[] = [[0, 0]];

/** The wheel of the sack truck has a radius of 9 px: this many degrees per pixel rolled. */
const DEG_PER_PX = 180 / (Math.PI * 9);

/** Wing beats: `n` of them per loop. */
function beats(n: number): Key[] {
  const keys: Key[] = [[0, 1]];
  for (let i = 0; i < n; i++) {
    keys.push([(i + 0.5) / n, 0.25, 'sineInOut'], [(i + 1) / n, 1, 'sineInOut']);
  }
  return keys;
}

/**
 * De brandkast: the cashier, behind the safe on its sack truck. Standing
 * still, all you see of him is his eyeshade; then two eyes come up over the
 * edge, look left and right, and go down again. To move he tips the truck
 * back and rolls it; to hit he rams it. What hits the safe makes it ring and
 * sets the dial spinning, and he does not feel a thing. When it is over he
 * wheels it home with the door hanging open: there was never anything in it.
 */
const deBrandkast: ClipSet = {
  idle: idle(
    { seconds: 3.8, breathe: 0.02, armSway: 0 },
    {
      // Down behind the safe, up for a look, down again.
      head: {
        y: [[0, 8], [0.24, 8, 'hold'], [0.33, -3, 'out'], [0.72, -3, 'hold'], [0.82, 8, 'in'], [1, 8, 'hold']],
        rot: [[0, 0], [0.33, 0, 'hold'], [0.43, -6, 'sineInOut'], [0.57, 5, 'sineInOut'], [0.69, 0, 'sineInOut'], [1, 0, 'hold']],
      },
      torso: {
        sy: [[0, 1], [0.5, 1.02, 'sineInOut'], [1, 1, 'sineInOut']],
        rot: [[0, 3], [0.24, 3, 'hold'], [0.33, 0, 'out'], [0.72, 0, 'hold'], [0.82, 3, 'in'], [1, 3, 'hold']],
      },
      arm_front: { rot: STILL },
      arm_back: { rot: STILL },
      // He drums his fingers on the lid while he works up the courage.
      fingers: { sy: [[0, 1], [0.04, 0.5, 'out'], [0.08, 1, 'in'], [0.12, 0.5, 'out'], [0.16, 1, 'in'], [0.2, 0.5, 'out'], [0.24, 1, 'in'], [1, 1, 'hold']] },
    },
  ),

  walk: walk(
    // One cycle is three quarters of a turn of the wheel, which has four spokes: no skidding, no jump.
    { stride: 42.4, legSwing: 22, legLen: 38, armSwing: 0, lean: 3, sway: 1.5, headNod: 2 },
    {
      // Tipped back on its wheel, with a bump at every step.
      truck: { rot: bob(-0.9, -4) },
      wheel: { rot: [[0, 0], [1, 270, 'linear']] },
      safe: { y: bob(-0.7), rot: bob(0.5) },
      arm_front: { rot: [[0, 3]], x: [[0, -4.4]] },
      arm_back: { rot: STILL },
      head: { rot: bob(-2), y: [[0, -2]] },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      // He hauls it back onto its wheel and runs it into whoever is in front.
      truck: {
        x: [[0, 0], [0.24, -4, 'out'], [0.4, 10, 'in'], [0.62, 4, 'out'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.24, -8, 'out'], [0.4, 4, 'in'], [0.56, -2, 'out'], [1, 0, 'inOut']],
      },
      wheel: { rot: [[0, 0], [0.24, -4 * DEG_PER_PX, 'out'], [0.4, 10 * DEG_PER_PX, 'in'], [0.62, 4 * DEG_PER_PX, 'out'], [1, 0, 'inOut']] },
      safe: {
        y: [[0, 0], [0.4, 0, 'hold'], [0.46, -3, 'out'], [0.58, 0, 'in'], [1, 0]],
        rot: [[0, 0], [0.4, 0, 'hold'], [0.46, 3, 'out'], [0.6, -1.5, 'inOut'], [0.76, 0, 'inOut'], [1, 0]],
      },
      // The bang sets the dial going: once round.
      dial: { rot: [[0, 0], [0.4, 0, 'hold'], [0.92, 360, 'out'], [1, 360]] },
      handle: { rot: [[0, 0], [0.4, 0, 'hold'], [0.5, 30, 'out'], [0.7, -12, 'inOut'], [0.86, 0, 'inOut'], [1, 0]] },
      hips: { x: [[0, 0], [0.24, -3, 'out'], [0.4, 7, 'in'], [0.62, 3, 'out'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.24, -6, 'out'], [0.4, 8, 'in'], [0.62, 4, 'out'], [1, 0, 'inOut']] },
      head: {
        rot: [[0, 0], [0.24, 4, 'out'], [0.4, -5, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.3, 0, 'hold'], [0.4, 5, 'in'], [0.7, 5, 'hold'], [1, 0, 'inOut']],
      },
      arm_front: {
        x: [[0, 0], [0.24, -6, 'out'], [0.4, 2.5, 'in'], [0.62, 0, 'out'], [1, 0]],
        rot: [[0, 0], [0.24, 10, 'out'], [0.4, -12, 'in'], [0.62, -4, 'out'], [1, 0, 'inOut']],
      },
      arm_back: { rot: [[0, 0], [0.24, 6, 'out'], [0.4, -8, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.24, 5, 'out'], [0.4, -14, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.24, -4, 'out'], [0.4, 12, 'in'], [1, 0, 'inOut']] },
    },
  },

  // Ting. The safe rings on the truck, the dial jumps, the handle rattles. Behind it nothing moves.
  hit: {
    loop: false,
    seconds: 0.32,
    tracks: {
      safe: { x: rattle(2.6, 6), rot: rattle(1.8, 6) },
      dial: { rot: rattle(28, 5) },
      handle: { rot: rattle(14, 4) },
    },
  },

  die: slinkOff(
    // One cycle is one full turn of the wheel.
    { legLen: 38, stride: 56.5 },
    {
      // Home, at a trot, with the door hanging open. It is empty. It was always empty.
      torso: { rot: bob(2, 0) },
      head: { rot: bob(3, 2), y: [[0, -6]] },
      arm_front: { rot: [[0, 4]], x: [[0, -5.5]] },
      arm_back: { rot: STILL },
      truck: { rot: bob(-1.4, -5) },
      wheel: { rot: [[0, 0], [1, 360, 'linear']] },
      safe: { y: bob(-1), rot: bob(0.7) },
      door: { sx: [[0, 0.3], [0.5, 0.46, 'sineInOut'], [1, 0.3, 'sineInOut']] },
      // The moth that lives in it has the place to itself.
      moth: { x: swing(5), y: swing(8, -2, 0.25), rot: swing(24), sx: beats(8) },
    },
  ),
};

export default deBrandkast;
