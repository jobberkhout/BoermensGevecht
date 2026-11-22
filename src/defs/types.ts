import type { EraKey } from './balance.ts';

export type FactionId = 'havermelk' | 'achterhoek' | 'zuidas';
export type Role = 'light' | 'ranged' | 'heavy' | 'shield' | 'super';
/** How a faction sounds: its units walking out and its turrets firing. See audio/sound.ts. */
export type Voice = 'town' | 'country' | 'office';

export interface ShotDef {
  /** Art id of the projectile, e.g. 'havermelk/2025/shot_flatwhite'. */
  rig: string;
  /** Sub-units per tick. */
  speed: number;
  /** Height of the flight arc in pixels. Looks only; the sim ignores it. */
  arc: number;
  /** Turns per second while it flies. 0 for things that should stay upright. Looks only. */
  spin: number;
  /** Colour of the puff it leaves where it lands. Looks only. */
  splash: string;
}

/** All distances in lane sub-units, all times in ticks. See defs/balance.ts. */
export interface UnitDef {
  id: string;
  role: Role;
  /** Art id, e.g. 'havermelk/2025/barista_bo'. */
  rig: string;
  cost: number;
  buildTicks: number;
  hp: number;
  speed: number;
  len: number;
  range: number;
  dmg: number;
  windup: number;
  recover: number;
  bounty: number;
  /** A melee blow hits every enemy unit within reach instead of only the foremost. */
  cleave: boolean;
  /** Enemy specials have no effect on it. */
  immune: boolean;
  /** The share of a turret's shot it takes, in percent: 100 for most units. */
  turretPercent: number;
  /** Enemy turrets that can reach it fire at it, wherever it stands, instead of at the foremost unit. */
  drawsFire: boolean;
  /** Present on ranged units: they launch this instead of hitting directly. */
  shot?: ShotDef;
}

export interface TurretDef {
  id: string;
  rig: string;
  cost: number;
  /** Reach measured from the owner's gate. */
  range: number;
  dmg: number;
  cooldown: number;
  shot: ShotDef;
}

interface SpecialBase {
  id: string;
  cooldown: number;
  firstReady: number;
  /** Art that goes with it, if any. Looks only. */
  rig?: string;
}

export type SpecialDef = SpecialBase &
  (
    | { kind: 'wave'; rig: string; speed: number; dmg: number } // sweeps the lane, hits every enemy unit once
    | { kind: 'stun'; ticks: number } // enemy units on the lane can neither walk nor fight for a while
    | { kind: 'buff'; ticks: number; dmgPercent: number; speedPercent: number } // own units hit harder and move faster
    | { kind: 'heal'; healPercent: number } // own units on the lane get hit points back
    | { kind: 'barrage'; strikes: number; every: number; dmg: number } // repeated blows on the foremost enemy
    | { kind: 'snipe'; dmg: number } // damage that starts with the toughest enemy unit and carries on to the next
    | { kind: 'convert' } // the toughest enemy unit changes sides where it stands
  );

export interface EraDef {
  id: string;
  key: EraKey;
  /** The year it stands for, shown in the HUD. */
  year: number;
  baseRig: string;
  baseHp: number;
  /** Vooruitgang needed to modernize to the next era; null for the last one. */
  progressNeeded: number | null;
  /** What modernizing to the next era costs on top of that; null for the last one. */
  eraUpCost: number | null;
  /** Light, ranged, heavy, and a fourth: the schild, or in the last era the super unit. The index is the buy button. */
  units: UnitDef[];
  turret: TurretDef;
  special: SpecialDef;
}

export interface FactionDef {
  id: FactionId;
  flagRig: string;
  /**
   * For a flag that would read wrong in mirror image: a second drawing of it,
   * itself mirrored, that flies over the base when the faction plays on the right.
   */
  flagRigRight?: string;
  /** Its half of the backdrop, drawn for the left side of the screen. */
  backdropRig: string;
  voice: Voice;
  /** For the stand-in boxes where art is missing, the reach marker of its turrets, and the plain ground under a missing backdrop. */
  colors: { main: string; dark: string; light: string };
  eras: EraDef[];
}
