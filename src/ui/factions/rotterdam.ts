import type { FactionText } from './types.ts';

/**
 * Rotterdam: the port, sleeves rolled up, from the quay to the floating city
 * (docs/factions.md, section 4). The lines are the brief's; the rivalry lines
 * against Amsterdam are mine (26 November 2026).
 */
export const rotterdam: FactionText = {
  name: 'Rotterdam',
  place: 'De haven',
  trait: 'hard en direct',
  money: 'havengeld',
  win: { head: 'Rotterdam wint!', sub: 'Niet lullen maar poetsen.' },
  unmoved: 'Niet lullen!',

  names: {
    'rt.1975.light': 'Bootwerker Aad',
    'rt.1975.ranged': 'Sjaak de Sjouwer',
    'rt.1975.heavy': 'De Straddle Carrier',
    'rt.1975.shield': 'Lasser Leen',
    'rt.1975.turret': 'De Schaft',
    'rt.1975.special': 'Mouwen opstropen!',
    'rt.2025.light': 'Gabber Gerrie',
    'rt.2025.ranged': 'De Kapsalonkoerier',
    'rt.2025.heavy': 'De AGV',
    'rt.2025.shield': 'Bouwvakker Ben',
    'rt.2025.turret': 'De Kubuswoning',
    'rt.2025.special': 'De container',
    'rt.2050.light': 'De Poetsrobot',
    'rt.2050.ranged': 'Stapelaar Sjaan',
    'rt.2050.heavy': 'De Drijvende Wijk',
    'rt.2050.super': 'De Kraan',
    'rt.2050.turret': 'De Laatste Ploeg',
    'rt.2050.special': 'De kering sluit',
  },

  blurbs: {
    'rt.1975.light': 'Platte pet, mouwen opgestroopt, een kraanhaak. Deelt een Rotterdamse fooi uit.',
    'rt.1975.ranged': 'Draagt op elke schouder een baal en smijt ze er een voor een af.',
    'rt.1975.heavy': 'Hoog op zijn poten, met een container eronder. Lekt olie, maar hij werkt.',
    'rt.1975.shield': 'Torens raken alleen zijn staalplaat. Wie hem van dichtbij slaat, brandt zich aan de vonken.',
    'rt.1975.turret': 'Drie havenwerkers aan de schaft op een stapel kisten. Ze gooien met hun broodtrommels.',
    'rt.1975.special': 'Niet lullen maar poetsen: acht tellen lang is alles wat je traint meteen klaar.',
    'rt.2025.light': 'Hakt op 180 slagen per minuut. Hoe langer hij vecht, hoe sneller hij slaat.',
    'rt.2025.ranged': 'Smijt kapsalons. De knoflooksaus spat op iedereen rond wie hij raakt.',
    'rt.2025.heavy': 'Rijdt zichzelf, de chauffeur drinkt koffie. Verdient havengeld zolang hij op de weg staat.',
    'rt.2025.shield': 'Torens mikken op zijn bekisting. De stad is nooit af, dus hij is altijd onderweg.',
    'rt.2025.turret': 'Een scheve kubuswoning. Alles glijdt, dus de bewoners gooien de meubels naar buiten.',
    'rt.2025.special': 'Een zeecontainer valt op de voorste vijand. Vijf tellen lang komt niemand erlangs.',
    'rt.2050.light': 'Geleverd met de mouwen al opgerold. Praat niet, poetst: speciale acties doen hem niks.',
    'rt.2050.ranged': 'De laatste mens op de kade, in een tilharnas. Stapelt kistjes en smijt ze.',
    'rt.2050.heavy': 'Een lap drijvende wijk onder zeil, stadsstrand en al.',
    'rt.2050.super': 'Tilt de voorste vijand op en laat hem op de volgende vallen. Torens en acties doen hem niks.',
    'rt.2050.turret': 'De laatste ploeg van de haven, in de regelkamer. Ze gooien joysticks en koffiebekers.',
    'rt.2050.special': 'De stormvloedkering gaat dicht: acht tellen lang doet alles je eenheden maar half zoveel.',
  },

  slinkOff: {
    '1975': ['Ik ga kas.', 'Aftaaien!', 'Effe een bakkie pleur.', 'Opzouten!'],
    '2025': ['De bietenbrug op.', "'t Hoekie om.", 'Ik ga kas.', 'Aftaaien!'],
    '2050': ['Accu leeg. Aftaaien.', "'t Hoekie om.", 'Ik ga kas.', 'De bietenbrug op.'],
  },

  battleCry: {
    '1975': ['Niet lullen maar poetsen!', 'Hard voor weinig, maar nooit chagrijnig.', 'Grote muil, dikke lip!', 'Hebbie in je nest gezeken?'],
    '2025': ['Das gers!', "Da's kaassie.", 'Krotenkoker!', 'Pleuren!'],
    '2050': ['Ik praat niet, ik poets.', 'Mouwen zijn al opgerold.', 'Das gers!', 'Niet lullen maar poetsen!'],
  },

  rivals: {
    havermelk: ['Hier wordt het geld verdiend!', 'En daar wordt het uitgegeven.', 'Havermelk? Bakkie pleur!', '020? Nooit van gehoord.'],
  },
};
