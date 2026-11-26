import { flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';

/** Where everything is while he sits on his bottom in the snow, after the landing. */
const SIT = {
  hips: 28,
  torso: -12,
  legFront: -88,
  legBack: -78,
  armFront: -28,
  armBack: 38,
  pole: -40,
  head: -6,
};

/** A part that stays where the sit pose has it. */
const still = (value: number): Key[] => [[0, value]];

/** The sit pose as tracks, with room to add a wobble on top. */
function sitting(extra: Record<string, Track> = {}): Record<string, Track> {
  return {
    hips: { y: still(SIT.hips) },
    torso: { rot: still(SIT.torso) },
    leg_front: { rot: still(SIT.legFront) },
    leg_back: { rot: still(SIT.legBack) },
    arm_front: { rot: still(SIT.armFront) },
    arm_back: { rot: still(SIT.armBack) },
    pole: { rot: still(SIT.pole) },
    head: { rot: still(SIT.head) },
    ...extra,
  };
}

/**
 * De Fierljepper: shivers on the spot leaning on his pole, trots along with
 * it, and clubs whoever is in front of him with it. His trick: at the first
 * enemy he meets he plants the pole and goes over the top, head over heels,
 * legs everywhere, and comes down on his bottom on the other side, where he
 * sits for a moment wondering what happened.
 */
const fierljepper: ClipSet = {
  idle: idle(
    { seconds: 2.8, breathe: 0.03, armSway: 0 },
    {
      // Cold: a fast little shiver all the time, and now and then a stamp of the feet.
      torso: { rot: [[0, 0], [0.5, 1.4, 'linear'], [1, 0, 'linear']], rate: 14, sy: [[0, 1], [0.5, 1.03, 'sineInOut'], [1, 1, 'sineInOut']] },
      arm_back: { rot: [[0, 4], [0.5, -2, 'linear'], [1, 4, 'linear']], rate: 14 },
      arm_front: { rot: [[0, 0]] },
      pole: { rot: [[0, 0], [0.5, -2, 'sineInOut'], [1, 0, 'sineInOut']] },
      leg_front: { rot: [[0, 0], [0.62, 0, 'hold'], [0.68, -12, 'out'], [0.74, 0, 'in'], [0.8, -10, 'out'], [0.86, 0, 'in'], [1, 0, 'hold']] },
      head: {
        y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']],
        rot: [[0, 0], [0.3, -5, 'sineInOut'], [0.55, 4, 'sineInOut'], [1, 0, 'sineInOut']],
      },
      scarf: { rot: swing(5, 0) },
    },
  ),

  walk: walk(
    { stride: 54, legSwing: 30, legLen: 38, armSwing: 24, lean: 7, sway: 2.5, headNod: 3 },
    {
      // The pole arm stays forward; the pole bobs along with every step.
      arm_front: { rot: swing(6, -6) },
      pole: { rot: swing(5, 4) },
      scarf: { rot: swing(12, -6), rate: 2 },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      hips: {
        x: [[0, 0], [0.28, -4, 'out'], [0.45, 6, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.28, -2, 'out'], [0.45, 2, 'in'], [1, 0, 'inOut']],
      },
      torso: { rot: [[0, 0], [0.28, -12, 'out'], [0.45, 14, 'in'], [0.7, 6, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.28, 8, 'out'], [0.45, -6, 'in'], [1, 0, 'inOut']] },
      // Up goes the pole, over backwards, and down it comes like a felled tree.
      arm_front: { rot: [[0, 0], [0.28, -70, 'out'], [0.45, -10, 'in'], [0.65, -16, 'out'], [1, 0, 'inOut']] },
      pole: { rot: [[0, 0], [0.28, -24, 'out'], [0.45, 72, 'in'], [0.62, 64, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.28, 30, 'out'], [0.45, -30, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.28, 6, 'out'], [0.45, -18, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.28, -5, 'out'], [0.45, 14, 'in'], [1, 0, 'inOut']] },
      scarf: { rot: [[0, 0], [0.28, 10, 'out'], [0.45, -14, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    pole: { rot: [[0, 0], [0.3, -14, 'out'], [1, 0, 'inOut']] },
    scarf: { rot: [[0, 0], [0.3, 18, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 66 },
    {
      // Beaten, the pole dragged along behind him, its far end scraping through the snow.
      arm_front: { rot: swing(4, 30) },
      pole: { rot: swing(3, -150) },
      head: { rot: [[0, 14], [0.25, 18, 'sineInOut'], [0.5, 14, 'sineInOut'], [0.75, 18, 'sineInOut'], [1, 14, 'sineInOut']] },
      scarf: { rot: swing(8, 20), rate: 2 },
    },
  ),

  // Run-up, plant, and over the top. The game carries him along the arc; this is what he does on the way.
  vault: {
    loop: false,
    seconds: 0.6,
    tracks: {
      // Crouch, spring, a full somersault forwards, and down on his bottom. The last turn is
      // swapped for the same angle the other way round, so the clip ends where the sit begins.
      hips: {
        y: [[0, 0], [0.12, 7, 'out'], [0.3, -6, 'out'], [0.8, -2, 'inOut'], [1, SIT.hips, 'in']],
        rot: [[0, 0], [0.14, 8, 'out'], [0.36, 90, 'in'], [0.62, 220, 'linear'], [0.86, 352, 'out'], [0.87, -8, 'hold'], [1, 0, 'out']],
      },
      torso: { rot: [[0, 0], [0.14, 14, 'out'], [0.4, -10, 'inOut'], [0.8, 4, 'inOut'], [1, SIT.torso, 'out']] },
      head: { rot: [[0, 0], [0.14, -10, 'out'], [0.5, 16, 'inOut'], [0.8, -14, 'inOut'], [1, SIT.head, 'out']] },
      // Both hands on the pole to plant it, then he lets go and windmills.
      arm_front: { rot: [[0, 0], [0.14, -55, 'out'], [0.34, -150, 'inOut'], [0.6, -60, 'inOut'], [0.8, -140, 'inOut'], [1, SIT.armFront, 'out']] },
      arm_back: { rot: [[0, 0], [0.14, -70, 'out'], [0.34, -160, 'inOut'], [0.55, 20, 'inOut'], [0.75, -120, 'inOut'], [1, SIT.armBack, 'out']] },
      // The foot of the pole goes forward into the ditch, the pole tips over, and it comes down beside him.
      pole: { rot: [[0, 0], [0.14, -34, 'out'], [0.34, 30, 'inOut'], [0.6, 80, 'inOut'], [0.8, -20, 'inOut'], [1, SIT.pole, 'out']] },
      // Legs everywhere.
      leg_front: { rot: [[0, 0], [0.14, 20, 'out'], [0.3, 40, 'out'], [0.42, -50, 'inOut'], [0.54, 30, 'inOut'], [0.66, -60, 'inOut'], [0.78, 10, 'inOut'], [1, SIT.legFront, 'out']] },
      leg_back: { rot: [[0, 0], [0.14, 30, 'out'], [0.3, 60, 'out'], [0.42, 10, 'inOut'], [0.54, -60, 'inOut'], [0.66, 20, 'inOut'], [0.78, -50, 'inOut'], [1, SIT.legBack, 'out']] },
      scarf: { rot: [[0, 0], [0.3, 40, 'out'], [0.6, -30, 'inOut'], [0.85, 50, 'inOut'], [1, 10, 'out']] },
    },
  },

  // On his bottom in the snow, legs out, the head going round and round with the stars.
  dazed: {
    loop: true,
    seconds: 1,
    tracks: sitting({
      head: { rot: [[0, -14], [0.25, -2, 'sineInOut'], [0.5, 10, 'sineInOut'], [0.75, -2, 'sineInOut'], [1, -14, 'sineInOut']], x: swing(2) },
      torso: { rot: [[0, SIT.torso - 4], [0.5, SIT.torso + 4, 'sineInOut'], [1, SIT.torso - 4, 'sineInOut']] },
      arm_front: { rot: [[0, SIT.armFront], [0.5, SIT.armFront + 10, 'sineInOut'], [1, SIT.armFront, 'sineInOut']] },
      scarf: { rot: [[0, 20], [0.5, 26, 'sineInOut'], [1, 20, 'sineInOut']] },
    }),
  },
};

export default fierljepper;
