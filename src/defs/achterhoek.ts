import { SPECIAL } from './balance.ts';
import { makeEra } from './make.ts';
import type { FactionDef } from './types.ts';

/** The Achterhoek, east, right side of the screen. Display names live in ui/nl.ts. */
export const achterhoek: FactionDef = {
  id: 'achterhoek',
  flagRig: 'flags/achterhoek',
  eras: [
    // Pitchforks, fodder beets and carbide.
    makeEra('ah', 'achterhoek', {
      key: '1975',
      year: 1975,
      light: 'klein_mepperink',
      ranged: 'smijtink',
      rangedShot: { rig: 'shot_voederbiet', arc: 80, spin: 1.4 },
      heavy: 'groot_ploegink',
      turret: 'turret_carbid',
      turretShot: { rig: 'shot_deksel', arc: 60, spin: 3 },
      special: {
        kind: 'buff',
        ticks: SPECIAL.hoken.ticks,
        dmgPercent: SPECIAL.hoken.dmgPercent,
        speedPercent: SPECIAL.hoken.speedPercent,
        rig: 'special_hoken',
      },
    }),
    // Quads, drones and a megatrekker.
    makeEra('ah', 'achterhoek', {
      key: '2025',
      year: 2025,
      light: 'quadink',
      ranged: 'dronink',
      rangedShot: { rig: 'shot_spray', arc: 26, spin: 0 },
      heavy: 'giertink',
      turret: 'turret_heitinks',
      turretShot: { rig: 'shot_ei', arc: 110, spin: 2.2 },
      special: { kind: 'wave', rig: 'special_kolonne', speed: SPECIAL.kolonne.speed, dmg: SPECIAL.kolonne.dmg },
    }),
    // Exoskeletons, laser scarecrows and a combine that drives itself.
    makeEra('ah', 'achterhoek', {
      key: '2050',
      year: 2050,
      light: 'exo_mepperink',
      ranged: 'verschrikkerink',
      rangedShot: { rig: 'shot_laser', arc: 0, spin: 0 },
      heavy: 'de_vreter',
      turret: 'turret_melkrobot',
      turretShot: { rig: 'shot_melk', arc: 70, spin: 0 },
      special: {
        kind: 'barrage',
        strikes: SPECIAL.zwerm.strikes,
        every: SPECIAL.zwerm.every,
        dmg: SPECIAL.zwerm.dmg,
        rig: 'special_zwerm',
      },
    }),
  ],
};
