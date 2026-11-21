/**
 * Bot tournament: every bot against every bot, on both sides, over several seeds.
 * Run with `npm run balance`. Prints who wins, how long matches take and whether any stall.
 */
import { BOTS, random } from '../src/bots/bots.ts';
import { runMatch } from '../src/bots/runMatch.ts';
import { OVERTIME, TPS } from '../src/defs/balance.ts';
import type { FactionId } from '../src/defs/types.ts';

const FACTIONS: [FactionId, FactionId] = ['havermelk', 'achterhoek'];
const names = Object.keys(BOTS);
const SEEDS = 6;

interface Tally {
  wins: [number, number];
  draws: number;
  stalls: number;
  ticks: number[];
  /** How many matches ended with the further-along side in each era. */
  eras: number[];
}

const tally: Tally = { wins: [0, 0], draws: 0, stalls: 0, ticks: [], eras: [0, 0, 0] };
const perBot: Record<string, { played: number; won: number }> = {};
for (const n of [...names, 'random']) perBot[n] = { played: 0, won: 0 };
const rows: string[] = [];

function play(nameA: string, nameB: string, seed: number): void {
  const make = (n: string, s: number) => (n === 'random' ? random(s) : BOTS[n]!());
  let era = 0;
  const r = runMatch({
    seed,
    factions: FACTIONS,
    bots: [make(nameA, seed), make(nameB, seed + 99)],
    jitter: seed,
    onTick: (s) => {
      era = Math.max(era, s.sides[0].era, s.sides[1].era);
    },
  });
  tally.eras[era]!++;
  perBot[nameA]!.played++;
  perBot[nameB]!.played++;
  if (r.winner === null) tally.stalls++;
  else if (r.winner === 'draw') tally.draws++;
  else {
    tally.wins[r.winner]++;
    perBot[r.winner === 0 ? nameA : nameB]!.won++;
  }
  if (r.winner !== null) tally.ticks.push(r.ticks);
  const outcome = r.winner === null ? 'STALL' : r.winner === 'draw' ? 'draw' : FACTIONS[r.winner];
  rows.push(
    `${nameA.padEnd(8)} vs ${nameB.padEnd(8)} seed ${seed}  ${outcome.padEnd(11)} ${(r.ticks / TPS / 60).toFixed(1)} min  base ${r.baseHp[0]}/${r.baseHp[1]}`,
  );
}

const all = [...names, 'random'];
for (const a of all) {
  for (const b of all) {
    // With human timing even a bot against itself is a real match.
    for (let seed = 1; seed <= SEEDS; seed++) play(a, b, seed);
  }
}

const verbose = process.argv.includes('--all');
if (verbose) console.log(rows.join('\n') + '\n');

const games = rows.length;
const decided = tally.wins[0] + tally.wins[1];
const minutes = tally.ticks.map((t) => t / TPS / 60).sort((x, y) => x - y);
const pct = (n: number, d: number) => (d === 0 ? '-' : `${((100 * n) / d).toFixed(1)}%`);
const at = (q: number) => (minutes.length ? minutes[Math.min(minutes.length - 1, Math.floor(q * minutes.length))]!.toFixed(1) : '-');

const overtime = tally.ticks.filter((t) => t >= OVERTIME.at).length + tally.stalls;
console.log(`${games} matches (${all.length} bots, both seats, ${SEEDS} seeds)`);
console.log(`  ${FACTIONS[0].padEnd(11)} wins ${tally.wins[0]}  (${pct(tally.wins[0], decided)} of decided)`);
console.log(`  ${FACTIONS[1].padEnd(11)} wins ${tally.wins[1]}  (${pct(tally.wins[1], decided)} of decided)`);
console.log(`  draws ${tally.draws}, stalls ${tally.stalls}, decided in overtime ${pct(overtime, games)}`);
console.log(`  length in minutes: shortest ${at(0)}, median ${at(0.5)}, longest ${at(0.999)}`);
console.log(`  furthest era reached: 1975 in ${tally.eras[0]} matches, 2025 in ${tally.eras[1]}, 2050 in ${tally.eras[2]}`);
console.log('  win rate per bot:');
for (const n of all) console.log(`    ${n.padEnd(8)} ${pct(perBot[n]!.won, perBot[n]!.played)}`);
