import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';

const STILL: Key[] = [[0, 0]];
const GONE: Track = { sx: STILL, sy: STILL };

/** A like that floats up off the screen and is gone, once per cycle. */
const LIKE: Track = {
  y: [[0, 0], [0.7, -14, 'out'], [0.72, 0, 'hold'], [1, 0]],
  sx: [[0, 0.2], [0.15, 1, 'backOut'], [0.6, 1, 'hold'], [0.7, 0, 'in'], [0.72, 0.2, 'hold'], [1, 0.2]],
  sy: [[0, 0.2], [0.15, 1, 'backOut'], [0.6, 1, 'hold'], [0.7, 0, 'in'], [0.72, 0.2, 'hold'], [1, 0.2]],
};

/**
 * Influencer-Ivy: stands in the middle of the bike path with the ring light up
 * and the phone on its gimbal, and does not move for anyone. She throws
 * nothing. Her attack is the take: the light flares, the phone goes forward,
 * she pouts, and whoever is in front of her poses.
 */
const influencerIvy: ClipSet = {
  idle: idle(
    { seconds: 2.8, breathe: 0.03, armSway: 1.5 },
    {
      // A tilt of the head for the camera, and back.
      head: { rot: [[0, 0], [0.35, -7, 'sineInOut'], [0.65, -7, 'hold'], [0.85, 0, 'sineInOut'], [1, 0]] },
      lips: { sx: [[0, 1], [0.4, 1.25, 'sineInOut'], [0.7, 1.25, 'hold'], [0.9, 1, 'sineInOut'], [1, 1]], sy: [[0, 1], [0.4, 1.15, 'sineInOut'], [0.9, 1, 'sineInOut'], [1, 1]] },
      ringlight: { rot: [[0, 0], [0.5, 2, 'sineInOut'], [1, 0, 'sineInOut']] },
      flare: { sx: [[0, 0.9], [0.5, 1.05, 'sineInOut'], [1, 0.9, 'sineInOut']], sy: [[0, 0.9], [0.5, 1.05, 'sineInOut'], [1, 0.9, 'sineInOut']] },
      heart: LIKE,
    },
  ),

  walk: walk(
    { stride: 46, legSwing: 24, legLen: 38, armSwing: 4, lean: 2, sway: 3, headNod: 2 },
    {
      // Hips first, gear steady: she is filming while she walks.
      hips: { y: bob(1.4), x: swing(1.6) },
      ringlight: { rot: swing(4) },
      gimbal: { rot: swing(-3) },
      flare: { sx: [[0, 0.9]], sy: [[0, 0.9]] },
      heart: GONE,
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      // Lean in, hip out, phone forward, light up: the take.
      hips: { x: [[0, 0], [0.3, -2, 'out'], [0.45, 3, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.3, -6, 'out'], [0.45, 5, 'in'], [0.8, 5, 'hold'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.3, -10, 'out'], [0.45, -12, 'in'], [0.8, -12, 'hold'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.3, 10, 'out'], [0.45, -18, 'in'], [0.8, -18, 'hold'], [1, 0, 'inOut']] },
      gimbal: { rot: [[0, 0], [0.3, 6, 'out'], [0.45, 16, 'in'], [0.8, 16, 'hold'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.3, 6, 'out'], [0.45, -8, 'in'], [1, 0, 'inOut']] },
      ringlight: { rot: [[0, 0], [0.45, 4, 'in'], [1, 0, 'inOut']] },
      flare: {
        sx: [[0, 0.9], [0.4, 0.9, 'hold'], [0.45, 1.7, 'out'], [0.6, 1.3, 'inOut'], [1, 0.9, 'inOut']],
        sy: [[0, 0.9], [0.4, 0.9, 'hold'], [0.45, 1.7, 'out'], [0.6, 1.3, 'inOut'], [1, 0.9, 'inOut']],
      },
      lips: {
        sx: [[0, 1], [0.3, 1, 'hold'], [0.45, 1.45, 'backOut'], [0.85, 1.45, 'hold'], [1, 1, 'inOut']],
        sy: [[0, 1], [0.3, 1, 'hold'], [0.45, 1.3, 'backOut'], [0.85, 1.3, 'hold'], [1, 1, 'inOut']],
      },
      leg_front: { rot: [[0, 0], [0.45, -8, 'in'], [0.8, -8, 'hold'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.45, 6, 'in'], [0.8, 6, 'hold'], [1, 0, 'inOut']] },
      heart: {
        y: [[0, 0], [0.45, 0, 'hold'], [1, -16, 'out']],
        sx: [[0, 0], [0.45, 0, 'hold'], [0.55, 1.4, 'backOut'], [0.85, 1.2, 'hold'], [1, 0, 'in']],
        sy: [[0, 0], [0.45, 0, 'hold'], [0.55, 1.4, 'backOut'], [0.85, 1.2, 'hold'], [1, 0, 'in']],
      },
    },
  },

  hit: flinch({
    // The gear dips, it does not fly up: the shot must not be ruined.
    arm_front: { rot: [[0, 0], [0.3, 12, 'out'], [1, 0, 'inOut']] },
    arm_back: { rot: [[0, 0], [0.3, 8, 'out'], [1, 0, 'inOut']] },
    ringlight: { rot: rattle(8, 3) },
    gimbal: { rot: rattle(6, 3) },
    lips: { sx: [[0, 1], [0.3, 0.7, 'out'], [1, 1, 'inOut']], sy: [[0, 1], [0.3, 0.7, 'out'], [1, 1, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 62 },
    {
      // Light off, ring dragging behind, phone face down. No likes.
      arm_back: { rot: swing(4, 70) },
      ringlight: { rot: [[0, 140]] },
      arm_front: { rot: swing(4, 52) },
      gimbal: { rot: [[0, 30]] },
      flare: GONE,
      heart: GONE,
      lips: { sx: [[0, 0.8]], sy: [[0, 0.6]] },
    },
  ),
};

export default influencerIvy;
