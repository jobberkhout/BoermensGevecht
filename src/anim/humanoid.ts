import type { Clip, Key, Track } from './types.ts';

/**
 * Building blocks for two-legged characters. Each returns ordinary clip data;
 * a unit's own clip file combines and overrides them to get its own character.
 *
 * Angles: positive turns a part clockwise on screen. For a character facing
 * right that means: a positive torso angle leans forward, a positive arm or leg
 * angle swings the hand or foot backward.
 */

/** A smooth back-and-forth around `mid`, reaching mid+amp a quarter of the way in. `phase` shifts it (0..1). */
export function swing(amp: number, mid = 0, phase = 0): Key[] {
  const base: Key[] = [
    [0, mid],
    [0.25, mid + amp, 'sineOut'],
    [0.75, mid - amp, 'sineInOut'],
    [1, mid, 'sineIn'],
  ];
  if (phase === 0) return base;
  // Shift the wave by sampling its shape at offset key times.
  const steps = 8;
  const out: Key[] = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    out.push([u, mid + amp * Math.sin((u + phase) * Math.PI * 2), 'linear']);
  }
  return out;
}

/** Up and down twice per cycle: 0 at the start and half-way, `amp` at the quarter points. */
export function bob(amp: number, mid = 0): Key[] {
  return [
    [0, mid],
    [0.25, mid + amp, 'sineInOut'],
    [0.5, mid, 'sineInOut'],
    [0.75, mid + amp, 'sineInOut'],
    [1, mid, 'sineInOut'],
  ];
}

export interface WalkStyle {
  /** Pixels covered by one full cycle (two steps). */
  stride: number;
  /** How far the legs swing, in degrees. */
  legSwing: number;
  /** Hip-to-foot length in pixels; decides how much the body dips with each step. */
  legLen: number;
  /** How far the arms swing, in degrees. */
  armSwing: number;
  /** Where the arms hang when not swinging (degrees). */
  armRest?: number;
  /** Constant forward lean of the torso (degrees). */
  lean?: number;
  /** Extra rocking of the torso with each step (degrees). */
  sway?: number;
  /** How much the head counters the torso (degrees). */
  headNod?: number;
}

/**
 * A walk in which the body dips as the legs spread, so the feet stay on the
 * ground. Front and back limbs swing in opposition.
 */
export function walk(style: WalkStyle, extra: Record<string, Track> = {}): Clip {
  const s = style.legSwing;
  const dip = style.legLen * (1 - Math.cos((s * Math.PI) / 180));
  const rest = style.armRest ?? 0;
  const lean = style.lean ?? 4;
  const sway = style.sway ?? 1.5;
  return {
    loop: true,
    stride: style.stride,
    tracks: {
      hips: { y: bob(dip) },
      leg_front: { rot: swing(-s) },
      leg_back: { rot: swing(s) },
      arm_front: { rot: swing(style.armSwing, rest) },
      arm_back: { rot: swing(-style.armSwing, rest) },
      torso: { rot: bob(sway, lean) },
      head: { rot: bob(-(style.headNod ?? 2)) },
      ...extra,
    },
  };
}

export interface IdleStyle {
  seconds: number;
  /** How much the chest rises (fraction of its height, e.g. 0.03). */
  breathe?: number;
  /** Gentle arm sway in degrees. */
  armSway?: number;
  lean?: number;
}

/** Standing and breathing. */
export function idle(style: IdleStyle, extra: Record<string, Track> = {}): Clip {
  const b = style.breathe ?? 0.03;
  const a = style.armSway ?? 3;
  return {
    loop: true,
    seconds: style.seconds,
    tracks: {
      torso: { sy: [[0, 1], [0.5, 1 + b, 'sineInOut'], [1, 1, 'sineInOut']], rot: [[0, style.lean ?? 0]] },
      head: { y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']] },
      arm_front: { rot: [[0, 0], [0.5, a, 'sineInOut'], [1, 0, 'sineInOut']] },
      arm_back: { rot: [[0, 0], [0.5, -a, 'sineInOut'], [1, 0, 'sineInOut']] },
      ...extra,
    },
  };
}

/** A quick jolt backwards, laid on top of whatever the unit is doing. */
export function flinch(extra: Record<string, Track> = {}): Clip {
  return {
    loop: false,
    seconds: 0.28,
    tracks: {
      hips: { x: [[0, 0], [0.25, -7, 'out'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.25, -14, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.3, -12, 'out'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.3, -30, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.3, 24, 'out'], [1, 0, 'inOut']] },
      ...extra,
    },
  };
}

/** Running home with the head down and the arms flapping. Loops while the unit leaves. */
export function slinkOff(style: { legLen: number; stride?: number }, extra: Record<string, Track> = {}): Clip {
  const s = 38;
  const dip = style.legLen * (1 - Math.cos((s * Math.PI) / 180));
  return {
    loop: true,
    stride: style.stride ?? 70,
    tracks: {
      hips: { y: bob(dip) },
      leg_front: { rot: swing(-s) },
      leg_back: { rot: swing(s) },
      torso: { rot: bob(3, 16) },
      head: { rot: bob(4, 12) },
      arm_front: { rot: swing(40, -120) },
      arm_back: { rot: swing(-40, -110) },
      ...extra,
    },
  };
}
