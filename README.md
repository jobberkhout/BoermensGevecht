# Boermens Gevecht

A lane-battle game for two players on one keyboard or one phone, or one against the computer, in the browser. It started as the Achterhoek against
the havermelkelite of Amsterdam; De Zuidas, De Gasten, De Toeristen, De Elf Steden and Carnaval have joined, and more factions are planned. Each player picks a
faction, buys units that walk to the other side on their own, builds and upgrades turrets, applies for
more subsidie, uses a special move, and modernizes from the seventies to the future. Whoever wrecks the
other base wins.

All art is hand-written SVG in `art/`, animated as cut-out puppets. There are no image or sound files, apart
from the app icon for phones, which is rendered from `pages/icon.svg`.

## Play it

Download **`BoermensGevecht.html`** from this repository and double-click it. It opens in your browser and
that is all: one file, nothing to install, no internet needed. Any current browser will do; it is tested
in the engines of Chrome and Edge, Firefox, and Safari. Two players share one keyboard; the keys are on the
title screen, and so is the choice of factions: any two can play each other, the same one twice too.

**Alone?** On the title screen each side has a switch, Speler or Computer: press that side's special key
(S or K) or click it, and the computer plays that side. It buys a bit of everything, the way people do.

If you cloned the repository, the file is in its root: open it from there.

**On a phone or tablet** go to **https://jobberkhout.github.io/BoermensGevecht/** and hold the phone sideways. Tap
start and it goes fullscreen. On a phone the computer takes the right side to begin with; tap Computer to
make it a Speler, and two players share the screen, each with half of it. Against the computer only your own
buttons are shown, in one big row. In Chrome on Android, "Toevoegen aan startscherm" (or "App installeren") in
the menu puts it on the home screen: it then opens fullscreen and sideways, and once it has been opened it also
plays without internet. The site is the same single file, put online by `.github/workflows/pages.yml` on every
push to `main`.

## Status

| Part | State |
|---|---|
| Rules: units, three rows, turrets with levels, specials, subsidie, modernizing, overtime | Done, covered by tests |
| Seven factions, picked on the title screen: any pair, the same one twice too | Done |
| Three eras per faction: Jaren '70, Jaren '20, the future | Done: each has its own three units, turret, special and base |
| Title screen, HUD, keyboard and on-screen buttons, win screen, rematch | Done |
| Phones and tablets: touch layout, fullscreen, home screen, offline | Done. Tested in Chrome's Pixel emulation, not on a real phone yet. Two phones against each other is not possible |
| Playing alone: the computer takes either side | Done. Tuned against the other bots, not against people |
| Art pipeline, gallery, screenshots, three-browser check | Done |
| Sound | Done: synthesized effects and a tune, no audio files. Checked for errors and loudness by test, not judged by ear |
| Balance between factions | Not looked at yet. That waits until all factions are in |

**What comes next:** three more factions are planned. [`docs/factions.md`](docs/factions.md) is the
blueprint: who they are, every unit and special per era, and the list of drawings each one needs.

## The factions

