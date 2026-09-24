# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `yarn dev` (or `yarn start`): Vite dev server on port 3000
- `yarn build`: production build to `dist/`
- `yarn preview`: serve the built `dist/`
- `yarn lint`: ESLint (flat config in `eslint.config.js`)
- `yarn test`: Vitest, run once (`npx vitest run src/game/penalty.test.js` for a single file)
- `yarn gen:art`: generate art with ComfyUI (needs `COMFY_URL`, optional `COMFY_AUTH=user:pass`). See `tools/comfy/generate.mjs` for options.

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

The character is drawn by `BodyMaker/Character.jsx` as one SVG, so a single filter can add the ink outline that matches the generated art. It combines `Body.jsx` (skin with a cel-shaded rim; its paths are in `bodyPaths.js`), `Outfit.jsx` (shirt, shorts, boots and gloves drawn in the 191x532 body space) and `Head.jsx`. Each item in `items.json` has a `look` (`base`, plus optional `base2`, `trim`, `accent`, `sole`, `armband`, `emblem` and a `pattern` such as `gradient`, `sideStripes`, `hoops`, `sideStripe` or `lightning`), and `outfitLooks(state)` from `game/stats.js` maps the equipped items to looks. When you add an item, pick look colors that match its art. SVG ids come from `useId`, because several characters can be on the page at once.

## Conventions

- Components are `.jsx` function components with default exports. `BodyMaker/index.jsx` re-exports its parts as named exports.
- Styles are Sass CSS Modules next to each component (`Name.module.scss`), imported as `styles`. Global styles and the Montserrat font import are in `src/app.scss`, and `normalize.css` is imported in `App.jsx`.
- In components, images are imported from `src/assets/img/` as URLs. Data files use file names instead (see above).
- Russian plurals go through `src/utils/plural.js`.
- Package manager: Yarn 1 (`yarn.lock`).
