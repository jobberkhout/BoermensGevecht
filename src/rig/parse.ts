import { ARCHETYPES, BANNED_ELEMENTS, REQUIRED_PARTS, type Archetype } from './archetypes.ts';

/**
 * Reads one hand-written SVG file into the pieces a rig is made of.
 *
 * The file is a flat list of part groups:
 *
 *   <g id="head" data-parent="torso" transform="translate(2 -104)"> ...art around (0,0)... </g>
 *
 * The translate IS the joint: the part turns around that point. Document order
 * is draw order. (0,0) of the whole file is where the feet touch the ground,
 * and the character faces right.
 *
 * Works in the browser and in Node (tests), so it only uses the DOM basics and
 * takes its parser as an argument.
 */

export interface Dom {
  parse(text: string): Document;
  serialize(node: Node): string;
}

export interface MountSource {
  name: string;
  /** In the part's own coordinates. */
  x: number;
  y: number;
}

export interface PartSource {
  id: string;
  parent: string | null;
  /** The joint, in rig coordinates. */
  x: number;
  y: number;
  /** The group as SVG text, markers removed. */
  markup: string;
  /** True for groups without any art, such as `hips`. */
  empty: boolean;
  /**
   * Set with data-mirror="no", for lettering. When the rig is drawn facing left
   * this part is flipped back around its joint, so the text stays readable.
   * Put the joint in the middle of such a part.
   */
  upright: boolean;
  mounts: MountSource[];
}

export interface RigSource {
  id: string;
  archetype: Archetype;
  viewBox: { x: number; y: number; w: number; h: number };
  /** <style> and <defs>, to be copied into every part's own document. */
  head: string;
  /** In draw order. */
  parts: PartSource[];
  /** Everything wrong with the file. Empty means it is fine. */
  problems: string[];
}

const ELEMENT = 1;
const TRANSLATE = /^translate\(\s*(-?\d*\.?\d+)(?:[\s,]+(-?\d*\.?\d+))?\s*\)$/;
const PART_ID = /^[a-z][a-z0-9_]*$/;

function elements(node: Node): Element[] {
  const out: Element[] = [];
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i]!;
    if (child.nodeType === ELEMENT) out.push(child as Element);
  }
  return out;
}

/** Which properties each class in the file's <style> sets. Understands plain `.name { a: b; c: d }` rules. */
function classProperties(root: Element): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const el of elements(root)) {
    if (localName(el) !== 'style') continue;
    const css = el.textContent ?? '';
    for (const rule of css.matchAll(/\.([\w-]+)\s*\{([^}]*)\}/g)) {
      const props = rule[2]!
        .split(';')
        .map((decl) => decl.split(':')[0]!.trim())
        .filter(Boolean);
      out.set(rule[1]!, [...(out.get(rule[1]!) ?? []), ...props]);
    }
  }
  return out;
}

function localName(el: Element): string {
  return (el.localName || el.nodeName).replace(/^.*:/, '');
}

function walk(el: Element, visit: (el: Element) => void): void {
  visit(el);
  for (const child of elements(el)) walk(child, visit);
}

