import { parseRig, type Dom, type RigSource } from '../rig/parse.ts';
import { rasterize, type Rig } from '../rig/raster.ts';

/**
 * Every SVG under /art, bundled as text. Editing a file while the dev server
 * runs reloads the page with the new drawing.
 */
const FILES = import.meta.glob('/art/**/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>;

const browserDom: Dom = {
  parse: (text) => new DOMParser().parseFromString(text, 'image/svg+xml'),
  serialize: (node) => new XMLSerializer().serializeToString(node),
};

const sources = new Map<string, RigSource>();
for (const [path, text] of Object.entries(FILES)) {
  const id = path.replace(/^\/art\//, '').replace(/\.svg$/, '');
  sources.set(id, parseRig(id, text, browserDom));
}

export function rigIds(): string[] {
  return [...sources.keys()].sort();
}

export function hasRig(id: string): boolean {
  return sources.has(id);
}

export function rigSource(id: string): RigSource {
  const src = sources.get(id);
  if (!src) throw new Error(`no art for "${id}" (expected art/${id}.svg)`);
  return src;
}

/** The file itself, for showing a rig's rest pose in an <img>. */
export function rigUrl(id: string): string {
  const text = FILES[`/art/${id}.svg`];
  if (text === undefined) throw new Error(`no art for "${id}"`);
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(text);
}

const cache = new Map<string, Promise<Rig>>();

/** Renders a rig's parts at `scale` pixels per rig unit. Cached per scale. */
export function loadRig(id: string, scale: number): Promise<Rig> {
  const key = `${id}@${scale.toFixed(3)}`;
  let rig = cache.get(key);
  if (!rig) {
    rig = rasterize(rigSource(id), scale);
    cache.set(key, rig);
  }
  return rig;
}

/** Drops rigs rendered at other scales, after the window was resized. */
export function forgetRigsExcept(scale: number): void {
  const suffix = `@${scale.toFixed(3)}`;
  for (const key of cache.keys()) if (!key.endsWith(suffix)) cache.delete(key);
}
