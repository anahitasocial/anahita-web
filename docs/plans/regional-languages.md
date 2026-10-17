# Regional English and French

*Roadmap row 85, planned 2026-10-17. See the [roadmap](roadmap.md) for order
and dependencies.*

## Context

The web app has two languages, `en-GB` and `fr-FR`, and shows only one:
`lng: 'en'` in `src/languages/index.js` fixes it to English, and the
browser's language detector, installed, is never asked. Dates and numbers
do not follow the language either. Where the code names no locale they are
formatted by `en`, which `Intl` reads as American; in other places `en-GB`
is written in (`src/utils/events.js`, `src/utils/exports.js`,
`src/components/EventDateTile.jsx`).

The user asked on 2026-10-17 for English for Canada as the base and the
default, American English and Quebec French as layers, and French from
France as the French base. Rows 86 to 89 (German, Spanish, Portuguese, and
a test that every language has every string) come after this one and need
it: it makes the languages a set the browser chooses from.

## Decisions

Settled with the user on 2026-10-17:

- **`en-CA` is the base and the default.** Today's strings are British, and
  Canadian already except for *recognise* (two strings).
- **`en-US` is a layer** of only the strings that differ.
- **`fr-FR` stays the French base; `fr-CA` is a layer** of only the strings
  that differ.
- **British English is dropped** until an operator asks for it.
- **The browser's language chooses** among them. The operator sets the
  site's default with a build variable, `REACT_APP_LANGUAGE`, as the site's
  name and theme are set. Nothing is read from the server for it.
- **A person cannot choose a language in their settings yet.** The row does
  not ask for it; it is a later item.
- **Dates and numbers follow the language shown.**

## Design

### 1. The languages as a set

