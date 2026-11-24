# Adding a faction, start to finish

This is written for someone who has never seen this project, human or agent, and is asked to add one
faction. Follow it from top to bottom and you end with a pull request that contains a complete, playable
faction. Nothing in it assumes you were there when the game was built.

## For the owner: what to give an agent

Paste this as the whole task, with the name of the faction you want. It must be one of the sections in
`docs/factions.md`. The document does the rest.

> Add the faction Carnaval to this repository. Read `docs/new-faction.md` first and follow it to the
> letter; the brief is the section "2. Carnaval" in `docs/factions.md`. Work on a branch, open a pull
> request when everything under "Done means" holds, and do not merge it.

One faction per task. A faction is 29 drawings with animations, which is a full day of work for an agent.

## The project in two minutes

Boermens Gevecht is a lane-battle game for two players on one keyboard, in the browser: two bases, one
road, units that walk at each other on their own. It is Dutch satire in small jokes. The README has the
rules and the controls; read it once.

What matters for this job:

- **A faction brings looks, words, three specials and a temperament.** Price, hit points, damage and
  speed belong to the role (light, ranged, heavy, schild, super unit) and the era (1975, 2025, 2050), and
  are the same for every faction. They live in `src/defs/balance.ts`. Do not change those, apart from
  the numbers of a new special (see "A special of a kind that does not exist yet"). What a faction does
  bring is a small twist on them that makes its units feel like its own: its temperament, a table in its
  own sheet (see Step 1).
- **The owner wants the factions to play differently, not only look different.** On 23 November 2026:
  "later factions should have some more variation in what the units do." A temperament is the least a
  new faction brings. If its brief gives a unit something of its own to do, build it; if it does not,
  propose one in the pull request without building it. The ideas and the rules for them are in
  `docs/factions.md` under "How the factions play differently".
- **All art is SVG written by hand**, one file per drawing, cut into parts that the game animates like a
  paper puppet. There are no image files, no sound files and no art tools: you write the SVG as text,
  look at a screenshot of it, and improve it.
- **The game checks itself.** `npm test` lints every drawing and animation and says in plain words what
  is missing or wrong. `npm run e2e` plays matches in three browser engines. You are done when those are
  green and you have looked at your work in staged battles; see "Done means".
- **The owner decides what gets merged.** You work on a branch and open a pull request. You never merge,
  never push to `main`, never rewrite history and never change the git name or e-mail.

Stack: TypeScript 7, Vite 8, Vitest, Playwright, Node 26. Scripts are run as `node scripts/x.ts`. The
shell is zsh.

## Rules for what goes into the game

These were agreed with the owner and are not up for reinterpretation.

- **Types, never real people.** No politicians, no parties, no celebrities, no historical persons by name
  or by face.
- **No real brands or logos.** A parody name is fine ("Jan Deere"). No real clubs, firms or products.
- **No jokes about where someone comes from.** The regions may be teased the way they tease
  themselves. A faction about people's background carries only the jokes that community makes about
  itself, told with affection; its brief names the inside source of each one, and nothing goes in that
  the brief does not source or mark as the owner's decision. That goes for the lines and the details in
  the drawings as well.
- **Nothing about real tragedies or scandals** in which people were hurt.
- **No lettering in drawings.** The right-hand player's drawings are mirrored, so words would read
  backwards. Use symbols. If a word cannot be avoided, draw the letters as paths inside a part with
  `data-mirror="no"`, which the game flips back.
- **Small jokes.** A detail in a drawing, a line a unit mutters, a name. Nobody is lectured.
- **Original work.** The game is in the genre of the old Flash lane battlers; it copies none of them. Do
  not imitate the look, the characters or the names of any existing game.
- **The owner's name, e-mail and project details stay out of requests to outside services.**

The section of your faction in `docs/factions.md` has its own "Stay away from" list. It applies as well.

## Before you start

