/**
 * Dev-only page for looking at the art.
 *
 *   /gallery.html                      every rig in its rest pose
 *   /gallery.html?rig=<id>&zoom=3      one rig: the raw file, the assembled puppet
 *                                      with its joints, and frame strips per clip
 *
 * Sets data-ready on <body> when everything is drawn, so screenshots can wait for it.
 */
import { CLIPS } from './anim/clips/index.ts';
import { sampleClip } from './anim/sample.ts';
import { CLIP_NAMES, OVERLAY_CLIPS, type Clip, type ClipSet } from './anim/types.ts';
import { loadRig, rigIds, rigSource, rigUrl } from './render/assets.ts';
import { applyX, applyY } from './rig/mat.ts';
import { addPose, drawRig, makePose, solve, type Pose } from './rig/pose.ts';
import { loadImage, openTag, type Rig } from './rig/raster.ts';

const app = document.getElementById('app')!;
const params = new URLSearchParams(location.search);
const zoom = Number(params.get('zoom') ?? 2);
const FRAMES = 8;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, kids: (Node | string)[] = []): HTMLElementTagNameMap[K] {
  const node = Object.assign(document.createElement(tag), props);
  for (const kid of kids) node.append(kid);
  return node;
}

/** A canvas showing `cells` copies of the rig's view box side by side. */
function sheet(rig: Rig, cells: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; cellW: number } {
  const vb = rig.viewBox;
  const cellW = Math.ceil(vb.w * zoom);
  const canvas = el('canvas', { width: cellW * cells, height: Math.ceil(vb.h * zoom) });
  canvas.style.width = `${canvas.width}px`;
  return { canvas, ctx: canvas.getContext('2d')!, cellW };
}

