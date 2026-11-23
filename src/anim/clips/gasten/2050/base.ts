import type { Clip, Key } from '../../../types.ts';

/** On, then off: the two sets of bulbs take turns. */
const ON_OFF: Key[] = [[0, 1], [0.5, 0, 'hold'], [1, 1, 'hold']];
const OFF_ON: Key[] = [[0, 0], [0.5, 1, 'hold'], [1, 0, 'hold']];

/**
 * Het Familiehuis does not move, but three things on it do: the car on the roof
 * hovers, packed for next summer as it has been every summer; the wedding lights
 * under the cornice, still up from the last one, blink in turns; and down on the
 * ground floor great-grandmother's curtain twitches, because somebody is passing.
 */
const familiehuisClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 4,
    tracks: {
      car: { y: [[0, 0], [0.5, -4, 'sineInOut'], [1, 0, 'sineInOut']], rot: [[0, -0.6], [0.5, 0.6, 'sineInOut'], [1, -0.6, 'sineInOut']], rate: 2 },
      lights_a: { sx: ON_OFF, sy: ON_OFF, rate: 4 },
      lights_b: { sx: OFF_ON, sy: OFF_ON, rate: 4 },
      curtain: { sx: [[0, 1], [0.6, 1, 'hold'], [0.66, 0.62, 'out'], [0.84, 0.62, 'hold'], [0.9, 1, 'inOut'], [1, 1]] },
    },
  },
};

export default familiehuisClips;