1. `npm install`, and `npx playwright install` if the browsers are not there yet.
2. Run `npm test` and `npm run e2e` before changing anything, so you know what was green.
3. Read, in this order:
   - `README.md`: the rules of the game, and the section "Drawing a character".
   - Your faction's section in `docs/factions.md`. **It is the brief.** The file names in its tables are
     final, and so are the names, the jokes and the lines unless the owner says otherwise. If it has open
     questions, take the option it leans towards and list your choices in the pull request.
   - `src/defs/zuidas.ts` and `src/ui/factions/zuidas.ts`: the two sheets a faction consists of, and the
     model for yours.
   - `src/rig/archetypes.ts` and `src/anim/types.ts`: what a rig and an animation are.
   - `src/anim/humanoid.ts` and `src/anim/vehicle.ts`: the building blocks animations are made from.
4. Look at what exists, so you know the style you have to match:
   `node scripts/shot.ts gallery havermelk/2025` writes `screens/chromium/gallery-havermelk-2025.png`, a
   contact sheet of one faction in one era. Do that for a few. Then open two or three SVG files of units
   next to their animation files, for example `art/havermelk/2025/barista_bo.svg` with
   `src/anim/clips/havermelk/2025/barista_bo.ts`, and `art/achterhoek/2025/giertink.svg` with its clips.

## Step 1: put the faction on the list

After this step the game knows the faction and the tests tell you everything that is still missing.

1. **Its id.** In `src/defs/types.ts` add the code name from the brief to the `FactionId` type.
2. **Its data sheet**, `src/defs/<faction>.ts`. Copy `src/defs/zuidas.ts` and change:
   - `id`, `flagRig` (`flags/<name>`), `backdropRig` (`<faction>/backdrop`).
   - `voice`: how it sounds when a unit walks out and a turret fires. Pick `'town'`, `'country'` or
     `'office'`, or add one (see Step 4).
   - `colors`: `main`, `dark` and `light`. They colour the keycord of bought units, the marker that shows
     how far its turrets reach, and the stand-in boxes while art is missing.
   - Three `makeEra('<prefix>', '<faction>', { … })` calls. The prefix is the two letters from the brief
     (`za`, `cv`, …). Every name in it is a file name without `.svg` inside `art/<faction>/<era>/`:
     `light`, `ranged`, `heavy`, `turret`, `special.rig`, and the fourth unit: `shield` in 1975 and 2025,
     `super` in 2050. `rangedShot` and `turretShot` say what is thrown: the drawing, `arc` (how high it
     flies, in pixels; 14 for something that flies flat, 70 to 100 for a lob), `spin` (turns per second,
     0 to stay upright) and `splash` (the colour of the puff where it lands).
   - `special`: one of the kinds in Step 2, with its numbers from `SPECIAL` in `src/defs/balance.ts`.
   - `heavyRides: true` only if the brief makes the heavy unit a rider, as De Gasten's fatbike is: a unit
     that leaves the gate outside the ranks and rides through them to the enemy base. Its numbers are
     `RIDER` in `src/defs/balance.ts` and its rule is `src/sim/riders.ts`; nothing else needs building.
   - Three more rules of their own came with De Toeristen and are switched on the same way, only if the
     brief asks for them (`src/defs/toeristen.ts` shows all three; the rules are in `src/sim/tourists.ts`
     and the melee blow in `src/sim/step.ts`, the numbers under `POSE`, `SCATTER` and `HOVER`):
     `rangedPoses: '<drawing>'` makes the ranged unit throw nothing and pose the enemy instead, so it needs
     no `rangedShot`, and the drawing is the mark over a posing unit; `heavyHovers: true` puts the heavy
     unit out of reach of melee, with fewer hit points; `shieldScatters: '<drawing>'` makes the schild
     dearer and slower and leave a group behind when it falls, who come as `<era id>.scattered` (one more
     drawing). `summonedStats` gives whoever a summon calls in numbers of their own instead of the
     temperament.
   - `TEMPER`, at the top of the sheet and passed to every `makeEra` call: the faction's temperament. Per
     role (`light`, `ranged`, `heavy`, `shield`) it gives percentages of the shared numbers: `cost`,
     `buildTicks`, `hp`, `speed`, `dmg`, `recover` (the pause between two blows) and, for the ranged unit
     only, `range`. 100 or left out means "as everyone". Rules: nothing further than 30% from the shared
     number, the super unit is left alone apart from its price, and every plus is paid for with a minus.
     Take it from the brief; if the brief has none, write one that fits who they are and say so in the
     pull request.
     `tests/temper.test.ts` checks the limits. Then run `npm run balance -- --mix`, which has both sides
     buy a mix, as people play: your faction should win between 44% and 56% against each of the others,
     taking both seats together. The three factions there are not inside that band against each other
     (see Balance in `docs/factions.md`), so when yours cannot be either, get it as close as you can and
     say so. Also run `npm run balance -- --pairs` (every strategy) and put both in the pull request. If
     the mix result is off, soften the twist
     that helps it most, or strengthen the one that costs it most, and run it again. That fitting is part
     of the job; changing the shared numbers or another faction's table is not. Do not go further than
     that: a faction may well be better at one way of playing than at another, and the owner wants it
     so ("different strategies should pay off").
