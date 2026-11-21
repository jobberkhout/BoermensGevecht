import type { Command, Side } from '../sim/types.ts';

/** The six things a player can do. Buttons and keys both speak in these. */
export type Action = 'buy0' | 'buy1' | 'buy2' | 'turret' | 'special' | 'eraUp';

export const ACTIONS: readonly Action[] = ['buy0', 'buy1', 'buy2', 'turret', 'special', 'eraUp'];

export function commandOf(action: Action): Command {
  switch (action) {
    case 'buy0':
      return { t: 'buy', slot: 0 };
    case 'buy1':
      return { t: 'buy', slot: 1 };
    case 'buy2':
      return { t: 'buy', slot: 2 };
    case 'turret':
      return { t: 'turret' };
    case 'special':
      return { t: 'special' };
    case 'eraUp':
      return { t: 'eraUp' };
  }
}

/**
 * Physical key positions (KeyboardEvent.code), so QWERTY, AZERTY and QWERTZ all
 * give the left player the left cluster and the right player the right one.
 */
const KEYS: Record<string, { side: Side; action: Action }> = {
  KeyQ: { side: 0, action: 'buy0' },
  KeyW: { side: 0, action: 'buy1' },
  KeyE: { side: 0, action: 'buy2' },
  KeyA: { side: 0, action: 'turret' },
  KeyS: { side: 0, action: 'special' },
  KeyD: { side: 0, action: 'eraUp' },
  KeyU: { side: 1, action: 'buy0' },
  KeyI: { side: 1, action: 'buy1' },
  KeyO: { side: 1, action: 'buy2' },
  KeyJ: { side: 1, action: 'turret' },
  KeyK: { side: 1, action: 'special' },
  KeyL: { side: 1, action: 'eraUp' },
};

/** What is printed on the key in the usual layout, shown on the buttons. */
export const KEY_LABEL: Record<Side, Record<Action, string>> = {
  0: { buy0: 'Q', buy1: 'W', buy2: 'E', turret: 'A', special: 'S', eraUp: 'D' },
  1: { buy0: 'U', buy1: 'I', buy2: 'O', turret: 'J', special: 'K', eraUp: 'L' },
};

export interface KeyHandlers {
  act(side: Side, action: Action): void;
  pause(): void;
  confirm(): void;
}

/** Listens for the game's keys. Returns a function that stops listening. */
export function bindKeys(handlers: KeyHandlers): () => void {
  const onKey = (e: KeyboardEvent): void => {
    // Presses only: a held key must not buy ten units, and browser shortcuts stay untouched.
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    const bound = KEYS[e.code];
    if (bound) {
      e.preventDefault();
      handlers.act(bound.side, bound.action);
    } else if (e.code === 'Space') {
      e.preventDefault();
      handlers.pause();
    } else if (e.code === 'Enter' || e.code === 'NumpadEnter') {
      e.preventDefault();
      handlers.confirm();
    }
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}
