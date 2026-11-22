# Boermens Gevecht

De Achterhoek tegen de havermelkelite: a lane-battle game for two players on one keyboard, in the browser.
Amsterdam sits on the left, the Achterhoek on the right. Each player buys units that walk to the other side
on their own, builds and upgrades turrets, applies for more subsidie, uses a special move, and modernizes
from the seventies to the future. Whoever wrecks the other base wins.

All art is hand-written SVG in `art/`, animated as cut-out puppets. There are no image or sound files.

## Play it

Download **`BoermensGevecht.html`** from this repository and double-click it. It opens in your browser and
that is all: one file, nothing to install, no internet needed. Any current browser will do; it is tested
in the engines of Chrome and Edge, Firefox, and Safari. Two players share one keyboard; the keys are on the
title screen.

If you cloned the repository, the file is in its root: open it from there.

## Status

| Part | State |
|---|---|
| Rules: units, three rows, turrets with levels, specials, subsidie, modernizing, overtime | Done, covered by tests |
| Three eras per side: Jaren '70, Jaren '20, the future | Done: each has its own three units, turret, special and base |
| Title screen, HUD, keyboard and on-screen buttons, win screen, rematch | Done |
| Art pipeline, gallery, screenshots, three-browser check | Done |
| Sound | Done: synthesized effects and a tune, no audio files. Checked for errors and loudness by test, not judged by ear |

## The two sides

| | Havermelkelite (Amsterdam, left) | Achterhoek (right) |
|---|---|---|
| Jaren '70 | Kraker Sjors, Bloemenkind Fleur, Flowerpowerbusje. Turret: De Kraakradio. Special: Love-in (heals your units) | Klein Mepperink, Smijtink, Groot Ploegink. Turret: Carbidbus. Special: Høken! (your units hit harder and move faster) |
| Jaren '20 | Padel-Pepijn, Barista Bo, Bakfiets-Babette. Turret: Podcaststudio. Special: Wegblokkade (enemy units stand still) | Quadink, Dronink, Giertink. Turret: De Heitinks. Special: Trekkerkolonne (sweeps the lane) |
| The future | VR-Vik, Boba-Bibi, Kweekvleesblob, and the super unit: the Havermelkreus. Turret: Livestream. Special: Het Algoritme (cancels the toughest enemy, then the next) | Exo-Mepperink, Verschrikkerink, De Vreter, and the super unit: Kolossink. Turret: Melkrobot. Special: Dronezwerm (ten strikes on the foremost enemy) |

Both sides have the same numbers for the same role in the same era; they differ in looks, projectiles and specials.

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
| Super unit (the future only) | R | P |
| Turret: build, replace an old one, or upgrade | A | J |
| Special | S | K |
| Subsidie aanvragen | D | L |
| Moderniseren | F | ; |
| Pause | Space | Space |
| Sound: everything, effects only, off | M | M |
| Start, play again | Enter | Enter |

Every action is also a button on screen.

## How a match works

- Subsidie trickles in every second; beating an enemy unit pays a bounty.
- **Subsidie aanvragen** costs money now and raises the income for the rest of the match, in five steps
  from 12 to 62 a second.
- Units march in three rows. Nobody passes an ally in their own row or the enemy's foremost unit, so up to
  three fight side by side while ranged units shoot from behind.
- Light units are fast and cheap. Ranged units throw from a distance. Heavies are slow, tough, and hit
  everything within reach at once.
- **Turrets.** Each base has two slots, and one button does it all: it fills an empty slot, then upgrades
  the turret with the lowest level. There are three levels, and each makes it hit harder (100%, 150%, 200%)
  and reach further (300, 480 and 660 pixels of the 1280 pixel lane). A new turret only guards the doorstep;
  a fully upgraded one reaches just past the middle and joins the fight there. A dotted line across the road
  shows how far each side's turrets reach.
- **Moderniseren** cannot be bought. It takes vooruitgang, which comes in slowly by itself and faster with
  every unit beaten or lost. The button fills up; when it is full, pressing it gives the next era: new
  units, a new special, a much stronger base. A unit of the next era costs twice as much and is well over
  twice as strong.
- After modernizing, the old turrets keep firing but are a step behind. The turret button now replaces
  them one at a time with the new era's turret, back at level 1.
- Specials recharge in 50 seconds, and every era has its own.
- **The super unit.** The future has a fourth unit: one machine that is an army by itself. It costs 3000,
  takes twelve seconds to build, beats its own price in any mix of ordinary units, and enemy specials have
  no effect on it: it cannot be cancelled, glued down, run over or picked out by drones. Six heavies or a
  steady supply of units and turrets still bring it down.
- After ten minutes both bases start to crumble. The less damaged one outlasts the other.

## Where things are

```
art/<faction>/<era>/*.svg   the drawings
src/defs/                   every number and every unit: balance.ts is the one file to tune
src/sim/                    the rules. No browser code, runs the same on both sides
src/rig/                    turns an SVG into a puppet
src/anim/                   animation data and building blocks; clips/<faction>/<era>/ has one file per drawing
src/render/                 draws the battle
src/audio/                  every sound, made with oscillators and noise
src/ui/                     HUD, screens, keys; nl.ts holds every word of text
src/bots/                   scripted players, for tests and balance only
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
| `npm test` | Rules, fairness between the two sides, the lint over all art and animations, and that `BoermensGevecht.html` is up to date |
| `npm run e2e` | In Chromium, Firefox and WebKit: plays a match, modernizes through all three eras, uses every special, checks every puppet against its drawing, measures that the sound is audible and never clips, and opens `BoermensGevecht.html` straight from disk to see that it plays |
| `npm run balance` | Bot tournament: win share per faction, match length, how many reach overtime, which era matches end in |
| `npm run shots -- battle` | Screenshots of the title and a staged battle through all three eras in `screens/` |
| `npm run build` | Type check, static build in `dist/` ready for any static host, and the single file `BoermensGevecht.html` |

Adding `?test=1` to the game's address stops the clock; `window.__game` then steps the match by hand
(see `src/testhooks.ts`).

## Credits

- The Achterhoekse vlag was designed by Paul Heutinck (2018); it is redrawn here from the published design.
- The flag of Amsterdam is the city's historic flag, redrawn.
- Everything else is original to this project.
