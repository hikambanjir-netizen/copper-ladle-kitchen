# The Copper Ladle

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/hikambanjir-netizen/copper-ladle-kitchen/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/hikambanjir-netizen/copper-ladle-kitchen/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A tiny kitchen, a big lunch rush. **The Copper Ladle** is a complete,
original cooking game that runs offline in a desktop browser from static
files — no network request, no library, no build step.

## How to play

Orders appear on the board with a patience bar. Take the order, build the
dish exactly as asked, and serve it before the customer walks out.

1. **Pick up** an ingredient — click a bin or press `1`–`6`. Patties and
   eggs are raw: they must visit the grill first.
2. **Grill** — click a grill slot to start cooking, click again when the
   ring is full. Leave it too long and it burns.
3. **Plate** — click the plate to stack ingredients. A plate serves only
   when it matches an open order exactly, extras included.
4. **Serve** — click SERVE or press `Space`. Fast serves earn bigger tips;
   serving the same dishes in a row builds a combo multiplier.

The day lasts 2 minutes, and the last 30 seconds are rush hour: orders
arrive faster. Lose three customers and the kitchen closes early.

Four dishes on the menu: **Classic Stack** (bun, patty, lettuce),
**Golden Melt** (bun, patty, cheese, tomato), **Garden Fresh** (bun,
lettuce, tomato, cheese) and **Sunrise Special** (bun, egg, cheese).

`P` pauses, `M` mutes the synthesised kitchen sounds, `T` bins the plate,
`R` starts a new day.

## Run it

```sh
node serve.ts
# open http://localhost:8080 in desktop Chrome
```

Or open `game/index.html` directly from any static server. The game is
plain files under `game/` — `index.html` plus ES modules in `game/src/` —
with all art drawn on canvas and all sounds synthesised with WebAudio.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `game/` and
`screenshots/` to `/output` and writes `/output/dossier.json` with
`buildDossier` from `vendor/makefun-game.ts`.

## Layout

- `game/src/config.js` — recipes, ingredients, tuning, layout
- `game/src/state.js` — orders, grill, plate, scoring, the day timer
- `game/src/render.js` — everything painted on the canvas
- `game/src/input.js` — keyboard and mouse, turned into actions
- `game/src/audio.js` — synthesised sounds (sizzle, ding, chop)
- `game/src/random.js` — the seeded random source
- `game/src/shots.js` — the deterministic screenshot scenes
- `game/src/main.js` — boot, the fixed-step loop, the four screens

---

<sub>Entered on [make.fun](https://make.fun/?ref=dfkzjsa3&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
