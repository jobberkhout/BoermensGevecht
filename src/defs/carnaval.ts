import { DRUM, KEYS, PARTY, PEEL, SPECIAL, type Temper } from './balance.ts';
import { makeEra } from './make.ts';
import type { FactionDef } from './types.ts';

/**
 * Carnaval: uitbundig en wankel. They are in a party mood: every unit hits
 * 10% harder and walks 10% faster, and has 15% fewer hit points, because
 * after a few it does not take much to knock them over. Mine; the brief had
 * no temperament, and the owner asked for no balancing (26 November 2026).
 *
 * Several units do something no other unit does (the owner: "funny and a bit
 * dumb", the way De Elf Steden were built): De Grote Trom booms with every
 * turret shot that bounces off its drum and its band marches faster for it,
 * Het Bananenpak leaves its peel behind when it is beaten, De Zuipwagen drops
 * the beat and the enemy around it stops to party, and De Reuzenprins takes
 * over an enemy turret with the key of the city, for which it takes the
 * turrets' full damage. Their three specials are kinds nobody else has: the
 * polonaise that dances the enemy home, confetti that makes their throws
 * miss, and the hangover that makes them crawl. Numbers in defs/balance.ts
 * (DRUM, PEEL, PARTY, KEYS, SPECIAL), rules in sim/carnaval.ts.
 * From docs/factions.md, section 2.
 */
const TEMPER: Temper = {
  light: { dmg: 110, speed: 110, hp: 85 },
  ranged: { dmg: 110, speed: 110, hp: 85 },
  heavy: { dmg: 110, speed: 110, hp: 85 },
  shield: { dmg: 110, speed: 110, hp: 85 },
};

/** Carnaval: Brabant and Limburg in full swing, mixed on purpose. Display names live in ui/factions/carnaval.ts. */
export const carnaval: FactionDef = {
  id: 'carnaval',
  flagRig: 'flags/carnaval',
  backdropRig: 'carnaval/backdrop',
  voice: 'party',
  colors: { main: '#d8342b', dark: '#6e1f17', light: '#fbe3bd' },
  temper: TEMPER,
  eras: [
    // Karnaval with a K: the village carnival of the seventies, plain blue kiels and a brown café.
    makeEra('cv', 'carnaval', {
      key: '1975',
      year: 1975,
      light: 'de_hosser',
      ranged: 'sousafonist',
      rangedShot: { rig: 'shot_hoempa', arc: 40, spin: 0, splash: '#f6c21c' },
      heavy: 'praalwagen',
      shield: 'de_grote_trom',
      turret: 'turret_pronkzitting',
      turretShot: { rig: 'shot_bierviltje', arc: 30, spin: 3, splash: '#e8c58a' },
      special: { kind: 'conga', rig: 'special_polonaise', speed: SPECIAL.polonaise.speed, ticks: SPECIAL.polonaise.ticks },
      perks: { shield: { drum: { ...DRUM } } },
    }, TEMPER),
    // The party tent on the market square: wristbands, fences, and a banana from above the rivers.
    makeEra('cv', 'carnaval', {
      key: '2025',
      year: 2025,
      light: 'bananenpak',
      ranged: 'confettischutter',
      rangedShot: { rig: 'shot_confetti', arc: 50, spin: 1, splash: '#f6c21c' },
      heavy: 'zuipwagen',
      shield: 'verkeersregelaar',
      turret: 'turret_vipdeck',
      turretShot: { rig: 'shot_munt', arc: 50, spin: 2.5, splash: '#ffd21f' },
      special: { kind: 'blind', ticks: SPECIAL.kanonschoten.ticks, rig: 'special_kanonschoten' },
      perks: {
        light: { peel: { rig: 'bananenschil', ...PEEL } },
        heavy: { party: { ...PARTY } },
      },
    }, TEMPER),
    // The dome: time slots, alcohol-free, and still eleven.
    makeEra('cv', 'carnaval', {
      key: '2050',
      year: 2050,
      light: 'tijdslot_hosser',
      ranged: 'robo_tonprater',
      rangedShot: { rig: 'shot_mop', arc: 14, spin: 0, splash: '#ffffff' },
      heavy: 'zelfrijdende_praalwagen',
      super: 'reuzenprins',
      turret: 'turret_laatste_raad',
      turretShot: { rig: 'shot_medaille', arc: 60, spin: 2, splash: '#ffd21f' },
      special: { kind: 'slow', ticks: SPECIAL.kater.ticks, speedPercent: SPECIAL.kater.speedPercent, rig: 'special_kater' },
      perks: { shield: { keys: { rig: 'stadssleutel', ticks: KEYS.ticks, rest: KEYS.rest }, turretPercent: KEYS.turretPercent } },
    }, TEMPER),
  ],
};
