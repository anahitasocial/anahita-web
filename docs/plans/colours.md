# Anahita's colours

*Chosen by the user on 2026-10-25, while building www.anahita.io (roadmap
row 91), for the website and this app alike. The candidates are kept here to
be tried again in the app.*

**Status:** chosen: Ink + signal red. In `src/assets/default/styles/index.js`
here, and `src/theme.js` in anahita.io.

## The choice

| | Light mode | Dark mode |
| --- | --- | --- |
| Primary, ink | `#1F2328` | `#E6E8EB` |
| Secondary, signal red | `#D62828` | `#E57575` |

1. **Ink** matches the black-and-white logo, and sets Anahita apart in the
   fediverse, where Mastodon is indigo, Bluesky blue and Pixelfed purple.
2. **The red is an accent, used sparingly:** the tab underline, a highlight,
   buttons that delete or back out. Red also means an error, so switches,
   checkboxes and radio buttons are ink, not red: a page of red switches
   reads as a page of warnings.
3. **Links** are close to the text's colour with an ink primary, so they keep
   their underline.
4. **The top bar** was the page's own colour, with a fine line beneath it,
   as on the website, until 2026-10-26, when the user had it back in the
   primary colour, which shows each palette of the picker better.

## What makes a pair usable

1. White text on the light primary at 4.5 to 1 or more (WCAG AA), for
   buttons.
2. Dark mode's colours from the light ones: the same hue, lightened until
   they read on the dark page (`#121212`) at about 7 to 1 for the primary and
   6 to 1 for the secondary.
3. On each colour, black or white text, whichever reads better.

## The candidates

Light mode's codes; dark mode's are worked out from them as above. "White"
is how white text reads on the primary.

### Modern, Bauhaus and mid-century (2026-10-25, second round)

| # | Pair | Primary | Secondary | White on primary |
| --- | --- | --- | --- | --- |
| 1 | Bauhaus red + blue | `#C8102E` | `#1B4F9C` | 5.9 |
| 2 | Bauhaus blue + yellow | `#1E4FA0` | `#E0A100` | 7.8 |
| 3 | **Ink + signal red** (chosen) | `#1F2328` | `#D62828` | 15.8 |
| 4 | Primary red + black | `#D0021B` | `#1F2328` | 5.7 |
| 5 | Cobalt + mustard | `#1D4ED8` | `#D4A017` | 6.7 |
| 6 | Slate + vermilion | `#37474F` | `#E34234` | 9.6 |
| 7 | Atomic teal + burnt orange | `#00707A` | `#D9622B` | 5.8 |
| 8 | Avocado + harvest gold | `#556B1F` | `#C9A227` | 6.0 |
| 9 | Walnut + mustard | `#6B4226` | `#D4A017` | 8.6 |
| 10 | Eames orange + charcoal | `#C2410C` | `#37474F` | 5.2 |
| 11 | Olive + coral | `#556B2F` | `#E26D5A` | 5.9 |
| 12 | Sage + rust | `#4F6F52` | `#B5532F` | 5.6 |
| 13 | Forest + terracotta | `#2F5D50` | `#C8553D` | 7.5 |
| 14 | Klein blue + coral | `#002FA7` | `#FF6F59` | 10.7 |
| 15 | Graphite + electric lime | `#2B2D42` | `#84CC16` | 13.5 |
| 16 | Emerald + blush | `#047857` | `#E0457B` | 5.5 |
| 17 | Plum + gold | `#6B2D5C` | `#D4A017` | 9.7 |
| 18 | Midnight + tangerine | `#1E2A4A` | `#F97316` | 14.1 |
| 19 | Oxblood + sand | `#7A1F2B` | `#B89B6E` | 10.2 |
| 20 | Ultramarine + mint | `#3F3FCF` | `#10B981` | 7.4 |

Bauhaus blue + yellow (2) was the runner-up: the blue convention of open
source, accessible, with links naturally distinct.

### Persian (first round, not chosen)

| # | Pair | Light primary, secondary | Dark primary, secondary |
| --- | --- | --- | --- |
| 21 | Turquoise + saffron | `#00796B`, `#B26A00` | `#4DB6AC`, `#FFB74D` |
| 22 | Deep water + pomegranate | `#0E6B7A`, `#B3364A` | `#5BB8C6`, `#F28B9B` |
| 23 | Lapis + gold | `#26619C`, `#A87A1E` | `#8AB4E8`, `#E8C170` |
| 24 | Persian blue + turquoise | `#1C39BB`, `#00897B` | `#9AA8F5`, `#4DB6AC` |

