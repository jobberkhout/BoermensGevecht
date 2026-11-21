import { CLIPS } from '../anim/clips/index.ts';
import { sampleClip } from '../anim/sample.ts';
import type { Clip } from '../anim/types.ts';
import { GATE_X, GROUND_Y, SUB, WORLD_H, WORLD_W } from '../defs/balance.ts';
import { FACTIONS, eraOf } from '../defs/index.ts';
import type { FactionId } from '../defs/types.ts';
import { drawRig, makePose, solve, type Pose } from '../rig/pose.ts';
import { loadImage, openTag, type Rig } from '../rig/raster.ts';
import { SIDES, other, type Side, type SimState } from '../sim/types.ts';
import { forgetRigsExcept, hasRig, loadRig, rigSource } from './assets.ts';
import { dirOf, rowScale, rowY, TURRET_SCALE } from './layout.ts';
import { useWorld, type Stage } from './stage.ts';
import {
  GHOST_LIFE,
  SPAWN_FADE,
  type BattleView,
  type Blockade,
  type Ghost,
  type Puppet,
  type TurretView,
  type UnitView,
} from './view.ts';

/**
 * Draws one frame of the battle. Anything that has art is drawn with its rig;
 * anything that does not yet is drawn as a labelled grey box, so the game stays
 * playable while the art is still being made.
 */

const FONT = 'ui-rounded, "Arial Rounded MT Bold", "Trebuchet MS", system-ui, sans-serif';
const INK = '#2b1b16';

/** The painted backdrop: sky, skyline, fields and the road. */
const SCENERY = 'scenery/2025';
const BLOCKADE = 'havermelk/2025/special_blokkade';

const LOOK: Record<FactionId, { main: string; dark: string; light: string }> = {
  havermelk: { main: '#c8a8f0', dark: '#7d5fb8', light: '#efe3ff' },
  achterhoek: { main: '#2f9140', dark: '#1f5a2a', light: '#a8d98f' },
};

const base6 = new Float32Array(6);

/** Flags fly a little smaller than they are drawn, so they stay clear of the top bar. */
const FLAG_SCALE = 0.85;

/** The grey box that stands in for a base without art. */
const BOX_W = 300;
const BOX_TOP = GROUND_Y - 460;

export class Renderer {
  private readonly stage: Stage;
  private rigs = new Map<string, Rig>();
  private wanted = new Set<string>([BLOCKADE]);
  private scale = 0;
  private background: HTMLCanvasElement | null = null;
  private scenery: HTMLImageElement | null = null;
  private loading = 0;
  /** Scratch space per rig for things drawn in passing, so drawing one does not allocate every frame. */
  private scratch = new WeakMap<Rig, { pose: Pose; world: Float32Array }>();
  /** This frame's screen-shake offset, in real pixels. */
  private ox = 0;
  private oy = 0;

  constructor(stage: Stage) {
    this.stage = stage;
    stage.onResize(() => {
      this.background = null;
      void this.reload();
    });
  }

  /** The loaded rig for an art id, if that art exists and is ready. */
  rig = (id: string): Rig | undefined => this.rigs.get(id);

  /** Makes sure these rigs are loaded at the current screen scale. Art that does not exist is skipped. */
  async prepare(ids: Iterable<string>): Promise<void> {
    for (const id of ids) this.wanted.add(id);
    await this.reload();
  }

  private async reload(): Promise<void> {
    // Above the stage scale, because turret scenes and the nearest row are drawn larger than life.
    const scale = Math.max(0.5, Math.ceil(this.stage.k * TURRET_SCALE * 20) / 20);
    const ticket = ++this.loading;
    const ids = [...this.wanted].filter(hasRig);
    const { width, height } = this.stage.canvas;
    const [loaded, scenery] = await Promise.all([
      Promise.all(ids.map(async (id) => [id, await loadRig(id, scale)] as const)),
      hasRig(SCENERY) ? this.loadScenery(width, height) : null,
    ]);
    if (ticket !== this.loading) return; // a newer resize overtook this one
    this.rigs = new Map(loaded);
    this.scenery = scenery;
    this.background = null;
    if (scale !== this.scale) forgetRigsExcept(scale);
    this.scale = scale;
  }