3. **Register it** in `src/defs/index.ts`: import it and add it to `FACTIONS`. Do **not** add it to
   `FACTION_IDS` yet. That list is what the players can pick, and a faction only goes on it when its last
   drawing is done; until then its rules and texts are tested but nobody can pick a half-drawn faction.
4. **Its text sheet**, `src/ui/factions/<faction>.ts`. Copy `src/ui/factions/zuidas.ts`. Everything is in
   Dutch and comes from the brief: `name`, `place`, `trait` (its temperament in two or three words, such
   as "taai en traag"; it stands next to the name on the title card and must be true of the `TEMPER`
   table), `money`, the `win` lines, `unmoved` (what its super
   unit says when an enemy special does nothing to it), and per id a name and a one-line description
   (`blurbs`), plus four or five lines per era to shout when walking out (`battleCry`) and to mutter when
   beaten (`slinkOff`). A unit with lines of its own gets them under its id instead of an era, as De
   Gasten's fatbike kid does in `src/ui/factions/gasten.ts`; only it says those. The ids are `<prefix>.<era>.light`, `.ranged`, `.heavy`, `.shield` or `.super`,
   `.turret` and `.special`.
   - A description is one or two short sentences, at most about 95 characters, or the title card no
     longer fits. For the schild and the super unit it must say what they do to turrets, as the existing
     ones do.
   - A unit name of one word longer than 16 letters does not fit its button.
5. **Register the texts** in `src/ui/nl.ts`: import the sheet and add it to `TEXT`.

Now run `npx tsc --noEmit` and `npm test`. The type checker points at anything you forgot to fill in,
and the tests name every unit, turret and special that still lacks a name, a description or its lines.
With the faction not on the pickable list they do not yet ask for drawings. To see the list of drawings
to make, put it in `FACTION_IDS` for a moment, run `npx vitest run tests/art.test.ts -t "every drawing"`,
and take it out again until Step 5.

## Step 2: the three specials

Every era has its own special, and the three must be of different kinds. These kinds exist:

