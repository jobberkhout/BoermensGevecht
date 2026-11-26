import { swing } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** The pennant at the masthead, never quite still. */
const FLUTTER: Key[] = [[0, 0], [0.25, 7, 'sineInOut'], [0.5, -4, 'sineInOut'], [0.75, 6, 'sineInOut'], [1, 0, 'sineInOut']];

/**
 * De Drijvende Wijk. A slab of floating neighbourhood under sail: a white box
 * with solar panels, a cube on a pole, a container made into a home, two palms
 * and a city beach at the bow with a parasol and a deckchair. It floats a hand
 * above the road on a puddle of its own harbour water, bobbing as it goes. It
 * fights by ramming: back on the swell, and the bow into whoever is in front.
 * Beaten, it limps home listing, the sail half down.
 */
const drijvendeWijk: ClipSet = {
  idle: {
    loop: true,
    seconds: 3.2,
    tracks: {
      slab: { y: [[0, 0], [0.5, -1.8, 'sineInOut'], [1, 0, 'sineInOut']], rot: [[0, -0.6], [0.5, 0.6, 'sineInOut'], [1, -0.6, 'sineInOut']] },
      water: { sx: [[0, 1], [0.5, 1.04, 'sineInOut'], [1, 1, 'sineInOut']], sy: [[0, 1], [0.5, 0.8, 'sineInOut'], [1, 1, 'sineInOut']] },
      sail: { sx: [[0, 1], [0.5, 1.03, 'sineInOut'], [1, 1, 'sineInOut']] },
      pennant: { rot: FLUTTER, rate: 2 },
      palm: { rot: swing(2) },
      parasol: { rot: swing(2, 0, 0.3) },
    },
  },

  // Bobbing on its way, two swells a cycle, the wind full in the sail.
  walk: {
    loop: true,
    stride: 120,
    tracks: {
      slab: {
        y: [[0, 0], [0.25, -3.4, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, -3.4, 'sineInOut'], [1, 0, 'sineInOut']],
        rot: [[0, -1.2], [0.25, 1, 'sineInOut'], [0.5, -1.2, 'sineInOut'], [0.75, 1, 'sineInOut'], [1, -1.2, 'sineInOut']],
      },
      water: {
        sx: [[0, 1.02], [0.25, 1.08, 'sineInOut'], [0.5, 1.02, 'sineInOut'], [0.75, 1.08, 'sineInOut'], [1, 1.02, 'sineInOut']],
        sy: [[0, 1], [0.25, 0.7, 'sineInOut'], [0.5, 1, 'sineInOut'], [0.75, 0.7, 'sineInOut'], [1, 1, 'sineInOut']],
      },
      sail: { sx: [[0, 1.05], [0.5, 1.08, 'sineInOut'], [1, 1.05, 'sineInOut']] },
      pennant: { rot: FLUTTER, rate: 4 },
      palm: { rot: swing(3, -2), rate: 2 },
      parasol: { rot: swing(3, -3, 0.2), rate: 2 },
    },
  },

  // Back on the swell, then the bow into them; the parasol whips, the palms bow.
  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      slab: {
        x: [[0, 0], [0.25, -12, 'out'], [0.4, 16, 'in'], [0.62, 4, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.25, -4, 'out'], [0.4, 1, 'in'], [0.6, -2, 'out'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.25, -2.5, 'out'], [0.4, 3, 'in'], [0.6, -1.5, 'out'], [1, 0, 'inOut']],
      },
      water: {
        x: [[0, 0], [0.25, -8, 'out'], [0.4, 12, 'in'], [1, 0, 'inOut']],
        sx: [[0, 1], [0.25, 0.94, 'out'], [0.42, 1.16, 'out'], [0.7, 1, 'inOut'], [1, 1]],
        sy: [[0, 1], [0.42, 1.5, 'out'], [0.7, 1, 'inOut'], [1, 1]],
      },
      sail: { sx: [[0, 1], [0.25, 0.96, 'out'], [0.42, 1.1, 'out'], [0.8, 1, 'inOut'], [1, 1]] },
      pennant: { rot: [[0, 0], [0.25, -10, 'out'], [0.42, 24, 'out'], [0.6, -8, 'inOut'], [0.8, 4, 'inOut'], [1, 0, 'inOut']] },
      palm: { rot: [[0, 0], [0.25, -5, 'out'], [0.44, 10, 'out'], [0.68, -4, 'inOut'], [1, 0, 'inOut']] },
      parasol: { rot: [[0, 0], [0.25, -8, 'out'], [0.4, 0, 'in'], [0.46, 22, 'out'], [0.7, -8, 'inOut'], [1, 0, 'inOut']] },
    },
  },

  // Knocked back on the water; the parasol rattles, the palms shake.
  hit: {
    loop: false,
    seconds: 0.3,
    tracks: {
      slab: {
        x: [[0, 0], [0.25, -5, 'out'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.25, -2, 'out'], [0.6, 1, 'inOut'], [1, 0, 'inOut']],
      },
      parasol: { rot: rattle(7, 3) },
      palm: { rot: rattle(3, 3) },
      pennant: { rot: rattle(14, 3) },
    },
  },

  // Home, listing to the stern, the sail half down, the pennant hanging.
  die: {
    loop: true,
    stride: 110,
    tracks: {
      slab: {
        y: [[0, 2], [0.5, -2, 'sineInOut'], [1, 2, 'sineInOut']],
        rot: [[0, -4.5], [0.5, -2, 'sineInOut'], [1, -4.5, 'sineInOut']],
        rate: 2,
      },
      water: { sx: [[0, 0.94], [0.5, 1, 'sineInOut'], [1, 0.94, 'sineInOut']], rate: 2 },
      sail: { sy: [[0, 0.62]], sx: [[0, 0.94]] },
      pennant: { rot: [[0, 68], [0.5, 74, 'sineInOut'], [1, 68, 'sineInOut']] },
      palm: { rot: swing(3, 8), rate: 2 },
      parasol: { rot: swing(4, 12), rate: 2 },
    },
  },
};

export default drijvendeWijk;
