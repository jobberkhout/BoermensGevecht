import type { Archetype } from './archetypes.ts';
import type { RigSource } from './parse.ts';

/**
 * Turns a parsed SVG into bitmaps the canvas can draw fast.
 *
 * Each part is rendered by the browser as its own small SVG document, trimmed
 * to the pixels it actually covers, and packed into one atlas per rig. Browser
 * only: this is the one module that needs a real <canvas>.
 */

export interface Part {
  id: string;
  /** Index of the parent part, or -1. */
  parent: number;
  /** The joint, in rig coordinates. */
  x: number;
  y: number;
  /** Where this part's pixels sit in the atlas. `sw` is 0 for a part without art. */
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  /** The joint's position inside that rectangle, in atlas pixels. */
  ox: number;
  oy: number;
  /** Stays readable when the rig is mirrored (lettering). */
  upright: boolean;
}

export interface Mount {
  part: number;
  x: number;
  y: number;
}

export interface Rig {
  id: string;
  archetype: Archetype;
  viewBox: { x: number; y: number; w: number; h: number };
  atlas: HTMLCanvasElement;
  /** Atlas pixels per rig unit, per axis. */
  kx: number;
  ky: number;
  /** In draw order. */
  parts: Part[];
  /** Part indices with every parent before its children. */
  order: number[];
  index: Record<string, number>;
  mounts: Record<string, Mount>;
}

const PAD = 2;

/** Lets the browser render a complete SVG document into an image. */
export function loadImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('the browser could not render this SVG'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

interface Bounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The smallest rectangle holding every non-transparent pixel, or null when there are none. */
function alphaBounds(data: Uint8ClampedArray, width: number, height: number): Bounds | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    const row = y * width * 4 + 3;
    for (let x = 0; x < width; x++) {
      if (data[row + x * 4]! !== 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/**
 * The opening tag of a standalone document for (part of) a rig. Browsers treat
 * an SVG image without explicit pixel dimensions differently from one another,
 * so every document we hand them states its own.
 */
export function openTag(src: RigSource, width: number, height: number): string {
  const vb = src.viewBox;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" width="${width}" height="${height}">`;
}

interface Piece {
  canvas: HTMLCanvasElement | null;
  bounds: Bounds;
}

export async function rasterize(src: RigSource, scale: number): Promise<Rig> {
  if (src.problems.length > 0) {
    throw new Error(`rig ${src.id} has problems:\n  ${src.problems.join('\n  ')}`);
  }
  const vb = src.viewBox;
  const width = Math.max(1, Math.ceil(vb.w * scale));
  const height = Math.max(1, Math.ceil(vb.h * scale));
  const kx = width / vb.w;
  const ky = height / vb.h;

  const open = openTag(src, width, height);

  const pieces: Piece[] = await Promise.all(
    src.parts.map(async (part): Promise<Piece> => {
      if (part.empty) return { canvas: null, bounds: { x: 0, y: 0, w: 0, h: 0 } };
      const img = await loadImage(`${open}${src.head}${part.markup}</svg>`);
      const scratch = document.createElement('canvas');
      scratch.width = width;
      scratch.height = height;
      const ctx = scratch.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0, width, height);
      let bounds: Bounds | null = { x: 0, y: 0, w: width, h: height };
      try {
        bounds = alphaBounds(ctx.getImageData(0, 0, width, height).data, width, height);
      } catch {
        // A browser that refuses to read the pixels back still draws them fine; keep the whole frame.
      }
      if (!bounds) return { canvas: null, bounds: { x: 0, y: 0, w: 0, h: 0 } };
      return { canvas: scratch, bounds };
    }),
  );

  // Shelf packing, tallest first.
  const area = pieces.reduce((sum, p) => sum + (p.bounds.w + PAD * 2) * (p.bounds.h + PAD * 2), 0);
  const widest = pieces.reduce((max, p) => Math.max(max, p.bounds.w + PAD * 2), 1);
  const atlasWidth = Math.max(widest, Math.ceil(Math.sqrt(area * 1.3)));
  const byHeight = pieces.map((_, i) => i).sort((a, b) => pieces[b]!.bounds.h - pieces[a]!.bounds.h);
  const slots: { x: number; y: number }[] = pieces.map(() => ({ x: 0, y: 0 }));
  let cursorX = 0;
  let cursorY = 0;
  let shelf = 0;
  for (const i of byHeight) {
    const b = pieces[i]!.bounds;
    if (b.w === 0) continue;
    const w = b.w + PAD * 2;
    const h = b.h + PAD * 2;
    if (cursorX + w > atlasWidth) {
      cursorX = 0;
      cursorY += shelf;
      shelf = 0;
    }
    slots[i] = { x: cursorX + PAD, y: cursorY + PAD };
    cursorX += w;
    shelf = Math.max(shelf, h);
  }

  const atlas = document.createElement('canvas');
  atlas.width = Math.max(1, atlasWidth);
  atlas.height = Math.max(1, cursorY + shelf);
  const actx = atlas.getContext('2d')!;

  const index: Record<string, number> = {};
  src.parts.forEach((p, i) => (index[p.id] = i));

  const parts: Part[] = src.parts.map((p, i) => {
    const piece = pieces[i]!;
    const slot = slots[i]!;
    const b = piece.bounds;
    if (piece.canvas && b.w > 0) {
      actx.drawImage(piece.canvas, b.x, b.y, b.w, b.h, slot.x, slot.y, b.w, b.h);
      // Hand the scratch canvas back; some phones cap total canvas memory.
      piece.canvas.width = 0;
      piece.canvas.height = 0;
    }
    return {
      id: p.id,
      parent: p.parent === null ? -1 : index[p.parent]!,
      x: p.x,
      y: p.y,
      sx: slot.x,
      sy: slot.y,
      sw: b.w,
      sh: b.h,
      ox: (p.x - vb.x) * kx - b.x,
      oy: (p.y - vb.y) * ky - b.y,
      upright: p.upright,
    };
  });

  // Parents before children, so one pass can build every part's matrix.
  const order: number[] = [];
  const placed = new Set<number>();
  const place = (i: number): void => {
    if (placed.has(i)) return;
    const parent = parts[i]!.parent;
    if (parent >= 0) place(parent);
    placed.add(i);
    order.push(i);
  };
  parts.forEach((_, i) => place(i));

  const mounts: Record<string, Mount> = {};
  src.parts.forEach((p, i) => {
    for (const m of p.mounts) mounts[m.name] = { part: i, x: m.x, y: m.y };
  });

  return { id: src.id, archetype: src.archetype, viewBox: vb, atlas, kx, ky, parts, order, index, mounts };
}
