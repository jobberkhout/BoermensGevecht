import { CLIPS } from '../anim/clips/index.ts';
import { attackTime, sampleClip } from '../anim/sample.ts';
import type { Clip, ClipSet } from '../anim/types.ts';
import { GATE_X, GROUND_Y, LANE, SUB, TPS } from '../defs/balance.ts';
import { SPLASH, eraOf, turretDef, turretEra, unitDef } from '../defs/index.ts';
import type { UnitDef } from '../defs/types.ts';
import { addPose, copyPose, lerpPose, makePose, mountPoint, solve, type Pose } from '../rig/pose.ts';
import type { Rig } from '../rig/raster.ts';
import { frontUnit } from '../sim/lane.ts';
import { RIDER_ROW } from '../sim/riders.ts';
import { BASE, SIDES, other, type Side, type SimEvent, type SimState, type Unit } from '../sim/types.ts';
import { NL, linesFor, nameOf } from '../ui/nl.ts';
import { BAND_SPOT, dirOf, laneX, purseSpot, rowScale, rowY, TURRET_SCALE, TURRET_SPOTS } from './layout.ts';

/**
 * Everything the screen remembers that the rules do not care about: where a
 * unit is between two ticks, which animation frame it is on, units slinking
 * off, floating numbers. Fed by the sim's state and its events.
 */

export interface Puppet {
  rig: Rig;
  clips: ClipSet;
  pose: Pose;
  /** The pose last frame, before any hit reaction, to blend from when the action changes. */
  last: Pose;
  from: Pose;
  /** 0..1: how far the blend into the current action has come. */
  blend: number;
  overlay: Pose;
  world: Float32Array;
}

export interface UnitView {
  id: number;
  side: Side;
  def: UnitDef;
  /**
   * The row it is drawn in. Not always a whole number: it glides over when the
   * unit steps into another row, and stands half a row nearer while it walks
   * past one of its own throwers, so it goes round them instead of through.
   */
  row: number;
  /** Stage x of the middle of the body. */
  x: number;
  puppet: Puppet | null;
  act: Unit['act'];
  /** Seconds since it walked out; it fades in over the first moments. */
  age: number;
  /** Pixels walked so far; drives walk cycles and wheels. */
  travelled: number;
  lastPx: number;
  idleTime: number;
  /** Seconds since the last blow, or a large number. */
  hitTime: number;
  /** Seconds since one aboard last tossed something (the beer bikes), or a large number. */
  tossTime: number;
  /** 1 right after a blow, fading to 0. */
  flash: number;
  hp: number;
  stunned: boolean;
  /** Bought over: it wears the badge of the side it now fights for. */
  turncoat: boolean;
  /** Pixels it still has to slide to where it stands now, after it was moved by a takeover. Fades to 0. */
  slide: number;
  /** In the shot of an enemy poser: the drawing of the camera frame over its head, or ''. */
  pose: string;
  /** Seconds since a pole vaulter took off, or NEVER. While it is under LEAP_SECONDS the unit is in the air. */
  leap: number;
  /** Stage pixels the leap carries it, in the direction it walks. */
  leapDx: number;
  /** View time until which it sits dazed after a stunt of its own, the vault or the crash. */
  dazedUntil: number;
  /** View time until which it is frozen in the ice of De winter van '63. */
  icyUntil: number;
  /** Stunned by itself, after a stunt: it sits dazed, with stars. */
  dazed: boolean;
  /** Stunned by ice: it slips, blue. */
  icy: boolean;
  /** Glued with sugar. */
  sticky: boolean;
  /** -1 when it has landed in the enemy ranks beyond their front and turns round to fight, or dances home in a polonaise, else 1. */
  facing: number;
  /** Dancing back home in the enemy's polonaise. */
  dancing: boolean;
  /** View time until which it parties because De Zuipwagen dropped the beat. */
  partyUntil: number;
  /** Partying: it hops on the spot. */
  partying: boolean;
  /** View time at which it slipped on a banana peel, and until which it lies there. */
  slipFrom: number;
  slipUntil: number;
  /** Confetti in its eyes: what it throws misses. */
  blind: boolean;
  /** Hung over: it crawls, under the clouds of De Kater. */
  slowed: boolean;
  /** Seconds since it last did a trick of its own (the beat drop, the key), or a large number. */
  trickTime: number;
}

/** How long a pole vaulter is in the air, and how high it gets. */
export const LEAP_SECONDS = 0.6;
export const LEAP_HEIGHT = 150;

/** A close fighter whose body overlaps one of its own throwers in its row: it is walking, or was caught, past them. */
function passing(u: Unit, def: UnitDef, mine: readonly Unit[]): boolean {
  if (def.role === 'ranged' || def.rider) return false;
  for (const x of mine) {
    if (x === u || x.row !== u.row || unitDef(x.def).role !== 'ranged') continue;
    if (x.pos > u.pos - def.len && x.pos - unitDef(x.def).len < u.pos) return true;
  }
  return false;
}

export interface Ghost {
  side: Side;
  def: UnitDef;
  row: number;
  x: number;
  puppet: Puppet | null;
  travelled: number;
  age: number;
}

/** A turret on a base: a little scene that idles and plays its attack when it fires. */
export interface TurretView {
  rigId: string;
  rig: Rig;
  idle: Clip | undefined;
  attack: Clip | undefined;
  pose: Pose;
  world: Float32Array;
  /** Seconds since it last fired, or a large number. */
  fired: number;
  x: number;
  y: number;
  level: number;
  /** Left over from an older era than its owner is in now. */
  outdated: boolean;
  /** Taken over with the key of the city: the drawing of the key that hangs over it, or ''. */
  key: string;
  /** View time at which it was taken over. */
  keySince: number;
}

export interface Floater {
  x: number;
  y: number;
  text: string;
  color: string;
  age: number;
  life: number;
  size: number;
}

export interface Puff {
  x: number;
  y: number;
  age: number;
  life: number;
  color: string;
  size: number;
}

export interface ShotView {
  id: number;
  side: Side;
  rig: string;
  x: number;
  y: number;
  /** Radians. */
  angle: number;
  /** Thrown with confetti in the eyes: it comes down somewhere behind the enemy. */
  miss: boolean;
}

/** The hangover of De Kater: clouds that rain herring over the units it slows down, for as long as it lasts. */
export interface Hangover {
  /** The side whose units are hung over. */
  side: Side;
  rig: string;
  age: number;
  life: number;
}

/** A banana peel on the road, as the renderer draws it. */
export interface PeelView {
  side: Side;
  rig: string;
  x: number;
  row: number;
}

/** The activists of a Wegblokkade, sitting in front of the units they stopped. */
export interface Blockade {
  /** The side that is being blocked. */
  side: Side;
  rig: string;
  x: number;
  age: number;
  life: number;
}

/**
 * The scene of a special that lasts a while, beside its owner's base for as
 * long as it does: the band of a Høken!, the gong, the fee of De Zuidas on her cloud.
 */
export interface Band {
  /** The side whose base it stands by, and which way it faces. */
  side: Side;
  rig: string;
  age: number;
  life: number;
  /**
   * How it comes and goes. 'pop': it grows on the verge beside the base.
   * 'drop': it falls out of the sky onto that spot, as the estate agent's sign
   * of the Huurverhoging does on the enemy's base. 'dock': it slides in from
   * the edge of the screen behind the base and slides out again at the end, as
   * the cruise ship does; it is drawn behind the base.
   */
  mode: 'pop' | 'drop' | 'dock';
}

/** Seconds the cruise ship takes to slide in behind the base, and out again when its time is up. */
export const DOCK_SECONDS = 1.4;
/** Seconds a dropped sign takes to fall onto its spot. */
export const DROP_SECONDS = 0.35;

