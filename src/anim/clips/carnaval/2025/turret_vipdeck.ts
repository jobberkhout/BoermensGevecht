import { rattle } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

/** Swaying to the music in the tent: two beats per cycle. */
const SWAY: Key[] = [[0, 0], [0.25, 3, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, 3, 'sineInOut'], [1, 0, 'sineInOut']];
/** The token: gone the moment it leaves her fingers, and a fresh one from the pile near the end. */
const TOKEN: Key[] = [[0, 1], [0.44, 1, 'hold'], [0.46, 0, 'hold'], [0.84, 0, 'hold'], [1, 1, 'backOut']];

/**
 * Het VIP-deck. The bouncer stands at the rope with his arms folded and looks
 * the crowd over, left and right, behind his sunglasses. The guest in the tiger
 * onesie holds his wristband up so the whole tent can see it, and waves it now
 * and then. The guest with the lampshade sways to the music and turns a token
 * over in her fingers. When the turret fires she flicks it over the rail; the
 * tiger cheers, the bouncer does not.
 */
const vipdeckClips: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 3.2,
    tracks: {
      bouncer_head: { rot: [[0, 0], [0.15, -6, 'sineInOut'], [0.4, -6, 'hold'], [0.55, 5, 'sineInOut'], [0.8, 5, 'hold'], [0.95, 0, 'sineInOut'], [1, 0]] },
      bouncer: { sy: [[0, 1], [0.5, 1.01, 'sineInOut'], [1, 1, 'sineInOut']] },
      // Look. At. The. Wristband.
      b_arm: { rot: [[0, 0], [0.3, 0, 'hold'], [0.38, -8, 'inOut'], [0.46, 6, 'inOut'], [0.54, -8, 'inOut'], [0.62, 6, 'inOut'], [0.7, 0, 'inOut'], [1, 0]] },
      b_body: { rot: [[0, 0], [0.25, -2, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, -2, 'sineInOut'], [1, 0, 'sineInOut']] },
      b_head: { rot: [[0, 0], [0.25, 5, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, 5, 'sineInOut'], [1, 0, 'sineInOut']] },
      a_body: { rot: SWAY },
      a_head: { rot: [[0, 0], [0.25, -4, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, -4, 'sineInOut'], [1, 0, 'sineInOut']] },
      a_shade: { rot: [[0, 0], [0.3, 4, 'sineInOut'], [0.55, -2, 'sineInOut'], [0.8, 4, 'sineInOut'], [1, 0, 'sineInOut']] },
      a_arm: { rot: [[0, 0], [0.5, -6, 'sineInOut'], [1, 0, 'sineInOut']] },
      a_token: { rot: [[0, 0], [1, 360, 'linear']], rate: 2 },
    },
  },

  attack: {
    loop: false,
    seconds: 0.8,
    tracks: {
      // Back over her shoulder and a flick out over the rail.
      a_arm: { rot: [[0, 0], [0.3, -40, 'out'], [0.45, 38, 'in'], [0.62, 26, 'out'], [1, 0, 'inOut']] },
      a_body: { rot: [[0, 0], [0.3, -5, 'out'], [0.45, 6, 'in'], [1, 0, 'inOut']] },
      a_head: { rot: [[0, 0], [0.3, -4, 'out'], [0.45, 6, 'in'], [1, 0, 'inOut']] },
      a_shade: { rot: [[0, 0], [0.3, 8, 'out'], [0.5, -10, 'in'], [0.7, 5, 'inOut'], [1, 0, 'inOut']] },
      a_token: { sx: TOKEN, sy: TOKEN },
      // The tiger cheers it on.
      b_arm: { rot: [[0, 0], [0.44, 0, 'hold'], [0.52, -14, 'out'], [0.62, 8, 'inOut'], [0.74, -10, 'inOut'], [1, 0, 'inOut']] },
      b_head: { rot: [[0, 0], [0.44, 0, 'hold'], [0.52, -8, 'out'], [1, 0, 'inOut']] },
      // The bouncer only turns his head to watch it go.
      bouncer_head: { rot: [[0, 0], [0.4, 0, 'hold'], [0.52, 8, 'inOut'], [0.8, 8, 'hold'], [1, 0, 'inOut']] },
      rope: { rot: rattle(0.6, 2) },
    },
  },
};

export default vipdeckClips;
