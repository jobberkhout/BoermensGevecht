import {
  BASE_GAP,
  CONTACT_GAP,
  FOLLOW_GAP,
  INCOME_EVERY,
  LANE,
  OVERTIME,
  PROGRESS,
  ROW_ORDER,
  ROWS,
  SHOT_SLACK,
  SIEGE_REACH,
  SUBSIDY,
  UNIT_CAP,
} from '../defs/balance.ts';
import { turretDef, unitDef } from '../defs/index.ts';
import type { UnitDef } from '../defs/types.ts';
import { applyCommand, canDo } from './commands.ts';
import { frontUnit, payee } from './lane.ts';
import { kraanDicht, overtimeLevel, turretDamagePercent, unitDamagePercent } from './overtime.ts';
import { advanceRiders, riderInReach, sendRider } from './riders.ts';
import { advanceBarrages, advanceWaves, applyTakeovers } from './specials.ts';
import { turretDamage, turretRange } from './turrets.ts';
import {
  BASE,
  SIDES,
  other,
  type Damage,
  type Rider,
  type Shot,
  type Side,
  type SideState,
  type SimEvent,
  type SimState,
  type Stamped,
  type Unit,
} from './types.ts';

/**
 * Advances the match by one tick.
 *
 * Positions are distances from a unit's own gate, so both sides run exactly the
 * same arithmetic. Nothing takes damage until the end of the tick, so two units
 * that strike each other on the same tick both land their blow.
 *
 * Units march in ROWS rows. A unit cannot pass an ally in its own row or the
 * enemy's foremost unit, but it can pass allies in other rows, so a few units
 * fight side by side at the front and a bigger army really is stronger.
 */
export function step(s: SimState, cmds: readonly Stamped[], events: SimEvent[]): void {
  if (s.winner !== null) return;

  // Everything that hurts this tick is collected here and applied at the end.
  const dmg: Damage[] = [];

  // 1. Commands. A command changes its own side's purse, queue and base, sets
  //    flags, or queues damage; none of that depends on which side goes first.
  for (const side of SIDES) {
    for (const c of cmds) {
      if (c.side === side && c.tick === s.tick && canDo(s, side, c.cmd)) applyCommand(s, side, c.cmd, events, dmg);
    }
  }

  // 2. Money and training.
  for (const side of SIDES) economy(s, side, events);

  // 3. Everyone decides what to do, looking at the lane as it is right now.
  const fronts = [frontUnit(s.sides[0].units), frontUnit(s.sides[1].units)] as const;
  for (const side of SIDES) decide(s, side, fronts[other(side)], dmg, events);
  for (const side of SIDES) fireTurrets(s, side, fronts[other(side)], events);

  // 4-6. Movement, riders, projectiles, specials.
  move(s, fronts);
  advanceRiders(s, dmg, events);
  advanceShots(s, dmg);
  advanceWaves(s, dmg);
  advanceBarrages(s, dmg, events);
  overtime(s, dmg, events);

  // 7-8. Damage lands, beaten units leave, and a base at zero ends the match.
  resolve(s, dmg, events);

  s.tick++;
}

/** True while this side's units are fired up by a buff. */
function buffed(side: SideState, tick: number): boolean {
  return side.buffUntil > tick;
}

function economy(s: SimState, side: Side, events: SimEvent[]): void {
  const me = s.sides[side];
  if (s.tick > 0 && s.tick % INCOME_EVERY === 0) {
    if (!kraanDicht(s.tick)) {
      // Paid to this side, or to the other one for as long as its earnings are diverted.
      const to = payee(s, side);
      const income = SUBSIDY.income[me.subsidy]!;
      s.sides[to].gold += income;
      if (to !== side) events.push({ t: 'skimmed', side: to, amount: income });
    }
    me.progress += PROGRESS.perInterval;
  }

  // Whoever a special called in comes out first, unit cap or not, as long as a row has room at the gate.
  for (let row = freeRow(me.units); me.arrivals.length > 0 && row >= 0; row = freeRow(me.units)) {
    walkOut(s, side, me.arrivals.shift()!, row, events);
  }

  const head = me.queue[0];
  if (!head) return;
  if (head.left > 0) {
    head.left--;
    return;
  }
  // Trained. A rider leaves as soon as the last one is gone; it does not join the ranks.
  const def = unitDef(head.def);
  if (def.rider) {
    if (sendRider(s, side, def.id, events)) me.queue.shift();
    return;
  }
  // Anyone else walks out as soon as there is room on the lane and at the gate.
  if (me.units.length >= UNIT_CAP) return;
  const row = freeRow(me.units);
  if (row < 0) return;

  me.queue.shift();
  walkOut(s, side, def.id, row, events);
}

