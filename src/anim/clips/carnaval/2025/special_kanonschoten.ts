import { pop } from '../../../props.ts';
import type { Clip, Key, Track } from '../../../types.ts';

/** Eleven tubes on the rack; they go off one after another, the first just after the plunger goes down. */
const COUNT = 11;
const FIRST = 0.08;
const GAP = 0.074;
/** Each tube points up and towards the enemy, 30 degrees off upright: a kick goes back down along it. */
const BACK_X = -Math.sin(Math.PI / 6);
const BACK_Y = Math.cos(Math.PI / 6);

/** A tube kicks back along itself the moment it fires and slides home again. */
function kick(at: number, by: number): Key[] {
  return [[0, 0], [at, 0, 'hold'], [at + 0.02, by, 'out'], [Math.min(1, at + 0.12), 0, 'inOut'], ...(at + 0.12 < 1 ? [[1, 0] as Key] : [])];
}

const tracks: Record<string, Track> = {};
for (let i = 0; i < COUNT; i++) {
  const at = FIRST + i * GAP;
  tracks[`tube_${i}`] = { x: kick(at, 3.4 * BACK_X), y: kick(at, 3.4 * BACK_Y) };
  // The confetti leaves the mouth in a puff, hangs a moment and is gone.
  tracks[`burst_${i}`] = { ...pop(at, Math.min(0.99, at + 0.14), 1.15), rot: [[0, 0], [at, 0, 'hold'], [Math.min(1, at + 0.14), 40, 'out'], [1, 40]] };
}

/**
 * Elf Kanonschoten. A member of the Raad van Elf leans on the plunger, and the
 * eleven confetti cannons on the rack go off one after another, each kicking
 * back in its slot with a puff of confetti at the mouth; the game sends a burst
 * across the lane with every one. He shouts the count, his feathers bounce,
 * and he pushes again.
 */
const kanonschotenClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 2.4,
    tracks: {
      ...tracks,
      plunger: { y: [[0, 0], [0.05, 6, 'in'], [0.86, 6, 'hold'], [0.96, 0, 'inOut'], [1, 0]] },
      raad: { sy: [[0, 1], [0.05, 0.93, 'in'], [0.86, 0.93, 'hold'], [0.96, 1, 'inOut'], [1, 1]] },
      // He nods along with every shot.
      raad_head: {
        rot: [[0, 0], [0.05, 6, 'out'], [0.2, -4, 'inOut'], [0.35, 4, 'inOut'], [0.5, -4, 'inOut'], [0.65, 4, 'inOut'], [0.8, -2, 'inOut'], [0.96, 0, 'inOut'], [1, 0]],
      },
      feathers: { rot: [[0, 0], [0.06, 10, 'out'], [0.16, -8, 'inOut'], [0.26, 6, 'inOut'], [0.38, -4, 'inOut'], [0.5, 2, 'inOut'], [0.7, 0, 'inOut'], [0.96, 4, 'inOut'], [1, 0, 'inOut']] },
    },
  },
};

export default kanonschotenClips;
