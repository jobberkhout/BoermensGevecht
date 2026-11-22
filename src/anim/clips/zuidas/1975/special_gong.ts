import type { Clip, Key, Track } from '../../../types.ts';

/** A jolt at the stroke: off at once, then settling. */
const jolt = (by: number): Key[] => [[0, 0], [0.1, by, 'out'], [0.32, 0, 'inOut'], [1, 0, 'hold']];

/** The sound: starts at the gong the moment it is struck, spreads, and is gone before the next stroke. */
const RING: Key[] = [[0, 0.55], [0.4, 1.3, 'out'], [0.52, 0, 'in'], [1, 0, 'hold']];

/**
 * A price slip fluttering up. It pops into view at `from` (0..1 of the loop),
 * rises `rise` pixels while turning, and is gone a little under half a loop
 * later. Slips that start late in the loop carry on over the stroke.
 */
function flutter(from: number, rise: number, turn: number, drift: number): Track {
  const span = 0.46;
  const at = (u: number): number => (from + u * span) % 1;
  // Key times must go up, so a slip that wraps around the end of the loop is written in two halves.
  const points: { u: number; s: number; y: number; r: number; x: number }[] = [];
  for (let i = 0; i <= 6; i++) {
    const u = i / 6;
    const size = u < 0.15 ? u / 0.15 : u > 0.8 ? (1 - u) / 0.2 : 1;
    points.push({ u: at(u), s: Math.max(0, size), y: -rise * u, r: turn * u, x: drift * Math.sin(u * Math.PI) });
  }
  const sorted = [...points].sort((a, b) => a.u - b.u);
  const wraps = from + span > 1;
  const keys = (pick: (p: (typeof points)[number]) => number, hidden: number): Key[] => {
    const out: Key[] = [];
    if (sorted[0]!.u > 0) out.push([0, wraps ? pick(sorted[sorted.length - 1]!) : hidden, 'hold']);
    let last = -1;
    for (const p of sorted) {
      if (p.u <= last) continue;
      // The jump from the end of one flight to the start of the next must not be smoothed over.
      const startsHere = p === points[0];
      out.push([p.u, pick(p), startsHere ? 'hold' : 'linear']);
      last = p.u;
    }
    if (last < 1) out.push([1, out[0]![1], 'hold']);
    return out;
  };
  const size = keys((p) => p.s, 0);
  return { sx: size, sy: size, y: keys((p) => p.y, 0), rot: keys((p) => p.r, 0), x: keys((p) => p.x, 0) };
}

/**
 * De gong. One loop is one stroke: the beursbode hauls the mallet back and
 * brings it down, the gong shudders on its cords, his cap leaves his head for
 * a moment, and the colleague who has stood next to it for thirty years jumps
 * anyway, a finger in each ear. Price slips go up the whole time.
 */
const gongClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 0.8,
    tracks: {
      // Lands at the start of the loop, bounces off, is hauled back over his shoulder, comes down again.
      mallet: { rot: [[0, 0], [0.08, -9, 'out'], [0.6, -72, 'inOut'], [0.8, -76, 'sineInOut'], [1, 0, 'in']] },
      striker: {
        rot: [[0, 3], [0.1, 0, 'out'], [0.6, -7, 'inOut'], [0.8, -8, 'sineInOut'], [1, 3, 'in']],
        y: jolt(-2.5),
      },
      striker_head: { rot: [[0, 4], [0.14, -5, 'out'], [0.6, -4, 'inOut'], [1, 4, 'in']] },
      cap: { y: [[0, 0], [0.14, -8, 'out'], [0.4, 0, 'in'], [1, 0, 'hold']], rot: [[0, 0], [0.14, -10, 'out'], [0.4, 0, 'in'], [1, 0, 'hold']] },

      gong: {
        rot: [[0, 0], [0.08, 6, 'out'], [0.24, -5, 'sineInOut'], [0.42, 3.4, 'sineInOut'], [0.6, -2, 'sineInOut'], [0.8, 1, 'sineInOut'], [1, 0, 'sineInOut']],
        sx: [[0, 1.06], [0.3, 1, 'out'], [1, 1, 'hold']],
        sy: [[0, 1.06], [0.3, 1, 'out'], [1, 1, 'hold']],
      },
      ring_a: { sx: RING, sy: RING },
      ring_b: { sx: RING, sy: RING },

      wincer: {
        y: [[0, 0], [0.12, -6, 'out'], [0.34, 0, 'in'], [1, 0, 'hold']],
        rot: [[0, 0], [0.12, 7, 'out'], [0.4, 0, 'inOut'], [0.8, 0, 'hold'], [0.94, -3, 'inOut'], [1, 0, 'inOut']],
        sy: [[0, 1], [0.12, 0.95, 'out'], [0.4, 1, 'inOut'], [1, 1, 'hold']],
      },

      slip_a: flutter(0.02, 15, 80, -5),
      slip_b: flutter(0.3, 9, -70, 4),
      slip_c: flutter(0.55, 16, 90, 6),
      slip_d: flutter(0.72, 7, -60, -3),
      slip_e: flutter(0.42, 14, -90, -6),
      slip_f: flutter(0.14, 12, 70, 5),
    },
  },
};

export default gongClips;
