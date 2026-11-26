import { QUEUE_MAX, TPS } from './defs/balance.ts';
import { Sound } from './audio/sound.ts';
import { THINK_EVERY, computerPlayer, type Bot } from './bots/bots.ts';
import { DEFAULT_FACTIONS, FACTIONS, FACTION_IDS, artFor, specialDef, unitDef } from './defs/index.ts';
import type { FactionDef, FactionId } from './defs/types.ts';
import { Renderer } from './render/renderer.ts';
import type { Stage } from './render/stage.ts';
import { BattleView } from './render/view.ts';
import { canDo, progressNeeded, subsidyCost, turretPlan } from './sim/commands.ts';
import { createMatch } from './sim/create.ts';
import { kraanDicht } from './sim/overtime.ts';
import { step } from './sim/step.ts';
import { SIDES, type Replay, type Side, type SimEvent, type SimState, type Stamped } from './sim/types.ts';
import { Hud } from './ui/hud.ts';
import { actionOf, bindKeys, commandOf, type Action } from './ui/input.ts';
import { NL } from './ui/nl.ts';
import { Screens } from './ui/screens.ts';

const TICK = 1 / TPS;

/**
 * Runs a match: turns key presses into commands, advances the rules at a fixed
 * thirty ticks a second however fast the screen refreshes, and draws in between.
 */
export class Game {
  state: SimState;
  phase: 'title' | 'playing' | 'over' = 'title';
  paused = false;
  /** The faction each player has picked on the title card: left, right. */
  picks: [FactionId, FactionId] = [...DEFAULT_FACTIONS];
  /** Which sides the computer plays, as switched on the title card. Someone alone hands it one side. */
  computer: [boolean, boolean] = [false, false];

  private readonly renderer: Renderer;
  private readonly sound: Sound;
  private readonly hud: Hud;
  private readonly screens: Screens;
  private view: BattleView;
  private pending: Stamped[] = [];
  private log: Stamped[] = [];
  /** The computer's player for each side it plays in this match, fresh for every match. */
  private bots: [Bot | null, Bot | null] = [null, null];
  private events: SimEvent[] = [];
  private seed = 1;
  private acc = 0;
  private last = 0;
  /** Counts requests for art, so that an older one finishing late changes nothing. */
  private loads = 0;
  /** True once the art of both picked factions is ready to draw. */
  private artReady = false;
  /** Enter was pressed while art was still loading: start as soon as it is there. */
  private startWhenReady = false;
  /** When true the clock does not drive the match; tests step it by hand. */
  manual = false;
  /** Played with fingers on a phone or tablet rather than on a keyboard. */
  private readonly touch: boolean;
  /** Keeps a phone's screen on during a match, where the browser allows it. */
  private awake: { release(): Promise<void> } | null = null;

