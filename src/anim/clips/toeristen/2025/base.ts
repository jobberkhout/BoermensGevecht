import type { Clip } from '../../../types.ts';

/**
 * Het Vakantiehuis. The house itself stands still (as still as it can, leaning
 * like that). In the gable the disco lights flip from side to side and the
 * mirror ball turns; the suitcase on the hoisting beam sways on its rope; and
 * behind the ground-floor window somebody pulls the curtain aside twice to
 * see who is complaining now.
 */
const vakantiehuisClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 2.4,
    tracks: {
      disco_light: {
        sx: [[0, 1], [0.24, 1, 'hold'], [0.26, -1, 'hold'], [0.49, -1, 'hold'], [0.51, 1, 'hold'], [0.74, 1, 'hold'], [0.76, -1, 'hold'], [0.99, -1, 'hold'], [1, 1, 'hold']],
      },
      disco_ball: { rot: [[0, -10], [0.5, 10, 'sineInOut'], [1, -10, 'sineInOut']] },
      hoist: { rot: [[0, -6], [0.5, 6, 'sineInOut'], [1, -6, 'sineInOut']] },
      curtain: {
        sx: [[0, 1], [0.55, 1, 'hold'], [0.6, 0.35, 'out'], [0.7, 0.35, 'hold'], [0.74, 1, 'in'], [0.8, 1, 'hold'], [0.84, 0.4, 'out'], [0.9, 0.4, 'hold'], [0.95, 1, 'in'], [1, 1]],
      },
    },
  },
};

export default vakantiehuisClips;