  /** The backdrop as one picture, rendered by the browser at exactly the canvas size. */
  private loadScenery(width: number, height: number): Promise<HTMLImageElement> {
    const src = rigSource(SCENERY);
    return loadImage(`${openTag(src, width, height)}${src.head}${src.parts.map((part) => part.markup).join('')}</svg>`);
  }

  draw(s: SimState, view: BattleView, alpha: number): void {
    const { ctx, k } = this.stage;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    if (!this.background) this.background = this.paintBackground();
    this.ox = view.shake > 0 ? Math.sin(view.time * 90) * view.shake * k : 0;
    this.oy = view.shake > 0 ? Math.cos(view.time * 70) * view.shake * 0.6 * k : 0;
    ctx.drawImage(this.background, this.ox, this.oy);
    this.world();

    for (const side of SIDES) this.drawBase(s, view, side);

    // Far rows first, so nearer units overlap them.
    const ghosts = [...view.ghosts].sort((a, b) => a.row - b.row);
    for (const g of ghosts) this.drawGhost(g);
    const units = [...view.units.values()].sort((a, b) => a.row - b.row || a.x - b.x);
    for (const v of units) this.drawUnit(v, view.time);

    // The activists sit low, so they go on top: otherwise whoever stands next to them hides them.
    for (const b of view.blockades) this.drawBlockade(b, view.time);
    for (const w of view.waves(s, alpha)) this.drawWave(w.side, w.x, w.rig, view.time);
    this.drawShots(view);
    this.drawEffects(view);
    useWorld(this.stage);
  }

  /** Points the context at stage coordinates, shaken along with everything else. */
  private world(): void {
    const { ctx, k } = this.stage;
    ctx.setTransform(k, 0, 0, k, this.ox, this.oy);
  }

  // ---- drawing rigs -------------------------------------------------------

  private place(x: number, y: number, facing: number, scale: number, angle = 0): void {
    const { k } = this.stage;
    const cos = Math.cos(angle) * k * scale;
    const sin = Math.sin(angle) * k * scale;
    base6.set([cos * facing, sin * facing, -sin, cos, k * x + this.ox, k * y + this.oy]);
  }

  /** Draws a rig whose pose has already been worked out. */
  private drawSolved(rig: Rig, world: Float32Array, x: number, y: number, facing: number, scale: number, angle = 0): void {
    this.place(x, y, facing, scale, angle);
    drawRig(this.stage.ctx, rig, world, base6, 0, facing < 0);
    this.world();
  }

  /** Draws a rig in passing: in its rest pose, or at a moment of one of its clips. */
  private drawLoose(rig: Rig, x: number, y: number, facing: number, scale: number, clip?: Clip, u = 0, angle = 0): void {
    let slot = this.scratch.get(rig);
    if (!slot) {
      slot = { pose: makePose(rig.parts.length), world: new Float32Array(rig.parts.length * 6) };
      this.scratch.set(rig, slot);
    }
    if (clip) sampleClip(clip, u, rig.index, slot.pose);
    solve(rig, slot.pose, slot.world);
    this.drawSolved(rig, slot.world, x, y, facing, scale, angle);
  }

  // ---- scenery ------------------------------------------------------------

