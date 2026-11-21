import type { ClipSet } from '../types.ts';
import { baristaBo } from './barista_bo.ts';
import { flagClips } from './flag.ts';
import { giertink } from './giertink.ts';
import { heitinkClips } from './turret_heitinks.ts';
import { podcastClips } from './turret_podcast.ts';

/**
 * Animations by art id. Units need all five clips; bases, turrets and
 * projectiles only the ones they use.
 */
export const CLIPS: Record<string, Partial<ClipSet>> = {
  'havermelk/e4/barista_bo': baristaBo,
  'achterhoek/e4/giertink': giertink,
  'havermelk/e4/turret_podcast': podcastClips,
  'achterhoek/e4/turret_heitinks': heitinkClips,
  'flags/achterhoek': flagClips,
  'flags/amsterdam': flagClips,
};
