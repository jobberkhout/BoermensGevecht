import { CLIPS } from '../anim/clips/index.ts';
import { attackTime, sampleClip } from '../anim/sample.ts';
import type { ClipSet } from '../anim/types.ts';
import { GATE_X, GROUND_Y, LANE, SUB, TPS } from '../defs/balance.ts';
import { unitDef } from '../defs/index.ts';
import type { UnitDef } from '../defs/types.ts';
import { addPose, copyPose, lerpPose, makePose, solve, type Pose } from '../rig/pose.ts';
import type { Rig } from '../rig/raster.ts';
import { SIDES, type Side, type SimEvent, type SimState, type Unit } from '../sim/types.ts';
import { NL, nameOf } from '../ui/nl.ts';
import { dirOf, laneX, rowY, TURRET_SPOTS } from './layout.ts';

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
  /** Radians; shots tumble as they fly. */
  spin: number;
}

export const GHOST_LIFE = 1.5;
const BLEND_SECONDS = 0.12;
const NO_HIT = 99;

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

export class BattleView {
  units = new Map<number, UnitView>();
  ghosts: Ghost[] = [];
  floaters: Floater[] = [];
  puffs: Puff[] = [];
  shots: ShotView[] = [];
  /** 1 right after a base was struck, fading to 0. */
  baseFlash: [number, number] = [0, 0];
  /** 1 right after a turret fired, fading to 0. Indexed [side][slot]. */
  turretKick: number[][] = [[], []];
  /** Seconds the overtime banner has been up, or -1. */
  overtime = -1;
  /** Screen shake strength in pixels, fading out. */
  shake = 0;
  time = 0;

  private lastShot = new Map<number, ShotView>();
  private seed = 12345;

  private readonly rigOf: (id: string) => Rig | undefined;

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

  /** Call once per tick with that tick's events. */
  consume(events: readonly SimEvent[], s: SimState): void {
    for (const e of events) {
      switch (e.t) {
        case 'spawn': {
          if (this.random() < 0.35) {
            const faction = s.sides[e.side].faction;
            this.say(GATE_X[e.side] + dirOf(e.side) * 30, rowY(1) - 150, this.pick(NL.battleCry[faction]), '#fffdf5', 1.4, 20);
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
          const faction = s.sides[v.side].faction;
          this.say(v.x, rowY(v.row) - 135, this.pick(NL.slinkOff[faction]), '#fffdf5', 1.5, 19);
          break;
        }
        case 'gold':
          this.say(laneX(e.side, e.pos), rowY(1) - 95, `+${e.amount}`, '#ffd21f', 1.1, 26);
          break;
        case 'baseHit':
          this.baseFlash[e.side] = 1;
          this.shake = Math.min(6, this.shake + 1.2);
          break;
        case 'turretFire':
          this.turretKick[e.side]![e.slot] = 1;
          break;
        case 'stunned':
          for (const id of e.ids) {
            const v = this.units.get(id);
            if (v) v.stunned = true;
          }
          break;
        case 'special':
          this.shake = Math.min(8, this.shake + 3);
          this.say(GATE_X[e.side] + dirOf(e.side) * 330, rowY(0) - 210, `${nameOf(e.id)}!`, '#ffd21f', 1.8, 44);
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
            travelled: 0,
            lastPx: px,
            idleTime: this.random() * 3,
            hitTime: NO_HIT,
            flash: 0,
            hp: u.hp,
            stunned: false,
          };
          this.units.set(u.id, v);
        }
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

    // Beaten units run home and fade.
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

    // Shots, placed along their arc.
    const now = new Map<number, ShotView>();
    this.shots.length = 0;
    for (const shot of s.shots) {
      const pos = shot.prevPos + (shot.pos - shot.prevPos) * alpha;
      const progress = Math.min(1, Math.max(0, (pos - shot.origin) / shot.dist0));
      const groundY = rowY(shot.row);
      const fromY = shot.slot >= 0 ? GROUND_Y + (TURRET_SPOTS[shot.slot]?.dy ?? -200) : groundY - 70;
      const toY = groundY - 45;
      const view: ShotView = {
        id: shot.id,
        side: shot.side,
        rig: shot.rig,
        x: laneX(shot.side, pos),
        y: fromY + (toY - fromY) * progress - shot.arc * 4 * progress * (1 - progress),
        spin: this.time * 9 * dirOf(shot.side),
      };
      this.shots.push(view);
      now.set(shot.id, view);
    }
    for (const [id, old] of this.lastShot) {
      if (!now.has(id)) this.puffs.push({ x: old.x, y: old.y, age: 0, life: 0.3, color: '#ffffff', size: 22 });
    }
    this.lastShot = now;

    for (const f of this.floaters) f.age += dt;
    this.floaters = this.floaters.filter((f) => f.age < f.life);
    for (const p of this.puffs) p.age += dt;
    this.puffs = this.puffs.filter((p) => p.age < p.life);

    for (const side of SIDES) {
      this.baseFlash[side] = Math.max(0, this.baseFlash[side] - dt * 4);
      const kicks = this.turretKick[side]!;
      for (let i = 0; i < kicks.length; i++) kicks[i] = Math.max(0, (kicks[i] ?? 0) - dt * 5);
    }
    this.shake = Math.max(0, this.shake - dt * 14);
    if (this.overtime >= 0) this.overtime += dt;
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
