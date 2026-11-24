import { SPECIAL, type Temper } from './balance.ts';
import { makeEra } from './make.ts';
import type { FactionDef } from './types.ts';

/**
 * De Gasten: met de hele familie. Many hands, quickly there: the light units
 * are cheaper and sooner out of the door, and fold sooner. The loaded ones are
 * slow: more hit points for a slower heavy, schild and firing line. The
 * fatbike of 2025 is a rider with its own numbers and no twist (RIDER in
 * defs/balance.ts). From the brief in docs/factions.md, section 8.
 */
const TEMPER: Temper = {
  light: { cost: 85, buildTicks: 80, hp: 85 },
  ranged: { hp: 110, recover: 110 },
  heavy: { hp: 110, speed: 90 },
  shield: { hp: 110, speed: 95 },
};

/** De Gasten: two families on one street, 1975 to 2050. Display names live in ui/factions/gasten.ts. */
export const gasten: FactionDef = {
  id: 'gasten',
  flagRig: 'flags/gasten',
  backdropRig: 'gasten/backdrop',
  voice: 'town',
  colors: { main: '#c9822b', dark: '#5e3610', light: '#f5e2c2' },
  temper: TEMPER,
  eras: [
    // The factory and the boarding house: the night shift, the letters from the council, and next year back.
    makeEra('gs', 'gasten', {
      key: '1975',
      year: 1975,
      light: 'nachtploeg',
      ranged: 'de_tolk',
      rangedShot: { rig: 'shot_envelop', arc: 34, spin: 2, splash: '#c8a26a' },
      heavy: 'imperiaal',
      shield: 'de_koffer',
      turret: 'turret_pension',
      turretShot: { rig: 'shot_wekker', arc: 70, spin: 1.5, splash: '#f2d14b' },
      special: { kind: 'heal', healPercent: SPECIAL.thee.healPercent, rig: 'special_thee' },
    }, TEMPER),
    // The wedding and the barber: 650 guests, a host with a slipper, the döner man, a grandson on a fatbike, and the convoy.
    makeEra('gs', 'gasten', {
      key: '2025',
      year: 2025,
      light: 'de_gastvrouw',
      ranged: 'donerbaas',
      rangedShot: { rig: 'shot_pita', arc: 30, spin: 3, splash: '#f0d9a8' },
      heavy: 'fatbike',
      heavyRides: true,
      shield: 'de_trouwfilmer',
      turret: 'turret_kapperszaak',
      turretShot: { rig: 'shot_handdoek', arc: 60, spin: 1, splash: '#ffffff' },
      special: { kind: 'wave', rig: 'special_toeterstoet', speed: SPECIAL.toeterstoet.speed, dmg: SPECIAL.toeterstoet.dmg },
    }, TEMPER),
    // The great-grandchildren: robots at the barber, forty minutes to the south, and the whole family in one app.
    makeEra('gs', 'gasten', {
      key: '2050',
      year: 2050,
      light: 'kapbot',
      ranged: 'prijzenvader',
      rangedShot: { rig: 'shot_ticket', arc: 40, spin: 2, splash: '#9fe8ff' },
      heavy: 'zweefimperiaal',
      super: 'mo_tron',
      turret: 'turret_theeterras',
      turretShot: { rig: 'shot_suikerklontje', arc: 80, spin: 2, splash: '#ffffff' },
      special: { kind: 'summon', unit: 'gs.2050.summoned', count: SPECIAL.familieApp.count, rig: 'special_familie_app' },
      summoned: 'holoneef',
    }, TEMPER),
  ],
};
