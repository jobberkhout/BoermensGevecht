import { SPECIAL, type Temper } from './balance.ts';
import { makeEra } from './make.ts';
import type { FactionDef } from './types.ts';

/**
 * Farmers: tough and slow. They can take more than anyone and are in no hurry:
 * slower on the road, and a longer pause between two blows. Whoever throws
 * something throws it hard.
 */
const TEMPER: Temper = {
  light: { hp: 115, speed: 90, recover: 120 },
  ranged: { dmg: 115, recover: 120 },
  heavy: { hp: 115, speed: 90, recover: 120 },
  shield: { hp: 115, speed: 90 },
};

/** The Achterhoek, east, right side of the screen. Display names live in ui/nl.ts. */
export const achterhoek: FactionDef = {
  id: 'achterhoek',
  flagRig: 'flags/achterhoek',
  backdropRig: 'achterhoek/backdrop',
  voice: 'country',
  colors: { main: '#2f9140', dark: '#1f5a2a', light: '#a8d98f' },
  temper: TEMPER,
  eras: [
    // Pitchforks, fodder beets and carbide.
    makeEra('ah', 'achterhoek', {
      key: '1975',
      year: 1975,
      light: 'klein_mepperink',
      ranged: 'smijtink',
      rangedShot: { rig: 'shot_voederbiet', arc: 80, spin: 1.4, splash: '#e9a63a' },
      heavy: 'groot_ploegink',
      shield: 'deurink',
      turret: 'turret_carbid',
      turretShot: { rig: 'shot_deksel', arc: 60, spin: 3, splash: '#c9ced6' },
      special: {
        kind: 'buff',
        ticks: SPECIAL.hoken.ticks,
        dmgPercent: SPECIAL.hoken.dmgPercent,
        speedPercent: SPECIAL.hoken.speedPercent,
        rig: 'special_hoken',
      },
    }, TEMPER),
    // Quads, drones and a megatrekker.
    makeEra('ah', 'achterhoek', {
      key: '2025',
      year: 2025,
      light: 'quadink',
      ranged: 'dronink',
      rangedShot: { rig: 'shot_spray', arc: 26, spin: 0, splash: '#b6d24a' },
      heavy: 'giertink',
      shield: 'balink',
      turret: 'turret_heitinks',
      turretShot: { rig: 'shot_ei', arc: 110, spin: 2.2, splash: '#ffd94a' },
      special: { kind: 'wave', rig: 'special_kolonne', speed: SPECIAL.kolonne.speed, dmg: SPECIAL.kolonne.dmg },
    }, TEMPER),
    // Exoskeletons, laser scarecrows and a combine that drives itself.
    makeEra('ah', 'achterhoek', {
      key: '2050',
      year: 2050,
      light: 'exo_mepperink',
      ranged: 'verschrikkerink',
      rangedShot: { rig: 'shot_laser', arc: 0, spin: 0, splash: '#ff6a55' },
      heavy: 'de_vreter',
      super: 'kolossink',
      turret: 'turret_melkrobot',
      turretShot: { rig: 'shot_melk', arc: 70, spin: 0, splash: '#ffffff' },
      special: {
        kind: 'barrage',
        strikes: SPECIAL.zwerm.strikes,
        every: SPECIAL.zwerm.every,
        dmg: SPECIAL.zwerm.dmg,
        rig: 'special_zwerm',
      },
    }, TEMPER),
  ],
};
