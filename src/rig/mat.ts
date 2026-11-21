/**
 * 2D affine matrices stored six numbers at a time in one array, in canvas order:
 *   x' = a*x + c*y + e
 *   y' = b*x + d*y + f
 */
export type Mats = Float32Array;

export function setIdentity(out: Mats, o: number): void {
  out[o] = 1;
  out[o + 1] = 0;
  out[o + 2] = 0;
  out[o + 3] = 1;
  out[o + 4] = 0;
  out[o + 5] = 0;
}

/** Translate, then rotate (radians, clockwise on screen), then scale. */
export function setTRS(out: Mats, o: number, tx: number, ty: number, rot: number, sx: number, sy: number): void {
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  out[o] = cos * sx;
  out[o + 1] = sin * sx;
  out[o + 2] = -sin * sy;
  out[o + 3] = cos * sy;
  out[o + 4] = tx;
  out[o + 5] = ty;
}

/** out = a * b (b is applied first). `out` may be the same array as `b`, at the same offset. */
export function multiply(out: Mats, oo: number, a: Mats, ao: number, b: Mats, bo: number): void {
  const a0 = a[ao]!, a1 = a[ao + 1]!, a2 = a[ao + 2]!, a3 = a[ao + 3]!, a4 = a[ao + 4]!, a5 = a[ao + 5]!;
  const b0 = b[bo]!, b1 = b[bo + 1]!, b2 = b[bo + 2]!, b3 = b[bo + 3]!, b4 = b[bo + 4]!, b5 = b[bo + 5]!;
  out[oo] = a0 * b0 + a2 * b1;
  out[oo + 1] = a1 * b0 + a3 * b1;
  out[oo + 2] = a0 * b2 + a2 * b3;
  out[oo + 3] = a1 * b2 + a3 * b3;
  out[oo + 4] = a0 * b4 + a2 * b5 + a4;
  out[oo + 5] = a1 * b4 + a3 * b5 + a5;
}

export function applyX(m: Mats, o: number, x: number, y: number): number {
  return m[o]! * x + m[o + 2]! * y + m[o + 4]!;
}

export function applyY(m: Mats, o: number, x: number, y: number): number {
  return m[o + 1]! * x + m[o + 3]! * y + m[o + 5]!;
}
