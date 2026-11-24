import { chatter, pop, rattle } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

/** A shuffle on the spot: half a step forward and back again, between `from` and `to`. */
function shuffle(from: number, to: number, step = 1.6): Key[] {
  const mid = (from + to) / 2;
  return [[0, 0], [from, 0, 'hold'], [mid, step, 'sineInOut'], [to, 0, 'sineInOut'], [1, 0, 'hold']];
}

/** Weight from one foot to the other, as a lean of the body. */
function sway(from: number, to: number, lean = 3): Key[] {
  const mid = (from + to) / 2;
  return [[0, 0], [from, 0, 'hold'], [mid, lean, 'sineInOut'], [to, 0, 'sineInOut'], [1, 0, 'hold']];
}

const OPEN: Key[] = [[0, 1.4], [0.7, 1.4, 'hold'], [1, 0.18, 'in']];

/**
 * De Hype-rij. Nobody moves forward. The manager taps her sign (another hour)
 * and tells the queue so; C takes a selfie with the queue, twice, flash and
 * all; B scrolls and has not looked up since the queue began; A, at the front,
 * holds his cone up to his stream and talks to it. Everybody shuffles on the
 * spot. When the turret fires, A throws the cone, the next one comes out of
 * the hatch, C films the throw, and B still does not look up.
 */
const hyperijClips: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 4.2,
    tracks: {
      // The manager: taps the sign, says it, looks at the queue.
      m_arm: { rot: [[0, 0], [0.06, -5, 'out'], [0.1, 0, 'in'], [0.14, -5, 'out'], [0.18, 0, 'in'], [1, 0]] },
      m_mouth: { sy: chatter(0.08, 0.34, 6) },
      m_head: { rot: [[0, 0], [0.06, -6, 'inOut'], [0.36, -6, 'hold'], [0.44, 4, 'inOut'], [0.7, 4, 'hold'], [0.8, 0, 'inOut'], [1, 0]] },
      m_legs: { x: shuffle(0.62, 0.74, -1.2) },

      // C: the selfie with the queue, twice.
      c_arm: { rot: [[0, 0], [0.16, -8, 'inOut'], [0.36, -8, 'hold'], [0.44, 4, 'inOut'], [0.62, 4, 'hold'], [0.7, -6, 'inOut'], [0.86, -6, 'hold'], [0.96, 0, 'inOut'], [1, 0]] },
      c_head: { rot: [[0, 0], [0.18, -10, 'inOut'], [0.36, -10, 'hold'], [0.44, 0, 'inOut'], [0.66, 0, 'hold'], [0.72, 8, 'inOut'], [0.86, 8, 'hold'], [0.96, 0, 'inOut'], [1, 0]] },
      c_flash: { sx: pop(0.28, 0.34, 1.2).sx, sy: pop(0.28, 0.34, 1.2).sy, rot: [[0, 0], [1, 90]] },
      c_body: { rot: sway(0.4, 0.6, -3) },
      c_legs: { x: shuffle(0.42, 0.56) },

      // B scrolls. The thumb flicks, the head stays down.
      b_arm: { rot: [[0, 0], [0.1, -3, 'out'], [0.14, 0, 'in'], [0.3, 0, 'hold'], [0.34, -3, 'out'], [0.38, 0, 'in'], [0.58, 0, 'hold'], [0.62, -3, 'out'], [0.66, 0, 'in'], [0.84, 0, 'hold'], [0.88, -3, 'out'], [0.92, 0, 'in'], [1, 0]] },
      b_head: { rot: [[0, 6], [0.5, 9, 'sineInOut'], [1, 6, 'sineInOut']] },
      b_body: { rot: sway(0.1, 0.32, 2.5) },
      b_legs: { x: shuffle(0.12, 0.28) },

      // A, to his stream: the cone up to the camera, turned this way and that.
      a_arm: { rot: [[0, 0], [0.48, 0, 'hold'], [0.54, -12, 'inOut'], [0.66, -4, 'sineInOut'], [0.78, -12, 'sineInOut'], [0.9, 0, 'inOut'], [1, 0]] },
      a_cone: { rot: [[0, 0], [0.54, 0, 'hold'], [0.62, -14, 'sineInOut'], [0.72, 12, 'sineInOut'], [0.82, 0, 'sineInOut'], [1, 0]] },
      a_head: { rot: [[0, 0], [0.48, 0, 'hold'], [0.56, -8, 'inOut'], [0.86, -8, 'hold'], [0.94, 0, 'inOut'], [1, 0]] },
      a_mouth: { sy: chatter(0.52, 0.88, 8) },
      a_body: { rot: sway(0.08, 0.3, 2) },
      a_legs: { x: shuffle(0.86, 0.98, 1.2) },
    },
  },

  // Starts the instant the cone leaves his hand.
  attack: {
    loop: false,
    seconds: 0.6,
    tracks: {
      a_arm: { rot: [[0, -30], [0.16, 40, 'out'], [0.55, 40, 'hold'], [1, 0, 'inOut']] },
      a_cone: { sx: [[0, 0], [0.72, 0, 'hold'], [1, 1, 'backOut']], sy: [[0, 0], [0.72, 0, 'hold'], [1, 1, 'backOut']] },
      a_body: { rot: [[0, -4], [0.2, 9, 'out'], [0.6, 8, 'hold'], [1, 0, 'inOut']] },
      a_head: { rot: [[0, 0], [0.2, -10, 'out'], [0.65, -10, 'hold'], [1, 0, 'inOut']] },
      a_mouth: { sy: OPEN },
      // C films the throw.
      c_arm: { rot: [[0, 0], [0.2, 12, 'out'], [0.7, 12, 'hold'], [1, 0, 'inOut']] },
      c_head: { rot: [[0, 0], [0.2, -8, 'out'], [0.7, -8, 'hold'], [1, 0, 'inOut']] },
      c_mouth: { sy: OPEN },
      c_flash: { sx: [[0, 0]], sy: [[0, 0]] },
      // The manager holds the sign up, in case anyone thinks the queue moved.
      m_arm: { rot: [[0, 0], [0.2, -8, 'out'], [0.7, -8, 'hold'], [1, 0, 'inOut']] },
      m_mouth: { sy: OPEN },
      // B does not look up.
      b_head: { rot: [[0, 7]] },
      shop: { x: rattle(0.8, 4) },
    },
  },
};

export default hyperijClips;
