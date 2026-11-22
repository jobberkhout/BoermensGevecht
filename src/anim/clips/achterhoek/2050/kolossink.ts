import { bob, idle, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';

/** A puff from the stack: it swells as it leaves the pipe, drifts up and thins out. */
const PUFF: Key[] = [[0, 0.15], [0.35, 1, 'out'], [0.8, 1.2, 'sineInOut'], [1, 0.15, 'in']];
const smoke = (rate: number, size = 1): Track => ({
  sx: PUFF.map((k): Key => [k[0], k[1] * size, k[2]]),
  sy: PUFF.map((k): Key => [k[0], k[1] * size, k[2]]),
  y: [[0, 0], [0.8, -10, 'out'], [1, 0, 'hold']],
  rate,
});

/** The rain flap on the stack: every puff kicks it open, and it clatters shut again. */
const flap = (rate: number): Track => ({
  rot: [[0, 0], [0.14, 52, 'out'], [0.45, 34, 'sineInOut'], [0.72, 0, 'in'], [0.8, 9, 'out'], [0.88, 0, 'in'], [1, 0]],
  rate,
});

/** The beacon: two quick flashes, then dark for a while. */
const BLINK: Key[] = [[0, 1], [0.12, 0, 'hold'], [0.25, 1, 'hold'], [0.37, 0, 'hold'], [1, 0, 'hold']];
const beacon = (rate: number): Track => ({ sx: BLINK, sy: BLINK, rate });

/** Something that jumps at each footfall (a quarter and three quarters into the walk) and settles again. */
const stomp = (amp: number): Key[] => [
  [0, 0],
  [0.25, 0, 'hold'],
  [0.31, amp, 'out'],
  [0.44, 0, 'in'],
  [0.75, 0, 'hold'],
  [0.81, amp, 'out'],
  [0.94, 0, 'in'],
  [1, 0],
];

/** How far the hips drop when both legs are swung `degrees` apart, so the feet stay on the ground. */
const LEG = 70;
const dip = (degrees: number): number => LEG * (1 - Math.cos((degrees * Math.PI) / 180));

/**
 * Kolossink: a silo on legs with tractor wheels for shoulders and opa at the
 * levers in its chest. It stomps along so that its own cap hops, and it
 * attacks by hauling both fists over its head and bringing them down on
 * whatever is in front of it. Being hit hardly registers.
 */
const kolossink: ClipSet = {
  idle: idle(
    { seconds: 2.8, breathe: 0.01, armSway: 1.5 },
    {
      // The engine keeps the whole machine trembling.
      hips: { y: [[0, 0], [0.5, -0.8, 'sineInOut'], [1, 0, 'sineInOut']], rate: 9 },
      // The head pans slowly, looking for whoever is next.
      head: { rot: [[0, 0], [0.3, -5, 'sineInOut'], [0.7, 4, 'sineInOut'], [1, 0, 'sineInOut']] },
      cap: { rot: [[0, 0], [0.3, -2, 'sineInOut'], [0.7, 2, 'sineInOut'], [1, 0, 'sineInOut']] },
      // Opa tries the levers; the fists answer a beat later, one after the other.
      opa: { rot: [[0, 0], [0.1, 9, 'inOut'], [0.2, -7, 'inOut'], [0.3, 7, 'inOut'], [0.42, 0, 'inOut'], [1, 0]] },
      forearm_front: { rot: [[0, 0], [0.16, 0, 'hold'], [0.28, -9, 'out'], [0.4, 3, 'inOut'], [0.52, 0, 'inOut'], [1, 0]] },
      forearm_back: { rot: [[0, 0], [0.26, 0, 'hold'], [0.38, -8, 'out'], [0.5, 2, 'inOut'], [0.62, 0, 'inOut'], [1, 0]] },
      smoke: smoke(3),
      flap: flap(3),
      flash: beacon(2),
      plug: { rot: swing(5) },
    },
  ),

  walk: walk(
    { stride: 78, legSwing: 16, legLen: LEG, armSwing: 7, lean: 3, sway: 2.5, headNod: 2 },
    {
      // Every footfall goes through the whole machine: the cap hops, opa bounces, the fists clank.
      cap: { y: stomp(-3.5), rot: stomp(-5) },
      opa: { y: stomp(-2.2) },
      forearm_front: { rot: stomp(6) },
      forearm_back: { rot: stomp(5) },
      plug: { rot: swing(15, 6, 0.12) },
      smoke: smoke(2),
      flap: flap(2),
      flash: beacon(1),
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      // Up on its toes with both fists overhead, then one step forward and everything comes down.
      hips: {
        x: [[0, 0], [0.26, -5, 'out'], [0.4, 12, 'in'], [0.56, 9, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.26, -2, 'out'], [0.4, dip(22), 'in'], [0.56, dip(18), 'out'], [1, 0, 'inOut']],
      },
      leg_front: { rot: [[0, 0], [0.26, 6, 'out'], [0.4, -22, 'in'], [0.56, -18, 'out'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -4, 'out'], [0.4, 22, 'in'], [0.56, 18, 'out'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.26, -12, 'out'], [0.4, 34, 'in'], [0.56, 29, 'out'], [1, 0, 'inOut']] },
      // The head keeps its eyes on the target while the body goes over.
      head: { rot: [[0, 0], [0.26, -8, 'out'], [0.4, -18, 'in'], [0.56, -15, 'out'], [1, 0, 'inOut']] },
      cap: { y: [[0, 0], [0.4, 0, 'hold'], [0.48, -7, 'out'], [0.62, 0, 'in'], [1, 0]] },
      opa: { rot: [[0, 0], [0.26, -14, 'out'], [0.4, 16, 'in'], [0.6, 10, 'out'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.26, -185, 'out'], [0.4, -56, 'in'], [0.56, -50, 'out'], [1, 0, 'inOut']] },
      forearm_front: { rot: [[0, 0], [0.26, 25, 'out'], [0.4, 40, 'in'], [0.56, 34, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.26, -140, 'out'], [0.4, -20, 'in'], [0.56, -15, 'out'], [1, 0, 'inOut']] },
      forearm_back: { rot: [[0, 0], [0.26, 10, 'out'], [0.4, 33, 'in'], [0.56, 28, 'out'], [1, 0, 'inOut']] },
      // The engine coughs out a cloud with the effort, and the flap stands straight up.
      smoke: {
        sx: [[0, 0.3], [0.3, 0.3, 'hold'], [0.46, 2, 'out'], [0.8, 1.7, 'sineInOut'], [1, 0.3, 'in']],
        sy: [[0, 0.3], [0.3, 0.3, 'hold'], [0.46, 2, 'out'], [0.8, 1.7, 'sineInOut'], [1, 0.3, 'in']],
        y: [[0, 0], [0.3, 0, 'hold'], [0.9, -12, 'out'], [1, 0, 'hold']],
      },
      flap: { rot: [[0, 0], [0.3, 0, 'hold'], [0.44, 70, 'out'], [0.8, 40, 'sineInOut'], [1, 0, 'in']] },
      plug: { rot: [[0, 0], [0.26, -22, 'out'], [0.44, 34, 'in'], [0.62, -12, 'inOut'], [0.8, 6, 'inOut'], [1, 0, 'inOut']] },
    },
  },

  // It barely notices: a shiver through the plating, the cap hops, opa looks up.
  hit: {
    loop: false,
    seconds: 0.3,
    tracks: {
      torso: { rot: [[0, 0], [0.3, -2.5, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.35, -5, 'out'], [1, 0, 'inOut']] },
      cap: { y: [[0, 0], [0.3, -4, 'out'], [1, 0, 'in']], rot: [[0, 0], [0.3, -9, 'out'], [1, 0, 'inOut']] },
      opa: { y: [[0, 0], [0.3, -2.5, 'out'], [1, 0, 'in']], rot: [[0, 0], [0.3, -10, 'out'], [1, 0, 'inOut']] },
      forearm_front: { rot: rattle(3, 3) },
      plug: { rot: rattle(12, 3) },
    },
  },

  // Beaten, it trudges home: hunched, fists dragging, the beacon dead and the engine smoking.
  die: {
    loop: true,
    stride: 86,
    tracks: {
      hips: { y: bob(dip(18)) },
      leg_front: { rot: swing(-18) },
      leg_back: { rot: swing(18) },
      torso: { rot: bob(2, 12) },
      head: { rot: bob(3, 16) },
      // The cap has slipped down over its eyes.
      cap: { rot: [[0, 12]], x: [[0, 3]] },
      arm_front: { rot: swing(5, 6) },
      forearm_front: { rot: swing(4, 24) },
      arm_back: { rot: swing(-5, 24) },
      forearm_back: { rot: swing(-4, 26) },
      // Opa hangs over the levers.
      opa: { rot: [[0, 22]] },
      smoke: smoke(4, 1.6),
      flap: flap(4),
      flash: { sx: [[0, 0]], sy: [[0, 0]] },
      plug: { rot: swing(18, 12) },
    },
  },
};

export default kolossink;