| Kind | What it does | What its drawing is, and how the game uses it |
|---|---|---|
| `wave` | Sweeps the lane from your gate and hits every enemy unit once | A rig with a `walk` clip (driven by `stride`), about 190 wide and 130 tall, feet at y = 0. Drawn three times behind each other, one per row. A `static` scene with only an `idle` clip works too; it plays in time as it goes. Examples: `achterhoek/2025/special_kolonne` (a `vehicle`), `gasten/2025/special_toeterstoet` (`static`, `idle`) |
| `stun` | Enemy units can neither walk nor fight for a few seconds | A `static` scene with an `idle` clip, about 156 wide and 118 tall, standing on the road at y = 0. It appears in front of the units it stops, facing them. Example: `havermelk/2025/special_blokkade` |
| `buff` | Your units hit harder and move faster for a few seconds | A `static` scene with an `idle` clip, about 232 wide and 154 tall, y = 0 at its feet. It pops up beside your own base, on the verge behind the road, for as long as the buff lasts. Examples: `achterhoek/1975/special_hoken`, `zuidas/1975/special_gong` |
| `heal` | Your units on the lane get their hit points back | A small `static` drawing around (0,0), about 50 by 48. Three of them float up from every healed unit. Example: `havermelk/1975/special_lovein` |
| `barrage` | A number of blows, one after another, on the foremost enemy unit, or the base | A small `static` drawing around (0,0) with an `idle` clip, about 78 by 46. Up to six hover in formation over the victim and dive one by one. Example: `achterhoek/2050/special_zwerm` |
| `snipe` | Damage that starts with the toughest enemy unit and carries on to the next | A `static` drawing around (0,0), about 120 by 120. It drops out of the sky onto each victim. Example: `havermelk/2050/special_algoritme` |
| `convert` | The toughest enemy unit changes sides | A `static` drawing around (0,0), about 120 by 120. It drops onto the bought unit. Example: `zuidas/2025/special_overname` |
| `divert` | For a few seconds everything the enemy earns is paid to you instead: their income and their bounties | A `static` scene with an `idle` clip, about 232 wide and 154 tall, y = 0 at its feet, like the one of a `buff`: it stands beside your own base for as long as it lasts. It needs a marker `slot` where the money goes in; the game makes coins fly there from the enemy's purse and from every unit they beat. Example: `zuidas/2050/special_succesfee` |
| `summon` | A number of free units of your own come out at your gate, whatever the unit cap, ahead of anyone in training. They pay no bounty when beaten. With `ticks`, they all leave again after that long, paying nobody | A `static` scene with an `idle` clip, about 232 wide and 176 tall, y = 0 at its feet, shown beside your own base for two and a half seconds like the one of a `buff`. With `ticks` it is a ship instead: drawn behind your base at full size with (0,0) at the gate, it slides in from the edge of the screen and stays until they leave; viewBox about `-300 -660 640 668`, hull bottom at y = -52. **And one more drawing**: the unit it calls in, a `humanoid` like a light unit, named in the era's `summoned` field; it comes as `<era id>.summoned` with the numbers of the era's light unit and the faction's temperament, or `summonedStats`. So a faction with a summon has 30 drawings. Examples: `gasten/2050/special_familie_app` with `gasten/2050/holoneef`; `toeristen/2025/special_cruiseschip` with `toeristen/2025/dagjesmens` |
| `hike` | For a few seconds everything the enemy buys costs more: units, turrets, subsidie and modernizing. Their buttons show the prices in red. It starts on the tick after it is pressed | A `static` sign with an `idle` clip, about 150 wide and 190 tall, (0,0) at the foot of its post. It falls out of the sky onto the verge beside the enemy's base and stands there for as long as it lasts. Example: `toeristen/2050/special_huurverhoging` |

Whatever the kind, the drawing in its rest pose is also the picture on the special button and on the
title card, about 50 pixels wide. It has to read at that size.

**Numbers.** A special of an existing kind takes the numbers of the existing special of that kind in the
same era. In another era, scale damage by the era's power: 1 for 1975, 2.4 for 2025, 5.6 for 2050. Add an
entry to `SPECIAL` in
`src/defs/balance.ts` with a one-line comment, as the others have. Do not tune: balance between factions
is looked at once all factions are in, and that is the owner's decision.

### A special of a kind that does not exist yet

`docs/factions.md` plans three more kinds: slow, block and lockout. If your faction needs one, you
build the kind. `convert`, `divert`, `summon` and `hike` were added that way; search the code for `convert`
and `converted`, `divert` and `diverted`, `summon` and `summoned`, or `hike` and `hiked`, and you have a
complete example of each. The places, in order:

1. `src/defs/types.ts`: a new member of the `SpecialDef` union, with the fields it needs.
2. `src/defs/balance.ts`: its numbers, under `SPECIAL`.
3. `src/sim/types.ts`: any state it needs (on `Unit`, `SideState` or `SimState`) and an event for the
   screen to react to.
4. `src/sim/specials.ts`, `startSpecial`: what happens when the button is pressed. If it lasts a while,
   also the place in `src/sim/step.ts` that reads its state every tick.
5. `src/render/view.ts`, `consume`: what the player sees when the event arrives. `src/render/renderer.ts`
   if it needs a new way of drawing.
6. `src/audio/sound.ts`: its own short sound, added to the list in `demo()` so its loudness is measured.
   `src/game.ts`, `react`: play it.
7. `src/bots/bots.ts`, `special()`: when a bot should use it. Without this, bots never do.
8. `tests/`: a test file for the kind, like `tests/takeover.test.ts`.

The rules of the simulation that a new kind must keep, because tests depend on them:

- **Nothing may depend on which player is on the left.** If both players press on the same tick, the
  outcome must be the same with the seats swapped. Changing your own side's flags at once is fine.
  Anything that hurts or moves the enemy goes onto the `dmg` list and lands at the end of the tick, in
  `resolve`. `tests/fairness.test.ts` plays every faction against itself and fails on the first tick the
  two sides differ.
