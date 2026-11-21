import type { Clip, Key, Track } from '../../types.ts';

/**
 * A flag cut into eight vertical strips (s0 at the pole, s7 at the free end).
 * A wave runs along it: every strip bobs a little later and a little further
 * than the one before.
 */
function wave(strips: number): Clip {
  const tracks: Record<string, Track> = {};
  const steps = 12;
  for (let i = 0; i < strips; i++) {
    const amp = 0.6 + i * 0.75;
    const lag = i * 0.11;
    const y: Key[] = [];
    for (let k = 0; k <= steps; k++) {
      const u = k / steps;
      y.push([u, amp * Math.sin((u - lag) * Math.PI * 2), 'linear']);
    }
    tracks[`s${i}`] = { y };
  }
  return { loop: true, seconds: 1.5, tracks };
}

/** Both flags are cut into the same eight strips, so they share this wave. */
const flagClips: { idle: Clip } = { idle: wave(8) };

export default flagClips;
