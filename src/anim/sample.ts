import type { Pose } from '../rig/pose.ts';
import { resetPose } from '../rig/pose.ts';
import type { Clip, Ease, Key } from './types.ts';

const HALF_PI = Math.PI / 2;

export function ease(kind: Ease | undefined, t: number): number {
  switch (kind) {
    case 'in':
      return t * t * t;
    case 'out':
      return 1 - (1 - t) ** 3;
    case 'inOut':
      return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
    case 'sineIn':
      return 1 - Math.cos(t * HALF_PI);
    case 'sineOut':
      return Math.sin(t * HALF_PI);
    case 'sineInOut':
      return (1 - Math.cos(Math.PI * t)) / 2;
    case 'backOut': {
      const c = 1.70158;
      return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
    }
    case 'hold':
      return t < 1 ? 0 : 1;
    default:
      return t;
  }
}

/** The value of one channel at time u (0..1). A looping channel flows from its last key back into its first. */
export function sampleKeys(keys: readonly Key[], u: number, loop: boolean): number {
  const n = keys.length;
  if (n === 1) return keys[0]![1];
  const first = keys[0]!;
  const last = keys[n - 1]!;

  if (u <= first[0]) {
    if (!loop || first[0] === 0) return first[1];
    // Before the first key of a loop: we are on the way from the last key round to the first.
    const span = first[0] + 1 - last[0];
    return last[1] + (first[1] - last[1]) * ease(first[2], (u + 1 - last[0]) / span);
  }
  if (u >= last[0]) {
    if (!loop || last[0] >= 1) return last[1];
    const span = first[0] + 1 - last[0];
    return last[1] + (first[1] - last[1]) * ease(first[2], (u - last[0]) / span);
  }
  for (let i = 1; i < n; i++) {
    const b = keys[i]!;
    if (u < b[0]) {
      const a = keys[i - 1]!;
      return a[1] + (b[1] - a[1]) * ease(b[2], (u - a[0]) / (b[0] - a[0]));
    }
  }
  return last[1];
}

/** Writes the clip's pose at time u (0..1) for a rig with the given part index. */
export function sampleClip(clip: Clip, u: number, index: Record<string, number>, pose: Pose): void {
  resetPose(pose);
  for (const id in clip.tracks) {
    const i = index[id];
    if (i === undefined) continue; // the lint reports tracks for parts that do not exist
    const track = clip.tracks[id]!;
    let t = u;
    if (track.rate && track.rate !== 1) {
      t = (u * track.rate) % 1;
      if (t < 0) t += 1;
    }
    if (track.rot) pose.rot[i] = sampleKeys(track.rot, t, clip.loop);
    if (track.x) pose.x[i] = sampleKeys(track.x, t, clip.loop);
    if (track.y) pose.y[i] = sampleKeys(track.y, t, clip.loop);
    if (track.sx) pose.sx[i] = sampleKeys(track.sx, t, clip.loop);
    if (track.sy) pose.sy[i] = sampleKeys(track.sy, t, clip.loop);
  }
}

/**
 * Maps the game's attack timing onto an attack clip. `tick` runs from 0 to
 * windup + recover; the clip's hit marker lands exactly on the windup tick.
 */
export function attackTime(clip: Clip, tick: number, windup: number, recover: number): number {
  const hit = clip.markers?.hit ?? 0.5;
  if (tick <= windup) return windup === 0 ? hit : (hit * tick) / windup;
  return Math.min(1, hit + ((1 - hit) * (tick - windup)) / Math.max(1, recover));
}
