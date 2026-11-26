import type { FactionText } from './types.ts';

/**
 * Carnaval: Brabant and Limburg in full swing, mixed on purpose (the owner,
 * 22 November 2026: to the rest of the country it is all the same carnival,
 * and that they mind is the joke). The lines are the brief's; Het Bananenpak's
 * own lines are mine. Some names carry a soft hyphen, where a button may break
 * them on a phone.
 */
export const carnaval: FactionText = {
  name: 'Carnaval',
  place: 'Hossegat',
  trait: 'uitbundig en wankel',
  money: 'consumptiemunten',
  win: { head: 'Carnaval wint!', sub: 'Alaaf! En nou allemaal de polonaise.' },
  unmoved: 'Agge mar leut et!',

  names: {
    'cv.1975.light': 'De Hosser',
    'cv.1975.ranged': 'De Sousafonist',
    'cv.1975.heavy': 'De Praalwagen',
    'cv.1975.shield': 'De Grote Trom',
    'cv.1975.turret': 'De Pronkzitting',
    'cv.1975.special': 'De Polonaise',
    'cv.2025.light': 'Het Bananenpak',
    'cv.2025.ranged': 'De Confetti­schutter',
    'cv.2025.heavy': 'De Zuipwagen',
    'cv.2025.shield': 'De Verkeers­regelaar',
    'cv.2025.turret': 'Het VIP-deck',
    'cv.2025.special': 'Elf Kanonschoten',
    'cv.2050.light': 'De Tijdslot-hosser',
    'cv.2050.ranged': 'De Robo-tonprater',
    'cv.2050.heavy': 'De Zelfrijdende Praalwagen',
    'cv.2050.super': 'De Reuzenprins',
    'cv.2050.turret': 'De Laatste Raad van Elf',
    'cv.2050.special': 'De Kater',
  },

  blurbs: {
    'cv.1975.light': 'Kiel, rode zakdoek, bierviltjes als medailles. Host met de buik vooruit de vijand in.',
    'cv.1975.ranged': 'Blaast hoempa en confetti uit de beker van zijn sousafoon.',
    'cv.1975.heavy': 'Trekker met een narrenkop van papier-maché, die op alles knikt wat voor de wagen staat.',
    'cv.1975.shield': 'Torens mikken op zijn trom. Elk schot is een boem, en de kapel om hem heen loopt sneller.',
    'cv.1975.turret': 'Een tonprater in zijn ton tussen twee raadsleden. Ze gooien met bierviltjes.',
    'cv.1975.special': 'De polonaise trekt over de baan. Wie ze passeert, danst vier tellen mee naar huis.',
    'cv.2025.light': 'Verdwaald, van boven de rivieren. Valt hij, dan glijdt de eerste vijand over zijn schil.',
    'cv.2025.ranged': 'Embleemjas, skibril, confettikanon onder de arm. Schiet confetti met een serpentine.',
    'cv.2025.heavy': 'Speakerbox achter een enorme trekker. Bij elke drop stopt de vijand om hem heen met vechten.',
    'cv.2025.shield': 'Vrijwilliger met dranghek en online cursus. Torens mikken op hem en raken alleen het hek.',
    'cv.2025.turret': 'Twee gasten met polsbandjes en een uitsmijter. Ze gooien met consumptiemuntjes.',
    'cv.2025.special': 'Elf confettikanonnen in hun gezicht: zes tellen lang mist alles wat de vijand gooit.',
    'cv.2050.light': 'Slimme kiel met lichtgevende emblemen en een polsbandje. Alcoholvrij bier aan een ketting.',
    'cv.2050.ranged': 'Grappenrobot in een ton. Vuurt slechte woordgrappen af, met een ba-dum-tss erin.',
    'cv.2050.heavy': 'Elektrische praalwagen zonder chauffeur, in hekken en airbags, met een hydraulische nar.',
    'cv.2050.super': 'Speciale acties doen hem niks, torens wel. Met de sleutel van de stad neemt hij er een over.',
    'cv.2050.turret': 'Drie stokoude raadsleden op scootmobielen en een hologramprins. Ze gooien met medailles.',
    'cv.2050.special': 'De kater: acht tellen lang kruipt de vijand onder een regen van haring. Vechten kan nog.',
  },

  slinkOff: {
    '1975': ['Houdoe!', 'Zund!', 'Dat is Limburgs!', 'Doen we hier niet.'],
    '2025': ['Houdoe!', 'Zund!', 'De tent is vol.', 'Dat is Brabants!'],
    '2050': ['Houdoe!', 'Accu leeg. Zund!', 'Hieringe biete.', 'Zoepe is zoepe.'],
    'cv.2025.light': ['Verkeerde stad.', 'Pas op, mijn schil!', 'Ik ga terug naar boven de rivieren.', 'Houdoe… zeggen ze dat hier?'],
  },

  battleCry: {
    '1975': ['Alaaf!', "D'n Elfde van d'n Elfde!", 'Vastelaovend!', 'Wa trekte aon?'],
    '2025': ['Alaaf!', 'Salaai!', 'Koekwaus!', 'Bovensloter!'],
    '2050': ['Alaaf!', 'Sjoenkelen!', 'Agge mar leut et!', 'Tijdslot elf uur elf!'],
    'cv.2025.light': ['Alaaf! …toch?', 'Waar is de tent?', 'Is dit Brabant of Limburg?', 'Ik loop gewoon de polonaise achterna!'],
  },
};
