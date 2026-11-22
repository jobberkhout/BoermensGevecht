import { CLIPS } from '../anim/clips/index.ts';
import { attackTime, sampleClip } from '../anim/sample.ts';
import type { Clip, ClipSet } from '../anim/types.ts';
import { GATE_X, GROUND_Y, LANE, SUB, TPS } from '../defs/balance.ts';
import { eraOf, specialDef, turretDef, turretEra, unitDef } from '../defs/index.ts';
import type { UnitDef } from '../defs/types.ts';
import { addPose, copyPose, lerpPose, makePose, mountPoint, solve, type Pose } from '../rig/pose.ts';
import type { Rig } from '../rig/raster.ts';
import { frontUnit } from '../sim/lane.ts';
import { BASE, SIDES, other, type Side, type SimEvent, type SimState, type Unit } from '../sim/types.ts';
import { NL, linesFor, nameOf } from '../ui/nl.ts';
import { dirOf, laneX, rowScale, rowY, TURRET_SCALE, TURRET_SPOTS } from './layout.ts';

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
  /** 1 right after a blow, fading to 0. */
  flash: number;
  hp: number;
  stunned: boolean;
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

/** The band of a Høken!, playing next to the farm for as long as the buff lasts. */
export interface Band {
  side: Side;
  rig: string;
  age: number;
  life: number;
}

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

export const GHOST_LIFE = 1.5;
export const SPAWN_FADE = 0.3;
const BLEND_SECONDS = 0.12;
const NEVER = 99;

/** How high above the road a swarm hovers, and where a blow from above lands. */
const SWARM_Y = -250;
const STRIKE_Y = -55;

/** What a projectile leaves behind when it lands. */
const SPLASH: Record<string, string> = {
  shot_bloemen: '#ff9fd0',
  shot_herrie: '#fff27a',
  shot_voederbiet: '#e9a63a',
  shot_deksel: '#c9ced6',
  shot_flatwhite: '#b98a5a',
  shot_geklaag: '#ffffff',
  shot_ei: '#ffd94a',
  shot_spray: '#b6d24a',
  shot_boba: '#8a5a3c',
  shot_dislike: '#ff7a66',
  shot_laser: '#ff6a55',
  shot_melk: '#ffffff',
};

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
  /** Seconds until the next note floats up from a side that is høken. */
  private noteIn: [number, number] = [0, 0];
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
          const cries = linesFor('battleCry', s.sides[e.side].faction, e.def);
          if (cries.length > 0 && this.random() < 0.35) {
            this.say(GATE_X[e.side] + dirOf(e.side) * 30, rowY(1) - 150, this.pick(cries), '#fffdf5', 1.4, 20);
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
        case 'defeat': {
          const v = this.units.get(e.id);
          if (!v) break;
          this.units.delete(e.id);
          this.ghosts.push({ side: v.side, def: v.def, row: v.row, x: v.x, puppet: v.puppet, travelled: 0, age: 0 });
          if (v.puppet) v.puppet.blend = 1;
          // One line per side per tick: a whole rank going down at once should not stack five of them.
          const lines = linesFor('slinkOff', s.sides[v.side].faction, v.def.id);
          if (!muttered[v.side] && lines.length > 0) {
            muttered[v.side] = true;
            this.say(v.x, rowY(v.row) - 135, this.pick(lines), '#fffdf5', 1.5, 19);
          }
          break;
        }
        case 'gold':
          this.say(laneX(e.side, e.pos), rowY(1) - 95, `+${e.amount}`, '#ffd21f', 1.1, 26);
          break;
        case 'baseHit':
          this.baseFlash[e.side] = 1;
          this.shake = Math.min(6, this.shake + 1.2);
          break;
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
          this.say(GATE_X[e.side] + dirOf(e.side) * 250, rowY(0) - 250, `${NL.shout.modern} ${NL.era[era.id] ?? era.year}!`, '#ffd21f', 2.4, 40);
          break;
        }
        case 'stunned': {
          // The blockade sits just in front of the foremost unit it stopped.
          let front = -1;
          for (const u of s.sides[e.side].units) if (e.ids.includes(u.id)) front = Math.max(front, u.pos);
          const owner = s.sides[other(e.side)];
          const rig = eraOf(owner.faction, owner.era).special.rig ?? '';
          if (front >= 0) {
            this.blockades.push({ side: e.side, rig, x: laneX(e.side, front) + dirOf(e.side) * 46, age: 0, life: e.ticks / TPS });
          }
          break;
        }
        case 'buffed': {
          const state = s.sides[e.side];
          const rig = eraOf(state.faction, state.era).special.rig ?? '';
          this.bands = this.bands.filter((b) => b.side !== e.side);
          this.bands.push({ side: e.side, rig, age: 0, life: e.ticks / TPS });
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
        case 'sniped': {
          // The verdict drops out of the sky onto whoever the algorithm picked.
          const owner = s.sides[other(e.side)];
          const rig = eraOf(owner.faction, owner.era).special.rig ?? '';
          const v = this.units.get(e.id);
          const x = v ? v.x : laneX(e.side, e.pos);
          const y = rowY(v ? v.row : 1) + STRIKE_Y - 15;
          // When the outrage spills over to more units, the verdicts come down one after another.
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

  private say(x: number, y: number, text: string, color: string, life: number, size: number): void {
    this.floaters.push({ x, y, text, color, age: 0, life, size });
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
    this.updateSwarms(s, dt);
    this.updateSprites(dt);

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
      for (const u of s.sides[side].units) {
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
            flash: 0,
            hp: u.hp,
            stunned: false,
          };
          this.units.set(u.id, v);
        }
        v.age += dt;
        v.travelled += Math.max(0, px - v.lastPx);
        v.lastPx = px;
        v.x = GATE_X[side] + dirOf(side) * (px - def.len / SUB / 2);
        v.hp = u.hp;
        v.stunned = u.stunUntil > s.tick;
        v.flash = Math.max(0, v.flash - dt * 5);
        v.hitTime += dt;
        v.idleTime += dt;

        const p = v.puppet;
        if (p) {
          if (u.act !== v.act) {
            copyPose(p.last, p.from);
            p.blend = 0;
          }
          if (u.act === 'attack') {
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
          };
          views[slot] = view;
        }
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
        angle:
          shot.spin !== 0
            ? this.time * shot.spin * Math.PI * 2 * dirOf(shot.side)
            : Math.sin(this.time * 11 + shot.id) * 0.14,
      };
      this.shots.push(view);
      now.set(shot.id, view);
    }
    for (const [id, old] of this.lastShot) {
      if (now.has(id)) continue;
      this.launch.delete(id);
      const kind = old.rig.slice(old.rig.lastIndexOf('/') + 1);
      this.puffs.push({ x: old.x, y: old.y, age: 0, life: 0.3, color: SPLASH[kind] ?? '#ffffff', size: 22 });
    }
    this.lastShot = now;
  }

  /** How far a special's wave has come, as stage x, for each wave in play. */
  waves(s: SimState, alpha: number): { side: Side; x: number; rig: string }[] {
    return s.waves.map((w) => ({
      side: w.side,
      rig: w.rig,
      x: laneX(w.side, Math.min(LANE, w.prevPos + (w.pos - w.prevPos) * alpha)),
    }));
  }
}