/** A drawing that flies from one spot to another and is gone: a heart, a diving drone, the algorithm's verdict. */
export interface Sprite {
  rig: string;
  /** Which way it faces. */
  side: Side;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  scale: number;
  age: number;
  /** Seconds it takes to get there. */
  life: number;
  /** Seconds it stays there afterwards, fading. */
  hold: number;
  /** 'rise' slows down as it goes, 'drop' speeds up. */
  ease: 'rise' | 'drop';
  /** Colour of the puff where it lands, or '' for none. */
  puff: string;
  landed: boolean;
}

/** A coin that changes hands: it flies in an arc from one spot to another and is gone. */
export interface Coin {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** How far above the straight line it is at its highest, in pixels. */
  arc: number;
  /** Negative until it sets off. */
  age: number;
  /** Seconds it takes to get there. */
  life: number;
  /** Where in its tumble it starts, so a handful of coins does not flip in step. */
  turn: number;
}

/** The drones of a Dronezwerm, hovering over whoever is next. */
export interface Swarm {
  /** The side that sent them. */
  side: Side;
  rig: string;
  x: number;
  y: number;
  /** How many are still to dive. */
  left: number;
}

/** The colours confetti comes in: the carnival's red, yellow and green, and a few others. */
export const CONFETTI: readonly string[] = ['#d8342b', '#f6c21c', '#2f9a48', '#2f62b0', '#ff7ad9', '#fffdf5'];

/** Seconds a unit takes to go down on a banana peel, and to get up again at the end. */
export const SLIP_FALL = 0.15;
export const SLIP_RISE = 0.25;
/** Seconds after the key leaves the prince's hand before it hangs over the turret he took. */
export const KEY_FLIGHT = 0.45;

export const GHOST_LIFE = 1.5;
export const SPAWN_FADE = 0.3;
const BLEND_SECONDS = 0.12;
const NEVER = 99;

/** How high above the road a swarm hovers, and where a blow from above lands. */
const SWARM_Y = -250;
const STRIKE_Y = -55;

function makePuppet(rig: Rig | undefined, rigId: string): Puppet | null {
  const clips = CLIPS[rigId];
  if (!rig || !clips || !clips.idle || !clips.walk || !clips.attack || !clips.hit || !clips.die) return null;
  const n = rig.parts.length;
  return {
    rig,
    clips: clips as ClipSet,
    pose: makePose(n),
    last: makePose(n),
    from: makePose(n),
    blend: 1,
    overlay: makePose(n),
    world: new Float32Array(n * 6),
  };
}

const point = { x: 0, y: 0 };

export class BattleView {
  units = new Map<number, UnitView>();
  ghosts: Ghost[] = [];
  turrets: [(TurretView | null)[], (TurretView | null)[]] = [[], []];
  floaters: Floater[] = [];
  puffs: Puff[] = [];
  shots: ShotView[] = [];
  blockades: Blockade[] = [];
  bands: Band[] = [];
  sprites: Sprite[] = [];
  swarms: Swarm[] = [];
  coins: Coin[] = [];
  hangovers: Hangover[] = [];
  peels: PeelView[] = [];
  /** 1 right after a base was struck, fading to 0. */
  baseFlash: [number, number] = [0, 0];
  /** 1 right after a side modernized, fading to 0. */
  eraFlash: [number, number] = [0, 0];
  /** Seconds the overtime banner has been up, or -1. */
  overtime = -1;
  /** Screen shake strength in pixels, fading out. */
  shake = 0;
  time = 0;

  private readonly rigOf: (id: string) => Rig | undefined;
  /** Where each flying shot left from, by shot id. */
  private launch = new Map<number, { x: number; y: number }>();
  private lastShot = new Map<number, ShotView>();
  /** Where each swarm hovers, by barrage id, so it glides instead of jumping to the next victim. */
  private hover = new Map<number, number>();
  /** Counts the sums of diverted money shown so far, to stack the ones that come in together. */
  private paid = 0;
  /** Seconds until the next note floats up from a side that is høken. */
  private noteIn: [number, number] = [0, 0];
  /** When each rider last shouted while riding through someone, by rider id, so it does not shout at every single one. */
  private riderShout = new Map<number, number>();
  /** When each beer bike last shouted while tossing, by unit id: at the first toss, then now and then. */
  private tossShout = new Map<number, number>();
  /** Whether the next unit a special calls in for each side says something: only the first of the family does. */
  private familyLine: [boolean, boolean] = [false, false];
  /** Seconds until the next snore rises from a side's turrets during a Tropenrooster. */
  private zzzIn: [number, number] = [0, 0];
  /** Seconds until the next note rises over a unit that parties or dances. */
  private partyIn = 0;
  /** When each side last shouted that someone joined the polonaise, so a whole rank joining does not stack the word. */
  private congaSaid: [number, number] = [-9, -9];
  /** When a big drum last said boom, by unit id, so a volley of turret shots does not stack the word. */
  private boomSaid = new Map<number, number>();
  private seed = 12345;

  constructor(rigOf: (id: string) => Rig | undefined) {
    this.rigOf = rigOf;
  }

