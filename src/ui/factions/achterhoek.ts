import type { FactionText } from './types.ts';

/** The Achterhoek: farmers who talk Achterhoeks, from the pitchfork to the drone. */
export const achterhoek: FactionText = {
  name: 'Achterhoek',
  place: 'De Achterhoek',
  trait: 'taai en traag',
  money: 'landbouwsubsidie',
  win: { head: 'De Achterhoek wint!', sub: "D'ran! Tijd veur een pilsken." },
  unmoved: 'Ik zit niet online!',

  names: {
      'ah.1975.light': 'Klein Mepperink',
      'ah.1975.ranged': 'Smijtink',
      'ah.1975.heavy': 'Groot Ploegink',
      'ah.1975.shield': 'Deurink',
      'ah.1975.turret': 'Carbidbus',
      'ah.1975.special': 'Høken!',
      'ah.2025.light': 'Quadink',
      'ah.2025.ranged': 'Dronink',
      'ah.2025.heavy': 'Giertink',
      'ah.2025.shield': 'Balink',
      'ah.2025.turret': 'De Heitinks',
      'ah.2025.special': 'Trekkerkolonne',
      'ah.2050.light': 'Exo-Mepperink',
      'ah.2050.ranged': 'Verschrikkerink',
      'ah.2050.heavy': 'De Vreter',
      'ah.2050.super': 'Kolossink',
      'ah.2050.turret': 'Melkrobot',
      'ah.2050.special': 'Dronezwerm',
  },

  blurbs: {
      'ah.1975.light': 'Boerenknecht met riek en klompen. Snel en goedkoop.',
      'ah.1975.ranged': 'Smijt voederbieten die doorstuiteren: na de eerste kop raakt hij de volgende.',
      'ah.1975.heavy': 'Oude trekker met ploeg. Ploegt alles om wat in de weg staat.',
      'ah.1975.shield': 'Loopt achter een staldeur. Torens mikken op hem en raken alleen de deur.',
      'ah.1975.turret': 'Melkbus, carbid, vlammetje erbij: knal! Het deksel vliegt je om de oren.',
      'ah.1975.special': 'Boerenrock op de platte wagen: zeven tellen lang slaat en loopt alles harder.',
      'ah.2025.light': 'Snel, goedkoop, rijdt je zo van de sokken.',
      'ah.2025.ranged': 'Stuurt zijn spuitdrone eropaf.',
      'ah.2025.heavy': 'Megatrekker met giertank. Raakt alles wat in de weg staat.',
      'ah.2025.shield': 'Rolt een roze kuilbaal voor zich uit. Torens mikken erop en er komt niks doorheen.',
      'ah.2025.turret': 'Opa, moeke en de jongste. Overal tegen, en ze gooien met eieren.',
      'ah.2025.special': 'Een stoet trekkers dendert over de baan en raakt iedereen.',
      'ah.2050.light': 'Zelf gelast exoskelet van trekkeronderdelen. Mept voor tien.',
      'ah.2050.ranged': 'Vogelverschrikker met laserogen. Geen kraai die nog durft.',
      'ah.2050.heavy': 'Zelfrijdende combine die vreet wat hij raakt: 30% van de schade krijgt hij terug.',
      'ah.2050.super': 'Een kolos van silo en trekkerwielen. Zit niet online: speciale acties en torens doen hem niks.',
      'ah.2050.turret': 'Robotkoe in de melkstal. Spuit melk onder hoge druk.',
      'ah.2050.special': 'Tien drones duiken een voor een op de voorste vijand.',
  },

  slinkOff: {
    '1975': ['Mot melken', 'De koeien roepen', "'t Is etenstied", 'Ik mot nog hooien', 'Naor huus'],
    '2025': ['Mot melken', 'Goodgoan!', "'t Is mooi geweest", 'Ik mot nog hooien', 'Naor huus'],
    '2050': ['Accu leeg', 'Mot updaten', 'De melkrobot piept', 'Storing!', 'Naor huus'],
  },

  battleCry: {
    '1975': ["D'ran!", 'Pak an!', 'Høken!', 'Vort met de geit'],
    '2025': ["D'ran!", 'Pak an!', 'Laot maor kommen', 'Vort met de geit'],
    '2050': ["D'ran!", 'Vol gas!', 'Zet um op automatisch', 'Laot maor kommen'],
  },
};
