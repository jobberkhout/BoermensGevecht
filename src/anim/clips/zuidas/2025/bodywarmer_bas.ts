import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet, Key } from '../../../types.ts';

/**
 * Bodywarmer-Bas: marches in with the coffees for the whole team and swings
 * his laptop bag at whoever is in the way. Whatever the rest of him does, the
 * carrier in his far hand stays level: `tray` always turns back by exactly as
 * much as his torso and arm have turned.
 */

/** The tray's answer to a torso track: the same keys, the other way. */
function level(torso: readonly Key[], arm = 0): Key[] {
  return torso.map((k): Key => [k[0], -k[1] - arm, k[2]]);
}

const STILL: Key[] = [[0, 0]];

const WALK_TORSO = bob(2, 6);
const ATTACK_TORSO: Key[] = [[0, 0], [0.24, -9, 'out'], [0.42, 15, 'in'], [0.68, 6, 'out'], [1, 0, 'inOut']];
const FLINCH_TORSO: Key[] = [[0, 0], [0.25, -14, 'out'], [1, 0, 'inOut']];
const RUN_TORSO = bob(3, 16);

const bodywarmerBas: ClipSet = {
  idle: idle(
    { seconds: 2.4, breathe: 0.03, armSway: 2 },
    {
      // On a call, as ever: he nods along, glances over his shoulder, nods again.
      head: {
        rot: [[0, 0], [0.12, 5, 'sineInOut'], [0.24, 0, 'sineInOut'], [0.36, 5, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.66, -9, 'inOut'], [0.86, -9, 'hold'], [1, 0, 'inOut']],
      },
      arm_back: { rot: STILL },
      tray: { rot: STILL, y: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']] },
      // The bag swings a little on its handle, like a man who cannot stand still.
      bag: { rot: [[0, 0], [0.25, 7, 'sineInOut'], [0.75, -7, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  ),

  walk: walk(
    { stride: 54, legSwing: 31, legLen: 38, armSwing: 26, lean: 6, sway: 2, headNod: 2 },
    {
      torso: { rot: WALK_TORSO },
      arm_back: { rot: STILL },
      tray: { rot: level(WALK_TORSO) },
      bag: { rot: swing(-16) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.42 },
    tracks: {
      hips: {
        x: [[0, 0], [0.24, -4, 'out'], [0.42, 7, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.24, 2, 'out'], [0.42, -2, 'in'], [1, 0, 'inOut']],
      },
      torso: { rot: ATTACK_TORSO },
      head: { rot: [[0, 0], [0.24, 6, 'out'], [0.42, -8, 'in'], [1, 0, 'inOut']] },
      // The bag goes back over his shoulder and comes round like a flail.
      arm_front: { rot: [[0, 0], [0.24, 80, 'out'], [0.42, -92, 'in'], [0.58, -118, 'out'], [1, 0, 'inOut']] },
      bag: { rot: [[0, 0], [0.24, 40, 'out'], [0.42, -52, 'in'], [0.6, 24, 'out'], [0.8, -10, 'inOut'], [1, 0, 'inOut']] },
      arm_back: { rot: STILL },
      tray: { rot: level(ATTACK_TORSO) },
      leg_front: { rot: [[0, 0], [0.24, 8, 'out'], [0.42, -18, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.24, -6, 'out'], [0.42, 14, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    torso: { rot: FLINCH_TORSO },
    // The far arm stays where it is: the flinch must not spill anything.
    arm_back: { rot: STILL },
    tray: { rot: level(FLINCH_TORSO), y: [[0, 0], [0.25, -3, 'out'], [1, 0, 'inOut']] },
    bag: { rot: [[0, 0], [0.3, 30, 'out'], [0.65, -12, 'inOut'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 70 },
    {
      torso: { rot: RUN_TORSO },
      // He runs for it with the coffees held out in front of him, still level,
      // and keeps an eye on them. The bag trails behind.
      arm_back: { rot: [[0, -18]] },
      tray: { rot: level(RUN_TORSO, -18) },
      head: { rot: bob(3, -8) },
      arm_front: { rot: swing(18, 52) },
      bag: { rot: swing(-26, -30) },
    },
  ),
};

export default bodywarmerBas;
