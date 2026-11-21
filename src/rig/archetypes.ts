/**
 * The kinds of rig and the parts each kind must have. Clip building blocks rely
 * on these names, so a rig that misses one fails the lint instead of animating wrong.
 */
export type Archetype = 'humanoid' | 'vehicle' | 'static';

export const ARCHETYPES: readonly Archetype[] = ['humanoid', 'vehicle', 'static'];

export const REQUIRED_PARTS: Record<Archetype, readonly string[]> = {
  // `hips` is an empty group: legs and torso hang from it, so the torso can lean without dragging the legs.
  humanoid: ['hips', 'leg_back', 'leg_front', 'torso', 'head', 'arm_back', 'arm_front'],
  // `chassis` is an empty group everything hangs from, so one track can shove the whole
  // vehicle. Wheels are separate so they can spin; the rest bounces along on `body`.
  vehicle: ['chassis', 'body', 'wheel_back', 'wheel_front'],
  // Bases, turrets, projectiles, flags: any parts they like.
  static: [],
};

/** SVG features that do not survive being loaded as an image, or that we simply do not want. */
export const BANNED_ELEMENTS: readonly string[] = ['text', 'image', 'filter', 'mask', 'foreignObject', 'script', 'a'];