- **Whole numbers only**, and no randomness except through `src/sim/rng.ts`. The same commands must give
  the same match, always.
- **Super units shrug enemy specials off.** Filter with `touchable()` and they are skipped; the event
  `shrugged` is sent for you.
- **The simulation knows nothing about the screen.** It changes state and reports events; everything
  visible happens in `src/render/`.

Then add the kind to the table above and to the table in `docs/factions.md`.

## Step 3: the drawings

A faction needs 29 drawings. Nine per era, the flag and the backdrop. A summon adds the unit it calls in,
a schild that scatters adds its group, and a ranged unit that poses has its mark instead of a projectile
(De Toeristen have 31):

| Drawing | File | Rig | Canvas and origin | Markers | Animations |
|---|---|---|---|---|---|
| Light unit | `<era>/<name>.svg` | `humanoid` | About 100 wide, at most 136 tall. (0,0) is where the feet touch the ground, in the middle of the body | none | idle, walk, attack, hit, die |
| Ranged unit | `<era>/<name>.svg` | `humanoid` | The same | `hand` (or `muzzle`): where the projectile leaves, on the hand or the thing that throws | the same five |
| Its projectile | `<era>/shot_<name>.svg` | `static` | 26 to 40 across, drawn around (0,0) | none | none: the game makes it fly and spin |
| Heavy unit | `<era>/<name>.svg` | `vehicle`, or `free` | About 236 wide, at most 124 tall. (0,0) on the ground in the middle | none | the same five |
| Schild (1975, 2025) | `<era>/<name>.svg` | `humanoid` with an extra part for the shield | About 80 wide, 125 to 158 tall | none | the same five |
| Super unit (2050) | `2050/<name>.svg` | `humanoid` or `free` | About 170 to 190 wide, 200 to 236 tall: it must tower over everything | none | the same five |
| Turret | `<era>/turret_<name>.svg` | `static` | 224 wide, about 130 tall. (0,0) is the middle of the floor it stands on | `muzzle`: where the projectile leaves | idle, attack |
| Its projectile | `<era>/shot_<name>.svg` | `static` | 26 to 40 across, around (0,0) | none | none |
| Special | `<era>/special_<name>.svg` | see Step 2 | see Step 2 | none | see Step 2 |
| Base | `<era>/base.svg` | `static` | viewBox about `-312 -596 328 602`. (0,0) is the gate: the doorway on the road where units walk out, heading right. The building stands to the left of it | `turret0`, `turret1`, `flag` | idle, optional |
| Flag | `art/flags/<name>.svg` | `static` | 120 by 80, cut into eight strips | none | one line, see below |
| Backdrop | `art/<faction>/backdrop.svg` | `static` | 1920 by 1080 | none | none |

Animations live at the same path under `src/anim/clips/`, as `.ts`, with the set of clips as the default
export. They are found by their path: there is no list to add them to.

### The rules every drawing follows

They are in the README under "Drawing a character", and `npm test` enforces them with a message that says
what to change. The ones people trip over:

- A file is a flat list of part groups: `<g id="torso" data-parent="hips" transform="translate(0 -40)">`.
  At the level of a part the transform may only be one `translate(x y)`, which is the part's joint; inside
  the part, groups may carry any transform.
- Order in the file is drawing order. What is written later is drawn on top.
- A `humanoid` needs the parts `hips`, `leg_back`, `leg_front`, `torso`, `head`, `arm_back`, `arm_front`.
  A `vehicle` needs `chassis`, `body`, `wheel_back`, `wheel_front`. Extra parts are welcome: a hat, a
  prop, a shield, a tail.
- A marker is an element such as `<circle data-mount="hand" fill="none" cx="17" cy="0" r="1"/>` inside the
  part it moves with. Without `fill="none"` it shows as a dot.
- If an element has a class from the file's `<style>`, a different colour or stroke width goes in
  `style="fill:#fff"`, not in an attribute: the class would win and the attribute be ignored.
- Not allowed: `text`, `image`, `filter`, `mask`, `foreignObject`, `script`, links, references to other
  files. Gradients, `clipPath` and `<use>` of something in the same file are fine.
