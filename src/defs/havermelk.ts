import { SPECIAL } from './balance.ts';
import { makeEra } from './make.ts';
import type { FactionDef } from './types.ts';

/** Amsterdam, west, left side of the screen. Display names live in ui/nl.ts. */
export const havermelk: FactionDef = {
  id: 'havermelk',
  flagRig: 'flags/amsterdam',
  eras: [
    // Squatters and flower children.
    makeEra('hm', 'havermelk', {
      key: '1975',
      year: 1975,
      light: 'kraker_sjors',
      ranged: 'bloemenkind_fleur',
      rangedShot: { rig: 'shot_bloemen', arc: 70, spin: 1.2 },
      heavy: 'flowerpowerbusje',
      turret: 'turret_kraakradio',
      turretShot: { rig: 'shot_herrie', arc: 14, spin: 0 },
      special: { kind: 'heal', healPercent: SPECIAL.loveIn.healPercent, rig: 'special_lovein' },
    }),
    // The oat-milk elite.
    makeEra('hm', 'havermelk', {
      key: '2025',
      year: 2025,
      light: 'padel_pepijn',
      ranged: 'barista_bo',
      rangedShot: { rig: 'shot_flatwhite', arc: 70, spin: 1.5 },
      heavy: 'bakfiets_babette',
      turret: 'turret_podcast',
      turretShot: { rig: 'shot_geklaag', arc: 14, spin: 0 },
      special: { kind: 'stun', ticks: SPECIAL.blokkade.ticks, rig: 'special_blokkade' },
    }),
    // Headsets, bubble tea and meat from a vat.
    makeEra('hm', 'havermelk', {
      key: '2050',
      year: 2050,
      light: 'vr_vik',
      ranged: 'boba_bibi',
      rangedShot: { rig: 'shot_boba', arc: 50, spin: 0 },
      heavy: 'kweekvleesblob',
      turret: 'turret_livestream',
      turretShot: { rig: 'shot_dislike', arc: 14, spin: 0 },
      special: { kind: 'snipe', dmg: SPECIAL.algoritme.dmg, rig: 'special_algoritme' },
    }),
  ],
};
