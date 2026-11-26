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
  SIDESTEP,
  SIEGE_REACH,
  SUBSIDY,
  UNIT_CAP,
} from '../defs/balance.ts';
import { turretDef, unitDef } from '../defs/index.ts';
import type { ShotDef, UnitDef } from '../defs/types.ts';
import { applyCommand, canDo } from './commands.ts';
import { frontUnit, payee } from './lane.ts';
import { kraanDicht, overtimeLevel, turretDamagePercent, unitDamagePercent } from './overtime.ts';
import { advanceRiders, riderInReach, sendRider } from './riders.ts';
import { blinded, boom, dance, dancing, dropPeel, dropTheBeat, flyTurned, passKeys, slipOnPeels, turnedShot } from './carnaval.ts';
import { advanceBarrages, advanceWaves, applyTakeovers } from './specials.ts';
import { applyVaults, bounceOn, crash, feed, preyOf, regrow, remember, sendBack, serveSoup, shoveBack, startVault, sticky, walkSpeed } from './stunts.ts';
import { markPosing, posed, recall, scatterGroup } from './tourists.ts';
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
 * fight side by side at the front and a bigger army really is stronger. Two
 * exceptions keep the rows from jamming: a unit that fights up close walks past
 * its own throwers once they stand still, when it fits in front of them, and a
 * unit that is stuck in its row steps into another one that has room for it
 * (see move()).
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

  // 2. Money and training, and Beppe's soup, which only touches her own side.
  for (const side of SIDES) economy(s, side, events);
  for (const side of SIDES) {
    serveSoup(s, side, events);
    regrow(s, side, events);
  }

  // 3. Everyone decides what to do, looking at the lane as it is right now.
  //    Pole vaulters land once both sides have decided, and then they may be the front.
  markPosing(s);
  let fronts: readonly [Unit | undefined, Unit | undefined] = [frontUnit(s.sides[0].units), frontUnit(s.sides[1].units)];
  for (const side of SIDES) decide(s, side, fronts[other(side)], dmg, events);
  if (applyVaults(s, events)) fronts = [frontUnit(s.sides[0].units), frontUnit(s.sides[1].units)];
  // De Reuzenprins takes over a turret, or gives it back, before anyone fires (sim/carnaval.ts).
  passKeys(s, events);
  for (const side of SIDES) fireTurrets(s, side, fronts[other(side)], events);

  // 4-6. Movement, riders, projectiles, specials. Whoever is in a polonaise dances
  // home once the ranks have moved, and then anyone may walk onto a banana peel.
  move(s, fronts);
  dance(s);
  slipOnPeels(s, dmg, events);
  advanceRiders(s, dmg, events);
  advanceShots(s, dmg, events);
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
  // Whoever's time is up goes first: the ship's horn.
  recall(s, side, events);
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
    const arrival = me.arrivals.shift()!;
    walkOut(s, side, arrival.def, row, events, arrival.leaveAt);
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

