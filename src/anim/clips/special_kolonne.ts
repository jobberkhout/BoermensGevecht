import { bob, swing } from '../humanoid.ts';
import type { Clip, Key } from '../types.ts';
import { roll } from '../vehicle.ts';

const FLASH: Key[] = [[0, 1], [0.5, 1, 'hold'], [0.52, 0.25, 'hold'], [1, 0.25, 'hold']];

/** One tractor of the Trekkerkolonne: thundering along, bale up front, driver shaking his fist. */
export const kolonneClips: { walk: Clip } = {
  walk: roll(
    { bigWheel: 28, wheels: { wheel_back: 28, wheel_front: 18 }, bounce: 2.4, rock: 1 },
    {
      loader: { rot: swing(4, -4), rate: 3 },
      driver: { y: bob(1.6), rate: 3 },
      fist: { rot: swing(16), rate: 5 },
      beacon: { sx: FLASH, sy: FLASH, rate: 4 },
    },
  ),
};
