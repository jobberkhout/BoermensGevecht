export type FactionId = 'havermelk' | 'achterhoek';
export type Role = 'light' | 'ranged' | 'heavy';

export interface ShotDef {
  /** Art id of the projectile, e.g. 'havermelk/e4/shot_flatwhite'. */
  rig: string;
  /** Sub-units per tick. */
  speed: number;
  /** Height of the flight arc in pixels. Looks only; the sim ignores it. */
  arc: number;
}

/** All distances in lane sub-units, all times in ticks. See defs/balance.ts. */
export interface UnitDef {
  id: string;
  role: Role;
  /** Art id, e.g. 'havermelk/e4/barista_bo'. */
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
}

export type SpecialDef = SpecialBase &
  (
    | { kind: 'wave'; rig: string; speed: number; dmg: number } // sweeps the lane, hits every enemy unit once
    | { kind: 'stun'; ticks: number } // enemy units on the lane can neither walk nor fight for a while
  );

export interface EraDef {
  id: string;
  /** The year this era becomes available. */
  year: number;
  baseRig: string;
  baseHp: number;
  income: number;
  eraUpCost: number | null;
  units: [UnitDef, UnitDef, UnitDef];
  turret: TurretDef;
  special: SpecialDef;
}

export interface FactionDef {
  id: FactionId;
  flagRig: string;
  eras: EraDef[];
}
