import type { SoundMode } from '../audio/sound.ts';
import { SUBSIDY, TPS, TURRET } from '../defs/balance.ts';
import { FACTIONS, eraOf, unitDef } from '../defs/index.ts';
import { hasRig, rigUrl } from '../render/assets.ts';
import { canDo, eraUpCost, hiked, progressNeeded, subsidyCost, turretPlan, unitPrice } from '../sim/commands.ts';
import { kraanDicht } from '../sim/overtime.ts';
import { SIDES, other, type Side, type SimState } from '../sim/types.ts';
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
  purse: HTMLElement;
  gold: HTMLElement;
  money: HTMLElement;
  pips: HTMLElement[];
  buttons: Record<Action, ButtonParts>;
  why: HTMLElement;
  whyTimer: number;
  /** The id of the era ('ah.2025') the labels were last written for; it names the faction too. */
  shown: string;
}

export class Hud {
  private sides: [SideParts, SideParts];
  /** Which sides the computer plays, for their names. */
  private computer: [boolean, boolean] = [false, false];
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
    this.banner = el('div', 'banner');
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
    const parts: SideParts = { flag, name, eraName, hp, hpFill, hpText, purse, gold, money, pips, buttons, why, whyTimer: 0, shown: '' };
    return { team, panel, parts };
  }

  private write(node: HTMLElement, text: string): void {
    if (this.written.get(node) === text) return;
    this.written.set(node, text);
    node.textContent = text;
  }

  /** Names and pictures of the units: these only change when a side modernizes, or when another faction takes the seat. Prices are written every frame: the rent can go up. */
  private label(s: SimState, side: Side): void {
    const parts = this.sides[side];
    const state = s.sides[side];
    const faction = FACTIONS[state.faction];
    const era = eraOf(state.faction, state.era);
    parts.shown = era.id;

    setPicture(parts.flag, faction.flagRig, '');
    this.write(parts.name, this.computer[side] ? `${NL.faction[state.faction].name} · ${NL.start.computer}` : NL.faction[state.faction].name);
    this.write(parts.eraName, NL.era[era.key] ?? String(era.year));

    // Three unit buttons, and a fourth in the era that has a super unit.
    for (let slot = 0; slot < 4; slot++) {
      const b = parts.buttons[`buy${slot}` as Action];
      const unit = era.units[slot];
      b.root.style.display = unit ? '' : 'none';
      if (!unit) continue;
      if (b.pic) setPicture(b.pic, unit.rig, unit.role[0]!.toUpperCase());
      this.write(b.label, nameOf(unit.id));
      // Four buttons share the row, so a name gets two lines; one long word gets smaller letters instead.
      b.label.classList.toggle('long', nameOf(unit.id).split(/[ -]/).some((word) => word.length > 14));
      b.root.title = NL.blurbs[unit.id] ?? '';
    }
    parts.buttons.buy0.root.parentElement!.classList.toggle('four', era.units.length > 3);
    // What it does, for whoever hovers over it: the title card only explains the first era.
    parts.buttons.special.root.title = NL.blurbs[era.special.id] ?? '';
    parts.buttons.turret.root.title = NL.blurbs[era.turret.id] ?? '';
    this.write(parts.buttons.special.label, nameOf(era.special.id));
    parts.buttons.special.label.classList.toggle('long', nameOf(era.special.id).length > 13);
    parts.buttons.special.label.classList.toggle('two', nameOf(era.special.id).length > 13 && nameOf(era.special.id).includes(' '));
    this.write(parts.buttons.subsidy.label, NL.hud.subsidy);

    // In the last era there is nothing left to modernize to: the button makes
    // way and the other three share the row.
    const next = faction.eras[state.era + 1];
    parts.buttons.eraUp.root.style.display = next ? '' : 'none';
    parts.buttons.eraUp.root.parentElement!.classList.toggle('three', !next);
    this.write(parts.buttons.eraUp.label, NL.hud.eraUp);
  }

  update(s: SimState): void {
    const seconds = Math.floor(s.tick / TPS);
    this.write(this.clock, `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`);

    for (const side of SIDES) {
      const parts = this.sides[side];
      const state = s.sides[side];
      const era = eraOf(state.faction, state.era);
      if (parts.shown !== era.id) this.label(s, side);

      const share = Math.max(0, state.baseHp / state.baseMaxHp);
      parts.hpFill.style.width = `${(share * 100).toFixed(1)}%`;
      parts.hp.classList.toggle('low', share < 0.3);
      this.write(parts.hpText, `${state.baseHp} / ${state.baseMaxHp}`);
      this.write(parts.gold, String(state.gold));
      const income = SUBSIDY.income[state.subsidy]!;
      const dry = kraanDicht(s.tick);
      // Earnings that are being diverted: one purse sees them leave, the other gets them on top of its own.
      const theirs = s.sides[other(side)];
      const drained = state.divertedUntil > s.tick;
      const draining = theirs.divertedUntil > s.tick;
      parts.purse.classList.toggle('drained', drained);
      parts.purse.classList.toggle('draining', draining && !drained);
      const coming = draining ? income + SUBSIDY.income[theirs.subsidy]! : income;
      // The rent went up: every price this side pays is higher for a while, and its buttons say so in red.
      const dear = hiked(s, side);
      parts.purse.classList.toggle('hiked', dear && !drained);
      // Once the kraan is closed there is no income to show, and no room for both texts.
      this.write(
        parts.money,
        dry
          ? NL.hud.kraanDicht
          : drained
            ? `${NL.hud.diverted} · ${Math.ceil((state.divertedUntil - s.tick) / TPS)} s`
            : dear
              ? `${NL.hud.hiked.replace('{n}', String(state.hikePercent / 100))} · ${Math.ceil((state.hikeUntil - s.tick) / TPS)} s`
              : `${NL.faction[state.faction].money} +${coming}${NL.hud.perSecond}`,
      );
      for (let slot = 0; slot < era.units.length; slot++) {
        this.write(parts.buttons[`buy${slot}` as Action].cost, String(unitPrice(s, side, era.units[slot]!)));
      }

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
        parts.buttons[action].root.classList.toggle('hiked', dear);
      }

      // The turret button says what it will do next: build, replace an old one, or upgrade.
      const turret = parts.buttons.turret;
      const plan = turretPlan(s, side);
      const turretName = nameOf(plan ? plan.def.id : era.turret.id);
      this.write(turret.label, turretName);
      turret.label.classList.toggle('long', turretName.length > 13);
      turret.label.classList.toggle('two', turretName.length > 13 && turretName.includes(' '));
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
      const grant = subsidyCost(s, side);
      this.write(subsidy.cost, grant === null ? '' : String(grant));
      this.write(
        subsidy.sub!,
        dry ? NL.hud.dry : grant === null ? NL.hud.subsidyMax : `+${income} → +${SUBSIDY.income[state.subsidy + 1]}${NL.hud.perSecond}`,
      );

      // Modernizing takes two things: the bar must be full, and then it costs subsidie.
      const eraUp = parts.buttons.eraUp;
      const needed = progressNeeded(s, side);
      const price = eraUpCost(s, side);
      if (needed !== null && price !== null) {
        const done = Math.min(1, state.progress / needed);
        eraUp.fill!.style.width = `${(done * 100).toFixed(1)}%`;
        this.write(eraUp.cost, String(price));
        // While the bar fills it says how far along it is; once it is full, where the button leads.
        const next = FACTIONS[state.faction].eras[state.era + 1];
        this.write(eraUp.sub!, done >= 1 && next ? `→ ${NL.era[next.key] ?? next.year}` : `${NL.hud.eraProgress} ${Math.floor(done * 100)}%`);
        eraUp.root.classList.toggle('full', done >= 1);
        eraUp.root.classList.toggle('ready', done >= 1 && state.gold >= price);
      }
    }
  }

  /** Shows the overtime banner with this text, or takes it away with null. It jumps whenever the text changes. */
  /** Which sides the computer plays this match; their names say so. */
  setComputer(computer: readonly [boolean, boolean]): void {
    this.computer = [computer[0], computer[1]];
    for (const parts of this.sides) parts.shown = '';
  }

  setOvertime(text: string | null): void {
    this.banner.hidden = text === null;
    if (text === null || this.banner.textContent === text) return;
    this.banner.textContent = text;
    this.banner.classList.remove('bump');
    void this.banner.offsetWidth; // restart the animation
    this.banner.classList.add('bump');
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
