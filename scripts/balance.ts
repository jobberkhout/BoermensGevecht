/**
 * Bot tournament: every bot against every bot, on both sides, over several seeds.
 *
 *   npm run balance                          Amsterdam against the Achterhoek, in full
 *   npm run balance -- zuidas achterhoek     any two factions (left, right), in full
 *   npm run balance -- --pairs               every pair of factions, one line each
 *   npm run balance -- --mix                 every pair, both sides buying a mix (the 'mixed' bot), as
 *                                            people play; 100 seeds unless --seeds says otherwise
 *   add --seeds=3                            fewer or more matches per pairing (default 6)
 *   add --all                                with a full report: every single match as well
 *
 * Prints who wins, how long matches take, how far the sides modernize and whether any stall.
 */
import { BOTS, random } from '../src/bots/bots.ts';
import { runMatch } from '../src/bots/runMatch.ts';
import { OVERTIME, TPS } from '../src/defs/balance.ts';
import { DEFAULT_FACTIONS, FACTION_IDS } from '../src/defs/index.ts';
import type { FactionId } from '../src/defs/types.ts';

const words = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const flags = new Map(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [k, v] = a.slice(2).split('=');
      return [k!, v ?? '1'] as const;
    }),
);
const SEEDS = Number(flags.get('seeds') ?? (flags.has('mix') ? 100 : 6));
const names = flags.has('mix') ? ['mixed'] : [...Object.keys(BOTS), 'random'];

function faction(word: string): FactionId {
  const id = FACTION_IDS.find((f) => f === word);
  if (!id) throw new Error(`unknown faction "${word}"; there are: ${FACTION_IDS.join(', ')}`);
  return id;
}

interface Tally {
  pair: [FactionId, FactionId];
  games: number;
  wins: [number, number];
  draws: number;
  stalls: number;
  ticks: number[];
  /** How many matches ended with the further-along side in each era. */
  eras: number[];
  /** Out of all sides in all matches: how many modernized at least once, and at least twice. */
  modernized: [number, number];
  perBot: Record<string, { played: number; won: number }>;
  rows: string[];
}

function tournament(pair: [FactionId, FactionId]): Tally {
  const tally: Tally = { pair, games: 0, wins: [0, 0], draws: 0, stalls: 0, ticks: [], eras: [0, 0, 0], modernized: [0, 0], perBot: {}, rows: [] };
  for (const n of names) tally.perBot[n] = { played: 0, won: 0 };
  const make = (n: string, s: number) => (n === 'random' ? random(s) : BOTS[n]!());
  for (const a of names) {
    for (const b of names) {
      // With human timing even a bot against itself is a real match.
      for (let seed = 1; seed <= SEEDS; seed++) {
        const reached: [number, number] = [0, 0];
        const r = runMatch({
          seed,
          factions: pair,
          bots: [make(a, seed), make(b, seed + 99)],
          jitter: seed,
          onTick: (s) => {
            reached[0] = Math.max(reached[0], s.sides[0].era);
            reached[1] = Math.max(reached[1], s.sides[1].era);
          },
        });
        tally.games++;
        tally.eras[Math.max(...reached)]!++;
        for (const era of reached) {
          if (era >= 1) tally.modernized[0]++;
          if (era >= 2) tally.modernized[1]++;
        }
        tally.perBot[a]!.played++;
        tally.perBot[b]!.played++;
        if (r.winner === null) tally.stalls++;
        else if (r.winner === 'draw') tally.draws++;
        else {
          tally.wins[r.winner]++;
          tally.perBot[r.winner === 0 ? a : b]!.won++;
        }
        if (r.winner !== null) tally.ticks.push(r.ticks);
        const outcome = r.winner === null ? 'STALL' : r.winner === 'draw' ? 'draw' : `${pair[r.winner]} (${r.winner === 0 ? 'left' : 'right'})`;
        tally.rows.push(
          `${a.padEnd(8)} vs ${b.padEnd(8)} seed ${seed}  ${outcome.padEnd(18)} ${(r.ticks / TPS / 60).toFixed(1)} min  base ${r.baseHp[0]}/${r.baseHp[1]}`,
        );
      }
    }
  }
  return tally;
}

const pct = (n: number, d: number) => (d === 0 ? '-' : `${((100 * n) / d).toFixed(1)}%`);

function minutes(t: Tally): { at: (q: number) => string } {
  const sorted = t.ticks.map((x) => x / TPS / 60).sort((x, y) => x - y);
  return { at: (q) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]!.toFixed(1) : '-') };
}

function report(t: Tally): void {
  if (flags.has('all')) console.log(t.rows.join('\n') + '\n');
  const decided = t.wins[0] + t.wins[1];
  const overtime = t.ticks.filter((x) => x >= OVERTIME.at).length + t.stalls;
  const crumbled = t.ticks.filter((x) => x >= OVERTIME.crumbleAt).length;
  const { at } = minutes(t);
  const label = (side: 0 | 1) => `${t.pair[side]} (${side === 0 ? 'left' : 'right'})`.padEnd(20);
  console.log(`${t.games} matches (${names.length} bots, both seats, ${SEEDS} seeds)`);
  console.log(`  ${label(0)} wins ${t.wins[0]}  (${pct(t.wins[0], decided)} of decided)`);
  console.log(`  ${label(1)} wins ${t.wins[1]}  (${pct(t.wins[1], decided)} of decided)`);
  console.log(`  draws ${t.draws}, stalls ${t.stalls}, decided in overtime ${pct(overtime, t.games)}, of which only by crumbling bases ${pct(crumbled, t.games)}`);
  console.log(`  length in minutes: shortest ${at(0)}, median ${at(0.5)}, longest ${at(0.999)}`);
  console.log(`  furthest era reached: 1975 in ${t.eras[0]} matches, 2025 in ${t.eras[1]}, 2050 in ${t.eras[2]}`);
  console.log(`  sides that modernized: once ${pct(t.modernized[0], t.games * 2)}, twice ${pct(t.modernized[1], t.games * 2)}`);
  console.log('  win rate per bot:');
  for (const n of names) console.log(`    ${n.padEnd(8)} ${pct(t.perBot[n]!.won, t.perBot[n]!.played)}`);
}

if (flags.has('pairs') || flags.has('mix')) {
  const who = flags.has('mix') ? 'both sides buying a mix, ' : '';
  console.log(`every pair of factions, ${who}${names.length * names.length * SEEDS} matches each; the share is of decided matches`);
  for (const left of FACTION_IDS) {
    for (const right of FACTION_IDS) {
      const t = tournament([left, right]);
      const decided = t.wins[0] + t.wins[1];
      const overtime = t.ticks.filter((x) => x >= OVERTIME.at).length + t.stalls;
      console.log(
        `  ${left.padEnd(11)} (left) ${pct(t.wins[0], decided).padStart(6)}  -  ${pct(t.wins[1], decided).padStart(6)} ${right.padEnd(11)} (right)` +
          `   draws ${String(t.draws).padStart(2)}, stalls ${t.stalls}, overtime ${pct(overtime, t.games).padStart(6)}, median ${minutes(t).at(0.5)} min, reached 2050 in ${pct(t.eras[2]!, t.games)}`,
      );
    }
  }
} else {
  const pair: [FactionId, FactionId] = words.length >= 2 ? [faction(words[0]!), faction(words[1]!)] : DEFAULT_FACTIONS;
  report(tournament(pair));
}
