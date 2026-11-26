import { CHARGE, SOUP, SPECIAL, STICKY, VAULT, type Temper } from './balance.ts';
import { makeEra } from './make.ts';
import type { FactionDef } from './types.ts';

/**
 * De Elf Steden: koppig en bedaard. Frisians are stubborn and take their time:
 * every unit has 10% more hit points and takes 15% longer in training. My
 * choice; the brief had no temperament, and the owner asked for no balancing
 * yet (26 November 2026).
 *
 * More than any faction before them, their units do things of their own (the
 * owner: "Go NUTS"): De Fierljepper vaults over the close fighters to a thrower,
 * De Kluner cannot brake, Bakker Tjitske's sugar bread glues the enemy, and
 * Beppe's Koek-en-zopie feeds whoever stands around her. Their numbers are in
 * defs/balance.ts (VAULT, CHARGE, STICKY, SOUP), their rules in sim/stunts.ts.
 * The eras run from a hard winter through a wet one to a tropical Friesland.
 * From docs/factions.md, section 3, as the owner changed it that day.
 */
const TEMPER: Temper = {
  light: { hp: 110, buildTicks: 115 },
  ranged: { hp: 110, buildTicks: 115 },
  heavy: { hp: 110, buildTicks: 115 },
  shield: { hp: 110, buildTicks: 115 },
};

/** De Elf Steden: proud, stubborn, and still waiting for ice. Display names live in ui/factions/friezen.ts. */
export const friezen: FactionDef = {
  id: 'friezen',
  flagRig: 'flags/friezen',
  backdropRig: 'friezen/backdrop',
  voice: 'country',
  colors: { main: '#1d5fa8', dark: '#0d2f5c', light: '#dbe9f8' },
  temper: TEMPER,
  eras: [
    // De strenge winter: everyone in wool, and Pake still talks about '63.
    makeEra('fr', 'friezen', {
      key: '1975',
      year: 1975,
      light: 'fierljepper',
      ranged: 'opslagger',
      rangedShot: { rig: 'shot_keatsbal', arc: 30, spin: 3, splash: '#ffffff' },
      heavy: 'kopgroep',
      shield: 'baanveger_bauke',
      turret: 'turret_leugenbank',
      turretShot: { rig: 'shot_dumke', arc: 50, spin: 2, splash: '#e8c58a' },
      special: { kind: 'stun', ticks: SPECIAL.winter63.ticks, look: 'ice', rig: 'special_winter63' },
      perks: { light: { vault: { gap: VAULT.gap, reach: VAULT.reach, dazeTicks: VAULT.dazeTicks } } },
    }, TEMPER),
    // Kwakkelwinter: rain over the skating suits, and the bezemwagen ready.
    makeEra('fr', 'friezen', {
      key: '2025',
      year: 2025,
      light: 'de_kluner',
      ranged: 'bakker_tjitske',
      rangedShot: { rig: 'shot_sukerbole', arc: 80, spin: 1, splash: '#f3d9a0' },
      heavy: 'skutsje',
      shield: 'koek_en_zopie',
      turret: 'turret_brugwachter',
      turretShot: { rig: 'shot_klompje', arc: 60, spin: 2, splash: '#d9a35a' },
      special: { kind: 'revive', count: SPECIAL.bezemwagen.count, rig: 'special_bezemwagen' },
      perks: {
        light: { charge: { ...CHARGE } },
        ranged: { sticky: { ticks: STICKY.ticks } },
        shield: { soup: { ...SOUP } },
      },
    }, TEMPER),
    // Tropysk Fryslân: palm trees on the terp, and the only ice left is in the turret.
    makeEra('fr', 'friezen', {
      key: '2050',
      year: 2050,
      light: 'zweefschaatser',
      ranged: 'kokoskanon',
      rangedShot: { rig: 'shot_kokosnoot', arc: 70, spin: 1.5, splash: '#ffffff' },
      heavy: 'tikiskutsje',
      super: 'de_grutte',
      turret: 'turret_ijscommissie',
      turretShot: { rig: 'shot_ijsblokje', arc: 40, spin: 3, splash: '#cfefff' },
      special: { kind: 'siesta', ticks: SPECIAL.tropenrooster.ticks, rig: 'special_tropenrooster' },
    }, TEMPER),
  ],
};
