import { bob } from '../humanoid.ts';
import type { ClipSet } from '../types.ts';
import { idling, jolt, limpHome, roll, shove, type RollStyle } from '../vehicle.ts';

const WHEELS: RollStyle = {
  bigWheel: 30,
  wheels: { wheel_back: 30, wheel_front: 20, wheel_tank: 21 },
  bounce: 1.6,
  rock: 0.5,
};

/**
 * Giertink on his megatrekker: rumbles along with the tank sloshing behind,
 * backs up a little and rams forward while the nozzle whips over the cab.
 */
export const giertink: ClipSet = {
  idle: idling(0.42, 0.9, {
    driver: { rot: [[0, 0], [0.5, 2.5, 'sineInOut'], [1, 0, 'sineInOut']] },
    tank: { y: [[0, 0], [0.5, 0.7, 'sineInOut'], [1, 0, 'sineInOut']] },
  }),

  walk: roll(WHEELS, {
    driver: { y: bob(1.4), rot: [[0, 0], [0.5, 3, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
    // The tank lags behind the tractor's bounce, so the two halves never move as one block.
    tank: { rot: [[0, 0.8], [0.5, -0.8, 'sineInOut'], [1, 0.8, 'sineInOut']], y: [[0, 0], [0.5, 1.2, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
    tool: { rot: [[0, 0], [0.5, 5, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
  }),

  attack: {
    loop: false,
    markers: { hit: 0.34 },
    tracks: {
      ...shove([[0, 0], [0.22, -11, 'out'], [0.34, 17, 'in'], [0.6, 6, 'out'], [1, 0, 'inOut']], WHEELS),
      body: { rot: [[0, 0], [0.22, -2.2, 'out'], [0.34, 3.2, 'in'], [0.6, -1, 'out'], [1, 0, 'inOut']] },
      tank: {
        rot: [[0, 0], [0.22, 2.5, 'out'], [0.34, -3.5, 'in'], [0.6, 1, 'out'], [1, 0, 'inOut']],
        sy: [[0, 1], [0.34, 0.93, 'in'], [0.5, 1.05, 'out'], [1, 1, 'inOut']],
      },
      // The nozzle rears up, then snaps forward over the cab as the gier flies.
      tool: { rot: [[0, 0], [0.22, -34, 'out'], [0.34, 10, 'in'], [0.5, -6, 'out'], [1, 0, 'inOut']] },
      driver: { rot: [[0, 0], [0.22, -11, 'out'], [0.34, 15, 'in'], [0.6, 4, 'out'], [1, 0, 'inOut']] },
    },
  },

  hit: jolt({
    driver: { rot: [[0, 0], [0.3, -14, 'out'], [1, 0, 'inOut']] },
    tank: { rot: [[0, 0], [0.3, 2.5, 'out'], [0.65, -1.2, 'inOut'], [1, 0, 'inOut']] },
  }),

  die: limpHome(WHEELS, {
    driver: { rot: [[0, 16], [0.5, 22, 'sineInOut'], [1, 16, 'sineInOut']], rate: 2 },
    tank: { rot: [[0, 3], [0.5, -3, 'sineInOut'], [1, 3, 'sineInOut']], rate: 4 },
    // The nozzle hangs its head.
    tool: { rot: [[0, 52], [0.5, 60, 'sineInOut'], [1, 52, 'sineInOut']], rate: 4 },
  }),
};
