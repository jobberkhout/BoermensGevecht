import { rattle } from '../../../props.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';

/** Pixels between two lugs of the track. */
const LUG = 12;
/** One cycle of walking is four lugs. The sprockets have six spokes, so half a turn looks the same as a whole one. */
const STRIDE = LUG * 4;

/** The track running: lugs on top go forward, lugs underneath go back, sprockets turn. `rate` 1 is walking pace. */
function tracks(dir: 1 | -1): Record<string, Track> {
  return {
    tread_top: { x: [[0, 0], [1, dir * LUG, 'linear']], rate: 4 },
    tread_bottom: { x: [[0, 0], [1, -dir * LUG, 'linear']], rate: 4 },
    sprocket_back: { rot: [[0, 0], [1, dir * 180, 'linear']] },
    sprocket_front: { rot: [[0, 0], [1, dir * 180, 'linear']] },
  };
}

/** Smoke from the funnel: a puff grows and drifts up, then the next one. */
function puffing(big: number): Track {
  return {
    sx: [[0, 0.6], [0.8, big, 'out'], [1, 0.6, 'in']],
    sy: [[0, 0.6], [0.8, big, 'out'], [1, 0.6, 'in']],
    y: [[0, 0], [0.8, -5, 'out'], [1, 0, 'in']],
  };
}

/** The glint stays hidden until something bounces off. */
const NO_GLINT: Track = { sx: [[0, 0]], sy: [[0, 0]] };

const WAVE_A: Key[] = [[0, 0], [0.25, -1.6, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, -1.6, 'sineInOut'], [1, 0, 'sineInOut']];
const WAVE_B: Key[] = [[0, -1.6], [0.25, 0, 'sineInOut'], [0.5, -1.6, 'sineInOut'], [0.75, 0, 'sineInOut'], [1, -1.6, 'sineInOut']];

/**
 * MS Kolossaal. A cruise ship on caterpillar tracks, five decks of balconies
 * with towels on every rail, a water slide looping off the back, bunting from
 * the mast to the bow, and on the foredeck a chef who loads the buffet cannon.
 * The passengers wave at everyone they run over. It fires a plate piled with
 * buffet; whatever is thrown back goes ting off the bow. Beaten, it trundles
 * home listing, the passengers below deck.
 */
