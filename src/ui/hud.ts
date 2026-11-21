import { TPS } from '../defs/balance.ts';
import { FACTIONS, eraOf, unitDef } from '../defs/index.ts';
import { hasRig, rigUrl } from '../render/assets.ts';
import { canDo } from '../sim/commands.ts';
import { SIDES, type Side, type SimState } from '../sim/types.ts';
import { ACTIONS, KEY_LABEL, commandOf, type Action } from './input.ts';
import { NL, nameOf } from './nl.ts';

/** The buttons and gauges around the battlefield. Plain HTML laid over the canvas. */

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

/** Shows a rig's rest pose as a picture, or a letter when the art does not exist yet. */
export function setPicture(node: HTMLElement, rigId: string, fallback: string): void {
  if (hasRig(rigId)) {
    node.style.backgroundImage = `url("${rigUrl(rigId)}")`;
    node.textContent = '';
    node.classList.remove('letter');
  } else {
    node.style.backgroundImage = '';
    node.textContent = fallback;
    node.classList.add('letter');
  }
}

interface ButtonParts {
  root: HTMLButtonElement;
  pic: HTMLElement | null;
  label: HTMLElement;
  cost: HTMLElement;
  cool: HTMLElement | null;
}

interface SideParts {
  flag: HTMLElement;
  name: HTMLElement;
  hp: HTMLElement;
  hpFill: HTMLElement;
  hpText: HTMLElement;
  gold: HTMLElement;
  money: HTMLElement;
  pips: HTMLElement[];
  buttons: Record<Action, ButtonParts>;
  why: HTMLElement;
  whyTimer: number;
  /** Which era the labels were last written for. */
  era: number;
}

export class Hud {
  private sides: [SideParts, SideParts];
  private clock: HTMLElement;
  private banner: HTMLElement;
  /** Last text written per element, so unchanged values never touch the page. */
  private written = new WeakMap<HTMLElement, string>();

  private readonly root: HTMLElement;
  private readonly onPress: (side: Side, action: Action) => void;

  constructor(root: HTMLElement, onPress: (side: Side, action: Action) => void) {
    this.root = root;
    this.onPress = onPress;
    const top = el('div', 'top');
    this.clock = el('div', 'clock', '0:00');
    this.banner = el('div', 'banner', NL.hud.overtime);
    this.banner.hidden = true;
    const left = this.buildSide(0);
    const right = this.buildSide(1);
    top.append(left.team, this.clock, right.team);
    root.append(top, this.banner, left.panel, right.panel);
    this.sides = [left.parts, right.parts];
  }

