import { bob, swing } from '../../../humanoid.ts';
import type { ClipSet, Key } from '../../../types.ts';
import { idling, jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

const WHEELS: RollStyle = {
  bigWheel: 15,
  wheels: { wheel_back: 15, wheel_front: 15 },
  bounce: 2.4,
  rock: 1.6,
};

/** The zakdoek streams out behind him and flaps. */
const FLAP: Key[] = [[0, -8], [0.5, 12, 'sineInOut'], [1, -8, 'sineInOut']];

/**
 * Quadink: tears along with his zakdoek flapping, then pulls a wheelie and
 * drops the front wheels on whoever is in the way.
 */
const quadink: ClipSet = {
  idle: idling(0.28, 1.3, {
    rider: { rot: [[0, 0], [0.5, 2, 'sineInOut'], [1, 0, 'sineInOut']] },
    scarf: { rot: [[0, 20], [0.5, 30, 'sineInOut'], [1, 20, 'sineInOut']] },
  }),

  walk: roll(WHEELS, {
    rider: { y: bob(2.2), rot: [[0, 0], [0.5, 4, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
    scarf: { rot: FLAP, rate: 6 },
  }),

  attack: (() => {
    const tracks = shove([[0, 0], [0.28, -7, 'out'], [0.43, 15, 'in'], [0.7, 5, 'out'], [1, 0, 'inOut']], WHEELS);
    return {
      loop: false,
      markers: { hit: 0.43 },
      tracks: {
        ...tracks,
        // The wheelie: the nose comes up, then slams down on the hit.
        chassis: {
          ...tracks.chassis,
          rot: [[0, 0], [0.28, -19, 'out'], [0.43, 4, 'in'], [0.6, -2, 'out'], [1, 0, 'inOut']],
          y: [[0, 0], [0.28, -8, 'out'], [0.43, 0, 'in'], [1, 0]],
        },
        rider: { rot: [[0, 0], [0.28, -12, 'out'], [0.43, 14, 'in'], [0.7, 4, 'out'], [1, 0, 'inOut']] },
        scarf: { rot: [[0, 0], [0.28, 40, 'out'], [0.43, -20, 'in'], [1, 0, 'inOut']] },
      },
    };
  })(),

  hit: jolt({
    rider: { rot: [[0, 0], [0.3, -16, 'out'], [1, 0, 'inOut']] },
  }),

  die: limpHome(WHEELS, {
    rider: { rot: swing(5, 14), rate: 2 },
    scarf: { rot: FLAP, rate: 4 },
  }),
};

export default quadink;
