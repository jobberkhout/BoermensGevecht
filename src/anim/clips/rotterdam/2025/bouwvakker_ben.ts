import { bob, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

const STILL: Key[] = [[0, 0]];

/**
 * Bouwvakker Ben: a man behind a formwork panel with a permit stapled to it,
 * on his way to the next job, because the city is never finished. He looks
 * over the top for where the next hole in the road is, shoves with the whole
 * panel, and when something hits it, chips of old concrete fly off its face.
 * He does not even look up. Home he goes with the panel on his shoulder.
 */
const bouwvakkerBen: ClipSet = {
  idle: {
    loop: true,
    seconds: 3.4,
    tracks: {
      torso: { sy: [[0, 1], [0.5, 1.02, 'sineInOut'], [1, 1, 'sineInOut']] },
      // He looks over the top: this way, that way, where was it again?
      head: {
        rot: [[0, 0], [0.15, -8, 'inOut'], [0.35, -8, 'hold'], [0.5, 5, 'inOut'], [0.7, 5, 'hold'], [0.85, 0, 'inOut'], [1, 0]],
        y: [[0, 0], [0.15, -2, 'inOut'], [0.7, -2, 'hold'], [0.85, 0, 'inOut'], [1, 0]],
      },
      // The panel is heavy: he shifts it on his shoulder now and then.
      panel: {
        rot: [[0, 0], [0.86, 0, 'hold'], [0.9, -2, 'out'], [0.96, 0.6, 'inOut'], [1, 0, 'inOut']],
        y: [[0, 0], [0.86, 0, 'hold'], [0.9, -3, 'out'], [0.96, 0.6, 'in'], [1, 0, 'inOut']],
      },
      arm_front: { rot: [[0, 0], [0.86, 0, 'hold'], [0.9, -6, 'out'], [1, 0, 'inOut']] },
    },
  },

  walk: walk(
    { stride: 46, legSwing: 24, legLen: 38, armSwing: 0, lean: 4, sway: 1.2, headNod: 1.5 },
    {
      arm_front: { rot: STILL },
      arm_back: { rot: STILL },
      // The panel comes down a little with every step: it is heavier than it looks.
      panel: { y: bob(1.8, -2.4), rot: bob(-0.8) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      // Back a step, then forward with his shoulder in the panel.
      hips: { x: [[0, 0], [0.24, -3, 'out'], [0.4, 7, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.24, -5, 'out'], [0.4, 9, 'in'], [0.66, 4, 'out'], [1, 0, 'inOut']] },
      head: {
        rot: [[0, 0], [0.24, 4, 'out'], [0.4, -6, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.24, 0, 'hold'], [0.4, 4, 'in'], [0.7, 4, 'hold'], [1, 0, 'inOut']],
      },
      panel: {
        x: [[0, 0], [0.24, -3, 'out'], [0.4, 10, 'in'], [0.66, 3, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.24, -3, 'out'], [0.4, -1, 'in'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.24, -5, 'out'], [0.4, 4, 'in'], [1, 0, 'inOut']],
      },
      arm_front: { rot: [[0, 0], [0.24, 12, 'out'], [0.4, -30, 'in'], [0.66, -10, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: STILL },
      leg_front: { rot: [[0, 0], [0.24, 5, 'out'], [0.4, -14, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.24, -4, 'out'], [0.4, 12, 'in'], [1, 0, 'inOut']] },
    },
  },

  // Tok. Chips of concrete fly off the face of the panel; the panel shudders; he does not move.
  hit: {
    loop: false,
    seconds: 0.32,
    tracks: {
      panel: { x: rattle(3, 5), rot: rattle(2.2, 5) },
      chips: {
        x: [[0, 0], [0.12, 16, 'out'], [0.7, 26, 'out'], [1, 26, 'hold']],
        y: [[0, 0], [0.12, -8, 'out'], [0.45, -14, 'out'], [0.9, 2, 'in'], [1, 2, 'hold']],
        rot: [[0, 0], [1, 120, 'linear']],
        sx: [[0, 1], [0.12, 1.2, 'out'], [0.7, 0.9, 'inOut'], [1, 0, 'in']],
        sy: [[0, 1], [0.12, 1.2, 'out'], [0.7, 0.9, 'inOut'], [1, 0, 'in']],
      },
    },
  },

  die: slinkOff(
    { legLen: 38, stride: 64 },
    {
      // Off to the next job with the panel on his shoulder, edge on, trailing behind him.
      panel: { rot: [[0, -62]], sx: [[0, 0.2]], x: [[0, -24]], y: [[0, -50]] },
      arm_front: { rot: bob(4, -24) },
      arm_back: { rot: swing(-26, -14) },
      head: { rot: bob(4, 10) },
      // The chips would show past the edge of the plank: none of them on the way home.
      chips: { sx: STILL, sy: STILL },
    },
  ),
};

export default bouwvakkerBen;
