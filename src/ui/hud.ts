import type { SoundMode } from '../audio/sound.ts';
import { SUBSIDY, TPS, TURRET } from '../defs/balance.ts';
import { FACTIONS, eraOf, unitDef } from '../defs/index.ts';
import { hasRig, rigUrl } from '../render/assets.ts';
import { canDo, progressNeeded, subsidyCost, turretPlan } from '../sim/commands.ts';
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
  /** Unit buttons show the unit. */
  pic: HTMLElement | null;
  label: HTMLElement;
  /** The small line under the name on the four action buttons. */
  sub: HTMLElement | null;
  cost: HTMLElement;
  /** The special button darkens from the top while it recharges. */
  cool: HTMLElement | null;
  /** The modernize button fills from the left as vooruitgang comes in. */
  fill: HTMLElement | null;
}

interface SideParts {
  flag: HTMLElement;
  name: HTMLElement;
  eraName: HTMLElement;
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
  private readonly muteButton: HTMLButtonElement;

  constructor(root: HTMLElement, onPress: (side: Side, action: Action) => void, onMute: () => void) {
    this.root = root;
    this.onPress = onPress;
    const top = el('div', 'top');
    const middle = el('div', 'middle');
    this.clock = el('div', 'clock', '0:00');
    this.muteButton = el('button', 'mute');
    this.muteButton.type = 'button';
    // A loudspeaker and a note. A stroke through the note means no music, through both means silence.
    this.muteButton.innerHTML =
      '<svg viewBox="0 0 36 24" aria-hidden="true"><path class="spk" d="M3 9h4l5-4v14l-5-4H3z"/><path class="waves" d="M15 9q2.5 3 0 6"/>' +
      '<path class="stem" d="M24 17V6l8-2v10"/><circle class="head" cx="21.8" cy="17" r="2.4"/><circle class="head" cx="29.8" cy="14" r="2.4"/>' +
      '<path class="no-music" d="M19 21L34 3"/><path class="no-sound" d="M1 21L16 3"/></svg><kbd>M</kbd>';
    this.muteButton.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      onMute();
    });
    middle.append(this.clock, this.muteButton);
    this.banner = el('div', 'banner', NL.hud.overtime);
    this.banner.hidden = true;
    const left = this.buildSide(0);
    const right = this.buildSide(1);
    top.append(left.team, middle, right.team);
    root.append(top, this.banner, left.panel, right.panel);
    this.sides = [left.parts, right.parts];
  }

  private buildSide(side: Side): { team: HTMLElement; panel: HTMLElement; parts: SideParts } {
    const where = side === 0 ? 'left' : 'right';

    const team = el('div', `team ${where}`);
    const flag = el('div', 'flag');
    const who = el('div', 'who');
    const name = el('div', 'name');
    const eraName = el('small');
    const title = el('div', 'title');
    title.append(name, eraName);
    const hp = el('div', 'hp');
    const hpFill = el('i');
    const hpText = el('span');
    hp.append(hpFill, hpText);
    who.append(title, hp);
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
      const unit = action.startsWith('buy');
      const root = el('button', unit ? 'btn' : `btn small ${action}`);
      root.type = 'button';
      const pic = unit ? el('div', 'pic') : null;
      const label = el('div', 'label');
      const sub = unit ? null : el('div', 'sub');
      const cost = el('div', 'cost');
      const cool = action === 'special' ? el('div', 'cool') : null;
      const fill = action === 'eraUp' ? el('div', 'fill') : null;
      const key = el('kbd', '', KEY_LABEL[side][action]);
      if (fill) root.append(fill);
      if (pic) root.append(pic);
      root.append(label);
      if (sub) root.append(sub);
      root.append(cost, key);
      if (cool) root.append(cool);
      root.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.onPress(side, action);
      });
      grid.append(root);
      buttons[action] = { root, pic, label, sub, cost, cool, fill };
    }

    const why = el('div', 'why');
    panel.append(why, status, grid);
    const parts: SideParts = { flag, name, eraName, hp, hpFill, hpText, gold, money, pips, buttons, why, whyTimer: 0, era: -1 };
    return { team, panel, parts };
  }

  private write(node: HTMLElement, text: string): void {
    if (this.written.get(node) === text) return;
    this.written.set(node, text);
    node.textContent = text;
  }

  /** Names, pictures and prices of the units: these only change when a side modernizes. */
  private label(s: SimState, side: Side): void {
    const parts = this.sides[side];
    const state = s.sides[side];
    const faction = FACTIONS[state.faction];
    const era = eraOf(state.faction, state.era);
    parts.era = state.era;

    setPicture(parts.flag, faction.flagRig, '');
    this.write(parts.name, NL.faction[state.faction].name);
    this.write(parts.eraName, NL.era[era.id] ?? String(era.year));

    era.units.forEach((unit, slot) => {
      const b = parts.buttons[`buy${slot}` as Action];
      if (b.pic) setPicture(b.pic, unit.rig, unit.role[0]!.toUpperCase());
      this.write(b.label, nameOf(unit.id));
      this.write(b.cost, String(unit.cost));
    });
    this.write(parts.buttons.special.label, nameOf(era.special.id));
    this.write(parts.buttons.subsidy.label, NL.hud.subsidy);
    this.write(parts.buttons.eraUp.label, NL.hud.eraUp);

    // In the last era there is nothing left to modernize to: the button makes
    // way and the other three share the row.
    const next = faction.eras[state.era + 1];
    parts.buttons.eraUp.root.style.display = next ? '' : 'none';
    parts.buttons.eraUp.root.parentElement!.classList.toggle('three', !next);
    this.write(parts.buttons.eraUp.sub!, next ? `${NL.hud.eraNext} ${NL.era[next.id] ?? next.year}` : '');
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
      const income = SUBSIDY.income[state.subsidy]!;
      this.write(parts.money, `${NL.faction[state.faction].money} +${income}${NL.hud.perSecond}`);

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

      // The turret button says what it will do next: build, replace an old one, or upgrade.
      const turret = parts.buttons.turret;
      const plan = turretPlan(s, side);
      this.write(turret.label, nameOf(plan ? plan.def.id : era.turret.id));
      this.write(turret.cost, plan ? String(plan.cost) : '');
      this.write(
        turret.sub!,
        !plan ? NL.hud.turretMax : plan.how === 'upgrade' ? `${NL.hud.turretHow.upgrade} ${'★'.repeat(plan.level)}` : NL.hud.turretHow[plan.how],
      );

      const special = parts.buttons.special;
      const wait = state.specialReadyAt - s.tick;
      const total = state.specialReadyAt === era.special.firstReady ? era.special.firstReady : era.special.cooldown;
      special.cool?.style.setProperty('--cool', wait > 0 ? (wait / total).toFixed(3) : '0');
      this.write(special.sub!, wait > 0 ? `${Math.ceil(wait / TPS)} s` : NL.hud.special);

      const subsidy = parts.buttons.subsidy;
      const price = subsidyCost(s, side);
      this.write(subsidy.cost, price === null ? '' : String(price));
      this.write(
        subsidy.sub!,
        price === null ? NL.hud.subsidyMax : `+${income} → +${SUBSIDY.income[state.subsidy + 1]}${NL.hud.perSecond}`,
      );

      const eraUp = parts.buttons.eraUp;
      const needed = progressNeeded(s, side);
      if (needed !== null) {
        const done = Math.min(1, state.progress / needed);
        eraUp.fill!.style.width = `${(done * 100).toFixed(1)}%`;
        this.write(eraUp.cost, `${Math.floor(done * 100)}%`);
        eraUp.root.classList.toggle('ready', done >= 1);
      }
    }
  }

  setOvertime(on: boolean): void {
    this.banner.hidden = !on;
  }

  setSoundMode(mode: SoundMode): void {
    this.muteButton.dataset.mode = mode;
    this.muteButton.title = NL.sound[mode];
    this.muteButton.setAttribute('aria-label', NL.sound[mode]);
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
