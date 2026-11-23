import { swing } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';
import { jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

/** It balances on one wheel, so every move of the wheel is a move of the whole robot. */
const WHEEL: RollStyle = { bigWheel: 13, wheels: { wheel: 13 } };

/** One blink per cycle. */
const BLINK: Key[] = [[0, 1], [0.6, 0.12, 'hold'], [0.64, 1, 'hold'], [1, 1, 'hold']];
const GONE: Key[] = [[0, 0]];

/**
 * The Stagebot: an intern on one wheel. It has been trusted with exactly one
 * thing, the coffee, and carries it with both hands. It attacks by serving it,
 * hard. Beaten, it rolls home with an empty cup and its antenna down.
 */
const stagebot: ClipSet = {
  idle: {
    loop: true,
    seconds: 2.8,
    tracks: {
      // Standing still is rolling a little back and forth and tipping the other way.
      ...shove([[0, 0], [0.25, 2.2, 'sineInOut'], [0.75, -2.2, 'sineInOut'], [1, 0, 'sineInOut']], WHEEL),
      body: { rot: [[0, 0], [0.25, -2.6, 'sineInOut'], [0.75, 2.6, 'sineInOut'], [1, 0, 'sineInOut']] },
      // Is anybody looking? Does anybody want this coffee?
      head: { rot: [[0, 0], [0.14, -8, 'inOut'], [0.4, -8, 'hold'], [0.56, 6, 'inOut'], [0.86, 6, 'hold'], [1, 0, 'inOut']] },
      eyes: {
        x: [[0, 0], [0.14, -1.6, 'inOut'], [0.4, -1.6, 'hold'], [0.56, 1.6, 'inOut'], [0.86, 1.6, 'hold'], [1, 0, 'inOut']],
        sy: [[0, 1], [0.28, 0.12, 'hold'], [0.31, 1, 'hold'], [0.7, 0.12, 'hold'], [0.73, 1, 'hold'], [1, 1, 'hold']],
      },
      antenna: { rot: [[0, 0], [0.18, 10, 'inOut'], [0.42, 0, 'inOut'], [0.6, -9, 'inOut'], [0.9, 0, 'inOut'], [1, 0]] },
      // It holds the cup up a little, hopefully, and lowers it again.
      arm_front: { rot: [[0, 0], [0.5, -7, 'sineInOut'], [1, 0, 'sineInOut']] },
      arm_back: { rot: [[0, 0], [0.5, -6, 'sineInOut'], [1, 0, 'sineInOut']] },
      cup: { rot: [[0, 0], [0.5, 7, 'sineInOut'], [1, 0, 'sineInOut']] },
      badge: { rot: swing(5) },
      steam: { sy: [[0, 1], [0.5, 1.3, 'sineInOut'], [1, 1, 'sineInOut']], sx: [[0, 1], [0.5, 0.8, 'sineInOut'], [1, 1, 'sineInOut']], rate: 2 },
    },
  },

  walk: roll(WHEEL, {
    // Leaning into it, the head held level, the cup held leveller.
    body: { rot: [[0, 8], [0.5, 11, 'sineInOut'], [1, 8, 'sineInOut']], y: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']], rate: 2 },
    head: { rot: [[0, -8], [0.5, -10, 'sineInOut'], [1, -8, 'sineInOut']], rate: 2 },
    arm_front: { rot: [[0, -10]] },
    arm_back: { rot: [[0, -10]] },
    cup: { rot: [[0, 2], [0.5, -1, 'sineInOut'], [1, 2, 'sineInOut']], rate: 2 },
    badge: { rot: swing(6, -12), rate: 2 },
    antenna: { rot: swing(6, -16), rate: 2 },
    steam: { rot: [[0, -38]], sy: [[0, 1.1], [0.5, 1.4, 'sineInOut'], [1, 1.1, 'sineInOut']], rate: 3 },
    eyes: { sy: BLINK },
  }),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      ...shove([[0, 0], [0.2, -5, 'out'], [0.4, 9, 'in'], [0.64, 4, 'out'], [1, 0, 'inOut']], WHEEL),
      body: { rot: [[0, 0], [0.2, -9, 'out'], [0.4, 15, 'in'], [0.64, 6, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.2, 7, 'out'], [0.4, -12, 'in'], [1, 0, 'inOut']] },
      // Your coffee! The arm shoots out and the cup goes over.
      arm_front: {
        rot: [[0, 0], [0.2, 16, 'out'], [0.4, -30, 'in'], [0.64, -18, 'out'], [1, 0, 'inOut']],
        x: [[0, 0], [0.2, -3, 'out'], [0.4, 8, 'in'], [0.64, 3, 'out'], [1, 0, 'inOut']],
      },
      cup: { rot: [[0, 0], [0.2, -7, 'out'], [0.4, 62, 'in'], [0.64, 22, 'out'], [1, 0, 'inOut']] },
      lid: {
        y: [[0, 0], [0.4, 0, 'hold'], [0.52, -13, 'out'], [0.74, 0, 'in'], [1, 0]],
        rot: [[0, 0], [0.4, 0, 'hold'], [0.52, -50, 'out'], [0.74, 0, 'in'], [1, 0]],
      },
      steam: {
        sx: [[0, 1], [0.38, 1, 'hold'], [0.5, 2.6, 'out'], [0.8, 1.3, 'inOut'], [1, 1, 'inOut']],
        sy: [[0, 1], [0.38, 1, 'hold'], [0.5, 2.6, 'out'], [0.8, 1.3, 'inOut'], [1, 1, 'inOut']],
      },
      // The other hand stays underneath, as it was taught.
      arm_back: { rot: [[0, 0], [0.2, 10, 'out'], [0.4, -24, 'in'], [0.64, -10, 'out'], [1, 0, 'inOut']] },
      badge: { rot: [[0, 0], [0.2, 14, 'out'], [0.42, -34, 'in'], [0.62, 12, 'inOut'], [0.8, -5, 'inOut'], [1, 0, 'inOut']] },
      antenna: { rot: [[0, 0], [0.2, -16, 'out'], [0.42, 30, 'in'], [0.62, -12, 'inOut'], [0.8, 5, 'inOut'], [1, 0, 'inOut']] },
      eyes: { sy: [[0, 1], [0.3, 1, 'hold'], [0.4, 0.3, 'in'], [0.7, 0.3, 'hold'], [1, 1, 'inOut']] },
    },
  },

  hit: jolt({
    head: { rot: [[0, 0], [0.3, -14, 'out'], [1, 0, 'inOut']] },
    eyes: { sx: [[0, 1], [0.2, 1.4, 'out'], [1, 1, 'inOut']], sy: [[0, 1], [0.2, 1.4, 'out'], [1, 1, 'inOut']] },
    antenna: { rot: rattle(16, 3) },
    badge: { rot: rattle(12, 3) },
    // Not a drop.
    cup: { rot: [[0, 0], [0.25, 5, 'out'], [1, 0, 'inOut']] },
    arm_front: { rot: [[0, 0], [0.25, -6, 'out'], [1, 0, 'inOut']] },
  }),

  die: limpHome(WHEEL, {
    // Slumped over the wheel, the cup upside down, the lid lost on the way.
    body: { rot: [[0, 14], [0.5, 18, 'sineInOut'], [1, 14, 'sineInOut']], y: [[0, 0], [0.5, -2, 'sineInOut'], [1, 0, 'sineInOut']], rate: 4 },
    head: { rot: [[0, 12], [0.5, 17, 'sineInOut'], [1, 12, 'sineInOut']], rate: 2 },
    mouth: { sy: [[0, -1]] },
    eyes: { sy: [[0, 0.4]], y: [[0, 1]] },
    antenna: { rot: swing(8, -112), rate: 2 },
    arm_front: { rot: swing(5, 52), rate: 2 },
    arm_back: { rot: swing(-5, 58), rate: 2 },
    cup: { rot: swing(8, 108), rate: 2 },
    lid: { sx: GONE, sy: GONE },
    steam: { sx: GONE, sy: GONE },
    badge: { rot: swing(14, -14), rate: 2 },
  }),
};

export default stagebot;
