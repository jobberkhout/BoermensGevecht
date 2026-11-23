import { swing } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';
import { jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

const WHEELS: RollStyle = { bigWheel: 12, wheels: { wheel_back: 12, wheel_front: 12 }, bounce: 0.9, rock: 0.3 };

/** The scanner on the roof turns: its eye slides across the front, goes round the back out of sight, and comes by again. */
const scan = (rate: number): Track => ({
  x: [[0, -4.6], [0.6, 4.6, 'linear'], [1, -4.6, 'hold']],
  sx: [[0, 0.3], [0.12, 1, 'out'], [0.48, 1, 'hold'], [0.6, 0.3, 'in'], [0.61, 0, 'hold'], [1, 0.3, 'hold']],
  rate,
});

/** Two taps on the flip chart, then he waits for a reaction that does not come. */
const TAP: Key[] = [[0, 0], [0.08, -11, 'out'], [0.14, 0, 'in'], [0.22, -11, 'out'], [0.28, 0, 'in'], [1, 0]];

/** A beard that wags while its owner talks: `words` wags in the first part of the cycle, then a pause. */
function talk(words: number, until = 0.6, amount = 4): Key[] {
  const keys: Key[] = [[0, 0]];
  for (let i = 0; i < words; i++) {
    keys.push([((i + 0.5) / words) * until, i % 2 === 0 ? amount : -amount * 0.6, 'sineInOut']);
  }
  keys.push([until, 0, 'sineInOut'], [1, 0]);
  return keys;
}

/** The snore bubble: it grows as he breathes out and shrinks as he breathes in. */
const SNORE: Key[] = [[0, 0.35], [0.5, 1.5, 'sineInOut'], [1, 0.35, 'sineInOut']];
const snore = (rate = 1): Track => ({ sx: SNORE, sy: SNORE, rate });

/** She nods off, lower and lower, and catches herself. */
const NOD: Key[] = [[0, 0], [0.62, 11, 'sineIn'], [0.7, 11, 'hold'], [0.76, -3, 'out'], [0.9, 0, 'inOut'], [1, 0]];

/**
 * The Vergaderpod. Outside, a glass room that drives itself. Inside, a meeting
 * that started years ago: one man still presenting, one asleep, one knitting,
 * a tower of coffee cups and a plant that has left through the roof. Nothing
 * that happens to the pod, ramming included, is reason to adjourn.
 */
const vergaderpod: ClipSet = {
  idle: {
    loop: true,
    seconds: 4.2,
    tracks: {
      body: { y: [[0, 0], [0.5, -0.5, 'sineInOut'], [1, 0, 'sineInOut']], rate: 9 },
      pointer: { rot: TAP },
      beard: { rot: talk(7) },
      presenter_head: { rot: [[0, 0], [0.3, 0, 'hold'], [0.42, -7, 'inOut'], [0.86, -7, 'hold'], [1, 0, 'inOut']] },
      knitter_head: { rot: NOD },
      needles: { rot: swing(13), rate: 12 },
      sleeper_head: { y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']], rate: 2 },
      bubble: snore(2),
      cups: { rot: [[0, 0], [0.5, 2.4, 'sineInOut'], [1, 0, 'sineInOut']], rate: 2 },
      plant: { rot: [[0, 0], [0.5, 1.2, 'sineInOut'], [1, 0, 'sineInOut']] },
      plant_top: { rot: swing(4) },
      lidar: scan(5),
    },
  },

  walk: roll(WHEELS, {
    pointer: { rot: [[0, 0], [0.12, -11, 'out'], [0.22, 0, 'in'], [1, 0]], rate: 2 },
    beard: { rot: swing(5), rate: 3 },
    presenter: { y: [[0, 0], [0.5, -0.8, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
    knitter_head: { rot: swing(3, 3), rate: 3 },
    needles: { rot: swing(13), rate: 9 },
    sleeper_head: { y: [[0, 0], [0.5, -1.4, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
    bubble: snore(1),
    cups: { rot: swing(4), rate: 3 },
    plant: { rot: swing(1.6), rate: 2 },
    plant_top: { rot: swing(9, -8), rate: 2 },
    lidar: scan(4),
  }),

  attack: {
    loop: false,
    markers: { hit: 0.34 },
    tracks: {
      // It backs up, rams, and rolls back to where it stood.
      ...shove([[0, 0], [0.22, -10, 'out'], [0.34, 18, 'in'], [0.6, 6, 'out'], [1, 0, 'inOut']], WHEELS),
      body: { rot: [[0, 0], [0.22, -1.6, 'out'], [0.34, 3, 'in'], [0.6, -1, 'out'], [1, 0, 'inOut']] },
      // Everything loose keeps going when the room stops. The presenter lands against his own chart.
      presenter: {
        x: [[0, 0], [0.22, -2, 'out'], [0.34, 6, 'in'], [0.62, 2, 'out'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.22, -5, 'out'], [0.34, 13, 'in'], [0.62, 4, 'out'], [1, 0, 'inOut']],
      },
      pointer: { rot: [[0, 0], [0.22, 12, 'out'], [0.36, -44, 'in'], [0.62, -10, 'out'], [1, 0, 'inOut']] },
      beard: { rot: [[0, 0], [0.22, 12, 'out'], [0.36, -34, 'in'], [0.56, 16, 'inOut'], [0.76, -7, 'inOut'], [1, 0, 'inOut']] },
      presenter_head: { rot: [[0, 0], [0.22, -6, 'out'], [0.34, 10, 'in'], [1, 0, 'inOut']] },
      // He lifts his head, finds that nothing has been decided, and lays it down again.
      sleeper_head: {
        rot: [[0, 0], [0.3, 0, 'hold'], [0.4, -30, 'out'], [0.66, -26, 'sineInOut'], [0.9, 0, 'in'], [1, 0]],
        y: [[0, 0], [0.3, 0, 'hold'], [0.4, -3, 'out'], [0.66, -3, 'hold'], [0.9, 0, 'in'], [1, 0]],
      },
      bubble: { sx: [[0, 1], [0.32, 1.5, 'out'], [0.34, 0, 'hold'], [0.94, 0, 'hold'], [1, 0.35, 'out']], sy: [[0, 1], [0.32, 1.5, 'out'], [0.34, 0, 'hold'], [0.94, 0, 'hold'], [1, 0.35, 'out']] },
      knitter_head: { rot: [[0, 0], [0.22, -5, 'out'], [0.36, 14, 'in'], [0.6, -3, 'out'], [1, 0, 'inOut']] },
      needles: { rot: [[0, 0], [0.22, -20, 'out'], [0.36, 34, 'in'], [0.6, -10, 'inOut'], [1, 0, 'inOut']] },
      cups: { rot: [[0, 0], [0.22, -9, 'out'], [0.36, 27, 'in'], [0.54, -11, 'inOut'], [0.72, 6, 'inOut'], [0.88, -2, 'inOut'], [1, 0, 'inOut']] },
      plant: { rot: [[0, 0], [0.22, -3, 'out'], [0.36, 6, 'in'], [0.6, -2, 'inOut'], [1, 0, 'inOut']] },
      plant_top: { rot: [[0, 0], [0.22, -14, 'out'], [0.38, 30, 'in'], [0.6, -12, 'inOut'], [0.8, 5, 'inOut'], [1, 0, 'inOut']] },
      lidar: { x: [[0, 0], [0.34, 4.6, 'in'], [0.6, 4.6, 'hold'], [1, 0, 'inOut']] },
    },
  },

  hit: jolt({
    cups: { rot: rattle(9, 3) },
    beard: { rot: rattle(10, 3) },
    pointer: { rot: [[0, 0], [0.3, -16, 'out'], [1, 0, 'inOut']] },
    sleeper_head: { rot: [[0, 0], [0.3, -12, 'out'], [1, 0, 'inOut']] },
    knitter_head: { rot: [[0, 0], [0.3, -9, 'out'], [1, 0, 'inOut']] },
    plant_top: { rot: rattle(10, 3) },
  }),

  // Limping home. The meeting continues: he is still on his second point.
  die: limpHome(WHEELS, {
    pointer: { rot: [[0, 0], [0.16, -11, 'out'], [0.3, 0, 'in'], [1, 0]], rate: 2 },
    beard: { rot: swing(7), rate: 4 },
    presenter: { rot: swing(3, 4), rate: 5 },
    knitter_head: { rot: swing(4, 9), rate: 5 },
    needles: { rot: swing(13), rate: 10 },
    sleeper_head: { y: [[0, 0], [0.5, -1.6, 'sineInOut'], [1, 0, 'sineInOut']], rate: 5 },
    bubble: snore(2),
    cups: { rot: swing(7, 12), rate: 5 },
    plant: { rot: swing(2, 4), rate: 5 },
    plant_top: { rot: swing(8, 52), rate: 5 },
    // The scanner has given up. The pod knows the way home.
    lidar: { sx: [[0, 0]] },
  }),
};

export default vergaderpod;