  private paintBackground(): HTMLCanvasElement {
    const { canvas, k } = this.stage;
    const bg = document.createElement('canvas');
    bg.width = canvas.width;
    bg.height = canvas.height;
    const c = bg.getContext('2d')!;
    if (this.scenery) {
      c.drawImage(this.scenery, 0, 0, bg.width, bg.height);
      return bg;
    }

    // No scenery art yet: a plain sky, a hint of skyline and hedges, grass and the road.
    c.setTransform(k, 0, 0, k, 0, 0);
    const horizon = GROUND_Y - 92;
    const sky = c.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#9fd3f2');
    sky.addColorStop(1, '#e8f6fb');
    c.fillStyle = sky;
    c.fillRect(0, 0, WORLD_W, horizon + 20);
    c.fillStyle = '#b9c7dc';
    for (let i = 0; i < 9; i++) {
      const x = 40 + i * 88;
      const h = 150 + ((i * 53) % 70);
      c.fillRect(x, horizon - h, 76, h);
      c.beginPath();
      c.moveTo(x, horizon - h);
      c.lineTo(x + 38, horizon - h - 44);
      c.lineTo(x + 76, horizon - h);
      c.fill();
    }
    c.fillStyle = '#9ccf8a';
    for (let i = 0; i < 12; i++) {
      c.beginPath();
      c.arc(1000 + i * 80, horizon, 46 + ((i * 37) % 30), Math.PI, 0);
      c.fill();
    }
    const ground = c.createLinearGradient(0, 0, WORLD_W, 0);
    ground.addColorStop(0, '#b8c4ae');
    ground.addColorStop(0.5, '#9bcb7d');
    ground.addColorStop(1, '#7dbd5f');
    c.fillStyle = ground;
    c.fillRect(0, horizon, WORLD_W, WORLD_H - horizon);
    const road = c.createLinearGradient(0, 0, WORLD_W, 0);
    road.addColorStop(0, '#9a958f');
    road.addColorStop(0.45, '#aaa398');
    road.addColorStop(0.6, '#cdb98a');
    road.addColorStop(1, '#d4bd85');
    c.fillStyle = road;
    c.fillRect(0, GROUND_Y - 52, WORLD_W, 104);
    c.strokeStyle = 'rgba(43,27,22,0.25)';
    c.lineWidth = 3;
    c.strokeRect(-10, GROUND_Y - 52, WORLD_W + 20, 104);
    return bg;
  }

  // ---- bases --------------------------------------------------------------

