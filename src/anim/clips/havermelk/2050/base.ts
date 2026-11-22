import type { Clip, Key } from '../../../types.ts';

/** Rotor blur: squashes sideways many times per cycle. */
const WHIRR: Key[] = [[0, 1], [0.5, 0.3, 'linear'], [1, 1, 'linear']];

/**
 * The Ecotoren does not move, but two things on its roof do: the hologram of
 * the three crosses bobs over its projector and flickers now and then, and a
 * delivery drone hangs above the landing pad.
 */
const ecotorenClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 3.6,
    tracks: {
      holo: {
        y: [[0, 0], [0.5, -3, 'sineInOut'], [1, 0, 'sineInOut']],
        sx: [[0, 1], [0.4, 1, 'hold'], [0.42, 0.9, 'hold'], [0.44, 1.04, 'hold'], [0.46, 1, 'hold'], [0.86, 1, 'hold'], [0.88, 0.94, 'hold'], [0.9, 1, 'hold'], [1, 1]],
      },
      drone: {
        y: [[0, 0], [0.5, -6, 'sineInOut'], [1, 0, 'sineInOut']],
        x: [[0, 0], [0.25, 3, 'sineInOut'], [0.75, -3, 'sineInOut'], [1, 0, 'sineInOut']],
        rot: [[0, -2], [0.5, 3, 'sineInOut'], [1, -2, 'sineInOut']],
      },
      rotor_l: { sx: WHIRR, rate: 18 },
      rotor_r: { sx: WHIRR, rate: 19 },
    },
  },
};

export default ecotorenClips;
