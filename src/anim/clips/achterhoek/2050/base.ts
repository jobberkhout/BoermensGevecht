import type { Clip } from '../../../types.ts';

/**
 * Boerderij 3000. The windmill turns: a third of a turn of its three blades
 * looks like no turn at all, so the loop is seamless. The hologram of the
 * weathercock hovers and drops a frame now and then.
 */
const baseClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 2,
    tracks: {
      blades: { rot: [[0, 0], [1, 120, 'linear']] },
      holo: {
        y: [[0, 0], [0.5, -2.4, 'sineInOut'], [1, 0, 'sineInOut']],
        sx: [[0, 1], [0.3, 1, 'hold'], [0.33, 0.7, 'hold'], [0.36, 1.1, 'hold'], [0.39, 1, 'hold'], [0.78, 1, 'hold'], [0.8, 0.85, 'hold'], [0.83, 1, 'hold'], [1, 1]],
        sy: [[0, 1], [0.3, 1, 'hold'], [0.33, 1.1, 'hold'], [0.39, 1, 'hold'], [1, 1]],
      },
    },
  },
};

export default baseClips;
