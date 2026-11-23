import { FACTIONS, eraOf } from '../defs/index.ts';
import type { FactionId } from '../defs/types.ts';
import type { Side } from '../sim/types.ts';
import { setPicture } from './hud.ts';
import { KEY_LABEL, type Action } from './input.ts';
import { NL, nameOf } from './nl.ts';

/** The cards laid over the battle: the title with the choice of factions, pause, and who won. */

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

export interface ScreenHandlers {
  confirm(): void;
  resume(): void;
  /** A player steps to the previous (-1) or next (+1) faction. */
  pick(side: Side, step: -1 | 1): void;
  /** From the end of a match back to the title card. */
  back(): void;
}

export class Screens {
  private title: HTMLElement;
  private versus: HTMLElement;
  private pause: HTMLElement;
  private over: HTMLElement;
  private overHead: HTMLElement;
  private overSub: HTMLElement;
  private readonly handlers: ScreenHandlers;

  constructor(root: HTMLElement, handlers: ScreenHandlers) {
    this.handlers = handlers;

    // Title: what the game is, who plays what, who presses what.
    this.title = el('div', 'screen');
    const card = el('div', 'card');
    this.versus = el('div', 'versus');
    const go = el('button', 'go', NL.start.go);
    go.type = 'button';
    go.addEventListener('click', () => handlers.confirm());
    card.append(
      el('h1', '', NL.title),
      el('h2', '', NL.tagline),
      this.versus,
      el('p', '', `${NL.start.goal} ${NL.start.eras} ${NL.start.pause}.`),
      go,
    );
    this.title.append(card);

    this.pause = el('div', 'screen');
    const pauseCard = el('div', 'card');
    const resume = el('button', 'go', NL.hud.resume);
    resume.type = 'button';
    resume.addEventListener('click', () => handlers.resume());
    const quit = el('button', 'go quiet', NL.hud.quit);
    quit.type = 'button';
    quit.addEventListener('click', () => handlers.back());
    pauseCard.append(el('h1', '', NL.hud.paused), resume, quit);
    this.pause.append(pauseCard);

    this.over = el('div', 'screen');
    const overCard = el('div', 'card');
    this.overHead = el('h1');
    this.overSub = el('h2');
    const again = el('button', 'go', NL.again);
    again.type = 'button';
    again.addEventListener('click', () => handlers.confirm());
    const back = el('button', 'go quiet', NL.start.back);
    back.type = 'button';
    back.addEventListener('click', () => handlers.back());
    overCard.append(this.overHead, this.overSub, again, back);
    this.over.append(overCard);

    this.pause.hidden = true;
    this.over.hidden = true;
    root.append(this.title, this.pause, this.over);
  }

  /** Shows which faction each player has picked, and what its first era fields. */
  setFactions(picks: readonly [FactionId, FactionId]): void {
    this.versus.replaceChildren(this.sideCard(0, picks[0]), el('div', 'vs', 'VS'), this.sideCard(1, picks[1]));
  }

  private sideCard(side: Side, faction: FactionId): HTMLElement {
    const era = eraOf(faction, 0);
    const label = KEY_LABEL[side];
    const box = el('div', side === 0 ? 'side' : 'side right');
    box.dataset.faction = faction;

    // Whose side this is, and the two arrows with which that player steps through the factions.
    const head = el('h3');
    const flag = el('div', 'flag');
    setPicture(flag, FACTIONS[faction].flagRig, '');
    const title = el('div', 'who', NL.faction[faction].name);
    // What its units are like, so the choice is about more than the pictures.
    title.append(el('em', 'trait', NL.faction[faction].trait));
    title.append(el('small', '', `${side === 0 ? NL.start.left : NL.start.right} · ${NL.faction[faction].place}`));
    const arrow = (step: -1 | 1, key: string, hint: string): HTMLButtonElement => {
      const button = el('button', 'arrow');
      button.type = 'button';
      button.title = hint;
      button.setAttribute('aria-label', hint);
      const mark = el('span', '', step < 0 ? '◀' : '▶');
      if (step < 0) button.append(el('kbd', '', key), mark);
      else button.append(mark, el('kbd', '', key));
      button.addEventListener('click', () => this.handlers.pick(side, step));
      return button;
    };
    // On the title card the turret key steps back and the subsidie key steps on.
    head.append(arrow(-1, label.turret, NL.start.previous), flag, title, arrow(1, label.subsidy, NL.start.next));

    const keys = el('div', 'keys');
    era.units.forEach((unit, slot) => {
      keyRow(keys, label[`buy${slot}` as Action], unit.rig, nameOf(unit.id), NL.blurbs[unit.id] ?? '');
    });
    keyRow(keys, label.turret, era.turret.rig, nameOf(era.turret.id), NL.blurbs[era.turret.id] ?? '', false);
    keyRow(keys, label.special, era.special.rig ?? '', nameOf(era.special.id), NL.blurbs[era.special.id] ?? '');
    // What the last two keys do is the same in every era; the picture shows what is to come.
    const future = FACTIONS[faction].eras.at(-1)!;
    keyRow(keys, label.subsidy, '', NL.start.subsidy.name, NL.start.subsidy.blurb);
    keyRow(keys, label.eraUp, future.units.at(-1)!.rig, NL.start.eraUp.name, NL.start.eraUp.blurb);
    box.append(head, keys);
    return box;
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
    const text = winner === 'draw' ? NL.draw : NL.win[winner]!;
    this.overHead.textContent = text.head;
    this.overSub.textContent = text.sub;
  }
}
