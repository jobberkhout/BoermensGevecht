import { PERK_COST_PERCENT, REGROW, RETURN, SPECIAL, type Temper } from './balance.ts';
import { makeEra } from './make.ts';
import type { FactionDef } from './types.ts';

/**
 * The havermelkelite: quick and frail. Everything gets there sooner and folds
 * sooner, and everything but the Havermelkreus costs a tenth less. Whoever
 * throws something throws it from further away, but it is only flowers and
 * coffee.
 *
 * Until 23 November 2026 only the cheapest unit was cheaper. The owner then
 * put all four units at 90% and kept the Havermelkreus at 3000: "they are
 * faster but a bit weaker and cheaper whereas the achterhoek has slower and
 * stronger units".
 */
const TEMPER: Temper = {
  light: { speed: 115, hp: 85, cost: 90 },
  ranged: { range: 110, dmg: 90, cost: 90 },
  heavy: { speed: 115, hp: 90, cost: 90 },
  shield: { speed: 110, hp: 90, cost: 90 },
};

/** Amsterdam, west, left side of the screen. Display names live in ui/nl.ts. */
export const havermelk: FactionDef = {
  id: 'havermelk',
  flagRig: 'flags/amsterdam',
  backdropRig: 'havermelk/backdrop',
  voice: 'town',
  colors: { main: '#c8a8f0', dark: '#7d5fb8', light: '#efe3ff' },
  temper: TEMPER,
  eras: [
    // Squatters and flower children.
    makeEra('hm', 'havermelk', {
      key: '1975',
      year: 1975,
      light: 'kraker_sjors',
      ranged: 'bloemenkind_fleur',
      rangedShot: { rig: 'shot_bloemen', arc: 70, spin: 1.2, splash: '#ff9fd0' },
      heavy: 'flowerpowerbusje',
      shield: 'matras_marleen',
      turret: 'turret_kraakradio',
      turretShot: { rig: 'shot_herrie', arc: 14, spin: 0, splash: '#fff27a' },
      special: { kind: 'heal', healPercent: SPECIAL.loveIn.healPercent, rig: 'special_lovein' },
    }, TEMPER),
    // The oat-milk elite.
    makeEra('hm', 'havermelk', {
      key: '2025',
      year: 2025,
      light: 'padel_pepijn',
      ranged: 'barista_bo',
      rangedShot: { rig: 'shot_flatwhite', arc: 70, spin: 1.5, splash: '#b98a5a' },
      heavy: 'bakfiets_babette',
      shield: 'sup_sanne',
      turret: 'turret_podcast',
      turretShot: { rig: 'shot_geklaag', arc: 14, spin: 0, splash: '#ffffff' },
      special: { kind: 'stun', ticks: SPECIAL.blokkade.ticks, rig: 'special_blokkade' },
      // Padel-Pepijn smashes enemy throws back down the lane (sim/stunts.ts). The owner asked
      // for one unit per faction that does something no other does, 26 November 2026.
      perks: { light: { returns: { every: RETURN.every }, costPercent: PERK_COST_PERCENT } },
    }, TEMPER),
    // Headsets, bubble tea and meat from a vat.
    makeEra('hm', 'havermelk', {
      key: '2050',
      year: 2050,
      light: 'vr_vik',
      ranged: 'boba_bibi',
      rangedShot: { rig: 'shot_boba', arc: 50, spin: 0, splash: '#6b4630' },
      heavy: 'kweekvleesblob',
      super: 'havermelkreus',
      turret: 'turret_livestream',
      turretShot: { rig: 'shot_dislike', arc: 14, spin: 0, splash: '#ff5d73' },
      special: { kind: 'snipe', count: SPECIAL.algoritme.count, rig: 'special_algoritme' },
      // De Kweekvleesblob grows back (sim/stunts.ts): the owner asked for one unit of the last era
      // that does something no other does, 26 November 2026.
      perks: { heavy: { regrows: { every: REGROW.every, healPercent: REGROW.healPercent, rest: REGROW.rest }, costPercent: PERK_COST_PERCENT } },
    }, TEMPER),
  ],
};
