import { swing } from '../humanoid.ts';
import { rattle } from '../props.ts';
import type { ClipSet } from '../types.ts';
import { idling, jolt, limpHome, roll, shove, type RollStyle } from '../vehicle.ts';

/** The crank turns once per turn of the back wheel, so it is listed with the wheels. */
const WHEELS: RollStyle = {
  bigWheel: 23,
  wheels: { wheel_back: 23, wheel_front: 16, crank: 23 },
  bounce: 1.2,
  rock: 0.4,
};

/**
 * Bakfiets-Babette: pedals along with the plants swaying in the box, then
 * stands on the pedals and rams whatever is in front of the bak.
 */
export const bakfietsBabette: ClipSet = {
  idle: idling(1.8, 0.5, {
    cargo: { rot: [[0, -2], [0.5, 2, 'sineInOut'], [1, -2, 'sineInOut']] },
    rider: { rot: [[0, 0], [0.3, -4, 'sineInOut'], [0.7, 2, 'sineInOut'], [1, 0, 'sineInOut']] },
  }),

  walk: roll(WHEELS, {
    leg: { rot: swing(11) },
    rider: { y: [[0, 0], [0.5, -1.5, 'sineInOut'], [1, 0, 'sineInOut']], rate: 2 },
    cargo: { rot: swing(3.5), rate: 2 },
  }),

  attack: {
    loop: false,
    markers: { hit: 0.34 },
    tracks: {
      ...shove([[0, 0], [0.22, -9, 'out'], [0.34, 16, 'in'], [0.6, 5, 'out'], [1, 0, 'inOut']], WHEELS),
      body: { rot: [[0, 0], [0.22, -2, 'out'], [0.34, 3, 'in'], [0.6, -1, 'out'], [1, 0, 'inOut']] },
      rider: { rot: [[0, 0], [0.22, -10, 'out'], [0.34, 16, 'in'], [0.6, 5, 'out'], [1, 0, 'inOut']] },
      leg: { rot: [[0, 0], [0.22, -12, 'out'], [0.34, 14, 'in'], [1, 0, 'inOut']] },
      // Everything in the box jumps when she hits.
      cargo: {
        y: [[0, 0], [0.34, 0, 'hold'], [0.45, -9, 'out'], [0.62, 0, 'in'], [1, 0]],
        rot: [[0, 0], [0.22, -6, 'out'], [0.34, 9, 'in'], [0.5, -5, 'inOut'], [0.7, 3, 'inOut'], [1, 0, 'inOut']],
      },
    },
  },

  hit: jolt({
    cargo: { rot: rattle(7, 3) },
    rider: { rot: [[0, 0], [0.3, -12, 'out'], [1, 0, 'inOut']] },
  }),

  die: limpHome(WHEELS, {
    leg: { rot: swing(14), rate: 2 },
    rider: { rot: [[0, 12], [0.5, 18, 'sineInOut'], [1, 12, 'sineInOut']], rate: 2 },
    cargo: { rot: swing(9), rate: 3 },
  }),
};
