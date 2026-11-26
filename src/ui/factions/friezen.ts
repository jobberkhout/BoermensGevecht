import type { FactionText } from './types.ts';

/**
 * De Elf Steden: the Frisians, from a hard winter to a tropical Friesland.
 * The owner named them after the eleven cities of the tour (26 November 2026).
 * The Frisian lines are as the brief has them; the owner decided against
 * proofreading by a native speaker.
 */
export const friezen: FactionText = {
  name: 'De Elf Steden',
  place: 'Fryslân',
  trait: 'koppig en bedaard',
  money: 'melkgeld',
  win: { head: 'De Elf Steden winnen!', sub: 'It giet oan! Fryslân boppe!' },
  unmoved: 'Bûter, brea en griene tsiis!',

  names: {
    'fr.1975.light': 'De Fierljepper',
    'fr.1975.ranged': 'De Opslagger',
    'fr.1975.heavy': 'De Kopgroep',
    'fr.1975.shield': 'Baanveger Bauke',
    'fr.1975.turret': 'De Leugenbank',
    'fr.1975.special': "De winter van '63",
    'fr.2025.light': 'De Kluner',
    'fr.2025.ranged': 'Bakker Tjitske',
    'fr.2025.heavy': 'It Skûtsje',
    'fr.2025.shield': "Beppe's Koek-en-zopie",
    'fr.2025.turret': 'De Brugwachter',
    'fr.2025.special': 'De Bezemwagen',
    'fr.2050.light': 'De Zweefschaatser',
    'fr.2050.ranged': 'It Kokoskanon',
    'fr.2050.heavy': 'It Tikiskûtsje',
    'fr.2050.super': 'De Grutte',
    'fr.2050.turret': 'De IJscommissie',
    'fr.2050.special': 'Tropenrooster',
  },

  blurbs: {
    'fr.1975.light': 'Springt met zijn polsstok over de eerste vijand heen, landt op zijn kont en vecht daar verder.',
    'fr.1975.ranged': 'Kaatser in het wit, met een winterjas erover. Slaat keiharde balletjes op.',
    'fr.1975.heavy': 'Vier toerschaatsers, handen op de rug, sjaals wapperend. Ze schaatsen gewoon over de weg.',
    'fr.1975.shield': 'Duwt een houten sneeuwschuif voor zich uit. Torens mikken op hem en raken alleen de schuif.',
    'fr.1975.turret': "Drie oude baasjes die alle drie in '63 hebben uitgereden. Ze schieten met dúmkes.",
    'fr.1975.special': "Pake vertelt over '63 en de weg bevriest: vijf tellen glijdt de vijand uit en staat stil.",
    'fr.2025.light': 'Kan niet remmen. Knalt op de eerste vijand, duwt hem terug en zit dan even op zijn kont.',
    'fr.2025.ranged': 'Gooit sûkerbôle. Wie geraakt wordt, plakt: drie tellen loopt en slaat hij op halve snelheid.',
    'fr.2025.heavy': 'Een wedstrijdskûtsje op een bootkar. Het zwaard klapt neer op alles voor de boeg.',
    'fr.2025.shield': 'Torens mikken op haar kraam en raken de soep. Wie naast haar staat, knapt elke tel wat op.',
    'fr.2025.turret': 'De brugwachter haalt tol op met het klompje aan een hengel. Twee vissers kijken toe.',
    'fr.2025.special': 'De bezemwagen raapt de uitvallers op: je vier laatst verslagen eenheden komen terug.',
    'fr.2050.light': 'Zweefschaatsen en een Hawaïhemd. Heeft nog nooit een bevroren sloot gezien.',
    'fr.2050.ranged': 'Kaatsveteraan met een balmachine die kokosnoten opslaat. Hij vertrouwt het ding niet.',
    'fr.2050.heavy': 'Zwevend partyskûtsje met een palmboom als mast. De bemanning houdt de cocktails droog.',
    'fr.2050.super': 'Reus met een zwaard die iedereen het wachtwoord vraagt. Torens en speciale acties doen hem niks.',
    'fr.2050.turret': 'Meten het laatste ijsblokje: een millimeter te dun. Ze gooien met ijsklontjes.',
    'fr.2050.special': 'Te warm om te werken: vijftien tellen lang schieten de torens van de vijand niet.',
  },

  slinkOff: {
    '1975': ['Hawar.', 'It kin net oars.', 'Oant sjen!', 'It giet net oan.', 'Myn teannen binne beferzen.', 'Wachtsje mar op it iis.'],
    '2025': ['It giet net oan.', 'Hawar.', 'Blinder!', 'Oant sjen!', 'Wer net.', 'Natte sokken.'],
    '2050': ['Veertien komma negen centimeter.', 'Hawar.', 'It kin net oars.', 'Oant sjen!', 'Te waarm.', 'Wer gjin iis.'],
    'fr.1975.light': ['Plons.', 'Yn de sleat.', 'Hawar.', 'Wa hat myn stôk?'],
    'fr.2025.light': ['Ik koe net remje.', 'Hawar.', 'Stimpelkaart kwyt.'],
  },

  battleCry: {
    '1975': ['Fryslân boppe!', 'Bûter, brea en griene tsiis!', 'Flean op!', 'Tuike tuike!', 'Kâld, hè?', 'Wannear giet it oan?'],
    '2025': ['It giet oan!', 'It sil heve!', 'Tsjoch!', 'Fryslân boppe!', 'Noch net!', 'Hâld de moed der yn!'],
    '2050': ['It giet oan!', 'Flean op!', 'Tsjoch!', 'Suvel op suvel dat bringt de duvel.', 'Aloha, Fryslân!', 'Lekker waarm!'],
    'fr.1975.light': ['Ik spring der oer!', 'Flean op!', 'Hup, oer de sleat!'],
    'fr.2025.light': ['Rem! Rem!', 'Ik kin net remje!', 'Oan de kant!'],
  },
};
