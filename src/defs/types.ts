import type { EraKey, Temper } from './balance.ts';

export type FactionId = 'havermelk' | 'achterhoek' | 'zuidas' | 'gasten' | 'toeristen' | 'friezen' | 'carnaval';
export type Role = 'light' | 'ranged' | 'heavy' | 'shield' | 'super';
/** How a faction sounds: its units walking out and its turrets firing. See audio/sound.ts. */
export type Voice = 'town' | 'country' | 'office' | 'tourist' | 'party';

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
  /** How far a cleaving blow reaches from the front edge: `range`, or further for a super unit. */
  sweep: number;
  /** Enemy specials have no effect on it. */
  immune: boolean;
  /** The share of a turret's shot it takes, in percent: 100 for most units. */
  turretPercent: number;
  /** Enemy turrets that can reach it fire at it, wherever it stands, instead of at the foremost unit. */
  drawsFire: boolean;
  /** Present on ranged units: they launch this instead of hitting directly. */
  shot?: ShotDef;
  /**
   * Present on a rider, the fatbike: it does not join the ranks but rides
   * through them to the enemy base. `dmg` is what each enemy unit it rides
   * through takes, `baseDmg` what the base takes when it gets there. See sim/riders.ts.
   */
  rider?: { baseDmg: number };
  /**
   * Not trained but called in by a special, or scattered from a unit that fell:
   * it is not for sale, costs nothing and pays no bounty, and beating it teaches
   * nobody anything. The hologram cousins of De Familie-app, the day trippers of
   * the cruise ship, Paraplu-Pam's lost group. See sim/specials.ts and sim/step.ts.
   */
  summoned?: true;
  /**
   * Present on a unit that throws nothing and poses the enemy instead:
   * Influencer-Ivy. Every enemy unit within its reach is in its shot, and its
   * blows and throws do POSE.dmgPercent of their damage while it is. `rig` is
   * the mark drawn over a posing unit. See sim/tourists.ts.
   */
  poser?: { rig: string };
  /**
   * When it is beaten, by any cause, `count` units of `unit` come onto the lane
   * where it stood, for the side it is on: Paraplu-Pam's group. See sim/tourists.ts.
   */
  scatter?: { unit: string; count: number };
  /**
   * Present on a unit with someone aboard who throws while it fights: the beer
   * bikes. Every `every` ticks, if the enemy's foremost unit (or, with none
   * left, the base) is within `range`, a shot of `dmg` flies off, whether the
   * unit itself is walking or hitting. Its own blows are those of its role.
   * See TOSS in defs/balance.ts and sim/step.ts.
   */
  toss?: { dmg: number; range: number; every: number; shot: ShotDef };
  /**
   * The pole vaulter, De Fierljepper: at the first enemy unit it meets it
   * vaults over it instead of fighting, lands `gap` behind that unit's back,
   * in the middle of the enemy ranks, and sits dazed for `dazeTicks`. Once a
   * life. See VAULT in defs/balance.ts and sim/stunts.ts.
   */
  vault?: { gap: number; dazeTicks: number };
  /**
   * The skater who cannot brake, De Kluner: until its first blow it is
   * `speedPercent` as fast, that first blow does `dmgPercent` of its damage and
   * shoves the unit it hits `shove` back, and then it sits dazed for
   * `dazeTicks`. See CHARGE in defs/balance.ts and sim/stunts.ts.
   */
  charge?: { speedPercent: number; dmgPercent: number; shove: number; dazeTicks: number };
  /** Its throws glue whoever they hit with sugar: for `ticks` it walks and fights at half pace. Bakker Tjitske. See STICKY. */
  sticky?: { ticks: number };
  /** Every `every` ticks it patches up its own units within `reach`, by `healPercent` of their hit points: Beppe's soup. See SOUP. */
  soup?: { every: number; healPercent: number; reach: number };
  /** A throw by an enemy unit that would hit it is sent back down the lane instead, once every `every` ticks: Padel-Pepijn. See RETURN. */
  returns?: { every: number };
  /** Its throw bounces on to the enemy unit behind the one it hit, if that one is within `reach`, with `dmgPercent` of the damage: Smijtink's beets. See BOUNCE. */
  bounce?: { dmgPercent: number; reach: number };
  /** Every `every` ticks it grows back `healPercent` of its hit points, once it has not been hit for `rest` ticks: De Kweekvleesblob. See REGROW. */
  regrows?: { every: number; healPercent: number; rest: number };
  /** It gets `percent` of the damage its blows do back as hit points: De Vreter eats what it hits. See FEED. */
  feeds?: { percent: number };
  /**
   * De Grote Trom: every turret shot that bounces off its drum is one more
   * boom, in time, and for `ticks` its own units within `reach` (itself too)
   * march at `speedPercent` of their pace. See DRUM in defs/balance.ts and sim/carnaval.ts.
   */
  drum?: { reach: number; ticks: number; speedPercent: number };
  /**
   * Het Bananenpak: when it is beaten it leaves its peel, the drawing `rig`, on
   * the road where it stood. The first enemy unit that walks over it in that row
   * slips and lies dazed for `dazeTicks`; a peel nobody steps on is gone after
   * `ticks`. Super units do not slip. See PEEL and sim/carnaval.ts.
   */
  peel?: { rig: string; dazeTicks: number; ticks: number };
  /**
   * De Zuipwagen drops the beat: every `every` ticks, if enemy units stand
   * within `reach` of its front, all of them stop fighting and party for
   * `ticks`. Super units do not. See PARTY and sim/carnaval.ts.
   */
  party?: { every: number; ticks: number; reach: number };
  /**
   * De Reuzenprins gets the key of the city: once an enemy turret can reach
   * it, it takes over the most upgraded one for `ticks`, and that turret fires
   * at its own side's units for this one's. When it is over, or the prince is
   * beaten, the key goes back; after `rest` more ticks it can take one again.
   * `rig` is the drawing of the key. See KEYS and sim/carnaval.ts.
   */
  keys?: { ticks: number; rest: number; rig: string };
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
    | { kind: 'stun'; ticks: number; look?: 'ice' } // enemy units on the lane can neither walk nor fight for a while; with 'ice' they freeze over and slip
    | { kind: 'buff'; ticks: number; dmgPercent: number; speedPercent: number } // own units hit harder and move faster
    | { kind: 'heal'; healPercent: number } // own units on the lane get hit points back
    | { kind: 'barrage'; strikes: number; every: number; dmg: number } // repeated blows on the foremost enemy
    | { kind: 'snipe'; count: number } // the toughest enemy units are cancelled outright, this many of them
    | { kind: 'convert' } // the toughest enemy unit changes sides where it stands
    | { kind: 'divert'; ticks: number } // for a while everything the enemy earns is paid to you instead
    | { kind: 'summon'; unit: string; count: number; ticks?: number } // free units of your own come out at your gate, unit cap or not; with `ticks`, they leave again after that long
    | { kind: 'hike'; ticks: number; pricePercent: number } // for a while everything the enemy buys costs more
    | { kind: 'revive'; count: number } // the last units of your own that were beaten come back out of your gate
    | { kind: 'siesta'; ticks: number } // for a while the enemy's turrets do not fire
    | { kind: 'conga'; rig: string; speed: number; ticks: number } // a line sweeps the lane; every enemy unit it passes dances back towards its own base for a while
    | { kind: 'blind'; ticks: number } // confetti in the enemy's faces: for a while what their units throw misses
    | { kind: 'slow'; ticks: number; speedPercent: number } // enemy units crawl for a while; they can still fight
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
  /** Units that come onto the lane without being bought: whoever its special calls in. */
  extras: UnitDef[];
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
  /** Its own twist on the shared numbers, per role. Already worked into the units of `eras`; kept here to be read. */
  temper: Temper;
  eras: EraDef[];
}
