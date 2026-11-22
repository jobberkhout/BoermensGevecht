import './ui/hud.css';
import { Game } from './game.ts';
import { createStage } from './render/stage.ts';
import { installTestHooks } from './testhooks.ts';

const canvas = document.getElementById('field') as HTMLCanvasElement;
const hud = document.getElementById('hud') as HTMLElement;

// With ?test=1 a script steps the match by hand; it runs silently.
const test = new URLSearchParams(location.search).has('test');
const game = new Game(createStage(canvas), hud, { sound: !test });
if (test) installTestHooks(game);

game
  .boot()
  .catch((err: unknown) => {
    console.error(err);
    hud.textContent = `Er ging iets mis bij het laden: ${String(err)}`;
  })
  .finally(() => {
    // Lets screenshot scripts know the first frame is on screen.
    document.body.dataset.ready = '1';
  });
