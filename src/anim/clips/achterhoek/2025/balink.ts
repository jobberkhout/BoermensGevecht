import { bob, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { Clip, ClipSet, Key, Track } from '../../../types.ts';

/** Radius of the bale in pixels. It turns once for every 2πR it travels, so it never skids. */
const R = 33;
const TURN = 2 * Math.PI * R;
const FULL_TURN: Key[] = [
  [0, 0],
  [1, 360, 'linear'],
];

/**
 * A gait from humanoid.ts, taken `steps` times while the bale turns once: the
 * clip's cycle is one turn of the bale, as it is one turn of the big wheel in vehicle.ts.
 */
function behindTheBale(gait: Clip, steps: number): Clip {
  const tracks: Record<string, Track> = {};
  for (const [id, track] of Object.entries(gait.tracks)) tracks[id] = { ...track, rate: steps * (track.rate ?? 1) };
  tracks.bale_wrap = { rot: FULL_TURN };
  return { loop: true, stride: TURN, tracks };
}

/** Moves the bale along `x` (keys in pixels) and turns the wrap by the matching amount. */
function rollTo(x: readonly Key[]): Record<string, Track> {
  return {
    bale: { x },
    bale_wrap: { rot: x.map((k): Key => [k[0], (k[1] / R) * (180 / Math.PI), k[2]]) },
  };
}

/** The zakdoek in his back pocket swings with every step. */
const FLAP: Key[] = [[0, -6], [0.5, 14, 'sineInOut'], [1, -6, 'sineInOut']];

/**
 * Balink: leans on his bale and rocks it a little while he waits, puts his
 * weight behind it to roll it along, and bumps it into whoever stands in the
 * way. A shot only dents the wrap. When he has had enough he rolls it home at a run.
 */
const balink: ClipSet = {
  idle: idle(
    { seconds: 3, breathe: 0.03, armSway: 0 },
    {
      // He rocks the bale under his hands.
      ...rollTo([[0, 0], [0.5, 1.6, 'sineInOut'], [1, 0, 'sineInOut']]),
      // His hands stay where they are on the wrap while his chest rises.
      arm_front: { rot: [[0, 0]], y: [[0, 0], [0.5, 1.5, 'sineInOut'], [1, 0, 'sineInOut']] },
      arm_back: { rot: [[0, 0]], y: [[0, 0], [0.5, 1.5, 'sineInOut'], [1, 0, 'sineInOut']] },
      head: {
        y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']],
        // Nodding along to whatever is in his ear, then a look ahead.
        rot: [[0, 0], [0.1, 4, 'sineInOut'], [0.2, 0, 'sineInOut'], [0.3, 4, 'sineInOut'], [0.4, 0, 'sineInOut'], [0.62, -6, 'sineInOut'], [0.86, -6, 'hold'], [1, 0, 'sineInOut']],
      },
      rag: { rot: [[0, 0], [0.5, 4, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  ),

  walk: behindTheBale(
    walk(
      { stride: TURN / 5, legSwing: 22, legLen: 38, armSwing: 0, lean: 13, sway: 2, headNod: 3 },
      {
        // Both hands stay on top of the bale while he leans into it.
        arm_front: { rot: swing(2, -50) },
        arm_back: { rot: swing(-2, -15) },
        head: { rot: bob(-3, -6) },
        rag: { rot: FLAP },
      },
    ),
    // Short quick steps, as one takes behind something heavy: five to every turn of the bale.
    5,
  ),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      // He lets the bale roll back against him, then throws his weight behind it.
      ...rollTo([[0, 0], [0.26, -4, 'out'], [0.4, 15, 'in'], [0.6, 9, 'out'], [1, 0, 'inOut']]),
      hips: { x: [[0, 0], [0.26, -3, 'out'], [0.4, 6, 'in'], [0.62, 3, 'out'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.26, -6, 'out'], [0.4, 16, 'in'], [0.62, 9, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, 4, 'out'], [0.4, -8, 'in'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.26, 14, 'out'], [0.4, -34, 'in'], [0.62, -20, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.26, 4, 'out'], [0.4, -14, 'in'], [0.62, -8, 'out'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 5, 'out'], [0.4, -14, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -4, 'out'], [0.4, 14, 'in'], [1, 0, 'inOut']] },
      rag: { rot: [[0, 0], [0.26, -14, 'out'], [0.4, 26, 'in'], [0.66, -8, 'out'], [1, 0, 'inOut']] },
    },
  },

  // A shot dents the wrap and bounces off: the bale gives and springs back. He does not move.
  hit: {
    loop: false,
    seconds: 0.3,
    tracks: {
      bale: {
        x: [[0, 0], [0.12, -3, 'out'], [0.4, 1.2, 'sineInOut'], [1, 0, 'sineInOut']],
        sx: [[0, 1], [0.12, 0.93, 'out'], [0.4, 1.035, 'sineInOut'], [0.7, 0.99, 'sineInOut'], [1, 1, 'sineInOut']],
        sy: [[0, 1], [0.12, 1.06, 'out'], [0.4, 0.975, 'sineInOut'], [0.7, 1.008, 'sineInOut'], [1, 1, 'sineInOut']],
        // Keeps it standing on the ground while it is taller or flatter: R times what sy adds.
        y: [[0, 0], [0.12, -1.98, 'out'], [0.4, 0.83, 'sineInOut'], [0.7, -0.26, 'sineInOut'], [1, 0, 'sineInOut']],
      },
      bale_wrap: { rot: [[0, 0], [0.12, -5, 'out'], [0.4, 2, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  },

  die: behindTheBale(
    slinkOff(
      { legLen: 38, stride: TURN / 3 },
      {
        torso: { rot: bob(3, 22) },
        head: { rot: bob(4, -4) },
        arm_front: { rot: swing(3, -62) },
        arm_back: { rot: swing(-3, -20) },
        rag: { rot: FLAP, rate: 2 },
      },
    ),
    3,
  ),
};

export default balink;
