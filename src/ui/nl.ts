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
    'hm.1975.light': 'Kraker Sjors',
    'hm.1975.ranged': 'Bloemenkind Fleur',
    'hm.1975.heavy': 'Flowerpowerbusje',
    'hm.1975.turret': 'De Kraakradio',
    'hm.1975.special': 'Love-in',
    'hm.2025.light': 'Padel-Pepijn',
    'hm.2025.ranged': 'Barista Bo',
    'hm.2025.heavy': 'Bakfiets-Babette',
    'hm.2025.turret': 'Podcaststudio',
    'hm.2025.special': 'Wegblokkade',
    'hm.2050.light': 'VR-Vik',
    'hm.2050.ranged': 'Boba-Bibi',
    'hm.2050.heavy': 'Kweekvleesblob',
    'hm.2050.super': 'Havermelkreus',
    'hm.2050.turret': 'Livestream',
    'hm.2050.special': 'Het Algoritme',
    'ah.1975.light': 'Klein Mepperink',
    'ah.1975.ranged': 'Smijtink',
    'ah.1975.heavy': 'Groot Ploegink',
    'ah.1975.turret': 'Carbidbus',
    'ah.1975.special': 'Høken!',
    'ah.2025.light': 'Quadink',
    'ah.2025.ranged': 'Dronink',
    'ah.2025.heavy': 'Giertink',
    'ah.2025.turret': 'De Heitinks',
    'ah.2025.special': 'Trekkerkolonne',
    'ah.2050.light': 'Exo-Mepperink',
    'ah.2050.ranged': 'Verschrikkerink',
    'ah.2050.heavy': 'De Vreter',
    'ah.2050.super': 'Kolossink',
    'ah.2050.turret': 'Melkrobot',
    'ah.2050.special': 'Dronezwerm',
  } as Record<string, string>,

  /** One line under the name on the how-to-play card. */
  blurbs: {
    'hm.1975.light': 'Hanenkam en koevoet. Snel, goedkoop en nergens bang voor.',
    'hm.1975.ranged': 'Gooit met bossen bloemen. Vredelievend, maar het doet wel zeer.',
    'hm.1975.heavy': 'Busje vol idealen. Rijdt overal dwars doorheen.',
    'hm.1975.turret': 'Illegale zender op zolder. De herrie blaast iedereen van de baan.',
    'hm.1975.special': 'Iedereen houdt van elkaar: al je eenheden zijn op slag weer opgeknapt.',
    'hm.2025.light': 'Snel, goedkoop, slaat met zijn padelracket.',
    'hm.2025.ranged': 'Gooit haver-flat-whites van een afstand.',
    'hm.2025.heavy': 'Elektrische bakfiets. Ramt alles wat voor de bak komt.',
    'hm.2025.turret': 'Twee hosts die overal over klagen. Daar word je vanzelf moe van.',
    'hm.2025.special': 'Activisten lijmen zich vast: de vijand staat vijf tellen stil.',
    'hm.2050.light': 'Ziet niks door die bril, maar slaat er vrolijk op los.',
    'hm.2050.ranged': 'Blaast tapiocaparels door haar rietje. Scherpschutter met bubbelthee.',
    'hm.2050.heavy': 'Ontsnapt uit het lab. Honderd procent diervrij, nul procent te stoppen.',
    'hm.2050.super': 'Een wandelend pak havermelk van drie verdiepingen. Heeft iedereen gemute: speciale acties doen hem niks.',
    'hm.2050.turret': 'Een influencer gaat live. Duimpjes omlaag voor iedereen.',
    'hm.2050.special': 'Cancelt de sterkste vijand op de baan. Is er nog verontwaardiging over, dan is de volgende aan de beurt.',
    'ah.1975.light': 'Boerenknecht met riek en klompen. Snel en goedkoop.',
    'ah.1975.ranged': 'Smijt met voederbieten. Raak is raak.',
    'ah.1975.heavy': 'Oude trekker met ploeg. Ploegt alles om wat in de weg staat.',
    'ah.1975.turret': 'Melkbus, carbid, vlammetje erbij: knal! Het deksel vliegt je om de oren.',
    'ah.1975.special': 'Boerenrock op de platte wagen: zeven tellen lang slaat en loopt alles harder.',
    'ah.2025.light': 'Snel, goedkoop, rijdt je zo van de sokken.',
    'ah.2025.ranged': 'Stuurt zijn spuitdrone eropaf.',
    'ah.2025.heavy': 'Megatrekker met giertank. Raakt alles wat in de weg staat.',
    'ah.2025.turret': 'Opa, moeke en de jongste. Overal tegen, en ze gooien met eieren.',
    'ah.2025.special': 'Een stoet trekkers dendert over de baan en raakt iedereen.',
    'ah.2050.light': 'Zelf gelast exoskelet van trekkeronderdelen. Mept voor tien.',
    'ah.2050.ranged': 'Vogelverschrikker met laserogen. Geen kraai die nog durft.',
    'ah.2050.heavy': 'Zelfrijdende combine. Vreet alles op wat voor de haspel komt.',
    'ah.2050.super': 'Een kolos van silo en trekkerwielen. Zit niet online, dus niet te cancelen: speciale acties doen hem niks.',
    'ah.2050.turret': 'Robotkoe in de melkstal. Spuit melk onder hoge druk.',
    'ah.2050.special': 'Tien drones duiken een voor een op de voorste vijand.',
  } as Record<string, string>,

  era: {
    'hm.1975': "Jaren '70",
    'ah.1975': "Jaren '70",
    'hm.2025': "Jaren '20",
    'ah.2025': "Jaren '20",
    'hm.2050': 'De toekomst',
    'ah.2050': 'De toekomst',
  } as Record<string, string>,

  hud: {
    special: 'Speciaal',
    eraUp: 'Moderniseren',
    subsidy: 'Subsidie',
    perSecond: '/s',
    subsidyMax: 'meer zit er niet in',
    /** Under the turret's name: what the button will do. */
    turretHow: { build: 'bouwen', replace: 'oude vervangen', upgrade: 'verbeteren' },
    turretMax: 'beter wordt het niet',
    paused: 'Pauze',
    resume: 'Spatie om verder te gaan',
    overtime: 'Overtijd! Beide bases brokkelen af',
  },

  /** What floats over the field when something happens. */
  shout: {
    subsidy: 'Subsidie toegekend!',
    upgraded: 'Verbeterd!',
    cancelled: 'Gecanceld!',
    healed: 'Opgeknapt!',
    modern: 'Gemoderniseerd:',
    /** What a super unit says when an enemy special passes it by. */
    unmoved: { havermelk: 'Gemute!', achterhoek: 'Ik zit niet online!' } as Record<string, string>,
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
    lastEra: 'Moderner bestaat niet',
  },

  start: {
    go: 'Druk op Enter om te beginnen',
    left: 'Linker speler',
    right: 'Rechter speler',
    pause: 'Spatie = pauze, M = muziek of geluid uit',
    goal: 'Sloop de basis van de ander. Wie in de overtijd de minste schade heeft, wint.',
    /** The two rows on the title card that are the same for every era. */
    subsidy: { name: 'Subsidie aanvragen', blurb: 'Kost nu geld, levert daarna elke tel meer op.' },
    eraUp: {
      name: 'Moderniseren',
      blurb: 'Vooruitgang verdien je met vechten. Is de balk vol: nieuwe eenheden, een sterkere basis en een nieuwe truc. In de toekomst wacht een vierde eenheid.',
    },
    eras: "Drie tijdperken: Jaren '70, Jaren '20 en de toekomst.",
  },

  win: {
    havermelk: { head: 'De Havermelkelite wint!', sub: 'Super chill. Nog een flat white?' },
    achterhoek: { head: 'De Achterhoek wint!', sub: "D'ran! Tijd veur een pilsken." },
    draw: { head: 'Gelijkspel', sub: 'Niemand wint, iedereen moe.' },
    again: 'Enter = nog een keer',
  },

  /** What a beaten unit mutters while it slinks off, by the era it comes from. */
  slinkOff: {
    havermelk: {
      '1975': ['Peace, man', 'Dit is niet groovy', 'Terug naar de commune', 'Slechte vibes hier', 'No future!'],
      '2025': ['Ik heb zo brunch', 'Dit is niet oké', 'Even bijkomen', 'Mijn havermelk!', 'Ik ga een podcast maken'],
      '2050': ['Mijn accu is leeg', 'Ik ga offline', 'Dit staat niet in de app', 'Even resetten', 'Geen bereik hier'],
    },
    achterhoek: {
      '1975': ['Mot melken', 'De koeien roepen', "'t Is etenstied", 'Ik mot nog hooien', 'Naor huus'],
      '2025': ['Mot melken', 'Goodgoan!', "'t Is mooi geweest", 'Ik mot nog hooien', 'Naor huus'],
      '2050': ['Accu leeg', 'Mot updaten', 'De melkrobot piept', 'Storing!', 'Naor huus'],
    },
  } as Record<string, Record<string, readonly string[]>>,

  /** What a fresh unit shouts as it walks out. */
  battleCry: {
    havermelk: {
      '1975': ['Flower power!', 'Maak liefde, geen oorlog', 'Kraken gaat door!', 'Far out!'],
      '2025': ['Let’s go!', 'Lekker bezig', 'Literally oorlog', 'Vamos!'],
      '2050': ['Loading…', 'Ik ga live!', 'Swipe ze weg', 'Level up!'],
    },
    achterhoek: {
      '1975': ["D'ran!", 'Pak an!', 'Høken!', 'Vort met de geit'],
      '2025': ["D'ran!", 'Pak an!', 'Laot maor kommen', 'Vort met de geit'],
      '2050': ["D'ran!", 'Vol gas!', 'Zet um op automatisch', 'Laot maor kommen'],
    },
  } as Record<string, Record<string, readonly string[]>>,
} as const;

export function nameOf(id: string): string {
  return NL.names[id] ?? id;
}

/** The lines of one kind (slinkOff, battleCry) for a unit, going by the era in its id ('hm.1975.light'). */
export function linesFor(kind: 'slinkOff' | 'battleCry', faction: string, unitId: string): readonly string[] {
  const era = unitId.split('.')[1] ?? '';
  return NL[kind][faction]?.[era] ?? [];
}