/** A unit leaves its own gate in `row` and joins the ranks. */
function walkOut(s: SimState, side: Side, defId: string, row: number, events: SimEvent[]): void {
  const def = unitDef(defId);
  const unit: Unit = {
    id: s.nextId++,
    def: def.id,
    row,
    pos: 0,
    prevPos: 0,
    hp: def.hp,
    act: 'walk',
    actTick: 0,
    stunUntil: 0,
    turncoat: false,
  };
  s.sides[side].units.push(unit);
  events.push({ t: 'spawn', side, id: unit.id, def: def.id });
}

/** The row with the most room at the gate, or -1 when every row is still blocked. */
function freeRow(units: readonly Unit[]): number {
  const room = new Array<number>(ROWS).fill(Infinity);
  for (const u of units) {
    room[u.row] = Math.min(room[u.row]!, u.pos - unitDef(u.def).len - FOLLOW_GAP);
  }
  let best = -1;
  let bestRoom = -1;
  for (const row of ROW_ORDER) {
    if (room[row]! >= 0 && room[row]! > bestRoom) {
      best = row;
      bestRoom = room[row]!;
    }
  }
  return best;
}

function decide(s: SimState, side: Side, foeFront: Unit | undefined, dmg: Damage[], events: SimEvent[]): void {
  const me = s.sides[side];
  // With no enemy unit on the lane the target is the enemy base, at distance LANE.
  const foePos = foeFront ? foeFront.pos : 0;

  for (const u of me.units) {
    const def = unitDef(u.def);
    const dist = LANE - u.pos - foePos;

    if (u.stunUntil > s.tick) {
      // Stuck: no walking, no fighting, and whatever it was doing is interrupted.
      u.act = 'idle';
      u.actTick = 0;
      continue;
    }

    if (u.act === 'attack') {
      // An attack always runs to the end, so its animation never gets cut off.
      u.actTick++;
      if (u.actTick === def.windup) strike(s, side, u, def, foeFront, dist, dmg, events);
      if (u.actTick < def.windup + def.recover) continue;
    }

    u.actTick = 0;
    // Against units a fighter stops as soon as it can reach. Against the base it
    // closes in first, or only the front rank of a ranged army would ever fire.
    const reach = foeFront ? def.range : Math.min(def.range, SIEGE_REACH);
    if (dist <= reach) {
      u.act = 'attack';
      events.push({ t: 'attack', side, id: u.id });
    } else {
      u.act = 'walk';
    }
  }
}

function strike(
  s: SimState,
  side: Side,
  u: Unit,
  def: UnitDef,
  foeFront: Unit | undefined,
  dist: number,
  dmg: Damage[],
  events: SimEvent[],
): void {
  events.push({ t: 'strike', side, id: u.id, ranged: def.shot !== undefined });
  const me = s.sides[side];
  // A buff and overtime both make a unit hit harder; one on top of the other.
  const fired = buffed(me, s.tick) ? Math.floor((def.dmg * me.buffDmgPercent) / 100) : def.dmg;
  const amount = Math.floor((fired * unitDamagePercent(s.tick)) / 100);
  if (def.shot) {
    s.shots.push({
      id: s.nextId++,
      side,
      pos: u.pos,
      prevPos: u.pos,
      origin: u.pos,
      dist0: Math.max(dist, 1),
      limit: u.pos + def.range + SHOT_SLACK,
      speed: def.shot.speed,
      dmg: amount,
      rig: def.shot.rig,
      arc: def.shot.arc,
      spin: def.shot.spin,
      src: u.id,
      row: u.row,
      slot: -1,
      aim: -1,
    });
    return;
  }
  if (dist > def.range) return; // the target is gone; the blow hits air
  const foe = other(side);
  if (!foeFront) {
    dmg.push({ side: foe, unit: BASE, amount });
  } else if (def.cleave) {
    for (const f of s.sides[foe].units) {
      if (LANE - u.pos - f.pos <= def.range) dmg.push({ side: foe, unit: f.id, amount });
    }
  } else {
    dmg.push({ side: foe, unit: foeFront.id, amount });
  }
}

