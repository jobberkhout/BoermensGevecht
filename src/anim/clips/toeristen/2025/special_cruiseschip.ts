import type { Clip, Key, Track } from '../../../types.ts';

/** An arm waving twice a loop, starting `lag` (0..1) into it, so the decks do not wave in step. */
function wave(lag: number, reach = 28): Key[] {
  const keys: Key[] = [];
  for (let i = 0; i <= 8; i++) {
    const u = i / 8;
    // A sine sampled at nine points, shifted by the lag.
    keys.push([u, Math.round(Math.sin((u + lag) * Math.PI * 4) * reach), 'sineInOut']);
  }
  return keys;
}

const ARMS = 11;
const tracks: Record<string, Track> = {
  // The ship rides at anchor: up and down a little, rocking on the waterline.
  ship: {
    y: [[0, 0], [0.5, -2, 'sineInOut'], [1, 0, 'sineInOut']],
    rot: [[0, -0.25], [0.5, 0.25, 'sineInOut'], [1, -0.25, 'sineInOut']],
  },
  // The radar turns: seen from the side it narrows, flips and widens again.
  radar: { sx: [[0, 1], [0.5, -1, 'sineInOut'], [1, 1, 'sineInOut']] },
  // Smoke out of the cheese, drifting off; a breath of steam from the horn.
  smoke: {
    sx: [[0, 0.7], [0.9, 1.2, 'out'], [1, 0.7, 'hold']],
    sy: [[0, 0.7], [0.9, 1.2, 'out'], [1, 0.7, 'hold']],
    x: [[0, 2], [0.9, -6, 'out'], [1, 2, 'hold']],
    y: [[0, 2], [0.9, -3, 'out'], [1, 2, 'hold']],
  },
  horn_steam: { sx: [[0, 0.8], [0.5, 1.1, 'sineInOut'], [1, 0.8, 'sineInOut']], sy: [[0, 0.8], [0.5, 1.1, 'sineInOut'], [1, 0.8, 'sineInOut']] },
};
for (let k = 0; k < ARMS; k++) tracks[`arm${k}`] = { rot: wave(((k * 5) % ARMS) / ARMS / 2) };

/**
 * Cruiseschip legt aan. While it lies behind the base the ship bobs, the
 * radar turns, the cheese smokes, and passengers on every deck wave, none of
 * them in time with the others.
 */
const cruiseschipClips: { idle: Clip } = {
  idle: { loop: true, seconds: 2, tracks },
};

export default cruiseschipClips;