const msKolossaal: ClipSet = {
  idle: {
    loop: true,
    seconds: 3,
    tracks: {
      hull: { y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']], rot: [[0, -0.4], [0.5, 0.4, 'sineInOut'], [1, -0.4, 'sineInOut']] },
      smoke: { ...puffing(1.3), rate: 2 },
      passengers_a: { y: WAVE_A, rate: 2 },
      passengers_b: { y: WAVE_B, rate: 2 },
      // The chef checks the cannon, and the cannon looks for a target.
      chef: { rot: [[0, 0], [0.4, 0, 'hold'], [0.5, 8, 'inOut'], [0.7, 8, 'hold'], [0.8, 0, 'inOut'], [1, 0]] },
      cannon: { rot: [[0, 0], [0.3, -6, 'sineInOut'], [0.7, 4, 'sineInOut'], [1, 0, 'sineInOut']] },
      glint: NO_GLINT,
    },
  },

  walk: {
    loop: true,
    stride: STRIDE,
    tracks: {
      ...tracks(1),
      hull: { y: [[0, 0], [0.5, -1.6, 'sineInOut'], [1, 0, 'sineInOut']], rot: [[0, -0.6], [0.5, 0.6, 'sineInOut'], [1, -0.6, 'sineInOut']], rate: 2 },
      smoke: puffing(1.5),
      passengers_a: { y: WAVE_A, rate: 2 },
      passengers_b: { y: WAVE_B, rate: 2 },
      cannon: { rot: [[0, 0], [0.5, -3, 'sineInOut'], [1, 0, 'sineInOut']] },
      glint: NO_GLINT,
    },
  },

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      // The cannon swings up, the chef ducks, and the buffet is served.
      cannon: { rot: [[0, 0], [0.3, -16, 'out'], [0.42, -16, 'hold'], [0.47, 8, 'out'], [0.7, -2, 'inOut'], [1, 0, 'inOut']] },
      plate: {
        x: [[0, 0], [0.42, 0, 'hold'], [0.5, 46, 'out'], [0.51, 0, 'hold'], [0.7, 0, 'hold'], [1, 0]],
        y: [[0, 0], [0.42, 0, 'hold'], [0.5, -6, 'out'], [0.51, 0, 'hold'], [1, 0]],
        sx: [[0, 1], [0.42, 1, 'hold'], [0.5, 1.4, 'out'], [0.51, 0, 'hold'], [0.72, 0, 'hold'], [0.84, 1, 'backOut'], [1, 1]],
        sy: [[0, 1], [0.42, 1, 'hold'], [0.5, 1.4, 'out'], [0.51, 0, 'hold'], [0.72, 0, 'hold'], [0.84, 1, 'backOut'], [1, 1]],
      },
      chef: { rot: [[0, 0], [0.3, -10, 'out'], [0.45, -24, 'in'], [0.7, -8, 'out'], [1, 0, 'inOut']] },
      // The whole ship rocks back with the shot.
      hull: { rot: [[0, 0], [0.3, 0.6, 'out'], [0.47, -1.8, 'out'], [0.7, 0.6, 'inOut'], [1, 0, 'inOut']], x: [[0, 0], [0.45, 0, 'hold'], [0.5, -4, 'out'], [1, 0, 'inOut']] },
      smoke: { sx: [[0, 0.8], [0.45, 0.8, 'hold'], [0.55, 2, 'out'], [1, 0.8, 'inOut']], sy: [[0, 0.8], [0.45, 0.8, 'hold'], [0.55, 2, 'out'], [1, 0.8, 'inOut']], y: [[0, 0], [0.45, 0, 'hold'], [0.7, -6, 'out'], [1, 0, 'inOut']] },
      passengers_a: { y: [[0, 0], [0.45, 0, 'hold'], [0.55, -3, 'out'], [0.7, 0, 'in'], [0.8, -2, 'out'], [0.9, 0, 'in'], [1, 0]] },
      passengers_b: { y: [[0, 0], [0.5, 0, 'hold'], [0.6, -3, 'out'], [0.75, 0, 'in'], [0.85, -2, 'out'], [0.95, 0, 'in'], [1, 0]] },
      glint: NO_GLINT,
    },
  },

  // Ting: whatever was thrown bounces off the bow. The ship barely notices; the chef does.
  hit: {
    loop: false,
    seconds: 0.3,
    tracks: {
      glint: {
        sx: [[0, 0], [0.15, 1.8, 'out'], [0.6, 1, 'inOut'], [1, 0, 'in']],
        sy: [[0, 0], [0.15, 1.8, 'out'], [0.6, 1, 'inOut'], [1, 0, 'in']],
        rot: [[0, 0], [1, 60, 'out']],
      },
      hull: { x: rattle(1.6, 3) },
      chef: { rot: [[0, 0], [0.2, -12, 'out'], [1, 0, 'inOut']] },
    },
  },

  // Home, listing to one side, smoke thick and low, everybody below deck.
  die: {
    loop: true,
    stride: STRIDE,
    tracks: {
      ...tracks(1),
      hull: { rot: [[0, -2.4], [0.5, -3.4, 'sineInOut'], [1, -2.4, 'sineInOut']], y: [[0, 1.4], [0.5, 0.4, 'sineInOut'], [1, 1.4, 'sineInOut']], rate: 2 },
      smoke: { ...puffing(1.8), rate: 2 },
      passengers_a: { y: [[0, 6]], sy: [[0, 0]] },
      passengers_b: { y: [[0, 6]], sy: [[0, 0]] },
      chef: { rot: [[0, -30]], y: [[0, 2]] },
      cannon: { rot: [[0, 24]] },
      glint: NO_GLINT,
    },
  },
};

export default msKolossaal;
