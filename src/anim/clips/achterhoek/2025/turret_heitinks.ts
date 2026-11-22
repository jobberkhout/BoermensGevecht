import { swing } from '../../../humanoid.ts';
import { pop, rattle } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

/** Two beats per loop: "NEE!" ... "NEE!" */
const PUMP: Key[] = [[0, 0], [0.1, -10, 'out'], [0.24, 3, 'in'], [0.5, 0, 'inOut'], [0.6, -10, 'out'], [0.74, 3, 'in'], [1, 0, 'inOut']];
const STOMP: Key[] = [[0, 0], [0.1, -3.5, 'out'], [0.22, 0, 'in'], [0.5, 0], [0.6, -3.5, 'out'], [0.72, 0, 'in'], [1, 0]];
/** The same beat, half a beat late: moeke answers opa. */
const PUMP_LATE: Key[] = [[0, 2], [0.25, 0, 'inOut'], [0.35, -9, 'out'], [0.49, 3, 'in'], [0.75, 0, 'inOut'], [0.85, -9, 'out'], [0.99, 3, 'in'], [1, 2]];
const STOMP_LATE: Key[] = [[0, 0], [0.25, 0], [0.35, -3, 'out'], [0.47, 0, 'in'], [0.75, 0], [0.85, -3, 'out'], [0.97, 0, 'in'], [1, 0]];

/**
 * The Heitinks. Opa and moeke pump their signs in turn and shake their heads at
 * everything, moeke's fist never stops, and the youngest tosses an egg while he
 * waits. When the turret fires he throws it and the old folks jab their signs
 * at the enemy.
 */
const heitinkClips: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 1.7,
    tracks: {
      opa_arm: { rot: PUMP },
      opa_body: { y: STOMP },
      opa_head: { rot: swing(9), rate: 2 },
      moeke_sign: { rot: PUMP_LATE },
      moeke_body: { y: STOMP_LATE },
      moeke_head: { rot: swing(7), rate: 3 },
      moeke_fist: { rot: swing(13), rate: 6 },
      jong_body: { y: [[0, 0], [0.5, -2.5, 'sineInOut'], [1, 0, 'sineInOut']], rate: 2 },
      jong_head: { rot: [[0, 0], [0.25, -8, 'sineOut'], [0.5, 0, 'sineIn'], [0.75, -8, 'sineOut'], [1, 0, 'sineIn']] },
      jong_arm: { rot: [[0, 0], [0.08, -8, 'out'], [0.5, 0, 'inOut'], [0.58, -8, 'out'], [1, 0, 'inOut']] },
      // Up it goes, and back into his hand, twice per loop.
      egg: { y: [[0, 0], [0.25, -24, 'out'], [0.5, 0, 'in'], [0.75, -24, 'out'], [1, 0, 'in']], rot: [[0, 0], [1, 720, 'linear']] },
    },
  },

  attack: {
    loop: false,
    seconds: 0.55,
    tracks: {
      // The youngest winds up and lets fly.
      jong_arm: { rot: [[0, 0], [0.22, -75, 'out'], [0.42, 80, 'in'], [0.7, 60, 'out'], [1, 0, 'inOut']] },
      jong_body: { rot: [[0, 0], [0.22, -9, 'out'], [0.42, 12, 'in'], [1, 0, 'inOut']] },
      jong_head: { rot: [[0, 0], [0.22, 6, 'out'], [0.42, -8, 'in'], [1, 0, 'inOut']] },
      egg: { ...pop(0.86, 0.999), sx: [[0, 1], [0.42, 0, 'hold'], [0.85, 0, 'hold'], [1, 1, 'backOut']], sy: [[0, 1], [0.42, 0, 'hold'], [0.85, 0, 'hold'], [1, 1, 'backOut']] },
      // The old folks jab their signs at the enemy.
      opa_arm: { rot: [[0, 0], [0.2, -14, 'out'], [0.42, 30, 'in'], [1, 0, 'inOut']] },
      opa_body: { rot: [[0, 0], [0.42, 8, 'in'], [1, 0, 'inOut']], x: rattle(2, 4) },
      opa_head: { rot: [[0, 0], [0.42, -10, 'in'], [1, 0, 'inOut']] },
      moeke_sign: { rot: [[0, 0], [0.2, -12, 'out'], [0.42, 26, 'in'], [1, 0, 'inOut']] },
      moeke_body: { rot: [[0, 0], [0.42, 7, 'in'], [1, 0, 'inOut']] },
      moeke_fist: { rot: [[0, 0], [0.2, -30, 'out'], [0.42, 40, 'in'], [1, 0, 'inOut']] },
      moeke_head: { rot: [[0, 0], [0.42, -8, 'in'], [1, 0, 'inOut']] },
    },
  },
};

export default heitinkClips;