## The colour picker (2026-10-26)

The user asked for the picker back, in this app and on www.anahita.io, with
palettes grouped by style, and kept it because it may stay: a quiet button
at the bottom of the page, on the dev server only (`process.env.NODE_ENV ===
'development'`), opens them; the one chosen is the theme's primary and
secondary at once, in light mode and dark, kept in the browser
(`localStorage`, `anahita-palette`). Here in `src/components/ColourPicker.jsx`
and `src/styles/palettes.js`; on the website in `src/components/ColourPicker.jsx`,
`src/components/SiteTheme.jsx` and `src/data/palettes.js`, where the hero's
gradient is the secondary colour.

Five in each group, the furthest apart; Pride was taken out, since two colours
cannot say a flag. Dark mode's colours are worked out from light mode's as
above.

| Group | Palette | Light | Dark |
| --- | --- | --- | --- |
| Bauhaus | Ink + signal red | `#1F2328`, `#D62828` | `#E6E8EB`, `#E57575` |
| Bauhaus | Bauhaus blue + yellow | `#1E4FA0`, `#E0A100` | `#759FE5`, `#E0A100` |
| Bauhaus | Bauhaus red + blue | `#C8102E`, `#1B4F9C` | `#F4788C`, `#5E93E3` |
| Bauhaus | Slate + vermilion | `#37474F`, `#E34234` | `#8BA2AE`, `#E96C61` |
| Bauhaus | Graphite + yellow | `#2B2B2B`, `#E8B10C` | `#9F9F9F`, `#E8B10C` |
| Mid-Century | Atomic teal + burnt orange | `#00707A`, `#D9622B` | `#00AFBF`, `#DE7545` |
| Mid-Century | Avocado + harvest gold | `#556B1F`, `#C9A227` | `#89AC32`, `#C9A227` |
| Mid-Century | Walnut + mustard | `#6B4226`, `#D4A017` | `#CB926C`, `#D4A017` |
| Mid-Century | Eames orange + charcoal | `#C2410C`, `#37474F` | `#F47D4D`, `#7C96A3` |
| Mid-Century | Forest + terracotta | `#2F5D50`, `#C8553D` | `#5CAD96`, `#D47A67` |
| Space Age | Midnight + tangerine | `#1E2A4A`, `#F97316` | `#8C9FD1`, `#F97316` |
| Space Age | Ultramarine + mint | `#3F3FCF`, `#10B981` | `#9797E5`, `#10B981` |
| Space Age | Graphite + electric lime | `#2B2D42`, `#84CC16` | `#9A9DBD`, `#84CC16` |
| Space Age | Orbit violet + cyan | `#5B21B6`, `#06B6D4` | `#B28DEA`, `#06B6D4` |
| Space Age | Nebula magenta + teal | `#A21CAF`, `#0D9488` | `#DF76E9`, `#0EA497` |
| Art Deco | Gatsby black + gold | `#1A1A1A`, `#B8860B` | `#9F9F9F`, `#BD8A0B` |
| Art Deco | Emerald + gold | `#0B5D4B`, `#C5A253` | `#15B491`, `#C5A253` |
| Art Deco | Sapphire + silver | `#1F3A93`, `#8E9196` | `#879DE6`, `#8F9297` |
| Art Deco | Oxblood + champagne | `#6E1E2B`, `#D8B76A` | `#DE8593`, `#D8B76A` |
| Art Deco | Peacock + copper | `#0F5257`, `#B87333` | `#20B0BB`, `#CA8240` |

## Trying them again in the app

The website had a panel for this, only under its dev server, removed once
the choice was made. To try a pair here, either:

1. **Change the two colours** in `src/assets/default/styles/index.js`
   (`palette.primary.main`, `palette.secondary.main`, each light and dark),
   and look at the app on its dev server; or
2. **Bring the panel back** for a while: a component, shown only when
   `process.env.NODE_ENV === 'development'`, that lists these pairs and sets
   `palette.primary` and `palette.secondary` in the theme from the one
   chosen, kept in `localStorage`, with a slider for each colour's lightness
   and a warning when white on the primary falls below 4.5 to 1. Remove it
   when the choice is made.
