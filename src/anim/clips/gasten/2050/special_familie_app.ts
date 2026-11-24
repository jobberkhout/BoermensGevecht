import { pop } from '../../../props.ts';
import type { Clip, Key, Track } from '../../../types.ts';

/** The moments in the loop a message comes in. The badge jumps at every one of them. */
const IN = [0.02, 0.14, 0.26, 0.38, 0.5, 0.62, 0.74] as const;

/** A channel that sits at `rest` and jumps to `peak` every time a message comes in. */
function atMessages(rest: number, peak: number): Key[] {
  const keys: Key[] = [[0, rest]];
  for (const at of IN) keys.push([at, rest, 'hold'], [at + 0.03, peak, 'backOut'], [at + 0.09, rest, 'inOut']);
  keys.push([1, rest, 'hold']);
  return keys;
}

/** A ping off to the side: it pops in, rises a little, and is gone before the loop starts again. */
function ping(from: number): Track {
  return { ...pop(from, 0.95), y: [[0, 8], [Math.max(0.001, from), 8, 'hold'], [0.95, -4, 'out'], [1, 8, 'hold']] };
}

/**
 * De Familie-app. Somebody posted in the family group and now everyone
 * answers at once: the hologram phone bobs over its projector, message after
 * message pops up, pings pour in from the side and the badge jumps with every
 * one. The game shows it from whatever moment of the loop it is at, so the loop
 * looks right from anywhere: the chat fills up, clears, and fills again.
 */
const familieAppClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 1.8,
    tracks: {
      telefoon: { y: [[0, 0], [0.5, -4, 'sineInOut'], [1, 0, 'sineInOut']] },
      straal: { sx: [[0, 1], [0.25, 1.06, 'sineInOut'], [0.5, 0.96, 'sineInOut'], [0.75, 1.05, 'sineInOut'], [1, 1, 'sineInOut']] },
      schijf: { sx: [[0, 1], [0.5, 1.05, 'sineInOut'], [1, 1, 'sineInOut']] },

      bel_a: pop(IN[0], 0.95),
      bel_b: pop(IN[1], 0.95),
      bel_c: pop(IN[2], 0.95),
      bel_d: pop(IN[3], 0.95),
      ping_a: ping(IN[4]),
      ping_b: ping(IN[5]),
      ping_c: ping(IN[6]),

      badge: { sx: atMessages(1, 1.3), sy: atMessages(1, 1.3) },
    },
  },
};

export default familieAppClips;
