import { bob, swing } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';
import { idling, jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

const WHEELS: RollStyle = {
  bigWheel: 21,
  wheels: { wheel_back: 21, wheel_front: 21 },
  bounce: 1.6,
  rock: 0.5,
};

/** On the way home only the front wheel turns; the back one is flat. */
const LIMPING: RollStyle = { bigWheel: 21, wheels: { wheel_front: 21 } };

/** One foot down on the road, leg straight. */
const FOOT_DOWN = { leg: 56, shin: -72 };

/** The wheelie: back a little, front up, then forward through whatever is there. */
const LUNGE: Key[] = [[0, 0], [0.3, -6, 'out'], [0.45, 20, 'in'], [0.7, 6, 'out'], [1, 0, 'inOut']];

const lunge = shove(LUNGE, WHEELS);

/**
 * De Fatbike: a fifteen-year-old on tyres as fat as a sofa cushion, one hand on
 * the bar, the phone in the other, the helmet on his elbow. Standing still he
 * puts a foot down and scrolls; now and then he looks up: wat kijk je? Riding,
 * he leans in and does not pedal. He goes through people with a wheelie, and
 * walks the bike home with a flat back tyre.
 */
const fatbike: ClipSet = {
  idle: idling(2.6, 0.3, {
    leg: { rot: [[0, FOOT_DOWN.leg]] },
    shin: { rot: [[0, FOOT_DOWN.shin]] },
    rider: { rot: [[0, -3]] },
    // Head down at the phone, then up at you for a moment, then back to the phone.
    head: { rot: [[0, 12], [0.55, 12, 'hold'], [0.62, -6, 'out'], [0.82, -6, 'hold'], [0.9, 12, 'inOut'], [1, 12]] },
    arm_front: { rot: [[0, 0], [0.15, -4, 'sineInOut'], [0.3, 0, 'sineInOut'], [0.45, -4, 'sineInOut'], [0.55, 0, 'sineInOut'], [1, 0]] },
    helmet: { rot: swing(6) },
  }),

  walk: roll(WHEELS, {
    // Leaning in, feet still: the battery does the work.
    rider: { rot: [[0, 6]], y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
    head: { rot: bob(2, 2), rate: 2 },
    helmet: { rot: swing(16, 8), rate: 2 },
    arm_front: { rot: swing(3, -2), rate: 2 },
  }),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      ...lunge,
      chassis: {
        ...lunge.chassis,
        rot: [[0, 0], [0.3, -12, 'out'], [0.45, -3, 'in'], [0.62, 1.5, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.3, -10, 'out'], [0.45, -2.5, 'in'], [0.62, 0, 'out'], [1, 0]],
      },
      rider: { rot: [[0, 0], [0.3, -10, 'out'], [0.45, 12, 'in'], [0.7, 4, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.3, -6, 'out'], [0.45, 4, 'in'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.3, -18, 'out'], [0.45, 10, 'in'], [1, 0, 'inOut']] },
      helmet: { rot: [[0, 0], [0.3, 30, 'out'], [0.45, -40, 'in'], [0.7, 20, 'inOut'], [1, 0, 'inOut']] },
    },
  },

  hit: jolt({
    rider: { rot: [[0, 0], [0.3, -12, 'out'], [0.6, 5, 'inOut'], [1, 0, 'inOut']] },
    helmet: { rot: rattle(24, 4) },
  }),

  // "Mijn band is lek." Straddling the bike, walking it home, head down.
  die: limpHome(LIMPING, {
    wheel_back: { sy: [[0, 0.72]], y: [[0, 5.9]] },
    leg: { rot: swing(14, FOOT_DOWN.leg - 4) },
    shin: { rot: swing(-10, FOOT_DOWN.shin + 2) },
    rider: { rot: [[0, 12]] },
    head: { rot: bob(3, 18) },
    arm_front: { rot: [[0, 16]] },
    helmet: { rot: swing(18, 4) },
  }),
};

export default fatbike;
