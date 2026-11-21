import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { describe, expect, it } from 'vitest';
import { CLIPS } from '../src/anim/clips/index.ts';
import { CLIP_NAMES, type Clip, type Key } from '../src/anim/types.ts';
import { FACTIONS } from '../src/defs/index.ts';
import { parseRig, type Dom, type RigSource } from '../src/rig/parse.ts';
import { NL } from '../src/ui/nl.ts';

/** Lints every drawing and every animation, so a typo fails here instead of on screen. */

const ART = join(import.meta.dirname, '..', 'art');

const dom: Dom = {
  parse: (text) =>
    new DOMParser({
      onError: (level, message) => {
        if (level !== 'warning') throw new Error(message);
      },
    }).parseFromString(text, 'image/svg+xml') as unknown as Document,
  serialize: (node) => new XMLSerializer().serializeToString(node as never),
};

function svgFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return svgFiles(path);
    return entry.name.endsWith('.svg') ? [path] : [];
  });
}

const rigs = new Map<string, RigSource>();
for (const file of svgFiles(ART)) {
  const id = relative(ART, file).replace(/\\/g, '/').replace(/\.svg$/, '');
  rigs.set(id, parseRig(id, readFileSync(file, 'utf8'), dom));
}

function keyProblems(keys: readonly Key[], where: string): string[] {
  const out: string[] = [];
  keys.forEach((key, i) => {
    if (key[0] < 0 || key[0] > 1) out.push(`${where}: key ${i} is at ${key[0]}, outside 0..1`);
    if (i > 0 && key[0] <= keys[i - 1]![0]) out.push(`${where}: key ${i} does not come after key ${i - 1}`);
    if (!Number.isFinite(key[1])) out.push(`${where}: key ${i} has no number`);
  });
  return out;
}

function clipProblems(rig: RigSource, name: string, clip: Clip): string[] {
  const out: string[] = [];
  const parts = new Set(rig.parts.map((p) => p.id));
  for (const [part, track] of Object.entries(clip.tracks)) {
    if (!parts.has(part)) out.push(`${name}: animates "${part}", which ${rig.id} does not have`);
    for (const channel of ['rot', 'x', 'y', 'sx', 'sy'] as const) {
      const keys = track[channel];
      if (keys) out.push(...keyProblems(keys, `${name}.${part}.${channel}`));
    }
    if (track.rate !== undefined && (!Number.isInteger(track.rate) || track.rate < 1)) {
      out.push(`${name}.${part}: rate must be a whole number, or the loop will jump`);
    }
  }
  if (name === 'attack' && rig.archetype !== 'static') {
    // The game decides when a unit's blow lands; the clip must say which frame that is.
    const hit = clip.markers?.hit;
    if (hit === undefined || hit <= 0 || hit >= 1) out.push('attack: needs a hit marker between 0 and 1');
    if (clip.loop) out.push('attack: must not loop');
  } else if (!clip.seconds && !clip.stride) {
    out.push(`${name}: needs either seconds or stride`);
  }
  if ((name === 'walk' || name === 'idle' || name === 'die') && !clip.loop) out.push(`${name}: must loop`);
  return out;
}

describe('art', () => {
  it('finds the drawings', () => {
    expect(rigs.size).toBeGreaterThan(0);
  });

  for (const [id, rig] of rigs) {
    it(`${id}.svg follows the rig conventions`, () => {
      expect(rig.problems).toEqual([]);
    });
  }
});

describe('animations', () => {
  for (const [id, clips] of Object.entries(CLIPS)) {
    it(`${id}: clips fit the rig`, () => {
      const rig = rigs.get(id);
      expect(rig, `clips registered for ${id}, but art/${id}.svg does not exist`).toBeDefined();
      const problems = Object.entries(clips).flatMap(([name, clip]) => clipProblems(rig!, name, clip));
      expect(problems).toEqual([]);
    });
  }

  it('every unit that has art has all five clips', () => {
    const missing: string[] = [];
    for (const faction of Object.values(FACTIONS)) {
      for (const era of faction.eras) {
        for (const unit of era.units) {
          if (!rigs.has(unit.rig)) continue; // still a grey box
          for (const name of CLIP_NAMES) if (!CLIPS[unit.rig]?.[name]) missing.push(`${unit.rig}: ${name}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});

describe('text', () => {
  it('everything a player can buy or use has a name and a description', () => {
    const missing: string[] = [];
    for (const faction of Object.values(FACTIONS)) {
      for (const era of faction.eras) {
        const ids = [...era.units.map((u) => u.id), era.turret.id, era.special.id];
        for (const id of ids) {
          if (!NL.names[id]) missing.push(`name for ${id}`);
          if (!NL.blurbs[id]) missing.push(`description for ${id}`);
        }
        if (!NL.era[era.id]) missing.push(`era name for ${era.id}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
