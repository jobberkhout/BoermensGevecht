import { bob, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

const STILL: Key[] = [[0, 0]];

/** The helmet flipped up on top of his head. */
const UP = -98;

/**
 * Lasser Leen: a shipyard welder behind the hull plate he was about to weld.
 * Now and then he nods the helmet up to see what is going on and nods it
 * down again. He shoves with the plate, and whatever hits it only makes
 * sparks fly: the sparks part is drawn tiny and blown up to full size here.
 */
const lasserLeen: ClipSet = {
  idle: {
    loop: true,
    seconds: 4,
    tracks: {
      torso: { sy: [[0, 1], [0.5, 1.025, 'sineInOut'], [1, 1, 'sineInOut']] },
      // A look: helmet up with a jerk of the head, a squint at the enemy, and a nod to drop it again.
      mask: { rot: [[0, 0], [0.4, 0, 'hold'], [0.46, UP, 'out'], [0.74, UP, 'hold'], [0.8, 4, 'in'], [0.84, 0, 'out'], [1, 0, 'hold']] },
      head: {
        rot: [[0, 0], [0.38, 0, 'hold'], [0.42, 8, 'out'], [0.47, -5, 'out'], [0.54, 0, 'inOut'], [0.74, 0, 'hold'], [0.78, -4, 'out'], [0.82, 9, 'in'], [0.88, 0, 'out'], [1, 0, 'hold']],
        y: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']],
      },
      plate: { rot: [[0, 0], [0.5, -0.8, 'sineInOut'], [1, 0, 'sineInOut']] },
      arm_front: { rot: STILL },
      arm_back: { rot: STILL },
    },
  },

  walk: walk(
    { stride: 42, legSwing: 22, legLen: 38, armSwing: 0, lean: 3, sway: 1.2, headNod: 1.5 },
    {
      arm_front: { rot: STILL },
      arm_back: { rot: STILL },
      // The plate is heavy: it bumps down with every step.
      plate: { y: bob(1.6, -2.4), rot: swing(0.8) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      // Shoulder behind the plate and shove.
      hips: { x: [[0, 0], [0.24, -3, 'out'], [0.4, 7, 'in'], [0.66, 3, 'out'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.24, -6, 'out'], [0.4, 9, 'in'], [0.66, 4, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.24, 5, 'out'], [0.4, -6, 'in'], [1, 0, 'inOut']] },
      plate: {
        x: [[0, 0], [0.24, -3, 'out'], [0.4, 9, 'in'], [0.66, 3, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.24, -3, 'out'], [0.4, -1, 'in'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.24, -4, 'out'], [0.4, 4, 'in'], [1, 0, 'inOut']],
      },
      arm_front: { rot: [[0, 0], [0.24, 8, 'out'], [0.4, -20, 'in'], [0.66, -8, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: STILL },
      leg_front: { rot: [[0, 0], [0.24, 5, 'out'], [0.4, -12, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.24, -4, 'out'], [0.4, 10, 'in'], [1, 0, 'inOut']] },
    },
  },

  // Psssjt. A shower of sparks off the plate; the plate rings; he does not move.
  hit: {
    loop: false,
    seconds: 0.36,
    tracks: {
      // Out from behind the plate's front edge they come, fanning towards whoever hit it, and back again.
      sparks: {
        x: [[0, 0], [0.08, 24, 'out'], [0.7, 26, 'linear'], [0.86, 0, 'in'], [1, 0, 'hold']],
        y: [[0, 0], [0.08, -4, 'out'], [0.7, 2, 'linear'], [0.86, 0, 'in'], [1, 0, 'hold']],
        sx: [[0, 0.6], [0.1, 1.6, 'out'], [0.7, 1.2, 'linear'], [0.86, 0.6, 'in'], [1, 1, 'hold']],
        sy: [[0, 0.6], [0.1, 1.6, 'out'], [0.7, 1.2, 'linear'], [0.86, 0.6, 'in'], [1, 1, 'hold']],
        rot: [[0, -10], [0.7, 30, 'out'], [1, 0, 'hold']],
      },
      plate: { x: rattle(2.4, 5), rot: rattle(1.6, 5) },
    },
  },

  die: slinkOff(
    { legLen: 38, stride: 64 },
    {
      // Home with the helmet still down, the plate dragged along behind him on one corner.
      plate: { rot: swing(2, -38), x: [[0, -62]], y: bob(1.5, 14) },
      arm_front: { rot: swing(4, 58) },
      arm_back: { rot: STILL },
    },
  ),
};

export default lasserLeen;
