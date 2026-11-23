import type { FactionText } from './types.ts';

/** De Gasten: two families on one street, from the factory floor to the wedding hall. See docs/factions.md, section 8. */
export const gasten: FactionText = {
  name: 'De Gasten',
  place: 'De straat',
  trait: 'met de hele familie',
  money: 'spaargeld',
  win: { head: 'De Gasten winnen!', sub: 'Blijf je eten?' },
  unmoved: 'Volgend jaar.',
  sniped: 'Nee!',

  names: {
    'gs.1975.light': 'De Nachtploeg',
    'gs.1975.ranged': 'De Tolk',
    'gs.1975.heavy': 'De Imperiaal',
    'gs.1975.shield': 'De Koffer',
    'gs.1975.turret': 'Het Pension',
    'gs.1975.special': 'Eerst thee',
    'gs.2025.light': 'De Gastvrouw',
    'gs.2025.ranged': 'De Dönerbaas',
    'gs.2025.heavy': 'De Fatbike',
    'gs.2025.shield': 'De Trouwfilmer',
    'gs.2025.turret': 'De Kapperszaak',
    'gs.2025.special': 'De Toeterstoet',
    'gs.2050.light': 'De Kapbot',
    'gs.2050.ranged': 'De Prijzenvader',
    'gs.2050.heavy': 'De Zweefimperiaal',
    'gs.2050.super': 'Mo-Tron',
    'gs.2050.turret': 'Het Theeterras',
    'gs.2050.special': 'Nee is nee',
  },

  blurbs: {
    'gs.1975.light': 'Net van de nachtdienst, kalender in zijn borstzak. Slaat met zijn moersleutel.',
    'gs.1975.ranged': 'Tien, vertaalt elke brief voor zijn vader. Gooit de bruine enveloppen terug.',
    'gs.1975.heavy': 'Een slee met een imperiaal twee keer zo hoog: koffers, een koelkast en een blauw bad.',
    'gs.1975.shield': 'Achter een koffer zo groot als een kast. Torens mikken erop en horen alleen “tok”.',
    'gs.1975.turret': 'Drie mannen in stapelbedden. De wekker voor de nachtdienst gaat, en vliegt.',
    'gs.1975.special': 'Eerst thee: elke eigen eenheid op de baan is weer helemaal heel.',
    'gs.2025.light': 'Schort voor, slipper in de hand. Niemand gaat hier met honger weg.',
    'gs.2025.ranged': 'Snijdt de hele dag van het spit. Gooit met pitabroodjes, met alles erop.',
    'gs.2025.heavy': 'Raast overal doorheen, recht op de basis af. Alleen een deur houdt hem tegen.',
    'gs.2025.shield': 'Filmt de bruiloft achter een lamp zo groot als een deur. Torens mikken op hem en ketsen af.',
    'gs.2025.turret': 'De kapper en twee mannen die voor het praatje komen. Ze gooien met hete handdoeken.',
    'gs.2025.special': 'Een toeterende bruiloftsstoet: de vijand blijft vijf tellen kijken en doet niks.',
    'gs.2050.light': 'Kapperrobot met vier armen, waarvan één om mee te praten. Zoemt en knipt.',
    'gs.2050.ranged': 'Vergelijkt nog steeds twintig reisbureaus. Gooit met de tickets die hij niet kocht.',
    'gs.2050.heavy': 'De zomerauto zweeft nu, het imperiaal is hoger dan ooit. Het blauwe bad gaat nog mee.',
    'gs.2050.super': 'Mo van de nachtploeg, nu een robot zo groot als een flat. Speciale acties en torens doen hem niks.',
    'gs.2050.turret': 'Drie generaties op een zwevend terras, elk met eigen thee. Ze schieten suikerklontjes.',
    'gs.2050.special': 'Eén blik, één “nee”: eerst voor de sterkste vijand, en wat over is voor de volgende.',
  },

  // By era, and for the fatbike kid his own: he is the only one who says these.
  slinkOff: {
    '1975': ['Volgend jaar terug.', 'De koffer staat klaar.', 'Mijn rug.', 'Even naar huis bellen.'],
    '2025': ['Neem wat mee voor onderweg.', 'Wie filmt dit?', 'Volgend jaar terug.', 'Knoflooksaus op.'],
    '2050': ['Volgend jaar.', 'Accu leeg.', 'Mijn notitieboekje!', 'Eerst thee.'],
    'gs.2025.heavy': ['Mijn band is lek.'],
  },

  battleCry: {
    '1975': ['Twee jaar, dan terug!', 'Nachtdienst!', 'Eerst thee.', 'Ik schrijf het op.'],
    '2025': ['Eet eerst wat!', 'Met alles?', 'Iedereen moet het zien!', 'Volgend jaar terug!'],
    '2050': ['Veertig minuten naar het zuiden!', 'Eerst de prijzen vergelijken.', 'Blijf je eten?', 'Volgend jaar terug!'],
    'gs.2025.heavy': ['Wat kijk je?', 'Ik rij maar vijfentwintig, echt!'],
  },
};
