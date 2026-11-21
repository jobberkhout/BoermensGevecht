import type { ClipSet } from '../types.ts';
import { baristaBo } from './barista_bo.ts';
import { flagClips } from './flag.ts';
import { giertink } from './giertink.ts';

/**
 * Animations by art id. Units need all five clips; bases, turrets and
 * projectiles only the ones they use.
 */
export const CLIPS: Record<string, Partial<ClipSet>> = {
  'havermelk/e4/barista_bo': baristaBo,
  'achterhoek/e4/giertink': giertink,
  'flags/achterhoek': flagClips,
  'flags/amsterdam': flagClips,
};
