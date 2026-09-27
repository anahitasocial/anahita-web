# MUI upgrade: v4 → v9

## Context

anahita-web is on Material-UI **v4.12.4** (`@material-ui/core`, `/icons`,
`/lab`). The latest is **`@mui/material` 9.4.0**, which supports React 18, so
React stays where it is.

This is not an import rename. v4 styles through JSS (`makeStyles`,
`withStyles`), and its v5+ home, `@mui/styles`, "is not compatible with
React.StrictMode or React 18+, and it will not be updated". On React 18 the
styling has to move as well as the imports.

There is no v8: MUI went from v7 to v9 to line up with MUI X. No codemod spans
several majors, so the upgrade is a sequence of majors, each its own commit,
each built, tested and looked at before the next.

**Outcome:** `@mui/material` 9 on Emotion; no JSS, no `@material-ui/*`, no
`react-jss`; the app looks the same apart from changes listed under
"Deliberate changes".

## Before starting

- **Branch:** `mui-upgrade`, based on `main` after onboarding was merged
  (`19d455c`), so the onboarding code is upgraded too.
- **Docs:** this repo configures the MUI MCP server (`.mcp.json`,
  `mui-mcp`), and `CLAUDE.md` says to answer MUI questions from it. Check that
  the session has the `useMuiDocs` and `fetchDocs` tools before step 0. If
  not, approve the server (`/mcp`) and restart the session.
- **Working state:** `yarn build` and `CI=true yarn test` pass on the base
  branch (98 tests). Run both once before starting, so any later failure is
  known to be new.

## Rules for every step

1. Read the migration guide for that major through the MCP server first. If
   it contradicts this plan, the guide wins; note the difference in this file.
2. Codemods run on `src` with the default parser, which handles `.jsx`:
   `npx @mui/codemod@latest <codemod> src`.
3. After each step: `yarn build`, `CI=true yarn test`, `npx eslint --ext
   .js,.jsx src`, and the visual check below.
4. One commit per step, message style `mui - changed: …`, ending with the
   `Co-Authored-By` line. Tick the Status table with the hash.
5. Don't carry on over a broken build. A step that cannot be made to pass is
   marked ⛔ with the reason, and the work stops there.

## Status

`⬜ todo` · `🚧 in progress` · `✅ done` · `⛔ blocked`

| step | state | commit |
| --- | --- | --- |
| 0. Check this plan against the MCP docs | ✅ | (this commit) |
| 1. v5, Emotion, codemods, theme | ✅ | (step 1 commit) |
| 2. JSS out: 51 `makeStyles`, 21 `withStyles` | ⬜ | |
| 3. v6 | ⬜ | |
| 4. v7 | ⬜ | |
| 5. v9 | ⬜ | |
| 6. Clean-up and docs | ⬜ | |

## Inventory (as of the plan)

| what | count | where |
| --- | --- | --- |
| files importing `@material-ui/core` | 206 | everywhere |
| files importing `@material-ui/icons` | 82 | 82 distinct icons |
| `@material-ui/lab` | 5 files | Alert: `containers/Alerts.jsx`, `auth/WebAuthn/index.jsx`, `agreements/index.jsx`. Autocomplete: `actors/Settings/admins/Add.jsx`, `actors/Socialgraph/Add/Select.jsx` |
| `makeStyles` / `withStyles` | 51 / 21 files | 215 `classes.x` references; 20 deep imports of `@material-ui/core/styles/withStyles` |
| theme | 1 | built in `src/styles/index.js` from `src/assets/default/styles/index.js` (switchable with `REACT_APP_ASSETS`); `palette.type`, `typography.useNextVariants`; `ThemeProvider` in `containers/Root.jsx` |
| `theme.spacing(` | 147 in 56 files | returns a string from v5; see hotspots |
| Grid | 30 in 8 files | `item` ×15, breakpoint props ×23, `justifyContent` ×7 |
| `Hidden` | 1 | `containers/App.jsx` (drawer, `lgUp`/`mdDown`) |
| `withWidth` | 2 | `locations/Read/index.jsx`, `hashtags/Read/index.jsx`; the value appears unused |
| TextField/Select with no `variant` | 30 of 56 | would switch to `outlined` |
| `*Props` | `inputProps` ×48, `InputLabelProps` ×9, `InputProps` ×7, `PaperProps`, `ModalProps`, `SelectProps` ×1 | slots in v9 |
| Box system props | 17 in 12 files | incl. the onboarding steps |
| `ListItem button` | 4 | `containers/support/index.jsx` |
| `color="default"` | 1 | `actors/Read/Body.jsx` |
| `react-jss` | 0 imports | dead dependency |
| tests | 13 files | none render MUI |

