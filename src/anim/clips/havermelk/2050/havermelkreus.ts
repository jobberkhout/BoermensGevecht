import { bob, swing } from '../../../humanoid.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';

/** In, out and back to `mid`, like breathing. */
const pulse = (amount: number, mid = 1): Key[] => [[0, mid], [0.5, mid + amount, 'sineInOut'], [1, mid, 'sineInOut']];

/** Twice per cycle, on each footfall: a sudden `amount` and a slower way back to `mid`. */
const stomp = (amount: number, mid = 0, rebound = 0): Key[] => [
  [0, mid],
  [0.19, mid, 'hold'],
  [0.26, mid + amount, 'in'],
  [0.37, mid - rebound, 'out'],
  [0.5, mid, 'sineInOut'],
  [0.69, mid, 'hold'],
  [0.76, mid + amount, 'in'],
  [0.87, mid - rebound, 'out'],
  [1, mid, 'sineInOut'],
];

/** Both scales of a part at once. */
const size = (keys: Key[]): Track => ({ sx: keys, sy: keys });

const LEG = 52;
/** How far a leg of that length has to shorten when the body drops `px`. */
const squash = (px: number): number => -px / LEG;
/** Degrees a leg swings either way in the walk, and how far the body dips at full spread to keep both feet down. */
const STEP = 15;
const DIP = LEG * (1 - Math.cos((STEP * Math.PI) / 180));
/** The extra drop of a stomp, in pixels. */
const DROP = 3.4;
/** The attack: how far the carton leans back and then in, and where the cup arm is at the top and at the blow. */
const LEAN_BACK = -7;
const LEAN_IN = 10;
const ARM_UP = -152;
const ARM_DOWN = -50;

/**
 * De Havermelkreus: three storeys of oat milk on two short legs. It has
 * everyone on mute, which is why nothing the enemy thinks up gets through.
 * Every step lands like a dropped fridge and squeezes a squirt out from under
 * the cap; the barista in the porthole drinks a flat white through all of it.
 */
