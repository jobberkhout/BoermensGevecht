import { SPECIAL } from './balance.ts';
import { makeEra } from './make.ts';
import type { FactionDef } from './types.ts';

/** De Zuidas: bankers, lawyers and consultants. Display names live in ui/factions/zuidas.ts. */
export const zuidas: FactionDef = {
  id: 'zuidas',
  flagRig: 'flags/zuidas',
  // Its gold line only goes up, also when the flag is mirrored.
  flagRigRight: 'flags/zuidas_rechts',
  backdropRig: 'zuidas/backdrop',
  voice: 'office',
  colors: { main: '#5b86c4', dark: '#24426e', light: '#d3e2f5' },
  eras: [
    // The exchange floor: pencils, price slips and a gong.
    makeEra('za', 'zuidas', {
      key: '1975',
      year: 1975,
      light: 'jongste_bediende',
      ranged: 'de_hoekman',
      rangedShot: { rig: 'shot_potlood', arc: 34, spin: 2, splash: '#f2c94c' },
      heavy: 'directiewagen',
      shield: 'de_brandkast',
      turret: 'turret_societeit',
      turretShot: { rig: 'shot_speelkaart', arc: 40, spin: 3, splash: '#ffffff' },
      special: {
        kind: 'buff',
        ticks: SPECIAL.gong.ticks,
        dmgPercent: SPECIAL.gong.dmgPercent,
        speedPercent: SPECIAL.gong.speedPercent,
        rig: 'special_gong',
      },
    }),
    // The mirror palace: bodywarmers, invoices and a lease car.
    makeEra('za', 'zuidas', {
      key: '2025',
      year: 2025,
      light: 'bodywarmer_bas',
      ranged: 'mr_declarabel',
      rangedShot: { rig: 'shot_factuur', arc: 46, spin: 0, splash: '#f5f1e6' },
      heavy: 'leasebak',
      shield: 'de_disclaimer',
      turret: 'turret_vrijmibo',
      turretShot: { rig: 'shot_bitterbal', arc: 100, spin: 1.5, splash: '#b5722f' },
      special: { kind: 'convert', rig: 'special_overname' },
    }),
    // In the cloud: bots, tokens and a meeting that never ends.
    makeEra('za', 'zuidas', {
      key: '2050',
      year: 2050,
      light: 'stagebot',
      ranged: 'cryptobro',
      rangedShot: { rig: 'shot_token', arc: 60, spin: 2, splash: '#ffd21f' },
      heavy: 'vergaderpod',
      super: 'gouden_handdruk',
      turret: 'turret_kwartaalcijfers',
      turretShot: { rig: 'shot_taartpunt', arc: 50, spin: 2.5, splash: '#7fb2e6' },
      special: { kind: 'wave', rig: 'special_flitskrach', speed: SPECIAL.flitskrach.speed, dmg: SPECIAL.flitskrach.dmg },
    }),
  ],
};