function drawPose(ctx: CanvasRenderingContext2D, rig: Rig, pose: Pose, cellX: number, world: Float32Array): void {
  solve(rig, pose, world);
  const vb = rig.viewBox;
  const base = new Float32Array([zoom, 0, 0, zoom, cellX - vb.x * zoom, -vb.y * zoom]);
  drawRig(ctx, rig, world, base);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function clipFigure(rig: Rig, name: string, clip: Clip, idle: Clip | undefined): HTMLElement {
  const { canvas, ctx, cellW } = sheet(rig, FRAMES);
  const pose = makePose(rig.parts.length);
  const under = makePose(rig.parts.length);
  const world = new Float32Array(rig.parts.length * 6);
  const hit = clip.markers?.hit;
  // Show the hit frame exactly: nudge the nearest frame onto it.
  const times = Array.from({ length: FRAMES }, (_, i) => (clip.loop ? i / FRAMES : i / (FRAMES - 1)));
  let hitFrame = -1;
  if (hit !== undefined) {
    hitFrame = times.reduce((best, t, i) => (Math.abs(t - hit) < Math.abs(times[best]! - hit) ? i : best), 0);
    times[hitFrame] = hit;
  }
  times.forEach((u, i) => {
    sampleClip(clip, u, rig.index, pose);
    if (OVERLAY_CLIPS.includes(name as keyof ClipSet) && idle) {
      // A hit or a toss is laid over whatever else plays; show it over the idle pose.
      sampleClip(idle, 0, rig.index, under);
      addPose(under, pose, 1);
      drawPose(ctx, rig, under, i * cellW, world);
    } else {
      drawPose(ctx, rig, pose, i * cellW, world);
    }
    if (i === hitFrame) {
      ctx.strokeStyle = '#d92b2b';
      ctx.lineWidth = 3;
      ctx.strokeRect(i * cellW + 1.5, 1.5, cellW - 3, canvas.height - 3);
    }
    ctx.fillStyle = '#7a6a5d';
    ctx.font = '11px ui-monospace, Menlo, monospace';
    ctx.fillText(u.toFixed(2), i * cellW + 4, 12);
  });
  const timing = clip.stride ? `per ${clip.stride.toFixed(0)} px` : clip.seconds ? `${clip.seconds} s` : 'timed by the game';
  const live = liveCanvas(rig, name, clip, idle);
  const row = el('div', { className: 'row' }, [live, canvas]);
  return el('figure', {}, [row, el('figcaption', { textContent: `${name} (${timing}${hit !== undefined ? `, hit at ${hit}` : ''}${clip.loop ? ', loops' : ''}) · moving on the left, frames on the right` })]);
}

/** The clip playing in real time, roughly as fast as it does in a match. */
function liveCanvas(rig: Rig, name: string, clip: Clip, idle: Clip | undefined): HTMLCanvasElement {
  const { canvas, ctx } = sheet(rig, 1);
  const pose = makePose(rig.parts.length);
  const under = makePose(rig.parts.length);
  const world = new Float32Array(rig.parts.length * 6);
  // Walking speed in pixels per second, to turn a stride into a duration.
  const pace = rig.archetype === 'vehicle' ? 32 : 50;
  const seconds = clip.seconds ?? (clip.stride ? clip.stride / (name === 'die' ? pace * 2.4 : pace) : 1.2);
  const cycle = clip.loop ? seconds : seconds + 0.6; // a short rest between one-shot clips
  const start = performance.now();
  const frame = (now: number): void => {
    const t = ((now - start) / 1000) % cycle;
    const u = clip.loop ? t / seconds : Math.min(1, t / seconds);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sampleClip(clip, u, rig.index, pose);
    if (OVERLAY_CLIPS.includes(name as keyof ClipSet) && idle) {
      sampleClip(idle, 0, rig.index, under);
      addPose(under, pose, 1);
      drawPose(ctx, rig, under, 0, world);
    } else {
      drawPose(ctx, rig, pose, 0, world);
    }
    if (canvas.isConnected) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return canvas;
}

/** True if pixel (x, y) of `a` has no near-identical pixel within one pixel of the same spot in `b`. */
function strays(a: Uint8ClampedArray, b: Uint8ClampedArray, width: number, height: number, x: number, y: number): boolean {
  const i = (y * width + x) * 4;
  for (let dy = -1; dy <= 1; dy++) {
    const ny = y + dy;
    if (ny < 0 || ny >= height) continue;
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx;
      if (nx < 0 || nx >= width) continue;
      const j = (ny * width + nx) * 4;
      const delta = Math.max(
        Math.abs(a[i]! - b[j]!),
        Math.abs(a[i + 1]! - b[j + 1]!),
        Math.abs(a[i + 2]! - b[j + 2]!),
        Math.abs(a[i + 3]! - b[j + 3]!),
      );
      if (delta <= 64) return false;
    }
  }
  return true;
}

/**
 * How much the assembled puppet differs from the drawing rendered whole, as the share
 * of pixels that have no match within one pixel in the other picture. Cutting a
 * drawing into parts and putting it back together must give the same picture in
 * every browser. Browsers place edges a fraction of a pixel apart, which is why
 * a one-pixel shift is forgiven; a shape that moved, vanished or changed colour is not.
 */
function restDifference(rig: Rig, whole: HTMLImageElement, nudge = 0): number {
  const { canvas, ctx } = sheet(rig, 1);
  const pose = makePose(rig.parts.length);
  // With a nudge every drawn part is shoved aside on purpose: the comparison must notice.
  if (nudge !== 0) rig.parts.forEach((part, i) => (pose.x[i] = part.parent < 0 ? nudge : 0));
  drawPose(ctx, rig, pose, 0, new Float32Array(rig.parts.length * 6));
  const { width, height } = canvas;
  const reference = el('canvas', { width, height });
  const rctx = reference.getContext('2d', { willReadFrequently: true })!;
  rctx.drawImage(whole, 0, 0, width, height);
  const a = ctx.getImageData(0, 0, width, height).data;
  const b = rctx.getImageData(0, 0, width, height).data;
  let different = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (strays(a, b, width, height, x, y) || strays(b, a, width, height, x, y)) different++;
    }
  }
  return different / (width * height);
}

function restFigure(rig: Rig): HTMLElement {
  const { canvas, ctx } = sheet(rig, 1);
  const pose = makePose(rig.parts.length);
  const world = new Float32Array(rig.parts.length * 6);
  drawPose(ctx, rig, pose, 0, world);
  // Joints, and a ground line at y = 0.
  const vb = rig.viewBox;
  const sx = (x: number) => (x - vb.x) * zoom;
  const sy = (y: number) => (y - vb.y) * zoom;
  ctx.strokeStyle = 'rgba(43,27,22,0.35)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(0, sy(0));
  ctx.lineTo(canvas.width, sy(0));
  ctx.moveTo(sx(0), 0);
  ctx.lineTo(sx(0), canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
  rig.parts.forEach((part, i) => {
    const x = sx(applyX(world, i * 6, 0, 0));
    const y = sy(applyY(world, i * 6, 0, 0));
    ctx.fillStyle = '#d92b2b';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2b1b16';
    ctx.font = '10px ui-monospace, Menlo, monospace';
    ctx.fillText(part.id, x + 5, y + 3);
  });
  for (const [name, mount] of Object.entries(rig.mounts)) {
    const x = sx(applyX(world, mount.part * 6, mount.x, mount.y));
    const y = sy(applyY(world, mount.part * 6, mount.x, mount.y));
    ctx.strokeStyle = '#1f49c4';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 4, y - 4, 8, 8);
    ctx.fillStyle = '#1f49c4';
    ctx.fillText(name, x + 6, y - 5);
  }
  return el('figure', {}, [canvas, el('figcaption', { textContent: 'assembled, with joints (red) and mounts (blue)' })]);
}