export function parseRig(id: string, text: string, dom: Dom): RigSource {
  const problems: string[] = [];
  const rig: RigSource = {
    id,
    archetype: 'static',
    viewBox: { x: 0, y: 0, w: 1, h: 1 },
    head: '',
    parts: [],
    problems,
  };

  let root: Element;
  try {
    root = dom.parse(text).documentElement;
  } catch (err) {
    problems.push(`not well-formed XML: ${String(err)}`);
    return rig;
  }
  if (!root || localName(root) !== 'svg') {
    problems.push('the root element must be <svg>');
    return rig;
  }
  if (root.getElementsByTagName('parsererror').length > 0) {
    problems.push('not well-formed XML');
    return rig;
  }

  const vb = (root.getAttribute('viewBox') ?? '').trim().split(/[\s,]+/).map(Number);
  if (vb.length === 4 && vb.every(Number.isFinite) && vb[2]! > 0 && vb[3]! > 0) {
    rig.viewBox = { x: vb[0]!, y: vb[1]!, w: vb[2]!, h: vb[3]! };
  } else {
    problems.push('missing or invalid viewBox');
  }

  const archetype = root.getAttribute('data-rig') as Archetype | null;
  if (archetype && ARCHETYPES.includes(archetype)) rig.archetype = archetype;
  else problems.push(`data-rig must be one of ${ARCHETYPES.join(', ')}`);

  // A rule in <style> beats an attribute on the element. `<path class="o" stroke="red">` is
  // therefore not red, and nothing says so. Catch it here.
  const styled = classProperties(root);
  walk(root, (el) => {
    const name = localName(el);
    if (BANNED_ELEMENTS.includes(name)) problems.push(`<${name}> is not allowed`);
    for (const cls of (el.getAttribute('class') ?? '').split(/\s+/)) {
      for (const prop of styled.get(cls) ?? []) {
        if (el.getAttribute(prop) !== null) {
          problems.push(`<${name} class="${cls}" ${prop}="${el.getAttribute(prop)}">: the class sets ${prop}, so the attribute is ignored; use style="${prop}:..." instead`);
        }
      }
    }
    for (const attr of ['href', 'xlink:href']) {
      const value = el.getAttribute(attr);
      if (value && !value.startsWith('#')) problems.push(`external reference ${value}`);
    }
  });

  for (const el of elements(root)) {
    const name = localName(el);
    if (name === 'style' || name === 'defs') {
      rig.head += dom.serialize(el);
      continue;
    }
    if (name === 'title' || name === 'desc') continue;
    if (name !== 'g' || !el.getAttribute('id')) {
      problems.push(`top-level <${name}> must be a part group with an id`);
      continue;
    }

    const partId = el.getAttribute('id')!;
    if (!PART_ID.test(partId)) problems.push(`part id "${partId}" must be lower_snake_case`);
    if (rig.parts.some((p) => p.id === partId)) problems.push(`duplicate part "${partId}"`);

    let x = 0;
    let y = 0;
    const transform = el.getAttribute('transform');
    if (transform) {
      const m = TRANSLATE.exec(transform.trim());
      if (m) {
        x = Number(m[1]);
        y = Number(m[2] ?? 0);
      } else {
        problems.push(`part "${partId}": transform must be a single translate(x y), got "${transform}"`);
      }
    }

    // Markers say where things attach (a hand, a muzzle). They are not drawn. Only one that is a direct
    // child of its part is read: inside a nested group its spot would need that group's transform too.
    const nested = (node: Element): Element[] => elements(node).flatMap((c) => [...(c.getAttribute('data-mount') ? [c] : []), ...nested(c)]);
    for (const deep of elements(el).flatMap(nested)) {
      problems.push(`part "${partId}": mount "${deep.getAttribute('data-mount')}" sits inside a nested group, where it is not read; make it a direct child of the part, in the part's own coordinates`);
    }
    const mounts: MountSource[] = [];
    for (const child of elements(el)) {
      const mount = child.getAttribute('data-mount');
      if (!mount) continue;
      mounts.push({ name: mount, x: Number(child.getAttribute('cx') ?? 0), y: Number(child.getAttribute('cy') ?? 0) });
      if (child.getAttribute('fill') !== 'none') {
        problems.push(`mount "${mount}" needs fill="none", or it shows as a dot when the file is viewed as-is`);
      }
      el.removeChild(child);
    }

    rig.parts.push({
      id: partId,
      parent: el.getAttribute('data-parent'),
      x,
      y,
      markup: dom.serialize(el),
      empty: elements(el).length === 0,
      upright: el.getAttribute('data-mirror') === 'no',
      mounts,
    });
  }

  checkStructure(rig);
  return rig;
}

function checkStructure(rig: RigSource): void {
  const { parts, problems } = rig;
  if (parts.length === 0) problems.push('no parts found');
  const byId = new Map(parts.map((p) => [p.id, p]));

  for (const part of parts) {
    if (part.parent !== null && !byId.has(part.parent)) {
      problems.push(`part "${part.id}" hangs from unknown part "${part.parent}"`);
    }
    // Follow the chain of parents; it must end, not loop.
    const seen = new Set<string>();
    let at: PartSource | undefined = part;
    while (at) {
      if (seen.has(at.id)) {
        problems.push(`part "${part.id}" is its own ancestor`);
        break;
      }
      seen.add(at.id);
      at = at.parent ? byId.get(at.parent) : undefined;
    }
  }

  for (const needed of REQUIRED_PARTS[rig.archetype]) {
    if (!byId.has(needed)) problems.push(`a ${rig.archetype} rig needs a part called "${needed}"`);
  }

  const mountNames = parts.flatMap((p) => p.mounts.map((m) => m.name));
  for (const name of new Set(mountNames)) {
    if (mountNames.filter((n) => n === name).length > 1) problems.push(`mount "${name}" is defined twice`);
  }
}
