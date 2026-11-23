import type { Clip, Key } from '../../../types.ts';

/** How far he has to lift his arm to get the bar from where it is to where he wants it. */
const UP = -44;
/** The bar, pushed up, is this many times its real height. */
const TALL = 2.75;

/** One bite: the fork goes up, stays for a moment, and comes back down for the next. */
const bite = (from: number): Key[] => [
  [from, 0, 'hold'],
  [from + 0.07, -36, 'inOut'],
  [from + 0.13, -36, 'hold'],
  [from + 0.2, 0, 'inOut'],
];

/**
 * De Kwartaalcijfers. The last quarter came out low, so one analyst pushes its
 * bar up to where it ought to be, steps back and is pleased with it. Then it
 * sinks again, slowly, while he watches. The second sits by with the slice she
 * was handed out of the pie chart and eats it with a fork. The third holds the
 * next slice ready: when the turret fires that one goes out of the door, the
 * dashboard flickers and the bar drops at once.
 */
const kwartaalcijfersClips: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 5.6,
    tracks: {
      dash: { y: [[0, 0], [0.5, -1.4, 'sineInOut'], [1, 0, 'sineInOut']], rate: 2 },
      beam: { sx: [[0, 1], [0.5, 1.07, 'sineInOut'], [1, 1, 'sineInOut']], rate: 5 },

      // Up it goes. It holds while he admires it, and then it does what the figures do.
      bar: { sy: [[0, 1], [0.05, 1, 'hold'], [0.2, TALL, 'out'], [0.46, TALL, 'hold'], [0.86, 1, 'in'], [1, 1]] },
      m_arm: {
        rot: [[0, 0], [0.05, 0, 'hold'], [0.2, UP, 'out'], [0.28, UP, 'hold'], [0.38, 52, 'inOut'], [0.86, 52, 'hold'], [0.96, 0, 'inOut'], [1, 0]],
        x: [[0, 0], [0.05, 0, 'hold'], [0.2, 5.4, 'out'], [0.28, 5.4, 'hold'], [0.38, 0, 'inOut'], [1, 0]],
      },
      m_body: { rot: [[0, 0], [0.05, 0, 'hold'], [0.2, 4, 'out'], [0.28, 4, 'hold'], [0.4, -3, 'inOut'], [0.84, -3, 'hold'], [0.96, 0, 'inOut'], [1, 0]] },
      // Chin up while it stands. Then his eyes follow it all the way down.
      m_head: { rot: [[0, 4], [0.05, 4, 'hold'], [0.2, -8, 'out'], [0.46, -8, 'hold'], [0.86, 12, 'in'], [0.94, 12, 'hold'], [1, 4, 'inOut']] },
      m_mouth: { sy: [[0, -1], [0.14, -1, 'hold'], [0.22, 1, 'inOut'], [0.52, 1, 'hold'], [0.66, -1, 'inOut'], [1, -1]] },

      // Two bites, with chewing in between.
      l_arm: { rot: [[0, 0], ...bite(0.1), ...bite(0.56), [1, 0]] },
      l_head: { rot: [[0, 0], [0.1, 0, 'hold'], [0.17, -7, 'inOut'], [0.23, -7, 'hold'], [0.3, 0, 'inOut'], [0.56, 0, 'hold'], [0.63, -7, 'inOut'], [0.69, -7, 'hold'], [0.76, 0, 'inOut'], [1, 0]] },
      l_mouth: {
        sy: [
          [0, 1], [0.14, 1, 'hold'], [0.18, 3, 'out'], [0.23, 3, 'hold'], [0.26, 1, 'in'],
          [0.31, 2, 'sineInOut'], [0.36, 1, 'sineInOut'], [0.41, 2, 'sineInOut'], [0.46, 1, 'sineInOut'],
          [0.6, 1, 'hold'], [0.64, 3, 'out'], [0.69, 3, 'hold'], [0.72, 1, 'in'],
          [0.77, 2, 'sineInOut'], [0.82, 1, 'sineInOut'], [0.87, 2, 'sineInOut'], [0.92, 1, 'sineInOut'], [1, 1],
        ],
      },

      // He weighs the slice in his hand and waits for somebody to walk into range.
      r_arm: { rot: [[0, 0], [0.5, -7, 'sineInOut'], [1, 0, 'sineInOut']], rate: 4 },
      wedge: { y: [[0, 0], [0.4, -3.4, 'out'], [0.8, 0, 'in'], [1, 0]], rot: [[0, 0], [0.4, -9, 'out'], [0.8, 0, 'in'], [1, 0]], rate: 4 },
      r_head: { rot: [[0, 0], [0.3, -5, 'sineInOut'], [0.7, 4, 'sineInOut'], [1, 0, 'sineInOut']] },
      r_body: { rot: [[0, 0], [0.5, 1.6, 'sineInOut'], [1, 0, 'sineInOut']], rate: 2 },
    },
  },

  attack: {
    loop: false,
    seconds: 0.62,
    tracks: {
      // The slice has just left his hand: he is at the end of the throw, and takes the next from the stand.
      r_body: { rot: [[0, 12], [0.3, 9, 'out'], [1, 0, 'inOut']] },
      r_arm: { rot: [[0, -38], [0.25, -30, 'out'], [0.6, 44, 'inOut'], [0.8, 44, 'hold'], [1, 0, 'inOut']] },
      r_head: { rot: [[0, -8], [0.4, -4, 'out'], [1, 0, 'inOut']] },
      wedge: { sx: [[0, 0], [0.7, 0, 'hold'], [0.82, 1, 'backOut'], [1, 1]], sy: [[0, 0], [0.7, 0, 'hold'], [0.82, 1, 'backOut'], [1, 1]] },
      // The whole dashboard jumps, and the bar is back where it belongs at once.
      dash: {
        y: [[0, -4], [0.3, 1, 'out'], [0.6, 0, 'inOut'], [1, 0]],
        sx: [[0, 1.06], [0.1, 0.95, 'hold'], [0.2, 1.03, 'hold'], [0.3, 1, 'hold'], [1, 1]],
      },
      beam: { sx: [[0, 1.3], [0.4, 1, 'out'], [1, 1]] },
      bar: { sy: [[0, 1]] },
      m_arm: { rot: [[0, -30], [0.2, 40, 'out'], [0.7, 30, 'inOut'], [1, 0, 'inOut']] },
      m_body: { rot: [[0, -6], [0.5, -4, 'out'], [1, 0, 'inOut']] },
      m_head: { rot: [[0, -12], [0.5, -6, 'out'], [1, 4, 'inOut']] },
      m_mouth: { sy: [[0, -1]] },
      // She looks up from her plate, fork in the air.
      l_head: { rot: [[0, -12], [0.6, -10, 'hold'], [1, 0, 'inOut']] },
      l_arm: { rot: [[0, -20], [0.6, -18, 'hold'], [1, 0, 'inOut']] },
      l_mouth: { sy: [[0, 2.6], [0.6, 2.6, 'hold'], [1, 1, 'in']] },
    },
  },
};

export default kwartaalcijfersClips;