async function showOne(id: string): Promise<void> {
  const src = rigSource(id);
  app.append(el('h1', { textContent: id }), el('div', { className: 'muted' }, [el('a', { href: 'gallery.html', textContent: 'all rigs' }), ` · ${src.archetype} · ${src.parts.length} parts · zoom ${zoom}`]));
  if (src.problems.length > 0) {
    app.append(el('div', { className: 'bad', textContent: src.problems.join('\n') }));
    return;
  }
  const rig = await loadRig(id, zoom);
  const raw = el('img', { className: 'raw', src: rigUrl(id), width: Math.ceil(src.viewBox.w * zoom), height: Math.ceil(src.viewBox.h * zoom) });
  await raw.decode().catch(() => undefined);
  const atlas = rig.atlas;
  atlas.style.maxWidth = '420px';
  // The whole drawing rendered in one go, at exactly the size the puppet is drawn at.
  const whole = await loadImage(
    `${openTag(src, Math.ceil(src.viewBox.w * zoom), Math.ceil(src.viewBox.h * zoom))}${src.head}${src.parts.map((part) => part.markup).join('')}</svg>`,
  );
  const difference = restDifference(rig, whole);
  document.body.dataset.restDiff = difference.toFixed(5);
  // The control: the same comparison on a puppet that is deliberately wrong. The shove grows with the
  // drawing, or a whole-screen scene with few edges, such as the sky, would hardly show it.
  const shove = Math.max(8, Math.round(Math.max(src.viewBox.w, src.viewBox.h) * 0.04));
  document.body.dataset.restDiffControl = restDifference(rig, whole, shove).toFixed(5);
  app.append(
    el('div', { className: 'row' }, [
      el('figure', {}, [raw, el('figcaption', { textContent: `the SVG file as the browser shows it (the puppet differs in ${(difference * 100).toFixed(2)}% of pixels)` })]),
      restFigure(rig),
      el('figure', {}, [atlas, el('figcaption', { textContent: `atlas ${atlas.width}×${atlas.height}` })]),
    ]),
  );
  const clips = CLIPS[id];
  if (!clips) {
    app.append(el('p', { className: 'muted', textContent: 'no clips registered for this rig' }));
    return;
  }
  for (const name of [...CLIP_NAMES, 'toss', 'vault', 'dazed', 'trick'] as const satisfies readonly (keyof ClipSet)[]) {
    const clip = clips[name];
    if (!clip) continue;
    app.append(el('h2', { textContent: name }), clipFigure(rig, name, clip, clips.idle));
  }
}

async function showAll(): Promise<void> {
  // ?only=zuidas/2025 shows just the drawings with that in their id: one faction, one era.
  const only = params.get('only') ?? '';
  const ids = rigIds().filter((id) => id.includes(only));
  app.append(el('h1', { textContent: only ? `Galerij: ${only}` : 'Galerij' }), el('p', { className: 'muted', textContent: `${ids.length} rigs. Click one for its animations.` }));
  const grid = el('div', { className: 'grid' });
  app.append(grid);
  for (const id of ids) {
    const src = rigSource(id);
    const card = el('a', { className: 'card', href: `gallery.html?rig=${encodeURIComponent(id)}&zoom=3` });
    if (src.problems.length > 0) {
      card.append(el('div', { className: 'bad', textContent: src.problems.join('\n') }));
    } else {
      const rig = await loadRig(id, zoom);
      const { canvas, ctx } = sheet(rig, 1);
      drawPose(ctx, rig, makePose(rig.parts.length), 0, new Float32Array(rig.parts.length * 6));
      card.append(canvas);
    }
    card.append(el('b', { textContent: id }));
    grid.append(card);
  }
}

const rigId = params.get('rig');
(rigId ? showOne(rigId) : showAll())
  .catch((err: unknown) => {
    app.append(el('div', { className: 'bad', textContent: String(err instanceof Error ? (err.stack ?? err.message) : err) }));
  })
  .finally(() => {
    document.body.dataset.ready = '1';
  });
