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
| 2. Minor and patch releases | ✅ | (step 2) |
| 3. Small majors | ⬜ | |
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

To be filled in as it happens.