  private buildSide(side: Side): { team: HTMLElement; panel: HTMLElement; parts: SideParts } {
    const where = side === 0 ? 'left' : 'right';

    const team = el('div', `team ${where}`);
    const flag = el('div', 'flag');
    const who = el('div', 'who');
    const name = el('div', 'name');
    const hp = el('div', 'hp');
    const hpFill = el('i');
    const hpText = el('span');
    hp.append(hpFill, hpText);
    who.append(name, hp);
    team.append(flag, who);

    const panel = el('div', `panel ${where}`);
    const status = el('div', 'status');
    const purse = el('div', 'purse');
    const gold = el('b');
    const money = el('small');
    purse.append(gold, money);
    const queue = el('div', 'queue');
    const pips: HTMLElement[] = [];
    for (let i = 0; i < 5; i++) {
      const pip = el('i');
      const fill = el('b');
      pip.append(fill);
      queue.append(pip);
      pips.push(fill);
    }
    status.append(purse, queue);

    const grid = el('div', 'buttons');
    const buttons = {} as Record<Action, ButtonParts>;
    for (const action of ACTIONS) {
      const wide = !action.startsWith('buy');
      const root = el('button', wide ? 'btn wide' : 'btn');
      root.type = 'button';
      const pic = wide ? null : el('div', 'pic');
      const label = el('div', 'label');
      const cost = el('div', 'cost');
      const cool = action === 'special' ? el('div', 'cool') : null;
      const key = el('kbd', '', KEY_LABEL[side][action]);
      if (pic) root.append(pic);
      root.append(label, cost, key);
      if (cool) root.append(cool);
      root.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.onPress(side, action);
      });
      grid.append(root);
      buttons[action] = { root, pic, label, cost, cool };
    }

    const why = el('div', 'why');
    panel.append(why, status, grid);
    return { team, panel, parts: { flag, name, hp, hpFill, hpText, gold, money, pips, buttons, why, whyTimer: 0, era: -1 } };
  }

  private write(node: HTMLElement, text: string): void {
    if (this.written.get(node) === text) return;
    this.written.set(node, text);
    node.textContent = text;
  }

  /** Names, pictures and prices: these only change when a side modernizes. */
  private label(s: SimState, side: Side): void {
    const parts = this.sides[side];
    const state = s.sides[side];
    const faction = FACTIONS[state.faction];
    const era = eraOf(state.faction, state.era);
    parts.era = state.era;

    setPicture(parts.flag, faction.flagRig, '');
    this.write(parts.name, NL.faction[state.faction].name);
    this.write(parts.money, NL.faction[state.faction].money);

    era.units.forEach((unit, slot) => {
      const b = parts.buttons[`buy${slot}` as Action];
      if (b.pic) setPicture(b.pic, unit.rig, unit.role[0]!.toUpperCase());
      this.write(b.label, nameOf(unit.id));
      this.write(b.cost, String(unit.cost));
    });
    this.write(parts.buttons.special.label, nameOf(era.special.id));
    this.write(parts.buttons.eraUp.label, NL.hud.eraUp);
    this.write(parts.buttons.eraUp.cost, era.eraUpCost === null ? '' : String(era.eraUpCost));

    // With a single era there is nothing to modernize to, so the button makes way
    // and the other two share the row.
    const hasNext = state.era + 1 < faction.eras.length;
    parts.buttons.eraUp.root.style.display = hasNext ? '' : 'none';
    parts.buttons.turret.root.style.gridColumn = hasNext ? 'span 2' : 'span 3';
    parts.buttons.special.root.style.gridColumn = hasNext ? 'span 2' : 'span 3';
  }

  update(s: SimState): void {
    const seconds = Math.floor(s.tick / TPS);
    this.write(this.clock, `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`);

    for (const side of SIDES) {
      const parts = this.sides[side];
      const state = s.sides[side];
      if (parts.era !== state.era) this.label(s, side);
      const era = eraOf(state.faction, state.era);

      const share = Math.max(0, state.baseHp / state.baseMaxHp);
      parts.hpFill.style.width = `${(share * 100).toFixed(1)}%`;
      parts.hp.classList.toggle('low', share < 0.3);
      this.write(parts.hpText, `${state.baseHp} / ${state.baseMaxHp}`);
      this.write(parts.gold, String(state.gold));

      parts.pips.forEach((pip, i) => {
        const item = state.queue[i];
        if (!item) {
          pip.style.width = '0';
        } else if (i === 0) {
          pip.style.width = `${(100 * (1 - item.left / unitDef(item.def).buildTicks)).toFixed(0)}%`;
          pip.style.opacity = '1';
        } else {
          pip.style.width = '100%';
          pip.style.opacity = '0.4';
        }
      });

      for (const action of ACTIONS) {
        parts.buttons[action].root.classList.toggle('off', !canDo(s, side, commandOf(action)));
      }

      const turret = parts.buttons.turret;
      const full = !state.turrets.includes(null);
      this.write(turret.label, full ? `${nameOf(era.turret.id)}: ${NL.hud.turretFull}` : nameOf(era.turret.id));
      this.write(turret.cost, full ? '' : String(era.turret.cost));

      const special = parts.buttons.special;
      const wait = state.specialReadyAt - s.tick;
      const total = state.specialReadyAt === era.special.firstReady ? era.special.firstReady : era.special.cooldown;
      special.cool?.style.setProperty('--cool', wait > 0 ? (wait / total).toFixed(3) : '0');
    }
  }

  setOvertime(on: boolean): void {
    this.banner.hidden = !on;
  }

  /** The button dips, whether it was a key or a finger that pressed it. */
  pulse(side: Side, action: Action): void {
    const root = this.sides[side].buttons[action].root;
    root.classList.add('pressed');
    window.setTimeout(() => root.classList.remove('pressed'), 110);
  }

  /** The button shakes its head and says why not. */
  refuse(side: Side, action: Action, reason: string): void {
    const parts = this.sides[side];
    const root = parts.buttons[action].root;
    root.classList.remove('shake');
    void root.offsetWidth; // restart the animation
    root.classList.add('shake');
    parts.why.textContent = reason;
    parts.why.classList.add('show');
    window.clearTimeout(parts.whyTimer);
    parts.whyTimer = window.setTimeout(() => parts.why.classList.remove('show'), 900);
  }

  show(visible: boolean): void {
    this.root.querySelectorAll<HTMLElement>('.top, .panel').forEach((node) => {
      node.style.visibility = visible ? '' : 'hidden';
    });
    if (!visible) this.banner.hidden = true;
  }
}