## Hotspots

These break silently: a codemod won't catch them, and the build won't fail on them.

- `containers/actors/Read/ActorHeader.jsx:25,32`: `-theme.spacing(15)`
  becomes `NaN` once spacing returns a string. Use `theme.spacing(-15)`.
- `containers/App.jsx:65`: `` `0 ${theme.spacing(2)}px` `` becomes
  `16pxpx`. Drop the `px`.
- `breakpoints.down(x)` excludes `x` from v5 on: `App.jsx:80`,
  `media/Stepper/Lightbox/styles.js:24,103`. Each moves up one key
  (`down('md')` → `down('lg')`) to keep today's behaviour.
- The two Autocomplete files: `getOptionSelected` → `isOptionEqualToValue`,
  `renderOption(option)` → `renderOption(props, option)`, and `params.InputProps`
  moves into `slotProps` in v9.
- `App.jsx`: the `Hidden` drawer branches and `ModalProps`.

## Steps

### 0. Check this plan against the MCP docs

Through `useMuiDocs` / `fetchDocs`, read the migration guides v4→v5 (and
"migrating from JSS"), v5→v6, v6→v7 and v7→v9. Confirm or correct in this
file:

- the codemod names below. `v5.0.0/variant-prop` and
  `v6.0.0/list-item-button-prop` were not in the codemod README's listing
  when this plan was written;
- the `react-is` pin for React 18;
- the v9 browser floor, and whether it is acceptable. See "Decisions".

No code changes. Commit only this file, if it changed.

#### Step 0 findings (MCP docs for 9.4.0, `@mui/codemod` 9.4.0)

- **Codemods exist**: `v5.0.0/variant-prop`, `v5.0.0/link-underline-hover`,
  `v5.0.0/jss-to-tss-react`, `v6.0.0/list-item-button-prop`,
  `v6.0.0/system-props`, `v6.0.0/{styled,sx-prop,theme-v6}`,
  `v7.0.0/{grid-props,input-label-size-normal-medium,lab-removed-components,theme-color-functions}`
  (the last is in the codemod README, not the v7 guide), `deprecations/all`,
  `v9.0.0/system-props`.
