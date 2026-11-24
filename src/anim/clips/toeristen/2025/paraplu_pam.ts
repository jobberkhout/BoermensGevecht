import { bob, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';

const STILL: Key[] = [[0, 0]];

/** A part that is not there in this clip. */
const GONE: Track = { sx: STILL, sy: STILL };

/** The group shuffles along behind her: a little bob, a little sway, never in step. */
const SHUFFLE: Track = { y: [[0, 0], [0.3, -1.6, 'sineInOut'], [0.55, 0, 'sineInOut'], [0.8, -1.2, 'sineInOut'], [1, 0, 'sineInOut']], rot: swing(1.6) };

/**
 * Paraplu-Pam: the guide of the free walking tour, her umbrella held out in
 * front of her like a shield and her group of four in matching caps shuffling
 * after it. She walks slowly and never stops talking. What hits the umbrella
 * goes ting. When she falls, the group is gone at once (they scatter onto the
 * lane as lost tourists) and she goes home alone, the umbrella closed.
 */
const parapluPam: ClipSet = {
  idle: {
    loop: true,
    seconds: 3,
    tracks: {
      torso: { sy: [[0, 1], [0.5, 1.02, 'sineInOut'], [1, 1, 'sineInOut']] },
      // Explaining something about a gable to people who are not listening.
      head: { rot: [[0, 0], [0.2, -4, 'sineInOut'], [0.4, 2, 'sineInOut'], [0.6, -3, 'sineInOut'], [0.8, 2, 'sineInOut'], [1, 0, 'sineInOut']] },
      umbrella: { rot: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']] },
      group: { ...SHUFFLE, x: [[0, 0], [0.5, -1.5, 'sineInOut'], [1, 0, 'sineInOut']] },
      closed: GONE,
    },
  },

  // Slow, steady, a step at a time: the group has to keep up.
  walk: walk(
    { stride: 34, legSwing: 17, legLen: 38, armSwing: 0, lean: 2, sway: 1, headNod: 2 },
    {
      arm_front: { rot: STILL },
      arm_back: { rot: swing(6) },
      umbrella: { y: bob(1.4), rot: swing(1.2) },
      group: { ...SHUFFLE, rate: 2 },
      closed: GONE,
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.42 },
    tracks: {
      // A jab with the umbrella: tip first.
      hips: { x: [[0, 0], [0.26, -3, 'out'], [0.42, 5, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.26, -5, 'out'], [0.42, 7, 'in'], [0.7, 3, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, 3, 'out'], [0.42, -4, 'in'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.26, 14, 'out'], [0.42, -16, 'in'], [0.7, -6, 'out'], [1, 0, 'inOut']] },
      umbrella: {
        x: [[0, 0], [0.26, -4, 'out'], [0.42, 8, 'in'], [0.7, 2, 'out'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.26, -4, 'out'], [0.42, 6, 'in'], [1, 0, 'inOut']],
      },
      leg_front: { rot: [[0, 0], [0.26, 5, 'out'], [0.42, -10, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -4, 'out'], [0.42, 8, 'in'], [1, 0, 'inOut']] },
      // The group cowers behind her.
      group: { x: [[0, 0], [0.42, -3, 'in'], [1, 0, 'inOut']], y: [[0, 0], [0.42, 2, 'in'], [1, 0, 'inOut']] },
      closed: GONE,
    },
  },

  // Ting. The umbrella rings; she does not even stop talking.
  hit: {
    loop: false,
    seconds: 0.3,
    tracks: {
      umbrella: { x: rattle(3, 6), rot: rattle(3, 6) },
    },
  },

  die: slinkOff(
    { legLen: 38, stride: 50 },
    {
      // The group is gone the moment she falls; the umbrella is closed and dragged.
      group: GONE,
      umbrella: GONE,
      arm_front: { rot: bob(3, 58) },
      arm_back: { rot: swing(-20, -10) },
      closed: { rot: [[0, 78]] },
      head: { rot: bob(4, 14) },
    },
  ),
};

export default parapluPam;
