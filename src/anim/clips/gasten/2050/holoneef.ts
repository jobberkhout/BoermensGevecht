import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** The bad connection: the slices are gone most of the time and flash up now and then. */
const GLITCH: Key[] = [[0, 0], [0.28, 0, 'hold'], [0.3, 1.2, 'hold'], [0.33, 0.6, 'hold'], [0.36, 0, 'hold'], [0.7, 0, 'hold'], [0.72, 1, 'hold'], [0.75, 0, 'hold'], [1, 0, 'hold']];
/** With every glitch the whole of him jumps sideways for a frame. */
const JUMP: Key[] = [[0, 0], [0.28, 0, 'hold'], [0.3, 2.4, 'hold'], [0.33, -1.4, 'hold'], [0.36, 0, 'hold'], [0.7, 0, 'hold'], [0.72, -2, 'hold'], [0.75, 0, 'hold'], [1, 0, 'hold']];
/** The projector hums: the disc and its light breathe. */
const HUM: Key[] = [[0, 1], [0.5, 1.08, 'sineInOut'], [1, 1, 'sineInOut']];

/**
 * De Hologramneef. Somebody posted in the family app and he came, as a
 * hologram, from his own sofa. Standing, he holds the phone up and checks how
 * he looks; the picture glitches now and then. He swats with the selfie stick,
 * and in between he sends a voice message off with a flick of his free hand.
 * Beaten, he walks off with the phone held high, looking for a better signal.
 */
const holoneef: ClipSet = {
  idle: idle(
    { seconds: 3, breathe: 0.025, armSway: 0 },
    {
      // Phone up, a look at the screen, chin up, a better angle.
      arm_front: { rot: [[0, 0], [0.2, -10, 'inOut'], [0.45, -10, 'hold'], [0.55, 4, 'inOut'], [0.8, 4, 'hold'], [1, 0, 'inOut']] },
      stick: { rot: [[0, 0], [0.2, -8, 'inOut'], [0.45, -8, 'hold'], [0.55, 6, 'inOut'], [0.8, 6, 'hold'], [1, 0, 'inOut']] },
      head: {
        rot: [[0, 0], [0.2, -8, 'inOut'], [0.45, -8, 'hold'], [0.55, 4, 'inOut'], [0.8, 4, 'hold'], [1, 0, 'inOut']],
        y: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']],
      },
      hips: { x: JUMP },
      glitch: { sx: GLITCH, x: JUMP },
      disc: { sx: HUM },
      beam: { sx: HUM },
    },
  ),

  walk: walk(
    { stride: 50, legSwing: 24, legLen: 38, armSwing: 14, lean: 3, sway: 1.5, headNod: 2 },
    {
      // The phone stays up while he walks: this has to be filmed.
      arm_front: { rot: swing(5, -6) },
      stick: { rot: swing(4) },
      glitch: { sx: GLITCH, x: JUMP },
      disc: { sx: HUM, rate: 2 },
      beam: { sx: HUM, rate: 2 },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      hips: { x: [[0, 0], [0.25, -3, 'out'], [0.45, 7, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.25, -10, 'out'], [0.45, 14, 'in'], [0.7, 5, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.25, -6, 'out'], [0.45, 8, 'in'], [1, 0, 'inOut']] },
      // Stick back over the shoulder, then down on whoever is in front of him.
      arm_front: { rot: [[0, 0], [0.25, -54, 'out'], [0.45, 46, 'in'], [0.66, 30, 'out'], [1, 0, 'inOut']] },
      stick: { rot: [[0, 0], [0.25, -24, 'out'], [0.45, 34, 'in'], [0.66, 20, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.25, 14, 'out'], [0.45, -14, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.25, 6, 'out'], [0.45, -18, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.25, -4, 'out'], [0.45, 12, 'in'], [1, 0, 'inOut']] },
      glitch: { sx: [[0, 0], [0.44, 0, 'hold'], [0.46, 1.3, 'hold'], [0.52, 0, 'hold'], [1, 0, 'hold']] },
    },
  },

  hit: flinch({
    // Struck, the picture breaks up for a moment.
    glitch: { sx: [[0, 0], [0.1, 1.4, 'hold'], [0.3, 0.5, 'hold'], [0.5, 1.1, 'hold'], [0.7, 0, 'hold'], [1, 0]], x: rattle(4, 4) },
    torso: { rot: [[0, 0], [0.25, -14, 'out'], [1, 0, 'inOut']], sx: [[0, 1], [0.15, 0.9, 'hold'], [0.35, 1.05, 'hold'], [0.55, 1, 'hold'], [1, 1]] },
    stick: { rot: [[0, 0], [0.3, 20, 'out'], [1, 0, 'inOut']] },
  }),

  // Laid on top of whatever else plays: the free hand winds up behind him and throws the voice message
  // overhand at the enemy, with a little lean into it. The phone and the stick stay where the swat or the
  // walk has them.
  toss: {
    loop: false,
    seconds: 0.55,
    tracks: {
      arm_back: { rot: [[0, 0], [0.3, 110, 'out'], [0.55, -100, 'in'], [0.75, -70, 'out'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.3, -5, 'out'], [0.55, 7, 'in'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.3, -4, 'out'], [0.55, 5, 'in'], [1, 0, 'inOut']] },
    },
  },

  die: slinkOff(
    { legLen: 38, stride: 70 },
    {
      // Off he goes, phone held high above his head, looking for a signal.
      arm_front: { rot: [[0, -60], [0.5, -68, 'sineInOut'], [1, -60, 'sineInOut']] },
      stick: { rot: swing(8, 40), rate: 2 },
      head: { rot: bob(3, -6) },
      glitch: { sx: GLITCH, x: JUMP, rate: 2 },
      beam: { sx: [[0, 0.8]] },
    },
  ),
};

export default holoneef;
