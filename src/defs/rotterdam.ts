import { HAKKEN, HAVENGELD, HIJS, SAUS, SPECIAL, VONK, type Temper } from './balance.ts';
import { makeEra } from './make.ts';
import type { FactionDef } from './types.ts';

/**
 * Rotterdam: hard en direct. "Niet lullen maar poetsen": every unit hits 10%
 * harder and has 10% fewer hit points. My choice; the brief had no
 * temperament (26 November 2026).
 *
 * The owner asked that "each faction has some units that do something
 * special". Which units and how is mine (docs/factions.md, section 4): Lasser
 * Leen's sparks burn whoever hits him up close, Gabber Gerrie hakt faster with
 * every blow, De Kapsalonkoerier's tray splashes garlic sauce, De AGV brings in
 * havengeld while it is on the lane, De Poetsrobot shrugs enemy specials off
 * and De Kraan lifts the enemy's front unit and drops it on the one behind.
 * Their numbers are in defs/balance.ts (VONK, HAKKEN, SAUS, HAVENGELD, HIJS),
 * their rules in sim/haven.ts. All three specials are of kinds of their own:
 * rush, block and shelter.
 */
const TEMPER: Temper = {
  light: { dmg: 110, hp: 90 },
  ranged: { dmg: 110, hp: 90 },
  heavy: { dmg: 110, hp: 90 },
  shield: { dmg: 110, hp: 90 },
};

/** Rotterdam: the port, sleeves rolled up. Display names live in ui/factions/rotterdam.ts. */
export const rotterdam: FactionDef = {
  id: 'rotterdam',
  flagRig: 'flags/rotterdam',
  backdropRig: 'rotterdam/backdrop',
  voice: 'port',
  colors: { main: '#1f8a4c', dark: '#13603a', light: '#dff1e5' },
  temper: TEMPER,
  eras: [
    // De kade: he carries the sack himself.
    makeEra('rt', 'rotterdam', {
      key: '1975',
      year: 1975,
      light: 'bootwerker_aad',
      ranged: 'sjaak_de_sjouwer',
      rangedShot: { rig: 'shot_baal', arc: 60, spin: 1.5, splash: '#c8a46a' },
      heavy: 'straddle_carrier',
      shield: 'lasser_leen',
      turret: 'turret_schaft',
      turretShot: { rig: 'shot_broodtrommel', arc: 50, spin: 2.5, splash: '#b9c2c8' },
      special: { kind: 'rush', ticks: SPECIAL.mouwen.ticks, rig: 'special_mouwen' },
      perks: { shield: { sparks: { percent: VONK.percent } } },
    }, TEMPER),
    // Maasvlakte: he holds a joystick.
    makeEra('rt', 'rotterdam', {
      key: '2025',
      year: 2025,
      light: 'gabber_gerrie',
      ranged: 'kapsalonkoerier',
      rangedShot: { rig: 'shot_kapsalon', arc: 70, spin: 0.5, splash: '#fffdf5' },
      heavy: 'agv',
      shield: 'bouwvakker_ben',
      turret: 'turret_kubuswoning',
      turretShot: { rig: 'shot_stoel', arc: 60, spin: 2, splash: '#c9925a' },
      special: { kind: 'block', ticks: SPECIAL.container.ticks, dmg: SPECIAL.container.dmg, width: SPECIAL.container.width, rig: 'special_container' },
      perks: {
        light: { tempo: { ...HAKKEN } },
        ranged: { sauce: { ...SAUS } },
        heavy: { earns: { ...HAVENGELD } },
      },
    }, TEMPER),
    // De drijvende stad: a robot does it, and the bragging stays the same.
    makeEra('rt', 'rotterdam', {
      key: '2050',
      year: 2050,
      light: 'poetsrobot',
      ranged: 'stapelaar_sjaan',
      rangedShot: { rig: 'shot_kistje', arc: 60, spin: 1.5, splash: '#e8731c' },
      heavy: 'drijvende_wijk',
      super: 'de_kraan',
      turret: 'turret_laatste_ploeg',
      turretShot: { rig: 'shot_joystick', arc: 50, spin: 3, splash: '#d7dde2' },
      special: { kind: 'shelter', ticks: SPECIAL.kering.ticks, percent: SPECIAL.kering.percent, rig: 'special_kering' },
      perks: {
        light: { immune: true },
        shield: { lift: { ...HIJS } },
      },
    }, TEMPER),
  ],
};
