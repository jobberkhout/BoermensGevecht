import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';
import { jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

/** Electric, so nothing shakes; only the wheels turn. */
const WHEELS: RollStyle = { bigWheel: 15, wheels: { wheel_back: 15, wheel_front: 15 }, bounce: 1, rock: 0.4 };

/** The hydraulics: up, down, up, down. Pixels; negative is up. */
const PUMP: Key[] = [[0, 0], [0.25, -8, 'inOut'], [0.5, 0, 'inOut'], [0.75, -8, 'inOut'], [1, 0, 'inOut']];
/** The jester nods along with the pump. */
const NOD: Key[] = [[0, 2], [0.25, -6, 'inOut'], [0.5, 2, 'inOut'], [0.75, -6, 'inOut'], [1, 2, 'inOut']];
/** And waves the hammer. */
const WAVE: Key[] = [[0, 0], [0.25, -16, 'inOut'], [0.5, 6, 'inOut'], [0.75, -16, 'inOut'], [1, 0, 'inOut']];
/** The steering wheel, turning by itself: nobody is driving. */
const SELF_STEER: Key[] = [[0, 0], [0.3, -50, 'inOut'], [0.55, -50, 'hold'], [0.8, 30, 'inOut'], [1, 0, 'inOut']];
/** The lidar's eye sweeps across, round and round. */
const SCAN: Key[] = [[0, -5], [0.5, 5, 'sineInOut'], [1, -5, 'sineInOut']];
/** An airbag going off. */
const BANG: Key[] = [[0, 1], [0.15, 1.5, 'out'], [0.6, 1.4, 'hold'], [1, 1, 'inOut']];

/**
 * De Zelfrijdende Praalwagen. The float of 2050 drives itself: an electric
 * platform with a battery on the afterdeck, a lidar on its nose, and an empty
 * seat whose steering wheel turns on its own. It is wrapped in crowd barriers
 * and airbags, and on a hydraulic ram in the middle a papier-mâché jester
 * pumps up and down, waving an inflatable hammer: even the club is safe now.
 * To attack, the ram shoots up and the jester brings the hammer down on
 * whoever is in front. Hit, its airbags go off. Beaten, it rolls home with
 * the ram sunk, the jester slumped and the airbags hanging flat.
 */
const zelfrijdendePraalwagen: ClipSet = {
  idle: {
    loop: true,
    seconds: 2,
    tracks: {
      ram: { y: PUMP },
      jester: { rot: NOD },
      jester_arm: { rot: WAVE },
      steering: { rot: SELF_STEER },
      lidar_eye: { x: SCAN, rate: 2 },
      airbag_front: { sx: [[0, 1], [0.5, 1.04, 'sineInOut'], [1, 1, 'sineInOut']] },
      airbag_back: { sx: [[0, 1], [0.5, 1.04, 'sineInOut'], [1, 1, 'sineInOut']] },
    },
  },

  walk: roll(WHEELS, {
    ram: { y: PUMP },
    jester: { rot: NOD },
    jester_arm: { rot: WAVE },
    steering: { rot: SELF_STEER },
    lidar_eye: { x: SCAN, rate: 3 },
  }),

  // The ram shoots up, and the jester brings the hammer down on whoever is in front.
  attack: {
    loop: false,
    markers: { hit: 0.42 },
    tracks: {
      ...shove([[0, 0], [0.24, -8, 'out'], [0.42, 14, 'in'], [0.64, 5, 'out'], [1, 0, 'inOut']], WHEELS),
      body: { rot: [[0, 0], [0.24, -1.6, 'out'], [0.42, 2.4, 'in'], [0.62, -0.8, 'out'], [1, 0, 'inOut']] },
      ram: { y: [[0, 0], [0.24, -10, 'out'], [0.42, -13, 'in'], [0.7, -6, 'out'], [1, 0, 'inOut']] },
      jester: { rot: [[0, 0], [0.24, -14, 'out'], [0.42, 48, 'in'], [0.62, 38, 'out'], [1, 0, 'inOut']] },
      jester_arm: { rot: [[0, 0], [0.24, -44, 'out'], [0.42, 26, 'in'], [0.6, 20, 'out'], [1, 0, 'inOut']] },
      airbag_front: { sx: [[0, 1], [0.42, 1, 'hold'], [0.48, 1.3, 'out'], [0.7, 1, 'inOut'], [1, 1]] },
      steering: { rot: [[0, 0], [0.42, 0, 'hold'], [0.5, 60, 'out'], [1, 0, 'inOut']] },
    },
  },

  // Hit: the airbags go off, both of them, and the jester rattles on its ram.
  hit: jolt({
    airbag_front: { sx: BANG, sy: BANG },
    airbag_back: { sx: BANG, sy: BANG },
    jester: { rot: rattle(10, 3) },
    jester_arm: { rot: rattle(16, 3) },
    ram: { y: [[0, 0], [0.2, 4, 'out'], [1, 0, 'inOut']] },
  }),

  // Home on its own: the ram sunk, the jester slumped over, the airbags hanging flat.
  die: limpHome(WHEELS, {
    ram: { y: [[0, 8]] },
    jester: { rot: [[0, 22], [0.5, 26, 'sineInOut'], [1, 22, 'sineInOut']] },
    jester_arm: { rot: [[0, 96]] },
    airbag_front: { sx: [[0, 0.5]], sy: [[0, 0.8]] },
    airbag_back: { sx: [[0, 0.5]], sy: [[0, 0.8]] },
    steering: { rot: [[0, -20], [0.5, 20, 'sineInOut'], [1, -20, 'sineInOut']] },
    lidar_eye: { x: [[0, 0]] },
  }),
};

export default zelfrijdendePraalwagen;
