import { swing } from '../../../humanoid.ts';
import type { Clip, Key, Track } from '../../../types.ts';

/**
 * A puff of chimney smoke: it swells as it rises and thins out to nothing.
 * `late` starts it half a loop later, so there is always one on its way up.
 */
function smoke(late: boolean): Track {
  if (!late) {
    const size: Key[] = [[0, 0.2], [0.5, 1, 'out'], [0.85, 1.1, 'linear'], [1, 0.2, 'in']];
    return { sx: size, sy: size, y: [[0, 6], [1, -14, 'linear']], x: [[0, 0], [1, 7, 'sineInOut']] };
  }
  const size: Key[] = [[0, 1.05], [0.35, 1.1, 'linear'], [0.5, 0.2, 'in'], [1, 1.05, 'out']];
  return {
    sx: size,
    sy: size,
    y: [[0, -4], [0.5, -14, 'linear'], [0.501, 6, 'hold'], [1, -4, 'linear']],
    x: [[0, 3.5], [0.5, 7, 'sineInOut'], [0.501, 0, 'hold'], [1, 3.5, 'sineInOut']],
  };
}

/**
 * The kraakpand is never quite still: the bed sheet on the gable moves in the
 * wind, the cat on the first floor flicks its tail, the chimney smokes.
 */
const kraakpandClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 4,
    tracks: {
      sheet: {
        rot: swing(1.3),
        sy: [[0, 1], [0.3, 1.05, 'sineInOut'], [0.7, 0.97, 'sineInOut'], [1, 1, 'sineInOut']],
      },
      // Two lazy flicks, then it lies still for a while.
      cat_tail: {
        rot: [[0, 0], [0.08, 16, 'out'], [0.18, -6, 'inOut'], [0.28, 14, 'inOut'], [0.4, 0, 'inOut'], [1, 0, 'hold']],
      },
      smoke_a: { ...smoke(false), rate: 2 },
      smoke_b: { ...smoke(true), rate: 2 },
    },
  },
};

export default kraakpandClips;
