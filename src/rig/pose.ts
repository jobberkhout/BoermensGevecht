import { applyX, applyY, multiply, setTRS, type Mats } from './mat.ts';
import type { Rig } from './raster.ts';

/** How every part of a rig is turned, moved and stretched at one moment. */
export interface Pose {
  /** Degrees, clockwise on screen. */
  rot: Float32Array;
  x: Float32Array;
  y: Float32Array;
  sx: Float32Array;
  sy: Float32Array;
}

export function makePose(parts: number): Pose {
  const pose: Pose = {
    rot: new Float32Array(parts),
    x: new Float32Array(parts),
    y: new Float32Array(parts),
    sx: new Float32Array(parts),
    sy: new Float32Array(parts),
  };
  resetPose(pose);
  return pose;
}

/** Back to the rest pose: exactly what the SVG file shows. */
export function resetPose(pose: Pose): void {
  pose.rot.fill(0);
  pose.x.fill(0);
  pose.y.fill(0);
  pose.sx.fill(1);
  pose.sy.fill(1);
}

export function copyPose(from: Pose, to: Pose): void {
  to.rot.set(from.rot);
  to.x.set(from.x);
  to.y.set(from.y);
  to.sx.set(from.sx);
  to.sy.set(from.sy);
}

/** out = a moved a fraction t of the way to b. */
export function lerpPose(a: Pose, b: Pose, t: number, out: Pose): void {
  for (let i = 0; i < out.rot.length; i++) {
    out.rot[i] = a.rot[i]! + (b.rot[i]! - a.rot[i]!) * t;
    out.x[i] = a.x[i]! + (b.x[i]! - a.x[i]!) * t;
    out.y[i] = a.y[i]! + (b.y[i]! - a.y[i]!) * t;
    out.sx[i] = a.sx[i]! + (b.sx[i]! - a.sx[i]!) * t;
    out.sy[i] = a.sy[i]! + (b.sy[i]! - a.sy[i]!) * t;
  }
}

/** Lays `extra` on top of `base`, e.g. a flinch on top of a walk. */
export function addPose(base: Pose, extra: Pose, weight: number): void {
  for (let i = 0; i < base.rot.length; i++) {
    base.rot[i]! += extra.rot[i]! * weight;
    base.x[i]! += extra.x[i]! * weight;
    base.y[i]! += extra.y[i]! * weight;
    base.sx[i]! *= 1 + (extra.sx[i]! - 1) * weight;
    base.sy[i]! *= 1 + (extra.sy[i]! - 1) * weight;
  }
}

const RAD = Math.PI / 180;

/**
 * Works out where every part ends up: six matrix numbers per part, in rig
 * coordinates. A child inherits everything its parent does.
 */
export function solve(rig: Rig, pose: Pose, world: Mats): void {
  for (const i of rig.order) {
    const part = rig.parts[i]!;
    const o = i * 6;
    if (part.parent < 0) {
      setTRS(world, o, part.x + pose.x[i]!, part.y + pose.y[i]!, pose.rot[i]! * RAD, pose.sx[i]!, pose.sy[i]!);
    } else {
      const parent = rig.parts[part.parent]!;
      setTRS(
        world,
        o,
        part.x - parent.x + pose.x[i]!,
        part.y - parent.y + pose.y[i]!,
        pose.rot[i]! * RAD,
        pose.sx[i]!,
        pose.sy[i]!,
      );
      multiply(world, o, world, part.parent * 6, world, o);
    }
  }
}

const scratch = new Float32Array(6);

/**
 * Draws a solved rig. `base` (six numbers at offset `bo`) places the rig on the
 * canvas: it maps rig coordinates to real pixels, mirroring included. Pass
 * `mirrored` when it does mirror, so lettering can be flipped back.
 */
export function drawRig(
  ctx: CanvasRenderingContext2D,
  rig: Rig,
  world: Mats,
  base: Mats,
  bo = 0,
  mirrored = false,
): void {
  for (let i = 0; i < rig.parts.length; i++) {
    const part = rig.parts[i]!;
    if (part.sw === 0) continue;
    multiply(scratch, 0, base, bo, world, i * 6);
    if (mirrored && part.upright) {
      // Flip the part around its own joint: it stays where it is, but reads the right way round.
      scratch[0] = -scratch[0]!;
      scratch[1] = -scratch[1]!;
    }
    ctx.setTransform(scratch[0]!, scratch[1]!, scratch[2]!, scratch[3]!, scratch[4]!, scratch[5]!);
    ctx.drawImage(
      rig.atlas,
      part.sx,
      part.sy,
      part.sw,
      part.sh,
      -part.ox / rig.kx,
      -part.oy / rig.ky,
      part.sw / rig.kx,
      part.sh / rig.ky,
    );
  }
}

/** Where a named marker is right now, in rig coordinates. Returns false if the rig has no such marker. */
export function mountPoint(rig: Rig, world: Mats, name: string, out: { x: number; y: number }): boolean {
  const mount = rig.mounts[name];
  if (!mount) return false;
  const o = mount.part * 6;
  out.x = applyX(world, o, mount.x, mount.y);
  out.y = applyY(world, o, mount.x, mount.y);
  return true;
}
