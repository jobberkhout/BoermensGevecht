import { chatter, pop, rattle } from '../../../props.ts';
import type { Clip, Key, Track } from '../../../types.ts';

/** Pops up between `from` and `to` and drifts upward while it is there. */
const float = (from: number, to: number, rise: number, size = 1): Track => ({
  ...pop(from, to, size),
  y: [[0, rise * 0.5], [from, rise * 0.5, 'hold'], [to, -rise * 0.5, 'linear'], [1, -rise * 0.5]],
});

const THUMB_UP = 0;
const THUMB_DOWN = 180;

/**
 * The Livestream. First half of the loop she is all smiles: thumbs up, and the
 * hearts come floating in. Then the smile drops, the thumb turns over and she
 * tells her followers everything that is wrong with today. Behind her the
 * assistant nods off under the reflector until her voice wakes him. When the
 * turret fires she jabs the thumb down at the camera and the lamp flares.
 */
const livestreamClips: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 4.4,
    tracks: {
      // Sweet.
      star_head: {
        rot: [[0, -5], [0.12, 6, 'inOut'], [0.26, -6, 'inOut'], [0.4, 4, 'inOut'], [0.5, 0, 'inOut'], [0.6, 8, 'inOut'], [0.7, -4, 'inOut'], [0.8, 8, 'inOut'], [0.9, -3, 'inOut'], [1, -5, 'inOut']],
      },
      star_body: { rot: [[0, 0], [0.46, 0, 'hold'], [0.56, 5, 'inOut'], [0.92, 5, 'hold'], [1, 0, 'inOut']] },
      star_arm: {
        rot: [[0, 0], [0.1, -7, 'sineInOut'], [0.2, 0, 'sineInOut'], [0.3, -7, 'sineInOut'], [0.44, 0, 'sineInOut'], [0.56, 10, 'inOut'], [0.64, 2, 'inOut'], [0.72, 10, 'inOut'], [0.8, 2, 'inOut'], [0.88, 10, 'inOut'], [1, 0, 'inOut']],
      },
      // Sour: the thumb turns over half-way and stays down until the loop comes round.
      star_hand: { rot: [[0, THUMB_UP], [0.46, THUMB_UP, 'hold'], [0.53, THUMB_DOWN, 'inOut'], [0.93, THUMB_DOWN, 'hold'], [1, THUMB_UP, 'inOut']] },
      star_mouth: { sy: [...chatter(0.04, 0.2, 3, 0.3).slice(0, -1), [0.5, 0.3, 'hold'], ...chatter(0.54, 0.94, 9).slice(2)] },
      star_tail: { rot: [[0, 0], [0.13, -8, 'inOut'], [0.27, 7, 'inOut'], [0.41, -5, 'inOut'], [0.5, 0, 'inOut'], [0.61, -14, 'inOut'], [0.71, 6, 'inOut'], [0.81, -14, 'inOut'], [0.91, 5, 'inOut'], [1, 0, 'inOut']] },
      heart_a: float(0.03, 0.26, 26),
      heart_b: float(0.2, 0.46, 30),
      chat_a: float(0.57, 0.8, 24),
      chat_b: float(0.7, 0.96, 28),
      // The assistant sinks, and the reflector with him, until the ranting starts.
      asst_arms: { rot: [[0, 0], [0.46, 26, 'sineIn'], [0.52, 26, 'hold'], [0.57, -9, 'out'], [0.68, 0, 'inOut'], [1, 0]] },
      asst_head: { rot: [[0, 0], [0.46, 22, 'sineIn'], [0.52, 22, 'hold'], [0.56, -12, 'out'], [0.7, 0, 'inOut'], [1, 0]] },
      asst_body: { y: [[0, 0], [0.46, 2, 'sineIn'], [0.52, 2, 'hold'], [0.56, -3, 'out'], [0.66, 0, 'in'], [1, 0]] },
      glow: { sx: [[0, 1], [0.5, 1.06, 'sineInOut'], [1, 1, 'sineInOut']], rate: 3 },
      live: { sx: [[0, 1], [0.55, 1, 'hold'], [0.56, 0, 'hold'], [1, 0, 'hold']], sy: [[0, 1], [0.55, 1, 'hold'], [0.56, 0, 'hold'], [1, 0, 'hold']], rate: 5 },
    },
  },

  attack: {
    loop: false,
    seconds: 0.6,
    tracks: {
      // Thumb down, straight at the lens.
      star_hand: { rot: [[0, THUMB_DOWN], [0.72, THUMB_DOWN, 'hold'], [1, THUMB_UP, 'inOut']], x: rattle(1.5, 5) },
      star_arm: { x: [[0, 0], [0.14, 7, 'out'], [0.7, 5, 'hold'], [1, 0, 'inOut']], rot: [[0, 0], [0.14, 9, 'out'], [0.7, 7, 'hold'], [1, 0, 'inOut']] },
      star_body: { rot: [[0, 0], [0.16, 7, 'out'], [0.7, 6, 'hold'], [1, 0, 'inOut']] },
      star_head: { rot: [[0, 0], [0.16, -9, 'out'], [0.7, -7, 'hold'], [1, 0, 'inOut']] },
      star_mouth: { sy: [[0, 1.7], [0.72, 1.7, 'hold'], [1, 0.3, 'in']], sx: [[0, 1.3], [0.72, 1.3, 'hold'], [1, 1, 'in']] },
      star_tail: { rot: [[0, 0], [0.16, -24, 'out'], [0.4, 10, 'inOut'], [0.7, -8, 'inOut'], [1, 0, 'inOut']] },
      // The lamp flares and the tripod rocks back.
      ring: { rot: [[0, 0], [0.12, 9, 'out'], [0.4, -4, 'inOut'], [0.7, 2, 'inOut'], [1, 0, 'inOut']] },
      glow: { sx: [[0, 1.3], [0.4, 1, 'out'], [1, 1]], sy: [[0, 1.7], [0.4, 1, 'out'], [1, 1]] },
      live: { sx: [[0, 1.8], [1, 1, 'out']], sy: [[0, 1.8], [1, 1, 'out']] },
      // The assistant nearly drops the reflector.
      asst_body: { y: [[0, 0], [0.15, -6, 'out'], [0.36, 0, 'in'], [1, 0]] },
      asst_arms: { rot: [[0, 0], [0.15, -22, 'out'], [0.5, 8, 'inOut'], [1, 0, 'inOut']] },
      asst_head: { rot: [[0, 0], [0.15, -16, 'out'], [1, 0, 'inOut']] },
      heart_a: { sx: [[0, 0]], sy: [[0, 0]] },
      heart_b: { sx: [[0, 0]], sy: [[0, 0]] },
      chat_a: pop(0.02, 0.9, 1.25),
      chat_b: pop(0.08, 0.92, 1.25),
    },
  },
};

export default livestreamClips;
