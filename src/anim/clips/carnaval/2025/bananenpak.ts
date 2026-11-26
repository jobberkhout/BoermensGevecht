import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** Looking this way, looking that way: where is everybody? Where is anything? */
const LOOKING: Key[] = [[0, 0], [0.18, -9, 'sineInOut'], [0.4, -9, 'hold'], [0.56, 7, 'sineInOut'], [0.8, 7, 'hold'], [1, 0, 'sineInOut']];

/** The phone turned this way and that, as if the map would make sense the other way up. */
const TURNING: Key[] = [[0, 0], [0.3, 0, 'hold'], [0.45, 24, 'inOut'], [0.62, 24, 'hold'], [0.78, -10, 'inOut'], [0.9, -10, 'hold'], [1, 0, 'inOut']];

/**
 * Het Bananenpak: a visitor from above the rivers, in a banana suit, in the
 * wrong town. He looks around and turns his phone round, then marches on with
 * everyone else and shouts Alaaf anyway. He slaps whoever is in front of him
 * with his free hand, and the whole banana leans into it.
 */
const bananenpak: ClipSet = {
  idle: idle(
    { seconds: 3.4, breathe: 0.025, armSway: 2 },
    {
      head: { rot: LOOKING, y: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']] },
      phone: { rot: TURNING },
      arm_back: { rot: [[0, 0], [0.5, -3, 'sineInOut'], [1, 0, 'sineInOut']] },
      // The free hand comes up to scratch at the suit where his head should be. It does not help.
      arm_front: { rot: [[0, 0], [0.1, 0, 'hold'], [0.24, -24, 'inOut'], [0.36, -20, 'sineInOut'], [0.44, -24, 'sineInOut'], [0.56, 0, 'inOut'], [1, 0]] },
    },
  ),

  walk: walk(
    { stride: 44, legSwing: 24, legLen: 38, armSwing: 14, lean: 2, sway: 3, headNod: 3 },
    {
      // The tall banana top sways a beat behind the steps.
      head: { rot: [[0, -3], [0.25, 3, 'sineInOut'], [0.5, -3, 'sineInOut'], [0.75, 3, 'sineInOut'], [1, -3, 'sineInOut']] },
      arm_back: { rot: swing(3) },
      phone: { rot: swing(6, 4) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      // Wind up, then a flat-handed slap, the whole banana swinging after it.
      hips: { x: [[0, 0], [0.28, -3, 'out'], [0.45, 5, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.28, -8, 'out'], [0.45, 10, 'in'], [0.7, 5, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.28, -7, 'out'], [0.45, 6, 'in'], [0.6, 12, 'out'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.28, 46, 'out'], [0.45, -100, 'in'], [0.6, -84, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.28, 6, 'out'], [0.45, -6, 'in'], [1, 0, 'inOut']] },
      phone: { rot: [[0, 0], [0.28, 14, 'out'], [0.45, -10, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.28, 5, 'out'], [0.45, -12, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.28, -4, 'out'], [0.45, 10, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    head: { rot: rattle(-10, 3) },
    phone: { rot: [[0, 0], [0.3, 20, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 60 },
    {
      // Home, banana drooping, still looking at the map.
      torso: { rot: bob(3, 10) },
      head: { rot: [[0, 18], [0.5, 24, 'sineInOut'], [1, 18, 'sineInOut']] },
      arm_back: { rot: swing(4, 8) },
      phone: { rot: [[0, -14]] },
      arm_front: { rot: swing(30, -10) },
    },
  ),
};

export default bananenpak;