| | Havermelkelite (Amsterdam) | Achterhoek | De Zuidas | De Gasten | De Toeristen | De Elf Steden (Fryslân) | Carnaval (Brabant and Limburg) |
|---|---|---|---|---|---|---|---|
| Jaren '70 | Kraker Sjors, Bloemenkind Fleur, Flowerpowerbusje, and the schild: Matras-Marleen. Turret: De Kraakradio. Special: Love-in (heals your units) | Klein Mepperink, Smijtink (bouncing beets, see below), Groot Ploegink, and the schild: Deurink. Turret: Carbidbus. Special: Høken! (your units hit harder and move faster) | De jongste bediende, De hoekman, De directiewagen, and the schild: De brandkast. Turret: De Sociëteit. Special: De gong (your units hit harder and move faster) | De Nachtploeg, De Tolk, De Imperiaal, and the schild: De Koffer. Turret: Het Pension. Special: Eerst thee (heals your units) | Rugzak-Robin, Flitsblokje-Fien, De Touringcar, and the schild: Plattegrond-Paula. Turret: De Kaartenmolen. Special: De Dia-avond (enemy units stand still) | De Fierljepper (vaults over the first enemy, see below), De Opslagger, De Kopgroep, and the schild: Baanveger Bauke. Turret: De Leugenbank. Special: De winter van '63 (enemy units freeze and stand still) | De Hosser, De Sousafonist, De Praalwagen, and the schild: De Grote Trom (booms, see below). Turret: De Pronkzitting. Special: De Polonaise (enemy units dance home, see below) |
| Jaren '20 | Padel-Pepijn (returns throws, see below), Barista Bo, Bakfiets-Babette, and the schild: Sup-Sanne. Turret: Podcaststudio. Special: Wegblokkade (enemy units stand still) | Quadink, Dronink, Giertink, and the schild: Balink. Turret: De Heitinks. Special: Trekkerkolonne (sweeps the lane) | Bodywarmer-Bas, Mr. Declarabel, De Leasebak, and the schild: De Disclaimer. Turret: De Vrijmibo. Special: Vijandige overname (buys the toughest enemy unit) | De Gastvrouw, De Dönerbaas, De Fatbike (rides through the ranks, see below), and the schild: De Trouwfilmer. Turret: De Kapperszaak. Special: De Toeterstoet (sweeps the lane) | Rolkoffer-Rita, Influencer-Ivy (poses the enemy, see below), De Bierfiets (tosses beers, see below), and the schild: Paraplu-Pam (scatters, see below). Turret: De Hype-rij. Special: Cruiseschip legt aan (eight day trippers for twenty seconds) | De Kluner (cannot brake, see below), Bakker Tjitske (sticky bread, see below), It Skûtsje, and the schild: Beppe's Koek-en-zopie (feeds her neighbours, see below). Turret: De Brugwachter. Special: De Bezemwagen (your last four beaten units come back) | Het Bananenpak (leaves his peel, see below), De Confettischutter, De Zuipwagen (drops the beat, see below), and the schild: De Verkeersregelaar. Turret: Het VIP-deck. Special: Elf Kanonschoten (enemy throws miss, see below) |
| The future | VR-Vik, Boba-Bibi, Kweekvleesblob, and the super unit: the Havermelkreus. Turret: Livestream. Special: Het Algoritme (cancels the two toughest enemies outright) | Exo-Mepperink, Verschrikkerink, De Vreter, and the super unit: Kolossink. Turret: Melkrobot. Special: Dronezwerm (ten strikes on the foremost enemy) | De Stagebot, De Cryptobro, De Vergaderpod, and the super unit: De Gouden Handdruk. Turret: De Kwartaalcijfers. Special: De Succesfee (for five seconds everything the enemy earns is paid to you) | De Kapbot, De Prijzenvader, De Zweefimperiaal, and the super unit: Mo-Tron. Turret: Het Theeterras. Special: De Familie-app (four hologram cousins join the fight, swatting and sending voice messages) | De Robokoffer, Eénster-Eli, De Zweefbierfiets (tosses beers, see below), and the super unit: MS Kolossaal. Turret: De Sleutelkluizentoren. Special: Huurverhoging voor de locals (for twenty seconds everything the enemy buys costs double) | De Zweefschaatser, It Kokoskanon, It Tikiskûtsje, and the super unit: De Grutte. Turret: De IJscommissie. Special: Tropenrooster (for fifteen seconds the enemy's turrets do not fire) | De Tijdslot-hosser, De Robo-tonprater, De Zelfrijdende Praalwagen, and the super unit: De Reuzenprins (takes over a turret, see below). Turret: De Laatste Raad van Elf. Special: De Kater (enemy units crawl) |

All factions start from the same numbers for the same role in the same era. On top of those each has its
own temperament, a small twist that is the same in every era and is shown next to its name on the title
card:

| Faction | Its units are | In numbers |
|---|---|---|
| Achterhoek | taai en traag: tough and slow | 15% more hit points, 10% slower on the road, a 20% longer pause between blows. What they throw lands 15% harder |
| Havermelkelite | snel en licht: quick and frail | 15% faster and 10 to 15% fewer hit points. Every unit but the Havermelkreus costs 10% less. They throw from 10% further away, 10% softer |
| De Gasten | met de hele familie: many hands, quickly there | Light units cost 15% less, are trained in 80% of the time and have 15% fewer hit points. Ranged units have 10% more hit points and a 10% longer pause between throws; heavies and the schild have 10% more hit points and are 5 to 10% slower. The fatbike has numbers of its own |
| De Toeristen | snel en overal: fast and everywhere | 25% faster, 15% softer blows, and every unit but MS Kolossaal costs 10% less. Paraplu-Pam and the two beer bikes have numbers of their own |
| De Zuidas | duur en gehaast: dear and in a hurry | Trained in 70% of the time and a 15% shorter pause between blows. Every unit costs 10% more, the Gouden Handdruk too. The ranged and heavy units hit 10% harder, the schild has 10% more hit points |
| De Elf Steden | koppig en bedaard: stubborn and unhurried | 10% more hit points, and 15% longer in training. Four units have rules of their own, below |
| Carnaval | uitbundig en wankel: in high spirits, and easily knocked over | 10% harder blows, 10% faster, 15% fewer hit points. Four units have rules of their own, below |

Bases, turrets, income and the price of modernizing are the same for everyone, and so are the super
units apart from their price. The tables are in `src/defs/<faction>.ts` and a test keeps every twist
within 30%. How the factions fare against each other in bot matches, and what is still uneven, is in
the Balance section of `docs/factions.md`.

## Working on it

```
npm install
npm run dev
```

Open the address it prints. `/gallery.html` on the same address shows every drawing with its animations.

`npm run build` makes the static site in `dist/` and rebuilds `BoermensGevecht.html`, the whole game folded
into one file. That file is committed on purpose, so the repository always holds a playable game; `npm test`
fails when it is older than the source, which means: build again and commit it.

## Controls

Keys are read by position on the keyboard, so the layout does not matter.

| Action | Left player | Right player |
|---|---|---|
| Unit 1 / 2 / 3 | Q / W / E | U / I / O |
| Fourth unit: the schild, or in the future the super unit | R | P |
| Turret: build, replace an old one, or upgrade | A | J |
| Special | S | K |
| Subsidie aanvragen | D | L |
| Moderniseren | F | ; |
| On the title screen: previous / next faction | A / D | J / L |
| On the title screen: Speler or Computer | S | K |
| Pause | Space | Space |
| Sound: everything, effects only, off | M | M |
| Start, play again | Enter | Enter |
| Back to the title screen, after a match or from pause | Esc | Esc |

Every action is also a button on screen, and so is pause. On a touch screen the keys are left off the buttons
and the buttons get bigger.

## How a match works

- Subsidie trickles in every second; beating an enemy unit pays a bounty.
- **Subsidie aanvragen** costs money now and raises the income for the rest of the match, in five steps
  from 12 to 62 a second.
- Units march in three rows, up to twenty a side. Nobody passes the enemy's foremost unit, so up to three
  fight side by side while ranged units shoot from behind. Within a row units queue up behind each other,
  with two exceptions: a unit that fights up close walks past its own ranged units once they stand still to
  throw, if it fits in front of them, and a unit stuck in its row steps into another row that has room for
  it.
- Light units are fast and cheap. Ranged units throw from a distance. Heavies are slow, tough, and hit
  everything within reach at once.
- **Turrets.** Each base has two slots, and one button does it all: it fills an empty slot, then upgrades
  the turret with the lowest level. There are three levels, and each makes it hit harder (100%, 150%, 200%)
  and reach 60 pixels further. Reach is one ladder through the eras: 300, 360 and 420 pixels of the 1280
  pixel lane in the Jaren '70, 420 to 540 in the Jaren '20, 540 to 660 in the future, so a turret of the
  next era never reaches less than a fully upgraded one of the era before. Only a fully upgraded turret of
  the future reaches past the middle. A dotted line across the road shows how far each side's turrets
  reach. A turret fires at the foremost enemy unit.
- **What a turret costs.** A turret of the next era costs exactly what it took to upgrade one all the way
  in the era before: 190, 494 and 1284 to build, and 494, 1284 and 3338 in all for a fully upgraded one.
- **The schild** is the answer to turrets, and the fourth unit of the first two eras: someone behind
  something big, such as a barn door or a mattress. Every enemy turret that can reach it fires at it
  instead, wherever it stands in the ranks, and it takes only a fifth of what they throw. For as long as
  it stands, the army around it is safe from turrets; two fully upgraded turrets need about a quarter of a
  minute to wear one down. Against units it is a pushover, so turrets alone no longer hold a base, and a
  schild alone does not take one.
- **Moderniseren** takes two things. First vooruitgang, which cannot be bought: it comes in slowly by
  itself and faster with every unit beaten or lost, and it fills the button. Once the button is full the
  step itself costs subsidie: 500 for the Jaren '20 and 1000 for the future, about two heavy units of the
  era you are in. So it is a choice: save up and modernize, or spend on the army you have. The next era
  brings new units, a new special and a much stronger base. A unit of the next era costs twice as much and
  is well over twice as strong.
- After modernizing, the old turrets keep firing but are a step behind. The turret button now replaces
  them one at a time with the new era's turret, back at level 1, and trades the old one in: half of what
  went into it comes off the price. A fully upgraded turret of the Jaren '70 makes the first one of the
  Jaren '20 half price.
- Specials recharge in 50 seconds, and every era has its own.
- **Vijandige overname**, the Zuidas special of the Jaren '20, buys the toughest enemy unit on the lane. It
  turns round where it stands and fights for the buyer with the hit points it has left, wearing a keycord.
  A super unit cannot be bought.
- **De Succesfee**, the Zuidas special of the future, is a fee in krijtstreep on a cloud (a "fee" is a
  fairy in Dutch, and a succesfee is what a consultant charges when things go well). For five seconds
  everything the enemy earns is paid to De Zuidas instead: the income that comes in every second, and what
  they get for the units they beat. So it pays most in the middle of a fight, and best of all just before
  an expensive unit of your own goes down: its bounty comes back to you. What the enemy already has stays
  theirs, and so does the vooruitgang they earn.
- **De Fatbike**, the heavy unit of De Gasten in the Jaren '20, is not a unit in the ranks but a rider.
  It costs 300, about two thirds of a heavy, and has 400 hit points, about 40% more than a light unit. It leaves the gate on its own, one at a
  time and outside the twenty-unit limit, and rides straight through the enemy ranks: every unit it passes
  takes a blow and hits it back once, and what it beats earns you the bounty. A schild stops it and both
  go down; a super unit stops it and walks on. Turrets fire at it before anything else, and enemy specials
  leave it alone. If it gets through, it rides into the enemy base. So it is for a thin lane without a
  schild on it.
- **De Familie-app**, the De Gasten special of the future: one message in the family group chat and four
  hologram cousins come out at your gate. They fight as light units of the era with 30% more hit points,
  and between two swats of the selfie stick each sends a voice message from a distance, the way the beer
  bikes toss beers. They cost nothing, earn the enemy nothing when beaten, and come even when your ranks
  are full.
- **De Toeristen** get more annoying with every era, and three of their units do something no other unit
  does:
  - **Influencer-Ivy** (ranged, Jaren '20) throws nothing. Every enemy unit within her reach is in her
    shot and poses: it hits half as hard for as long as it stands there. Two Ivys do not make it a
    quarter, turrets do not pose, and super units shrug her off.
  - **Paraplu-Pam** (the schild, Jaren '20) costs 360 instead of 240 and is slower than any other schild.
    When she falls, her group of four scatters where she stood: weak lost tourists who walk on, free,
    whatever the twenty-unit limit. If De Zuidas bought her, they follow the umbrella to De Zuidas.
  - **De Bierfiets** (heavy, Jaren '20) and **De Zweefbierfiets** (heavy, the future) are fast and dear:
    30% dearer than a heavy and 75% faster, with a heavy's hit points and blows. On top of that one of the
    party tosses a beer every second and a half at the foremost enemy within 80% of a thrower's reach,
    whether the bike is still riding up or already fighting. A beer does half again as much as a throw of
    their ranged unit.
  - **Cruiseschip legt aan**, their special of the Jaren '20: a cruise ship moors behind the base and eight
    day trippers run out of the gate, fast and weak. After twenty seconds the horn sounds and whoever is
    still ashore goes back on board, earning nobody anything.
  - **Huurverhoging voor de locals**, their special of the future: for twenty seconds everything the enemy
    buys costs double, from the next moment on. Whatever is already in their queue was paid for.
- **De Elf Steden** go from a hard winter (1975) through a wet one (2025) to a tropical Friesland (2050),
  and four of their units do something no other unit does:
  - **De Fierljepper** (light, Jaren '70) does not fight the first enemy unit he meets: he vaults over it
    with his pole, lands just behind its back and sits dazed in the snow for about a second. Then he fights
    on from where he landed, in the middle of the enemy ranks, facing whoever he went over, and everyone
    there hits him. Once a life.
  - **De Kluner** (light, Jaren '20) cannot brake. Until his first blow he goes 70% faster; that blow does
    three times the damage and shoves the unit he hits 70 pixels back. Then he sits on his backside for a
    second.
  - **Bakker Tjitske** (ranged, Jaren '20) throws sûkerbôle. Whoever is hit is glued with sugar and walks
    and fights at half pace for three seconds. Super units shrug it off.
  - **Beppe's Koek-en-zopie** (the schild, Jaren '20) serves soup: every second her own units within 160
    pixels get 3% of their hit points back. Not she herself, and not while she is stunned.
  - **De winter van '63**, their special of the Jaren '70: the road freezes over and enemy units slip on
    blue ice, unable to walk or fight for five seconds.
  - **De Bezemwagen**, their special of the Jaren '20: the broom wagon picks up the last four units of
    your own that were beaten, the most recent first, and they come back out of your gate, fresh. Super
    units and units a special called in are not picked up.
  - **Tropenrooster**, their special of the future: too hot to work. For fifteen seconds the enemy's
    turrets do not fire.
- **Carnaval** goes from the village carnival of the seventies through the party tent to a climate-controlled
  dome, and four of its units and all three of its specials do something nobody else does:
  - **De Grote Trom** (the schild, Jaren '70): every turret shot that bounces off the bass drum is one
    more boom, in time, and for a moment everyone of his own within 160 pixels, himself too, marches 30%
    faster. The more the turrets fire at him, the faster his band walks into them.
  - **Het Bananenpak** (light, Jaren '20) is lost in the wrong town. When he is beaten he leaves his peel on
    the road where he stood, and the first enemy unit that walks over it in that row slips and lies flat for
    a second and a half. A peel nobody steps on is gone after twenty seconds. Super units step over it.
  - **De Zuipwagen** (heavy, Jaren '20) drops the beat every five seconds: every enemy unit within 180
    pixels of its front stops fighting and parties for a second and a half. Super units keep their heads.
  - **De Reuzenprins** (the super unit, the future) gets the key of the city: once an enemy turret can
    reach him, he takes over the most upgraded one for twelve seconds, and it fires at its own side's units,
    the ones nearest its own gate first, for Carnaval. When the time is up or he is beaten the key goes
    back, and eight seconds later he can take one again. Because that is so strong, he does not shrug off
    turrets as other super units do: he still draws their fire, and takes all of it.
  - **De Polonaise**, their special of the Jaren '70: a conga line sweeps the lane, and every enemy unit it
    passes is pulled in and dances back towards its own base for four seconds, without fighting. It hurts
    nobody.
  - **Elf Kanonschoten**, their special of the Jaren '20: eleven confetti cannons fire into the faces of the
    enemy units on the lane, and for six seconds whatever they throw misses. Their blows up close still
    land, and turrets, up in their bases, still aim.
  - **De Kater**, their special of the future: the morning after. For eight seconds the enemy units on the
    lane crawl at 30% of their pace under clouds raining herring; they can still fight.
- **Padel-Pepijn** (Havermelkelite, Jaren '20) smashes an enemy unit's throw back down the lane instead of
  being hit by it, one every two seconds. A turret's shot is out of his reach. He costs 10% more for it.
- **De Kweekvleesblob** (Havermelkelite, the future) is lab meat and grows back: once nobody has hit it for
  three seconds, it gets 2% of its hit points back every second. In a fight it is an ordinary heavy. 10%
  dearer.
- **De Vreter** (Achterhoek, the future) eats what it hits: 30% of the damage its blows do comes back as
  hit points. 10% dearer.
- **Smijtink's voederbieten** (Achterhoek, Jaren '70) bounce: after the first head a beet goes on to the
  enemy unit behind, if that one stands within 140 pixels of the first one's back, for half the damage.
  Smijtink costs 20% more for it: 95.
- **The schild** hits for 8, a bit under half of a light unit's blow (it was 10).
- **The super unit.** In the future the fourth unit is one machine that is an army by itself. It costs
  3000 (De Zuidas pays 3300), takes twelve seconds to build, beats its own price in any mix of ordinary units, and enemy specials
  have no effect on it: it cannot be cancelled, glued down, run over, bought or picked out by drones. Like
  the schild it draws the fire of turrets and takes only a fifth of it (except De Reuzenprins, above). Its blow sweeps further than a
  heavy's: 120 pixels, so two small units deep in every row, and a stream of cheap units no longer holds it
  up. Six heavies still bring it down.
- **Overtime.** After ten minutes units hit 20% harder, and another 20% every ten seconds. Turrets go the
  other way: they lose 10% of their damage every ten seconds, starting at once, and fall silent at 11:30. The money keeps
  coming in, so there is always something to send. Should a match still be going at thirteen minutes, both
  bases start to crumble as well and the less damaged one outlasts the other.

## Where things are

```
art/<faction>/<era>/*.svg   the drawings; art/<faction>/backdrop.svg is its half of the scenery
src/defs/                   every number and every unit: balance.ts is the one file to tune,
                            <faction>.ts says which drawing is which unit
src/sim/                    the rules. No browser code, runs the same on both sides
src/rig/                    turns an SVG into a puppet
src/anim/                   animation data and building blocks; clips/<faction>/<era>/ has one file per drawing
src/render/                 draws the battle
src/audio/                  every sound, made with oscillators and noise
src/ui/                     HUD, screens, keys; nl.ts holds the shared text,
                            factions/<faction>.ts every word a faction says and is called
src/bots/                   scripted players, for tests and balance only
pages/                      what makes the website an app on a phone: manifest, service worker, icon
tests/  e2e/  scripts/      unit tests, browser tests, balance and screenshot tools
```

## Drawing a character

1. Add `art/<faction>/<era>/<name>.svg`. The file is a flat list of part groups:

   ```svg
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="-46 -136 104 142" data-rig="humanoid">
     <g id="hips" transform="translate(0 -38)"/>
     <g id="torso" data-parent="hips" transform="translate(0 -40)"> ...art around (0,0)... </g>
     <g id="head" data-parent="torso" transform="translate(1 -76)"> ... </g>
   </svg>
   ```

   - `(0,0)` of the file is where the feet touch the ground. The character faces right.
   - A part's `translate` is its joint: the part turns around that point, and its art is drawn around `(0,0)`.
   - `data-parent` says what a part hangs from. Document order is drawing order.
   - `data-rig` is `humanoid`, `vehicle`, `free` or `static`. The first two need a fixed set of parts
     (see `src/rig/archetypes.ts`). `free` is for a unit that is neither, such as the Kweekvleesblob;
     `static` is for bases, turrets, projectiles and effects.
   - A child with `data-mount="hand" fill="none"` marks a spot, such as where a projectile leaves.
     It is not drawn.
   - The right-hand side's drawings are mirrored on screen. A part with `data-mirror="no"` is flipped
     back, so lettering stays readable. Put its joint in the middle of the part. Letters are drawn as
     paths: `<text>` does not work in an SVG that is loaded as an image.
   - Colours and widths that differ from a class in the file's `<style>` go in `style="..."`.
     An attribute would be ignored, and the lint says so.
   - Not allowed: `text`, `image`, `filter`, `mask`, `foreignObject`, links to other files.

2. Add `src/anim/clips/<faction>/<era>/<name>.ts`, the same path as the drawing, with five clips (idle,
   walk, attack, hit, die) as its default export. It is picked up by itself. `havermelk/2025/barista_bo.ts`
   and `achterhoek/2025/giertink.ts` are the examples to copy from.

3. Look at it: open `/gallery.html?rig=<faction>/<era>/<name>`, or run
   `node scripts/shot.ts rig <faction>/<era>/<name>` for a picture in `screens/`.

`npm test` fails with a plain message if a file breaks these rules or an animation names a part that
does not exist.

## Checking and tuning

| Command | What it does |
|---|---|
| `npm test` | Rules, that no seat and no faction has other numbers than the rest, the lint over all art and animations, and that `BoermensGevecht.html` is up to date |
| `npm run e2e` | In Chromium, Firefox and WebKit: plays a match, picks factions, modernizes through all three eras, uses every special, checks every puppet against its drawing, measures that the sound is audible and never clips, and opens `BoermensGevecht.html` straight from disk to see that it plays |
| `npm run balance` | Bot tournament between Amsterdam and the Achterhoek: win share, match length, how many reach overtime, how far the sides modernize. `npm run balance -- zuidas achterhoek` for any two factions, `-- --pairs` for every pair in one table |
| `npm run shots -- battle` | Screenshots of the title and a staged battle through all three eras in `screens/`. `-- battle zuidas achterhoek` for any two factions |
| `npm run build` | Type check, static build in `dist/` ready for any static host, and the single file `BoermensGevecht.html` |

Adding `?test=1` to the game's address stops the clock; `window.__game` then steps the match by hand
(see `src/testhooks.ts`).

## Credits

- The Achterhoekse vlag was designed by Paul Heutinck (2018); it is redrawn here from the published design.
- The flag of Amsterdam is the city's historic flag, redrawn.
- The flag of De Zuidas is made up: the house flag of Krijtstreep & Zn., a firm that does not exist.
- The flag of De Gasten is made up: the flag of the street, a tea glass and a wedding ribbon on a tiled wall.
- The flag of De Toeristen is made up: a tour guide's pennant, yellow with a red umbrella.
- The flag of Carnaval is made up: red, yellow and green bands with a sousaphone on a blue badge.
- Everything else is original to this project.