| Language | Directory | Holds | Falls back to |
| --- | --- | --- | --- |
| `en-CA` | `src/languages/en-CA/` | Every string (today's `en-GB`, renamed) | — |
| `en-US` | `src/languages/en-US/` | Only the strings that differ | `en-CA` |
| `fr-FR` | `src/languages/fr-FR/` | Every string | `en-CA` |
| `fr-CA` | `src/languages/fr-CA/` | Only the strings that differ | `fr-FR`, then `en-CA` |

A layer is a set of namespaces with only the keys that differ; i18next's
`fallbackLng` reads the rest from the base. `supportedLngs` lists the four.

**How the browser's language is matched**, in `src/languages/index.js`:

| The browser asks for | Shown |
| --- | --- |
| `en-US` | `en-US` |
| `en-CA`, `en-GB`, `en-AU`, `en`, any other English | `en-CA` |
| `fr-CA` | `fr-CA` |
| `fr-FR`, `fr-BE`, `fr-CH`, `fr`, any other French | `fr-FR` |
| Anything else | `REACT_APP_LANGUAGE`, `en-CA` when unset |

The detector reads the browser's languages in order (`navigator.languages`),
so somebody whose browser prefers German and then French sees French. The
choice is not kept in the browser's storage: it is made again on each
visit, so a change of browser language takes effect.

The page's `<html lang>` is set to the language shown, for screen readers
and for the browser's own spelling and hyphenation.

### 2. English

- `en-GB` becomes `en-CA`; *recognise* becomes *recognize* (onboarding, and
  a scope refused in settings).
- `en-US` holds nine strings: *cancelled* to *canceled* (seven: events,
  notifications, and two-factor setup), *Licence* to *License* (About),
  *grey* to *gray* (the example of alt text).

### 3. French

**First, `fr-FR` uses one word for one thing**, as the English does:

| Thing | Today | Proposed for `fr-FR` |
| --- | --- | --- |
| Email | *e-mail* (15), *email* (15), *courriel* (6) | *e-mail* |
| Hashtag | *hashtag* (12), *mot-dièse* (7), *mot-clic* (1) | *hashtag* |
| A post, in three notifications | *post* | *publication*, as everywhere else |

**Then `fr-CA`**, a layer with the Office québécois de la langue française's
words where France's differ: *courriel* for *e-mail*, *mot-clic* for
*hashtag*, and the strings that use them. About 40 strings; the list is
made when the strings are, and read by somebody who speaks Quebec French
before an operator relies on it.

**Spaces before `?`, `!` and `;`.** France puts a space before them; Quebec
does not. 98 strings in `fr-FR` have an ordinary space there. A rule does
it when the language is shown, not a copy of every string: an i18next post
processor that, for `fr-CA`, takes the space out, and for `fr-FR` makes it
a narrow no-break space (U+202F), so that a `?` is never carried to a line
of its own. The strings themselves are not changed.

### 4. Dates and numbers

Every date, time and number is formatted in the language shown:

| Where | Today | Becomes |
| --- | --- | --- |
| Event times and date tiles (`src/utils/events.js`, `EventDateTile.jsx`, `events/When.jsx`) | `en-GB` written in | `i18n.language` |
| Archive dates (`src/utils/exports.js`) | `en-GB` by default | `i18n.language` |
| Dates with no locale (`toLocaleDateString()`, 13 places) | The browser's | `i18n.language` |
| `moment` (15 files) | English only | Its locale set when the language changes: `en-ca`, `en`, `fr`, `fr-ca` |
| Counts (`shortCount`), custom feed dates | `i18n.language`, which is `en` | Unchanged, now the real language |

The time zone stays the reader's own, as today. Only the way a date is
written changes.

### 5. The operator's default

`REACT_APP_LANGUAGE`: one of the four, `en-CA` when unset. A value that is
none of the four is treated as unset, with a warning in the console in
development.

## What stays the same

- The keys and namespaces: nothing in the components changes, apart from
  where a locale was written in.
- A post's own language (`src/utils/postLanguage.js`) is what its author
  marked, and has nothing to do with the language of the app.
- Server messages and emails are the server's; this row changes neither.

## Documentation

| Page | Change |
| --- | --- |
| `docs/customising.md`, Languages | The four languages, bases and layers, how the browser's language is matched, and adding a language or a layer |
| `docs/architecture.md`, Translations | The same, shortly, with where the matching and the post processor are |
| `docs/configuration.md` | `REACT_APP_LANGUAGE` |
| `AGENTS.md` | "Every string is in `src/languages/en-CA` and `fr-FR`"; a layer's strings when they differ |

## Verification

- Tests: the matching table above, case by case; the post processor for
  both kinds of French; every layer key exists in its base.
- Headless Chrome against the development stack, with the browser's
  language set to `en-US`, `en-CA`, `en-GB`, `fr-FR`, `fr-CA` and `de-DE`,
  at desktop (1280×900) and phone (390×844): the home page, an event, the
  composer, settings, and a notification. Each screenshot looked at for the
  words, the dates and the spacing of French punctuation.
- What headless Chrome cannot tell: how a real Quebec or French reader takes
  the words.

## Open questions

1. **The one word for email in `fr-FR`:** *e-mail*, as proposed, or
   *courriel*, which France's official terminology prefers and Quebec uses?
2. **The one word for hashtag in `fr-FR`:** *hashtag*, as proposed and as
   French Mastodon says, or *mot-dièse*, France's official word?
3. **Who reads the `fr-CA` strings** before they are relied on?

## Estimate

| Part | Time |
| --- | --- |
| 1. The set, the matching, `<html lang>` | 2 h |
| 2. English: `en-CA` and `en-US` | ½ h |
| 3. French: one word each, `fr-CA`, the post processor | 2 h |
| 4. Dates and numbers | 1½ h |
| 5. The default, the docs, the checks in a browser | 1½ h |
| **Total** | **about 7–8 h, 2 sessions** (the row said 1) |

## Status

| Item | State |
| --- | --- |
| Plan | written 2026-10-17 |
| Implementation | not begun |
