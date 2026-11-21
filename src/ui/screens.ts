import { DEFAULT_FACTIONS, FACTIONS, eraOf } from '../defs/index.ts';
import type { FactionId } from '../defs/types.ts';
import type { Side } from '../sim/types.ts';
import { setPicture } from './hud.ts';
import { KEY_LABEL, type Action } from './input.ts';
import { NL, nameOf } from './nl.ts';

/** The cards laid over the battle: the title, pause, and who won. */

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function keyRow(grid: HTMLElement, key: string, rig: string, name: string, blurb: string, flip = true): void {
  // Drawings with lettering in them are shown as drawn; mirroring would turn NEE into EEN.
  const picture = el('i', flip ? 'pic flip' : 'pic');
  setPicture(picture, rig, '');
  const text = el('div');
  text.append(el('b', '', name), document.createTextNode(' '), el('span', '', blurb));
  grid.append(el('kbd', '', key), picture, text);
}

/** The drawing that stands for each special on the title card. */
const SPECIAL_ART: Record<string, string> = {
  'hm.e4.special': 'havermelk/e4/special_blokkade',
  'ah.e4.special': 'achterhoek/e4/special_kolonne',
};

function sideCard(side: Side, faction: FactionId): HTMLElement {
  const era = eraOf(faction, 0);
  const box = el('div', side === 0 ? 'side' : 'side right');
  const head = el('h3');
  const flag = el('div', 'flag');
  setPicture(flag, FACTIONS[faction].flagRig, '');
  const title = el('div', '', NL.faction[faction].name);
  title.append(el('small', '', `${side === 0 ? NL.start.left : NL.start.right} · ${NL.faction[faction].place}`));
  head.append(flag, title);

  const keys = el('div', 'keys');
  const label = KEY_LABEL[side];
  era.units.forEach((unit, slot) => {
    keyRow(keys, label[`buy${slot}` as Action], unit.rig, nameOf(unit.id), NL.blurbs[unit.id] ?? '');
  });
  keyRow(keys, label.turret, era.turret.rig, nameOf(era.turret.id), NL.blurbs[era.turret.id] ?? '', false);
  keyRow(keys, label.special, SPECIAL_ART[era.special.id] ?? '', nameOf(era.special.id), NL.blurbs[era.special.id] ?? '');
  box.append(head, keys);
  return box;
}

export class Screens {
  private title: HTMLElement;
  private pause: HTMLElement;
  private over: HTMLElement;
  private overHead: HTMLElement;
  private overSub: HTMLElement;

  constructor(root: HTMLElement, onConfirm: () => void, onResume: () => void) {
    // Title: what the game is, who presses what.
    this.title = el('div', 'screen');
    const card = el('div', 'card');
    const versus = el('div', 'versus');
    versus.append(sideCard(0, DEFAULT_FACTIONS[0]), el('div', 'vs', 'VS'), sideCard(1, DEFAULT_FACTIONS[1]));
    const go = el('button', 'go', NL.start.go);
    go.type = 'button';
    go.addEventListener('click', onConfirm);
    card.append(el('h1', '', NL.title), el('h2', '', NL.tagline), versus, el('p', '', `${NL.start.goal} ${NL.start.pause}.`), go);
    this.title.append(card);

    this.pause = el('div', 'screen');
    const pauseCard = el('div', 'card');
    const resume = el('button', 'go', NL.hud.resume);
    resume.type = 'button';
    resume.addEventListener('click', onResume);
    pauseCard.append(el('h1', '', NL.hud.paused), resume);
    this.pause.append(pauseCard);

    this.over = el('div', 'screen');
    const overCard = el('div', 'card');
    this.overHead = el('h1');
    this.overSub = el('h2');
    const again = el('button', 'go', NL.win.again);
    again.type = 'button';
    again.addEventListener('click', onConfirm);
    overCard.append(this.overHead, this.overSub, again);
    this.over.append(overCard);

    this.pause.hidden = true;
    this.over.hidden = true;
    root.append(this.title, this.pause, this.over);
  }

  showTitle(on: boolean): void {
    this.title.hidden = !on;
  }

  showPause(on: boolean): void {
    this.pause.hidden = !on;
  }

  showWinner(winner: FactionId | 'draw' | null): void {
    this.over.hidden = winner === null;
    if (winner === null) return;
    this.overHead.textContent = NL.win[winner].head;
    this.overSub.textContent = NL.win[winner].sub;
  }
}
