import { bob, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

const STILL: Key[] = [[0, 0]];

/** A part that is not there in this clip. */
const GONE = { sx: STILL, sy: STILL };

/** The light flickers a little, as these panels do. */
const FLICKER: Key[] = [[0, 1], [0.3, 1, 'hold'], [0.34, 0.75, 'hold'], [0.38, 1, 'hold'], [0.7, 1, 'hold'], [0.73, 0.85, 'hold'], [0.76, 1, 'hold'], [1, 1]];

/**
 * De Trouwfilmer: the wedding cameraman behind a light panel the size of a
 * door. He films everything, from over the top of the panel, because the family
 * will watch every minute of it afterwards. What hits the panel rattles it and
 * makes it flare; he keeps filming. Beaten, he leaves the panel and goes home
 * still recording.
 */
const deTrouwfilmer: ClipSet = {
  idle: {
    loop: true,
    seconds: 3.2,
    tracks: {
      torso: { sy: [[0, 1], [0.5, 1.02, 'sineInOut'], [1, 1, 'sineInOut']] },
      // He pans slowly across the scene, and back.
      head: { rot: [[0, 0], [0.4, -5, 'sineInOut'], [0.8, 3, 'sineInOut'], [1, 0, 'sineInOut']] },
      camera: { rot: [[0, 0], [0.4, -3, 'sineInOut'], [0.8, 2, 'sineInOut'], [1, 0, 'sineInOut']] },
      rays: { sx: FLICKER, sy: FLICKER },
    },
  },

  walk: walk(
    { stride: 44, legSwing: 22, legLen: 38, armSwing: 0, lean: 3, sway: 1, headNod: 1 },
    {
      arm_front: { rot: STILL },
      arm_back: { rot: STILL },
      // The stand drags along the road with every step; the camera stays level.
      panel: { y: bob(1.6, -2.4) },
      camera: { rot: bob(-1) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      // A shove with the whole panel, and a blinding flash on the hit.
      hips: { x: [[0, 0], [0.24, -3, 'out'], [0.4, 6, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.24, -5, 'out'], [0.4, 8, 'in'], [0.66, 4, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.24, 4, 'out'], [0.4, -6, 'in'], [1, 0, 'inOut']] },
      panel: {
        x: [[0, 0], [0.24, -3, 'out'], [0.4, 9, 'in'], [0.66, 3, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.24, -3, 'out'], [0.4, -1, 'in'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.24, -4, 'out'], [0.4, 3, 'in'], [1, 0, 'inOut']],
      },
      rays: { sx: [[0, 1], [0.38, 1, 'hold'], [0.42, 2.2, 'out'], [0.75, 1, 'in'], [1, 1]], sy: [[0, 1], [0.38, 1, 'hold'], [0.42, 1.8, 'out'], [0.75, 1, 'in'], [1, 1]] },
      arm_front: { rot: [[0, 0], [0.24, 12, 'out'], [0.4, -34, 'in'], [0.66, -12, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: STILL },
      leg_front: { rot: [[0, 0], [0.24, 5, 'out'], [0.4, -12, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.24, -4, 'out'], [0.4, 10, 'in'], [1, 0, 'inOut']] },
    },
  },

  // Tok. It bounces off the panel, the lamps flare, and the camera keeps rolling.
  hit: {
    loop: false,
    seconds: 0.3,
    tracks: {
      panel: { x: rattle(3.4, 6), rot: rattle(2.4, 6) },
      rays: { sx: [[0, 1], [0.15, 1.9, 'out'], [1, 1, 'in']], sy: [[0, 1], [0.15, 1.6, 'out'], [1, 1, 'in']] },
    },
  },

  die: slinkOff(
    { legLen: 38, stride: 64 },
    {
      // The panel stays behind. He goes home filming over his shoulder.
      panel: GONE,
      rays: GONE,
      arm_front: { rot: swing(30, -40) },
      head: { rot: bob(3, -6) },
      camera: { rot: [[0, -10]] },
    },
  ),
};

export default deTrouwfilmer;
