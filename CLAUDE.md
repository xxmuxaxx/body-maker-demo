# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `yarn dev` (or `yarn start`): Vite dev server on port 3000
- `yarn build`: production build to `dist/`
- `yarn preview`: serve the built `dist/`
- `yarn lint`: ESLint (flat config in `eslint.config.js`)

There is no test suite. To verify a change, run `yarn lint && yarn build` and check the page in the browser.

## Architecture

This is a frontend-only React 19 demo built with Vite. It has no backend, and all data is hardcoded in the components. UI text is in Russian.

- `index.html` is the Vite entry and loads `src/main.jsx`, which mounts `App`.
- `src/App.jsx` sets up routing with `react-router` (v7+ API: `Routes`/`Route element={...}`, imported from `"react-router"`, not `react-router-dom`). Every route renders inside `Containers/Layout`, which shows the left `Components/Panel` sidebar next to the page content.
- The routes are `/body-maker` (`Components/BodyMaker`), `/my-awards` (`Components/MyAwards`), `/cloakroom` (`Containers/Cloakroom`), and a catch-all index page with links.
- `Components/BodyMaker`: the character is inline SVG (`Head.jsx`, `Body.jsx`). Colors and visibility of the hair, beard and brows are React state in `BodyMaker.jsx`, passed down as props.
- `Components/Gift/Gifts.jsx` animates with `@react-spring/web`. It uses the imperative API: `useSpring(() => ...)` returns `[styles, api]`, and you animate with `api.start({...})`.
- Shared form controls live in `Components/utils/` (Button, Input, Radios).

## Conventions

- Components are `.jsx` function components with default exports. `BodyMaker/index.jsx` re-exports its parts as named exports.
- Styles are Sass CSS Modules next to each component (`Name.module.scss`), imported as `styles`. Global styles and the Montserrat font import are in `src/app.scss`, and `normalize.css` is imported in `App.jsx`.
- Images are imported from `src/assets/img/` as URLs.
- Package manager: Yarn 1 (`yarn.lock`).
