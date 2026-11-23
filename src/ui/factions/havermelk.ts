import type { FactionText } from './types.ts';

/** Amsterdam: hip-speak, from flower power to the algorithm. */
export const havermelk: FactionText = {
  name: 'Havermelkelite',
  place: 'Amsterdam',
  trait: 'snel en licht',
  money: 'cultuursubsidie',
  win: { head: 'De Havermelkelite wint!', sub: 'Super chill. Nog een flat white?' },
  unmoved: 'Gemute!',

  names: {
      'hm.1975.light': 'Kraker Sjors',
      'hm.1975.ranged': 'Bloemenkind Fleur',
      'hm.1975.heavy': 'Flowerpowerbusje',
      'hm.1975.shield': 'Matras-Marleen',
      'hm.1975.turret': 'De Kraakradio',
      'hm.1975.special': 'Love-in',
      'hm.2025.light': 'Padel-Pepijn',
      'hm.2025.ranged': 'Barista Bo',
      'hm.2025.heavy': 'Bakfiets-Babette',
      'hm.2025.shield': 'Sup-Sanne',
      'hm.2025.turret': 'Podcaststudio',
      'hm.2025.special': 'Wegblokkade',
      'hm.2050.light': 'VR-Vik',
      'hm.2050.ranged': 'Boba-Bibi',
      'hm.2050.heavy': 'Kweekvleesblob',
      'hm.2050.super': 'Havermelkreus',
      'hm.2050.turret': 'Livestream',
      'hm.2050.special': 'Het Algoritme',
  },

  blurbs: {
      'hm.1975.light': 'Hanenkam en koevoet. Snel, goedkoop en nergens bang voor.',
      'hm.1975.ranged': 'Gooit met bossen bloemen. Vredelievend, maar het doet wel zeer.',
      'hm.1975.heavy': 'Busje vol idealen. Rijdt overal dwars doorheen.',
      'hm.1975.shield': 'Verhuist het kraakpand in, matras voorop. Torens mikken op haar en raken alleen de vering.',
      'hm.1975.turret': 'Illegale zender op zolder. De herrie blaast iedereen van de baan.',
      'hm.1975.special': 'Iedereen houdt van elkaar: al je eenheden zijn op slag weer opgeknapt.',
      'hm.2025.light': 'Snel, goedkoop, slaat met zijn padelracket.',
      'hm.2025.ranged': 'Gooit haver-flat-whites van een afstand.',
      'hm.2025.heavy': 'Elektrische bakfiets. Ramt alles wat voor de bak komt.',
      'hm.2025.shield': 'Supt door de gracht, plank als schild. Torens mikken op haar en alles ketst af.',
      'hm.2025.turret': 'Twee hosts die overal over klagen. Daar word je vanzelf moe van.',
      'hm.2025.special': 'Activisten lijmen zich vast: de vijand staat vijf tellen stil.',
      'hm.2050.light': 'Ziet niks door die bril, maar slaat er vrolijk op los.',
      'hm.2050.ranged': 'Blaast tapiocaparels door haar rietje. Scherpschutter met bubbelthee.',
      'hm.2050.heavy': 'Ontsnapt uit het lab. Honderd procent diervrij, nul procent te stoppen.',
      'hm.2050.super': 'Een wandelend pak havermelk van drie verdiepingen. Heeft iedereen gemute: speciale acties en torens doen hem niks.',
      'hm.2050.turret': 'Een influencer gaat live. Duimpjes omlaag voor iedereen.',
      'hm.2050.special': 'Cancelt de sterkste vijand op de baan. Is er nog verontwaardiging over, dan is de volgende aan de beurt.',
  },

  slinkOff: {
    '1975': ['Peace, man', 'Dit is niet groovy', 'Terug naar de commune', 'Slechte vibes hier', 'No future!'],
    '2025': ['Ik heb zo brunch', 'Dit is niet oké', 'Even bijkomen', 'Mijn havermelk!', 'Ik ga een podcast maken'],
    '2050': ['Mijn accu is leeg', 'Ik ga offline', 'Dit staat niet in de app', 'Even resetten', 'Geen bereik hier'],
  },

  battleCry: {
    '1975': ['Flower power!', 'Maak liefde, geen oorlog', 'Kraken gaat door!', 'Far out!'],
    '2025': ['Let’s go!', 'Lekker bezig', 'Literally oorlog', 'Vamos!'],
    '2050': ['Loading…', 'Ik ga live!', 'Swipe ze weg', 'Level up!'],
  },
};
