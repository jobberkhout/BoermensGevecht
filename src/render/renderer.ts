import { GATE_X, GROUND_Y, SUB, WORLD_H, WORLD_W } from '../defs/balance.ts';
import { FACTIONS, eraOf } from '../defs/index.ts';
import type { FactionId } from '../defs/types.ts';
import { CLIPS } from '../anim/clips/index.ts';
import { sampleClip } from '../anim/sample.ts';
import { drawRig, makePose, solve, type Pose } from '../rig/pose.ts';
import type { Rig } from '../rig/raster.ts';
import { SIDES, type Side, type SimState } from '../sim/types.ts';
import { forgetRigsExcept, hasRig, loadRig } from './assets.ts';
import { dirOf, rowScale, rowY, TURRET_SPOTS } from './layout.ts';
import { useWorld, type Stage } from './stage.ts';
import { GHOST_LIFE, type BattleView, type Ghost, type Puppet, type UnitView } from './view.ts';

/**
 * Draws one frame of the battle. Anything that has art is drawn with its rig;
 * anything that does not yet is drawn as a labelled grey box, so the game stays
 * playable while the art is still being made.
 */

const FONT = 'ui-rounded, "Arial Rounded MT Bold", "Trebuchet MS", system-ui, sans-serif';
const INK = '#2b1b16';

const LOOK: Record<FactionId, { main: string; dark: string; light: string }> = {
  havermelk: { main: '#c8a8f0', dark: '#7d5fb8', light: '#efe3ff' },
  achterhoek: { main: '#2f9140', dark: '#1f5a2a', light: '#a8d98f' },
};

const base6 = new Float32Array(6);

/** The grey box that stands in for a base without art. */
const BOX_W = 230;
const BOX_TOP = GROUND_Y - 400;

export class Renderer {
  private rigs = new Map<string, Rig>();
  private wanted = new Set<string>();
  private scale = 0;
  private background: HTMLCanvasElement | null = null;
  private loading = 0;
  /** Scratch space per static rig, so drawing one does not allocate every frame. */
  private statics = new WeakMap<Rig, { pose: Pose; world: Float32Array }>();
  /** This frame's screen-shake offset, in real pixels. */
  private ox = 0;
  private oy = 0;

