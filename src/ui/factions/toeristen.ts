import type { FactionText } from './types.ts';

/**
 * De Toeristen: everyone's shared enemy, worse with every era. See
 * docs/factions.md, section 5. They speak English, French and German, and the
 * loud one shouts in capitals: the owner's decision of 24 November 2026.
 */
export const toeristen: FactionText = {
  name: 'De Toeristen',
  place: 'Overal vandaan',
  trait: 'snel en overal',
  money: 'wisselgeld',
  win: { head: 'De Toeristen winnen!', sub: 'Uw stad is volgeboekt.' },
  unmoved: 'Sorry, no Dutch!',

  names: {
    'tr.1975.light': 'Rugzak-Robin',
    'tr.1975.ranged': 'Flitsblokje-Fien',
    'tr.1975.heavy': 'De Touringcar',
    'tr.1975.shield': 'Plattegrond-Paula',
    // The brief's Ansichtkaartenmolen does not fit on its button.
    'tr.1975.turret': 'De Kaartenmolen',
    'tr.1975.special': 'De Dia-avond',
    'tr.2025.light': 'Rolkoffer-Rita',
    'tr.2025.ranged': 'Influencer-Ivy',
    'tr.2025.heavy': 'De Bierfiets',
    'tr.2025.shield': 'Paraplu-Pam',
    'tr.2025.turret': 'De Hype-rij',
    // The soft hyphen lets the special's button break it after Cruise-; elsewhere it is not seen.
    'tr.2025.special': 'Cruise\u00adschip legt aan',
    'tr.2025.summoned': 'De Dagjesmens',
    'tr.2025.scattered': 'De verdwaalde toerist',
    'tr.2050.light': 'De Robokoffer',
    'tr.2050.ranged': 'Eénster-Eli',
    'tr.2050.heavy': 'De Zweefbierfiets',
    'tr.2050.super': 'MS Kolossaal',
    'tr.2050.turret': 'De Sleutelkluizentoren',
    'tr.2050.special': 'Huurverhoging voor de locals',
  },

  blurbs: {
    'tr.1975.light': 'Blootsvoets, met rugzak en gitaar. Mept met zijn opgerolde slaapzak.',
    'tr.1975.ranged': 'Zonnehoed, camera om de nek. Flitst je blind en gooit het opgebrande blokje.',
    'tr.1975.heavy': 'Negen landen in zeven dagen. De gids hangt met zijn vaantje uit de deur.',
    'tr.1975.shield': 'Verdwaald achter een plattegrond. Torens schieten er gaten in, ze merkt niks.',
    'tr.1975.turret': 'Een draaiende ansichtkaartenmolen en de man die ervan verkoopt. Hij schiet kaarten.',
    'tr.1975.special': 'Vierhonderd vakantiedia’s: alle vijanden op de baan dommelen vijf tellen in.',
    'tr.2025.light': 'Sleept haar rolkoffer over de keien en zwaait hem rond als je in de weg staat.',
    'tr.2025.ranged': 'Gooit niks. Wie in haar shot staat, poseert en slaat maar half zo hard.',
    'tr.2025.heavy': 'Een feestje in dezelfde shirts trapt een bar vooruit. Met eigen inrijverbod.',
    'tr.2025.shield': 'Torens ketsen af op haar paraplu. Duur en traag; valt ze, dan dwaalt haar groep verder.',
    'tr.2025.turret': 'Drie mensen achter een koord en een rijmanager. Ze gooien friet en blijven in de rij.',
    'tr.2025.special': 'Acht snelle dagjesmensen rennen de baan op. Na twintig tellen toetert het schip.',
    'tr.2025.summoned': 'Twee uur aan wal, met pet en keycord van het schip. Sprint naar de kaaswinkel.',
    'tr.2025.scattered': 'Zonder paraplu de weg kwijt: kaart op zijn kop, telefoon op 2%. Loopt toch door.',
    'tr.2050.light': 'Zelfrijdende koffer zonder baasje, 30 km per uur over de stoep. Ramt je schenen.',
    'tr.2050.ranged': 'Slimme bril, streamt alles en geeft elke local één ster. Gooit ze als werpsterren.',
    'tr.2050.heavy': 'Zweeft: klappen gaan eronderdoor. Alleen gooien, torens en acties raken hem.',
    'tr.2050.super': 'Een cruiseschip op rupsbanden met een buffetkanon. Speciale acties en torens doen het niks.',
    'tr.2050.turret': 'Een toren sleutelkluisjes waar de buren woonden. De gasten gooien met kwijte sleutels.',
    'tr.2050.special': 'Tien tellen lang betaalt de vijand dubbel: eenheden, torens, subsidie en moderniseren.',
  },

  // They get dumber with every era, and then more entitled. Some units have lines of their own.
  slinkOff: {
    '1975': ['My film is full!', 'Danke schön!', 'Merci, au revoir !', 'The bus is leaving!', 'We thought it was a park!'],
    '2025': ['MY SUITCASE!', 'What time does the village close?', 'Ma valise !', 'One star!', 'The ship leaves at five!'],
    '2050': ['I WANT TO SPEAK TO THE MAYOR!', 'REFUND!', 'Kein Empfang!', 'Une étoile !', 'Your city is overrated.'],
    'tr.2025.summoned': ['THE SHIP!'],
    'tr.2025.scattered': ['Where is the group?', 'Wo ist die Gruppe?'],
  },

  battleCry: {
    '1975': ['Excuse me, where are the tulips?', 'Wie schön!', 'C’est charmant !', 'Could you take our picture, please?', 'Twelve minutes, then back on the bus!'],
    '2025': ['IS THIS AMSTERDAM?', 'Is this the bike lane?', 'Wo ist hier der Strand?', 'C’est gratuit ?', 'Do people actually LIVE here?', 'Is this Holland or the Netherlands?'],
    '2050': ['IS THIS STILL AMSTERDAM?', 'We booked your living room.', 'Wir haben Ihr Haus gebucht!', 'On a loué votre rue !', 'Move, you’re in my livestream.'],
    'tr.2025.ranged': ['Can you move? You’re in my shot.', 'Link in bio!', 'Smash that like!'],
    'tr.2025.shield': ['Follow the umbrella!', 'Stay together, group!'],
    'tr.2025.summoned': ['We have two hours!', 'Where is the cheese shop?'],
    'tr.2025.scattered': ['Where is the group?', 'Wo ist die Gruppe?', 'Is this Amsterdam?'],
    'tr.2050.heavy': ['WOOOO!', 'Noch ein Bier!', 'Is this the party street?'],
  },
};
