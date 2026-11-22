import type { Clip, Key } from '../../../types.ts';

/** Rotor blur: squashes sideways and back. */
const WHIRR: Key[] = [[0, 1], [0.5, 0.35, 'linear'], [1, 1, 'linear']];

/** One drone of the Dronezwerm: rotors a blur, the body buzzing a little under them. */
const zwermClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 0.24,
    tracks: {
      body: {
        y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']],
        rot: [[0, -1.5], [0.5, 1.5, 'sineInOut'], [1, -1.5, 'sineInOut']],
      },
      rotor_back: { sx: WHIRR, rate: 2 },
      rotor_front: { sx: WHIRR, rate: 3 },
    },
  },
};

export default zwermClips;
