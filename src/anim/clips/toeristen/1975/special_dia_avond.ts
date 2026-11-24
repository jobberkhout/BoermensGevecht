import { pop } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

/** Shown until `until` of the loop, then gone until it comes round again. */
function until(u: number): Key[] {
  return [[0, 1], [u, 1, 'hold'], [u + 0.001, 0, 'hold'], [1, 0, 'hold']];
}

/** The tray drops the next slide: a little jump at each of these moments. */
function clack(...at: number[]): Key[] {
  // The first one is the loop coming round to the sunset again.
  const keys: Key[] = [[0, -3], [0.04, 0, 'in']];
  for (const u of at) keys.push([u - 0.01, 0, 'hold'], [u + 0.02, -3, 'out'], [u + 0.06, 0, 'in']);
  keys.push([1, 0, 'hold']);
  return keys;
}

/**
 * De Dia-avond: the sunset, the person squinting into the sun, the windmill,
 * and three hundred and ninety-seven to go. Click, clack, next slide; the
 * projector hums, the light flickers at every change, and the z's float up
 * from whoever has to watch.
 */
const diaAvondClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 3.6,
    tracks: {
      slide_c: { sx: until(0.33), sy: until(0.33) },
      slide_b: { sx: until(0.66), sy: until(0.66) },
      carousel: { y: clack(0.33, 0.66) },
      beam: { sx: [[0, 1], [0.32, 1, 'hold'], [0.34, 0.8, 'out'], [0.38, 1, 'in'], [0.65, 1, 'hold'], [0.67, 0.8, 'out'], [0.71, 1, 'in'], [0.97, 1, 'hold'], [0.99, 0.8, 'out'], [1, 1, 'in']] },
      projector: { y: [[0, 0], [0.5, -0.6, 'sineInOut'], [1, 0, 'sineInOut']], rate: 9 },
      zzz: { ...pop(0.1, 0.9, 1), y: [[0, 4], [0.1, 4, 'hold'], [0.9, -8, 'linear'], [1, -8, 'hold']] },
    },
  },
};

export default diaAvondClips;
