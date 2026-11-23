# Faction blueprint

Eight new factions for Boermens Gevecht, written out far enough that drawing can start the day one is
approved. The groundwork for more factions and the first of them, De Zuidas, are built; the other seven
are a plan to pick from and to change. How to build one, step by step, is in
[`new-faction.md`](new-faction.md).

| Faction | In one line | State |
|---|---|---|
| [De Zuidas](#1-de-zuidas) | Bankers, lawyers and consultants | **Built** |
| [Carnaval](#2-carnaval) | Brabant and Limburg in full swing | Concept, waiting for approval |
| [De Friezen](#3-de-friezen) | Proud, stubborn, on skates | Concept, waiting for approval |
| [Rotterdam](#4-rotterdam) | The port: niet lullen maar poetsen | Concept, waiting for approval |
| [De Toeristen](#5-de-toeristen) | Everyone's shared enemy | Concept, waiting for approval |
| [De Ambtenarij](#6-de-ambtenarij) | Forms in triplicate | Concept, waiting for approval |
| [De Camping](#7-de-camping) | The Netherlands on holiday | Concept, waiting for approval |
| [De Gastheren](#8-de-gastheren) | Three generations, from the factory floor to the wedding hall | Brief, read and changed by the owner; waiting to be merged |

Parked for later, outside these eight: **the voetbalvader** and the amateur football club on a Saturday
morning, as a faction of its own.

## How to use this

- **Approving** a faction means: its section below becomes the brief. The names, the jokes and the list of
  drawings are what gets built. Anything you want different, change it here first.
- Every section has the same parts: who they are, what makes them recognizable (from the research, with
  sources at the end), the roster per era as a list of drawings, the specials, the lines they shout, what
  to stay away from, and the open questions that need your answer.
- The file names in the lists are final. A drawing called `bodywarmer_bas` will live at
  `art/zuidas/2025/bodywarmer_bas.svg` with its animations at `src/anim/clips/zuidas/2025/bodywarmer_bas.ts`.

## What every faction consists of

A faction is the same size as the two that exist, so that any two can play each other.

| Per era (1975, 2025, 2050) | Drawings |
|---|---|
| Light unit: fast, cheap, melee | 1, with five animations |
| Ranged unit and what it throws | 2 |
| Heavy unit: slow, tough, hits everything in reach | 1 |
| Fourth unit, the answer to turrets: the schild in 1975 and 2025, the super unit in 2050 | 1 |
| Turret: a scene of two or three people, and what it throws | 2 |
| Special: its drawing on the field | 1 |
| Base | 1 |

That is nine drawings per era, twenty-seven in all. On top of that come the **flag** and the faction's
half of the **backdrop**: **29 drawings per faction**.

**The schild** was added on 22 November 2026, after turrets turned out to decide matches by themselves:
someone behind something big. Every enemy turret that can reach it fires at it, wherever it stands in the
ranks, and their shots do it very little, so for as long as it stands the army around it is safe from
turrets. Against units it is a pushover. In 2050 the super unit does the same job. The drawing has to say
"nothing gets through here" at a glance, and its hit animation is a "ting", not pain.

Besides the drawings a faction needs words: a name and a one-line description for everything that can be
bought, a handful of lines to shout when walking out and to mutter when beaten (per era), a name for its
money, a line for when it wins, and the line its super unit says when an enemy special passes it by.

**Numbers.** Price, hit points, damage, speed and build time come from the role and the era, the same for
everyone (`src/defs/balance.ts`). On top of those a faction brings its **temperament**: a small twist per
role, the same in every era, that makes its units feel like its own. See
[How the factions play differently](#how-the-factions-play-differently). Factions also differ in looks, in
what they throw, and in their three specials.

**Tone.** It is satire, in small jokes: a detail in a drawing, a line a unit mutters, a name. Nobody is
lectured and nothing is rubbed in.

**Rules for what goes in:**

- Types, never real people. No politicians, no parties, no celebrities, no historical persons by name.
- No real brands or logos. A parody name is fine ("Jan Deere").
- No jokes at the expense of where someone comes from. The regions may be teased the way they tease
  themselves. A faction about people's background, such as section 8, carries only the jokes that
  community makes about itself, in its own comedy, books, films and family stories, told with affection,
  and its brief names the inside source of each one. A joke that can only be sourced from outsiders does
  not go in, unless the owner decides to keep it after reading why; the brief then marks it as the
  owner's decision. The tourists are types of visitor, never nationalities.
- Nothing about real tragedies or scandals in which people were hurt.
- No lettering unless it is drawn as shapes and survives being mirrored. Symbols beat words.

## The groundwork (done)

These were one-off jobs before a third faction could exist. They are built, and not repeated for the next.

1. **Choosing sides.** On the title card each player steps through the factions with two of their own
   keys (A and D on the left, J and L on the right) or with the arrows on screen. Any pair can meet,
   including a faction against itself. Escape goes back to the title card after a match or from pause.
2. **Either side of the screen.** Every drawing faces right and is mirrored for the right-hand player;
   parts with lettering flip back. Amsterdam on the right and the Achterhoek on the left were checked in
   staged battles through all three eras.
3. **A backdrop per faction.** `art/scenery/sky.svg` is the sky every match shares. Each faction brings
   its own half of the land, `art/<faction>/backdrop.svg`, drawn for the left side. The game mirrors the
   right-hand one and fades the two into each other across the middle.
4. **One sheet per faction.** `src/defs/<faction>.ts` holds its drawings, colours, flag, backdrop, how it
   sounds and its three specials. `src/ui/factions/<faction>.ts` holds every word it says and is called.
5. **New kinds of special.** Convert is built, for De Zuidas. The other four come with the factions that
   use them; see the next section.
6. **Tests and bots for any pair.** The fairness tests run over every faction, `npm run balance` takes any
   two factions or `--pairs` for all of them, and `npm run shots -- battle <left> <right>` stages a battle
   between any two.

**What adding a faction takes now**

1. The drawings: 27 for the three eras, the flag in `art/flags/`, and the backdrop.
2. `src/defs/<faction>.ts`: which drawing is which unit, per era, and the three specials.
3. `src/ui/factions/<faction>.ts`: names, one-line descriptions, lines, the name of its money, its win line.
4. One line each in `src/defs/types.ts` (the id), `src/defs/index.ts` (the list the players step through)
   and `src/ui/nl.ts` (the table of texts).

The tests then say what is still missing: a drawing, an animation, a name, a line.

The single file `BoermensGevecht.html` grows by roughly 240 kB per faction. It
would be about 2.3 MB with all ten, which is still fine to send around.

## Specials: the kinds

Every faction has three specials, one per era, each of a different kind. Eight kinds exist today:

| Kind | What it does | Used today by |
|---|---|---|
| Wave | Sweeps the lane and hits every enemy unit once | Trekkerkolonne |
| Stun | Enemy units can neither walk nor fight for a few seconds | Wegblokkade |
| Buff | Own units hit harder and move faster for a few seconds | Høken!, De gong |
| Heal | Own units on the lane are patched up | Love-in |
| Barrage | Repeated blows on the foremost enemy unit, or the base | Dronezwerm |
| Snipe | Damage that starts with the toughest enemy unit and carries on to the next | Het Algoritme |
| Convert | The toughest enemy unit changes sides, with the hit points it has left | Vijandige overname |
| Divert | For a few seconds everything the enemy earns is paid to you instead: income and bounties | De Succesfee |

**Convert, as built.** The unit turns round where it stands. It never ends up beyond the line its old
side still holds: bought out of the back ranks, it comes forward to its new side's front line and takes
the row with the most room there. It costs nothing but the special and pays no bounty. A super unit
cannot be bought. If the unit is beaten on the very tick it is bought, the deal is off. Two takeovers on
the same tick make the two units swap sides, whoever pressed first.

**Divert, as built** (23 November 2026, at the owner's request: the special De Zuidas had in 2050, a wave
called Flitskrach, was too weak and had nothing to do with money). For five seconds whatever the enemy
earns lands in your purse: the income that comes in every second, and the bounty for every unit they beat,
your own units included. That last part is what makes the timing matter: used just before an expensive
unit of yours goes down, its bounty comes back to you. Nothing is taken from what the enemy already has,
they keep the vooruitgang they earn, and it is not aimed at units, so a super unit has nothing to shrug
off. Two sides that do it to each other on the same tick simply swap what they earn.

New kinds the rest of this plan asks for:

| Kind | What it does | First used by |
|---|---|---|
| Summon | A crowd of weak units pours out of your gate at once, outside the queue, and goes home after a while | De Toeristen: Cruiseschip legt aan |
| Slow | Enemy units crawl for a few seconds; they can still fight | De Camping: Zwarte Zaterdag |
| Block | Something lands on the lane in front of the enemy: it hurts whoever is under it, and nobody gets past it for a few seconds | Rotterdam: De container |
| Lockout | The enemy can buy and train nothing for a few seconds, and their units wait a moment | De Ambtenarij: Inspraakavond |

As with the existing specials, the super units of 2050 shrug all of these off. The schild does not: it
can be cancelled, glued down, run over and bought like any other unit.

The twenty-four specials at a glance:

| Faction | 1975 | 2025 | 2050 |
|---|---|---|---|
| De Zuidas | De gong (buff) | Vijandige overname (convert) | De Succesfee (divert) |
| Carnaval | De Polonaise (wave) | Elf Kanonschoten (barrage) | De Kater (slow) |
| De Friezen | De winter van '63 (slow) | It giet oan! (wave) | Kunstijs (stun) |
| Rotterdam | Mouwen opstropen! (buff) | De container (block) | De kering sluit (wave) |
| De Toeristen | De Dia-avond (stun) | Cruiseschip legt aan (summon) | Tijdslot verlopen (lockout) |
| De Ambtenarij | Inspraakavond (lockout) | Het Overleg (stun) | De Doorverwijslus (slow) |
| De Camping | Zwarte Zaterdag (slow) | Na tienen is het stil! (stun) | De Minidisco (buff) |
| De Gastheren | Eerst thee (heal) | De Toeterstoet (stun) | Nee is nee (snipe) |

The kinds are a first assignment by theme. Which special gets which kind can still be shuffled when the
balance is looked at; the names and the drawings stay.

## How the factions play differently

**What is built: temperament.** Since 23 November 2026 every faction puts a small twist on the shared
numbers, per role and the same in every era. It is shown as two or three words next to the faction's name
on the title card.

| Faction | On the title card | Light | Ranged | Heavy | Schild |
|---|---|---|---|---|---|
| Achterhoek | taai en traag | +15% hit points, 10% slower, 20% longer between blows | +15% damage, 20% longer between throws | as the light unit | +15% hit points, 10% slower |
| Havermelkelite | snel en licht | 15% faster, 15% fewer hit points, 10% cheaper | throws 10% further, 10% softer, 10% cheaper | 15% faster, 10% fewer hit points, 10% cheaper | 10% faster, 10% fewer hit points, 10% cheaper |
| De Zuidas | duur en gehaast | trained in 70% of the time, 15% shorter between blows, 10% dearer | the same, and 10% more damage | as the ranged unit | trained in 70% of the time, 10% dearer, +10% hit points |

De Zuidas' super unit, De Gouden Handdruk, also costs 10% more: 3300 instead of 3000. The owner kept the
Havermelkreus at 3000. A super unit's twist may only be its price.

The rules a temperament keeps (`tests/temper.test.ts` holds them):

- No number strays more than 30% from the shared one.
- It twists price, time in training, hit points, speed, damage, the pause between blows, and for units
  that throw their reach. Nothing else: bases, turrets, income and the price of modernizing are the same
  for everyone, and so is what makes a role the role it is (the heavy unit hits everything in reach, the
  schild draws the turrets' fire). A super unit may differ in price only.
- Every plus is paid for with a minus. The three temperaments were first fitted so that no faction won
  more than 56% of bot matches over all strategies against another.
- A price premium is a strong lever. De Zuidas first shipped with its junior and its Gouden Handdruk at
  everybody's price. Playing it, the owner found it too strong: "in a unit vs unit the zuid-as seems to
  always have the stronger unit", and "as people buy a mix always". They were right. Unit against unit
  in the same slot De Zuidas won every time, and with both players buying a mix it won about two matches
  in three. On 23 November 2026 the owner decided that every Zuidas unit costs 10% more, the Handdruk
  included. Raising its prices further (10% on top of the earlier ones) dropped it to 28% against the
  farmers with both buying a mix.
- The same day the owner put Amsterdam's four units at 90% of the shared price (until then only its
  cheapest unit was cheaper): "they are faster but a bit weaker and cheaper whereas the achterhoek has
  slower and stronger units ... In the end they are tiny balance changes". The Havermelkreus stays at
  3000. 85% and 87% were measured too: they even Amsterdam out against the farmers (60% and 51%), but
  then Amsterdam beats De Zuidas in more than eight mixed matches out of ten. What the two price changes
  did together is in the table under Balance.

**What is asked for next: units that do different things.** The owner, on 23 November 2026: "later
factions should have some more variation in what the units do. Now they are all quite the same which is
fine, but it would be fun if the factions differ in gameplay a bit as well." So from the next faction on,
a faction should bring more than a temperament: one or two units that *behave* differently from the unit
in the same slot elsewhere. The slots stay (light, ranged, heavy, the fourth unit), so any two factions can
still play each other and the buttons mean the same everywhere.

None of the following is built or decided. They are ways a unit could differ that the rules can carry
without becoming a different game, as a starting point for whoever writes the next faction's brief:

| A unit that | For example | What it needs in the rules |
|---|---|---|
| hits everything in reach while being cheap and weak | a light unit with the heavy unit's sweep | nothing new: `cleave` exists |
| throws something that also hits whoever stands behind the target | a ranged unit with a splash | a radius on the shot |
| heals or speeds up the allies next to it instead of fighting | a support unit in the ranged slot | an aura, read every tick |
| is two weak units for the price of one | a pair that walks out together | spawning two from one queue item |
| leaves something behind when beaten | a heavy unit that drops a light one | a spawn on defeat |
| charges: fast until it first hits something, slow after | a heavy unit that arrives early | a speed that depends on its state |
| cannot be hit by ranged units, only in melee | a low, quick unit | a flag the shots respect |
| earns money while it lives | a unit that brings in a little every second | income per unit, on top of the subsidie |

The first one asked for is the owner's own: the fatbike of section 8, a cheap rider that rides through
the enemy ranks, hitting every unit it passes, goes for the base and is stopped by a door. Its rule is
written out there.

Two things to hold on to when one of these is built: it must keep working mirrored (both players press on
the same tick, seats swapped, same outcome), and a unit's blurb on the title card must say in plain words
what is different about it, because nobody reads numbers during a match.

## Balance

Decided on 22 November 2026: balance between factions is looked at **once all factions are in**, not per
faction. Until then a new faction ships on the shared numbers with its own temperament on top, fitted
with bot matches so that it wins between 44% and 56% against each of the others with both sides buying a
mix (`npm run balance -- --mix`), and with specials set by feel. That is a guard against a faction that is plainly too strong or too weak, not a balance pass:
bots do not play like people.

**Different strategies should pay off.** Over a whole bot tournament the factions come out even, but when
both sides play the same single style one of them nearly always wins, and which one depends on the style:
De Zuidas when both only send cheap units or only heavies, Amsterdam when both only build a firing line,
and so on. That was already so before the temperaments, because the specials suit different styles. The
owner, on 23 November 2026, when I started evening that out: "no need to balance same style test.
Different strategies should pay off. Like only rushing cheap units is something players do not do." So
a faction that is better at one way of playing than at another is wanted, and matches in which both
sides do one and the same thing are not a yardstick. What the balance pass looks at, once all factions
are in, is whether every faction has a way to win against every other.

**Except a mix: that is how people play.** Later that day the owner added, about De Zuidas: "as people
buy a mix always". So the one same-style match that does count is both sides buying a bit of everything,
which `npm run balance -- --mix` plays (the `mixed` bot on both sides, 100 seeds, both seats).
Measured on 23 November 2026, before and after De Zuidas became 10% dearer and Amsterdam 10% cheaper:

| Both buying a mix | Before | After |
|---|---|---|
| Amsterdam against the Achterhoek | Amsterdam wins 13% | 31% |
| Amsterdam against De Zuidas | Amsterdam wins 43% | 71% |
| De Zuidas against the Achterhoek | De Zuidas wins 66% (at its old prices) | 60% |

So with both buying a mix each faction beats one and loses to the other. Over every bot strategy
(`--pairs`) Amsterdam wins 58% against the farmers and 70% against De Zuidas, and the farmers 60%
against De Zuidas: there De Zuidas is the weakest.

What to know before the balance pass:

- Amsterdam's trouble against the farmers sits in 2025. With both sides buying a mix and starting in
  the same era, Amsterdam wins 93% if nobody can modernize out of 1975, 57% when both start in 2050,
  and 2% when both start in 2025. That stays so with every special switched off (7%), and with the two
  specials of 2025 swapped (2%). So the Dronezwerm is not it, and neither is the Kolonne or the Blokkade.
  The cause was not found. In full matches the farmers reach 2050 first: at ten minutes they are there
  in nine matches out of ten, Amsterdam in half.
- Nearly all mixed matches reach 2050 and run into overtime, so the specials of the future and the
  overtime rules decide many of them.
- The bots undersell De Zuidas late in a match. Its strength, in the owner's words, is "using the
  special right before gouden handdruk goes down": during the Succesfee the 1320 the enemy would earn
  for beating the Handdruk is paid to De Zuidas instead. The bots now time it that way, but they almost
  never get a super unit out: in 100 mixed matches De Zuidas' bot never once held the 3300, and the
  others fielded one in a few. So the trick never happens in bot matches, and how much it is worth
  between people is not measured.

## The factions

### 1. De Zuidas

Bankers, corporate lawyers and consultants: your "rich capitalists", as a type. In 1975 the Zuidas did not
exist yet, so the faction starts on the floor of the Amsterdam stock exchange and in the private banks on
the canals, and ends up in the cloud.

| | |
|---|---|
| Code name | `zuidas` (ids start with `za.`) |
| Home | De Zuidas |
| Money | bonussen |
| Colours | Suit blue, mirror-glass teal, gold |
| Flag | Navy pinstripe with a gold line that only goes up: the house flag of Krijtstreep & Zn., a firm that does not exist |
| Names | The job and sometimes a first name: De hoekman, Bodywarmer-Bas, Mr. Declarabel |
| When it wins | "De Zuidas wint! Dat nemen we mee in de kwartaalcijfers." |
| Super unit shrugs off a special with | "Dat loopt via Legal." |

**What makes them recognizable**

- The blue suit without a tie, with a bodywarmer over it and a lanyard round the neck.
- Glass towers, mocked as "spiegelpaleizen".
- The vrijmibo, the Friday drinks, with bitterballen.
- Office language. The yearly polls of "jeukwoorden" have made it a national joke.
- Billable hours: the "urenfabriek", where time is written "met een vork".
- The pecking order from stagiair to partner.
- The lease car, and the building site that never ends: the tunnel next door is now due in 2037.

**Corrections the research made to my first sketch**

- The trader shouting in a coloured jacket belongs to the options exchange, which opened in 1978. The
  stock floor of 1975 was suits, pencils, a gong, and the card game toepen in the slow hours.
- The roles that are well documented are the hoekman (who stood in a fixed corner and made the price),
  the jongste bediende and the couponknipper, rather than notaries.
- The first three women got a pass for the floor in early 1975. One of the 1975 units is therefore a
  woman with a brand-new pass, which is both right and a better joke than the period's own.

**1975: the exchange floor**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `jongste_bediende` | De jongste bediende | Sixteen, a suit two sizes too big, the square button of a junior clerk, and a floor pass she got last week. Swats with her beursboekje | humanoid |
| Ranged | `de_hoekman` | De hoekman | Stands in his corner and makes the price. Throws needle-sharp pencils | humanoid |
| His projectile | `shot_potlood` | | A pencil with a coloured price slip stuck on it | static |
| Heavy | `directiewagen` | De directiewagen | A long black saloon with a chauffeur in a cap. The director sits in the back behind a cloud of cigar smoke | vehicle |
| Schild | `de_brandkast` | De brandkast | A cashier in a dustcoat pushing a safe on a sack truck. Turrets aim at it and hear only "tink". When he wheels it home the door hangs open and it is empty | humanoid |
| Turret | `turret_societeit` | De Sociëteit | Two members in leather armchairs playing toepen, and a waiter in tails. They flick cards | static |
| Its projectile | `shot_speelkaart` | | A playing card, spinning | static |
| Special | `special_gong` | De gong | The gong that opens trading, and a rain of price slips. See below | static |
| Base | `base` | | A canal-house bank on the Gouden Bocht: a brass plate, a marble hall behind the door, a telex in the window | static |

Special, **De gong** (buff): one stroke and trading opens. Own units hit harder and move faster for seven
seconds.

**2025: the mirror palace**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `bodywarmer_bas` | Bodywarmer-Bas | Suit trousers, white trainers, bodywarmer, lanyard, a tray of takeaway coffees. Swings his laptop bag | humanoid |
| Ranged | `mr_declarabel` | Mr. Declarabel | A lawyer in gown and bands. Every six minutes are billable, and every invoice leaves as a paper plane | humanoid |
| His projectile | `shot_factuur` | | An invoice folded into a plane | static |
| Heavy | `leasebak` | De Leasebak | A fat electric car with a ski box on the roof. The partner inside is on a call | vehicle |
| Schild | `de_disclaimer` | De Disclaimer | A compliance officer behind a wall of fine print, with an asterisk. No rights can be derived from turrets | humanoid |
| Turret | `turret_vrijmibo` | De Vrijmibo | Three colleagues on the roof terrace on a Friday afternoon. They lob bitterballen that are still far too hot | static |
| Its projectile | `shot_bitterbal` | | A steaming bitterbal on a cocktail stick | static |
| Special | `special_overname` | Vijandige overname | A giant rubber stamp, a lanyard and a blue jacket. See below | static |
| Base | `base` | | Het Spiegelpaleis: a glass tower with a revolving door and a roof terrace, behind a builder's fence that never goes away | static |

Special, **Vijandige overname** (convert): the toughest enemy unit on the lane is bought. A stamp comes
down on it, it turns round where it stands and fights for you with the hit points it has left. From then
on it wears a keycord in your colours over its head. It still mutters in its own dialect when it is beaten.

**2050: in the cloud**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `stagebot` | De Stagebot | An intern on wheels with a lanyard and a coffee. Unpaid, as the sticker on its back shows | humanoid |
| Ranged | `cryptobro` | De Cryptobro | Hoodie under a jacket. Throws coins that vanish in a puff before they are worth anything | humanoid |
| His projectile | `shot_token` | | A glowing coin that flickers | static |
| Heavy | `vergaderpod` | De Vergaderpod | A self-driving glass meeting room. The meeting inside has been going on for years | vehicle |
| Turret | `turret_kwartaalcijfers` | De Kwartaalcijfers | Three analysts round a floating dashboard. They throw wedges of pie chart | static |
| Its projectile | `shot_taartpunt` | | A wedge of pie chart | static |
| Special | `special_succesfee` | De Succesfee | A fee (fairy) in krijtstreep on a cloud, with a wand and an open case the coins fly into. See below | static |
| Base | `base` | | The Spiegelpaleis grown up into the clouds. The builder's fence is still there | static |
| **Super unit** | `gouden_handdruk` | De Gouden Handdruk | A colossal golden hand in a pinstriped cuff that walks on its fingers. It flattens by shaking hands, and when beaten it drifts off under a golden parachute | free |

Special, **De Succesfee** (divert): for five seconds everything the enemy earns is paid to you instead,
their income and what they get for beating units. The name is a pun that only works in Dutch: a *fee* is a
fairy, and a *succesfee* is what a consultant charges when things go well. She floats beside your base for
as long as it lasts, coins fly out of the enemy's purse into her case, and the enemy's purse says where
its money is going.

Until 23 November 2026 this was Flitskrach, a wave. A first version of the new special was called
Brievenbusfirma and drawn as a letterbox; that was dropped before it shipped, because letterbox companies
are on the list below.

**Lines**

| Era | Walking out | Beaten |
|---|---|---|
| 1975 | "Bieden!" · "Laten!" · "Aan jou!" · "Liever te duur dan niet te koop!" | "Gedaan… en laten." · "Hoogachtend," · "De beurs is gesloten." · "Ik ga toepen." |
| 2025 | "Even sparren?" · "Laaghangend fruit!" · "Alle neuzen dezelfde kant op!" · "We gaan je onboarden." | "Ik koppel het nog terug." · "Onder voorbehoud van alle rechten." · "Dat was niet declarabel." · "Vrijmibo?" |
| 2050 | "Deep dive!" · "Stip op de horizon!" · "Dit schaalt." · "To the moon!" | "Koers gekelderd." · "Verbinding verbroken." · "Wachtwoord kwijt." · "Ik koppel het nog terug." |

**Stay away from**

- Every real bank, law firm, accountant and trading house. Ours is "Krijtstreep & Zn., Bankiers".
- Real people, including the faces on old guilder notes: banknotes in the drawings have blank ovals.
- Brands for the networking site, the slide software, the sticky notes, the electric car and the designer
  bike. Ours are "KoppelIn", "het deck" and "geeltjes".
- The nickname of one particular real tower, and the bull statue on the Beursplein.
- Cocaine, which is the commonest Zuidas joke in Dutch satire and stays out, along with real lay-offs,
  bail-outs, mis-selling scandals, letterbox companies and anything about harassment. Burn-out only gently.

**Open questions**

- **De Zuidas and De Ambtenarij share office humour** (meetings, mute, jargon). I have kept them apart by
  giving the Zuidas everything about money and the Ambtenarij everything about procedure. If you build
  both, tell me if they still feel too alike.
- "To the moon!" is English. So is half of what is said on the Zuidas, which is the joke; say so if you
  would rather keep the lines Dutch.

### 2. Carnaval

The carnival of the south: Brabant and Limburg, four days a year and all year in the heart. The faction
that is pure party.

| | |
|---|---|
| Code name | `carnaval` (ids start with `cv.`) |
| Home | Hossegat, a carnival town that does not exist |
| Money | consumptiemunten |
| Colours | Red, yellow and green, with the blue of the boerenkiel |
| Flag | Red, yellow and green bands with our own emblem: a sousaphone |
| Names | What they do: De Hosser, De Sousafonist, De Confettischutter |
| When it wins | "Carnaval wint! Alaaf! En nou allemaal de polonaise." |
| Super unit shrugs off a special with | "Agge mar leut et!" |

**What makes them recognizable**

- The blue boerenkiel with the red farmer's handkerchief, covered in sewn-on emblems.
- Prins Carnaval: the two-pointed hat with pheasant feathers, the sceptre, the chain of medals.
- Eleven, the fools' number: the Raad van Elf, and the season that opens on 11-11 at 11:11.
- The optocht with praalwagens: giant papier-mâché figures on carts behind a tractor, built in barns.
- The dweilorkest: sousaphone, trombones and a drum, from pub to pub.
- The polonaise and hossen, the picture the whole country knows.
- "Alaaf!" with the salute the wrong way round, confetti, serpentines.
- Beer with a worstenbroodje in Brabant or a nonnevot in Limburg, and herring when it is over.

**Corrections the research made to my first sketch**

- "Houdoe" is the everyday Brabant goodbye, not a carnival cry. It is now what a beaten unit says.
- The polonaise is not done everywhere: Bergen op Zoom and Venlo refuse it. One purist in the faction
  mutters "Doen we hier niet."
- Brabant and Limburg celebrate differently and people there mind the difference. **Decided: the faction
  mixes them anyway.** To the rest of the country it is all the same carnival, and that they mind is the
  joke. It stays a small joke: a kiel next to Limburg colours, a worstenbroodje next to a nonnevot, and now
  and then a unit that mutters about it.

**1975: karnaval, with a K**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `de_hosser` | De Hosser | Plain kiel, red handkerchief, beer mats pinned on as medals. Hosses in belly first | humanoid |
| Ranged | `sousafonist` | De Sousafonist | Blows oompah and confetti out of the bell | humanoid |
| His projectile | `shot_hoempa` | | A fat note trailing confetti | static |
| Heavy | `praalwagen` | De Praalwagen | A farm tractor pulling a papier-mâché float with a giant nodding jester's head | vehicle |
| Schild | `de_grote_trom` | De Grote Trom | The bass drummer of the hofkapel, drum first. Every shot is one more boom, in time | humanoid |
| Turret | `turret_pronkzitting` | De Pronkzitting | A tonprater in his barrel between two council members in feathered hats, behind a table of beer mugs | static |
| Its projectile | `shot_bierviltje` | | A beer mat, spinning | static |
| Special | `special_polonaise` | De Polonaise | A conga line of revellers, hands on shoulders. See below | free |
| Base | `base` | | The brown café that is the club's residence: paper garlands, a banner, the town sign with its carnival name | static |

Special, **De Polonaise** (wave): the line sweeps the whole lane and bumps every enemy unit once.

**2025: the party tent**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `bananenpak` | Het Bananenpak | The visitor from above the rivers, in a banana suit, shouting Alaaf in the wrong town | humanoid |
| Ranged | `confettischutter` | De Confettischutter | Emblem jacket, ski goggles, a confetti cannon under the arm | humanoid |
| Their projectile | `shot_confetti` | | A burst of confetti and one serpentine | static |
| Heavy | `zuipwagen` | De Zuipwagen | A closed box of loudspeakers behind an enormous tractor, with the compulsory fence around it | vehicle |
| Schild | `verkeersregelaar` | De Verkeersregelaar | A volunteer in an orange vest carrying a crowd barrier. He did the online course and takes it very seriously | humanoid |
| Turret | `turret_vipdeck` | Het VIP-deck | Two guests with wristbands and a bouncer, on the raised deck of the tent. They throw drink tokens | static |
| Its projectile | `shot_munt` | | A consumptiemunt | static |
| Special | `special_kanonschoten` | Elf Kanonschoten | A row of confetti cannons. See below | static |
| Base | `base` | | The party tent on the market square: gates, lockers, a queue, a row of portable toilets | static |

Special, **Elf Kanonschoten** (barrage): eleven shots, one after another, each on the foremost enemy unit.

**2050: the dome**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `tijdslot_hosser` | De Tijdslot-hosser | Smart kiel with glowing emblems, a wristband to scan, alcohol-free beer on a chain | humanoid |
| Ranged | `robo_tonprater` | De Robo-tonprater | A joke robot in a barrel that fires bad puns as speech balloons | free |
| Its projectile | `shot_mop` | | A speech balloon with a rimshot in it | static |
| Heavy | `zelfrijdende_praalwagen` | De Zelfrijdende Praalwagen | An electric float wrapped in fences and airbags, with a hydraulic jester | vehicle |
| Turret | `turret_laatste_raad` | De Laatste Raad van Elf | Three ancient council members on mobility scooters beside a flickering hologram prince | static |
| Its projectile | `shot_medaille` | | An antique medal on a ribbon | static |
| Special | `special_kater` | De Kater | Herring raining down and a grey morning light. See below | static |
| Base | `base` | | De Carnavalskoepel: a climate-controlled dome with turnstiles and a time-slot board | static |
| **Super unit** | `reuzenprins` | De Reuzenprins | A walking float in the shape of the prince: feathered hat, sceptre for a club, confetti cannons in the cape, and eleven little windows in the belly where the Raad van Elf pulls the levers | humanoid |

Special, **De Kater** (slow): the morning after. Enemy units crawl for eight seconds; they can still fight.

**Lines**

| Era | Walking out | Beaten |
|---|---|---|
| 1975 | "Alaaf!" · "D'n Elfde van d'n Elfde!" · "Vastelaovend!" · "Wa trekte aon?" | "Houdoe!" · "Zund!" · "Dat is Limburgs!" · "Doen we hier niet." |
| 2025 | "Alaaf!" · "Salaai!" · "Koekwaus!" · "Bovensloter!" | "Houdoe!" · "Zund!" · "De tent is vol." · "Dat is Brabants!" |
| 2050 | "Alaaf!" · "Sjoenkelen!" · "Agge mar leut et!" · "Tijdslot elf uur elf!" | "Houdoe!" · "Accu leeg. Zund!" · "Hieringe biete." · "Zoepe is zoepe." |

**Stay away from**

- The emblems and figures of real carnival associations: the frog, the jug and its figure, the rooster,
  the market woman, the pepper pot. Our emblems are invented.
- Real carnival town names (they belong to real foundations) and the names of real princes. "Hossegat"
  is not on the list of existing names.
- Beer brands, the herbal liqueur in the jug, broadcasters' carnival shows, and song titles or lyrics as cries.
- Costumes from the racism debate. Ours are animals, fruit, clowns, lampshades and lace curtains.
- Real politicians on the floats, the 2020 carnival and the virus, floods, accidents with floats, drunk
  children, and jokes about groping.

**Open questions**

- The banana suit mocks visitors from the north, which is to say most of the people who will play this.
  I think that is the joke. Agreed?

### 3. De Friezen

Fryslân: proud, stubborn, and still waiting for ice. The teasing here is the kind Frisians do themselves.

| | |
|---|---|
| Code name | `friezen` (ids start with `fr.`) |
| Home | Fryslân |
| Money | melkgeld |
| Colours | The blue and white of the flag, with the red of the pompeblêden |
| Flag | The Frisian flag, redrawn: four blue and three white diagonal stripes and seven red pompeblêden. They are water-lily leaves; the official description says they "may not be hearts" |
| Names | Frisian first names and family words: Sietse, Tjitske, Pake, Beppe |
| When it wins | "De Friezen winnen! It giet oan!" |
| Super unit shrugs off a special with | "Bûter, brea en griene tsiis!" |

**What makes them recognizable**

- The flag.
- The Elfstedentocht: 199 kilometres on natural ice, famous because it almost never happens. Fifteen
  times since 1909, the last one in 1997.
- A language of their own, bilingual signs, and the old password: "Bûter, brea en griene tsiis; wa't dat
  net sizze kin, is gjin oprjochte Fries."
- Fierljeppen: a sprint, a leap onto a pole standing in the ditch, a climb while it tips over, and a
  landing in the sand or the water.
- Skûtsjesilen: flat-bottomed cargo barges with brown sails, racing on the lakes.
- The black Frisian horse, dairy cows, and kaatsen in teams of three.
- The farm on a terp, with swans on the ûleboerd.
- Sûkerbôle, dúmkes and berenburg.

**Corrections the research made to my first sketch**

- "It giet oan" was said on 2 January 1997. It cannot be shouted in 1975; it is the special of 2025.
- The kaatser is the natural ranged unit, and the tour skater deserves to be a unit, not only a special.
- In 1975 there had been no tocht for twelve years, and nobody knew whether there would ever be one
  again. That is the mood of the first era.

**1975: waiting for ice**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `fierljepper` | De Fierljepper | Shorts and a wooden pole. Arrives feet first. When beaten he slides down the pole into the ditch | humanoid |
| Ranged | `opslagger` | De Opslagger | A kaatser in whites who serves small hard balls | humanoid |
| His projectile | `shot_keatsbal` | | A kaatsbal | static |
| Heavy | `melkrijder` | De Melkrijder | A flat cart piled with milk churns that roll off like bowling balls | vehicle |
| Schild | `baanveger_bauke` | Baanveger Bauke | Pushes a wide wooden snow scraper ahead of him, sweeping a track that is not frozen yet | humanoid |
| Turret | `turret_leugenbank` | De Leugenbank | Three old men in caps on the liars' bench, each one sure he finished in '63. They flick dúmkes from a biscuit tin | static |
| Its projectile | `shot_dumke` | | A thumb-sized biscuit | static |
| Special | `special_winter63` | De winter van '63 | Pake starts telling, and the blizzard of the last tocht comes back. See below | static |
| Base | `base` | | A kop-hals-romp farm on a terp: swans on the ûleboerd, a stand for the churns, and someone painting the Frisian name under the Dutch one on the village sign | static |

Special, **De winter van '63** (slow): drifting snow and eighteen below. Enemy units crawl for eight
seconds; they can still fight.

**2025: it giet oan**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `de_kluner` | De Kluner | A tour skater crossing dry land on his skates, stamp card on a string round his neck | humanoid |
| Ranged | `bakker_tjitske` | Bakker Tjitske | Lobs loaves of sûkerbôle, sticky with sugar | humanoid |
| Her projectile | `shot_sukerbole` | | A sugar loaf | static |
| Heavy | `skutsje` | It Skûtsje | A racing barge on a boat trailer. The crew hangs over the high side and the leeboard slams down | vehicle |
| Schild | `koek_en_zopie` | Beppe's Koek-en-zopie | Beppe behind her stall on runners, striped awning and all. What is thrown at her lands in the pea soup | humanoid |
| Turret | `turret_brugwachter` | De Brugwachter | A bridge keeper on a raised drawbridge who swings the toll clog on its rod, with two anglers beside him | static |
| Its projectile | `shot_klompje` | | The little clog that collects the bridge toll | static |
| Special | `special_it_giet_oan` | It giet oan! | A man in a fur hat says the words, and a crowd of tour skaters comes through. See below | free |
| Base | `base` | | A stjelp with its long hipped roof, a robot barn, one village wind turbine and a bilingual sign | static |

Special, **It giet oan!** (wave): the skaters sweep the whole lane and hit every enemy unit once.

**2050: artificial ice**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `zweefschaatser` | De Zweefschaatser | Hover-skates and a full tour outfit. Has never seen a frozen ditch | humanoid |
| Ranged | `keatskanon` | It Keatskanon | A ball-serving machine, fed by a veteran in whites who does not trust it | vehicle |
| Its projectile | `shot_keatsbal` | | A kaatsbal, faster | static |
| Heavy | `zweefskutsje` | It Sweefskûtsje | A barge that hovers, with a solar sail and its leeboards as skids | vehicle |
| Turret | `turret_ijscommissie` | De IJscommissie | Three wardens with a laser gauge on a refrigerated ledge. It reads one millimetre short. They throw ice cubes | static |
| Its projectile | `shot_ijsblokje` | | An ice cube | static |
| Special | `special_kunstijs` | Kunstijs | A cooling grid under the road. See below | static |
| Base | `base` | | Terp 2.0: a freshly raised mound with the sea all round, an amphibious farm and an ice dome on top | static |
| **Super unit** | `de_grutte` | De Grutte | A nameless giant with a sword taller than a man. He asks everyone the password and lets nobody by who cannot say it | humanoid |

Special, **Kunstijs** (stun): the whole field is flash-frozen. Enemy units can neither walk nor fight for
five seconds.

**Lines**

| Era | Walking out | Beaten |
|---|---|---|
| 1975 | "Fryslân boppe!" · "Bûter, brea en griene tsiis!" · "Flean op!" · "Tuike tuike!" | "Hawar." · "It kin net oars." · "Oant sjen!" · "It giet net oan." |
| 2025 | "It giet oan!" · "It sil heve!" · "Tsjoch!" · "Fryslân boppe!" | "It giet net oan." · "Hawar." · "Blinder!" · "Oant sjen!" |
| 2050 | "It giet oan!" · "Flean op!" · "Tsjoch!" · "Suvel op suvel dat bringt de duvel." | "Veertien komma negen centimeter." · "Hawar." · "It kin net oars." · "Oant sjen!" |

**Stay away from**

- The bitter with the protected spelling and its brand names. Ours is "berenburg" with an invented label,
  "Pakebitter".
- The name, the logo and the cross medal of the Elfstedentocht association, which forbids their use.
  Ours is "De Tocht" with a medal of our own design.
- Sneekweek, the ice stadium, the regional broadcaster, club kits and the "Praat mar Frysk" sticker.
- Real people: chairmen, winners, weathermen. The folk hero the password is attributed to was a real
  rebel and is now also a brewery; De Grutte has no name.
- "Leaver dea as slaef", which was used in Nazi propaganda.
- Hearts on the flag, calling Frisian a dialect, made-up Frisian, and jokes about backward farmers.
- Lapwing eggs, protest imagery, and horses stranded by a flood.

**Open questions**

- The spellings were checked against Frisian and Dutch sources, but four lines ("Fryslân boppe!", "It
  giet net oan.", "Blinder!", "It Sweefskûtsje") are my own or unverified. **Decided: no proofreading by a
  native speaker.** The faction ships with the lines as they are.
- **The super unit.** De Grutte nods at the legend without naming anyone. The alternative from the
  research is Mega-Mem, a colossal robot cow on her own hovering roundabout, which is funnier but close
  to the Achterhoek's robot cow. Which one?

### 4. Rotterdam

The port city with its sleeves rolled up, and Amsterdam's natural rival: "In Rotterdam wordt het geld
verdiend, in Amsterdam wordt het uitgegeven."

| | |
|---|---|
| Code name | `rotterdam` (ids start with `rt.`) |
| Home | De haven |
| Money | havengeld |
| Colours | The green and white of the city flag, with container orange |
| Flag | Three bands, green, white, green: the city's own flag since 1949, redrawn |
| Names | First names from the quay: Bootwerker Aad, Sjaak, Gabber Gerrie, Sjaan |
| When it wins | "Rotterdam wint! Niet lullen maar poetsen." |
| Super unit shrugs off a special with | "Niet lullen!" |

**What makes them recognizable**

- The port: cranes, stacks of containers, tugs.
- "Niet lullen maar poetsen", and the joke that shirts are sold here with the sleeves already rolled up.
- The kapsalon in its aluminium tray. It dates from 2003, so it cannot appear in 1975.
- The sport of giving every new building a nickname: De Zwaan, De Hef, De Koopgoot, Het Potlood.
- The tilted cube houses and the horseshoe-shaped market hall.
- 010 against 020.
- The dialect: hebbie, bakkie pleur, "ken" for "kan".
- Gabber, born here in the early nineties, danced by "hakken".

**The running joke across the eras:** the dock worker disappears. In 1975 he carries the sack himself, in
2025 he holds a joystick, in 2050 a robot does it. The bragging stays exactly the same.

**1975: the quay**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `bootwerker_aad` | Bootwerker Aad | Flat cap, rolled sleeves, a cargo hook. Hands out a "Rotterdamse fooi" | humanoid |
| Ranged | `sjaak_de_sjouwer` | Sjaak de Sjouwer | Carries a sack on each shoulder and hurls them one at a time | humanoid |
| His projectile | `shot_baal` | | A jute sack | static |
| Heavy | `straddle_carrier` | De Straddle Carrier | One of the first, tall on its legs with a single container underneath, dripping oil | vehicle |
| Schild | `lasser_leen` | Lasser Leen | A shipyard welder, mask down, carrying the steel plate he was about to weld. Shots only make sparks | humanoid |
| Turret | `turret_schaft` | De Schaft | Three dock workers on a stack of crates during their break. They throw their lunch tins | static |
| Its projectile | `shot_broodtrommel` | | A dented lunch tin | static |
| Special | `special_mouwen` | Mouwen opstropen! | A giant pair of rolled-up sleeves over the quay. See below | static |
| Base | `base` | | A harbour shed with a quay crane, and a mast tower with a crow's nest behind it | static |

Special, **Mouwen opstropen!** (buff): own units hit harder and move faster for seven seconds.

**2025: Maasvlakte**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `gabber_gerrie` | Gabber Gerrie | Shaved head, plain tracksuit, no longer young. Hakt at 180 beats a minute and kicks while he is at it | humanoid |
| Ranged | `kapsalonkoerier` | De Kapsalonkoerier | A delivery rider with an insulated bag who flings aluminium trays | humanoid |
| Their projectile | `shot_kapsalon` | | A tray trailing garlic sauce | static |
| Heavy | `agv` | De AGV | A driverless container carrier. Its "driver" rides along on top, at a desk with a joystick and a coffee | vehicle |
| Schild | `bouwvakker_ben` | Bouwvakker Ben | Yellow helmet, a formwork panel on his shoulder, a permit stapled to it. The city is never finished, so he is always on his way somewhere | humanoid |
| Turret | `turret_kubuswoning` | De Kubuswoning | A tilted cube house. Everything in it slides, so the people who live there throw the furniture out | static |
| Its projectile | `shot_stoel` | | A kitchen chair | static |
| Special | `special_container` | De container | A sea container on a crane hook. See below | static |
| Base | `base` | | A horseshoe-shaped market hall with flats in the arch, and a stack of containers next to it | static |

Special, **De container** (block): a container comes down in front of the enemy's foremost unit. Whoever
is under it is hurt, and nobody gets past it for five seconds.

**2050: the floating city**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `poetsrobot` | De Poetsrobot | A cleaning robot delivered with its sleeves already rolled up. It keeps announcing that it does not talk | humanoid |
| Ranged | `stapelaar_sjaan` | Stapelaar Sjaan | The last human on the quay, in a lifting harness. Stacks parcel-sized containers and throws them | humanoid |
| Her projectile | `shot_kistje` | | A container the size of a shoebox | static |
| Heavy | `drijvende_wijk` | De Drijvende Wijk | A slab of floating neighbourhood under sail, city beach included | free |
| Turret | `turret_laatste_ploeg` | De Laatste Ploeg | The port's last three people in a control cabin. They throw joysticks and coffee cups | static |
| Its projectile | `shot_joystick` | | A joystick | static |
| Special | `special_kering` | De kering sluit | Two enormous barrier arms. See below | static |
| Base | `base` | | A tower of cubes and containers on a pontoon | static |
| **Super unit** | `de_kraan` | De Kraan | A quay crane that got up and walked. It lifts whatever is in front of it and drops it again | free |

Special, **De kering sluit** (wave): the arms of the storm barrier swing across the field and hit every
enemy unit once.

**Lines**

| Era | Walking out | Beaten |
|---|---|---|
| 1975 | "Niet lullen maar poetsen!" · "Hard voor weinig, maar nooit chagrijnig." · "Grote muil, dikke lip!" · "Hebbie in je nest gezeken?" | "Ik ga kas." · "Aftaaien!" · "Effe een bakkie pleur." · "Opzouten!" |
| 2025 | "Das gers!" · "Da's kaassie." · "Krotenkoker!" · "Pleuren!" | "De bietenbrug op." · "'t Hoekie om." · "Ik ga kas." · "Aftaaien!" |
| 2050 | "Ik praat niet, ik poets." · "Mouwen zijn al opgerold." · "Das gers!" · "Niet lullen maar poetsen!" | "Accu leeg. Aftaaien." · "'t Hoekie om." · "Ik ga kas." · "De bietenbrug op." |

**Stay away from**

- The football club and everything around it: the stadium, the colours, the songs. "Geen woorden maar
  daden" is the club song, which is why the faction's motto is the other one.
- Real people: the singing crane driver, the poet of the money saying, mayors, the man the kapsalon is
  named after.
- Logos and liveries of shipping lines, terminals, tugs and water taxis, the fries chain, and gabber
  sportswear. Ours is "Nultien Lines".
- The swan bridge, the market hall's ceiling and the statue with the nickname are designs and artworks
  with owners. Buildings are stylised until only the idea is left; the statue stays out.
- The bombing of 1940, the memorial, and the motto that came out of it.
- The slurs that Rotterdam word lists also contain, and swearing with diseases. "Pleur" is as far as it goes.

**Open questions**

- **The super unit.** A walking quay crane is safe and reads at once. The better-known silhouette is the
  swan bridge unfolding into a mechanical swan, but that bridge's design is claimed by its architect. I
  have gone for the crane; say so if you want the swan, heavily stylised.
- Sjaak throws sacks rather than the boiled beets a "krotenkoker" would, because the Achterhoek already
  throws beets in the same era.

### 5. De Toeristen

Everyone's shared enemy: on the bike path, in the tulip field, behind an umbrella. They are types of
visitor, never nationalities: no flags, no accents, no football shirts.

| | |
|---|---|
| Code name | `toeristen` (ids start with `tr.`) |
| Home | Overal vandaan |
| Money | wisselgeld |
| Colours | Guidebook yellow, postcard-sky blue, souvenir orange |
| Flag | The guide's pennant: yellow with a red umbrella |
| Names | A thing and a first name: Rolkoffer-Rita, Selfiestick-Steve, Rugzak-Robin |
| When it wins | "De Toeristen winnen! Five stars, would visit again." |
| Super unit shrugs off a special with | "Sorry, no Dutch!" |

**What makes them recognizable**

- The wheeled suitcase rattling over the cobbles.
- Standing on the bike path, or wobbling along it on a rented bike.
- The beer bike with a party in matching outfits. Amsterdam banned it from the centre on 1 November 2017.
- The phone on a stick, and climbing the giant city letters until they were taken away in December 2018.
- Walking into a tulip field for the photo. Growers put up banners and fences from 2019.
- An hour in a queue for fries that went viral.
- Shops for waffles, cheese, rubber ducks and clogs, and tulip bulbs that never come up.
- The group behind a guide's umbrella, arriving all at once by coach or cruise ship.
- Treating a village where people live as a theme park: skippers in Giethoorn really are asked what time
  it closes.

**Corrections the research made to my first sketch**

- Rita, the selfie stick and the beer bike belong to 2025 only. The wheeled suitcase did not exist yet in
  1975, and the beer bike dates from 1997.
- Shared electric scooters are not a Dutch street sight; rental bikes are.

**1975: the backpack summer**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `rugzak_robin` | Rugzak-Robin | Barefoot, with a frame backpack and a guitar. Swings a rolled-up sleeping bag | humanoid |
| Ranged | `flitsblokje_fien` | Flitsblokje-Fien | Sun hat, camera on a neck strap. Blinds you with the flash and then throws the spent cube | humanoid |
| Her projectile | `shot_flitsblokje` | | A flash cube | static |
| Heavy | `touringcar` | De Touringcar | Nine countries in seven days. A guide with a pennant leans out of the door | vehicle |
| Schild | `plattegrond_paula` | Plattegrond-Paula | Lost behind a fold-out city map the size of a tablecloth. Shots tear holes in it, which she does not notice | humanoid |
| Turret | `turret_parkslapers` | De Parkslapers | Three in sleeping bags under a no-sleeping sign. They throw their sandals without getting up | static |
| Its projectile | `shot_sandaal` | | A sandal | static |
| Special | `special_dia_avond` | De Dia-avond | A slide projector the size of a house and a screen full of holiday pictures. See below | static |
| Base | `base` | | A sleep-in hostel with a camp of tents in front | static |

Special, **De Dia-avond** (stun): everyone on the enemy side nods off for five seconds.

**2025: overtoerisme**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `rolkoffer_rita` | Rolkoffer-Rita | Drags the suitcase behind her and swings it round when someone is in the way | humanoid |
| Ranged | `selfiestick_steve` | Selfiestick-Steve | Looks at his phone on a stick, never at you, and throws stroopwafels like frisbees | humanoid |
| His projectile | `shot_stroopwafel` | | A stroopwafel, spinning | static |
| Heavy | `bierfiets` | De Bierfiets | A party in matching outfits pedalling a bar. It carries its own no-entry sign | vehicle |
| Schild | `paraplu_pam` | Paraplu-Pam | The guide of the free walking tour, bright umbrella held out in front so the group can follow. Everything bounces off it | humanoid |
| Turret | `turret_hyperij` | De Hype-rij | Three people behind a rope and a queue manager. They throw fries and never leave the queue | static |
| Its projectile | `shot_friet` | | A paper cone of fries | static |
| Special | `special_cruiseschip` | Cruiseschip legt aan | A ship taller than the base slides in behind it. See below | static |
| Base | `base` | | A leaning canal house: a duck-and-waffle shop below, a holiday let above with suitcases piled at the door and a key box on the railing | static |

Special, **Cruiseschip legt aan** (summon): eight day trippers pour out of the gate at once, outside the
queue. They are weak, and after twenty seconds the ship's horn calls them back.

**2050: the time slot**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `robokoffer` | De Robokoffer | A self-driving suitcase that has lost its owner. It rams shins | vehicle |
| Ranged | `eenster_eli` | Eénster-Eli | Smart glasses, rates everything, and throws one-star reviews as throwing stars | humanoid |
| Their projectile | `shot_ster` | | A single star | static |
| Heavy | `zweefbierfiets` | De Zweefbierfiets | Hovers just above the street it is banned from | vehicle |
| Turret | `turret_tijdslotpoortje` | Het Tijdslotpoortje | Three tourists stuck in the turnstiles. They throw their rejected tickets | static |
| Its projectile | `shot_ticket` | | A crumpled ticket | static |
| Special | `special_tijdslot` | Tijdslot verlopen | Barriers and a red light across the lane. See below | static |
| Base | `base` | | De Stadspoort: a ticket office with turnstiles and a board that shows the waiting time | static |
| **Super unit** | `ms_kolossaal` | MS Kolossaal | A cruise ship on caterpillar tracks with a buffet cannon | free |

Special, **Tijdslot verlopen** (lockout): the enemy's time slot has run out. For eight seconds they can buy
and train nothing, and their units stand at the barrier for three.

**Lines**

| Era | Walking out | Beaten |
|---|---|---|
| 1975 | "Twelve minutes, then back on the bus!" · "Where are the tulips?" · "Can you take our picture?" · "Donkey well!" | "My film is full!" · "We thought it was a park!" · "The bus is leaving!" · "Which way is the hostel?" |
| 2025 | "Is this the bike lane?" · "Do people actually live here?" · "Five stars!" · "Is this Holland or the Netherlands?" | "My suitcase! My suitcase!" · "What time does the village close?" · "One star, would not visit again." · "The ship leaves at five!" |
| 2050 | "Follow the umbrella!" · "Scanning…" · "Five stars!" · "Is this the bike lane?" | "Your time slot has expired." · "Battery low." · "One star." · "No signal." |

**Stay away from**

- Nationalities, in any form. The campaigns and newspaper stories single out particular countries; this
  faction does not.
- The city-slogan letters, which are a trademark. Ours are parody letters.
- The look of the sightseeing buses, the fleet colours of rental bikes, cruise-line liveries, booking and
  review platforms, the chocolate spread, the viral snack shops by name.
- The Dam, where the sleepers of 1970 camped at the war memorial: ours sleep in the park. The famous
  museum queue: ours is for fries. Comparisons between big ships and one that sank. Floods.
- The red-light district. The party on the beer bike is about beer and costumes.

**Open questions**

- The tourists speak English. Every other faction speaks Dutch or dialect. I think that is right for
  them; say so if you want mock Dutch instead ("Donkey well!" throughout).
- De Parkslapers are hippies, and so is half of Amsterdam's 1975 roster. They are different jokes (the
  visitor against the local), but if it feels like twice the same, the turret can become a postcard stand.

### 6. De Ambtenarij

Civil servants and their paperwork: the counter, the stamp, the form in triplicate. This faction is about
bureaucracy, not about politics. There is no minister, no party and no policy in it, only procedure.

| | |
|---|---|
| Code name | `ambtenarij` (ids start with `am.`) |
| Home | Het Ministerie van Formulieren (made up) |
| Money | belastinggeld |
| Colours | Filing-cabinet grey-blue, manila beige, stamp red |
| Flag | Grey-blue with a red stamp ring and the faction's mascot: a snail carrying a rubber stamp |
| Names | Ranks and job titles: De Bode, Commies Cor, Beleidsmedewerker Bert |
| When it wins | "De Ambtenarij wint! Uw nederlaag is in behandeling genomen." |
| Super unit shrugs off a special with | "Niet ontvankelijk!" |

**What makes them recognizable**

- The counter and taking a number, these days "alleen op afspraak".
- Stamps, and forms "in drievoud": typed with carbon paper, the copy is a "doorslag".
- "Van het kastje naar de muur", in Dutch newspapers since at least 1914, and "Dat is niet mijn afdeling".
- Coffee: first the koffiejuffrouw with her trolley, then the machine.
- Meeting language: bila, stuurgroep, "even parkeren", "stip aan de horizon".
- The inspraakavond, an invention of the 1970s that is now called participatie.
- "De ambtelijke molens malen langzaam."

**1975: the ministry**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `bode` | De Bode | Cap, dark suit, silver badge on his chest. Sprints with a circulation folder and slaps with it | humanoid |
| Ranged | `commies_cor` | Commies Cor | A clerk of the rank that really existed until the eighties. Sends every form off three at a time | humanoid |
| His projectile | `shot_drievoud` | | Three sheets fanned out, the carbon copies trailing | static |
| Heavy | `het_kastje` | Het Kastje | A steel filing cabinet on castors, pushed by two caretakers in dust coats. Its drawers shoot out to punch | vehicle |
| Schild | `de_portier` | De Portier | The doorman, who has brought his glass lodge along. When something comes his way he slides the hatch shut | humanoid |
| Turret | `turret_loket7` | Loket 7 | Three behind one counter: one eats a sandwich under a lunch sign, one stamps, one smokes. The shutter keeps dropping | static |
| Its projectile | `shot_stempel` | | A rubber stamp, spinning, leaving a red ring | static |
| Special | `special_inspraak` | Inspraakavond | Folding chairs, a squealing microphone, a slide projector. See below | static |
| Base | `base` | | A closed concrete block of the period with net curtains and ashtrays on the sills. Its front is De Muur, so units pushed back by Het Kastje really do go van het kastje naar de muur | static |

Special, **Inspraakavond** (lockout): for eight seconds the enemy can buy and train nothing, and their
units on the lane wait three seconds while everybody has their say.

**2025: the city office**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `trainee_tim` | Trainee Tim | Lanyard, pass, reusable cup. Uses the lanyard as a whip | humanoid |
| Ranged | `beleidsmedewerker_bert` | Beleidsmedewerker Bert | Laptop under one arm. "Schiet een vergadering in je agenda" | humanoid |
| His projectile | `shot_uitnodiging` | | A calendar block with a little bell | static |
| Heavy | `ict_project` | Het ICT-project | A half-built machine in scaffolding with hired consultants on top. It smokes, blinks red and arrives late | vehicle |
| Schild | `de_zwartlakker` | De Zwartlakker | Carries a released document the size of a door, blacked out almost completely, and a fat marker for whatever is still legible | humanoid |
| Turret | `turret_flexplek` | De Flexplek | Two colleagues fight over the one free desk; a third joins in on a screen. They throw headsets | static |
| Its projectile | `shot_headset` | | A headset, cord flapping | static |
| Special | `special_overleg` | Het Overleg | A meeting table with a flip-over that drops onto the lane. See below | static |
| Base | `base` | | A glass city office with turnstiles. Loket 7 is still there, now by appointment only | static |

Special, **Het Overleg** (stun): every enemy unit is pulled into a meeting and can neither walk nor fight
for five seconds. Someone is still on mute.

**2050: the cloud**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `doorverwijsbot` | Doorverwijsbot | A small counter robot whose one arm always points somewhere else. Hits with the arm | humanoid |
| Ranged | `aangetekende_drone` | De Aangetekende Drone | A postal drone that drops registered letters you have to sign for | free |
| Its projectile | `shot_aangetekend` | | An envelope with a red stripe | static |
| Heavy | `zelfinvullend_formulier` | Het Zelfinvullend Formulier | A walking form the size of a door that fills itself in and sheds smaller forms | free |
| Turret | `turret_hologrammen` | De Hologrammen | Three flickering counter clerks, each pointing at the next one | static |
| Its projectile | `shot_nummertje` | | A paper number ticket | static |
| Special | `special_doorverwijslus` | De Doorverwijslus | Arrows on the road that send everyone round in a loop. See below | static |
| Base | `base` | | The concrete block of 1975, floating on a cloud. Loket 7 has moved to the cloud | static |
| **Super unit** | `ambtelijke_molen` | De Ambtelijke Molen | A colossal windmill built of filing cabinets, with rubber stamps for sails. It grinds slowly, as the saying has it | free |

Special, **De Doorverwijslus** (slow): enemy units are referred onwards and crawl for eight seconds. They
can still fight.

**Lines**

| Era | Walking out | Beaten |
|---|---|---|
| 1975 | "Heeft u een nummertje getrokken?" · "In drievoud, alstublieft!" · "Regels zijn regels." · "U bent bij het verkeerde loket." | "Het is vijf uur geweest." · "Loket gesloten." · "Dat is niet mijn afdeling." · "Ik ga in bezwaar!" |
| 2025 | "Even parkeren." · "Je staat nog op mute!" · "Heeft u een afspraak?" · "Stip aan de horizon!" | "Dat staat niet in mijn functieomschrijving." · "Ik zit in een bila." · "Daar ga ik niet over." · "Thuiswerkdag." |
| 2050 | "Ik verbind u door." · "Uw aanvraag is in behandeling." · "Het systeem laat het niet toe." · "Kies één voor meer opties." | "Storing." · "Sessie verlopen." · "Probeer het later opnieuw." · "Loket 7 is verhuisd." |

**Stay away from**

- The purple crocodile. The expression comes from a 2004 insurance commercial and the animal is that
  advertiser's character. The snail with the stamp is ours.
- Lines and characters from Dutch office satire: Toonder's clerk, the television sketches, the cartoon
  form with a number. Our form is "Formulier 7-B".
- Real services, passes and logos, including the national logo and the stork from the arms of The Hague.
- The tax office, benefits, fraud detection and anything else that touches the benefits scandal. The 2050
  jokes stay with harmless referral loops, never with a machine deciding about people.
- The Binnenhof, mayors, aldermen, real ministries and real buildings. What the consultation evening is
  about stays trivial: the colour of the bike shed.

**Open questions**

- The lunch sign and the "by appointment only" sign are words in real life. Symbols (a sandwich, a clock,
  a calendar) keep the drawings free of lettering. Good enough, or should the signs carry text?
- Inspraakavond sits in 1975 because that is when it was invented. If you would rather have it in the era
  most matches are decided in, it can swap places with Het Overleg.

### 7. De Camping

The Netherlands on holiday: the caravan, the awning, and the neighbour who knows better.

| | |
|---|---|
| Code name | `camping` (ids start with `cp.`) |
| Home | Camping De Scheerlijn (made up) |
| Money | vakantiegeld |
| Colours | The orange and brown of a seventies windbreak, grass green, caravan white |
| Flag | Windbreak stripes in orange, brown and cream with a tent peg on them |
| Names | What they do on the camp site: De Haringklopper, De Jeu-de-boulesopa, De Wc-rolsprinter |
| When it wins | "De Camping wint! Tot volgend jaar, buurman!" |
| Super unit shrugs off a special with | "Wij zijn met vakantie!" |

**What makes them recognizable**

- The caravan on the tow bar, the "sleurhut".
- The walk to the toilet block with a roll under the arm, or on a string round the neck.
- The tracksuit that is called a campingsmoking, with socks in sandals.
- Food from home: coffee, peanut butter, hagelslag, and by reputation ten kilos of potatoes.
- The campingburgemeester: the regular who knows everything and inspects your tent from his folding chair.
- The awning as a living room, and the yearly pitch with a fence, a shed and a gnome.
- Jeu de boules, the washing-up tub, and quiet after ten.
- Zwarte Zaterdag on the road to the south, with eggs fried on a camping stove in the verge.

**Corrections the research made to my first sketch**

- **The voetbalvader is not a camping cliché.** Every source places him on the Saturday sideline of the
  amateur football club. **Decided: he is out of this faction** and kept as an idea of his own, for a
  football-club faction one day. His place is taken by Oma Pieper.
- The skottelbraai only turns up in Dutch camping vocabulary around 2000. It is the turret of 2025, not of 1975.
- The word "sleurhut" dates from the early nineties. It is fine as the name of a unit, but nobody says it
  in a 1975 speech balloon.
- Zwarte Zaterdag fits 1975 exactly: on Saturday 2 August 1975, in a heatwave, the jams added up to 600
  kilometres.

**1975: the road to the south**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `haringklopper` | De Haringklopper | Rubber mallet, a fistful of tent pegs, a tracksuit. Hits whatever sticks up | humanoid |
| Ranged | `boulesopa` | De Jeu-de-boulesopa | Measures first, with a folding rule, then throws a ball from the plastic set | humanoid |
| His projectile | `shot_boule` | | A boule | static |
| Heavy | `sleurhut` | De Sleurhut | A small round car, bulging, with suitcases on a sagging roof rack, an egg-shaped caravan behind it and a steaming radiator | vehicle |
| Schild | `windschermzetter` | De Windschermzetter | Walks behind a striped windbreak on wooden poles, looking for the one spot out of the wind | humanoid |
| Turret | `turret_bermtoeristen` | De Bermtoeristen | A family at a folding table in the verge of the motorway. They throw the eggs they were frying | static |
| Its projectile | `shot_spiegelei` | | A fried egg | static |
| Special | `special_zwarte_zaterdag` | Zwarte Zaterdag | Heat shimmer and a wall of caravans that barely moves. See below | vehicle |
| Base | `base` | | A bungalow tent of heavy cotton with a striped windbreak, a mug tree and a gas lamp | static |

Special, **Zwarte Zaterdag** (slow): the enemy is stuck in the jam. Their units crawl for eight seconds;
they can still fight.

**2025: the yearly pitch**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `wc_rolsprinter` | De Wc-rolsprinter | Campingsmoking, bath slippers, the roll under one arm and the phone held up for a signal. Swats with a wet towel | humanoid |
| Ranged | `oma_pieper` | Oma Pieper | Brought ten kilos of potatoes from home, because you never know what they eat there. Lobs them underhand | humanoid |
| Her projectile | `shot_pieper` | | A potato | static |
| Heavy | `witte_muur` | De Witte Muur | A motorhome the size of a bus with a satellite dish and two e-bikes on the back. It blocks everyone's view | vehicle |
| Schild | `luchtbedsjouwer` | De Luchtbedsjouwer | An air bed held upright, the foot pump under one arm. Every shot goes "pfff"; beaten, he carries it home deflated | humanoid |
| Turret | `turret_skottelbraai` | De Skottelbraai | Dad with the tongs, mum with the hot-air fryer, and the campingburgemeester giving advice. They throw speklapjes | static |
| Its projectile | `shot_speklap` | | A sizzling slice of pork belly | static |
| Special | `special_stil` | Na tienen is het stil! | The campingburgemeester in his dressing gown with a torch. See below | static |
| Base | `base` | | De Seizoenplaats: a static caravan with an awning, a fence, a shed and a gnome | static |

Special, **Na tienen is het stil!** (stun): it is after ten. Enemy units can neither walk nor fight for
five seconds.

**2050: the inflatable resort**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `haringrobot` | De Haringrobot | A small robot whose one job is hammering in pegs. It hammers in everything | humanoid |
| Ranged | `magneet_opa` | Opa met de Magneet | His boules fly back to the magnet on his string, so he never has to bend down | humanoid |
| His projectile | `shot_zweefboule` | | A boule with a blue glow | static |
| Heavy | `zelfrijdende_sleurhut` | De Zelfrijdende Sleurhut | It parks itself and levels itself. Dad still walks backwards in front of it shouting "HO!" | vehicle |
| Turret | `turret_vliegende_skottel` | De Vliegende Skottel | A hovering barbecue saucer with its crew in floating folding chairs | static |
| Its projectile | `shot_worst` | | A sausage | static |
| Special | `special_minidisco` | De Minidisco | The entertainment team, a glitter ball and one song on repeat. See below | static |
| Base | `base` | | Het Opblaasresort: an inflatable dome that sags a little every time it is hit | static |
| **Super unit** | `sleurhut_op_pootjes` | De Sleurhut op Pootjes | A colossal caravan walking on its corner steadies, awning for a shield, with the campingburgemeester on the roof with a megaphone | free |

Special, **De Minidisco** (buff): everybody joins in. Own units hit harder and move faster for seven seconds.

**Lines**

| Era | Walking out | Beaten |
|---|---|---|
| 1975 | "Staat ie een beetje waterpas?" · "Die scheerlijn moet strakker, buurman!" · "Kom maar, kom maar… HO!" · "Ligt je tentluier wel goed, buurman?" | "Kamperen is creperen." · "Nooit nat inpakken!" · "Wachten tot het ophoudt." · "Als de binnentent maar droog blijft." |
| 2025 | "Na tienen is het hier stil!" · "Heeft iemand wifi?" · "Die scheerlijn moet strakker, buurman!" · "Staat ie een beetje waterpas?" | "Tot volgend jaar, buurman!" · "Zijn we er al?" · "De stoppen zijn eruit." · "Kamperen is creperen." |
| 2050 | "Kom maar, kom maar… HO!" · "Hij parkeert zichzelf!" · "Staat ie waterpas?" · "Na tienen is het hier stil!" | "Lek." · "Accu leeg." · "Tot volgend jaar, buurman!" · "Zijn we er al?" |

**Stay away from**

- Every make of caravan, tent, stove and car, the motoring club with its yellow vans, the camp-site
  guides and the holiday-park chains. Ours are "de Bond" and "de Pechhulp", in another colour.
- "Airfryer", which is a brand name: it is a heteluchtfriteuse.
- Television programmes about camping and their presenters, a word for a certain kind of family that
  comes from a real one, and a well-known cabaret joke about lying crooked.
- Accidents. Boules never explode, and there are no crashes, gas bottles or wildfires.
- Jokes about caravan dwellers, and the joke about what other countries make of the NL sticker.

**Open questions**

- "Skottelbraai" began as a product name. The word is in general use on Dutch camp sites, but if you want
  to be safe the turret can be called De Braaischotel.

### 8. De Gastheren

Two families on one street, one Turkish-Dutch and one Moroccan-Dutch, over three generations. In 1975 the
fathers work night shifts in the metal works and the textile mills, "for two or three years". In 2025
their children and grandchildren, born here, run the barbershop, throw a wedding for 650 and ride a
fatbike. In 2050 the great-grandchildren still say that next year they are going back.

The owner's idea, of 23 November 2026, and their working title was **De Gastarbeiders**; the name became
De Gastheren (question 1 below). This is the first faction about where people's families come from rather
than a region, a trade or a way of life, so the bar is higher. The rule "no jokes about where someone comes
from" is kept and applied: **only jokes the two communities make about themselves**, in their own films,
theatre, books and community talk, told with affection. The table further down names the inside source
of every joke. What could only be sourced from outsiders was left out, and is listed as such, with one
exception the owner decided on: the fatbike kid's "Wat kijk je?", marked as such in the table.

**Two communities, not one.** Turkish-Dutch and Moroccan-Dutch families have their own languages, food,
music and weddings, and would mind being drawn as one. The faction keeps them apart unit by unit: each
unit belongs to one of the two families on the street, and the brief says which. Things they share, such
as tea and the summer drive south, are shown side by side, each in its own way.

**They are Dutch.** Nothing treats them as visitors. The people of 2025 and 2050 were born here, and the
running joke is exactly that: the plan to go back.

| | |
|---|---|
| Code name | `gastheren` (ids start with `gh.`); it follows the name, if another is chosen |
| Home | De straat: two families, one street (made up) |
| Money | spaargeld |
| Colours | Tea amber, mint green, the blue of a tiled wall, and the white of a wedding ribbon |
| Flag | A tile-blue field with a golden tea glass on a saucer and a white wedding ribbon across the corner: the flag of the street, of no country. No crescent, no star, no national red |
| Names | What they are in the family and on the street: De Nachtploeg, De Tolk, De Gastvrouw, De Blijver |
| When it wins | "De Gastheren winnen! Blijf je eten?" |
| Super unit shrugs off a special with | "Volgend jaar." |

**The running joke across the eras: next year we go back.** In 1975 the father came for two or three
years and crosses off the days on a calendar. In 2025 his son says the same about his pension, with the
roof rack loaded every summer. In 2050 his great-grandchildren say it too, and nobody ever goes. A man
who came in 1966 told the NOS: "I thought: I'll work in the Netherlands two or three years and then go
back." His grandson: "I feel Dutch."

**What makes them recognizable**, each from the inside:

- **The plan to go back.** The first workers meant to stay a year or two (a man who came in 1966, NOS
  2019; Nilüfer Öder in iAmsterdam, 2025). A mother in the same piece: "We blijven hier, dit is mijn
  wereld."
- **The summer drive south**, the car loaded inside and out, "un rituel annuel des Maroco-Néerlandais"
  (Bladi.net, a site by and for Moroccans abroad). Abdelkarim and Asma El-Fassi made a road movie of it,
  *Porte Bagage* (2025). A Moroccan-Dutch community list adds the minibus with curtains, and the father who
  visits twenty travel agencies with his notebook to write down the ferry prices. On the Turkish side the
  oral histories, gathered in Germany, tell of fridges, televisions and chocolates "like gold" on the way
  through Yugoslavia, and a 1979 novel by the Turkish-German writer Güney Dal has a blue bathtub strapped to
  the roof.
- **The child who translates for his parents**, and translates the teacher's remarks a little too kindly:
  the youngest son in *Shouf Shouf Habibi!*, co-written by Mimoun Oaïssa.
- **Hospitality.** At Moroccans', as in Limburg, you get food when you visit (Soundos El Ahmadi). Hospitality
  and food are what the first Turks brought along (Sahin Yildirim, NOS 2024). And saying goodbye takes
  another hour at the door (the community list).
- **The big wedding.** 650 guests, about average at a Rotterdam wedding hall, says a Turkish-Dutch bride
  (VPRO). The convoy honks "so everyone knows there is a wedding", and the family watches the film
  afterwards to see how long and how lively the line of cars was (Ibrahim Yerden, author of *Trouwen op z'n
  Turks*). "The more extravagant, the better," says a wedding planner from the community.
- **The barber**, where people come for the talk as much as for the cut, and ears are seen to as a matter
  of course (barbers in the Brussels Times; a father and son in Tilburg, Omroep Brabant).
- **Mothers**, played with love by their own children on stage and screen: Nasrdin Dchar plays his own
  mother in *Oumi*, and Soundos El Ahmadi made *Meskina* for more Moroccan-Dutch family on film.
- **The work.** The metal works of the Zaan and Hilversum, the textile mills of Almelo, the port and a
  chicken factory, in the words of the men who worked there (NOS 2019 and 2024).

**Where each joke comes from**

| What | Joke | From the inside | Family |
|---|---|---|---|
| De Nachtploeg, De Koffer, the lines "Twee jaar, dan terug" and "Volgend jaar" | The plan to go back | A first-generation worker and his grandson (NOS 2019); Öder and Halaceli (iAmsterdam) | Moroccan-Dutch (Koffer), Turkish-Dutch (Nachtploeg) |
| De Tolk | Translates the teacher a little too kindly | *Shouf Shouf Habibi!* (Oaïssa) | Moroccan-Dutch |
| De Imperiaal, De Zweefimperiaal | The roof rack | *Porte Bagage* (El-Fassi), Bladi.net; Turkish-German oral histories and Güney Dal | Turkish-Dutch |
| De Prijzenvader | Twenty travel agencies and a notebook | The Moroccan-Dutch community list | Moroccan-Dutch |
| Het Pension | Too many men to a room, and the night-shift alarm | The boarding houses in the workers' own accounts (NOS); the alarm clock is mine | both |
| Eerst thee, Het Theeterras | Tea for everyone | Drawn as what it is; hospitality from El Ahmadi and Yildirim | both, each its own tea |
| De Gastvrouw, "Eet eerst wat!", "Blijf je eten?" | You get food, whether you came for it or not | Soundos El Ahmadi | Moroccan-Dutch |
| De Blijver, "Ik ga zo, nog één ding." | Goodbye takes an hour at the door | The community list | Moroccan-Dutch |
| De Feestzaal, De Toeterstoet, De Trouwfilmer | 650 guests; honk so everyone knows; the family watches the film | VPRO; Yerden; Laroussi | Turkish-Dutch, and the convoy both |
| De Kapperszaak, De Kapbot | Come for the talk | Barbers in the Brussels Times; Omroep Brabant | Turkish-Dutch |
| Nee is nee | The mother's no | Mothers as their children play them: Nasrdin Dchar, *Meskina*. The look itself is mine | both |
| De Fatbike | Not a background joke at all | Every Dutch teenager; see the rule | the grandson |
| "Wat kijk je?" | The fatbike kid's cheek | **The owner's decision**, as a well-known line. My research found no inside source for it, only the outsiders' angry street kid. Here the fatbike kid says it, who belongs to no background: cheek, never a threat | the grandson |
| Mo-Tron | The worker of 1975 never stopped | The owner's name, softened from MohammedTron; the robot is mine, built on the plan to go back | both: "Mo" is what the street calls him |

**Corrections the research made to the owner's sketch**

- **Shoarma is not theirs.** The first shoarma shops in the Netherlands were opened by Israelis, and most
  were taken over by Egyptians within ten years (Onze Taal, 1988). The Dutch kind is mostly pork. "Shoarma
  Sadim" is out. Döner is Turkish, but no source says when it reached Dutch streets, so it is left out
  too. The kapsalon (Rotterdam, 2003) is in the Rotterdam brief and belongs to neither community.
- **The word "gastarbeider"** was made up around 1965 by a press-agency journalist who translated the
  German *Gastarbeiter* because it fitted a headline. The workers themselves objected even then: they did
  not feel like guests (Onze Taal, 1971). Hence the name question.
- **The fatbike belongs to no background.** Every source puts it with Dutch teenagers in general, from
  Velsen to Enschede, and the debate is about speed, tuning, helmets and age. In this faction that is the
  joke: the grandson of the man with the suitcase rides what every Dutch fifteen-year-old rides.
- **"Wat kijk je?"** could not be found anywhere as a joke the community makes about itself. It turns up
  as the outsiders' picture of the angry street kid, which this section stays away from. The owner kept
  it, as a well-known line, for the fatbike kid only. See question 2.
- **Honking after football** has no inside source, and the reporting on it is mostly about unrest. The
  convoy is a wedding convoy. See question 4.
- **"MohammedTron".** Mohammed is the commonest boys' name only when all its spellings are counted
  together (NOS); the popular-name lists put Noah first nationally and Adam first in Amsterdam and The
  Hague. Parents choose it after the Prophet, so the joke rests on a religious name, and no inside source
  jokes about it. The owner chose Mo-Tron. See question 3.
- **Left out because only outsiders tell it**, or nobody does: the mother's flying slipper (found only in
  an anonymous forum list, and it is a parent hitting a child), the cousin who can fix anything, sunflower
  seeds, the bakery, backgammon in the coffee house (the one 1976 drawing of a Turkish coffee house in The
  Hague is framed as the workers' hopelessness), the aunts' WhatsApp group (found only in Germany), and the
  wedding gold, the henna night and the bride's palanquin (found only in wedding-industry sources).

**1975: de fabriek en het pension**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `nachtploeg` | De Nachtploeg | Twenty, straight from the night shift at the metal works: blue overall, a lunch tin under his arm, a paper calendar in his breast pocket on which he crosses off the two years. Swings a spanner | humanoid |
| Ranged | `de_tolk` | De Tolk | Ten, in a school jumper, just over with his mother. He translates every letter for his father, and the teacher's remarks a little too kindly. Throws the brown envelopes back | humanoid |
| His projectile | `shot_envelop` | | A brown official envelope with a window | static |
| Heavy | `imperiaal` | De Imperiaal | A long boxy saloon without a badge and a roof rack twice its height: suitcases, a fridge, a television, rolled carpets and a blue bathtub, tied down with rope. 3000 kilometres every summer | vehicle |
| Schild | `de_koffer` | De Koffer | A man behind a suitcase as big as a wardrobe, belted shut, always packed for next year. Turrets go "tok" on it. Beaten, he sits on it, and it still does not close | humanoid |
| Turret | `turret_pension` | Het Pension | Three men in bunk beds in the window of a boarding house, under one bare bulb. The alarm for the night shift goes off, and they throw it | static |
| Its projectile | `shot_wekker` | | A ringing wind-up alarm clock | static |
| Special | `special_thee` | Eerst thee | A neighbour's tray with tulip glasses of Turkish tea and glasses of mint tea side by side. See below | static |
| Base | `base` | | Het Pension: a narrow brick house near the factory gate, too many beds behind every window, suitcases on the wardrobes, washing on a line across the top floor | static |

Special, **Eerst thee** (heal): before anything else, tea. A tray goes along the line, and every own unit on
the lane is patched up.

**2025: de bruiloft en de kapper**

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `de_blijver` | De Blijver | A guest at the front door with one arm in his coat, an hour into saying goodbye: "Ik ga zo, nog één ding." Swats with the other sleeve | humanoid |
| Ranged | `de_gastvrouw` | De Gastvrouw | Apron, sleeves rolled up, a stack of msemen on one arm. Nobody leaves her house hungry, whether they came to eat or not. Throws them flat, spinning | humanoid |
| Her projectile | `shot_msemen` | | A square folded pancake, spinning | static |
| Heavy | `fatbike` | De Fatbike | **A rider: cheap and fast, it rides through the enemy ranks and hits everything it passes. See below.** Fifteen, tyres as fat as a sofa cushion, a phone in one hand, a crossbody bag, a helmet hanging from his elbow | vehicle |
| Schild | `de_trouwfilmer` | De Trouwfilmer | The wedding cameraman behind a light panel the size of a door. Turrets bounce off the panel; he keeps filming, because the family will watch every minute of it | humanoid |
| Turret | `turret_kapperszaak` | De Kapperszaak | The barber and two men on the waiting bench, who came for the talk more than for the cut. They throw hot towels | static |
| Its projectile | `shot_handdoek` | | A rolled hot towel, steaming | static |
| Special | `special_toeterstoet` | De Toeterstoet | A line of cars with ribbons and balloons on the bonnets, honking. See below | vehicle |
| Base | `base` | | De Feestzaal: a wedding hall for 650 with fairy lights along the gutter, a red carpet at the door and a row of decorated cars waiting outside | static |

Special, **De Toeterstoet** (stun): a wedding convoy comes past, honking so that everyone knows. Enemy units
stop and watch it go by: for four seconds they can neither walk nor fight. The cars carry ribbons and
balloons in the faction's colours, never a national flag.

**2050: de achterkleinkinderen.** Mine, extrapolated from the jokes above; none of it is sourced.

| Slot | File | Name | What it is, and the joke | Rig |
|---|---|---|---|---|
| Light | `kapbot` | De Kapbot | A barber robot with four arms: trimmer, comb, mirror, and one free to gesture with, because it still wants to talk. Buzzes | humanoid |
| Ranged | `prijzenvader` | De Prijzenvader | The trip south takes forty minutes now, but he still visits twenty travel agencies (holograms) and writes every price in his notebook. Throws the tickets he did not buy | humanoid |
| His projectile | `shot_ticket` | | A glowing ticket stub | static |
| Heavy | `zweefimperiaal` | De Zweefimperiaal | The summer car of the future, hovering, with a roof rack higher than ever: suitcases, a fridge, a robot vacuum, and the blue bathtub, kept all these years | vehicle |
| Turret | `turret_theeterras` | Het Theeterras | Three generations on a floating terrace, each with their own tea. They flick sugar cubes | static |
| Its projectile | `shot_suikerklontje` | | A sugar cube | static |
| Special | `special_nee_is_nee` | Nee is nee | A mother's face fills the sky, with one raised eyebrow. See below | static |
| Base | `base` | | Het Familiehuis: a tall narrow house with a floor for every generation and a packed car parked on the roof, ready for next year | static |
| **Super unit** | `mo_tron` | Mo-Tron | Mo, the night-shift worker of 1975, now a great-grandfather in a colossal walking robot. A roof rack on his shoulders, the calendar on his chest, still crossing off the days | free |

Special, **Nee is nee** (snipe): one look and one "no", and the toughest enemy unit on the lane shrinks
back; whatever is left of the look goes to the next toughest. The mother is never seen hitting anyone.

**The fatbike: the first unit that does something of its own**

The owner's idea, in their words: "dure zeer snelle unit die overal doorheen raast ... en tegen de base
aanrijdt (soort base attack unit, wel duur) deuren houden deze tegen ook, daar kan die niet doorheen
fietsen." After reading the first version of this rule, the owner changed it (23 November 2026): "I would
let the fatbike damage the units it rides through (so same lane). It can be stopped with shields, both
killing the fatbike and the shielder. It still should gain rewards. It should be cheaper than the other
fatties, like half ... but low hp and it can be attacked and killed before it reaches the base. It should
have the HP of a light unit or something, so that it can be killed, it does damage when failed and when
there are little number of enemies it can blast the base. It cannot go through the super unit." It takes
the **heavy slot of 2025**, at about half a heavy's price. In 1975 and 2050 the heavy unit is an ordinary
one.

Why it cannot simply be a fast unit: nothing in the ranks may pass the enemy's front line, so a unit that
rides through the enemy army is not a unit in the ranks. It is a **rider**: a traveller of its own on the
lane, as the convoy of a wave is, but with hit points. The rule, written out:

- **Buying and training.** The heavy button sells it, and it is trained in the queue like any unit. When it
  is trained it does not join the ranks: it leaves the gate as a rider. Only one rider per side is on the
  lane at a time; a second one waits at the gate, trained, until the first is gone. It does not count
  towards the ten units a side may have on the lane.
- **Riding through.** It passes its own units without touching them. Every enemy unit on its way that does
  not draw turret fire (light, ranged, heavy, of any era) it rides straight through, and the two trade one
  blow: the unit takes the rider's ram damage, and the rider takes one blow of the unit's own damage, ready
  or not. It does not slow down. A unit the rider beats earns the rider's side its bounty and vooruitgang,
  as any kill does. So a crowd wears it down, and with only a few enemies on the lane it gets through.
- **What else can hit it on the way.** Enemy turrets. A turret that can reach a rider fires at it before
  anything else, because it is the thing going for the base, and its shots hit it at full strength.
- **A schild stops it, and both go down.** The first enemy unit on its way that draws turret fire, which is
  the schild of 1975 and 2025, is a door. The rider crashes into it and both are gone, whatever hit points
  the schild had left. Each side earns the other's bounty and vooruitgang: the rider's side for the schild,
  the schild's side for the rider. "Deuren houden deze tegen" is meant literally: the Achterhoek's first
  schild is Deurink, a man carrying a barn door.
- **A super unit stops it, and stays.** It cannot ride through a super unit either, which it meets when the
  other side reached 2050 first. The rider crashes and is gone; the super unit takes the ram damage and walks
  on, and its side earns the rider's bounty and vooruitgang.
- **Beaten on the way, it has still done its damage.** Every unit it rode through took its blow, and stays
  hurt or beaten, whatever happens to the rider after.
- **What it does to the base.** If it reaches the enemy gate, it rides into the base: the base loses the
  rider's base damage at once, and the rider is wrecked and gone. The enemy earns nothing for it.
- **What else touches it.** Enemy specials do not: it is not a unit in the ranks and is gone in a few
  seconds, so waves, stuns, takeovers, snipes and barrages pass it by, as they pass a super unit. Its own
  side's buffs do not speed it up either. Overtime makes its ram and base damage grow, as it does every
  unit's blows, and turrets that have fallen silent in overtime no longer fire at it.
- **Riders pass each other.** Two riders coming from both sides do not touch.
- **Mirrored.** Its position is its distance from its own gate, as for everything on the lane, so both
  sides run the same arithmetic. It meets an enemy unit when the lane length minus its position minus the
  unit's position reaches zero, which reads the same from either side. Within one tick it meets the enemy
  units nearest first, and its own hit points count down as it goes, so it stops at the unit that beats
  it. What it does to the units lands at the end of the tick with all other damage, so two riders, or a
  rider and the other side's blows, never depend on which side is handled first. Turrets choose their
  target by the same rule on both sides. A test plays it with the seats swapped and expects the same
  outcome.

**Numbers to start from**, to be fitted with `npm run balance -- --mix` and changed freely: price 230 (half
the heavy of 2025, which costs 460; its bounty is then 92), trained in 4 seconds, 288 hit points (the light
unit of 2025), 330 pixels a second (the junior walks 60, so it crosses the 1280-pixel lane in about four
seconds), 130 ram damage to every unit it rides through (the heavy's blow is 132), and 500 to the base,
which has 5500 in 2025. What wears it down: a light hits back for 43, a ranged unit for 31, a heavy for
132, so two heavies and a few lights stop it. Two new turrets land about 100 on it before it reaches the
gate; two fully upgraded ones land about 380, more than its hit points, so they stop it on their own.
That, and a schild kept out, is the defender's answer. If bots show the rider never or always getting
through, change its hit points first.

**What the rules need** (no code here; the building agent writes it): a list of riders in the match state,
next to the waves; a mark on the unit definition that it is a rider, with its ram damage and base damage;
the queue sending out a rider instead of a unit; the ride through enemy units, with the blow each way and
the bounty for what it beats; turrets preferring a rider in reach; shots that can hit a rider; the crash
into a schild (both gone, both bounties) and into a super unit (the rider gone, the super hurt); the blow
to the base; events for the renderer (out, through a unit, hit, into a schild, into a super unit, into the
base, beaten); the renderer drawing a rider; the bots buying it, and answering it by keeping a schild out
when the other side has riders; and a test file of its own, like `tests/shield.test.ts`, with the mirrored
case in it. The places are the ones `docs/new-faction.md` lists for a new kind of special, plus
`src/sim/step.ts` and `src/sim/turrets.ts`. The unit's blurb on the title card says in plain words what it
does: "Raast overal doorheen, recht op de basis af. Alleen een deur houdt hem tegen."

**Temperament: "met de hele familie"**

A starting point, to be fitted with `npm run balance -- --mix` as `docs/new-faction.md` says:

| Light | Ranged | Heavy (1975, 2050) | Schild |
|---|---|---|---|
| 15% cheaper, trained in 80% of the time, 15% fewer hit points | 10% more hit points, 10% longer between throws | 10% more hit points, 10% slower: the roof rack | 10% more hit points, 5% slower |

Many hands, quickly there; the light ones fold sooner, the loaded ones are slow. The fatbike has its own
numbers and no twist.

**Lines**

Ordinary Dutch, as these families speak it. No accent and no words from a prayer.

| Era | Walking out | Beaten |
|---|---|---|
| 1975 | "Twee jaar, dan terug!" · "Nachtdienst!" · "Eerst thee." · "Ik schrijf het op." | "Volgend jaar terug." · "De koffer staat klaar." · "Mijn rug." · "Even naar huis bellen." |
| 2025 | "Eet eerst wat!" · "Ik ga zo, nog één ding." · "Iedereen moet het zien!" · "Ik rij maar vijfentwintig, echt!" · "Wat kijk je?" | "Neem wat mee voor onderweg." · "Mijn band is lek." · "Wie filmt dit?" · "Volgend jaar terug." |
| 2050 | "Veertig minuten naar het zuiden!" · "Eerst de prijzen vergelijken." · "Blijf je eten?" · "Volgend jaar terug!" | "Volgend jaar." · "Accu leeg." · "Mijn notitieboekje!" · "Eerst thee." |

**Flag and backdrop**

- **Flag** (`art/flags/gastheren.svg`): the tile-blue field, the golden tea glass on its saucer, the white
  ribbon across the corner. No lettering, so it mirrors without help.
- **Backdrop** (`art/gastheren/backdrop.svg`, drawn for the left side): a street of brick houses with a
  factory chimney behind them, a barber's pole by a shop door, the fairy lights of a wedding hall further
  down, and a car with a loaded roof rack parked out front, ready for summer.

**Stay away from**

- Crime, police, fines and nuisance, including the reporting on wedding convoys that block junctions and
  motorways. Every riot, including those after football matches, and any "beats Oranje" angle.
- Religion as a joke: the mosque, prayer, Ramadan, the feast of the sacrifice, the pilgrimage, and
  religious words in the lines. Headscarves and other clothes may be drawn as what people wear, never as
  the punchline.
- Accents or broken Dutch as the joke. Everyone speaks ordinary Dutch.
- Politics and the integration debate, the word "allochtoon", benefits, and jokes about houses over there.
- Real people, including every comedian, writer and filmmaker in the sources, the footballers of 2022 and
  their mothers, and the man the kapsalon is named after.
- Real shops, wedding halls, barbershops and ferry lines, and every car brand: no badge, no three-pointed
  star, no blue oval.
- Real national flags, crescents and stars, as the faction's flag or on the cars.
- The mother's slipper, and smacks of any kind.
- Shoarma and the kapsalon, which are not theirs. The 1972 riots in the Rotterdam Afrikaanderwijk, which
  the history of the boarding houses leads to. Bribes at borders, which turn up in the stories of the drive.
- The angry street kid in general. "Wat kijk je?" is in, as the owner decided, but only from the fatbike
  kid and only as cheek: never with a threat behind it, never from anyone else.

**Questions, and what the owner decided**

The owner read the brief on 23 November 2026 ("Yes the brief looks good") and changed three things: the
fatbike's rule, its line and the super unit's name. Five of the six questions are settled.

1. **The name.** Settled: **De Gastheren**, as recommended (the guests became the hosts). The owner's working
   title *De Gastarbeiders* fits 1975 but calls the grandchildren guests too, and the workers themselves
   objected to the word in 1971. The third option was *Volgend Jaar Terug*.
2. **The fatbike.** Settled: the heavy of 2025, cheap and fragile, riding through the ranks and hitting
   everything it passes, stopped by a schild (both go down) or a super unit, with the numbers above as a
   start. Its lines: "Ik rij maar vijfentwintig, echt!", which every fatbike kid in the country says, and
   the owner's **"Wat kijk je?"**, which the owner calls a well-known thing. My research found no inside
   source for the second, only the outsiders' angry street kid, so it is the one line in this faction that
   rests on the owner's word rather than a source. It is said as cheek, by the fatbike kid only.
3. **The super unit's name.** Settled: **Mo-Tron**, the owner's choice, softened from their MohammedTron.
   "Mo" is a nickname for many names, Mohammed among them; the robot is Mo, the night-shift worker of 1975,
   grown into a giant. My recommendation had been Mega-Opa.
4. **The honking convoy.** Settled: a wedding convoy, without real flags; ribbons and balloons in the
   faction's colours.
5. **One faction for two communities**, as the owner proposed, kept apart unit by unit. Settled.
6. **A reader from the inside.** Still open, and the owner's to decide: before the build, let someone with
   a Turkish-Dutch or Moroccan-Dutch family read this section, the lines and the stay-away list. With
   "Wat kijk je?" and Mo-Tron in, this is where such a reading counts most.

## Suggested order

A faction is built the way the two new eras were: three drawing jobs side by side, one per era, plus
the super unit, the flag and the backdrop; then the wiring, my own check of every drawing and of a staged
battle, and one pull request per faction.

1. ~~**The groundwork**, once: choosing sides, the backdrop halves, the faction sheet, tests for any pair.~~ Done.
2. ~~**De Zuidas.** Your own idea, and the sharpest contrast with both factions that exist. It brings the
   first new kind of special, the convert.~~ Done.
3. **De Gastheren**, once its brief has been read and settled. The owner's own idea, and the first
   faction with a unit that does something of its own, the fatbike, which is built before any drawing.
4. **Carnaval.** The most colourful to draw, and it needs only one new kind (slow).
5. **Rotterdam.** Amsterdam's rival, with the container as the block.
6. **De Toeristen.** The summon and the lockout.
7. **De Camping.**
8. **De Ambtenarij.** Best after De Zuidas has shown how far apart the two office factions can be kept.
9. **De Friezen.**

Any other order works.

## Sources

Each faction was researched online on 22 November 2026, and De Gastheren on 23 November 2026. Dates,
origins, names and spellings in this document were checked against the sources below. For De Gastheren
every joke was also traced to a source from inside the two communities; see its section. Everyday details, such as the bodywarmer, the
bitterballen at the Friday drinks, socks in sandals or the guide's umbrella, are common knowledge and were
not looked up. The 2050 eras are extrapolations, mine and the researchers'.

**De Zuidas**

- Thesis on the hoeklieden of the Amsterdam exchange, 1973–2001 (University of Amsterdam, 2013): https://www.hugovandermolen.nl/scripophily/texts/Hoeklieden-Geusebroek.pdf
- The exchange and its floor trading: https://nl.wikipedia.org/wiki/Euronext_Amsterdam and https://esb.nu/de-hoeken-van-de-beurs/
- The district and its tunnel: https://nl.wikipedia.org/wiki/Zuidas and https://nl.wikipedia.org/wiki/Zuidasdok
- Dress and the Friday drinks: https://www.accountant.nl/magazines/accountant-2018-q3/niks-mis-met-een-grijs-pak/ and https://www.accountant.nl/magazines/accountant-2016-q3/zoom-de-vrijmibo/
- Office language: https://onzetaal.nl/tijdschrift/01-2025/artikel/columniste-japke-d-bouma-over-de-taal-van-de-kantoorjungle and https://www.binnenlandsbestuur.nl/carriere/organisatiecultuur/jeukwoord-2024-ergens-een-plasje-over-doen
- Terms: https://nl.wikipedia.org/wiki/Vijandige_overname and https://nl.wikipedia.org/wiki/Gouden_handdruk

**Carnaval**

- Overview and the two traditions: https://nl.wikipedia.org/wiki/Carnaval , https://nl.wikipedia.org/wiki/Bourgondisch_carnaval and https://nl.wikipedia.org/wiki/Rijnlands_carnaval
- Brabant against Limburg: https://www.omroepbrabant.nl/nieuws/6034152/dit-is-waarom-limburg-sjoenkelt-en-brabant-in-de-kroeg-staat
- Cries and roles: https://nl.wikipedia.org/wiki/Alaaf , https://nl.wikipedia.org/wiki/Houdoe , https://nl.wikipedia.org/wiki/Prins_Carnaval and https://nl.wikipedia.org/wiki/Tonprater
- Carnival town names (to avoid the existing ones): https://nl.wikipedia.org/wiki/Lijst_van_alternatieve_plaatsnamen_tijdens_carnaval
- The seventies: Volkskundig Bulletin 1979, https://meertenspublicaties.meertens.knaw.nl/pdf/vb/031_VB_1979_5.1.pdf
- Today: https://www.omroepbrabant.nl/nieuws/4648941/veel-carnavallers-zien-festivalisering-met-lede-ogen-aan , https://www.omroepbrabant.nl/nieuws/4649096/Bovensloters-welkom-als-ze-zich-aan-de-ongeschreven-carnavalsregels-houden and https://www.omroepbrabant.nl/nieuws/4414777/zuipwagens-actief-geweerd-ze-horen-absoluut-niet-in-een-optocht/
- Protected emblems: https://www.omroepbrabant.nl/nieuws/6002511/das-gin-echte-carnavalsstichting-tilburg-waarschuwt-voor-nep-emblemen

**De Friezen**

- The tocht, its years and "It giet oan": https://nl.wikipedia.org/wiki/Elfstedentocht and https://elfstedentocht.frl/en/tour/the-tour-of-1997/
- What the association allows: https://elfstedentocht.frl/en/commercialisation/
- The chance of ice: https://www.knmi.nl/kennis-en-datacentrum/achtergrond/kans-op-elfstedentocht-in-een-veranderend-klimaat
- The flag: https://nl.wikipedia.org/wiki/Vlag_van_Friesland
- Sports and boats: https://nl.wikipedia.org/wiki/Fierljeppen , https://nl.wikipedia.org/wiki/Skûtsje , https://nl.wikipedia.org/wiki/Skûtsjesilen and https://nl.wikipedia.org/wiki/Kaatsen
- Farms: https://nl.wikipedia.org/wiki/Kop-hals-rompboerderij , https://nl.wikipedia.org/wiki/Stelpboerderij and https://nl.wikipedia.org/wiki/Uilenbord
- The bitter and its name: https://nl.wikipedia.org/wiki/Beerenburg
- The toll clog: https://www.immaterieelerfgoed.nl/nl/page/3196/ophalen-van-bruggeld-met-het-klompje
- Phrases: https://en.wikivoyage.org/wiki/West_Frisian_phrasebook

**Rotterdam**

- The kapsalon: https://nl.wikipedia.org/wiki/Kapsalon_(gerecht)
- The flag: https://nl.wikipedia.org/wiki/Vlag_van_Rotterdam
- Dialect and nicknames: https://nl.wikipedia.org/wiki/Rotterdams and https://neerlandistiek.nl/2018/10/goten-in-rotterdam
- Landmarks: https://nl.wikipedia.org/wiki/Erasmusbrug , https://nl.wikipedia.org/wiki/Kubuswoningen_(Rotterdam) and https://nl.wikipedia.org/wiki/Markthal_(Rotterdam)
- The port in the seventies: https://www.ect.nl/en/about-us/60-years-milestones and https://www.cbs.nl/nl-nl/visualisaties/tijdlijn-stakingen/1970
- The port now and later: https://nl.wikipedia.org/wiki/Maasvlakte_2 , https://nl.wikipedia.org/wiki/Maeslantkering and https://www.portofrotterdam.com/en/news-and-press-releases/together-towards-competitive-sustainable-and-resilient-port-2050
- Gabber: https://nl.wikipedia.org/wiki/Gabber_(subcultuur)

**De Toeristen**

- The beer bike and its ban: https://nl.wikipedia.org/wiki/Bierfiets and https://www.binnenlandsbestuur.nl/bestuur-en-organisatie/ondermijning/bierfiets-nu-echt-verboden-in-centrum-amsterdam
- The city letters: https://nos.nl/artikel/2261845-letters-i-amsterdam-binnen-halfuur-verdwenen
- Tulip fields: https://nos.nl/l/2277747
- Queues for snacks: https://nos.nl/l/2471445
- Wheeled suitcases: https://nos.nl/artikel/2204099-weer-een-maatregel-tegen-airbnb-heeft-dat-zin
- "What time does the village close": https://nos.nl/artikel/2177067-giethoorn-worstelt-met-toerisme-soms-staat-op-elk-grassprietje-een-auto
- The sleepers of the seventies: https://nl.wikipedia.org/wiki/Damslapers and https://geschiedenislokaalamsterdam.nl/bronnen/slapen-in-het-vondelpark
- Cruise ships: https://www.nhnieuws.nl/nieuws/337736/aantal-zeecruiseschepen-in-2026-gehalveerd-in-2035-definitief-einde-pta-verwacht and https://www.transportenvironment.org/articles/cruisezillas-how-much-bigger-can-cruise-ships-get
- The city's campaigns: https://www.dutchnews.nl/2024/03/amsterdam-rules-city-website-aims-to-tackle-nuisance-tourism/

**De Ambtenarij**

- The crocodile and where it comes from: https://nl.wikipedia.org/wiki/Paarse_krokodil
- "Van het kastje naar de muur": https://dbnl.org/tekst/stoe002nede01_01/stoe002nede01_01_1106.php
- Ranks and the bode: https://nl.wikipedia.org/wiki/Commies , https://nl.wikipedia.org/wiki/Bode_(beroep) and https://nl.wikipedia.org/wiki/Bodebus
- Inspraak: https://nl.wikipedia.org/wiki/Inspraak
- The office of the seventies: https://nl.wikipedia.org/wiki/Carbonpapier and https://www.accountant.nl/magazines/accountant-2022-nr.-5/adverteren-doet-begeren/
- Today: https://www.binnenlandsbestuur.nl/digitaal/geheimhouding/grote-ict-projecten-overheid-zeker-1-miljard-duurder , https://www.binnenlandsbestuur.nl/carriere/water/gemeentelijke-jeukwoorden-van-het-jaar-verzameld and https://vng.nl/sites/default/files/2024-12/kappen_met_de_lokettenjungle_inspiratiegids.pdf
- Why the faction stays away from benefits and fraud detection: https://nl.wikipedia.org/wiki/Toeslagenaffaire

**De Camping**

- The language of the camper: https://onzetaal.nl/uploads/editor/0778kamperen.pdf and https://dbnl.org/tekst/_taa014200201_01/_taa014200201_01_0117.php
- Zwarte Zaterdag, and 2 August 1975: https://nl.wikipedia.org/wiki/Zwarte_zaterdag_(verkeer) and https://fr.wikipedia.org/wiki/Bison_Futé
- How many camp: https://www.cbs.nl/nl-nl/nieuws/2026/27/bijna-22-miljoen-zomervakanties-in-2025-frankrijk-populairste-bestemming and https://nieuws.nl/economie/recordaantal-campers-en-caravans-in-nederland
- The trailer tent: https://nl.wikipedia.org/wiki/Vouwwagen
- The skottel: https://dsae.co.za/entry/skottel/e06581
- Unwritten rules of the camp site: https://www.maxvandaag.nl/sessies/themas/reizen-verkeer/etiquette-op-de-camping-deze-ongeschreven-regels-gelden-er/
- The voetbalvader on the sideline: https://assets.sire.nl/downloads_accept/infographics/SIRE-2011-Persbericht-22Geef-kinderen-hun-spel-terug22.pdf and https://www.omroepbrabant.nl/nieuws/4547282/lollys-moeten-schreeuwende-ouders-op-het-voetbalveld-stil-houden

**De Gastheren**

- The agreements and the work: https://verdragenbank.overheid.nl/en/Treaty/Details/004441 , https://www.canonvannederland.nl/nl/gastarbeiders , https://nos.nl/l/2533870 and https://nos.nl/l/2213402
- "Two or three years", and the grandson who feels Dutch: https://nos.nl/artikel/2284642-50-jaar-na-het-wervingsverdrag-ik-voel-me-nederlands-en-marokkaans
- The plan to go back, and staying: https://www.iamsterdam.com/ontdek/echt-amsterdams/door-de-ogen-van-turkse-amsterdammers
- The word gastarbeider: https://dbnl.org/tekst/_taa014197101_01/_taa014197101_01_0024.php and https://nos.nl/artikel/2140764-gastarbeider-immigrant-of-allochtoon-het-blijft-worstelen
- The summer drive: https://www.filmfestival.nl/en/film/porte-bagage , https://www.bladi.net/voiture-chargee-direction-maroc-voyage-mre-revient-affiche,124099.html , https://nos.nl/l/2438854 and, for the Turkish side as told in Germany, https://www.cambridge.org/core/product/0B8E6C00ADDB3E88EA96D73DEF44CF72/core-reader
- The Moroccan-Dutch community list (the minibus, the travel agencies, the goodbye at the door): https://forums.marokko.nl/showthread.php?t=3008474
- The son who translates: https://nl.wikipedia.org/wiki/Shouf_Shouf_Habibi!
- Hospitality: https://www.linda.nl/persoonlijk/9-vragen-aan/soundos-el-ahmadi-fatbike-levensgevaarlijk/
- Mothers on stage and screen: https://denhaag.com/nl/node/15827 and https://en.wikipedia.org/wiki/Meskina
- Weddings and the convoy: https://www.vpro.nl/dit-zijn-wij/artikelen/hoe-trouwt-nederland and https://nos.nl/artikel/2300726-trouwstoeten-zijn-feestje-voor-de-een-flinke-overlast-voor-de-ander (the second also shows what to stay away from)
- Barbers: https://www.brusselstimes.com/brussels-2/1245464/why-belgiums-turkish-barbers-are-a-cut-above/ and https://www.omroepbrabant.nl/nieuws/6000398/van-turkije-tot-tilburg-kapper-yetkin-73-denkt-nog-lang-niet-aan-stoppen
- The fatbike and who rides it: https://nos.nl/l/2542570 , https://nos.nl/l/2526324 and https://www.nhnieuws.nl/nieuws/340354/nieuwe-regels-moeten-fatbike-onaantrekkelijker-maken-maar-gaat-dat-werken
- Shoarma and the kapsalon: https://dbnl.org/tekst/_taa014198801_01/_taa014198801_01_0194.php , https://nl.wikipedia.org/wiki/Shoarma and https://nos.nl/l/2464018
- First names: https://nos.nl/artikel/597208-mohamed-muhammed-muhamet and https://www.hartvannederland.nl/advies-en-tips/opvoeding/artikelen/populairste-babynamen-in-2024
- Left out, and why: the 1976 drawing of a Turkish coffee house, https://haagshistorischmuseum.nl/en/collectie/masterpieces/turkish-coffee-house-hoefkade-the-hague/ ; the aunts' WhatsApp group, told in Germany, https://kubragumusay.com/2013/01/die-digitale-turkische-familie-whats-up/
