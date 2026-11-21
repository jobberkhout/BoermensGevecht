import type { Clip, Key, Track } from './types.ts';

/**
 * Building blocks for anything on wheels. Wheels turn with the distance
 * travelled, so they never spin on the spot or skid.
 */

const FULL_TURN: Key[] = [
  [0, 0],
  [1, 360, 'linear'],
];

export interface RollStyle {
  /** Radius of the biggest wheel in pixels. One clip cycle is one turn of that wheel. */
  bigWheel: number;
  /** Other wheels by part id, with their radius. Smaller wheels turn more often. */
  wheels: Record<string, number>;
  /** How much the body bounces, in pixels. */
  bounce?: number;
  /** How much the body rocks, in degrees. */
  rock?: number;
}

function wheelTracks(style: RollStyle): Record<string, Track> {
  const tracks: Record<string, Track> = {};
  for (const [id, radius] of Object.entries(style.wheels)) {
    tracks[id] = { rot: FULL_TURN, rate: Math.max(1, Math.round(style.bigWheel / radius)) };
  }
  return tracks;
}

/** Driving: wheels turn, the body bounces along. */
export function roll(style: RollStyle, extra: Record<string, Track> = {}): Clip {
  const bounce = style.bounce ?? 1.5;
  const rock = style.rock ?? 0.6;
  return {
    loop: true,
    stride: 2 * Math.PI * style.bigWheel,
    tracks: {
      ...wheelTracks(style),
      body: {
        y: [[0, 0], [0.5, -bounce, 'sineInOut'], [1, 0, 'sineInOut']],
        rot: [[0, 0], [0.25, rock, 'sineInOut'], [0.75, -rock, 'sineInOut'], [1, 0, 'sineInOut']],
        rate: 3,
      },
      ...extra,
    },
  };
}

/** Standing still with the engine running. */
export function idling(seconds = 0.5, shake = 0.8, extra: Record<string, Track> = {}): Clip {
  return {
    loop: true,
    seconds,
    tracks: {
      body: { y: [[0, 0], [0.5, -shake, 'sineInOut'], [1, 0, 'sineInOut']] },
      ...extra,
    },
  };
}

/** Knocked back on its springs. Laid on top of whatever else is playing. */
export function jolt(extra: Record<string, Track> = {}): Clip {
  return {
    loop: false,
    seconds: 0.3,
    tracks: {
      body: {
        x: [[0, 0], [0.25, -6, 'out'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.25, -3, 'out'], [0.6, 1.5, 'inOut'], [1, 0, 'inOut']],
      },
      ...extra,
    },
  };
}

/** Limping home: wheels turning, body shuddering. Loops while the vehicle leaves. */
export function limpHome(style: RollStyle, extra: Record<string, Track> = {}): Clip {
  return {
    loop: true,
    stride: 2 * Math.PI * style.bigWheel,
    tracks: {
      ...wheelTracks(style),
      body: {
        y: [[0, 0], [0.5, -3, 'sineInOut'], [1, 0, 'sineInOut']],
        rot: [[0, -2], [0.5, 3, 'sineInOut'], [1, -2, 'sineInOut']],
        rate: 5,
      },
      ...extra,
    },
  };
}

/**
 * Moves the whole vehicle along `x` (keys in pixels) and turns every wheel by
 * the matching amount, for lunges and recoils inside a clip.
 */
export function shove(x: readonly Key[], style: RollStyle): Record<string, Track> {
  const tracks: Record<string, Track> = { chassis: { x } };
  for (const [id, radius] of Object.entries(style.wheels)) {
    tracks[id] = { rot: x.map((k): Key => [k[0], (k[1] / radius) * (180 / Math.PI), k[2]]) };
  }
  return tracks;
}
