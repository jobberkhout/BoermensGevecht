import { SPECIAL, type Temper } from './balance.ts';
import { makeEra } from './make.ts';
import type { FactionDef } from './types.ts';

/**
 * De Zuidas: dear and in a hurry. Time is money: everything is delivered
 * sooner and strikes again sooner. Whatever is bigger than the junior costs a
 * tenth more and hits harder for it; the schild holds a little longer instead.
 */
const TEMPER: Temper = {
  light: { buildTicks: 70, recover: 85 },
  ranged: { cost: 110, buildTicks: 70, dmg: 110, recover: 85 },
  heavy: { cost: 110, buildTicks: 70, dmg: 110, recover: 85 },
  shield: { cost: 110, buildTicks: 70, hp: 110 },
};

/** De Zuidas: bankers, lawyers and consultants. Display names live in ui/factions/zuidas.ts. */
export const zuidas: FactionDef = {
  id: 'zuidas',
  flagRig: 'flags/zuidas',
  // Its gold line only goes up, also when the flag is mirrored.
  flagRigRight: 'flags/zuidas_rechts',
  backdropRig: 'zuidas/backdrop',
  voice: 'office',
  colors: { main: '#5b86c4', dark: '#24426e', light: '#d3e2f5' },
  temper: TEMPER,
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
    }, TEMPER),
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
    }, TEMPER),
    // In the cloud: bots, tokens, a meeting that never ends, and a fee who collects on everything.
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
      special: { kind: 'divert', ticks: SPECIAL.succesfee.ticks, rig: 'special_succesfee' },
    }, TEMPER),
  ],
};
