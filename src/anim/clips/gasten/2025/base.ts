import type { Clip, Key } from '../../../types.ts';

/** A bulb's glow swelling and fading, starting at `lag` (0..1) into the loop. */
function twinkle(lag: number): Key[] {
  const keys: Key[] = [[0, 0.5]];
  const up = (lag + 0.12) % 1;
  const down = (lag + 0.3) % 1;
  const marks: Key[] = [[lag, 0.5, 'hold'], [up, 1.25, 'sineOut'], [down, 0.5, 'sineIn']];
  for (const k of marks.sort((a, b) => a[0] - b[0])) if (k[0] > 0 && k[0] < 1) keys.push(k);
  keys.push([1, 0.5, 'hold']);
  return keys.filter((k, i, all) => i === 0 || k[0] > all[i - 1]![0]);
}

const tracks: Clip['tracks'] = {};
for (let i = 0; i < 20; i++) {
  // Neighbours never light up together: the string seems to run along the gutter.
  const keys = twinkle(((i * 7) % 20) / 20);
  tracks[`glow${i}`] = { sx: keys, sy: keys };
}

/** De Feestzaal: the building stands still; the fairy lights along the gutter twinkle. */
const feestzaalClips: { idle: Clip } = {
  idle: { loop: true, seconds: 2.4, tracks },
};

export default feestzaalClips;