- Everything faces right. The game mirrors it for the player on the right.

### What each kind of drawing has to get right

**Units.** They are seen about 130 pixels tall on a busy road, and 50 pixels tall on a button. Chunky
shapes, a dark outline, flat colours, one clear idea per character. The button shows the rest pose of
the file, so the joke has to be in the drawing as it stands, not only in an animation. Health bars hang
at a fixed height per role (140 above the ground for light and ranged, 128 for heavy, 162 for the schild,
244 for the super unit): a drawing taller than the sizes in the table sticks through its own bar.

The five clips:

- `idle`: loops on the clock (`seconds`). Breathing, a tic that fits the character.
- `walk`: loops by distance (`stride`, pixels per cycle), so feet do not slide. Wheels use the helpers in
  `vehicle.ts`.
- `attack`: does not loop and needs `markers: { hit: 0.45 }`, the moment between 0 and 1 at which the blow
  lands or the projectile leaves. The game stretches the clip so that moment falls on the right tick.
- `hit`: a short flinch (`seconds` about 0.3) laid on top of whatever else is playing. For the schild and
  the super unit it must look like something bouncing off, not like pain: most of what hits them is
  turret fire that does next to nothing.
- `die`: nobody dies in this game. A beaten unit turns round and goes home while it fades, and this clip
  loops (`stride`) while it does. Make it a slinking off: head down, the prop dragged behind.

**The schild** has to say "nothing gets through here" at a glance: a person behind something big, held
towards the enemy. See `achterhoek/1975/deurink` and `zuidas/2025/de_disclaimer`.

**Turrets** are small scenes of two or three people, and they are where most of the jokes are. They are
drawn 1.4 times as large as their file and stand on a floor of the base. Keep what matters in the lower
105 pixels; what rises above that overlaps the floor above. The game draws the turret's level as stars at
the bottom corner on the enemy's side, so leave that corner calm. `idle` loops; `attack` runs once every
time it fires, so give it `seconds` of 1.0 or less, and make the throw visible.

**Bases** are the biggest drawing of an era and the first thing a player sees. They change with every
era, and modernizing swaps one for the next in a cloud of dust. A base needs:

- a dark doorway at (0,0), on the road, for units to walk out of;
- two open floors for the turret scenes, each with a marker in the middle of its floor line:
  `turret0` at about (-150, -146) and `turret1` at about (-150, -296). The scene drawn there is 314 wide
  and up to 185 tall, so the floors are bays without anything of their own in them;
- a flagpole, with the marker `flag` at its top, at about (-286, -548). The flag hangs from that point
  towards the right and is 102 by 68 on screen: keep roof ornaments out of that rectangle.

Copy the three markers from an existing base and build around them. An `idle` clip is optional and worth
it: smoke, a cat's tail, a window cleaner.

**The flag.** Copy `art/flags/zuidas.svg`, keep the eight strips `s0` to `s7` exactly as they are, and
replace what is inside `<g id="flag">` with your design on a 120 by 80 field. Its animation file is one
line: `export { default } from './achterhoek.ts';`. The flag is mirrored for the player on the right, so
it must survive that. If its design cannot (the Zuidas flag has a line that must go up, not down), add a
second file with the design itself mirrored and name it as `flagRigRight` in the data sheet, as
`art/flags/zuidas_rechts.svg` does.

**The backdrop** is the faction's half of the scenery, drawn for the left side of the screen; the game
mirrors it on the right and fades the two halves into each other between x = 860 and x = 1060. Read the
comment at the top of `art/havermelk/backdrop.svg` and look at `art/zuidas/backdrop.svg`. The contract:

- `viewBox="0 0 1920 1080"`, one part: `<g id="scene" transform="translate(0 0)">`.
- No sky: everything above the skyline stays transparent. The sky is shared (`art/scenery/sky.svg`), and
  its sun sits at about (1180, 150), which is (740, 150) for a mirrored half. Keep tall things away from it.
- The skyline thins out before x = 960. The ground runs on to x = 1100 and nothing is drawn beyond that.
- Three bands sit exactly here, because the game is laid out on them: the strip behind the road from
  y = 598 to 640, the road from y = 638 to 742, and the ground in front from y = 742 to 1080, where the
  button panels lie over it, so keep that calm and fairly light. Thin dark edge lines at y = 638 and 742.
