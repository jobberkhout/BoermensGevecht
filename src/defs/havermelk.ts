import { SPECIAL, STATS } from './balance.ts';
import { makeTurret, makeUnit } from './make.ts';
import type { FactionDef } from './types.ts';

const e4 = STATS.e4;

/** Amsterdam, west, left side of the screen. Display names live in ui/nl.ts. */
export const havermelk: FactionDef = {
  id: 'havermelk',
  flagRig: 'flags/amsterdam',
  eras: [
    {
      id: 'hm.e4',
      year: 2020,
      baseRig: 'havermelk/e4/base',
      baseHp: e4.baseHp,
      income: e4.income,
      eraUpCost: e4.eraUpCost,
      units: [
        makeUnit('hm.e4.light', 'light', 'havermelk/e4/padel_pepijn', e4.light),
        makeUnit('hm.e4.ranged', 'ranged', 'havermelk/e4/barista_bo', e4.ranged, {
          rig: 'havermelk/e4/shot_flatwhite',
          arc: 70,
        }),
        makeUnit('hm.e4.heavy', 'heavy', 'havermelk/e4/bakfiets_babette', e4.heavy),
      ],
      turret: makeTurret('hm.e4.turret', 'havermelk/e4/turret_podcast', e4.turret, {
        rig: 'havermelk/e4/shot_soundwave',
        arc: 0,
      }),
      special: {
        id: 'hm.e4.special',
        kind: 'stun',
        ticks: SPECIAL.stun.ticks,
        cooldown: SPECIAL.cooldown,
        firstReady: SPECIAL.firstReady,
      },
    },
  ],
};