  /** A small repeatable generator, so the same match always looks the same. */
  private random(): number {
    this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  private pick<T>(list: readonly T[]): T {
    return list[Math.floor(this.random() * list.length)]!;
  }

  /** Where something attached to a base sits on the stage: a named marker in the base art, or a fallback. */
  private mount(s: SimState, side: Side, name: string, fallbackX: number, fallbackY: number): { x: number; y: number } {
    const state = s.sides[side];
    const base = this.rigOf(eraOf(state.faction, state.era).baseRig);
    const m = base?.mounts[name];
    if (base && m) {
      const part = base.parts[m.part]!;
      return { x: GATE_X[side] + dirOf(side) * (part.x + m.x), y: GROUND_Y + part.y + m.y };
    }
    return { x: GATE_X[side] + dirOf(side) * fallbackX, y: GROUND_Y + fallbackY };
  }

  turretSpot(s: SimState, side: Side, slot: number): { x: number; y: number } {
    const spot = TURRET_SPOTS[slot] ?? TURRET_SPOTS[0]!;
    return this.mount(s, side, `turret${slot}`, spot.dx, spot.dy);
  }

  flagSpot(s: SimState, side: Side): { x: number; y: number } {
    return this.mount(s, side, 'flag', -286, -548);
  }

  /** Call once per tick with that tick's events. */
  consume(events: readonly SimEvent[], s: SimState): void {
    /** How many units the algorithm has come down on so far this tick. */
    let cancelled = 0;
    const muttered: [boolean, boolean] = [false, false];
    for (const e of events) {
      switch (e.t) {
        case 'spawn': {
          if (unitDef(e.def).role === 'super') {
            // Nobody should miss this one walking out.
            this.shake = Math.min(8, this.shake + 5);
            this.say(GATE_X[e.side] + dirOf(e.side) * 300, rowY(0) - 290, `${nameOf(e.def)}!`, '#ffd21f', 2.2, 46);
            break;
          }
          const def = unitDef(e.def);
          const unit = s.sides[e.side].units.find((u) => u.id === e.id);
          if (def.summoned) {
            // Beamed in: a flash of hologram light at the gate where the cousin appears.
            const x = GATE_X[e.side] + dirOf(e.side) * 30;
            const y = rowY(unit ? unit.row : 1);
            this.puffs.push({ x, y: y - 60, age: 0, life: 0.35, color: '#9fe8ff', size: 46 });
            this.puffs.push({ x, y: y - 120, age: -0.05, life: 0.3, color: '#e6fbff', size: 30 });
          }
          const cries = linesFor('battleCry', e.def);
          // The fatbike kid and the beer bikes always have something to say, and so does the first cousin of the family; everyone else now and then.
          const talks = def.summoned ? this.familyLine[e.side] : def.rider || def.toss ? true : this.random() < 0.35;
          if (def.summoned) this.familyLine[e.side] = false;
          if (cries.length > 0 && talks) {
            const row = def.rider ? RIDER_ROW : 1;
            this.say(GATE_X[e.side] + dirOf(e.side) * 30, rowY(row) - 150, this.pick(cries), '#fffdf5', 1.4, 20);
          }
          break;
        }
        case 'hit': {
          const v = this.units.get(e.id);
          if (v) {
            v.hitTime = 0;
            v.flash = 1;
            this.puffs.push({ x: v.x + dirOf(v.side) * 14, y: rowY(v.row) - 55, age: 0, life: 0.25, color: '#fff7d6', size: 16 });
          }
          break;
        }
        case 'toss': {
          // One of the party throws a beer, or a cousin sends a voice message: an arm goes, and the unit carries on with whatever it was doing.
          const v = this.units.get(e.id);
          if (!v) break;
          v.tossTime = 0;
          const lines = linesFor('tossing', v.def.id);
          const last = this.tossShout.get(e.id);
          if (lines.length > 0 && (last === undefined || (this.time - last > 5 && this.random() < 0.4))) {
            this.tossShout.set(e.id, this.time);
            this.say(v.x, rowY(v.row) - 190, this.pick(lines), '#fffdf5', 1.3, 22);
          }
          break;
        }
        case 'glance': {
          // A turret's shot bounces off: the shield shudders and sparks, and nobody is hurt much.
          const v = this.units.get(e.id);
          if (v) {
            v.hitTime = 0;
            const y = rowY(v.row) - 40 - this.random() * 70;
            this.puffs.push({ x: v.x + dirOf(v.side) * 22, y, age: 0, life: 0.22, color: '#cfe6ff', size: 20 });
            this.puffs.push({ x: v.x + dirOf(v.side) * 30, y: y - 6, age: -0.04, life: 0.18, color: '#ffffff', size: 10 });
          }
          break;
        }
        case 'defeat': {
          const v = this.units.get(e.id);
          if (!v) break;
          this.units.delete(e.id);
          this.ghosts.push({ side: v.side, def: v.def, row: v.row, x: v.x, puppet: v.puppet, travelled: 0, age: 0 });
          if (v.puppet) v.puppet.blend = 1;
          // One line per side per tick: a whole rank going down at once should not stack five of them.
          // A unit that was bought over still mutters in its own tongue.
          const lines = linesFor('slinkOff', v.def.id);
          if (!muttered[v.side] && lines.length > 0) {
            muttered[v.side] = true;
            this.say(v.x, rowY(v.row) - 135, this.pick(lines), '#fffdf5', 1.5, 19);
          }
          break;
        }
        case 'gold':
          // Diverted: the bounty leaves the spot where it was earned and flies to whoever is paid.
          if (e.diverted) this.pay(e.side, { x: laneX(e.side, e.pos), y: rowY(1) - 80 }, e.amount);
          else this.say(laneX(e.side, e.pos), rowY(1) - 95, `+${e.amount}`, '#ffd21f', 1.1, 26);
          break;
        case 'diverted': {
          // Whoever collects stands beside the base of the side that is paid, for as long as it lasts.
          const to = other(e.side);
          const owner = s.sides[to];
          const rig = eraOf(owner.faction, owner.era).special.rig ?? '';
          this.bands = this.bands.filter((b) => b.side !== to || b.mode !== 'pop');
          this.bands.push({ side: to, rig, age: 0, life: e.ticks / TPS, mode: 'pop' });
          break;
        }
        case 'hiked': {
          // The estate agent's sign comes down on the base of the side that pays more, and stays while the rent is up.
          const owner = s.sides[other(e.side)];
          const rig = eraOf(owner.faction, owner.era).special.rig ?? '';
          this.bands = this.bands.filter((b) => b.rig !== rig || b.side !== e.side);
          this.bands.push({ side: e.side, rig, age: 0, life: e.ticks / TPS, mode: 'drop' });
          // It lands with a thud.
          const x = GATE_X[e.side] + dirOf(e.side) * BAND_SPOT.dx;
          this.puffs.push({ x, y: GROUND_Y + BAND_SPOT.dy, age: -DROP_SECONDS, life: 0.4, color: '#fffdf5', size: 50 });
          this.say(x, GROUND_Y + BAND_SPOT.dy - 230, NL.shout.hiked, '#ff7a66', 1.8, 30, DROP_SECONDS);
          break;
        }
        case 'scattered': {
          // The umbrella is down: a puff where she stood, and her group asks where everyone went.
          const x = laneX(e.side, e.pos);
          this.puffs.push({ x, y: rowY(1) - 70, age: 0, life: 0.35, color: '#fffdf5', size: 40 });
          const first = s.sides[e.side].units.find((u) => u.id === e.ids[0]);
          const lines = first ? linesFor('battleCry', first.def) : [];
          if (lines.length > 0) this.say(x, rowY(1) - 160, this.pick(lines), '#fffdf5', 1.6, 21, 0.3);
          break;
        }
        case 'recalled': {
          // The ship's horn: everyone who is still ashore runs back to the gate, and one of them says why.
          let said = false;
          for (const id of e.ids) {
            const v = this.units.get(id);
            if (!v) continue;
            this.units.delete(id);
            this.ghosts.push({ side: v.side, def: v.def, row: v.row, x: v.x, puppet: v.puppet, travelled: 0, age: 0 });
            if (v.puppet) v.puppet.blend = 1;
            const lines = linesFor('slinkOff', v.def.id);
            if (!said && lines.length > 0) {
              said = true;
              this.say(v.x, rowY(v.row) - 140, this.pick(lines), '#ffd21f', 1.6, 26);
            }
          }
          break;
        }
        case 'skimmed':
          // The other side's income, straight out of their purse.
          this.pay(e.side, purseSpot(other(e.side)), e.amount);
          break;
        case 'baseHit':
          this.baseFlash[e.side] = 1;
          this.shake = Math.min(6, this.shake + 1.2);
          break;
        case 'rammed': {
          // The fatbike goes straight through someone: a puff where they stood.
          const x = laneX(e.side, e.pos);
          this.puffs.push({ x, y: rowY(RIDER_ROW) - 50, age: 0, life: 0.25, color: '#fff7d6', size: 22 });
          this.shake = Math.min(6, this.shake + 0.8);
          // And he lets them know, at the first one and then once a second or so.
          const rider = s.sides[e.side].riders.find((r) => r.id === e.id);
          const lines = rider ? linesFor('riding', rider.def) : [];
          const last = this.riderShout.get(e.id);
          if (lines.length > 0 && (last === undefined || this.time - last > 1.1)) {
            this.riderShout.set(e.id, this.time);
            this.say(x, rowY(RIDER_ROW) - 150, this.pick(lines), '#fffdf5', 1.2, 22);
          }
          break;
        }
        case 'crashed': {
          // Into a door: a big bang, and that is the end of the ride.
          const x = laneX(e.side, e.pos);
          this.puffs.push({ x, y: rowY(RIDER_ROW) - 60, age: 0, life: 0.4, color: '#ffffff', size: 44 });
          this.puffs.push({ x, y: rowY(RIDER_ROW) - 40, age: -0.05, life: 0.35, color: '#c9822b', size: 26 });
          this.shake = Math.min(8, this.shake + 3);
          break;
        }
        case 'arrived': {
          // Straight into the enemy base.
          const x = GATE_X[other(e.side)];
          this.puffs.push({ x, y: rowY(RIDER_ROW) - 70, age: 0, life: 0.45, color: '#ffffff', size: 56 });
          this.puffs.push({ x, y: rowY(RIDER_ROW) - 50, age: -0.06, life: 0.4, color: '#ffd21f', size: 30 });
          this.shake = Math.min(9, this.shake + 4);
          break;
        }
        case 'turretFire': {
          const t = this.turrets[e.side][e.slot];
          if (t) t.fired = 0;
          break;
        }
        case 'turretBuilt': {
          const spot = this.turretSpot(s, e.side, e.slot);
          for (let i = 0; i < 5; i++) {
            this.puffs.push({ x: spot.x + (this.random() - 0.5) * 150, y: spot.y - 20 - this.random() * 110, age: -i * 0.04, life: 0.4, color: '#fffdf5', size: 26 });
          }
          if (e.how === 'upgrade') this.say(spot.x, spot.y - 150, `${NL.shout.upgraded} ${'★'.repeat(e.level)}`, '#ffd21f', 1.3, 24);
          break;
        }
        case 'subsidy':
          this.say(GATE_X[e.side] - dirOf(e.side) * 150, GROUND_Y - 330, NL.shout.subsidy, '#ffd21f', 1.6, 26);
          break;
        case 'eraUp': {
          const state = s.sides[e.side];
          const era = eraOf(state.faction, state.era);
          this.eraFlash[e.side] = 1;
          this.shake = Math.min(8, this.shake + 4);
          // The old farm or house vanishes in a cloud and the new one stands there.
          for (let i = 0; i < 16; i++) {
            this.puffs.push({
              x: GATE_X[e.side] - dirOf(e.side) * (20 + this.random() * 290),
              y: GROUND_Y - 30 - this.random() * 470,
              age: -this.random() * 0.25,
              life: 0.55 + this.random() * 0.3,
              color: i % 3 === 0 ? '#ffd21f' : '#fffdf5',
              size: 34 + this.random() * 26,
            });
          }
          this.say(GATE_X[e.side] + dirOf(e.side) * 250, rowY(0) - 250, `${NL.shout.modern} ${NL.era[era.key] ?? era.year}!`, '#ffd21f', 2.4, 40);
          break;
        }
        case 'stunned': {
          // The blockade sits just in front of the foremost unit it stopped.
          let front = -1;
          for (const u of s.sides[e.side].units) if (e.ids.includes(u.id)) front = Math.max(front, u.pos);
          const owner = s.sides[other(e.side)];
          const special = eraOf(owner.faction, owner.era).special;
          const rig = special.rig ?? '';
          // De winter van '63: whoever it stops freezes over and slips.
          if (special.kind === 'stun' && special.look === 'ice') {
            for (const id of e.ids) {
              const v = this.units.get(id);
              if (v) v.icyUntil = this.time + e.ticks / TPS;
            }
          }
          if (front >= 0) {
            this.blockades.push({ side: e.side, rig, x: laneX(e.side, front) + dirOf(e.side) * 46, age: 0, life: e.ticks / TPS });
          }
          break;
        }
        case 'summoned': {
          // The group chat lights up beside the base while the family comes out.
          const state = s.sides[e.side];
          const rig = eraOf(state.faction, state.era).special.rig ?? '';
          if (e.ticks > 0) {
            // A cruise ship slides in behind the base and stays until the horn, then leaves.
            this.bands = this.bands.filter((b) => b.side !== e.side || b.mode !== 'dock');
            this.bands.push({ side: e.side, rig, age: 0, life: e.ticks / TPS + DOCK_SECONDS, mode: 'dock' });
          } else {
            this.bands = this.bands.filter((b) => b.side !== e.side || b.mode !== 'pop');
            this.bands.push({ side: e.side, rig, age: 0, life: 2.5, mode: 'pop' });
          }
          this.familyLine[e.side] = true;
          break;
        }
        case 'buffed': {
          const state = s.sides[e.side];
          const rig = eraOf(state.faction, state.era).special.rig ?? '';
          this.bands = this.bands.filter((b) => b.side !== e.side || b.mode !== 'pop');
          this.bands.push({ side: e.side, rig, age: 0, life: e.ticks / TPS, mode: 'pop' });
          this.noteIn[e.side] = 0;
          break;
        }
        case 'healed': {
          const state = s.sides[e.side];
          const rig = eraOf(state.faction, state.era).special.rig ?? '';
          for (const id of e.ids) {
            const v = this.units.get(id);
            if (!v) continue;
            // A few hearts per unit, one after another.
            for (let i = 0; i < 3; i++) {
              const x = v.x + (this.random() - 0.5) * 40;
              this.sprites.push({
                rig, side: e.side, x0: x, y0: rowY(v.row) - 70, x1: x + (this.random() - 0.5) * 30, y1: rowY(v.row) - 190,
                scale: 0.8 + this.random() * 0.4, age: -i * 0.22, life: 1.0, hold: 0, ease: 'rise', puff: '', landed: false,
              });
            }
          }
          break;
        }
        case 'shrugged': {
          // A super unit lets everyone know the special did nothing to it.
          const line = NL.shout.unmoved[s.sides[e.side].faction] ?? '';
          for (const id of e.ids) {
            const v = this.units.get(id);
            // A beat after the special's own name, so the two do not land on top of each other.
            if (v && line) this.say(v.x, rowY(v.row) - 265, line, '#fffdf5', 1.8, 26, 0.8);
          }
          break;
        }
        case 'converted': {
          // The deal is stamped onto the unit, which from now on wears the buyer's badge.
          const owner = s.sides[e.side];
          const rig = eraOf(owner.faction, owner.era).special.rig ?? '';
          // It may have been moved to its new side's front line: the stamp lands where it stands now.
          const unit = owner.units.find((u) => u.id === e.id);
          const x = laneX(e.side, e.pos - unitDef(e.def).len / 2);
          const y = rowY(unit ? unit.row : 1) + STRIKE_Y - 15;
          this.sprites.push({ rig, side: e.side, x0: x, y0: y - 420, x1: x, y1: y, scale: 1.2, age: 0, life: 0.2, hold: 0.9, ease: 'drop', puff: '#ffd21f', landed: false });
          this.say(x, y - 70, NL.shout.bought, '#ffd21f', 1.6, 34);
          break;
        }
        case 'sniped': {
          // The verdict drops out of the sky onto whoever the algorithm picked.
          const owner = s.sides[other(e.side)];
          const rig = eraOf(owner.faction, owner.era).special.rig ?? '';
          const v = this.units.get(e.id);
          const x = v ? v.x : laneX(e.side, e.pos);
          const y = rowY(v ? v.row : 1) + STRIKE_Y - 15;
          // With more than one cancelled, the verdicts come down one after another.
          const delay = cancelled * 0.09;
          this.sprites.push({ rig, side: other(e.side), x0: x, y0: y - 420, x1: x, y1: y, scale: cancelled === 0 ? 1.25 : 0.9, age: -delay, life: 0.2, hold: 0.9, ease: 'drop', puff: '#ff7a66', landed: false });
          if (cancelled === 0) this.say(x, y - 70, NL.shout.cancelled, '#ff7a66', 1.6, 34);
          cancelled++;
          break;
        }
        case 'barrageHit': {
          // One drone leaves the formation and dives.
          const swarm = this.swarms.find((w) => w.side === other(e.side));
          const v = e.id === BASE ? undefined : this.units.get(e.id);
          const x = v ? v.x : e.id === BASE ? GATE_X[e.side] - dirOf(e.side) * 60 : laneX(e.side, e.pos);
          const y = rowY(v ? v.row : 1) + STRIKE_Y;
          const from = swarm ?? { x: x - dirOf(e.side) * 160, y: GROUND_Y + SWARM_Y, rig: '' };
          this.sprites.push({ rig: from.rig, side: other(e.side), x0: from.x, y0: from.y, x1: x, y1: y, scale: 1, age: 0, life: 0.16, hold: 0, ease: 'drop', puff: '#b6d24a', landed: false });
          break;
        }
        case 'vaulted': {
          // Up and over: the leap is drawn from where it took off, and it lands in a heap.
          const v = this.units.get(e.id);
          if (!v) break;
          v.leap = 0;
          v.leapDx = (e.to - e.from) / SUB;
          v.dazedUntil = this.time + (v.def.vault?.dazeTicks ?? 0) / TPS;
          this.say(v.x, rowY(v.row) - 175, NL.shout.vault, '#fffdf5', 1.0, 26);
          break;
        }
        case 'braked': {
          const v = this.units.get(e.id);
          if (!v) break;
          v.dazedUntil = this.time + (v.def.charge?.dazeTicks ?? 0) / TPS;
          this.shake = Math.min(6, this.shake + 2);
          this.puffs.push({ x: v.x + dirOf(v.side) * 30, y: rowY(v.row) - 50, age: 0, life: 0.3, color: '#fffdf5', size: 34 });
          this.say(v.x, rowY(v.row) - 165, NL.shout.braked, '#ffd21f', 1.0, 28);
          break;
        }
        case 'shoved': {
          // It slides back to where it now stands instead of jumping there.
          const v = this.units.get(e.id);
          if (v) v.slide += (dirOf(e.side) * (e.from - e.to)) / SUB;
          break;
        }
        case 'served': {
          // A puff of steam from the pan, and a few of those she fed look the better for it.
          const cook = this.units.get(e.id);
          if (cook) this.puffs.push({ x: cook.x, y: rowY(cook.row) - 95, age: 0, life: 0.5, color: '#fffdf5', size: 18 });
          for (const id of e.ids.slice(0, 3)) {
            const v = this.units.get(id);
            if (v) this.say(v.x + (this.random() - 0.5) * 20, rowY(v.row) - 120, '+', '#7fd35b', 0.7, 24);
          }
          break;
        }
        case 'revived': {
          // The broom wagon pulls up beside the base while the dropouts climb out.
          const state = s.sides[e.side];
          const rig = eraOf(state.faction, state.era).special.rig ?? '';
          this.bands = this.bands.filter((b) => b.side !== e.side || b.mode !== 'pop');
          this.bands.push({ side: e.side, rig, age: 0, life: 2.5, mode: 'pop' });
          // Said at the gate, under the special's own name, which goes up higher.
          this.say(GATE_X[e.side] + dirOf(e.side) * 120, rowY(0) - 120, NL.shout.revived, '#fffdf5', 1.8, 26, 0.4);
          break;
        }
        case 'siesta': {
          // The sign comes down beside the base whose turrets stop work, as the rent increase does.
          const owner = s.sides[other(e.side)];
          const rig = eraOf(owner.faction, owner.era).special.rig ?? '';
          this.bands = this.bands.filter((b) => b.rig !== rig || b.side !== e.side);
          this.bands.push({ side: e.side, rig, age: 0, life: e.ticks / TPS, mode: 'drop' });
          const x = GATE_X[e.side] + dirOf(e.side) * BAND_SPOT.dx;
          this.puffs.push({ x, y: GROUND_Y + BAND_SPOT.dy, age: -DROP_SECONDS, life: 0.4, color: '#fffdf5', size: 50 });
          this.say(x, GROUND_Y + BAND_SPOT.dy - 230, NL.shout.siesta, '#ffb347', 1.8, 30, DROP_SECONDS);
          this.zzzIn[e.side] = DROP_SECONDS;
          break;
        }
        case 'mended': {
          // Lab meat growing back, or a combine that ate: a green number, now and then.
          const v = this.units.get(e.id);
          if (v && this.random() < 0.5) this.say(v.x, rowY(v.row) - 135, `+${e.amount}`, '#7fd35b', 0.8, 22);
          break;
        }
        case 'returned': {
          const v = this.units.get(e.id);
          if (v) this.say(v.x, rowY(v.row) - 160, NL.shout.returned, '#ffd21f', 0.9, 26);
          break;
        }
        case 'conga': {
          // Pulled into the line: a note and a burst of streamers as it turns round.
          const v = this.units.get(e.id);
          if (!v) break;
          this.puffs.push({ x: v.x, y: rowY(v.row) - 80, age: 0, life: 0.3, color: this.pick(CONFETTI), size: 18 });
          if (this.time - this.congaSaid[e.side] > 1) {
            this.congaSaid[e.side] = this.time;
            this.say(v.x, rowY(v.row) - 150, NL.shout.conga, '#ffd21f', 1.2, 24);
          }
          break;
        }
        case 'blinded': {
          // The row of cannons pops up beside the base, and eleven bursts of confetti fly into the enemy's faces.
          const to = other(e.side);
          const owner = s.sides[to];
          const era = eraOf(owner.faction, owner.era);
          const rig = era.special.rig ?? '';
          this.bands = this.bands.filter((b) => b.side !== to || b.mode !== 'pop');
          this.bands.push({ side: to, rig, age: 0, life: e.ticks / TPS, mode: 'pop' });
          const from = this.marker(to, 'muzzle');
          const confetti = era.units[1]?.shot?.rig ?? '';
          const faces = e.ids.flatMap((id) => this.units.get(id) ?? []);
          for (let i = 0; i < 11 && faces.length > 0; i++) {
            const v = faces[i % faces.length]!;
            const y = rowY(v.row) - 100 * rowScale(v.row);
            this.sprites.push({
              rig: confetti, side: to, x0: from.x, y0: from.y, x1: v.x + (this.random() - 0.5) * 24, y1: y, scale: 1.1,
              age: -i * 0.09, life: 0.42, hold: 0.15, ease: 'drop', puff: this.pick(CONFETTI), landed: false,
            });
          }
          break;
        }
        case 'slowed': {
          // The morning after: grey clouds over whoever is hung over, raining herring.
          const owner = s.sides[other(e.side)];
          const rig = eraOf(owner.faction, owner.era).special.rig ?? '';
          this.hangovers = this.hangovers.filter((h) => h.side !== e.side);
          this.hangovers.push({ side: e.side, rig, age: 0, life: e.ticks / TPS });
          const first = this.units.get(e.ids[0] ?? -1);
          if (first) this.say(first.x, rowY(first.row) - 170, NL.shout.slowed, '#cfd8dc', 1.6, 28, 0.6);
          break;
        }
        case 'boomed': {
          // A turret shot off the big drum: BOEM, and notes over the band that marches to it.
          const v = this.units.get(e.id);
          if (!v) break;
          const last = this.boomSaid.get(e.id);
          if (last === undefined || this.time - last > 1.4) {
            this.boomSaid.set(e.id, this.time);
            this.say(v.x + dirOf(v.side) * 20, rowY(v.row) - 150, NL.shout.boomed, '#ffd21f', 0.8, 30);
          }
          this.puffs.push({ x: v.x + dirOf(v.side) * 26, y: rowY(v.row) - 70, age: 0, life: 0.25, color: '#fff3c4', size: 30 });
          break;
        }
        case 'peeled': {
          // Down goes the banana, and there is his peel.
          const x = laneX(e.side, e.pos);
          const peel = s.sides[e.side].peels.find((p) => p.id === e.peel);
          this.puffs.push({ x, y: rowY(peel ? peel.row : 1) - 8, age: 0, life: 0.3, color: '#f6e27a', size: 16 });
          break;
        }
        case 'slipped': {
          const v = this.units.get(e.id);
          if (!v) break;
          v.slipFrom = this.time;
          v.slipUntil = this.time + e.ticks / TPS;
          v.dazedUntil = v.slipUntil;
          this.shake = Math.min(6, this.shake + 2);
          this.puffs.push({ x: v.x, y: rowY(v.row) - 6, age: 0.08, life: 0.35, color: '#fffdf5', size: 30 });
          this.say(v.x, rowY(v.row) - 150, NL.shout.slipped, '#ffd21f', 1.2, 26);
          break;
        }
        case 'dropped': {
          // The speakers go: the box jumps, and the ground with it.
          const v = this.units.get(e.id);
          if (!v) break;
          v.trickTime = 0;
          this.shake = Math.min(6, this.shake + 2.5);
          this.say(v.x + dirOf(v.side) * 40, rowY(v.row) - 150, NL.shout.dropped, '#ff7ad9', 1.0, 34);
          for (let i = 0; i < 4; i++) {
            this.puffs.push({ x: v.x + dirOf(v.side) * (60 + i * 40), y: rowY(v.row) - 60 - this.random() * 50, age: -i * 0.05, life: 0.3, color: this.pick(CONFETTI), size: 14 });
          }
          break;
        }
        case 'partied': {
          for (const id of e.ids) {
            const v = this.units.get(id);
            if (v) v.partyUntil = this.time + e.ticks / TPS;
          }
          break;
        }
        case 'keyed': {
          // The prince holds up the key, and it flies to the enemy turret he takes over.
          const v = this.units.get(e.id);
          const spot = this.turretSpot(s, other(e.side), e.slot);
          const rig = v?.def.keys?.rig ?? '';
          if (v) {
            v.trickTime = 0;
            this.say(v.x, rowY(v.row) - 270, NL.shout.keyed, '#ffd21f', 1.8, 30);
          }
          const from = v ? { x: v.x, y: rowY(v.row) - 240 } : { x: spot.x, y: spot.y - 400 };
          this.sprites.push({ rig, side: e.side, x0: from.x, y0: from.y, x1: spot.x, y1: spot.y - 150, scale: 1, age: -0.1, life: KEY_FLIGHT - 0.1, hold: 0.25, ease: 'drop', puff: '#ffd21f', landed: false });
          break;
        }
        case 'unkeyed': {
          const spot = this.turretSpot(s, e.side, e.slot);
          this.puffs.push({ x: spot.x, y: spot.y - 120, age: 0, life: 0.35, color: '#ffd21f', size: 26 });
          break;
        }
        case 'special':
          this.shake = Math.min(8, this.shake + 3);
          this.say(GATE_X[e.side] + dirOf(e.side) * 330, rowY(0) - 210, `${nameOf(e.id).replace(/!$/, '')}!`, '#ffd21f', 1.8, 44);
          break;
        case 'overtime':
          this.overtime = 0;
          break;
        default:
          break;
      }
    }
  }

  /**
   * Where money lands that is paid to `side` instead of to whoever earned it:
   * the spot its special's drawing marks as `slot` (the open case of the Succesfee), beside its base.
   */
  private slot(side: Side): { x: number; y: number } {
    return this.marker(side, 'slot');
  }

  /**
   * A marker in the drawing of the scene that stands beside `side`'s base
   * (see Band), in stage coordinates: where the Succesfee's money goes in, where
   * the confetti of Elf Kanonschoten comes out. Without one, a spot above the scene.
   */
  private marker(side: Side, name: string): { x: number; y: number } {
    const x = GATE_X[side] + dirOf(side) * BAND_SPOT.dx;
    const y = GROUND_Y + BAND_SPOT.dy;
    const band = this.bands.find((b) => b.side === side && b.mode === 'pop');
    const rig = band ? this.rigOf(band.rig) : undefined;
    const m = rig?.mounts[name];
    const part = rig && m ? rig.parts[m.part] : undefined;
    return part && m ? { x: x + dirOf(side) * (part.x + m.x), y: y + part.y + m.y } : { x, y: y - 100 };
  }

  /** Money that was earned by one side and is paid to the other: coins fly from `from` to where `to` collects, and the sum shows when they land. */
  private pay(to: Side, from: { x: number; y: number }, amount: number): void {
    const slot = this.slot(to);
    const count = Math.min(8, 3 + Math.floor(amount / 40));
    const life = 0.7;
    for (let i = 0; i < count; i++) {
      this.coins.push({
        x0: from.x + (this.random() - 0.5) * 50,
        y0: from.y + (this.random() - 0.5) * 24,
        x1: slot.x,
        y1: slot.y,
        arc: 150 + this.random() * 120,
        age: -i * 0.055,
        life,
        turn: this.random() * 6,
      });
    }
    // The sum shows beside whoever collects, on the side of the base and clear of the special's own name, once the
    // first coin is in. Sums that come in together are stacked, so an income and a bounty can both be read.
    this.paid = (this.paid + 1) % 3;
    this.say(slot.x - dirOf(to) * 94 + (this.random() - 0.5) * 30, slot.y - 62 - this.paid * 26, `+${amount}`, '#ffd21f', 1.1, 28, life);
  }

  /** Floats a line of text up from a spot. With `delay` it appears that many seconds later. */
  private say(x: number, y: number, text: string, color: string, life: number, size: number, delay = 0): void {
    // A name may carry a soft hyphen, where its button may break it; on the field it is said in one go.
    this.floaters.push({ x, y, text: text.replaceAll('\u00ad', ''), color, age: -delay, life, size });
  }

  /** Call every frame. `alpha` is how far we are between the last tick and the next (0..1). */
  update(s: SimState, alpha: number, dt: number): void {
    this.time += dt;
    this.updateUnits(s, alpha, dt);
    this.updateGhosts(dt);
    this.updateTurrets(s, dt);
    this.updateShots(s, alpha);

    for (const f of this.floaters) f.age += dt;
    this.floaters = this.floaters.filter((f) => f.age < f.life);
    for (const p of this.puffs) p.age += dt;
    this.puffs = this.puffs.filter((p) => p.age < p.life);
    for (const b of this.blockades) b.age += dt;
    this.blockades = this.blockades.filter((b) => b.age < b.life);
    this.updateBands(s, dt);
    this.updateSiesta(s, dt);
    this.updateParty(dt);
    this.updatePeels(s);
    for (const h of this.hangovers) h.age += dt;
    this.hangovers = this.hangovers.filter((h) => h.age < h.life);
    this.updateSwarms(s, dt);
    this.updateSprites(dt);
    this.updateCoins(dt);

    for (const side of SIDES) {
      this.baseFlash[side] = Math.max(0, this.baseFlash[side] - dt * 4);
      this.eraFlash[side] = Math.max(0, this.eraFlash[side] - dt * 1.6);
    }
    this.shake = Math.max(0, this.shake - dt * 14);
    if (this.overtime >= 0) this.overtime += dt;
  }

  /** While the band plays, notes float up from the units it fires up. */
  private updateBands(s: SimState, dt: number): void {
    for (const b of this.bands) b.age += dt;
    this.bands = this.bands.filter((b) => b.age < b.life);
    for (const side of SIDES) {
      if (s.sides[side].buffUntil <= s.tick) continue;
      this.noteIn[side] -= dt;
      if (this.noteIn[side] > 0) continue;
      this.noteIn[side] = 0.16;
      const mine = [...this.units.values()].filter((v) => v.side === side);
      if (mine.length === 0) continue;
      const v = this.pick(mine);
      this.say(v.x + (this.random() - 0.5) * 30, rowY(v.row) - 120, this.random() < 0.5 ? '♪' : '♫', '#ffd21f', 0.8, 30);
    }
  }

  /** Notes rise over the units that party or dance, now and then one. */
  private updateParty(dt: number): void {
    this.partyIn -= dt;
    if (this.partyIn > 0) return;
    this.partyIn = 0.22;
    const merry = [...this.units.values()].filter((v) => v.partying || v.dancing);
    if (merry.length === 0) return;
    const v = this.pick(merry);
    this.say(v.x + (this.random() - 0.5) * 30, rowY(v.row) - 125, this.random() < 0.5 ? '♪' : '♫', this.pick(CONFETTI), 0.8, 28);
  }

  /** The banana peels on the road, where the renderer draws them. */
  private updatePeels(s: SimState): void {
    this.peels.length = 0;
    for (const side of SIDES) {
      for (const p of s.sides[side].peels) this.peels.push({ side, rig: p.rig, x: laneX(side, p.pos), row: p.row });
    }
  }

  /** During a Tropenrooster the turrets of the side that stopped work snore. */
  private updateSiesta(s: SimState, dt: number): void {
    for (const side of SIDES) {
      const state = s.sides[side];
      if (state.siestaUntil <= s.tick) continue;
      this.zzzIn[side] -= dt;
      if (this.zzzIn[side] > 0) continue;
      this.zzzIn[side] = 0.9;
      state.turrets.forEach((t, slot) => {
        if (!t) return;
        const spot = this.turretSpot(s, side, slot);
        this.say(spot.x + dirOf(side) * (10 + this.random() * 40), spot.y - 110, 'Zzz', '#bfe3ff', 1.3, 26);
      });
    }
  }

  /** A swarm glides to wherever the foremost enemy is, or to the enemy's gate when the lane is empty. */
  private updateSwarms(s: SimState, dt: number): void {
    const seen = new Set<number>();
    this.swarms.length = 0;
    for (const b of s.barrages) {
      seen.add(b.id);
      const foe = other(b.side);
      const target = frontUnit(s.sides[foe].units);
      const v = target ? this.units.get(target.id) : undefined;
      const want = v ? v.x : GATE_X[foe] - dirOf(foe) * 60;
      const from = this.hover.get(b.id) ?? GATE_X[b.side];
      const x = from + (want - from) * Math.min(1, dt * 7);
      this.hover.set(b.id, x);
      this.swarms.push({ side: b.side, rig: b.rig, x, y: GROUND_Y + SWARM_Y, left: b.left });
    }
    for (const id of this.hover.keys()) if (!seen.has(id)) this.hover.delete(id);
  }

  /** Coins fly; where one lands there is a small glint. */
  private updateCoins(dt: number): void {
    for (const c of this.coins) {
      c.age += dt;
      if (c.age >= c.life) this.puffs.push({ x: c.x1, y: c.y1, age: 0, life: 0.2, color: '#ffd21f', size: 9 });
    }
    this.coins = this.coins.filter((c) => c.age < c.life);
  }

  private updateSprites(dt: number): void {
    for (const sp of this.sprites) {
      sp.age += dt;
      if (!sp.landed && sp.age >= sp.life) {
        sp.landed = true;
        if (sp.puff) {
          this.puffs.push({ x: sp.x1, y: sp.y1, age: 0, life: 0.35, color: sp.puff, size: 30 * sp.scale });
          this.shake = Math.min(6, this.shake + 1.5);
        }
      }
    }
    this.sprites = this.sprites.filter((sp) => sp.age < sp.life + sp.hold);
  }

  private updateUnits(s: SimState, alpha: number, dt: number): void {
    const seen = new Set<number>();
    for (const side of SIDES) {
      // Whoever poses this side's units, and the frame drawn over them while they do.
      const poser = s.sides[other(side)].units.map((u) => unitDef(u.def).poser).find((p) => p !== undefined);
      // A rider is drawn like a unit that is always on the move.
      const riders = s.sides[side].riders.map((r): Unit => ({ ...r, act: 'walk', actTick: 0, stunUntil: 0, turncoat: false, posing: false, leaveAt: 0, tossAt: 0 }));
      for (const u of [...s.sides[side].units, ...riders]) {
        seen.add(u.id);
        const def = unitDef(u.def);
        const px = (u.prevPos + (u.pos - u.prevPos) * alpha) / SUB;
        let v = this.units.get(u.id);
        if (!v) {
          v = {
            id: u.id,
            side,
            def,
            row: u.row,
            x: 0,
            puppet: makePuppet(this.rigOf(def.rig), def.rig),
            act: u.act,
            age: 0,
            travelled: 0,
            lastPx: px,
            idleTime: this.random() * 3,
            hitTime: NEVER,
            tossTime: NEVER,
            flash: 0,
            hp: u.hp,
            stunned: false,
            turncoat: u.turncoat,
            slide: 0,
            pose: '',
            leap: NEVER,
            leapDx: 0,
            dazedUntil: 0,
            icyUntil: 0,
            dazed: false,
            icy: false,
            sticky: false,
            facing: 1,
            dancing: false,
            partyUntil: 0,
            partying: false,
            slipFrom: 0,
            slipUntil: 0,
            blind: false,
            slowed: false,
            trickTime: NEVER,
          };
          this.units.set(u.id, v);
        }
        const x = GATE_X[side] + dirOf(side) * (px - def.len / SUB / 2);
        if (v.side !== side) {
          // Bought over: it turns round and, if it was moved, slides to its new spot instead of jumping there.
          v.slide = v.x + v.slide - x;
          v.side = side;
          v.lastPx = px;
          v.turncoat = u.turncoat;
        }
        v.slide *= Math.exp(-dt * 9);
        if (Math.abs(v.slide) < 0.5) v.slide = 0;
        // Off to its row, and half a row nearer while it overlaps a thrower of its own in that row.
        const wanted = u.row + (passing(u, def, s.sides[side].units) ? 0.5 : 0);
        v.row = wanted + (v.row - wanted) * Math.exp(-dt * 8);
        if (Math.abs(v.row - wanted) < 0.01) v.row = wanted;
        v.age += dt;
        v.dancing = (u.congaUntil ?? 0) > s.tick;
        // A dancer goes backwards, and its feet keep step all the same.
        v.travelled += v.dancing ? Math.abs(px - v.lastPx) : Math.max(0, px - v.lastPx);
        v.lastPx = px;
        v.x = x;
        v.hp = u.hp;
        v.stunned = u.stunUntil > s.tick;
        v.dazed = v.stunned && this.time < v.dazedUntil;
        v.icy = v.stunned && this.time < v.icyUntil;
        v.sticky = (u.stickyUntil ?? 0) > s.tick;
        v.partying = v.stunned && this.time < v.partyUntil;
        v.blind = (u.blindUntil ?? 0) > s.tick;
        v.slowed = (u.slowUntil ?? 0) > s.tick;
        // A pole vaulter that came down beyond the enemy's front faces the thrower it leapt at, and once
        // that one is gone turns round to face whoever it went over. Whoever dances in the enemy's polonaise faces home.
        const foeFront = frontUnit(s.sides[other(side)].units);
        v.facing = v.dancing || (u.vaulted && u.prey === undefined && foeFront && u.pos - def.len > LANE - foeFront.pos) ? -1 : 1;
        if (v.leap < NEVER) v.leap += dt;
        v.pose = u.posing && poser ? poser.rig : '';
        v.flash = Math.max(0, v.flash - dt * 5);
        v.hitTime += dt;
        v.tossTime += dt;
        v.trickTime += dt;
        v.idleTime += dt;

        const p = v.puppet;
        if (p) {
          if (u.act !== v.act) {
            copyPose(p.last, p.from);
            p.blend = 0;
          }
          if (v.leap < LEAP_SECONDS && p.clips.vault) {
            sampleClip(p.clips.vault, v.leap / LEAP_SECONDS, p.rig.index, p.pose);
          } else if (v.dancing) {
            sampleClip(p.clips.walk, (v.travelled / (p.clips.walk.stride ?? 50)) % 1, p.rig.index, p.pose);
          } else if (v.dazed && p.clips.dazed) {
            sampleClip(p.clips.dazed, (v.idleTime / (p.clips.dazed.seconds ?? 1)) % 1, p.rig.index, p.pose);
          } else if (u.act === 'attack') {
            const t = attackTime(p.clips.attack, Math.max(0, u.actTick - 1 + alpha), def.windup, def.recover);
            sampleClip(p.clips.attack, t, p.rig.index, p.pose);
          } else if (u.act === 'walk') {
            sampleClip(p.clips.walk, (v.travelled / (p.clips.walk.stride ?? 50)) % 1, p.rig.index, p.pose);
          } else {
            sampleClip(p.clips.idle, (v.idleTime / (p.clips.idle.seconds ?? 2)) % 1, p.rig.index, p.pose);
          }
          if (p.blend < 1) {
            const t = p.blend * p.blend * (3 - 2 * p.blend);
            lerpPose(p.from, p.pose, t, p.pose);
            p.blend = Math.min(1, p.blend + dt / BLEND_SECONDS);
          }
          copyPose(p.pose, p.last);
          const hitLen = p.clips.hit.seconds ?? 0.3;
          if (v.hitTime < hitLen) {
            sampleClip(p.clips.hit, v.hitTime / hitLen, p.rig.index, p.overlay);
            addPose(p.pose, p.overlay, 1);
          }
          const toss = p.clips.toss;
          const tossLen = toss?.seconds ?? 0.5;
          if (toss && v.tossTime < tossLen) {
            sampleClip(toss, v.tossTime / tossLen, p.rig.index, p.overlay);
            addPose(p.pose, p.overlay, 1);
          }
          // A trick of its own: the beat drop, the key held up.
          const trick = p.clips.trick;
          const trickLen = trick?.seconds ?? 0.6;
          if (trick && v.trickTime < trickLen) {
            sampleClip(trick, v.trickTime / trickLen, p.rig.index, p.overlay);
            addPose(p.pose, p.overlay, 1);
          }
          solve(p.rig, p.pose, p.world);
        }
        v.act = u.act;
      }
    }
    for (const id of this.units.keys()) if (!seen.has(id)) this.units.delete(id);
  }

  /** Beaten units run home and fade. */
  private updateGhosts(dt: number): void {
    for (const g of this.ghosts) {
      g.age += dt;
      const speed = Math.max(90, ((g.def.speed * TPS) / SUB) * 2.4);
      g.x -= dirOf(g.side) * speed * dt;
      g.travelled += speed * dt;
      const p = g.puppet;
      if (p) {
        sampleClip(p.clips.die, (g.travelled / (p.clips.die.stride ?? 60)) % 1, p.rig.index, p.pose);
        solve(p.rig, p.pose, p.world);
      }
    }
    this.ghosts = this.ghosts.filter((g) => g.age < GHOST_LIFE);
  }

  private updateTurrets(s: SimState, dt: number): void {
    for (const side of SIDES) {
      const state = s.sides[side];
      const views = this.turrets[side];
      state.turrets.forEach((turret, slot) => {
        if (!turret) {
          views[slot] = null;
          return;
        }
        // A turret keeps the looks of the era it was bought in until it is bought again.
        const rigId = turretDef(turret.def).rig;
        let view = views[slot];
        if (!view || view.rigId !== rigId) {
          const rig = this.rigOf(rigId);
          if (!rig) {
            views[slot] = null;
            return;
          }
          const clips = CLIPS[rigId];
          view = {
            rigId,
            rig,
            idle: clips?.idle,
            attack: clips?.attack,
            pose: makePose(rig.parts.length),
            world: new Float32Array(rig.parts.length * 6),
            fired: NEVER,
            x: 0,
            y: 0,
            level: 1,
            outdated: false,
            key: '',
            keySince: 0,
          };
          views[slot] = view;
        }
        // Taken over with the key of the city: the key hangs over it, once it has flown there.
        const holder = turret.heldBy === undefined ? undefined : s.sides[other(side)].units.find((u) => u.id === turret.heldBy);
        const key = holder ? (unitDef(holder.def).keys?.rig ?? '') : '';
        if (key && !view.key) view.keySince = this.time;
        view.key = key;
        view.level = turret.level;
        view.outdated = turretEra(state.faction, turret.def) < state.era;
        const spot = this.turretSpot(s, side, slot);
        view.x = spot.x;
        view.y = spot.y;
        view.fired += dt;
        const attackLen = view.attack?.seconds ?? 0;
        if (view.attack && view.fired < attackLen) {
          sampleClip(view.attack, view.fired / attackLen, view.rig.index, view.pose);
        } else if (view.idle) {
          // Two turrets of the same kind should not move in step.
          const offset = slot * 0.37 + side * 0.19;
          sampleClip(view.idle, (this.time / (view.idle.seconds ?? 2) + offset) % 1, view.rig.index, view.pose);
        }
        solve(view.rig, view.pose, view.world);
      });
    }
  }

  /** Where a new shot leaves from: the thrower's hand, the drone, the turret's muzzle. */
  private launchPoint(s: SimState, shot: SimState['shots'][number]): { x: number; y: number } {
    const dir = dirOf(shot.side);
    if (shot.slot >= 0) {
      const t = this.turrets[shot.side][shot.slot];
      if (t && mountPoint(t.rig, t.world, 'muzzle', point)) {
        return { x: t.x + dir * point.x * TURRET_SCALE, y: t.y + point.y * TURRET_SCALE };
      }
      return this.turretSpot(s, shot.side, shot.slot);
    }
    const v = this.units.get(shot.src);
    const p = v?.puppet;
    if (v && p && (mountPoint(p.rig, p.world, 'muzzle', point) || mountPoint(p.rig, p.world, 'hand', point))) {
      const scale = rowScale(v.row);
      return { x: v.x + dir * point.x * scale, y: rowY(v.row) + point.y * scale };
    }
    return { x: laneX(shot.side, shot.origin), y: rowY(shot.row) - 70 };
  }

  private updateShots(s: SimState, alpha: number): void {
    const now = new Map<number, ShotView>();
    this.shots.length = 0;
    for (const shot of s.shots) {
      let from = this.launch.get(shot.id);
      if (!from) {
        from = this.launchPoint(s, shot);
        this.launch.set(shot.id, from);
      }
      const pos = shot.prevPos + (shot.pos - shot.prevPos) * alpha;
      const progress = Math.min(1, Math.max(0, (pos - shot.origin) / shot.dist0));
      const lane = laneX(shot.side, pos);
      const targetY = rowY(shot.row) - 45;
      // It starts exactly where it was thrown from and eases onto the lane as it flies.
      const offX = (from.x - laneX(shot.side, shot.origin)) * (1 - progress);
      const view: ShotView = {
        id: shot.id,
        side: shot.side,
        rig: shot.rig,
        x: lane + offX,
        y: targetY + (from.y - targetY) * (1 - progress) - shot.arc * 4 * progress * (1 - progress),
        // Thrown things tumble, floating things wobble, and a beam that flies flat stays dead straight.
        miss: shot.miss === true,
        angle:
          shot.spin !== 0
            ? this.time * shot.spin * Math.PI * 2 * dirOf(shot.side)
            : shot.arc === 0
              ? 0
              : Math.sin(this.time * 11 + shot.id) * 0.14,
      };
      this.shots.push(view);
      now.set(shot.id, view);
    }
    for (const [id, old] of this.lastShot) {
      if (now.has(id)) continue;
      this.launch.delete(id);
      this.puffs.push({ x: old.x, y: old.y, age: 0, life: 0.3, color: SPLASH[old.rig] ?? '#ffffff', size: 22 });
      // Confetti in the eyes: it came down well behind the enemy. Now and then somebody says so.
      if (old.miss) {
        this.puffs.push({ x: old.x, y: old.y - 10, age: 0.05, life: 0.3, color: this.pick(CONFETTI), size: 12 });
        if (this.random() < 0.3) this.say(old.x, old.y - 50, NL.shout.missed, '#fffdf5', 0.8, 22);
      }
    }
    this.lastShot = now;
  }

  /** How far a special's wave has come, as stage x, for each wave in play. */
  waves(s: SimState, alpha: number): { side: Side; x: number; rig: string; conga: boolean }[] {
    return s.waves.map((w) => ({
      side: w.side,
      rig: w.rig,
      conga: w.conga !== undefined,
      x: laneX(w.side, Math.min(LANE, w.prevPos + (w.pos - w.prevPos) * alpha)),
    }));
  }
}
