import { TPS } from './defs/balance.ts';
import type { Game } from './game.ts';
import type { Side } from './sim/types.ts';
import type { Action } from './ui/input.ts';

/**
 * With ?test=1 in the address the match does not run on the clock. A script
 * steps it tick by tick through window.__game, so a screenshot of tick 300 is
 * the same picture every time.
 */
export interface TestApi {
  start(): void;
  press(side: Side, action: Action): void;
  /** Runs this many ticks, drawing after each as the real loop would. */
  advance(ticks: number): void;
  /** Hands a side money, to stage a scene quickly. */
  fund(side: Side, gold: number): void;
  /** Sets how much is left of a side's base. */
  setBase(side: Side, hp: number): void;
  summary(): { tick: number; winner: unknown; units: [number, number]; baseHp: [number, number] };
}

export function installTestHooks(game: Game): void {
  game.manual = true;
  const api: TestApi = {
    start: () => {
      game.confirm();
      game.draw(0, 1);
    },
    press: (side, action) => game.press(side, action),
    advance: (ticks) => {
      for (let i = 0; i < ticks && game.phase === 'playing'; i++) {
        game.tick();
        game.draw(1 / TPS, 1);
      }
      game.draw(0, 1);
    },
    fund: (side, gold) => {
      game.state.sides[side].gold = gold;
    },
    setBase: (side, hp) => {
      game.state.sides[side].baseHp = hp;
    },
    summary: () => ({
      tick: game.state.tick,
      winner: game.state.winner,
      units: [game.state.sides[0].units.length, game.state.sides[1].units.length],
      baseHp: [game.state.sides[0].baseHp, game.state.sides[1].baseHp],
    }),
  };
  (window as unknown as { __game: TestApi }).__game = api;
}
