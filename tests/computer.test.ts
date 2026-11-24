import { describe, expect, it } from 'vitest';
import { BOTS, computerPlayer } from '../src/bots/bots.ts';
import { runMatch } from '../src/bots/runMatch.ts';
import { FACTION_IDS } from '../src/defs/index.ts';

/** The computer that plays one side for someone alone should be the strongest player there is. */
describe('the computer', () => {
  it('beats the mixed bot and the banker nearly always, with every faction on either side', () => {
    let won = 0;
    let played = 0;
    for (const opponent of ['mixed', 'banker']) {
      for (const a of FACTION_IDS) {
        for (const b of FACTION_IDS) {
          for (const seat of [0, 1] as const) {
            const me = computerPlayer();
            const them = BOTS[opponent]!();
            const r = runMatch({ seed: 3 + seat, factions: [a, b], bots: seat === 0 ? [me, them] : [them, me], jitter: 5 + seat });
            played++;
            if (r.winner === seat) won++;
          }
        }
      }
    }
    expect(won / played).toBeGreaterThan(0.85);
  });
});