function fireTurrets(s: SimState, side: Side, foeFront: Unit | undefined, events: SimEvent[]): void {
  const turrets = s.sides[side].turrets;
  // A unit that draws fire is what every turret in reach aims at, wherever it
  // stands in the enemy's ranks. With several of them, the foremost.
  const rod = frontUnit(s.sides[other(side)].units.filter((u) => unitDef(u.def).drawsFire));
  const riders = s.sides[other(side)].riders;
  // Deep into overtime turrets are worn out and stay silent.
  const worn = turretDamagePercent(s.tick);
  for (let slot = 0; slot < turrets.length; slot++) {
    const t = turrets[slot];
    if (!t) continue;
    if (t.cd > 0) t.cd--;
    if (t.cd > 0 || worn <= 0) continue;
    const def = turretDef(t.def);
    const range = turretRange(def, t.level);
    // A rider in reach comes before anything else: it is the thing going for the base.
    const rider = riderInReach(riders, range);
    const drawn: Unit | Rider | undefined = rider ?? (rod && LANE - rod.pos <= range ? rod : undefined);
    const target = drawn ?? foeFront;
    if (!target) continue;
    const dist = LANE - target.pos;
    if (dist > range) continue;
    t.cd = def.cooldown;
    s.shots.push({
      id: s.nextId++,
      side,
      pos: 0,
      prevPos: 0,
      origin: 0,
      dist0: Math.max(dist, 1),
      limit: range + SHOT_SLACK,
      speed: def.shot.speed,
      dmg: Math.floor((turretDamage(def, t.level) * worn) / 100),
      rig: def.shot.rig,
      arc: def.shot.arc,
      spin: def.shot.spin,
      src: -1,
      row: target.row,
      slot,
      aim: drawn ? drawn.id : -1,
    });
    events.push({ t: 'turretFire', side, slot });
  }
}

function move(s: SimState, fronts: readonly [Unit | undefined, Unit | undefined]): void {
  // How far each side's front line may advance this tick. When the two lines
  // are about to meet they share the remaining gap in proportion to their
  // speed, rounded down for both, so neither side gains from the rounding.
  const line: [number, number] = [fronts[0]?.pos ?? 0, fronts[1]?.pos ?? 0];
  const fastest: [number, number] = [0, 0];
  const pace: [number, number] = [100, 100];
  for (const side of SIDES) {
    if (buffed(s.sides[side], s.tick)) pace[side] = s.sides[side].buffSpeedPercent;
    for (const u of s.sides[side].units) {
      if (u.act === 'walk') fastest[side] = Math.max(fastest[side], Math.floor((unitDef(u.def).speed * pace[side]) / 100));
    }
  }
  const gap = Math.max(0, LANE - line[0] - line[1] - CONTACT_GAP);
  const total = fastest[0] + fastest[1];
  const reach: [number, number] =
    total > gap
      ? [Math.floor((gap * fastest[0]) / total), Math.floor((gap * fastest[1]) / total)]
      : [fastest[0], fastest[1]];

  for (const side of SIDES) {
    // Nobody passes the front line, and nobody walks into the enemy base.
    const frontLimit = Math.min(line[side] + reach[side], LANE - BASE_GAP);
    const rowLimit = new Array<number>(ROWS).fill(frontLimit);
    // Within a row, units are stored front to back: new units join at the back.
    for (const u of s.sides[side].units) {
      const def = unitDef(u.def);
      u.prevPos = u.pos;
      if (u.act === 'walk') {
        const speed = Math.floor((def.speed * pace[side]) / 100);
        const next = Math.max(u.pos, Math.min(u.pos + speed, rowLimit[u.row]!));
        if (next === u.pos) u.act = 'idle';
        u.pos = next;
      }
      rowLimit[u.row] = Math.min(rowLimit[u.row]!, u.pos - def.len - FOLLOW_GAP);
    }
  }
}

function advanceShots(s: SimState, dmg: Damage[]): void {
  const keep: Shot[] = [];
  for (const shot of s.shots) {
    shot.prevPos = shot.pos;
    shot.pos += shot.speed;
    const foe = other(shot.side);
    const units = s.sides[foe].units;
    // The first body a shot meets is the enemy's foremost unit. Only a turret's
    // shot that was drawn to a unit or a rider flies on to it, for as long as it is there.
    const drawn: Unit | Rider | undefined =
      shot.aim >= 0 ? (units.find((u) => u.id === shot.aim) ?? s.sides[foe].riders.find((r) => r.id === shot.aim)) : undefined;
    const front = drawn ?? frontUnit(units);
    const reach = Math.min(shot.pos, shot.limit);
    if (front) {
      if (LANE - reach - front.pos <= 0) {
        dmg.push({ side: foe, unit: front.id, amount: shot.dmg, turret: shot.slot >= 0 });
        continue;
      }
    } else if (reach >= LANE) {
      dmg.push({ side: foe, unit: BASE, amount: shot.dmg });
      continue;
    }
    if (shot.pos > shot.limit) continue; // out of range: fizzled
    keep.push(shot);
  }
  s.shots = keep;
}

