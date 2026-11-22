import { pop } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

/** The telex types a line: the bar steps to the right a character at a time, then flies back. */
function typing(from: number, to: number, steps: number, reach: number): Key[] {
  const keys: Key[] = [[0, -reach], [from, -reach, 'hold']];
  for (let i = 1; i <= steps; i++) {
    keys.push([from + ((to - from) * i) / steps, -reach + (2 * reach * i) / steps, 'hold']);
  }
  keys.push([to + 0.05, -reach, 'inOut'], [1, -reach, 'hold']);
  return keys;
}

/**
 * The bank is quiet. Behind the window the telex types the prices, a line at
 * a time, and the strip creeps over the desk. Now and then the brass plate
 * catches the light, because somebody polishes it every morning.
 */
const bankClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 4.4,
    tracks: {
      carriage: { x: typing(0.04, 0.36, 9, 7), rate: 2 },
      tape: {
        sy: [[0, 0.95], [0.36, 1.04, 'linear'], [0.41, 0.95, 'inOut'], [1, 0.95, 'hold']],
        rot: [[0, 0], [0.18, 1.2, 'sineInOut'], [0.36, -0.8, 'sineInOut'], [0.41, 0, 'inOut'], [1, 0, 'hold']],
        rate: 2,
      },
      glint: {
        ...pop(0.62, 0.8),
        rot: [[0, 0], [0.62, 0, 'hold'], [0.8, 80, 'out'], [1, 80, 'hold']],
      },
    },
  },
};

export default bankClips;
