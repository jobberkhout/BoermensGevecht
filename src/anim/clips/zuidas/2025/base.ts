import type { Clip, Key } from '../../../types.ts';

/**
 * A door leaf seen from the front as it goes round: full width, edge-on, full
 * width again. Two leaves a quarter turn apart make the whole door.
 */
const TURN: Key[] = [[0, 1], [0.25, 0.04, 'sineIn'], [0.5, 1, 'sineOut'], [0.75, 0.04, 'sineIn'], [1, 1, 'sineOut']];
const QUARTER_LATER: Key[] = [[0, 0.04], [0.25, 1, 'sineOut'], [0.5, 0.04, 'sineIn'], [0.75, 1, 'sineOut'], [1, 0.04, 'sineIn']];

/**
 * Het Spiegelpaleis stands still, apart from its revolving door, which has not
 * stopped since the building opened.
 */
const spiegelpaleisClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 5,
    tracks: {
      door_a: { sx: TURN },
      door_b: { sx: QUARTER_LATER },
    },
  },
};

export default spiegelpaleisClips;