const havermelkreus: ClipSet = {
  idle: {
    loop: true,
    seconds: 3.2,
    tracks: {
      // The milk never quite settles.
      torso: { sy: pulse(0.012), rot: swing(0.8) },
      head: { rot: swing(-1.4, 0, 0.15), y: pulse(-1.2, 0) },
      arm_front: { rot: pulse(3, 0) },
      arm_back: { rot: pulse(-3, 0) },
      cup: { rot: swing(3) },
      straw: { rot: swing(5, 0, 0.3) },
      steam: size([[0, 1], [0.3, 1.3, 'sineInOut'], [0.6, 0.75, 'sineInOut'], [1, 1, 'sineInOut']]),
      // The pilot leans back for a sip, every time round.
      pilot: { rot: [[0, 0], [0.5, 0, 'hold'], [0.62, -14, 'inOut'], [0.8, -14, 'hold'], [0.92, 0, 'inOut'], [1, 0]] },
      sip: {
        x: [[0, 0], [0.5, 0, 'hold'], [0.62, -3.4, 'inOut'], [0.8, -3.4, 'hold'], [0.92, 0, 'inOut'], [1, 0]],
        y: [[0, 0], [0.5, 0, 'hold'], [0.62, -6.5, 'inOut'], [0.8, -6.5, 'hold'], [0.92, 0, 'inOut'], [1, 0]],
        rot: [[0, 0], [0.5, 0, 'hold'], [0.62, -38, 'inOut'], [0.8, -38, 'hold'], [0.92, 0, 'inOut'], [1, 0]],
      },
      // A drop swells under the cap, lets go and runs down the front; a new one starts.
      drip: {
        sy: [[0, 0.5], [0.3, 1.5, 'sineIn'], [0.36, 1.1, 'out'], [0.66, 1.1, 'hold'], [0.7, 0, 'in'], [0.84, 0, 'hold'], [1, 0.5, 'out']],
        sx: [[0, 0.6], [0.3, 1, 'sineIn'], [0.66, 1, 'hold'], [0.7, 0, 'in'], [0.84, 0, 'hold'], [1, 0.6, 'out']],
        y: [[0, 0], [0.34, 0, 'hold'], [0.68, 74, 'in'], [0.84, 74, 'hold'], [0.85, 0, 'hold'], [1, 0]],
      },
      spurt: size([[0, 0], [0.06, 0, 'hold'], [0.1, 0.8, 'backOut'], [0.2, 0.8, 'hold'], [0.26, 0, 'in'], [1, 0, 'hold']]),
    },
  },

  walk: {
    loop: true,
    stride: 54,
    tracks: {
      // Each foot comes down flat. The body dips as the legs spread, as in any walk, and then drops
      // another few pixels onto the foot that landed; the legs take up exactly that extra drop.
      hips: { y: [[0, 0], [0.19, DIP * 0.86, 'sineInOut'], [0.26, DIP + DROP, 'in'], [0.37, DIP * 0.53 - 0.6, 'out'], [0.5, 0, 'sineInOut'], [0.69, DIP * 0.86, 'sineInOut'], [0.76, DIP + DROP, 'in'], [0.87, DIP * 0.53 - 0.6, 'out'], [1, 0, 'sineInOut']] },
      leg_front: { rot: swing(-STEP), sy: stomp(squash(DROP), 1, squash(0.6)) },
      leg_back: { rot: swing(STEP), sy: stomp(squash(DROP), 1, squash(0.6)) },
      torso: { rot: bob(1.2, 2), sy: stomp(-0.028, 1, -0.012) },
      head: { rot: bob(-1.6), y: stomp(2.6, 0, 1.2) },
      arm_front: { rot: swing(8) },
      arm_back: { rot: swing(-8) },
      cup: { rot: swing(6, 0, 0.1) },
      straw: { rot: swing(10, 0, 0.2) },
      steam: size(stomp(0.7, 0.8)),
      // What the stomp shakes loose.
      spurt: size([[0, 0], [0.24, 0, 'hold'], [0.3, 1, 'backOut'], [0.42, 1, 'hold'], [0.48, 0, 'in'], [0.74, 0, 'hold'], [0.8, 1, 'backOut'], [0.92, 1, 'hold'], [0.98, 0, 'in'], [1, 0, 'hold']]),
      drip: { sy: stomp(0.7, 1), y: stomp(2, 0) },
      // The pilot rides it out, a beat behind the machine.
      pilot: { y: [[0, 0], [0.24, 0, 'hold'], [0.32, 2.6, 'in'], [0.44, -1.4, 'out'], [0.54, 0, 'sineInOut'], [0.74, 0, 'hold'], [0.82, 2.6, 'in'], [0.94, -1.4, 'out'], [1, 0, 'sineInOut']] },
      sip: { y: [[0, 0], [0.26, 0, 'hold'], [0.36, -3, 'out'], [0.5, 0, 'in'], [0.76, 0, 'hold'], [0.86, -3, 'out'], [1, 0, 'in']] },
    },
  },

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      // It leans back on its heels, then throws its whole weight forward into the swing.
      hips: {
        x: [[0, 0], [0.24, -3, 'out'], [0.4, 5, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.24, -1.6, 'out'], [0.4, 3.1, 'in'], [0.56, -0.5, 'out'], [1, 0, 'inOut']],
      },
      // The feet stay where they are: the legs lean against the shove and take up the drop.
      leg_front: {
        rot: [[0, 0], [0.24, -3.3, 'out'], [0.4, 5.5, 'in'], [1, 0, 'inOut']],
        sy: [[0, 1], [0.24, 1 - squash(1.6), 'out'], [0.4, 1 + squash(3.1), 'in'], [0.56, 1 - squash(0.5), 'out'], [1, 1, 'inOut']],
      },
      leg_back: {
        rot: [[0, 0], [0.24, -3.3, 'out'], [0.4, 5.5, 'in'], [1, 0, 'inOut']],
        sy: [[0, 1], [0.24, 1 - squash(1.6), 'out'], [0.4, 1 + squash(3.1), 'in'], [0.56, 1 - squash(0.5), 'out'], [1, 1, 'inOut']],
      },
      torso: {
        rot: [[0, 0], [0.24, LEAN_BACK, 'out'], [0.4, LEAN_IN, 'in'], [0.56, LEAN_IN - 3, 'out'], [1, 0, 'inOut']],
        sy: [[0, 1], [0.24, 1.03, 'out'], [0.4, 0.95, 'in'], [0.56, 1.02, 'out'], [0.76, 0.99, 'inOut'], [1, 1, 'inOut']],
      },
      head: {
        rot: [[0, 0], [0.24, 5, 'out'], [0.4, -6, 'in'], [0.6, 3, 'inOut'], [1, 0, 'inOut']],
        y: [[0, 0], [0.4, 0, 'hold'], [0.47, 3, 'out'], [0.64, -1, 'inOut'], [1, 0, 'inOut']],
      },
      // The cup goes up over its head and comes down like a stamp. All the way round it stays level:
      // a barista does not spill, not even this one.
      arm_front: { rot: [[0, 0], [0.24, ARM_UP, 'out'], [0.4, ARM_DOWN, 'in'], [0.5, ARM_DOWN - 6, 'out'], [0.64, ARM_DOWN - 3, 'inOut'], [1, 0, 'inOut']] },
      cup: { rot: [[0, 0], [0.24, -ARM_UP - LEAN_BACK, 'out'], [0.4, -ARM_DOWN - LEAN_IN, 'in'], [0.5, -ARM_DOWN - LEAN_IN + 12, 'out'], [0.64, -ARM_DOWN - LEAN_IN, 'inOut'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.24, 38, 'out'], [0.4, -26, 'in'], [0.6, -10, 'out'], [1, 0, 'inOut']] },
      steam: size([[0, 1], [0.36, 1, 'hold'], [0.45, 1.7, 'backOut'], [0.7, 1.25, 'inOut'], [1, 1, 'inOut']]),
      spurt: size([[0, 0], [0.39, 0, 'hold'], [0.46, 1.5, 'backOut'], [0.66, 1.2, 'hold'], [0.78, 0, 'in'], [1, 0, 'hold']]),
      drip: size([[0, 1], [0.4, 1.6, 'in'], [0.44, 0, 'hold'], [0.88, 0, 'hold'], [1, 1, 'out']]),
      straw: { rot: [[0, 0], [0.24, -12, 'out'], [0.42, 24, 'in'], [0.6, -10, 'inOut'], [0.8, 4, 'inOut'], [1, 0, 'inOut']] },
      pilot: {
        y: [[0, 0], [0.24, -2, 'out'], [0.42, 4, 'in'], [0.56, -2, 'out'], [0.72, 0, 'inOut'], [1, 0]],
        rot: [[0, 0], [0.24, -10, 'out'], [0.42, 14, 'in'], [0.72, 0, 'inOut'], [1, 0]],
      },
      sip: {
        y: [[0, 0], [0.42, 0, 'hold'], [0.52, -8, 'out'], [0.68, 0, 'in'], [1, 0]],
        rot: [[0, 0], [0.42, 0, 'hold'], [0.52, -40, 'out'], [0.68, 0, 'in'], [1, 0]],
      },
    },
  },

  // It barely notices. The pilot's coffee does.
  hit: {
    loop: false,
    seconds: 0.3,
    tracks: {
      hips: { x: [[0, 0], [0.3, -2, 'out'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.3, -2.5, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.3, -3.5, 'out'], [0.65, 1.5, 'inOut'], [1, 0, 'inOut']] },
      cup: { rot: [[0, 0], [0.3, 9, 'out'], [1, 0, 'inOut']] },
      straw: { rot: [[0, 0], [0.3, -18, 'out'], [0.65, 7, 'inOut'], [1, 0, 'inOut']] },
      pilot: { y: [[0, 0], [0.3, -2.5, 'out'], [1, 0, 'inOut']] },
      sip: { y: [[0, 0], [0.35, -6, 'out'], [1, 0, 'in']], rot: [[0, 0], [0.35, -34, 'out'], [1, 0, 'in']] },
    },
  },

  // Beaten: crumpled, bent double and leaking all the way home.
  die: {
    loop: true,
    stride: 100,
    tracks: {
      hips: { y: bob(LEG * (1 - Math.cos((20 * Math.PI) / 180))) },
      leg_front: { rot: swing(-20) },
      leg_back: { rot: swing(20) },
      torso: { rot: bob(1.5, 9), sy: [[0, 0.88]], sx: [[0, 1.05]] },
      head: { rot: bob(3, 13), y: [[0, 3]] },
      arm_front: { rot: swing(6, 16) },
      cup: { rot: swing(8, 38) },
      arm_back: { rot: swing(-6, -12) },
      steam: size([[0, 0.5]]),
      straw: { rot: swing(7, -58) },
      spurt: size(bob(-0.3, 1.2)),
      drip: {
        rate: 2,
        sy: [[0, 1], [0.5, 1.4, 'sineIn'], [0.8, 1.2, 'hold'], [0.84, 0, 'in'], [1, 1, 'out']],
        sx: [[0, 1], [0.8, 1, 'hold'], [0.84, 0, 'in'], [1, 1, 'out']],
        y: [[0, 0], [0.5, 0, 'hold'], [0.82, 60, 'in'], [0.9, 60, 'hold'], [0.91, 0, 'hold'], [1, 0]],
      },
      // The pilot has slumped over the controls and dropped the coffee.
      pilot: { rot: [[0, 28]], y: [[0, 3]] },
      sip: size([[0, 0]]),
    },
  },
};

export default havermelkreus;