- The base stands on top of it between x = 0 and 330. The interesting skyline goes between 330 and 900.
- Pale, without outlines, lower in contrast than the units, so they stay readable in front of it.

### How to work, one drawing at a time

1. Write the SVG. Start from the nearest existing drawing of the same kind, for its `<style>` block, its
   proportions and its part list, and draw your own character into that frame.
2. `node scripts/shot.ts rig <faction>/<era>/<name> 3` writes
   `screens/chromium/rig-<faction>-<era>-<name>.png`: the file as the browser shows it, the puppet put
   together with its joints, and every animation as a strip of frames. Look at it. Be hard on it: is the
   head the size of the other units' heads, is the outline as heavy, does any part float loose or show a
   gap in any frame, does the idea come across without the name under it?
3. Write the animations, look again, fix, until it holds up next to the existing units.
4. `npx vitest run tests/art.test.ts -t "<name>"` must pass.
5. When an era is done: `node scripts/shot.ts gallery <faction>/<era>` for the contact sheet, and
   `node scripts/shot.ts rig <id> 3 --engine=all` for each rig, which must report no problems in Firefox
   and WebKit either.

Order that works: one light unit first, until it could stand between the existing ones unnoticed. Then
the rest of that era, then the next era. The flag and the backdrop any time.

Screenshots are large. Look at the page of the drawing you are working on and at contact sheets; do not
page through every rig after every change.

**With helpers.** The two existing extra eras were drawn by four agents side by side, one per faction and
era, and all came back in style. If you can start sub-agents, that split works: give each one era, the
list of files from the brief with the concept of each, the tables and rules of this step, and these
limits: write only inside `art/<faction>/<era>/` and `src/anim/clips/<faction>/<era>/`, look at your own
`shot.ts rig` pages, never run `shot.ts gallery` or `battle` without a faction and era (shared file
names), run no git command that changes anything. You then check every contact sheet and the staged
battles yourself: their word is not the check.

## Step 4: how it sounds

All sound is synthesized in `src/audio/sound.ts`; there are no audio files. A faction has a `voice`,
which picks the sound of a unit walking out (`spawn`) and of a turret firing (`turret`). To add a voice:
add its name to the `Voice` type in `src/defs/types.ts`, add a branch for it in both methods, and add
both calls to the list in `demo()`, which is how the tests measure that nothing is too loud. Keep it
short and soft; copy the levels of the existing ones. Nobody can check it by ear in a test run, so say
in your report that it was not listened to.

## Step 5: see it in the game

1. Add the faction to `FACTION_IDS` in `src/defs/index.ts`. `npm test` now also checks that every drawing
   it needs exists.
2. `node scripts/shot.ts battle <faction> achterhoek` and `node scripts/shot.ts battle havermelk <faction>`
   play a staged match through all three eras, with your faction once on each side, and write about
   twenty pictures to `screens/chromium/`, named `<left>-<right>-battle-….png` and `…-title.png`. Look at
   them all. What to look for:
   - units the right size next to the other faction's, feet on the road, facing the enemy;
   - turret scenes standing on their floors inside the base, not floating and not cut off;
   - the flag on its pole;
   - projectiles leaving from the hand or the muzzle;
   - each special visible and readable in the picture taken just after it (`…-special-left`, `-right`);
   - the super unit towering over the rest;
   - on the right-hand side: nothing that reads wrong in mirror image;
   - the backdrop meeting the other faction's without a seam, and nothing tall behind the sun;
   - names fitting on the buttons (`…-panel-….png`) and the title card fitting on the screen.
3. Also play a faction against itself once: `node scripts/shot.ts battle <faction> <faction>`.

The address `http://localhost:5173` (after `npm run dev`) is the real game, for trying it by hand.
`/gallery.html?only=<faction>/<era>` shows the drawings.

## Step 6: checks

All of these, in this order:

1. `npx tsc --noEmit`: no errors.
2. `npm test`: everything green except the one test about `BoermensGevecht.html`, which waits for the
   build.
3. `npm run e2e`: everything green in Chromium, Firefox and WebKit. One test plays every faction on the
   list through all three eras with every unit and special, yours included, without you adding a test.
   Another puts every drawing together from its parts and compares it with the file.
