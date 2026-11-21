# Boermens Gevecht

De Achterhoek tegen de havermelkelite: a lane-battle game for two players on one keyboard, in the browser.
Amsterdam sits on the left, the Achterhoek on the right. Each player buys units that walk to the other side
on their own, builds a turret, and uses a special move. Whoever wrecks the other base wins.

All art is hand-written SVG in `art/`, animated as cut-out puppets. There are no image or sound files.

## Status

Milestone 1 (one era, Jaren '20) is in progress.

| Part | State |
|---|---|
| Rules: units, three rows, turrets, specials, money, overtime | Done, covered by tests |
| Title screen, HUD, keyboard and on-screen buttons, win screen, rematch | Done |
| Art pipeline, gallery, screenshots, three-browser check | Done |
| Drawn so far | Barista Bo, Giertink's tractor, both flags |
| Still grey boxes | The other four units, both bases, turrets, projectiles, the Trekkerkolonne, the scenery |
| Later milestones | The other four eras and modernizing, sound, balance pass |

## Running it

```
npm install
npm run dev
```

Open the address it prints. `/gallery.html` on the same address shows every drawing with its animations.

## Controls

Keys are read by position on the keyboard, so the layout does not matter.

| Action | Left player | Right player |
|---|---|---|
| Unit 1 / 2 / 3 | Q / W / E | U / I / O |
| Turret | A | J |
| Special | S | K |
| Pause | Space | Space |
| Start, play again | Enter | Enter |

Every action is also a button on screen.

## How a match works

- Subsidie trickles in every second; beating an enemy unit pays a bounty.
- Units march in three rows. Nobody passes an ally in their own row or the enemy's foremost unit, so up to
  three fight side by side while ranged units shoot from behind.
- Light units are fast and cheap. Ranged units throw from a distance. Heavies are slow, tough, and hit
  everything within reach at once.
- Specials recharge in 50 seconds. The Wegblokkade freezes every enemy unit for five seconds; the
  Trekkerkolonne sweeps the lane and hits every enemy unit once.
- After seven minutes both bases start to crumble. The less damaged one outlasts the other.

## Where things are

```
art/<faction>/<era>/*.svg   the drawings
src/defs/                   every number and every unit: balance.ts is the one file to tune
src/sim/                    the rules. No browser code, runs the same on both sides
src/rig/                    turns an SVG into a puppet
src/anim/                   animation data and building blocks; clips/ has one file per character
src/render/                 draws the battle
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
   - `data-rig` is `humanoid`, `vehicle` or `static`. The first two need a fixed set of parts
     (see `src/rig/archetypes.ts`).
   - A child with `data-mount="hand"` marks a spot, such as where a projectile leaves. It is not drawn.
   - Not allowed: `text`, `image`, `filter`, `mask`, `foreignObject`, links to other files.

2. Add `src/anim/clips/<name>.ts` with five clips (idle, walk, attack, hit, die) and register it in
   `src/anim/clips/index.ts`. `barista_bo.ts` and `giertink.ts` are the examples to copy from.

3. Look at it: open `/gallery.html?rig=<faction>/<era>/<name>`, or run
   `node scripts/shot.ts rig <faction>/<era>/<name>` for a picture in `screens/`.

`npm test` fails with a plain message if a file breaks these rules or an animation names a part that
does not exist.

## Checking and tuning

| Command | What it does |
|---|---|
| `npm test` | Rules, fairness between the two sides, and the lint over all art and animations |
| `npm run e2e` | Plays a match in Chromium, Firefox and WebKit, and checks every puppet against its SVG file |
| `npm run balance` | Bot tournament: win share per faction, match length, how many reach overtime |
| `npm run shots -- battle` | Screenshots of the title and a staged battle in `screens/` |
| `npm run build` | Type check and static build in `dist/`, ready for any static host |

Adding `?test=1` to the game's address stops the clock; `window.__game` then steps the match by hand
(see `src/testhooks.ts`).

## Credits

- The Achterhoekse vlag was designed by Paul Heutinck (2018); it is redrawn here from the published design.
- The flag of Amsterdam is the city's historic flag, redrawn.
- Everything else is original to this project.
