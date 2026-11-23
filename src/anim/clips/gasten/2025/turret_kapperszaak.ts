import { swing } from '../../../humanoid.ts';
import { chatter, rattle } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

const STEAM: Key[] = [[0, 0.6], [0.5, 1.15, 'sineInOut'], [1, 0.6, 'sineInOut']];

/**
 * De Kapperszaak. Nobody is in the chair: the two on the bench came for the
 * talk. B explains how it really went, A sips his tea and has his own opinion,
 * the barber listens and nods. When the turret fires, the barber whips a hot
 * towel out of the warmer and over the road.
 */
const kapperszaakClips: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 3.6,
    tracks: {
      // B's turn: talking with his hand.
      b_mouth: { sy: chatter(0.02, 0.48, 8) },
      b_arm: { rot: [[0, 0], [0.08, -14, 'inOut'], [0.18, 8, 'inOut'], [0.28, -16, 'inOut'], [0.38, 6, 'inOut'], [0.48, 0, 'inOut'], [0.55, 30, 'inOut'], [0.94, 30, 'hold'], [1, 0, 'inOut']] },
      b_head: { rot: [[0, 0], [0.12, -4, 'sineInOut'], [0.28, 4, 'sineInOut'], [0.48, 0, 'sineInOut'], [1, 0]] },
      b_body: { rot: [[0, 0], [0.24, -3, 'sineInOut'], [0.48, 0, 'sineInOut'], [1, 0]] },
      // A sips while B talks, then has his say.
      a_arm: { rot: [[0, 0], [0.1, -14, 'inOut'], [0.3, -14, 'hold'], [0.4, 0, 'inOut'], [1, 0]] },
      a_head: { rot: [[0, 0], [0.1, -6, 'inOut'], [0.3, -6, 'hold'], [0.4, 0, 'inOut'], [0.6, 5, 'sineInOut'], [0.75, -4, 'sineInOut'], [0.9, 3, 'sineInOut'], [1, 0, 'sineInOut']] },
      a_mouth: { sy: chatter(0.52, 0.96, 7) },
      // The barber nods along with whoever is talking.
      barber_head: { rot: [[0, 0], [0.2, 6, 'sineInOut'], [0.3, 0, 'sineInOut'], [0.45, 6, 'sineInOut'], [0.55, 0, 'sineInOut'], [0.75, -5, 'sineInOut'], [0.85, 0, 'sineInOut'], [1, 0]] },
      barber_arm: { rot: swing(4, 0) },
      steam: { sy: STEAM, sx: [[0, 1], [0.5, 0.8, 'sineInOut'], [1, 1, 'sineInOut']], rate: 2 },
    },
  },

  attack: {
    loop: false,
    seconds: 0.6,
    tracks: {
      // Back, and over the road with it.
      barber_arm: { rot: [[0, 0], [0.25, 70, 'out'], [0.4, -110, 'in'], [0.65, -95, 'out'], [1, 0, 'inOut']] },
      barber: { rot: [[0, 0], [0.25, -6, 'out'], [0.4, 7, 'in'], [1, 0, 'inOut']] },
      barber_head: { rot: [[0, 0], [0.25, 6, 'out'], [0.4, -8, 'in'], [1, 0, 'inOut']] },
      towel: {
        sx: [[0, 1], [0.4, 1, 'hold'], [0.42, 0, 'hold'], [0.85, 0, 'hold'], [1, 1, 'backOut']],
        sy: [[0, 1], [0.4, 1, 'hold'], [0.42, 0, 'hold'], [0.85, 0, 'hold'], [1, 1, 'backOut']],
      },
      // The two on the bench turn round to watch it land.
      a_body: { rot: [[0, 0], [0.3, 6, 'out'], [0.8, 6, 'hold'], [1, 0, 'inOut']] },
      b_body: { rot: [[0, 0], [0.3, 8, 'out'], [0.8, 8, 'hold'], [1, 0, 'inOut']] },
      a_mouth: { sy: [[0, 0.2], [0.3, 1.4, 'out'], [0.8, 1.4, 'hold'], [1, 0.2, 'in']] },
      b_mouth: { sy: [[0, 0.2], [0.3, 1.4, 'out'], [0.8, 1.4, 'hold'], [1, 0.2, 'in']] },
      b_arm: { rot: [[0, 0], [0.3, -20, 'out'], [0.8, -20, 'hold'], [1, 0, 'inOut']] },
      steam: { sy: [[0, 1], [0.4, 1.6, 'out'], [1, 1, 'inOut']], sx: [[0, 1], [0.4, 1.3, 'out'], [1, 1, 'inOut']] },
      frame: { x: rattle(2, 5) },
    },
  },
};

export default kapperszaakClips;