  private drawBase(s: SimState, view: BattleView, side: Side): void {
    const { ctx } = this.stage;
    const state = s.sides[side];
    const era = eraOf(state.faction, state.era);
    const rig = this.rigs.get(era.baseRig);
    const look = LOOK[state.faction];
    const dir = dirOf(side);
    const gate = GATE_X[side];
    const flash = view.baseFlash[side];
    const flagSpot = view.flagSpot(s, side);

    if (rig) {
      const idle = CLIPS[rig.id]?.idle;
      const u = idle ? (view.time / (idle.seconds ?? 2)) % 1 : 0;
      this.drawLoose(rig, gate, GROUND_Y, dir, 1, idle, u);
      if (flash > 0) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = flash * 0.4;
        this.drawLoose(rig, gate, GROUND_Y, dir, 1, idle, u);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }
    } else {
      // Grey box: a block with a doorway at the gate and a flagpole.
      const x = side === 0 ? gate - BOX_W : gate;
      ctx.fillStyle = look.main;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(x, BOX_TOP, BOX_W, GROUND_Y + 52 - BOX_TOP, 14);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = look.dark;
      ctx.fillRect(gate - (side === 0 ? 46 : 0), GROUND_Y - 140, 46, 192);
      ctx.strokeRect(gate - (side === 0 ? 46 : 0), GROUND_Y - 140, 46, 192);
      ctx.beginPath();
      ctx.moveTo(flagSpot.x, BOX_TOP);
      ctx.lineTo(flagSpot.x, flagSpot.y);
      ctx.stroke();
      if (flash > 0) {
        ctx.globalAlpha = flash * 0.45;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, BOX_TOP, BOX_W, GROUND_Y + 52 - BOX_TOP);
        ctx.globalAlpha = 1;
      }
    }

    const flag = this.rigs.get(FACTIONS[state.faction].flagRig);
    if (flag) {
      const wave = CLIPS[flag.id]?.idle;
      this.drawLoose(flag, flagSpot.x, flagSpot.y, dir, FLAG_SCALE, wave, wave ? ((view.time + side * 0.4) / (wave.seconds ?? 2)) % 1 : 0);
    }

    state.turrets.forEach((turret, slot) => {
      if (!turret) return;
      const t = view.turrets[side][slot];
      if (t) this.drawTurret(t, dir);
      else this.drawTurretBox(view.turretSpot(s, side, slot), dir, look.dark);
    });
  }

  private drawTurret(t: TurretView, dir: number): void {
    this.drawSolved(t.rig, t.world, t.x, t.y, dir, TURRET_SCALE);
  }

  private drawTurretBox(spot: { x: number; y: number }, dir: number, fill: string): void {
    const { ctx } = this.stage;
    ctx.fillStyle = fill;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(spot.x, spot.y - 22, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(spot.x, spot.y - 29, dir * 44, 14);
    ctx.strokeRect(spot.x, spot.y - 29, dir * 44, 14);
  }

  // ---- units --------------------------------------------------------------

  private drawPuppet(p: Puppet, x: number, y: number, facing: number, scale: number): void {
    this.drawSolved(p.rig, p.world, x, y, facing, scale);
  }

  private drawShadow(x: number, y: number, len: number): void {
    const { ctx } = this.stage;
    ctx.fillStyle = 'rgba(43,27,22,0.18)';
    ctx.beginPath();
    ctx.ellipse(x, y + 3, Math.max(18, len * 0.5), 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawBox(x: number, y: number, len: number, height: number, label: string, fill: string): void {
    const { ctx } = this.stage;
    ctx.fillStyle = fill;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x - len / 2, y - height, len, height, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = `700 22px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - height / 2 + 8);
  }

  private drawUnit(v: UnitView, time: number): void {
    const { ctx } = this.stage;
    const y = rowY(v.row);
    const scale = rowScale(v.row);
    const len = v.def.len / SUB;
    const x = v.x + (v.stunned ? Math.sin(time * 45 + v.id) * 1.5 : 0);
    // Fresh units fade in as they come out of the dark doorway.
    const fade = Math.min(1, v.age / SPAWN_FADE);
    ctx.globalAlpha = fade;
    this.drawShadow(x, y, len * scale);
    if (v.stunned) {
      // Glued to the road.
      ctx.fillStyle = '#ffc93c';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(v.x, y + 4, Math.max(26, len * scale * 0.55), 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    if (v.puppet) {
      this.drawPuppet(v.puppet, x, y, dirOf(v.side), scale);
      if (v.flash > 0) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = v.flash * 0.55 * fade;
        this.drawPuppet(v.puppet, x, y, dirOf(v.side), scale);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = fade;
      }
    } else {
      const height = v.def.role === 'heavy' ? 110 : v.def.role === 'ranged' ? 92 : 100;
      const fill = v.flash > 0.3 ? '#ffffff' : v.side === 0 ? '#d9c5f5' : '#a8d98f';
      this.drawBox(x, y, len * scale, height * scale, v.def.role[0]!.toUpperCase(), fill);
    }
    ctx.globalAlpha = 1;

    if (v.hp < v.def.hp) {
      const top = y - (v.def.role === 'heavy' ? 128 : 140) * scale;
      const w = v.def.role === 'heavy' ? 74 : 40;
      ctx.fillStyle = INK;
      ctx.fillRect(x - w / 2 - 2, top - 2, w + 4, 10);
      ctx.fillStyle = '#e5533d';
      ctx.fillRect(x - w / 2, top, w, 6);
      ctx.fillStyle = '#7fd35b';
      ctx.fillRect(x - w / 2, top, w * Math.max(0, v.hp / v.def.hp), 6);
    }
  }

  private drawGhost(g: Ghost): void {
    const { ctx } = this.stage;
    const y = rowY(g.row);
    const scale = rowScale(g.row);
    const fadeFrom = GHOST_LIFE * 0.45;
    ctx.globalAlpha = g.age < fadeFrom ? 1 : Math.max(0, 1 - (g.age - fadeFrom) / (GHOST_LIFE - fadeFrom));
    if (g.puppet) {
      // Turned around: it is running home.
      this.drawPuppet(g.puppet, g.x, y, -dirOf(g.side), scale);
    } else {
      this.drawBox(g.x, y, (g.def.len / SUB) * scale, 90 * scale, '…', '#eeeeee');
    }
    ctx.globalAlpha = 1;
  }

  // ---- specials -----------------------------------------------------------

  /** Activists glued to the road in front of the units they are holding up. */
  private drawBlockade(b: Blockade, time: number): void {
    const { ctx } = this.stage;
    // They face the units they block, which come from the blocked side's gate.
    const facing = dirOf(other(b.side));
    const grow = Math.min(1, b.age / 0.18);
    const leave = Math.min(1, (b.life - b.age) / 0.25);
    const rig = this.rigs.get(BLOCKADE);
    if (rig) {
      const idle = CLIPS[rig.id]?.idle;
      ctx.globalAlpha = Math.max(0, leave);
      this.drawLoose(rig, b.x, rowY(1) + 6, facing, 0.6 + 0.4 * grow, idle, idle ? (time / (idle.seconds ?? 2)) % 1 : 0);
      ctx.globalAlpha = 1;
      return;
    }
    ctx.globalAlpha = Math.max(0, leave) * grow;
    ctx.strokeStyle = '#ff8a1f';
    ctx.lineWidth = 8;
    ctx.setLineDash([18, 12]);
    ctx.beginPath();
    ctx.moveTo(b.x, GROUND_Y - 50);
    ctx.lineTo(b.x, GROUND_Y + 50);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  /** A special that sweeps the lane: a convoy if it has art, plain blocks otherwise. Dust either way. */
  private drawWave(side: Side, x: number, rigId: string, time: number): void {
    const { ctx } = this.stage;
    const dir = dirOf(side);
    const rig = this.rigs.get(rigId);
    const travelled = Math.abs(x - GATE_X[side]);
    for (let i = 0; i < 3; i++) {
      const row = i % 3;
      const cx = x - dir * (70 + i * 190);
      const ground = rowY(row);
      // Puffs trailing behind the back wheel, each a little older and bigger than the last.
      for (let p = 0; p < 4; p++) {
        const age = (time * 3 + p * 0.25 + i * 0.4) % 1;
        ctx.globalAlpha = 0.5 * (1 - age);
        ctx.fillStyle = '#cdb68a';
        ctx.beginPath();
        ctx.arc(cx - dir * (60 + age * 70), ground - 10 - age * 26, 10 + age * 18, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (rig) {
        const walk = CLIPS[rig.id]?.walk;
        const u = walk ? ((travelled + i * 61) / (walk.stride ?? 150)) % 1 : 0;
        this.drawLoose(rig, cx, ground, dir, rowScale(row), walk, u);
      } else {
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.roundRect(cx - 30, GROUND_Y - 70 + Math.sin(time * 30 + i) * 3, 60, 44, 8);
        ctx.fill();
      }
    }
  }

  // ---- projectiles and effects -------------------------------------------

  private drawShots(view: BattleView): void {
    const { ctx } = this.stage;
    for (const shot of view.shots) {
      const rig = this.rigs.get(shot.rig);
      if (rig) {
        this.drawLoose(rig, shot.x, shot.y, dirOf(shot.side), 1, undefined, 0, shot.angle * dirOf(shot.side));
      } else {
        ctx.fillStyle = shot.side === 0 ? '#fffaf0' : '#8ed0ff';
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(shot.x, shot.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  private drawEffects(view: BattleView): void {
    const { ctx } = this.stage;
    for (const p of view.puffs) {
      const t = p.age / p.life;
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.4 + t * 0.8), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.textAlign = 'center';
    for (const f of view.floaters) {
      const t = f.age / f.life;
      ctx.globalAlpha = t < 0.75 ? 1 : 1 - (t - 0.75) / 0.25;
      ctx.font = `700 ${f.size}px ${FONT}`;
      ctx.lineWidth = Math.max(4, f.size / 4.5);
      ctx.lineJoin = 'round';
      ctx.strokeStyle = INK;
      ctx.fillStyle = f.color;
      const y = f.y - 42 * (1 - (1 - t) * (1 - t));
      ctx.strokeText(f.text, f.x, y);
      ctx.fillText(f.text, f.x, y);
    }
    ctx.globalAlpha = 1;
  }
}
