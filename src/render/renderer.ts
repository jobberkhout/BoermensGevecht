import { CLIPS } from '../anim/clips/index.ts';
import { sampleClip } from '../anim/sample.ts';
import type { Clip } from '../anim/types.ts';
import { GATE_X, GROUND_Y, SUB, WORLD_H } from '../defs/balance.ts';
import { FACTIONS, eraOf, homeOf, turretDef, turretEra } from '../defs/index.ts';
import type { FactionDef, Role } from '../defs/types.ts';
import { drawRig, makePose, solve, type Pose } from '../rig/pose.ts';
import { loadImage, openTag, type Rig } from '../rig/raster.ts';
import { turretRange } from '../sim/turrets.ts';
import { SIDES, other, type Side, type SimState } from '../sim/types.ts';
import { forgetRigsExcept, hasRig, loadRig, rigSource } from './assets.ts';
import { BAND_SPOT, dirOf, rowScale, rowY, TURRET_SCALE } from './layout.ts';
import { useWorld, type Stage } from './stage.ts';
import {
  DOCK_SECONDS,
  DROP_SECONDS,
  GHOST_LIFE,
  SPAWN_FADE,
  type Band,
  type BattleView,
  type Blockade,
  type Ghost,
  type Puppet,
  type Sprite,
  type Swarm,
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

/** The sky every match is played under. Each faction brings its own half of the land below it. */
export const SKY = 'scenery/sky';

/** The right-hand faction's half of the backdrop fades in over this stretch of the stage, so any two halves meet without a seam. */
const BLEND_FROM = 860;
const BLEND_TO = 1060;

/** Where the drones of a swarm fly relative to its leader: a loose V. */
const FORMATION: readonly (readonly [number, number])[] = [
  [0, 0],
  [-74, -44],
  [-74, 46],
  [-148, -88],
  [-148, 92],
  [-150, 4],
];

const base6 = new Float32Array(6);

/** Flags fly a little smaller than they are drawn, so they stay clear of the top bar. */
const FLAG_SCALE = 0.85;

/** Per kind of unit: how far above the ground its health bar hangs, how wide it is, and how tall its stand-in box is. */
const BUILD: Record<Role, { bar: number; barWidth: number; box: number }> = {
  light: { bar: 140, barWidth: 40, box: 100 },
  ranged: { bar: 140, barWidth: 40, box: 92 },
  heavy: { bar: 128, barWidth: 74, box: 110 },
  shield: { bar: 162, barWidth: 48, box: 130 },
  super: { bar: 244, barWidth: 110, box: 215 },
};

/** The grey box that stands in for a base without art. */
/** How far off its mooring a ship starts and ends, in pixels towards the edge of the screen. */
const DOCK_TRAVEL = 760;
const BOX_W = 300;
const BOX_TOP = GROUND_Y - 460;

export class Renderer {
  private readonly stage: Stage;
  private rigs = new Map<string, Rig>();
  private wanted = new Set<string>();
  /** Whole-screen drawings: the sky and the factions' backdrops. */
  private scenes = new Map<string, HTMLImageElement>();
  private wantedScenes = new Set<string>([SKY]);
  private scale = 0;
  private background: HTMLCanvasElement | null = null;
  /** Which two factions the cached background was painted for. */
  private backgroundFor = '';
  /** The colours of the faction on each side in the match being drawn. */
  private colorsOf: [FactionDef['colors'], FactionDef['colors']] = [FACTIONS.havermelk.colors, FACTIONS.achterhoek.colors];
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

  /**
   * Makes sure these rigs and whole-screen scenes are loaded at the current
   * screen size. Art that does not exist is skipped.
   */
  async prepare(ids: Iterable<string>, scenes: Iterable<string> = []): Promise<void> {
    for (const id of ids) this.wanted.add(id);
    for (const id of scenes) this.wantedScenes.add(id);
    await this.reload();
  }

  private async reload(): Promise<void> {
    // Above the stage scale, because turret scenes and the nearest row are drawn larger than life.
    const scale = Math.max(0.5, Math.ceil(this.stage.k * TURRET_SCALE * 20) / 20);
    const ticket = ++this.loading;
    const ids = [...this.wanted].filter(hasRig);
    const sceneIds = [...this.wantedScenes].filter(hasRig);
    const { width, height } = this.stage.canvas;
    const [loaded, scenes] = await Promise.all([
      Promise.all(ids.map(async (id) => [id, await loadRig(id, scale)] as const)),
      Promise.all(sceneIds.map(async (id) => [id, await this.loadScene(id, width, height)] as const)),
    ]);
    if (ticket !== this.loading) return; // a newer resize or request overtook this one
    this.rigs = new Map(loaded);
    this.scenes = new Map(scenes);
    this.background = null;
    if (scale !== this.scale) forgetRigsExcept(scale);
    this.scale = scale;
  }

  /** A whole-screen drawing as one picture, rendered by the browser at exactly the canvas size. */
  private loadScene(id: string, width: number, height: number): Promise<HTMLImageElement> {
    const src = rigSource(id);
    return loadImage(`${openTag(src, width, height)}${src.head}${src.parts.map((part) => part.markup).join('')}</svg>`);
  }

  draw(s: SimState, view: BattleView, alpha: number): void {
    const { ctx, k } = this.stage;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    this.colorsOf = [FACTIONS[s.sides[0].faction].colors, FACTIONS[s.sides[1].faction].colors];
    const pair = `${s.sides[0].faction}|${s.sides[1].faction}`;
    if (!this.background || this.backgroundFor !== pair) {
      this.background = this.paintBackground(FACTIONS[s.sides[0].faction], FACTIONS[s.sides[1].faction]);
      this.backgroundFor = pair;
    }
    this.ox = view.shake > 0 ? Math.sin(view.time * 90) * view.shake * k : 0;
    this.oy = view.shake > 0 ? Math.cos(view.time * 70) * view.shake * 0.6 * k : 0;
    ctx.drawImage(this.background, this.ox, this.oy);
    this.world();

    for (const side of SIDES) this.drawReach(s, side);
    // A ship that moors comes in behind the base.
    for (const b of view.bands) if (b.mode === 'dock') this.drawDock(b, view.time);
    for (const side of SIDES) this.drawBase(s, view, side);
    // The band stands on the verge behind the road, so everyone walks past in front of it.
    for (const b of view.bands) if (b.mode !== 'dock') this.drawBand(b, view.time);

    // Far rows first, so nearer units overlap them.
    const ghosts = [...view.ghosts].sort((a, b) => a.row - b.row);
    for (const g of ghosts) this.drawGhost(g);
    const units = [...view.units.values()].sort((a, b) => a.row - b.row || a.x - b.x);
    for (const v of units) this.drawUnit(v, view.time);
    for (const v of units) if (v.turncoat) this.drawBadge(v, view.time);
    for (const v of units) if (v.pose) this.drawPoseFrame(v, view.time);

    // The activists sit low, so they go on top: otherwise whoever stands next to them hides them.
    for (const b of view.blockades) this.drawBlockade(b, view.time);
    for (const w of view.waves(s, alpha)) this.drawWave(w.side, w.x, w.rig, view.time);
    for (const w of view.swarms) this.drawSwarm(w, view.time);
    this.drawShots(view);
    for (const sp of view.sprites) this.drawSprite(sp, view.time);
    this.drawCoins(view);
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

  /**
   * The backdrop for a match between these two: the shared sky, the left
   * faction's land as drawn, and the right faction's land mirrored and faded in
   * over the middle.
   */
  private paintBackground(left: FactionDef, right: FactionDef): HTMLCanvasElement {
    const { canvas, k } = this.stage;
    const bg = document.createElement('canvas');
    bg.width = canvas.width;
    bg.height = canvas.height;
    const c = bg.getContext('2d')!;

    const sky = this.scenes.get(SKY);
    if (sky) {
      c.drawImage(sky, 0, 0, bg.width, bg.height);
    } else {
      const fill = c.createLinearGradient(0, 0, 0, bg.height * 0.56);
      fill.addColorStop(0, '#8fd0f5');
      fill.addColorStop(1, '#def3fb');
      c.fillStyle = fill;
      c.fillRect(0, 0, bg.width, bg.height);
    }
    this.paintLand(c, left, false);

    const half = document.createElement('canvas');
    half.width = bg.width;
    half.height = bg.height;
    const h = half.getContext('2d')!;
    this.paintLand(h, right, true);
    // Keep of the right-hand half only what lies past the middle, with a soft edge.
    h.setTransform(1, 0, 0, 1, 0, 0);
    h.globalCompositeOperation = 'destination-in';
    const mask = h.createLinearGradient(k * BLEND_FROM, 0, k * BLEND_TO, 0);
    mask.addColorStop(0, 'rgba(0,0,0,0)');
    mask.addColorStop(1, 'rgba(0,0,0,1)');
    h.fillStyle = mask;
    h.fillRect(0, 0, half.width, half.height);
    c.drawImage(half, 0, 0);
    return bg;
  }

  /** One faction's half of the land, mirrored for the right-hand side. Plain ground in its colours if it has no backdrop yet. */
  private paintLand(c: CanvasRenderingContext2D, faction: FactionDef, mirrored: boolean): void {
    const { width, height } = c.canvas;
    const k = this.stage.k;
    c.setTransform(mirrored ? -1 : 1, 0, 0, 1, mirrored ? width : 0, 0);
    const land = this.scenes.get(faction.backdropRig);
    if (land) {
      c.drawImage(land, 0, 0, width, height);
      return;
    }
    c.scale(k, k);
    c.fillStyle = faction.colors.light;
    c.fillRect(0, GROUND_Y - 92, 1100, WORLD_H - (GROUND_Y - 92));
    c.fillStyle = '#b7b1a8';
    c.fillRect(0, GROUND_Y - 52, 1100, 104);
    c.strokeStyle = 'rgba(43,27,22,0.28)';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(0, GROUND_Y - 52);
    c.lineTo(1100, GROUND_Y - 52);
    c.moveTo(0, GROUND_Y + 52);
    c.lineTo(1100, GROUND_Y + 52);
    c.stroke();
  }

  // ---- bases --------------------------------------------------------------

  private drawBase(s: SimState, view: BattleView, side: Side): void {
    const { ctx } = this.stage;
    const state = s.sides[side];
    const era = eraOf(state.faction, state.era);
    const rig = this.rigs.get(era.baseRig);
    const look = FACTIONS[state.faction].colors;
    const dir = dirOf(side);
    const gate = GATE_X[side];
    const flash = view.baseFlash[side];
    const flagSpot = view.flagSpot(s, side);

    if (rig) {
      const idle = CLIPS[rig.id]?.idle;
      const u = idle ? (view.time / (idle.seconds ?? 2)) % 1 : 0;
      this.drawLoose(rig, gate, GROUND_Y, dir, 1, idle, u);
      // Struck: a short white flash. Just modernized: a longer one, as the new building settles in.
      const glow = Math.max(flash * 0.4, view.eraFlash[side] * 0.7);
      if (glow > 0) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = glow;
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

    const def = FACTIONS[state.faction];
    const flag = this.rigs.get(side === 1 && def.flagRigRight ? def.flagRigRight : def.flagRig);
    if (flag) {
      const wave = CLIPS[flag.id]?.idle;
      this.drawLoose(flag, flagSpot.x, flagSpot.y, dir, FLAG_SCALE, wave, wave ? ((view.time + side * 0.4) / (wave.seconds ?? 2)) % 1 : 0);
    }

    state.turrets.forEach((turret, slot) => {
      if (!turret) return;
      const t = view.turrets[side][slot];
      if (t) {
        this.drawTurret(t, dir);
      } else {
        const spot = view.turretSpot(s, side, slot);
        this.drawTurretBox(spot, dir, look.dark);
        this.drawStars(spot.x + dir * 60, spot.y + 13, dir, turret.level, turretEra(state.faction, turret.def) < state.era);
      }
    });
  }

  /**
   * How far down the lane a side's best turret reaches: a dotted line across
   * the road in that side's colour, with a marker on the kerb. Upgrading a
   * turret moves it, which is how a player sees what the upgrade bought.
   */
  private drawReach(s: SimState, side: Side): void {
    const state = s.sides[side];
    let reach = 0;
    for (const turret of state.turrets) {
      if (turret) reach = Math.max(reach, turretRange(turretDef(turret.def), turret.level));
    }
    if (reach === 0) return;
    const { ctx } = this.stage;
    const x = GATE_X[side] + dirOf(side) * (reach / SUB);
    const look = FACTIONS[state.faction].colors;
    ctx.strokeStyle = look.dark;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.setLineDash([3, 11]);
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y - 50);
    ctx.lineTo(x, GROUND_Y + 50);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineCap = 'butt';
    ctx.globalAlpha = 1;
    // A marker on the near kerb, where no unit stands in front of it.
    ctx.fillStyle = look.main;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y + 52);
    ctx.lineTo(x + 10, GROUND_Y + 68);
    ctx.lineTo(x - 10, GROUND_Y + 68);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private drawTurret(t: TurretView, dir: number): void {
    this.drawSolved(t.rig, t.world, t.x, t.y, dir, TURRET_SCALE);
    this.drawStars(t.x + dir * 112, t.y + 13, dir, t.level, t.outdated);
  }

  /** One star per level, on the edge of the ledge. Grey when the turret is from an older era. */
  private drawStars(x: number, y: number, dir: number, level: number, outdated: boolean): void {
    const { ctx } = this.stage;
    ctx.fillStyle = outdated ? '#b9b1a6' : '#ffd21f';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    for (let i = 0; i < level; i++) {
      const cx = x - dir * i * 21;
      ctx.beginPath();
      for (let k = 0; k < 10; k++) {
        const r = k % 2 === 0 ? 10 : 4.4;
        const a = -Math.PI / 2 + (k * Math.PI) / 5;
        ctx.lineTo(cx + Math.cos(a) * r, y + Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
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
    const x = v.x + v.slide + (v.stunned ? Math.sin(time * 45 + v.id) * 1.5 : 0);
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
      ctx.ellipse(x, y + 4, Math.max(26, len * scale * 0.55), 9, 0, 0, Math.PI * 2);
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
      const fill = v.flash > 0.3 ? '#ffffff' : FACTIONS[homeOf(v.def.id)].colors.light;
      this.drawBox(x, y, len * scale, BUILD[v.def.role].box * scale, v.def.role[0]!.toUpperCase(), fill);
    }
    ctx.globalAlpha = 1;

    if (v.hp < v.def.hp) {
      const top = y - BUILD[v.def.role].bar * scale;
      const w = BUILD[v.def.role].barWidth;
      ctx.fillStyle = INK;
      ctx.fillRect(x - w / 2 - 2, top - 2, w + 4, 10);
      ctx.fillStyle = '#e5533d';
      ctx.fillRect(x - w / 2, top, w, 6);
      ctx.fillStyle = '#7fd35b';
      ctx.fillRect(x - w / 2, top, w * Math.max(0, v.hp / v.def.hp), 6);
    }
  }

  /**
   * The keycord of a unit that was bought over: a pass on a strap, in the
   * colours of its new side. Drawn after all units, so nobody stands in front of it.
   */
  private drawBadge(v: UnitView, time: number): void {
    const { ctx } = this.stage;
    const look = this.colorsOf[v.side];
    const x = v.x + v.slide;
    // It dangles a little.
    const sway = Math.sin(time * 3 + v.id) * 2;
    const y = rowY(v.row) - BUILD[v.def.role].bar * rowScale(v.row) - 14;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = look.dark;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 13, y - 40);
    ctx.lineTo(x + sway, y - 20);
    ctx.lineTo(x + 13, y - 40);
    ctx.stroke();
    ctx.fillStyle = '#fffdf5';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.rect(x + sway - 12, y - 21, 24, 20);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = look.main;
    ctx.fillRect(x + sway - 9, y - 18, 18, 6);
    ctx.fillStyle = look.dark;
    ctx.fillRect(x + sway - 9, y - 9, 12, 2.5);
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
    const rig = this.rigs.get(b.rig);
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

  /** The scene of a special that lasts a while: it pops up beside its owner's base and stays until the special is over. */
  private drawBand(b: Band, time: number): void {
    const rig = this.rigs.get(b.rig);
    if (!rig) return; // without art the floating notes have to do
    const { ctx } = this.stage;
    const dir = dirOf(b.side);
    const grow = Math.min(1, b.age / 0.2);
    const leave = Math.min(1, (b.life - b.age) / 0.3);
    const idle = CLIPS[rig.id]?.idle;
    ctx.globalAlpha = Math.max(0, leave);
    // A sign that is dropped falls the last stretch out of the sky, faster and faster, and lands at full size.
    const fall = b.mode === 'drop' ? Math.min(1, b.age / DROP_SECONDS) : 1;
    const y = GROUND_Y + BAND_SPOT.dy - (1 - fall * fall) * 520;
    const scale = b.mode === 'drop' ? 1 : 0.7 + 0.3 * grow;
    this.drawLoose(rig, GATE_X[b.side] + dir * BAND_SPOT.dx, y, dir, scale, idle, idle ? (time / (idle.seconds ?? 0.6)) % 1 : 0);
    ctx.globalAlpha = 1;
  }

  /** A ship that moors behind its owner's base: it slides in from the edge of the screen, and out again when its time is up. */
  private drawDock(b: Band, time: number): void {
    const rig = this.rigs.get(b.rig);
    if (!rig) return;
    const dir = dirOf(b.side);
    const ease = (t: number): number => 1 - (1 - t) * (1 - t);
    const there = ease(Math.min(1, b.age / DOCK_SECONDS, Math.max(0, (b.life - b.age) / DOCK_SECONDS)));
    const idle = CLIPS[rig.id]?.idle;
    this.drawLoose(rig, GATE_X[b.side] - dir * (1 - there) * DOCK_TRAVEL, GROUND_Y, dir, 1, idle, idle ? (time / (idle.seconds ?? 2)) % 1 : 0);
  }

  /** The frame of a phone camera over a unit that poses for an influencer, with its record dot. */
  private drawPoseFrame(v: UnitView, time: number): void {
    const rig = this.rigs.get(v.pose);
    if (!rig) return;
    const idle = CLIPS[rig.id]?.idle;
    const y = rowY(v.row) - BUILD[v.def.role].bar * rowScale(v.row) - 24;
    this.drawLoose(rig, v.x + v.slide, y, dirOf(v.side), 1, idle, idle ? ((time + v.id * 0.13) / (idle.seconds ?? 1)) % 1 : 0);
  }

  /** The drones still waiting for their turn, hovering in formation. */
  private drawSwarm(w: Swarm, time: number): void {
    const { ctx } = this.stage;
    const dir = dirOf(w.side);
    const rig = this.rigs.get(w.rig);
    const idle = rig ? CLIPS[rig.id]?.idle : undefined;
    const count = Math.min(w.left, FORMATION.length);
    for (let i = count - 1; i >= 0; i--) {
      const [dx, dy] = FORMATION[i]!;
      const x = w.x + dir * dx + Math.sin(time * 2.3 + i * 1.9) * 6;
      const y = w.y + dy * 0.6 + Math.sin(time * 5 + i * 1.3) * 5;
      if (rig) {
        this.drawLoose(rig, x, y, dir, 1, idle, idle ? ((time + i * 0.07) / (idle.seconds ?? 0.25)) % 1 : 0);
      } else {
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.ellipse(x, y, 22, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /** Something that flies from one spot to another: a heart floating up, a drone diving, a verdict coming down. */
  private drawSprite(sp: Sprite, time: number): void {
    if (sp.age < 0) return; // not started yet
    const { ctx } = this.stage;
    const t = Math.min(1, sp.age / sp.life);
    const p = sp.ease === 'rise' ? 1 - (1 - t) * (1 - t) : t * t;
    const x = sp.x0 + (sp.x1 - sp.x0) * p;
    const y = sp.y0 + (sp.y1 - sp.y0) * p;
    let alpha = 1;
    let scale = sp.scale;
    if (sp.ease === 'rise') {
      alpha = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
      scale *= 0.6 + 0.4 * Math.min(1, t * 5);
    } else if (sp.age > sp.life) {
      const after = sp.age - sp.life;
      alpha = sp.hold > 0 ? Math.min(1, (sp.hold - after) / (sp.hold * 0.4)) : 0;
      // It lands with a thump: a brief squash that settles.
      scale *= 1 + 0.3 * Math.max(0, 1 - after / 0.14);
    }
    if (alpha <= 0) return;
    ctx.globalAlpha = Math.max(0, alpha);
    const rig = this.rigs.get(sp.rig);
    if (rig) {
      const idle = CLIPS[rig.id]?.idle;
      this.drawLoose(rig, x, y, dirOf(sp.side), scale, idle, idle ? (time / (idle.seconds ?? 0.5)) % 1 : 0);
    } else {
      ctx.fillStyle = sp.ease === 'rise' ? '#ff7fb6' : '#e0442c';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 12 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
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
        // A vehicle rolls by how far it came; a drawing with only an idle loop (the Toeterstoet) plays that in time.
        const walk = CLIPS[rig.id]?.walk;
        const idle = CLIPS[rig.id]?.idle;
        const clip = walk ?? idle;
        const u = walk ? ((travelled + i * 61) / (walk.stride ?? 150)) % 1 : idle ? ((time + i * 0.37) / (idle.seconds ?? 1)) % 1 : 0;
        this.drawLoose(rig, cx, ground, dir, rowScale(row), clip, u);
      } else {
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.roundRect(cx - 30, GROUND_Y - 70 + Math.sin(time * 30 + i) * 3, 60, 44, 8);
        ctx.fill();
      }
    }
  }

  // ---- projectiles and effects -------------------------------------------

  /** Money that changes hands: gold coins tumbling through the air, high over everyone's heads. */
  private drawCoins(view: BattleView): void {
    const { ctx } = this.stage;
    ctx.lineJoin = 'round';
    for (const c of view.coins) {
      if (c.age < 0) continue; // still in the purse
      const t = c.age / c.life;
      // Away quickly, and it eases into the slot.
      const p = 1 - (1 - t) * (1 - t);
      const x = c.x0 + (c.x1 - c.x0) * p;
      const y = c.y0 + (c.y1 - c.y0) * p - c.arc * 4 * p * (1 - p);
      // A flipping coin shows its face, then its edge.
      const face = 0.25 + 0.75 * Math.abs(Math.cos(view.time * 13 + c.turn));
      const r = 12 * (t > 0.85 ? 1 - (t - 0.85) / 0.3 : 1);
      ctx.fillStyle = '#ffd21f';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(x, y, r * face, r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#fff3a8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y, r * face * 0.5, r * 0.5, 0, Math.PI * 1.05, Math.PI * 1.6);
      ctx.stroke();
    }
  }

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
      if (p.age < 0) continue; // starts a moment later
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
    // Small talk first, big news on top of it.
    const floaters = [...view.floaters].sort((a, b) => a.size - b.size);
    for (const f of floaters) {
      if (f.age < 0) continue; // not yet
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