- **`preset-safe` already does several hotspots.** It includes
  `theme-breakpoints` (moves every `down()`/`between()` key up one; *not
  idempotent*, never run it twice or bump by hand as well), `theme-spacing`
  (drops the `px` after `${theme.spacing(n)}`), `hidden-down-props`,
  `icon-button-size` (adds `size="large"` to keep v4's 48px),
  `with-width` (inserts a stub), `moved-lab-modules` (Alert and
  Autocomplete move to `@mui/material`), `autocomplete-rename-option`
  (`getOptionSelected`), and `adapter-v4` (wraps the theme in
  `adaptV4Theme`). So step 1 *checks* those hotspots instead of fixing them,
  `@mui/lab` is not needed at all, and `adaptV4Theme` is removed by hand
  because the theme is small enough to write in v5 shape.
- Not codemodded: Autocomplete `renderOption(props, option)`,
  `-theme.spacing(n)`, `withWidth` stubs.
- **`react-is`**: the v6 and v7 guides require a resolution matching React
  (`react-is@^18.3.1`) on React 18. Confirmed.
- **v9 browser floor**: Chrome 117, Edge 121, Firefox 121, Safari 17
  (v6: Chrome 109, Edge 121, Firefox 115, Safari 15.4). Confirmed; still a
  decision for step 5.
- **Defaults that change the look, missing from this plan.** v5 changed:
  breakpoint values (md 960→900, lg 1280→1200, xl 1920→1536); Link underline
  hover→always; CssBaseline body font body2→body1; Tabs indicator
  secondary→primary and text inherit→primary; Checkbox, Radio and Switch
  secondary→primary; Tooltip interactive by default; dark-mode Paper gets an
  elevation overlay; AppBar ignores `color` in dark mode; Stepper loses its
  24px padding; Tab min width 72→90; Menu opens below the anchor; Snackbar
  moves to the bottom left on desktop. Step 1 restores the v4 values in the
  shared theme (`src/styles/index.js`, so asset themes get them too) wherever
  one theme entry does it; anything left is listed under Deliberate changes.
- v9 also: `Typography paragraph` is removed (10 uses; `deprecations/all`
  covers it), Stepper renders `<ol>`, `MenuItem` outside `Menu`/`MenuList`
  and `Tab` outside `Tabs` throw, Grid `direction="column"` is removed.

### 1. v5, Emotion, codemods, theme

1. Dependencies: add `@mui/material@^5`, `@mui/icons-material@^5`,
   `@mui/lab@^5` (only while Alert/Autocomplete still import from lab),
   `@emotion/react`, `@emotion/styled`. Pin `react-is` to `^18.3` with a
   yarn `resolutions` entry. Keep `@material-ui/core` installed until step 2
   is done, because the JSS files still import from it through
   `@mui/styles`. Add `@mui/styles@^5` for the same reason, temporarily.
2. `npx @mui/codemod@latest v5.0.0/preset-safe src`. It covers imports,
   `justify`, `fade`, theme options, lab moves, Badge/Tabs prop values and more.
3. TextField/Select/FormControl variant: keep `standard`, via
   `v5.0.0/variant-prop` if step 0 confirmed it, otherwise with
   `components.MuiTextField.defaultProps.variant = 'standard'` (and the same
   for Select and FormControl) in the theme.
4. Theme: `palette.type` → `palette.mode`, drop `useNextVariants`, and wrap
   the app with `StyledEngineProvider injectFirst` while JSS and Emotion
   coexist, so JSS overrides still win.
5. Fix every item under Hotspots, apart from the Grid, slots and Autocomplete
   `InputProps` changes that belong to v9.
6. Remove `withWidth` from the two Read pages and drop `react-jss`.
7. Build, test, lint, visual check. Commit.

### 2. JSS out

The bulk of the work: 72 files.

- Default: `npx @mui/codemod@latest v5.0.0/jss-to-tss-react src`, adding
  `tss-react`, which supports `@mui/material` 5 through 9. It keeps each
  file's shape (`useStyles()` returning `classes`), so behaviour is least
  likely to change. Review every file it touches; it will leave comments where
  it could not convert.
- By hand, to `sx` or `styled`, only where the codemod fails, or where a
  file's styles are trivial. A small `sx` is clearer than a `makeStyles`
  holding one rule.
- Then remove `@mui/styles`, `@material-ui/core`, `@material-ui/icons`,
  `@material-ui/lab` and `@material-ui/styles`. `grep -r "@material-ui"
  src` must return nothing.
- Drop `StyledEngineProvider injectFirst` once nothing uses JSS.
- Build, test, lint, visual check. Commit, possibly split by folder if the
  diff is too large to review.

### 3. v6

- Bump to `@mui/material@^6`, `@mui/icons-material@^6`.
- Codemods: `v6.0.0/system-props`, `v6.0.0/sx-prop`, `v6.0.0/styled`,
  `v6.0.0/theme-v6`, and `list-item-button-prop` if step 0 found it.
  Otherwise convert the four `ListItem button` in `containers/support` to
  `ListItemButton` by hand.
- Browser floor rises to Chrome 109 / Safari 15.4.
- Build, test, lint, visual check. Commit.

### 4. v7

- Bump to `@mui/material@^7`, `@mui/icons-material@^7`. Remove `@mui/lab`
  if nothing imports it any more.
- Codemods: `v7.0.0/lab-removed-components`, `v7.0.0/grid-props`,
  `v7.0.0/input-label-size-normal-medium`,
  `v7.0.0/theme-color-functions`.
- `Hidden` is removed: `App.jsx` drawer branches move to `useMediaQuery` or
  `sx={{ display: { xs: 'none', lg: 'block' } }}`.
- Deep imports more than one level down fail, e.g.
  `@mui/material/styles/createTheme` must become `@mui/material/styles`.
- Build, test, lint, visual check. Commit.

### 5. v9

- Bump to `@mui/material@^9`, `@mui/icons-material@^9`.
- Codemods: `deprecations/all` (`*Props` → `slots`/`slotProps`),
  `v9.0.0/system-props` (Box/Typography/Link/Stack/Grid system props → `sx`).
- Grid: `GridLegacy` is gone, so it's `size={{ xs: 12, md: 8 }}` with no `item`.
- Icons: `CheckCircleOutline`, `MailOutline`, `PersonOutline` →
  `*Outlined`.
- Removed props: `Typography paragraph`, `Divider light`,
  `disableEscapeKeyDown`. grep for each.
- Build, test, lint, visual check. Commit.

### 6. Clean-up and docs

- `package.json`: no `@material-ui/*`, `@mui/styles`, `react-jss`; update
  `browserslist` to the v9 floor (see Decisions).
- `docs/architecture.md` and `docs/customising.md`: theming is now
  `createTheme` + Emotion, and custom asset themes use `palette.mode`.
- Mark every Status row, and move anything left over to a follow-up list.

## Decisions to make before step 5

- **Browser floor.** v9 targets Chrome 117, Edge 121, Firefox 121 and
  Safari 17, which is narrower than today's `>0.2%, not dead`. Accept it, or
  stop at v7 until it is acceptable.
- **CRA.** `react-scripts` 5 is deprecated. v9 ships CommonJS alongside
  `.mjs`, so it should build and test under CRA, but that is untested until
  step 5. If it fails there, moving to Vite is its own plan, not part of this
  one.

## Deliberate changes

To be filled in as they happen, e.g. `ListItemIcon` min-width 56px → 36px
in v9, and Tabs/Menu roving tabindex.

- v5: Menus open below their anchor instead of over it, and the alert
  Snackbar sits bottom left on desktop instead of bottom centre. Both follow
  the Material guidelines; restoring them per component wasn't worth it.
- v5: the photo strip (`stories/components/GridList.jsx`) is a scrolling
  flex row, because v5's grid-based ImageList can't show 1.1 columns.

## Notes from running the plan

- Lint baseline on `main`: 43 problems (unresolved imports in unused files
  and a parse error in `registerServiceWorker.js`). "Lint passes" means no
  problems beyond these.
- The codemods write `size="large">` on the prop's line; `eslint --fix`
  (only `react/jsx-closing-bracket-location` fires) puts them back.
- `v5.0.0/preset-safe` renamed the local `./GridList` import in
  `stories/components/PhotoAdd.jsx` to `./ImageList`; restored by hand.
- After changing dependencies, clear `node_modules/.cache` or CRA's cached
  lint reports `import/no-extraneous-dependencies` for the new packages.
- No browser in the session that ran steps 1–5, so the visual check is done
  afterwards by a person, one step commit at a time.

## Visual check (every step)

Start with `yarn start` against the local services. Check light and dark
(`REACT_APP_ASSETS`/palette), at phone width (375px) and desktop:

- home (signed out), sign-in redirect, agreements
- onboarding: all steps, the dashboard nudge
- dashboard with composers and feed
- a person: profile, header and cover, avatar menu, settings (every tab,
  including Danger zone with its step-up dialog)
- a group: profile, settings, admins (Autocomplete), add follower
  (Autocomplete)
- a note, a photo (lightbox), an article, a topic
- hashtags and locations: browse and read
- notifications, search, support, explore
- the app drawer, opening and closing at each breakpoint
