# Customising

[Documentation](README.md) › Customising

Making an installation your own: its name, look, languages and legal
documents.

## Contents

- [Name and description](#name-and-description)
- [Themes](#themes)
- [Languages](#languages)
- [Terms of Service and Privacy Policy](#terms-of-service-and-privacy-policy)

## Name and description

`REACT_APP_NAME` and `REACT_APP_DESCRIPTION` set the installation's name and
one-line description. They are used throughout the app and in the page title
and meta tags in `public/index.html`. See [Configuration](configuration.md).

## Themes

A theme is a directory under `src/assets/`. The app uses the one named by
`REACT_APP_ASSETS`, or `src/assets/default` when it is unset.

To make your own, copy the default and point the app at the copy:

```sh
cp -r src/assets/default src/assets/mysite
```

```sh
REACT_APP_ASSETS=mysite
```

A theme exports, from its `index.js`:

| Part | Directory | What it controls |
| --- | --- | --- |
| `logo` | `media/logo` | The logo in the menu, in a version for light mode and one for dark |
| `opengraph` | `media/og` | An image for link previews. Exported, but nothing in the app uses it yet |
| `Home` | `home/` | The home page signed-out visitors see |
| `navs` | `navs/` | The left menu |
| `styles` | `styles/` | The Material UI theme: fonts and colours, for light and dark mode |
| `pages` | `pages/` | Markdown pages for the site, such as `contact.md` and `join.md` |

A theme is compiled into the bundle, so changing one means rebuilding. Keep
the parts' names and exports as they are in the default theme; the app imports
them by those names.

`styles/index.js` exports `global({ colors, prefersDarkMode })`, which returns
[Material UI theme options](https://mui.com/material-ui/customization/theming/)
for `createTheme`. `prefersDarkMode` follows the visitor's system setting, so
set `palette.mode` from it (`'dark'` or `'light'`) and choose colours for
each. Options you return are applied over the app's defaults; to change how a
component looks everywhere, add it under `components`, for example
`components: { MuiButton: { defaultProps: { disableElevation: true } } }`.

## Languages

Translations are in `src/languages/`, one directory per locale. `en-GB` and
`fr-FR` are included. Each file is a namespace of strings, and `index.js` in
each directory gathers them.

To add a language:

1. Copy `src/languages/en-GB` to a directory named for the new locale, for
   example `de-DE`, and translate its files. Keep every key; a missing key
   shows the key itself instead of text.
2. Import it in `src/languages/index.js` and add it to `resources`.

The app is currently fixed to English: `lng: 'en'` in
`src/languages/index.js`. To use another language, change `lng`. To follow each
visitor's browser, remove `lng` and let the language detector, which is
already installed, choose.

When you add a string to the app, add it to every language. The English files
are the reference.

## Terms of Service and Privacy Policy

The documents are Markdown files in `src/statics/legal/`:

| Document | File | Shown at |
| --- | --- | --- |
| Terms of Service | `tos.md` | `/legal/tos` |
| Privacy Policy | `privacy.md` | `/legal/privacy` |

**The ones in this repository are boilerplate. Replace them with your own
before going live.**

Each document has a version in `src/statics/legal/index.js`. **When you change
a document, raise its version.** Every signed-in person whose accepted version
is older is sent to `/agreements`, and must accept the new one before they can
use the app again. This applies to existing members and new ones alike.

- Versions are compared as numbers, part by part: `1.0.0` to `1.0.1` or
  `1.1.0` asks everybody again. Going back down asks nobody.
- Use digits and dots only, up to three parts. The server refuses anything
  else.
- The two documents are versioned separately. Raise only the one whose text
  changed, or people are asked to accept a document they have already
  accepted.