/** Past the time limit both bases crumble at the same rate, so every match ends. */
function overtime(s: SimState, dmg: Damage[], events: SimEvent[]): void {
  if (s.tick < OVERTIME.at) return;
  if (s.tick === OVERTIME.at) events.push({ t: 'overtime' });
  // The harder hitting happens where units strike and the wearing out where turrets fire; this only announces each step.
  if ((s.tick - OVERTIME.at) % OVERTIME.every === 0) {
    events.push({ t: 'escalate', level: overtimeLevel(s.tick), percent: unitDamagePercent(s.tick) - 100, turrets: turretDamagePercent(s.tick) });
  }
  if (s.tick < OVERTIME.crumbleAt) return;
  if (s.tick === OVERTIME.crumbleAt) events.push({ t: 'crumble' });
  if ((s.tick - OVERTIME.crumbleAt) % OVERTIME.crumbleEvery !== 0) return;
  for (const side of SIDES) {
    const amount = Math.ceil((s.sides[side].baseMaxHp * OVERTIME.crumblePercent) / 100);
    dmg.push({ side, unit: BASE, amount });
  }
}

function resolve(s: SimState, dmg: Damage[], events: SimEvent[]): void {
  /** Per side, the units it loses to a takeover this tick. */
  const sold: [number[], number[]] = [[], []];
  for (const d of dmg) {
    const target = s.sides[d.side];
    if (d.bought) {
      sold[d.side].push(d.unit);
      continue;
    }
    if (d.unit === BASE) {
      target.baseHp -= d.amount; // may dip below zero for a moment; settled below
      events.push({ t: 'baseHit', side: d.side, amount: d.amount });
      continue;
    }
    const u = target.units.find((x) => x.id === d.unit);
    if (!u) {
      const r = target.riders.find((x) => x.id === d.unit);
      if (r) {
        r.hp -= d.amount;
        events.push({ t: 'hit', side: d.side, id: r.id, amount: d.amount, pos: r.pos });
      }
      continue;
    }
    const share = d.turret ? unitDef(u.def).turretPercent : 100;
    if (share < 100) {
      // A turret's shot on a unit that shrugs turrets off: most of it bounces away.
      const amount = Math.floor((d.amount * share) / 100);
      u.hp -= amount;
      events.push({ t: 'glance', side: d.side, id: u.id, amount, pos: u.pos });
      continue;
    }
    u.hp -= d.amount;
    events.push({ t: 'hit', side: d.side, id: u.id, amount: d.amount, pos: u.pos });
  }

  for (const side of SIDES) {
    const me = s.sides[side];
    const foe = s.sides[other(side)];
    const alive: Unit[] = [];
    const beaten = (who: Unit | Rider): void => {
      const def = unitDef(who.def);
      const bounty = def.bounty;
      // The bounty goes to whoever beat it, unless their earnings are diverted: then it comes back to the loser.
      const to = payee(s, other(side));
      s.sides[to].gold += bounty;
      // Both sides learn from a fight; the one that won it learns more.
      foe.progress += Math.floor((def.cost * PROGRESS.killPercent) / 100);
      me.progress += Math.floor((def.cost * PROGRESS.lossPercent) / 100);
      events.push({ t: 'defeat', side, id: who.id, def: who.def, pos: who.pos });
      if (bounty === 0) return; // a unit a special called in pays nothing
      if (to === side) events.push({ t: 'gold', side, amount: bounty, pos: who.pos, diverted: true });
      else events.push({ t: 'gold', side: to, amount: bounty, pos: LANE - who.pos });
    };
    for (const u of me.units) {
      if (u.hp > 0) alive.push(u);
      else beaten(u);
    }
    me.units = alive;
    // A rider that reached the base is simply gone; one that was stopped on the way is paid for like a unit.
    const riding: Rider[] = [];
    for (const r of me.riders) {
      if (r.arrived) continue;
      if (r.hp > 0) riding.push(r);
      else beaten(r);
    }
    me.riders = riding;
  }
  // Whoever was bought and is still standing changes sides now.
  if (sold[0].length > 0 || sold[1].length > 0) applyTakeovers(s, sold, events);

  // If both bases fall on the same tick, the one that was hit harder loses.
  const hp = [s.sides[0].baseHp, s.sides[1].baseHp] as const;
  if (hp[0] <= 0 || hp[1] <= 0) {
    if (hp[0] <= 0 && hp[1] <= 0) s.winner = hp[0] === hp[1] ? 'draw' : hp[0] < hp[1] ? 1 : 0;
    else s.winner = hp[0] <= 0 ? 1 : 0;
    s.sides[0].baseHp = Math.max(0, hp[0]);
    s.sides[1].baseHp = Math.max(0, hp[1]);
    events.push({ t: 'win', winner: s.winner });
  }
}
