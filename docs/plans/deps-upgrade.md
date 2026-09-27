# Dependency upgrade

## Context

After the Material UI 9 upgrade (PR #2), 33 of the app's direct dependencies
were behind: 7 by a minor or patch release, 26 by a major. Six more were
installed but not imported anywhere. This plan brings them up to date on
branch `deps-upgrade`, in steps that each build, test and commit on their
own, with the riskiest (React 19) near the end.

**Out of scope:** `react-scripts` (deprecated, and a move to Vite is its own
plan) and `react-ga`, which is current but reports to Universal Analytics,
a service Google shut down in 2024. Both are follow-ups.

## Rules for every step

1. Read the package's changelog or migration guide for every major crossed.
2. After each step: `yarn build`, `CI=true yarn test`, lint no worse than
   the 43-problem baseline, and the jsdom smoke test used for the MUI
   upgrade (ten signed-out routes, no console errors).
3. One commit per step, `deps - changed: …`, ending with the
   `Co-Authored-By` line. Tick the Status table.
4. A package whose new major can't be made to work is left where it is and
   noted under Held back, rather than blocking the rest.

## Status

`⬜ todo` · `✅ done` · `⏸ held back`

| step | state | commit |
| --- | --- | --- |
| 1. Remove unused packages | ✅ | `b97db4e` |
| 2. Minor and patch releases | ✅ | `3ecbe88` |
| 3. Small majors | ✅ | (step 3) |
| 4. i18next | ⬜ | |
| 5. Redux | ⬜ | |
| 6. Geolocation, player, particles | ⬜ | |
| 7. React 19 | ⬜ | |
| 8. ESLint config | ⬜ | |
| Visual check | ⬜ | |

## Inventory

| package | installed | latest | files | notes |
| --- | --- | --- | --- | --- |
| `add`, `inflected`, `qs`, `react-smooth-dnd` | | | 0 | unused |
| `tsparticles`, `tsparticles-preset-links` | 2.12 | 4.4 / none | 0 | unused; preset renamed `@tsparticles/preset-links` |
| `axios` | 1.13.6 | 1.20.0 | | minor |
| `lodash` | 4.17.23 | 4.18.1 | 19 | minor |
| `moment` | 2.30.1 | 2.31.0 | 21 | minor |
| `react-router-dom` | 7.13.1 | 7.18.4 | | minor |
| `slugify` | 1.6.8 | 1.6.9 | 3 | patch |
| `clsx` | 1.2.1 | 2.1.1 | 3 | |
| `uuid` | 8.3.2 | 14.0.2 | 1 | |
| `query-string` | 6.14.1 | 9.5.1 | 1 | ESM only from 7 |
| `inflection` | 1.13.4 | 3.0.2 | 11 | |
| `inflector-js` | 1.0.1 | 2.0.1 | 1 | |
| `react-image` | 2.4.0 | 4.1.0 | 1 | |
| `react-infinite-scroll-component` | 6.1.1 | 7.2.1 | 13 | |
| `react-dropzone` | 11.7.1 | 20.1.2 | 1 | |
| `react-country-region-selector` | 3.7.0 | 4.0.6 | 2 | |
| `i18next` | 17.3.1 | 26.4.2 | 1 | with the two below |
| `i18next-browser-languagedetector` | 3.1.1 | 8.2.1 | 1 | |
| `react-i18next` | 10.13.2 | 17.0.15 | 8 | `react.wait` option is gone |
| `redux` | 4.2.1 | 5.0.1 | 3 | |
| `react-redux` | 7.2.9 | 9.3.0 | 100 | |
| `redux-thunk` | 2.4.2 | 3.1.0 | 2 | named export from 3 |
| `redux-devtools`, `-dock-monitor`, `-log-monitor` | | | 1 | deprecated; replace with the browser extension |
| `react-geolocated` | 3.2.0 | 4.5.1 | 2 | HOC → hook |
| `react-player` | 1.15.3 | 3.4.0 | 1 | |
| `react-tsparticles` | 2 | `@tsparticles/react` | 1 | package renamed |
| `react`, `react-dom`, `react-is` | 18.3.1 | 19.3.0 | | |
| `react-leaflet` | 4.2.1 | 5.0.0 | 1 | needs React 19 |
| `react-helmet-async` | 1.3.0 | 3.0.0 | 4 | |
| `eslint-config-airbnb` | 18.2.1 | 19.0.4 | | may add lint rules |

## Held back

To be filled in as it happens.

## Notes from running the plan

- The checks run from a script: build (after deleting CRA's
  `node_modules/.cache/.eslintcache`, which otherwise reports stale
  results), tests, lint diffed against the baseline, and the smoke test.
- Step 3, replaced rather than upgraded:
  - `uuid` 14 exposes itself only through package `exports`, which CRA's
    Jest 27 and ESLint resolver can't read. Its one use, alert ids, is
    `window.crypto.randomUUID()` now, which every browser on the Material
    UI 9 floor has (it needs a secure context: https, or localhost).
  - `query-string` 9 is ESM only; its one use, reading `?q=` on the search
    page, is `URLSearchParams`. An absent `q` stays `undefined`, not
    `null`, so axios still leaves it out of the request.
  - `inflector-js` 2 is ESM only; its one use, `pluralize` in the
    composer, comes from `inflection`, which 11 files already use. Both give
    the same plural for every composer type.
- Step 3, code changes for new majors:
  - `react-country-region-selector` 4 exports `CountryRegionData` as a
    module whose `default` is the array.
  - `react-dropzone` takes `accept` as `{ [mimeType]: [extensions] }`.
  - `react-image` 4 exports `Img` by name.
  - `react-infinite-scroll-component` 7 keeps its API but triggers with an
    IntersectionObserver. Visual check: a first page that doesn't fill the
    screen must still load the next.
  - `clsx` 2 and `inflection` 3 needed nothing.
- The project's ESLint parser doesn't accept `??` or `?.` until the config
  changes in step 8.
