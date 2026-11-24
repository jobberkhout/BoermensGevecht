import { SPECIAL, type Temper } from './balance.ts';
import { makeEra } from './make.ts';
import type { FactionDef } from './types.ts';

/**
 * De Toeristen: snel en overal. The owner, 24 November 2026: "The units should
 * move quite fast though, otherwise they are useless." Every unit walks 25%
 * faster and hits 15% softer: they get everywhere first and are more in the
 * way than dangerous. And there are a lot of them: every unit costs 10% less.
 * That last part was not in the brief; without it they won one bot match in
 * ten with both sides buying a mix. Four units have rules of their own, with
 * numbers of their own in defs/balance.ts: Influencer-Ivy poses the enemy
 * (POSE), Paraplu-Pam is dear and slow and scatters into her group (SCATTER),
 * and the two beer bikes, De Bierfiets and De Zweefbierfiets, are fast, dear
 * heavies with one of the party tossing beers (TOSS). From the brief in
 * docs/factions.md, section 5; the beer bikes as the owner changed them later
 * the same day (the Zweefbierfiets used to hover out of reach of melee).
 */
const TEMPER: Temper = {
  light: { speed: 125, dmg: 85, cost: 90 },
  ranged: { speed: 125, dmg: 85, cost: 90 },
  heavy: { speed: 125, dmg: 85, cost: 90 },
  shield: { speed: 125, dmg: 85, cost: 90 },
};

/** De Toeristen: everyone's shared enemy, worse with every era. Display names live in ui/factions/toeristen.ts. */
export const toeristen: FactionDef = {
  id: 'toeristen',
  flagRig: 'flags/toeristen',
  backdropRig: 'toeristen/backdrop',
  voice: 'tourist',
  colors: { main: '#e8a91c', dark: '#6b4a06', light: '#fdf0c4' },
  temper: TEMPER,
  eras: [
    // The backpack summer: polite, lost, a bit sunburnt. Still fine.
    makeEra('tr', 'toeristen', {
      key: '1975',
      year: 1975,
      light: 'rugzak_robin',
      ranged: 'flitsblokje_fien',
      rangedShot: { rig: 'shot_flitsblokje', arc: 30, spin: 3, splash: '#ffffff' },
      heavy: 'touringcar',
      shield: 'plattegrond_paula',
      turret: 'turret_ansichtkaarten',
      turretShot: { rig: 'shot_ansichtkaart', arc: 50, spin: 2, splash: '#bfe3ff' },
      special: { kind: 'stun', ticks: SPECIAL.diaAvond.ticks, rig: 'special_dia_avond' },
    }, TEMPER),
    // Overtoerisme: the suitcase on the cobbles, the influencer on the bike path, the beer bike, the cruise ship.
    makeEra('tr', 'toeristen', {
      key: '2025',
      year: 2025,
      light: 'rolkoffer_rita',
      ranged: 'influencer_ivy',
      rangedPoses: 'pose_frame',
      heavy: 'bierfiets',
      heavyTosses: { rig: 'shot_bier', arc: 60, spin: 1.2, splash: '#fff3b0' },
      shield: 'paraplu_pam',
      shieldScatters: 'verdwaalde_toerist',
      turret: 'turret_hyperij',
      turretShot: { rig: 'shot_friet', arc: 70, spin: 1.5, splash: '#f6d36b' },
      special: {
        kind: 'summon',
        unit: 'tr.2025.summoned',
        count: SPECIAL.cruiseschip.count,
        ticks: SPECIAL.cruiseschip.ticks,
        rig: 'special_cruiseschip',
      },
      summoned: 'dagjesmens',
      summonedStats: { hp: SPECIAL.cruiseschip.hp, dmg: SPECIAL.cruiseschip.dmg, speed: SPECIAL.cruiseschip.speed },
    }, TEMPER),
    // The city is a theme park: they have rented all of it, and the locals are priced out.
    makeEra('tr', 'toeristen', {
      key: '2050',
      year: 2050,
      light: 'robokoffer',
      ranged: 'eenster_eli',
      rangedShot: { rig: 'shot_ster', arc: 14, spin: 4, splash: '#ffd21f' },
      heavy: 'zweefbierfiets',
      heavyTosses: { rig: 'shot_zweefbier', arc: 40, spin: 0, splash: '#fff3b0' },
      super: 'ms_kolossaal',
      turret: 'turret_sleutelkluizen',
      turretShot: { rig: 'shot_sleutel', arc: 80, spin: 2, splash: '#d9d9d9' },
      special: {
        kind: 'hike',
        ticks: SPECIAL.huurverhoging.ticks,
        pricePercent: SPECIAL.huurverhoging.pricePercent,
        rig: 'special_huurverhoging',
      },
    }, TEMPER),
  ],
};
