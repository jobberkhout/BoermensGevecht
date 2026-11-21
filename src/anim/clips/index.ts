import type { ClipSet } from '../types.ts';
import { bakfietsBabette } from './bakfiets_babette.ts';
import { baristaBo } from './barista_bo.ts';
import { dronink } from './dronink.ts';
import { flagClips } from './flag.ts';
import { giertink } from './giertink.ts';
import { heitinkClips } from './turret_heitinks.ts';
import { padelPepijn } from './padel_pepijn.ts';
import { quadink } from './quadink.ts';
import { blokkadeClips } from './special_blokkade.ts';
import { kolonneClips } from './special_kolonne.ts';
import { podcastClips } from './turret_podcast.ts';

/**
 * Animations by art id. Units need all five clips; bases, turrets and
 * projectiles only the ones they use.
 */
export const CLIPS: Record<string, Partial<ClipSet>> = {
  'havermelk/e4/barista_bo': baristaBo,
  'havermelk/e4/padel_pepijn': padelPepijn,
  'havermelk/e4/bakfiets_babette': bakfietsBabette,
  'achterhoek/e4/giertink': giertink,
  'achterhoek/e4/dronink': dronink,
  'achterhoek/e4/quadink': quadink,
  'havermelk/e4/turret_podcast': podcastClips,
  'achterhoek/e4/turret_heitinks': heitinkClips,
  'achterhoek/e4/special_kolonne': kolonneClips,
  'havermelk/e4/special_blokkade': blokkadeClips,
  'flags/achterhoek': flagClips,
  'flags/amsterdam': flagClips,
};