4. `npm run balance -- <faction> achterhoek` and `npm run balance -- havermelk <faction>`: no stalls, and
   neither side winning more than about 60% of decided matches. This is a sanity check, not tuning. If a
   special of yours is wildly off, compare its numbers with the existing special of the same kind; do not
   start balancing.
5. `npm run build`. It rebuilds `BoermensGevecht.html`, the whole game in one file, which is committed on
   purpose. Then `npm test` once more: now everything is green.

## Step 7: the papers

- `README.md`: the faction in the table under "The factions", and in "Credits" if its flag or anything
  else is redrawn from something that exists.
- `docs/factions.md`: the state in the table at the top becomes **Built**, and the list under "Suggested
  order" is updated. If you built a new kind of special, move it to the table of kinds that exist.
- This file, if you found a step that was wrong or missing. The next one to read it is in your position.

## Step 8: hand it in

- A branch from `main`, named after the faction. Commit as you go; a commit per era is a good size.
- One pull request. In it: what the faction is, anything you decided yourself (open questions from the
  brief, a new kind of special, a new voice), what you checked and how, and what you did not check. Be
  exact about the last part: nobody has played it by hand, nobody has heard the sound, unless that is
  not so.
- Do not merge. The owner does.

## Done means

- [ ] All 29 drawings exist, with their animations, and each was looked at in its own rig page.
- [ ] The faction is in `FACTION_IDS` and can be picked on the title screen, on either side.
- [ ] It has a temperament and a `trait` that says the same in words, and `npm run balance -- --mix`
      shows it between 44% and 56% against every other faction, both seats together, without a stall.
- [ ] Staged battles on both sides and against itself were looked at, picture by picture.
- [ ] `npx tsc --noEmit`, `npm test` and `npm run e2e` are green, the last in all three engines.
- [ ] `BoermensGevecht.html` was rebuilt after the last change and is committed.
- [ ] README and `docs/factions.md` say what is true now.
- [ ] A pull request is open, with an honest list of what was and was not checked. It is not merged.

## A faction that is half done

Work on a faction can stop halfway: a session ends, a budget runs out. That is why a faction is only
added to `FACTION_IDS` when its last drawing is there. If you are asked to finish one:

1. Put it in `FACTION_IDS` for a moment and run `npx vitest run tests/art.test.ts`. The test "every
   drawing a faction needs is there" lists the drawings that are missing, and "every unit that has art
   has all five clips" the animations.
2. Make contact sheets of all three eras (`node scripts/shot.ts gallery <faction>/<era>`) and look at what
   is there with fresh eyes. Drawings written just before the work stopped may never have been checked.
3. Carry on from Step 3, with the brief in `docs/factions.md` for anything that is missing.

De Zuidas was built that way, in three sittings.

## Things that went wrong before

- **zsh.** An unquoted `$var` is not split into words, and a pattern that matches no file aborts the
  whole command. Quote, and do not loop over a string of arguments.
- **The page reloads while you save.** The development server reloads when a file changes, so a browser
  test that runs while drawings are being written fails in odd ways. `scripts/shot.ts` starts its own
  server without that; run `npm run e2e` when nothing else is writing.
- **The built file is stale.** Any change to `src/`, `art/` or `index.html` makes the test for
  `BoermensGevecht.html` fail until `npm run build`. Build last, and commit the file.
- **An animation names a part that does not exist.** The test says which. Part ids are
  `lower_snake_case`.
- **A drawing looks right as a file and wrong as a puppet.** Usually a part whose art is not drawn around
  its own joint, or a parent that is listed after its child. The rig page shows both pictures side by
  side with the share of pixels that differ.
- **A rule added because it looked good in bot tournaments.** Income used to stop in overtime; bots broke
  through more often, and between people it meant three minutes in which nobody could do anything. Do not
  add or change rules of the game on the way. If something in the rules gets in your way, write it in the
  pull request and leave it.
- **Calling it done on the word of a helper.** Look at the pictures yourself.
- **A joke the brief itself rules out.** Every faction's section in `docs/factions.md` ends with a list
  called "Stay away from". Read it again before you name or draw anything that is not literally in the
  brief. A special for De Zuidas was once built and drawn as a letterbox company, which is on its list;
  it had to be renamed and redrawn before it could ship.
