import { homeOf } from '../defs/index.ts';
import type { FactionId } from '../defs/types.ts';
import { achterhoek } from './factions/achterhoek.ts';
import { havermelk } from './factions/havermelk.ts';
import type { FactionText } from './factions/types.ts';
import { zuidas } from './factions/zuidas.ts';
import { gasten } from './factions/gasten.ts';
import { toeristen } from './factions/toeristen.ts';

/**
 * Every piece of text the player sees. What a faction says and is called lives
 * in ui/factions/<faction>.ts; what they all share is here. Change a name in
 * one of those files and it changes everywhere.
 */
const TEXT: Record<FactionId, FactionText> = { havermelk, achterhoek, zuidas, gasten, toeristen };

/** One value per faction, looked up by faction id. Every faction, also one that cannot be picked yet. */
function perFaction<T>(pick: (text: FactionText) => T): Record<string, T> {
  return Object.fromEntries(Object.entries(TEXT).map(([id, text]) => [id, pick(text)]));
}

/** The factions' own tables of names or descriptions, poured into one. */
function gathered(pick: (text: FactionText) => Record<string, string>): Record<string, string> {
  return Object.assign({}, ...Object.values(TEXT).map((text) => pick(text)));
}

export const NL = {
  title: 'Boermens Gevecht',
  tagline: 'De slag om de subsidie',

  faction: perFaction((text) => ({ name: text.name, place: text.place, trait: text.trait, money: text.money })),

  /** Display names and one-line descriptions by definition id. */
  names: gathered((text) => text.names),
  blurbs: gathered((text) => text.blurbs),

  /** The eras are the same for everyone. */
  era: { '1975': "Jaren '70", '2025': "Jaren '20", '2050': 'De toekomst' } as Record<string, string>,

  hud: {
    special: 'Speciaal',
    eraUp: 'Moderniseren',
    /** Under the modernize button while its bar fills, followed by a percentage. */
    eraProgress: 'vooruitgang',
    subsidy: 'Subsidie',
    perSecond: '/s',
    subsidyMax: 'maximaal',
    /** Under the turret's name: what the button will do. */
    turretHow: { build: 'bouwen', replace: 'oude vervangen', upgrade: 'verbeteren' },
    turretMax: 'maximaal ★★★',
    paused: 'Pauze',
    resume: 'Spatie om verder te gaan',
    /** On the pause card: give up this match and go back to the title card. */
    quit: 'Esc = stoppen en andere facties kiezen',
    /** The overtime banner: {n} is how much harder units hit by now, {m} how much weaker turrets are. */
    overtimeHarder: 'Overtijd! Eenheden slaan {n}% harder',
    overtimeTurrets: ', torens {m}% zwakker',
    overtimeSilent: ', de torens zwijgen',
    /** In front of it all when the rules are set to stop the income in overtime. */
    overtimeDry: 'Subsidiekraan dicht. ',
    /** Next to the purse once the regular income has stopped. */
    kraanDicht: 'subsidiekraan dicht',
    /** The same, short enough for the subsidie button. */
    dry: 'kraan dicht',
    /** Next to the purse of a side whose earnings are being paid to the other side, followed by the seconds left. */
    diverted: 'naar de vijand',
    /** Next to the purse of a side whose prices went up (the Huurverhoging): {n} is how many times the price, followed by the seconds left. */
    hiked: 'huur ×{n}',
    overtimeCrumble: 'Overtijd! Nu brokkelen ook de bases af',
  },

  /** What floats over the field when something happens. */
  shout: {
    subsidy: 'Subsidie toegekend!',
    upgraded: 'Verder en harder!',
    cancelled: 'Gecanceld!',
    healed: 'Opgeknapt!',
    modern: 'Gemoderniseerd:',
    bought: 'Overgenomen!',
    /** Over the estate agent's sign of the Huurverhoging, on the base of the side that pays more. */
    hiked: 'Alles het dubbele!',
    /** What a super unit says when an enemy special passes it by, per faction. */
    unmoved: perFaction((text) => text.unmoved),
  },

  /** What the sound button says in each of its three positions. */
  sound: {
    all: 'Muziek en geluid aan (M)',
    effects: 'Alleen geluidseffecten (M)',
    off: 'Geluid uit (M)',
  },

  /** Why a button press was refused. */
  refuse: {
    gold: 'Te weinig subsidie',
    queue: 'Opleiding zit vol',
    turret: 'Beter wordt het niet',
    special: 'Nog niet klaar',
    progress: 'Nog niet genoeg vooruitgang',
    subsidy: 'Meer subsidie zit er niet in',
    kraanDicht: 'De subsidiekraan is dicht',
    lastEra: 'Moderner bestaat niet',
  },

  start: {
    go: 'Druk op Enter om te beginnen',
    /** On the arrows with which each player picks a faction. */
    previous: 'Vorige factie',
    next: 'Volgende factie',
    /** After a match: back to the title card to pick other factions. */
    back: 'Esc = andere facties kiezen',
    left: 'Linker speler',
    right: 'Rechter speler',
    /** Who plays a side, on the switch on each half of the title card. */
    human: 'Speler',
    computer: 'Computer',
    /** On that switch, for whoever hovers it. */
    whoPlays: 'Speler of computer',
    /** Under the two halves of the title card. */
    alone: 'Alleen? Laat de computer een kant spelen: S of K, of klik op Speler.',
    pause: 'Spatie = pauze, M = muziek of geluid uit',
    goal: 'Sloop de basis van de ander. Torens schieten op wie vooraan loopt, behalve als er een schild meeloopt: dat vangt alles op. Na tien minuten is het overtijd: eenheden slaan harder, torens raken op.',
    /** The two rows on the title card that are the same for every era. */
    subsidy: { name: 'Subsidie aanvragen', blurb: 'Kost nu geld, levert daarna elke tel meer op.' },
    eraUp: {
      name: 'Moderniseren',
      blurb: 'Vooruitgang verdien je met vechten. Is de balk vol, dan koop je het volgende tijdperk.',
    },
    eras: "Drie tijdperken: Jaren '70, Jaren '20 en de toekomst.",
  },

  win: perFaction((text) => text.win),
  draw: { head: 'Gelijkspel', sub: 'Niemand wint, iedereen moe.' },
  again: 'Enter = nog een keer',

  /** What a beaten unit mutters while it slinks off, and what a fresh one shouts, per faction and era. */
  slinkOff: perFaction((text) => text.slinkOff),
  battleCry: perFaction((text) => text.battleCry),
  riding: perFaction((text) => text.riding ?? {}),
};

export function nameOf(id: string): string {
  return NL.names[id] ?? id;
}

/**
 * The lines of one kind (slinkOff, battleCry, riding) for a unit: those of the faction
 * that trained it, for the era in its id ('hm.1975.light').
 */
export function linesFor(kind: 'slinkOff' | 'battleCry' | 'riding', unitId: string): readonly string[] {
  // A unit may have lines of its own (the fatbike kid's); everyone else shares those of their era.
  const lines = NL[kind][homeOf(unitId)];
  const era = unitId.split('.')[1] ?? '';
  return lines?.[unitId] ?? lines?.[era] ?? [];
}
