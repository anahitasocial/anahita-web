# MUI upgrade: v4 → v9

*Draft. The research below came from mui.com pages and the npm registry, read
through the web. Check each step against the MUI MCP server
(`@mui/mcp`, <https://mui.com/material-ui/getting-started/mcp/>) before
starting.*

## Context

The app is on Material-UI v4.12.4 (`@material-ui/core`, `/icons`, `/lab`). The
latest is `@mui/material` 9.4.0. v4 styling is JSS (`makeStyles`,
`withStyles`), and its v5+ home, `@mui/styles`, "is not compatible with
React.StrictMode or React 18+, and it will not be updated" — so on React 18 the
styling has to move, not only the imports.

There is no v8: MUI went from v7 to v9 to match MUI X's numbering. No codemod
spans several majors, so the upgrade is a sequence, one commit per step, with a
build and a visual check after each.

**Outcome:** `@mui/material` 9 on Emotion, no JSS, no `@material-ui/*`, same
look apart from deliberate changes.

## Status

`⬜ todo` · `🚧 in progress` · `✅ done` · `⛔ blocked`

| step | state | commit |
| --- | --- | --- |
| 0. Verify this plan against the MUI MCP docs | ⬜ | |
| 1. v5 + Emotion, `preset-safe` codemod, theme | ⬜ | |
| 2. JSS out: 51 `makeStyles`, 21 `withStyles` | ⬜ | |
| 3. v6 | ⬜ | |
| 4. v7 | ⬜ | |
| 5. v9 | ⬜ | |

## Steps

### 1. v5 and Emotion

- Install `@mui/material@5`, `@mui/icons-material@5`, `@emotion/react`,
  `@emotion/styled`. Pin `react-is` to ^18.3 (MUI depends on `react-is@^19`;
  React 18 apps must pin it).
- `npx @mui/codemod@latest v5.0.0/preset-safe src` — import renames,
  `justify`→`justifyContent`, prop renames. Then `v5.0.0/variant-prop` to keep
  TextField/Select/FormControl on `standard`: 30 of the 56 have no `variant` and
  would otherwise turn `outlined`.
- Theme, `src/styles/index.js` and `src/assets/default/styles/index.js`:
  `palette.type` → `palette.mode`, drop `typography.useNextVariants`.
- Lab → core: Alert (`containers/Alerts.jsx`, `auth/WebAuthn/index.jsx`,
  `agreements/index.jsx`) and Autocomplete (`actors/Settings/admins/Add.jsx`,
  `actors/Socialgraph/Add/Select.jsx` — `getOptionSelected` →
  `isOptionEqualToValue`, `renderOption(option)` → `(props, option)`).
- `theme.spacing()` returns a string (`'16px'`) from v5:
  - `actors/Read/ActorHeader.jsx:25,32` — `-theme.spacing(15)` becomes NaN;
    use `theme.spacing(-15)`.
  - `App.jsx:65` — `` `0 ${theme.spacing(2)}px` `` becomes `16pxpx`.
- `breakpoints.down(x)` no longer includes `x`: `App.jsx:80`,
  `media/Stepper/Lightbox/styles.js:24,103` move one breakpoint.
- `withWidth` (`locations/Read`, `hashtags/Read`) — the value appears unused;
  remove.
- Remove the unused `react-jss` dependency.

### 2. JSS out

72 files, 215 `classes.x` references. Either `v5.0.0/jss-to-tss-react` (keeps
the shape, `tss-react` supports `@mui/material` 5–9) or by hand to
`styled`/`sx`, which MUI prefers. Proposed: `sx` for one-off layout, `styled`
for anything reused, `tss-react` only where a file is too large to rewrite
safely. 20 files deep-import `@material-ui/core/styles/withStyles`.

### 3. v6

`list-item-button-prop` (`ListItem button` ×4 in `containers/support/index.jsx`),
`system-props`. Browser floor: Chrome 109, Safari 15.4.

### 4. v7

`lab-removed-components`, `grid-props`. `Hidden` is removed — `App.jsx` drawer
branches (`lgUp`/`mdDown`) move to `useMediaQuery` or `sx` display
breakpoints. Deep imports more than one level fail. `createMuiTheme` gone (not
used).

### 5. v9

- `deprecations/all`: `*Props` → `slots`/`slotProps` (`InputProps` ×7,
  `InputLabelProps` ×9, `PaperProps`, `ModalProps`, `SelectProps` ×1 each;
  `inputProps` ×48 — check whether it survives).
- `v9.0.0/system-props`: Box/Typography system props → `sx` (17 in 12 files).
- Grid: `GridLegacy` removed; `size={{ xs: 12 }}`, no `item` (30 in 8 files).
- Icons: `CheckCircleOutline`, `MailOutline`, `PersonOutline` → `*Outlined`.
- `ListItemIcon` min-width 56px → 36px; Tabs and Menu use roving tabindex.
- Browser floor: Chrome 117, Edge 121, Firefox 121, Safari 17 — narrower than
  the app's browserslist.

## Risks

1. The 72 JSS files — the bulk of the work.
2. `App.jsx`: `Hidden`, `ModalProps`, the `px` string, `down('md')`.
3. The two Autocomplete files.
4. The v9 browser floor.
5. CRA (`react-scripts` 5) is deprecated. v9 ships CJS as well as `.mjs`, so
   it should build and test under CRA — untested.

## Verification

After each step: `yarn build`, `CI=true yarn test`, and a walk through the
main pages (home, dashboard, a profile and its settings, a group, a note, a
photo, hashtags, locations, onboarding, agreements, support), in light and
dark, at phone and desktop widths.
