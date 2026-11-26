import { START_GOLD, TURRET_SLOTS } from '../defs/balance.ts';
import { DEFAULT_FACTIONS, eraOf } from '../defs/index.ts';
import type { FactionId } from '../defs/types.ts';
import type { SideState, SimState } from './types.ts';

function createSide(faction: FactionId): SideState {
  const era = eraOf(faction, 0);
  return {
    faction,
    era: 0,
    gold: START_GOLD,
    subsidy: 0,
    progress: 0,
    baseHp: era.baseHp,
    baseMaxHp: era.baseHp,
    units: [],
    riders: [],
    arrivals: [],
    queue: [],
    turrets: new Array<null>(TURRET_SLOTS).fill(null),
    specialReadyAt: era.special.firstReady,
    buffUntil: 0,
    buffDmgPercent: 100,
    buffSpeedPercent: 100,
    divertedUntil: 0,
    hikeFrom: 0,
    hikeUntil: 0,
    hikePercent: 100,
    fallen: [],
    siestaUntil: 0,
  };
}

export function createMatch(seed: number, factions: [FactionId, FactionId] = DEFAULT_FACTIONS): SimState {
  return {
    tick: 0,
    rng: seed >>> 0,
    nextId: 1,
    winner: null,
    sides: [createSide(factions[0]), createSide(factions[1])],
    shots: [],
    waves: [],
    barrages: [],
  };
}
