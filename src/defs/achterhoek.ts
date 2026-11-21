import { SPECIAL, STATS } from './balance.ts';
import { makeTurret, makeUnit } from './make.ts';
import type { FactionDef } from './types.ts';

const e4 = STATS.e4;

/** The Achterhoek, east, right side of the screen. Display names live in ui/nl.ts. */
export const achterhoek: FactionDef = {
  id: 'achterhoek',
  flagRig: 'flags/achterhoek',
  eras: [
    {
      id: 'ah.e4',
      year: 2020,
      baseRig: 'achterhoek/e4/base',
      baseHp: e4.baseHp,
      income: e4.income,
      eraUpCost: e4.eraUpCost,
      units: [
        makeUnit('ah.e4.light', 'light', 'achterhoek/e4/quadink', e4.light),
        makeUnit('ah.e4.ranged', 'ranged', 'achterhoek/e4/dronink', e4.ranged, {
          rig: 'achterhoek/e4/shot_spray',
          arc: 40,
        }),
        makeUnit('ah.e4.heavy', 'heavy', 'achterhoek/e4/giertink', e4.heavy),
      ],
      turret: makeTurret('ah.e4.turret', 'achterhoek/e4/turret_beregening', e4.turret, {
        rig: 'achterhoek/e4/shot_water',
        arc: 90,
      }),
      special: {
        id: 'ah.e4.special',
        kind: 'wave',
        rig: 'achterhoek/e4/special_kolonne',
        speed: SPECIAL.wave.speed,
        dmg: SPECIAL.wave.dmg,
        cooldown: SPECIAL.cooldown,
        firstReady: SPECIAL.firstReady,
      },
    },
  ],
};
