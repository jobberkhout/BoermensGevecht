import type { Clip, Key } from '../../../types.ts';

/**
 * The arms swing shut, settle against each other, and hold. Swinging is shown
 * as foreshortening from the ball joints: at 0.6 the gates are turned away
 * and a gap opens in the middle. The scene plays on the game's clock, so the
 * loop is long and they stand shut for most of it; at its end they give a
 * little under the sea and are slammed shut again.
 */
const SWING: Key[] = [[0, 0.6], [0.12, 1.03, 'out'], [0.18, 1, 'inOut'], [0.88, 1, 'hold'], [1, 0.6, 'inOut']];

/** The sea surges against them twice while they hold. */
const SURGE: Key[] = [[0, 1], [0.3, 1, 'hold'], [0.36, 1.12, 'out'], [0.5, 1, 'inOut'], [0.64, 1, 'hold'], [0.7, 1.14, 'out'], [0.84, 1, 'inOut'], [1, 1]];

/** At each surge the spray goes up over the top, and falls back. */
const SPRAY: Key[] = [[0, 0], [0.33, 0, 'hold'], [0.39, 1.1, 'out'], [0.52, 0, 'in'], [0.67, 0, 'hold'], [0.73, 1.15, 'out'], [0.86, 0, 'in'], [1, 0, 'hold']];

/** The arms shudder when the water hits them. */
const SHUDDER: Key[] = [[0, 0], [0.36, 0, 'hold'], [0.38, -1.2, 'out'], [0.42, 0.8, 'inOut'], [0.46, 0, 'inOut'], [0.7, 0, 'hold'], [0.72, -1.4, 'out'], [0.76, 0.9, 'inOut'], [0.8, 0, 'inOut'], [1, 0]];

const keringClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 4,
    tracks: {
      arm_left: { sx: SWING, rot: SHUDDER },
      arm_right: { sx: SWING, rot: SHUDDER.map(([u, v, e]): Key => [u, -v, e]) },
      wave: { sy: SURGE },
      spray: { sx: SPRAY, sy: SPRAY, y: [[0, 4], [0.33, 4, 'hold'], [0.45, -4, 'out'], [0.52, 4, 'hold'], [0.67, 4, 'hold'], [0.79, -4, 'out'], [0.86, 4, 'hold'], [1, 4]] },
      water: { sx: [[0, 1], [0.5, 1.02, 'sineInOut'], [1, 1, 'sineInOut']] },
    },
  },
};

export default keringClips;