  private readonly stage: Stage;

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
    for (const id of ids) if (hasRig(id)) this.wanted.add(id);
    await this.reload();
  }

  private async reload(): Promise<void> {
    // A little above the stage scale, because the nearest row is drawn slightly larger.
    const scale = Math.max(0.5, Math.ceil(this.stage.k * 1.08 * 20) / 20);
    const ticket = ++this.loading;
    const loaded = await Promise.all([...this.wanted].map(async (id) => [id, await loadRig(id, scale)] as const));
    if (ticket !== this.loading) return; // a newer resize overtook this one
    this.rigs = new Map(loaded);
    if (scale !== this.scale) forgetRigsExcept(scale);
    this.scale = scale;
  }

  draw(s: SimState, view: BattleView, alpha: number): void {
    const { ctx, k } = this.stage;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    if (!this.background) this.background = this.paintBackground();
    const sx = view.shake > 0 ? Math.sin(view.time * 90) * view.shake * k : 0;
    const sy = view.shake > 0 ? Math.cos(view.time * 70) * view.shake * 0.6 * k : 0;
    this.ox = sx;
    this.oy = sy;
    ctx.drawImage(this.background, sx, sy);
    ctx.setTransform(k, 0, 0, k, sx, sy);

    for (const side of SIDES) this.drawBase(s, view, side);

    // Far rows first, so nearer units overlap them.
    const ghosts = [...view.ghosts].sort((a, b) => a.row - b.row);
    for (const g of ghosts) this.drawGhost(g, sx, sy);
    const units = [...view.units.values()].sort((a, b) => a.row - b.row || a.x - b.x);
    for (const v of units) this.drawUnit(v, view.time, sx, sy);

    for (const side of SIDES) this.drawGate(s, side);
    for (const w of view.waves(s, alpha)) this.drawWave(w.side, w.x, view.time);
    this.drawShots(view, sx, sy);
    this.drawEffects(view);
    useWorld(this.stage);
  }

  // ---- scenery ------------------------------------------------------------

  private paintBackground(): HTMLCanvasElement {
    const { canvas, k } = this.stage;
    const bg = document.createElement('canvas');
    bg.width = canvas.width;
    bg.height = canvas.height;
    const c = bg.getContext('2d')!;
    c.setTransform(k, 0, 0, k, 0, 0);
    const horizon = GROUND_Y - 92;

    const sky = c.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#9fd3f2');
    sky.addColorStop(1, '#e8f6fb');
    c.fillStyle = sky;
    c.fillRect(0, 0, WORLD_W, horizon + 20);

    // West: a row of canal-house gables. East: hedgerows and trees.
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
      const x = 1000 + i * 80;
      const r = 46 + ((i * 37) % 30);
      c.beginPath();
      c.arc(x, horizon, r, Math.PI, 0);
      c.fill();
    }

    const ground = c.createLinearGradient(0, 0, WORLD_W, 0);
    ground.addColorStop(0, '#b8c4ae');
    ground.addColorStop(0.5, '#9bcb7d');
    ground.addColorStop(1, '#7dbd5f');
    c.fillStyle = ground;
    c.fillRect(0, horizon, WORLD_W, WORLD_H - horizon);

    // The road: paving in town, sand in the country.
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

  private drawBase(s: SimState, view: BattleView, side: Side): void {
    const { ctx } = this.stage;
    const state = s.sides[side];
    const era = eraOf(state.faction, state.era);
    const rig = this.rigs.get(era.baseRig);
    const look = LOOK[state.faction];
    const dir = dirOf(side);
    const gate = GATE_X[side];

    if (rig) {
      this.drawStatic(rig, gate, GROUND_Y, dir, 1, view.time);
    } else {
      // Grey box: a block with a doorway at the gate and a flag on top.
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
      const poleX = gate - dir * 150;
      ctx.beginPath();
      ctx.moveTo(poleX, BOX_TOP);
      ctx.lineTo(poleX, BOX_TOP - 140);
      ctx.stroke();
      const flag = this.rigs.get(FACTIONS[state.faction].flagRig);
      if (flag) {
        this.drawStatic(flag, poleX, BOX_TOP - 136, dir, 1, view.time + side * 0.4);
      } else {
        ctx.fillStyle = look.light;
        ctx.fillRect(poleX, BOX_TOP - 136, dir * 96, 60);
        ctx.strokeRect(poleX, BOX_TOP - 136, dir * 96, 60);
      }
    }

    if (view.baseFlash[side] > 0) {
      ctx.globalAlpha = view.baseFlash[side] * 0.45;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(side === 0 ? gate - BOX_W : gate, BOX_TOP, BOX_W, GROUND_Y + 52 - BOX_TOP);
      ctx.globalAlpha = 1;
    }

    // Turrets.
    state.turrets.forEach((t, slot) => {
      if (!t) return;
      const spot = TURRET_SPOTS[slot]!;
      const x = gate + dir * spot.dx;
      const y = GROUND_Y + spot.dy;
      const kick = view.turretKick[side]![slot] ?? 0;
      const turretRig = this.rigs.get(era.turret.rig);
      if (turretRig) {
        this.drawStatic(turretRig, x - dir * kick * 6, y, dir, 1, view.time);
      } else {
        ctx.fillStyle = look.dark;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillRect(x, y - 7, dir * (44 - kick * 12), 14);
        ctx.strokeRect(x, y - 7, dir * (44 - kick * 12), 14);
      }
    });
  }

  /** The part of a base that units walk out from under. Grey boxes have none. */
  private drawGate(_s: SimState, _side: Side): void {
    // Filled in when the base art arrives: its `front` parts are drawn here, over the units.
  }

  /** Draws a rig that is not a unit: a base, a turret, a flag. It plays its idle clip if it has one. */
  private drawStatic(rig: Rig, x: number, y: number, dir: number, scale: number, time = 0): void {
    const { ctx, k } = this.stage;
    let slot = this.statics.get(rig);
    if (!slot) {
      slot = { pose: makePose(rig.parts.length), world: new Float32Array(rig.parts.length * 6) };
      this.statics.set(rig, slot);
    }
    const idle = CLIPS[rig.id]?.idle;
    if (idle) sampleClip(idle, (time / (idle.seconds ?? 2)) % 1, rig.index, slot.pose);
    solve(rig, slot.pose, slot.world);
    base6.set([k * scale * dir, 0, 0, k * scale, k * x + this.ox, k * y + this.oy]);
    drawRig(ctx, rig, slot.world, base6);
    ctx.setTransform(k, 0, 0, k, this.ox, this.oy);
  }

  // ---- units --------------------------------------------------------------

  private drawPuppet(p: Puppet, x: number, y: number, facing: number, scale: number, ox: number, oy: number): void {
    const { ctx, k } = this.stage;
    base6.set([k * scale * facing, 0, 0, k * scale, k * x + ox, k * y + oy]);
    drawRig(ctx, p.rig, p.world, base6);
    ctx.setTransform(k, 0, 0, k, ox, oy);
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

  private drawUnit(v: UnitView, time: number, ox: number, oy: number): void {
    const { ctx } = this.stage;
    const y = rowY(v.row);
    const scale = rowScale(v.row);
    const len = v.def.len / SUB;
    const x = v.x + (v.stunned ? Math.sin(time * 45 + v.id) * 1.5 : 0);
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
      this.drawPuppet(v.puppet, x, y, dirOf(v.side), scale, ox, oy);
      if (v.flash > 0) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = v.flash * 0.55;
        this.drawPuppet(v.puppet, x, y, dirOf(v.side), scale, ox, oy);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }
    } else {
      const height = v.def.role === 'heavy' ? 110 : v.def.role === 'ranged' ? 92 : 100;
      const fill = v.flash > 0.3 ? '#ffffff' : v.side === 0 ? '#d9c5f5' : '#a8d98f';
      this.drawBox(x, y, len * scale, height * scale, v.def.role[0]!.toUpperCase(), fill);
    }

    const top = y - (v.def.role === 'heavy' ? 128 : 140) * scale;
    if (v.hp < v.def.hp) {
      const w = v.def.role === 'heavy' ? 74 : 40;
      ctx.fillStyle = INK;
      ctx.fillRect(x - w / 2 - 2, top - 2, w + 4, 10);
      ctx.fillStyle = '#e5533d';
      ctx.fillRect(x - w / 2, top, w, 6);
      ctx.fillStyle = '#7fd35b';
      ctx.fillRect(x - w / 2, top, w * Math.max(0, v.hp / v.def.hp), 6);
    }
  }

  private drawGhost(g: Ghost, ox: number, oy: number): void {
    const { ctx } = this.stage;
    const y = rowY(g.row);
    const scale = rowScale(g.row);
    const fadeFrom = GHOST_LIFE * 0.45;
    ctx.globalAlpha = g.age < fadeFrom ? 1 : Math.max(0, 1 - (g.age - fadeFrom) / (GHOST_LIFE - fadeFrom));
    if (g.puppet) {
      // Turned around: it is running home.
      this.drawPuppet(g.puppet, g.x, y, -dirOf(g.side), scale, ox, oy);
    } else {
      this.drawBox(g.x, y, (g.def.len / SUB) * scale, 90 * scale, '…', '#eeeeee');
    }
    ctx.globalAlpha = 1;
  }

  // ---- projectiles and effects -------------------------------------------

  private drawShots(view: BattleView, ox: number, oy: number): void {
    const { ctx, k } = this.stage;
    for (const shot of view.shots) {
      const rig = this.rigs.get(shot.rig);
      if (rig) {
        const pose = makePose(rig.parts.length);
        const world = new Float32Array(rig.parts.length * 6);
        solve(rig, pose, world);
        const cos = Math.cos(shot.spin);
        const sin = Math.sin(shot.spin);
        base6.set([k * cos, k * sin, -k * sin, k * cos, k * shot.x + ox, k * shot.y + oy]);
        drawRig(ctx, rig, world, base6);
        ctx.setTransform(k, 0, 0, k, ox, oy);
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

  private drawWave(side: Side, x: number, time: number): void {
    const { ctx } = this.stage;
    const dir = dirOf(side);
    // Grey box for a special that sweeps the lane: a dust cloud with a hard front edge.
    const grad = ctx.createLinearGradient(x, 0, x - dir * 260, 0);
    grad.addColorStop(0, 'rgba(120,90,50,0.75)');
    grad.addColorStop(1, 'rgba(120,90,50,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(Math.min(x, x - dir * 260), GROUND_Y - 120, 260, 180);
    ctx.fillStyle = INK;
    for (let i = 0; i < 3; i++) {
      const cx = x - dir * (40 + i * 80);
      const bounce = Math.sin(time * 30 + i) * 3;
      ctx.beginPath();
      ctx.roundRect(cx - 30, GROUND_Y - 70 + bounce, 60, 44, 8);
      ctx.fill();
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