/** A unit leaves its own gate in `row` and joins the ranks. `leaveAt` is when it goes again of its own accord, or 0. */
function walkOut(s: SimState, side: Side, defId: string, row: number, events: SimEvent[], leaveAt = 0): void {
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
    posing: false,
    leaveAt,
    tossAt: 0,
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

function decide(s: SimState, side: Side, front: Unit | undefined, dmg: Damage[], events: SimEvent[]): void {
  const me = s.sides[side];

  for (const u of me.units) {
    const def = unitDef(u.def);
    // Everyone fights the enemy's front, except a pole vaulter that leapt at a
    // thrower (sim/stunts.ts). With no enemy unit on the lane the target is the
    // enemy base, at distance LANE.
    const foeFront = (def.vault && preyOf(s, side, u, def)) || front;
    const dist = LANE - u.pos - (foeFront ? foeFront.pos : 0);

    if (u.stunUntil > s.tick || dancing(s, u)) {
      // Stuck, or dancing in the enemy's polonaise: no walking forward, no fighting,
      // and whatever it was doing is interrupted. A dancer is moved by dance().
      u.act = 'idle';
      u.actTick = 0;
      continue;
    }

    // De Zuipwagen drops the beat on its own beat, whatever it is doing (sim/carnaval.ts).
    if (def.party) dropTheBeat(s, side, u, events, dmg);

    // One aboard a beer bike tosses on his own beat, whatever the bike is doing.
    if (def.toss && s.tick >= u.tossAt && dist <= def.toss.range) {
      u.tossAt = s.tick + def.toss.every;
      events.push({ t: 'toss', side, id: u.id });
      launch(s, side, u, def.toss.shot, damageOf(s, side, u, def.toss.dmg), dist, def.toss.range);
    }

    if (u.act === 'attack') {
      // An attack always runs to the end, so its animation never gets cut off.
      // Glued with sugar it runs at half pace: every other tick it stands still.
      if (!(sticky(s, u) && s.tick % 2 === 1)) {
        u.actTick++;
        if (u.actTick === def.windup) strike(s, side, u, def, foeFront, dist, dmg, events);
      }
      if (u.actTick < def.windup + def.recover) continue;
    }

    u.actTick = 0;
    // Against units a fighter stops as soon as it can reach. Against the base it
    // closes in first, or only the front rank of a ranged army would ever fire.
    const reach = foeFront ? def.range : Math.min(def.range, SIEGE_REACH);
    if (foeFront && def.vault && !u.vaulted && dist <= reach && startVault(s, side, u, def, foeFront)) {
      // The pole vaulter goes over the close fighters to a thrower behind them (sim/stunts.ts).
      continue;
    }
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
  if (def.poser) {
    // Influencer-Ivy throws nothing: she films, and whoever is in her shot poses (sim/tourists.ts).
    events.push({ t: 'strike', side, id: u.id, ranged: false, filming: true });
    return;
  }
  events.push({ t: 'strike', side, id: u.id, ranged: def.shot !== undefined });
  let amount = damageOf(s, side, u, def.dmg);
  if (def.shot) {
    launch(s, side, u, def.shot, amount, dist, def.range, {
      ...(def.sticky ? { sticky: def.sticky.ticks } : {}),
      ...(def.bounce ? { bounce: { ...def.bounce } } : {}),
    });
    return;
  }
  if (dist > def.range) return; // the target is gone; the blow hits air
  const foe = other(side);
  // The skater who cannot brake: the first blow is a crash (sim/stunts.ts).
  const crashing = def.charge !== undefined && !u.charged;
  if (crashing) amount = crash(s, side, u, def, amount, events);
  const shove = crashing && def.charge ? { shove: def.charge.shove } : {};
  // De Vreter keeps count of what it hits, to eat it at the end of the tick.
  const from = def.feeds ? { from: u.id } : {};
  if (!foeFront) {
    dmg.push({ side: foe, unit: BASE, amount });
  } else if (def.cleave) {
    // Everyone within the sweep: the front unit of each row, and with a long
    // sweep (a super unit's) the ranks behind them as well.
    for (const f of s.sides[foe].units) {
      if (LANE - u.pos - f.pos <= def.sweep) dmg.push({ side: foe, unit: f.id, amount, ...from });
    }
  } else {
    dmg.push({ side: foe, unit: foeFront.id, amount, ...shove, ...from });
  }
}

/** What a blow or a throw of `base` does now: a buff and overtime both make it harder, one on top of the other; posing makes it softer. */
function damageOf(s: SimState, side: Side, u: Unit, base: number): number {
  const me = s.sides[side];
  const fired = buffed(me, s.tick) ? Math.floor((base * me.buffDmgPercent) / 100) : base;
  return posed(u, Math.floor((fired * unitDamagePercent(s.tick)) / 100));
}

/**
 * Sends a unit's throw down the lane. It hits the first enemy body it meets
 * (see advanceShots). With confetti in the thrower's eyes it misses: it sails
 * over everyone and comes down at its limit.
 */
function launch(s: SimState, side: Side, u: Unit, shot: ShotDef, amount: number, dist: number, range: number, extra: Partial<Shot> = {}): void {
  const miss = blinded(s, u);
  s.shots.push({
    ...extra,
    ...(miss ? { miss: true as const } : {}),
    id: s.nextId++,
    side,
    pos: u.pos,
    prevPos: u.pos,
    origin: u.pos,
    dist0: miss ? range + SHOT_SLACK : Math.max(dist, 1),
    limit: u.pos + range + SHOT_SLACK,
    speed: shot.speed,
    dmg: amount,
    rig: shot.rig,
    arc: shot.arc,
    spin: shot.spin,
    src: u.id,
    row: u.row,
    slot: -1,
    aim: -1,
  });
}

function fireTurrets(s: SimState, side: Side, foeFront: Unit | undefined, events: SimEvent[]): void {
  const turrets = s.sides[side].turrets;
  // Too hot to work: under the enemy's Tropenrooster nobody fires, though the turrets do reload.
  const siesta = s.sides[side].siestaUntil > s.tick;
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
    if (t.cd > 0 || worn <= 0 || siesta) continue;
    const def = turretDef(t.def);
    if (t.heldBy !== undefined) {
      // Taken over with the key of the city: it fires at its own side's units, for the enemy (sim/carnaval.ts).
      const turned = turnedShot(s, side, slot);
      if (!turned) continue;
      t.cd = def.cooldown;
      s.shots.push(turned);
      events.push({ t: 'turretFire', side, slot });
      continue;
    }
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

/**
 * What a unit walking in one row runs into, built up front to back as the
 * units of a side move: `all` is how far forward the next one may come this
 * tick behind everyone ahead, `solid` the same behind everyone but the
 * throwers that stand still, `room` how far forward it could ever stand behind
 * those, whatever the front line does this tick, and `thrower` the front of
 * the foremost of those standing throwers since the last unit that is not one,
 * or -1.
 */
interface RowRoom {
  all: number;
  solid: number;
  room: number;
  thrower: number;
}

/**
 * Where a walking unit gets to this tick in a row. A thrower stays behind
 * everyone ahead of it. A unit that fights up close (light, heavy, schild,
 * super) may walk past throwers of its own that stand still, firing or
 * waiting, but only when its whole body fits between them and the next unit
 * up or the enemy, or once it is already past their backs. Otherwise it queues
 * behind them as anyone does.
 */
function advance(u: Unit, def: UnitDef, row: RowRoom, speed: number, foePos: number): number {
  let limit = row.all;
  if (def.role !== 'ranged' && row.thrower >= 0) {
    // Where it would stop: within reach of the enemy's front, or behind the next unit up that is not a thrower.
    const stand = Math.min(row.room, LANE - foePos - def.range);
    if (stand - def.len - FOLLOW_GAP >= row.thrower || u.pos > row.all) limit = row.solid;
  }
  return Math.max(u.pos, Math.min(u.pos + speed, limit));
}

/** True when a body of `len` fronting at `pos` keeps its distance from everyone in `row`. */
function clearIn(units: readonly Unit[], row: number, self: Unit, pos: number, len: number): boolean {
  for (const x of units) {
    if (x === self || x.row !== row) continue;
    if (x.pos > pos - len - FOLLOW_GAP && x.pos - unitDef(x.def).len < pos + FOLLOW_GAP) return false;
  }
  return true;
}

/**
 * A unit stuck in its row steps into another row when there is room for it
 * right where it stands, and that row lets it get at least SIDESTEP further
 * forward. Of several, the one that lets it furthest, the nearest on a tie.
 * Returns the row, or -1.
 */
function sidestep(units: readonly Unit[], u: Unit, def: UnitDef, rows: readonly RowRoom[], speed: number, foePos: number): number {
  let best = -1;
  let bestTo = u.pos + SIDESTEP;
  for (const r of ROW_ORDER) {
    if (r === u.row || !clearIn(units, r, u, u.pos, def.len)) continue;
    // How far it could get there, were it as fast as it likes.
    const to = advance(u, def, rows[r]!, LANE, foePos);
    const nearer = best >= 0 && Math.abs(r - u.row) < Math.abs(best - u.row);
    if (to > bestTo || (to === bestTo && nearer)) {
      best = r;
      bestTo = to;
    }
  }
  return best >= 0 && advance(u, def, rows[best]!, speed, foePos) > u.pos ? best : -1;
}

function move(s: SimState, fronts: readonly [Unit | undefined, Unit | undefined]): void {
  // How far each side's front line may advance this tick. When the two lines
  // are about to meet they share the remaining gap in proportion to their
  // speed, rounded down for both, so neither side gains from the rounding.
  // Where both front lines stand before anyone moves. The left side moves first, so reading the
  // front unit itself later in this function would show the right side the left one's new position.
  const line: [number, number] = [fronts[0]?.pos ?? 0, fronts[1]?.pos ?? 0];
  const fastest: [number, number] = [0, 0];
  const pace: [number, number] = [100, 100];
  for (const side of SIDES) {
    if (buffed(s.sides[side], s.tick)) pace[side] = s.sides[side].buffSpeedPercent;
    for (const u of s.sides[side].units) {
      if (u.act === 'walk') fastest[side] = Math.max(fastest[side], walkSpeed(s, u, unitDef(u.def), pace[side]));
    }
  }
  const gap = Math.max(0, LANE - line[0] - line[1] - CONTACT_GAP);
  const total = fastest[0] + fastest[1];
  const reach: [number, number] =
    total > gap
      ? [Math.floor((gap * fastest[0]) / total), Math.floor((gap * fastest[1]) / total)]
      : [fastest[0], fastest[1]];

  for (const side of SIDES) {
    const units = s.sides[side].units;
    const foePos = line[other(side)];
    // Nobody passes the front line, and nobody walks into the enemy base.
    const frontLimit = Math.min(line[side] + reach[side], LANE - BASE_GAP);
    const rows: RowRoom[] = Array.from({ length: ROWS }, () => ({ all: frontLimit, solid: frontLimit, room: LANE - BASE_GAP, thrower: -1 }));
    // Front to back, whatever the row, so whoever stands further forward has
    // moved before anyone behind looks. Within a row the list then runs front
    // to back, as the rest of the game expects. The sort keeps ties in order.
    units.sort((a, b) => b.pos - a.pos);
    for (const u of units) {
      const def = unitDef(u.def);
      u.prevPos = u.pos;
      if (u.act === 'walk') {
        const speed = walkSpeed(s, u, def, pace[side]);
        let next = advance(u, def, rows[u.row]!, speed, foePos);
        if (next === u.pos) {
          const r = sidestep(units, u, def, rows, speed, foePos);
          if (r >= 0) {
            u.row = r;
            next = advance(u, def, rows[r]!, speed, foePos);
          }
        }
        if (next === u.pos) u.act = 'idle';
        u.pos = next;
      }
      const row = rows[u.row]!;
      const back = u.pos - def.len - FOLLOW_GAP;
      row.all = Math.min(row.all, back);
      if (def.role === 'ranged' && u.act !== 'walk') {
        if (row.thrower < 0) row.thrower = u.pos;
      } else {
        row.solid = Math.min(row.solid, back);
        row.room = Math.min(row.room, back);
        row.thrower = -1;
      }
    }
  }
}

function advanceShots(s: SimState, dmg: Damage[], events: SimEvent[]): void {
  const keep: Shot[] = [];
  for (const shot of s.shots) {
    shot.prevPos = shot.pos;
    shot.pos += shot.speed;
    // A turret taken over with the key fires at its own side; a throw with confetti in the eyes hits nobody.
    if (shot.turned) {
      if (flyTurned(s, shot, dmg)) keep.push(shot);
      continue;
    }
    if (shot.miss) {
      if (shot.pos <= shot.limit) keep.push(shot);
      continue;
    }
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
        const hit = units.find((u) => u.id === front.id);
        // Padel-Pepijn sends it back; a bouncing beet goes on to the next one (sim/stunts.ts).
        const back = hit ? sendBack(s, foe, hit, shot, events) : null;
        if (back) {
          keep.push(back);
          continue;
        }
        dmg.push({ side: foe, unit: front.id, amount: shot.dmg, turret: shot.slot >= 0, ...(shot.sticky ? { sticky: shot.sticky } : {}) });
        const on = hit ? bounceOn(s, shot, units, hit) : null;
        if (on) keep.push(on);
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
  /** Per side, the big drums a turret's shot bounced off this tick, and who stopped to party. */
  const drums: [Set<number>, Set<number>] = [new Set(), new Set()];
  const partied: [number[], number[]] = [[], []];
  let party = 0;
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
    if (d.cancelled) {
      // Whatever it has left, healed on this very tick or not: it is gone.
      const amount = Math.max(0, u.hp);
      u.hp -= amount;
      events.push({ t: 'hit', side: d.side, id: u.id, amount, pos: u.pos });
      continue;
    }
    if (d.conga || d.party || d.slip) {
      // Pulled into a polonaise, partying, or flat on a banana peel (sim/carnaval.ts). Only the polonaise also bumps.
      if (d.conga) {
        u.congaUntil = Math.max(u.congaUntil ?? 0, s.tick + d.conga);
        u.act = 'idle';
        u.actTick = 0;
        events.push({ t: 'conga', side: d.side, id: u.id, ticks: d.conga });
      }
      if (d.party) {
        u.stunUntil = Math.max(u.stunUntil, s.tick + d.party);
        partied[d.side].push(u.id);
        party = d.party;
      }
      if (d.slip) u.stunUntil = Math.max(u.stunUntil, s.tick + d.slip);
      if (d.amount <= 0) continue;
    }
    // A unit that grows back only does so once it is left alone (sim/stunts.ts).
    if (unitDef(u.def).regrows && d.amount > 0) u.hitAt = s.tick;
    const share = d.turret ? unitDef(u.def).turretPercent : 100;
    if (share < 100) {
      // A turret's shot on a unit that shrugs turrets off: most of it bounces away. Off a big drum it booms.
      const amount = Math.floor((d.amount * share) / 100);
      u.hp -= amount;
      events.push({ t: 'glance', side: d.side, id: u.id, amount, pos: u.pos });
      if (unitDef(u.def).drum) drums[d.side].add(u.id);
      continue;
    }
    u.hp -= d.amount;
    events.push({ t: 'hit', side: d.side, id: u.id, amount: d.amount, pos: u.pos });
    // Sugar sticks to anyone who does not shrug specials off.
    if (d.sticky && !unitDef(u.def).immune) u.stickyUntil = Math.max(u.stickyUntil ?? 0, s.tick + d.sticky);
  }

  // De Vreter eats what it hit, if it is still standing itself.
  feed(s, dmg, events);
  // The drums that were hit boom, and whoever De Zuipwagen got going parties.
  boom(s, drums, events);
  for (const side of SIDES) if (partied[side].length > 0) events.push({ t: 'partied', side, ids: partied[side], ticks: party });

  // Whoever a skater crashed into and is still standing is shoved back. Each
  // side's units only move among their own, so the order of the sides does not matter.
  for (const d of dmg) {
    if (!d.shove) continue;
    const units = s.sides[d.side].units;
    const u = units.find((x) => x.id === d.unit);
    if (!u || u.hp <= 0) continue;
    const from = u.pos;
    u.pos = shoveBack(units, u, d.shove);
    u.prevPos = u.pos;
    u.act = 'idle';
    u.actTick = 0;
    if (u.pos !== from) events.push({ t: 'shoved', side: d.side, id: u.id, from, to: u.pos });
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
    const fallen: Unit[] = [];
    for (const u of me.units) {
      if (u.hp > 0) alive.push(u);
      else {
        beaten(u);
        remember(s, side, u);
        fallen.push(u);
      }
    }
    me.units = alive;
    // A schild that scatters leaves its group behind where it stood (sim/tourists.ts), and a banana its peel (sim/carnaval.ts).
    for (const u of fallen) {
      scatterGroup(s, side, u, events);
      dropPeel(s, side, u, events);
    }
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
