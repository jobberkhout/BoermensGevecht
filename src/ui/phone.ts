import { NL } from './nl.ts';

/**
 * What a phone needs that a keyboard does not: knowing it is one, a note to
 * hold it sideways, and, when the game is served from a web address, what it
 * takes to put it on the home screen and play without internet.
 */

/** True on a phone or tablet: the main way to point is a finger. The stylesheet asks the same question. */
export function isTouch(): boolean {
  return matchMedia('(pointer: coarse)').matches;
}

/** The note that asks to turn the phone. The stylesheet shows it only while a touch screen is held upright. */
export function addTurnHint(): void {
  const turn = document.createElement('div');
  turn.id = 'turn';
  // A phone on its side, and an arrow that says how it got there.
  turn.innerHTML =
    '<svg viewBox="0 0 120 90" aria-hidden="true"><rect x="22" y="30" width="76" height="44" rx="7" class="body"/>' +
    '<rect x="30" y="36" width="60" height="32" rx="2" class="glass"/><path d="M30 22 Q30 6 50 6" class="arrow"/>' +
    '<path d="M44 0 L52 6 L44 12" class="arrow"/></svg>';
  const head = document.createElement('b');
  head.textContent = NL.touch.turn;
  const sub = document.createElement('span');
  sub.textContent = NL.touch.turnSub;
  turn.append(head, sub);
  document.body.append(turn);
}

/**
 * Served from a web address (GitHub Pages), the page brings what makes it an
 * app: a manifest, so it can go on the home screen and open fullscreen and
 * sideways, and a service worker that keeps a copy for when there is no
 * internet. Opened from disk, as the single file, it asks for none of it.
 */
export function offerApp(): void {
  if (!import.meta.env.PROD) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;
  const link = (rel: string, href: string): void => {
    const node = document.createElement('link');
    node.rel = rel;
    node.href = href;
    document.head.append(node);
  };
  link('manifest', 'manifest.webmanifest');
  link('icon', 'icon-192.png');
  link('apple-touch-icon', 'icon-192.png');
  const color = document.createElement('meta');
  color.name = 'theme-color';
  color.content = '#1c1512';
  document.head.append(color);
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // Without it the game still plays; only not offline.
    });
  }
}
