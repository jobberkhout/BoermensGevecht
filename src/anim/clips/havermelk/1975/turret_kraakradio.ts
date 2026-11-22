import { swing } from '../../../humanoid.ts';
import { chatter, pop, rattle } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

const TURN: Key[] = [[0, 0], [1, 360, 'linear']];

/** Four crashes of the lids, between `from` and `to` of the loop. `open` is how far the arm swings away. */
function crashes(from: number, to: number, open: number): Key[] {
  const keys: Key[] = [[0, open], [from, open, 'hold']];
  const step = (to - from) / 4;
  for (let i = 0; i < 4; i++) {
    keys.push([from + (i + 0.45) * step, 0, 'in']);
    keys.push([from + (i + 1) * step, open, 'out']);
  }
  keys.push([1, open, 'hold']);
  return keys;
}

/** The horn swells with every beat of the lids. */
function throb(from: number, to: number, size: number): Key[] {
  const keys: Key[] = [[0, 1], [from, 1, 'hold']];
  const step = (to - from) / 4;
  for (let i = 0; i < 4; i++) {
    keys.push([from + (i + 0.5) * step, size, 'out']);
    keys.push([from + (i + 1) * step, 1, 'inOut']);
  }
  keys.push([1, 1, 'hold']);
  return keys;
}

/**
 * De Kraakradio. First the DJ rants into his microphone while the tape turns;
 * then the lid-basher takes over and he can only wince. Everything they do
 * comes out of the horn. When the turret fires they do it all at once and the
 * whole attic shakes.
 */
const kraakradioClips: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 3.4,
    tracks: {
      reel_a: { rot: TURN, rate: 3 },
      reel_b: { rot: TURN, rate: 4 },
      waves: {
        sx: [[0, 0.55], [0.5, 1.15, 'sineInOut'], [1, 0.55, 'sineInOut']],
        sy: [[0, 0.55], [0.5, 1.15, 'sineInOut'], [1, 0.55, 'sineInOut']],
        rate: 4,
      },
      bulb: { rot: swing(7) },
      // The DJ's turn.
      dj_mouth: { sy: chatter(0.04, 0.46, 8) },
      dj_head: {
        rot: [[0, 0], [0.08, -8, 'inOut'], [0.18, 5, 'inOut'], [0.28, -8, 'inOut'], [0.38, 4, 'inOut'], [0.46, 0, 'inOut'], [0.56, 12, 'out'], [0.92, 12, 'hold'], [1, 0, 'inOut']],
      },
      dj_arm: {
        rot: [[0, 0], [0.1, -8, 'inOut'], [0.2, 4, 'inOut'], [0.3, -8, 'inOut'], [0.46, 0, 'inOut'], [0.56, 34, 'out'], [0.92, 34, 'hold'], [1, 0, 'inOut']],
      },
      dj_body: { rot: [[0, 0], [0.24, 4, 'sineInOut'], [0.46, 0, 'sineInOut'], [0.56, -5, 'out'], [0.92, -5, 'hold'], [1, 0, 'inOut']] },
      noise_b: pop(0.06, 0.44),
      // Hers. Until then she holds the lids apart and waits.
      lid_front: { rot: crashes(0.52, 0.92, -15) },
      lid_back: { rot: crashes(0.52, 0.92, 40) },
      pan_body: { y: [[0, 0], [0.52, 0, 'hold'], [0.57, -3, 'out'], [0.62, 0, 'in'], [0.67, -3, 'out'], [0.72, 0, 'in'], [0.77, -3, 'out'], [0.82, 0, 'in'], [0.87, -3, 'out'], [0.92, 0, 'in'], [1, 0]] },
      pan_head: { rot: [[0, 0], [0.15, -5, 'sineInOut'], [0.35, 4, 'sineInOut'], [0.52, 0, 'sineInOut'], [0.62, -7, 'inOut'], [0.72, 6, 'inOut'], [0.82, -7, 'inOut'], [0.92, 0, 'inOut'], [1, 0]] },
      horn: { sx: throb(0.52, 0.92, 1.1), sy: throb(0.52, 0.92, 1.08) },
      noise_a: pop(0.54, 0.93),
    },
  },

  attack: {
    loop: false,
    seconds: 0.6,
    tracks: {
      // The horn kicks back and swells.
      horn: {
        x: [[0, -5], [0.5, 0, 'out'], [1, 0]],
        sx: [[0, 1.22], [0.5, 1, 'out'], [1, 1]],
        sy: [[0, 1.3], [0.5, 1, 'out'], [1, 1]],
      },
      noise_a: pop(0.02, 0.9, 1.35),
      noise_b: pop(0.02, 0.9, 1.25),
      waves: { sx: [[0, 1.6], [1, 1, 'out']], sy: [[0, 1.6], [1, 1, 'out']] },
      dj_body: { rot: [[0, 0], [0.18, 9, 'out'], [0.7, 7, 'hold'], [1, 0, 'inOut']] },
      dj_head: { rot: [[0, 0], [0.18, -11, 'out'], [0.7, -9, 'hold'], [1, 0, 'inOut']] },
      dj_arm: { rot: [[0, 0], [0.18, -10, 'out'], [0.7, -8, 'hold'], [1, 0, 'inOut']] },
      dj_mouth: { sy: [[0, 1.7], [0.7, 1.7, 'hold'], [1, 0.18, 'in']], sx: [[0, 1.3], [0.7, 1.3, 'hold'], [1, 1, 'in']] },
      // One almighty crash of the lids.
      lid_front: { rot: [[0, 0], [0.3, -18, 'out'], [0.5, 0, 'in'], [0.75, -15, 'out'], [1, -15]] },
      lid_back: { rot: [[0, 0], [0.3, 40, 'out'], [0.5, 0, 'in'], [0.75, 40, 'out'], [1, 40]] },
      pan_head: { rot: [[0, 0], [0.2, -9, 'out'], [0.6, 5, 'inOut'], [1, 0, 'inOut']] },
      bulb: { rot: rattle(24, 3) },
      front: { x: rattle(2.5, 6) },
      room: { x: rattle(-2, 6) },
      reel_a: { rot: [[0, 0], [1, 360, 'out']] },
      reel_b: { rot: [[0, 0], [1, 720, 'out']] },
    },
  },
};

export default kraakradioClips;
