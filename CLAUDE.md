# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `yarn dev` (or `yarn start`): Vite dev server on port 3000
- `yarn build`: production build to `dist/`
- `yarn preview`: serve the built `dist/`
- `yarn lint`: ESLint (flat config in `eslint.config.js`)
- `yarn test`: Vitest, run once (`npx vitest run src/game/penalty.test.js` for a single file)
- `yarn gen:art`: generate art with ComfyUI (needs `COMFY_URL`, optional `COMFY_AUTH=user:pass`). See `tools/comfy/generate.mjs` for options.
- `yarn gen:character base|items|pick`: build the layered raster character (see "Character" below and `tools/comfy/character.mjs`).

To verify a change, run `yarn lint && yarn test && yarn build` and check the page in the browser.

## Architecture

This is a frontend-only React 19 mini-game built with Vite. It has no backend. The player's progress is a zustand store persisted to localStorage. UI text is in Russian.

The code is split into three layers:
- `src/data/*.json` holds the content catalogs: items, opponents, boosters and ranks. Images are referenced by file name and resolved with `imageUrl()` from `src/data/images.js`, which uses `import.meta.glob` over `src/assets/img/`.
- `src/game/` holds pure logic with no React. `catalog.js` indexes the JSON. `penalty.js` implements the shootout: it has a match state machine, the hit/miss/save chances, and the opponent AI. `rewards.js` covers match rewards and gift rolls, `ranks.js` maps XP to ranks, and `stats.js` computes effective stats (base + allocated points + equipped items + booster). Randomness is always injected as an `rng` function. Tests pass a seeded `createRng(seed)` from `rng.js`, and the UI passes `Math.random`.
- `src/store/gameStore.js` holds the persisted state (profile, xp, coins, record, inventory, equipped, boosters, gifts, history) and its actions (`equip`, `openGift`, `finishMatch`, `allocatePoint`, `reset`, etc.). Inventory entries are `{ uid, itemId, isNew }`, and `equipped` maps a slot to a uid. If you change the persisted shape, bump `version` in the persist options and add a `migrate`.

Routing is in `src/App.jsx` and uses `react-router` (v7+ API, imported from `"react-router"`). Every route renders inside `Containers/Layout`, which shows the data-driven `Components/Panel` sidebar.
- `/`: `Containers/Home`, onboarding or a to-do list
- `/body-maker`: `Components/BodyMaker`, which saves the appearance to the store
- `/cloakroom`: `Containers/Cloakroom`, equipment slots over the SVG body, `ClothesModal`, and `PointsPanel` for stat points
- `/my-awards`: `Components/MyAwards`, with gifts (animated by `Gift/Gifts.jsx` using `@react-spring/web` `api.start`), boosters and the collection
- `/match` and `/match/:opponentId?booster=id`: `Containers/Match`, the opponent list and the shootout screen
- `/stats`: `Containers/Stats`

Generated art lives in `src/assets/gen/<kind>/<id>.webp` (kind = items, boosters, opponents). `artUrl(kind, entry)` from `src/data/images.js` prefers it over the entry's `img`, and opponent portraits use it instead of the SVG head. The pipeline is in `tools/comfy/`: `subjects.json` has English prompts per catalog id (every catalog entry needs one; a test checks this), `style.json` has the per-kind style, `workflows/txt2img.json` is the API-format workflow with `{{placeholders}}`, and `postprocess.mjs` cuts out the white background with sharp. Never commit ComfyUI credentials.

### Character

`BodyMaker/Character.jsx` draws the character as one SVG in body coordinates (the 191x532 space of `Body.jsx`; shared shapes and `CHARACTER_CANVAS` live in `bodyPaths.js`). It has two modes:
- **Raster** (used when `src/assets/character/manifest.json` and `base.webp` exist; see `characterLayers.js`): the generated body `base.webp` is recolored to `appearance.bodyColor` by an `feColorMatrix` luminance tint (`tintMatrix`, reference `skinLum` from the manifest). Clothing layers `<itemId>.webp` go on top in this order: shirt, then shorts (or the grey `underwear.webp`), boots, gloves. Last comes the SVG `Head` with the ink outline. An outfit entry with `tint` recolors a neutral layer; opponents use this with `kit-shirt`/`kit-shorts`. An item without a layer falls back to its SVG piece from `Outfit.jsx`.
- **SVG** (fallback): `Body.jsx` (cel-shaded rim), `Outfit.jsx` (clothes drawn from each item's `look`) and `Head.jsx` under one ink-outline filter.

Each item in `items.json` has a `look` (`base`, plus optional `base2`, `trim`, `accent`, `sole`, `armband`, `emblem` and a `pattern` such as `gradient`, `sideStripes`, `hoops`, `sideStripe` or `lightning`) for the SVG mode and fallbacks. `outfitItems(state)` from `game/stats.js` maps equipped slots to `{ id, look }`. SVG ids come from `useId`, because several characters can be on the page at once.

The raster layers are made by `tools/comfy/character.mjs`:
1. `base` img2imgs the rendered SVG body (`tools/comfy/character/base-input.png`) with Krea 2 into `base.png`. `layers.mjs` then removes the background and the generated head, and splits the grey shorts into `underwear.webp`.
2. `items` Klein-edits `base.png` once per seed (prompts in `tools/comfy/character.json`, subjects from `subjects.json`) and writes a review sheet to `tools/comfy/character/variants/sheet.png`.
3. `pick id=seed` keeps the pixels the edit changed inside the slot area (from the SVG silhouettes), then records the seed and the layer's `refLum` in the manifest.

To add an item: add its subject, run `items --id=<id>`, look at the sheet, then run `pick <id>=<seed>`.

## Conventions

- Components are `.jsx` function components with default exports. `BodyMaker/index.jsx` re-exports its parts as named exports.
- Styles are Sass CSS Modules next to each component (`Name.module.scss`), imported as `styles`. Global styles and the Montserrat font import are in `src/app.scss`, and `normalize.css` is imported in `App.jsx`.
- In components, images are imported from `src/assets/img/` as URLs. Data files use file names instead (see above).
- Russian plurals go through `src/utils/plural.js`.
- Package manager: Yarn 1 (`yarn.lock`).
