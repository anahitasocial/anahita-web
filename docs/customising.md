# Customising

[Documentation](README.md) › Customising

Making an installation your own: its name, look, languages and legal
documents.

## Contents

- [Name and description](#name-and-description)
- [Themes](#themes)
- [Languages](#languages)
- [Terms of Service and Privacy Policy](#terms-of-service-and-privacy-policy)
- [Where the code is](#where-the-code-is)

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

The app is in four languages. Two are bases, with every string; two are
layers, with only the strings that differ from their base:

| Language | Directory | Holds | Falls back to |
| --- | --- | --- | --- |
| English (Canada), `en-CA` | `src/languages/en-CA/` | Every string | — |
| English (United States), `en-US` | `src/languages/en-US/` | The strings that differ: *canceled*, *license*, *gray* | `en-CA` |
| French (France), `fr-FR` | `src/languages/fr-FR/` | Every string | `en-CA` |
| French (Quebec), `fr-CA` | `src/languages/fr-CA/` | The strings that differ: *courriel* for *email*, *mot-clic* for *hashtag* | `fr-FR`, then `en-CA` |

Each file in a directory is a namespace of strings, and `index.js` gathers
them. A string a language does not have is read from the one it falls back
to.

**Which language a visitor sees** is chosen from their browser's languages,
in their order, by `src/languages/choose.js`:

| The browser asks for | Shown |
| --- | --- |
| `en-US` | `en-US` |
| Any other English: `en-CA`, `en-GB`, `en-AU`, `en` | `en-CA` |
| `fr-CA` | `fr-CA` |
| Any other French: `fr-FR`, `fr-BE`, `fr-CH`, `fr` | `fr-FR` |
| None of these | The site's default, `REACT_APP_LANGUAGE`; `en-CA` when unset |

So somebody whose browser prefers German, then French, sees French. It is
chosen again on each visit. Dates, times and numbers are written in the
language shown, and the page's `lang` follows it.

**The space before `?`, `!` and `;`** is written once in the French strings,
as an ordinary space, and made as each string is shown
(`src/languages/frenchSpacing.js`): a narrow no-break space in `fr-FR`, so
the mark never starts a line, and none in `fr-CA`.

To add a language:

1. Copy `src/languages/en-CA` to a directory named for the new locale, for
   example `de-DE`, and translate its files. Keep every key.
2. Import it in `src/languages/index.js` and add it to `resources`.
3. Add it to `LANGUAGES` and `FALLBACK` in `src/languages/choose.js`, and say
   in `match` which of the browser's languages it is shown for.

To add a layer, such as `fr-BE`, make a directory with only the strings that
differ, and give it its base in `FALLBACK`. The tests check that a layer has
no key its base does not.

When you add a string to the app, add it to both bases. Add it to a layer
only when it differs there. The Canadian English files are the reference.

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

## Where the code is

| What | Where |
| --- | --- |
| Choosing the theme (`REACT_APP_ASSETS`) | `src/assets/index.js` |
| The default theme | `src/assets/default/` |
| Applying a theme's styles over the app's defaults | `src/styles/index.js` (`createTheme`) |
| A theme's Markdown pages, at `/pages/:alias` | `src/assets/default/pages/`, `src/containers/page/index.jsx` |
| The page title and meta tags | `src/components/HeaderMeta.jsx` |
| The languages, and the one in use | `src/languages/index.js`, `src/languages/en-CA/`, `en-US/`, `fr-FR/`, `fr-CA/` |
| Choosing the language from the browser's | `src/languages/choose.js`, tested in `src/languages/__tests__/languages.test.js` |
| The space before `?`, `!` and `;` in French | `src/languages/frenchSpacing.js` |
| The legal documents and their versions | `src/statics/legal/` |
| Who must accept a new version | `src/utils/agreements.js` (`needsAcceptance`), tested in `src/utils/__tests__/agreements.test.js` |
| The page that asks for it, at `/agreements` | `src/containers/agreements/` |
| The documents as pages, at `/legal/tos` and `/legal/privacy` | `src/containers/legal/index.jsx` |
