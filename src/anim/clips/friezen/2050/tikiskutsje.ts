import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';
import { jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

/** The hover pads turn with the distance, as wheels would. */
const PADS: RollStyle = { bigWheel: 9, wheels: { wheel_back: 9, wheel_front: 9 }, bounce: 2.4, rock: 0.8 };

const TURN: Key[] = [[0, 0], [1, 360, 'linear']];

/** Flames flicker, each on its own beat. */
const FLICKER: Key[] = [[0, 1], [0.25, 1.18, 'sineInOut'], [0.5, 0.9, 'sineInOut'], [0.75, 1.12, 'sineInOut'], [1, 1, 'sineInOut']];

/**
 * It Tikiskûtsje. The skûtsje still races, but there is no more water worth
 * the name and it is thirty-five degrees, so it hovers, and it is a party
 * now: a palm tree for a mast, a tiki bar on the afterdeck, garlands on the
 * rail and a torch at either end. The helmsman steers with a cocktail in the
 * other hand; the crew hangs out over the high side as skûtsje crews always
 * have, glass raised. The leeboard is a skid. To attack it lurches in and the
 * leeboard slams down on whoever is under it. Beaten, it drifts home nose
 * down, the torches gone out, the crew slumped over the rail.
 */
const tikiskutsje: ClipSet = {
  idle: {
    loop: true,
    seconds: 2.4,
    tracks: {
      body: { y: [[0, 0], [0.5, -3, 'sineInOut'], [1, 0, 'sineInOut']] },
      shadow: { sx: [[0, 1], [0.5, 0.94, 'sineInOut'], [1, 1, 'sineInOut']] },
      jets: { sy: [[0, 1], [0.5, 0.8, 'sineInOut'], [1, 1, 'sineInOut']], rate: 2 },
      wheel_back: { rot: TURN, rate: 2 },
      wheel_front: { rot: TURN, rate: 2 },
      palm: { rot: [[0, -3], [0.5, 3, 'sineInOut'], [1, -3, 'sineInOut']] },
      // Cheers! And again.
      toast: { rot: [[0, 0], [0.2, -14, 'out'], [0.3, 0, 'in'], [0.6, 0, 'hold'], [0.7, -14, 'out'], [0.8, 0, 'in'], [1, 0]] },
      crew_b: { rot: [[0, 0], [0.5, 4, 'sineInOut'], [1, 0, 'sineInOut']] },
      crew_a: { rot: [[0, 0], [0.5, -2, 'sineInOut'], [1, 0, 'sineInOut']] },
      leeboard: { rot: [[0, 0], [0.5, 2, 'sineInOut'], [1, 0, 'sineInOut']] },
      flame_bow: { sx: FLICKER, sy: FLICKER, rate: 3 },
      flame_stern: { sx: FLICKER, sy: FLICKER, rate: 4 },
    },
  },

  walk: roll(PADS, {
    jets: { sy: [[0, 1], [0.5, 0.75, 'sineInOut'], [1, 1, 'sineInOut']], rate: 3 },
    shadow: { sx: [[0, 1], [0.5, 0.95, 'sineInOut'], [1, 1, 'sineInOut']], rate: 3 },
    // The wind of its own speed: the palm and the flames stream back.
    palm: { rot: [[0, -8], [0.5, -5, 'sineInOut'], [1, -8, 'sineInOut']], rate: 2 },
    flame_bow: { rot: [[0, -24]], sx: FLICKER, sy: FLICKER, rate: 3 },
    flame_stern: { rot: [[0, -24]], sx: FLICKER, sy: FLICKER, rate: 4 },
    crew_b: { rot: [[0, 6], [0.5, 10, 'sineInOut'], [1, 6, 'sineInOut']], rate: 2 },
    toast: { rot: [[0, -6], [0.5, 4, 'sineInOut'], [1, -6, 'sineInOut']], rate: 2 },
    leeboard: { rot: [[0, -6], [0.5, -2, 'sineInOut'], [1, -6, 'sineInOut']], rate: 2 },
  }),

  attack: {
    loop: false,
    markers: { hit: 0.42 },
    tracks: {
      ...shove([[0, 0], [0.24, -10, 'out'], [0.42, 14, 'in'], [0.64, 5, 'out'], [1, 0, 'inOut']], PADS),
      body: { rot: [[0, 0], [0.24, -2.4, 'out'], [0.42, 3.2, 'in'], [0.62, -1, 'out'], [1, 0, 'inOut']] },
      // The leeboard swings up and out, and slams down.
      leeboard: { rot: [[0, 0], [0.24, -70, 'out'], [0.42, 24, 'in'], [0.6, 14, 'out'], [1, 0, 'inOut']] },
      crew_b: { rot: [[0, 0], [0.24, -10, 'out'], [0.42, 18, 'in'], [1, 0, 'inOut']] },
      toast: { rot: [[0, 0], [0.24, 10, 'out'], [0.44, -30, 'in'], [1, 0, 'inOut']] },
      crew_a: { rot: [[0, 0], [0.24, -6, 'out'], [0.42, 8, 'in'], [1, 0, 'inOut']] },
      palm: { rot: [[0, 0], [0.24, -10, 'out'], [0.46, 12, 'in'], [0.7, -4, 'inOut'], [1, 0, 'inOut']] },
      jets: { sy: [[0, 1], [0.24, 0.6, 'out'], [0.42, 1.4, 'in'], [1, 1, 'inOut']] },
    },
  },

  hit: jolt({
    palm: { rot: rattle(8, 3) },
    crew_b: { rot: rattle(6, 3) },
    toast: { rot: rattle(12, 3) },
    jets: { sx: [[0, 1], [0.2, 0.5, 'hold'], [0.4, 1, 'hold'], [1, 1]] },
  }),

  // Home on one pad, nose down; torches out, the party slumped over the rail.
  die: limpHome(PADS, {
    body: { rot: [[0, 3], [0.5, 5, 'sineInOut'], [1, 3, 'sineInOut']], y: [[0, 4], [0.5, 2, 'sineInOut'], [1, 4, 'sineInOut']], rate: 3 },
    palm: { rot: [[0, 18]] },
    crew_b: { rot: [[0, 30]] },
    toast: { rot: [[0, 120]] },
    crew_a: { rot: [[0, 16]] },
    flame_bow: { sx: [[0, 0.2]], sy: [[0, 0.2]] },
    flame_stern: { sx: [[0, 0.2]], sy: [[0, 0.2]] },
    jets: { sy: [[0, 0.5], [0.5, 0.2, 'hold'], [1, 0.5, 'hold']], rate: 4 },
  }),
};

export default tikiskutsje;
