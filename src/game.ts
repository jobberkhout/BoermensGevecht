import { QUEUE_MAX, TPS } from './defs/balance.ts';
import { Sound } from './audio/sound.ts';
import { DEFAULT_FACTIONS, FACTIONS, eraOf } from './defs/index.ts';
import type { FactionId } from './defs/types.ts';
import { Renderer } from './render/renderer.ts';
import type { Stage } from './render/stage.ts';
import { BattleView } from './render/view.ts';
import { canDo } from './sim/commands.ts';
import { createMatch } from './sim/create.ts';
import { step } from './sim/step.ts';
import type { Replay, Side, SimEvent, SimState, Stamped } from './sim/types.ts';
import { Hud } from './ui/hud.ts';
import { bindKeys, commandOf, type Action } from './ui/input.ts';
import { NL } from './ui/nl.ts';
import { Screens } from './ui/screens.ts';

const TICK = 1 / TPS;

/** Every piece of art a match between these factions can show. */
function artFor(factions: readonly FactionId[]): Set<string> {
  const ids = new Set<string>();
  for (const id of factions) {
    const faction = FACTIONS[id];
    ids.add(faction.flagRig);
    for (const era of faction.eras) {
      ids.add(era.baseRig);
      ids.add(era.turret.rig);
      ids.add(era.turret.shot.rig);
      if ('rig' in era.special) ids.add(era.special.rig);
      for (const unit of era.units) {
        ids.add(unit.rig);
        if (unit.shot) ids.add(unit.shot.rig);
      }
    }
  }
  return ids;
}

/**
 * Runs a match: turns key presses into commands, advances the rules at a fixed
 * thirty ticks a second however fast the screen refreshes, and draws in between.
 */
export class Game {
  state: SimState;
  phase: 'title' | 'playing' | 'over' = 'title';
  paused = false;

  private readonly renderer: Renderer;
  private readonly sound: Sound;
  private readonly hud: Hud;
  private readonly screens: Screens;
  private view: BattleView;
  private pending: Stamped[] = [];
  private log: Stamped[] = [];
  private events: SimEvent[] = [];
  private seed = 1;
  private acc = 0;
  private last = 0;
  /** When true the clock does not drive the match; tests step it by hand. */
  manual = false;

  constructor(stage: Stage, hudRoot: HTMLElement, options: { sound?: boolean } = {}) {
    this.renderer = new Renderer(stage);
    this.sound = new Sound(options.sound ?? true);
    this.state = createMatch(this.seed, DEFAULT_FACTIONS);
    this.view = new BattleView(this.renderer.rig);
    this.hud = new Hud(
      hudRoot,
      (side, action) => this.press(side, action),
      () => this.toggleMute(),
    );
    this.hud.setSoundMode(this.sound.mode);
    this.screens = new Screens(
      hudRoot,
      () => this.confirm(),
      () => this.togglePause(),
    );
    bindKeys({
      act: (side, action) => this.press(side, action),
      pause: () => this.togglePause(),
      confirm: () => this.confirm(),
      mute: () => this.toggleMute(),
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.phase === 'playing' && !this.paused) this.togglePause();
    });
    this.hud.show(false);
  }

  /** Loads the art, then starts drawing. */
  async boot(): Promise<void> {
    await this.renderer.prepare(artFor(DEFAULT_FACTIONS));
    this.hud.update(this.state);
    this.draw(0);
    requestAnimationFrame((now) => {
      this.last = now;
      this.frame(now);
    });
  }

  /** Enter: start from the title, or play again after a match. */
  confirm(): void {
    if (this.phase === 'playing') return;
    this.seed += 1;
    this.state = createMatch(this.seed, DEFAULT_FACTIONS);
    this.view = new BattleView(this.renderer.rig);
    this.pending = [];
    this.log = [];
    this.acc = 0;
    this.paused = false;
    this.phase = 'playing';
    // This runs inside a key press or a click, which is the only moment a browser lets sound start.
    this.sound.unlock();
    this.sound.tempo = 1;
    this.sound.startMusic();
    document.body.dataset.audio = this.sound.state;
    this.screens.showTitle(false);
    this.screens.showPause(false);
    this.screens.showWinner(null);
    this.hud.show(true);
    this.hud.setOvertime(false);
  }

  togglePause(): void {
    if (this.phase !== 'playing') return;
    this.paused = !this.paused;
    this.sound.pause(this.paused);
    this.screens.showPause(this.paused);
  }

  /** M: everything, effects without the tune, silence, and round again. */
  toggleMute(): void {
    this.hud.setSoundMode(this.sound.nextMode());
  }

  press(side: Side, action: Action): void {
    if (this.phase !== 'playing' || this.paused) return;
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
    if (action === 'special') return NL.refuse.special;
    if (action === 'turret' && !me.turrets.includes(null)) return NL.refuse.turret;
    if (action.startsWith('buy') && me.queue.length >= QUEUE_MAX) return NL.refuse.queue;
    return NL.refuse.gold;
  }

  /** One tick of the rules, with everything that was pressed since the last one. */
  tick(): void {
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
        this.sound.spawn(e.side);
        break;
      case 'strike':
        if (e.ranged) this.sound.whoosh();
        break;
      case 'hit':
        this.sound.hit();
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
        this.sound.turret(e.side);
        break;
      case 'special': {
        const me = this.state.sides[e.side];
        if (eraOf(me.faction, me.era).special.kind === 'wave') this.sound.horn();
        else this.sound.chant();
        break;
      }
      case 'overtime':
        this.hud.setOvertime(true);
        this.sound.alarm();
        this.sound.tempo = 1.12;
        break;
      case 'win':
        this.finish();
        break;
      default:
        break;
    }
  }

  private finish(): void {
    this.phase = 'over';
    this.sound.stopMusic();
    this.sound.fanfare();
    const w = this.state.winner;
    this.screens.showWinner(w === null ? null : w === 'draw' ? 'draw' : this.state.sides[w].faction);
  }

  /** Everything needed to play this exact match again. */
  replay(): Replay {
    return { v: 1, seed: this.seed, factions: [this.state.sides[0].faction, this.state.sides[1].faction], cmds: [...this.log] };
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
