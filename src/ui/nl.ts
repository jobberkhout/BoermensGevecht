/**
 * Every piece of text the player sees. Farmers talk Achterhoeks, the elite
 * talks Amsterdam hip-speak. Change a name here and it changes everywhere.
 */

export const NL = {
  title: 'Boermens Gevecht',
  tagline: 'De Achterhoek tegen de havermelkelite',

  faction: {
    havermelk: { name: 'Havermelkelite', place: 'Amsterdam', money: 'cultuursubsidie' },
    achterhoek: { name: 'Achterhoek', place: 'De Achterhoek', money: 'landbouwsubsidie' },
  },

  /** Display names by definition id. */
  names: {
    'hm.e4.light': 'Padel-Pepijn',
    'hm.e4.ranged': 'Barista Bo',
    'hm.e4.heavy': 'Bakfiets-Babette',
    'hm.e4.turret': 'Podcaststudio',
    'hm.e4.special': 'Wegblokkade',
    'ah.e4.light': 'Quadink',
    'ah.e4.ranged': 'Dronink',
    'ah.e4.heavy': 'Giertink',
    'ah.e4.turret': 'Beregenings\u00adkanon',
    'ah.e4.special': 'Trekkerkolonne',
  } as Record<string, string>,

  /** One line under the name on the how-to-play card. */
  blurbs: {
    'hm.e4.light': 'Snel, goedkoop, slaat met zijn padelracket.',
    'hm.e4.ranged': 'Gooit haver-flat-whites van een afstand.',
    'hm.e4.heavy': 'Elektrische bakfiets. Ramt alles wat voor de bak komt.',
    'hm.e4.turret': 'Zo saai dat de vijand ervan wegkwijnt.',
    'hm.e4.special': 'Activisten lijmen zich vast: de vijand staat vijf tellen stil.',
    'ah.e4.light': 'Snel, goedkoop, rijdt je zo van de sokken.',
    'ah.e4.ranged': 'Stuurt zijn spuitdrone eropaf.',
    'ah.e4.heavy': 'Megatrekker met giertank. Raakt alles wat in de weg staat.',
    'ah.e4.turret': 'Zet de hele straat onder water.',
    'ah.e4.special': 'Een stoet trekkers dendert over de baan en raakt iedereen.',
  } as Record<string, string>,

  era: {
    'hm.e4': "Jaren '20",
    'ah.e4': "Jaren '20",
  } as Record<string, string>,

  hud: {
    money: 'subsidie',
    turret: 'Verdediging',
    turretFull: 'Vol',
    special: 'Speciaal',
    eraUp: 'Moderniseren',
    queue: 'In opleiding',
    paused: 'Pauze',
    resume: 'Spatie om verder te gaan',
    overtime: 'Overtijd! Beide bases brokkelen af',
  },

  /** Why a button press was refused. */
  refuse: {
    gold: 'Te weinig subsidie',
    queue: 'Opleiding zit vol',
    turret: 'Geen plek meer',
    special: 'Nog niet klaar',
  },

  start: {
    go: 'Druk op Enter om te beginnen',
    left: 'Linker speler',
    right: 'Rechter speler',
    keys: 'Toetsen',
    units: 'Eenheden',
    pause: 'Spatie = pauze',
    goal: 'Sloop de basis van de ander. Wie in de overtijd de minste schade heeft, wint.',
  },

  win: {
    havermelk: { head: 'De Havermelkelite wint!', sub: 'Super chill. Nog een flat white?' },
    achterhoek: { head: 'De Achterhoek wint!', sub: "D'ran! Tijd veur een pilsken." },
    draw: { head: 'Gelijkspel', sub: 'Niemand wint, iedereen moe.' },
    again: 'Enter = nog een keer',
  },

  /** What a beaten unit mutters while it slinks off. */
  slinkOff: {
    havermelk: ['Ik heb zo brunch', 'Dit is niet oké', 'Even bijkomen', 'Mijn havermelk!', 'Ik ga een podcast maken'],
    achterhoek: ['Mot melken', 'Goodgoan!', "'t Is mooi geweest", 'Ik mot nog hooien', 'Naor huus'],
  },

  /** What a fresh unit shouts as it walks out. */
  battleCry: {
    havermelk: ['Let’s go!', 'Lekker bezig', 'Literally oorlog', 'Vamos!'],
    achterhoek: ["D'ran!", 'Pak an!', 'Laot maor kommen', 'Vort met de geit'],
  },
} as const;

export function nameOf(id: string): string {
  return NL.names[id] ?? id;
}