  constructor(stage: Stage, hudRoot: HTMLElement, options: { sound?: boolean; touch?: boolean } = {}) {
    this.touch = options.touch ?? false;
    // Someone with a phone in their hands most likely plays alone: the computer takes the right side until they say otherwise.
    if (this.touch) this.computer = [false, true];
    this.renderer = new Renderer(stage);
    this.sound = new Sound(options.sound ?? true);
    this.state = createMatch(this.seed, this.picks);
    this.view = new BattleView(this.renderer.rig);
    this.hud = new Hud(
      hudRoot,
      (side, action) => this.press(side, action),
      () => this.toggleMute(),
      () => this.togglePause(),
    );
    this.hud.setSoundMode(this.sound.mode);
    this.screens = new Screens(hudRoot, {
      confirm: () => this.confirm(),
      resume: () => this.togglePause(),
      pick: (side, by) => this.pick(side, by),
      toggle: (side) => this.toggleComputer(side),
      back: () => this.back(),
    }, this.touch);
    this.screens.setFactions(this.picks, this.computer);
    bindKeys({
      act: (side, action) => this.press(side, action),
      pause: () => this.togglePause(),
      confirm: () => this.confirm(),
      mute: () => this.toggleMute(),
      back: () => this.back(),
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.phase === 'playing' && !this.paused) this.togglePause();
    });
    // A phone turned upright cannot show the field; the match waits until it is turned back.
    if (this.touch) {
      matchMedia('(orientation: portrait)').addEventListener('change', (e) => {
        if (e.matches && this.phase === 'playing' && !this.paused) this.togglePause();
      });
    }
    this.hud.show(false);
  }

  /** Loads the art, then starts drawing. */
  async boot(): Promise<void> {
    await this.loadArt();
    this.hud.update(this.state);
    this.draw(0);
    requestAnimationFrame((now) => {
      this.last = now;
      this.frame(now);
    });
  }

  /** Gets the art of the two picked factions ready. Resolves when it can be drawn. */
  private async loadArt(): Promise<void> {
    const ticket = ++this.loads;
    this.artReady = false;
    await this.renderer.prepare(
      artFor(this.picks),
      this.picks.map((id) => FACTIONS[id].backdropRig),
    );
    if (ticket !== this.loads) return; // the players have picked something else since
    this.artReady = true;
    if (this.startWhenReady) {
      this.startWhenReady = false;
      this.begin();
    }
  }

  /** On the title card: a player steps to the previous or the next faction. */
  pick(side: Side, by: -1 | 1): void {
    if (this.phase !== 'title') return;
    const count = FACTION_IDS.length;
    const at = FACTION_IDS.indexOf(this.picks[side]);
    this.sound.click();
    void this.choose(side, FACTION_IDS[(at + by + count) % count]!);
  }

  /** On the title card: puts a faction on a side. Any pair goes, the same one twice too. Resolves when its art is ready. */
  choose(side: Side, faction: FactionId): Promise<void> {
    if (this.phase !== 'title') return Promise.resolve();
    this.picks[side] = faction;
    this.screens.setFactions(this.picks, this.computer);
    // Behind the title card stands the empty battlefield of the two that were picked.
    this.state = createMatch(this.seed, this.picks);
    this.view = new BattleView(this.renderer.rig);
    return this.loadArt();
  }

  /** On the title card: hands a side to the computer, or back to a person. */
  toggleComputer(side: Side, on = !this.computer[side]): void {
    if (this.phase !== 'title') return;
    this.computer[side] = on;
    this.sound.click();
    this.screens.setFactions(this.picks, this.computer);
  }

  /** Enter: start from the title, or play again after a match. */
  confirm(): void {
    if (this.phase === 'playing') return;
    // This runs inside a key press or a click, which is the only moment a browser lets sound start,
    // or a phone go fullscreen.
    this.sound.unlock();
    this.fullscreen();
    if (this.artReady) this.begin();
    else this.startWhenReady = true;
  }

  private begin(): void {
    this.seed += 1;
    this.state = createMatch(this.seed, this.picks);
    this.view = new BattleView(this.renderer.rig);
    this.pending = [];
    this.log = [];
    this.bots = [this.computer[0] ? computerPlayer() : null, this.computer[1] ? computerPlayer() : null];
    this.hud.setComputer(this.computer);
    this.acc = 0;
    this.paused = false;
    this.phase = 'playing';
    this.sound.tempo = 1;
    this.sound.startMusic();
    document.body.dataset.audio = this.sound.state;
    this.screens.showTitle(false);
    this.screens.showPause(false);
    this.screens.showWinner(null);
    this.hud.show(true);
    this.hud.setOvertime(null);
    this.keepAwake(true);
    // The names and pictures of the two factions that were picked, before the first frame.
    this.hud.update(this.state);
  }

  /** Escape: from the end of a match, or from the pause card, back to the title card to pick other factions. */
  back(): void {
    if (this.phase !== 'over' && !(this.phase === 'playing' && this.paused)) return;
    this.sound.stopMusic();
    this.sound.pause(false);
    this.phase = 'title';
    this.paused = false;
    this.startWhenReady = false;
    this.state = createMatch(this.seed, this.picks);
    this.view = new BattleView(this.renderer.rig);
    this.pending = [];
    this.screens.showPause(false);
    this.screens.showWinner(null);
    this.screens.showTitle(true);
    this.hud.show(false);
    this.hud.setOvertime(null);
    this.keepAwake(false);
  }

  togglePause(): void {
    if (this.phase !== 'playing') return;
    this.paused = !this.paused;
    this.sound.pause(this.paused);
    this.screens.showPause(this.paused);
    // The browser lets go of the screen when the page is hidden; take it back on the way in.
    this.keepAwake(!this.paused);
  }

  /** On a phone: the whole screen, held sideways. Without the browser's bars the field is a good deal bigger. */
  private fullscreen(): void {
    if (!this.touch || document.fullscreenElement || !document.documentElement.requestFullscreen) return;
    // Started from the home screen it is fullscreen already.
    if (matchMedia('(display-mode: fullscreen)').matches) return;
    document.documentElement
      .requestFullscreen({ navigationUI: 'hide' })
      .then(() => (screen.orientation as ScreenOrientation & { lock?(o: string): Promise<void> }).lock?.('landscape'))
      .catch(() => {
        // Not every browser allows either; the game plays the same without.
      });
  }

  /** Asks that the screen stays on while a match runs, and lets go after. */
  private keepAwake(on: boolean): void {
    const lock = (navigator as Navigator & { wakeLock?: { request(type: 'screen'): Promise<{ release(): Promise<void> }> } }).wakeLock;
    if (!on) {
      void this.awake?.release().catch(() => {});
      this.awake = null;
      return;
    }
    if (!this.touch || !lock || this.awake) return;
    lock
      .request('screen')
      .then((sentinel) => {
        // The match may have ended while the request was out.
        if (this.phase === 'playing' && !this.paused && !this.awake) this.awake = sentinel;
        else void sentinel.release().catch(() => {});
      })
      .catch(() => {});
  }

  /** M: everything, effects without the tune, silence, and round again. */
  toggleMute(): void {
    this.hud.setSoundMode(this.sound.nextMode());
  }

  press(side: Side, action: Action): void {
    if (this.phase === 'title') {
      // On the title card two of each player's keys step through the factions.
      if (action === 'turret') this.pick(side, -1);
      else if (action === 'subsidy') this.pick(side, 1);
      else if (action === 'special') this.toggleComputer(side);
      return;
    }
    if (this.phase !== 'playing' || this.paused) return;
    // The computer's side is the computer's: its keys and buttons do nothing.
    if (this.bots[side]) return;
    const cmd = commandOf(action);
    if (canDo(this.state, side, cmd)) {
      this.pending.push({ tick: this.state.tick, side, cmd });
      this.hud.pulse(side, action);
      this.sound.click();
    } else {
      this.hud.refuse(side, action, this.reason(side, action));
      this.sound.refuse();
    }
  }

  private reason(side: Side, action: Action): string {
    const me = this.state.sides[side];
    switch (action) {
      case 'special':
        return NL.refuse.special;
      case 'turret':
        return turretPlan(this.state, side) ? NL.refuse.gold : NL.refuse.turret;
      case 'subsidy':
        if (kraanDicht(this.state.tick)) return NL.refuse.kraanDicht;
        return subsidyCost(this.state, side) === null ? NL.refuse.subsidy : NL.refuse.gold;
      case 'eraUp': {
        // Two things are needed: enough vooruitgang, and then the money.
        const needed = progressNeeded(this.state, side);
        if (needed === null) return NL.refuse.lastEra;
        return me.progress < needed ? NL.refuse.progress : NL.refuse.gold;
      }
      default:
        return me.queue.length >= QUEUE_MAX ? NL.refuse.queue : NL.refuse.gold;
    }
  }

  /** One tick of the rules, with everything that was pressed since the last one. */
  tick(): void {
    // The computer thinks a few times a second, the two sides on different beats, and presses what it chose.
    for (const side of SIDES) {
      const bot = this.bots[side];
      if (!bot || (this.state.tick + side * (THINK_EVERY / 2)) % THINK_EVERY !== 0) continue;
      const cmd = bot(this.state, side);
      if (cmd && canDo(this.state, side, cmd)) {
        this.pending.push({ tick: this.state.tick, side, cmd });
        this.hud.pulse(side, actionOf(cmd));
      }
    }
    const cmds = this.pending.map((c) => ({ ...c, tick: this.state.tick }));
    this.pending = [];
    this.log.push(...cmds);
    this.events.length = 0;
    step(this.state, cmds, this.events);
    this.view.consume(this.events, this.state);
    for (const e of this.events) this.react(e);
  }

  /** What the player hears, and the few things the HUD shows, for one event. */
  private react(e: SimEvent): void {
    switch (e.t) {
      case 'spawn':
        if (unitDef(e.def).role === 'super') this.sound.giant();
        else this.sound.spawn(this.voice(e.side));
        break;
      case 'strike':
        if (e.ranged) this.sound.whoosh();
        else if (e.filming) this.sound.shutter();
        break;
      case 'toss':
        this.sound.whoosh();
        break;
      case 'hit':
        this.sound.hit();
        break;
      case 'glance':
      case 'crashed':
        this.sound.clang();
        break;
      case 'defeat':
        this.sound.defeat();
        break;
      case 'gold':
        this.sound.coin();
        break;
      case 'baseHit':
        this.sound.baseHit();
        break;
      case 'turretBuilt':
        this.sound.built();
        break;
      case 'turretFire':
        this.sound.turret(this.voice(e.side));
        break;
      case 'subsidy':
        this.sound.coin();
        break;
      case 'eraUp':
        this.sound.eraUp();
        break;
      case 'special':
        // Each kind of trick has its own sound.
        switch (specialDef(e.id).kind) {
          case 'wave':
            this.sound.horn();
            break;
          case 'stun':
            this.sound.chant();
            break;
          case 'buff':
            this.sound.riff();
            break;
          case 'heal':
            this.sound.mend();
            break;
          case 'barrage':
            this.sound.swarm();
            break;
          case 'snipe':
            this.sound.zap();
            break;
          case 'convert':
            // The deal itself is heard when it goes through; see 'converted'.
            break;
          case 'divert':
            this.sound.drain();
            break;
          case 'summon': {
            // The family comes in silence; a ship that moors sounds its horn.
            const def = specialDef(e.id);
            if (def.kind === 'summon' && def.ticks) this.sound.shipHorn();
            break;
          }
          case 'hike':
            this.sound.hike();
            break;
          case 'revive':
            // The broom wagon honks as it pulls up at the gate.
            this.sound.horn();
            break;
          case 'siesta':
            // A sign falls beside the enemy base, as the rent increase does.
            this.sound.hike();
            break;
        }
        break;
      case 'vaulted':
      case 'returned':
        this.sound.whoosh();
        break;
      case 'braked':
        this.sound.clang();
        break;
      case 'recalled':
        this.sound.shipHorn();
        break;
      case 'converted':
        this.sound.deal();
        break;
      case 'skimmed':
        this.sound.coin();
        break;
      case 'overtime':
        this.sound.alarm();
        break;
      case 'escalate':
        // The banner counts up, the tune speeds up a little with every step.
        this.hud.setOvertime(
          (kraanDicht(this.state.tick) ? NL.hud.overtimeDry : '') +
            NL.hud.overtimeHarder.replace('{n}', String(e.percent)) +
            (e.turrets >= 100 ? '' : e.turrets <= 0 ? NL.hud.overtimeSilent : NL.hud.overtimeTurrets.replace('{m}', String(100 - e.turrets))),
        );
        this.sound.tempo = Math.min(1.5, 1.1 + e.level * 0.02);
        if (e.level > 1) this.sound.surge();
        break;
      case 'crumble':
        this.hud.setOvertime(NL.hud.overtimeCrumble);
        this.sound.alarm();
        break;
      case 'win':
        this.finish();
        break;
      default:
        break;
    }
  }

  /** How the faction on this side sounds. */
  private voice(side: Side): FactionDef['voice'] {
    return FACTIONS[this.state.sides[side].faction].voice;
  }

  private finish(): void {
    this.phase = 'over';
    this.keepAwake(false);
    this.sound.stopMusic();
    this.sound.fanfare();
    const w = this.state.winner;
    this.screens.showWinner(w === null ? null : w === 'draw' ? 'draw' : this.state.sides[w].faction);
  }

  /** Everything needed to play this exact match again. */
  replay(): Replay {
    return { v: 2, seed: this.seed, factions: [this.state.sides[0].faction, this.state.sides[1].faction], cmds: [...this.log] };
  }

  /** `alpha` is how far between the last tick and the next the picture should be (0..1). */
  draw(dt: number, alpha = this.acc / TICK): void {
    this.view.update(this.state, alpha, dt);
    this.renderer.draw(this.state, this.view, alpha);
    this.hud.update(this.state);
  }

  private frame(now: number): void {
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    if (!this.manual) {
      if (this.phase === 'playing' && !this.paused) {
        this.acc += dt;
        while (this.acc >= TICK && this.phase === 'playing') {
          this.tick();
          this.acc -= TICK;
        }
      }
      // After the match the world keeps moving a little: units slink off, numbers float away.
      this.draw(this.paused ? 0 : dt);
    }
    requestAnimationFrame((t) => this.frame(t));
  }
}
