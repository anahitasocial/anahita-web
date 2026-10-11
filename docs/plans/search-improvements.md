# Search: recent searches, and a search that keeps its place

*Roadmap item 36, raised by the user on 2026-10-11 ("jazz up our search so it caches recent searches"). Not scheduled. See the [roadmap](roadmap.md).*

## Context

The search box in the top bar is a plain form: type, press Enter, and the page reloads on `/search/?q=…`. It remembers nothing. Somebody who looks for the same group every morning types its name every morning.

This plan is recent searches first, which is what was asked for, and then three small things found while reading the search page that make it feel finished. Each part stands alone and can be built without the others.

## What exists

- **The box:** `src/components/SearchBox.jsx`, an HTML form that submits to `/search/`, with a full page load. No suggestions, no history.
- **The page:** `src/containers/search/Browse/index.jsx`. Tabs All, Media, Actors and Feeds (`scope`), an order (Relevant, Most recent) and a distance slider. The term is in the address (`?q=`). The tab can be given in the address (`?scope=feeds`) and is then kept only in the page's own state, as the order and the distance are: reload, or come back to the page, and they are as they started.
- **The server:** `GET /search/?term=&scope=&sort=…` on search-service. The term is required. Feeds have been among the results since row 19.
- **Browser storage in the app:** used for a handful of the viewer's own conveniences (`utils/postLanguage.js`, `utils/share.js`, the home page's layout), each read and written inside try/catch.

## Part 1: Recent searches

**What somebody sees**

- Focusing the empty search box opens a short list under it: their last searches, most recent first, with a clock icon beside each.
- Pressing one searches for it again. Typing narrows the list to the ones that start with, or contain, what was typed.
- Each has an ✕ to forget that one, and the list ends with **Clear recent searches**.
- Arrow keys move through the list and Enter chooses, like any list under a field.

**Where they are kept: in the browser, and nowhere else**

- `localStorage`, under a key that includes the viewer's id (`search.recent.<id>`), so two people who share a computer do not see each other's. A visitor who is not signed in has none.
- **Nothing is sent to the server and nothing is stored there.** What somebody looked for is theirs. This is the same reasoning as views and shares: the installation does not keep a record of what people look at. It also means recent searches do not follow somebody to another device, which is the cost of that choice.
- Cleared on signing out, so a shared computer is left clean.
- Read and written inside try/catch: where storage is unavailable (a private window, a full disk) search works as it does today.

**The rules**

- Ten at most. An eleventh pushes the oldest out.
- A search is remembered when it is run, not as it is typed.
- The same search again moves it to the top and is not kept twice. Compared without regard to case or to space at the ends; kept as it was last typed.
- Nothing shorter than two characters, and nothing longer than the 100 the server takes.
- The tab searched under is kept with the term, so choosing "seeds" last searched under Feeds opens Feeds.

**How it is built**

- `src/utils/recentSearches.js`: `list(viewerId)`, `add(viewerId, term, scope)`, `remove(viewerId, term)`, `clear(viewerId)`. Pure but for storage, which is passed in for the tests.
- `SearchBox.jsx` becomes an MUI `Autocomplete` in free-solo mode with the recent searches as its options (check its docs through the MUI MCP server first, per `CLAUDE.md`). Submitting goes through the router (`navigate('/search?q=…')`) and not a form post, which also removes the full page load.
- The search page calls `add` when it runs a search, so a search reached by a link is remembered too.
- `actions/session` clears them on sign-out.
- Strings in en-GB and fr-FR.

## Part 2: The search page keeps its place

The tab, the order and the distance go in the address beside the term (`?q=seeds&scope=feeds&sort=recent`). Reloading, the browser's Back, and a link somebody sends all open the page as it was. Today only the term survives.

The distance is left out of the address when it is at its widest, and the order when it is the default, so the plain address stays plain.

## Part 3: Words for an empty search

Today a search that finds nothing shows an empty page, and so does the Feeds tab before anything is typed.

- **Nothing found:** "Nothing matches “seeds”", with the other tabs offered if they would have something ("3 under Feeds"). The counts are one request each (`limit=1`, reading `pagination.total`) and are asked for only when the open tab is empty.
- **Nothing typed:** the recent searches, in the page, and nothing else.

## Part 4: As you type (later, and only if wanted)

A few results under the box while typing: the first profiles and groups that match, before Enter. It is what people now expect of a search box and is the one part with a real cost: a request on every pause in typing, against a query that uses `LIKE '%term%'` and is not indexed for it.

Left out unless asked for. If it is, it should wait 300 ms after the last key, ask only for actors (`scope=actors&limit=5`), ask nothing under three characters, and drop an answer that arrives after a newer question.

## Decided against

- **Keeping searches on the server.** See Part 1.
- **Popular or trending searches.** That is a record of what everybody looked for, which is the thing above, added up.
- **Search suggestions from other people's searches.** The same.

## Estimate

| Part | Time |
| --- | --- |
| 1. Recent searches: the helper and its tests, the box as an Autocomplete, the page remembering, sign-out, strings | 3–4 h |
| 2. Tab, order and distance in the address | 1 h |
| 3. Words for an empty search, with counts for the other tabs | 1–2 h |
| **Parts 1 to 3** | **5–7 h, about a session and a half** |
| 4. As you type | 2–3 h more |

## How it would be checked

- Search for three things, focus the empty box: the three, newest first. Search for the first again: it moves to the top and is there once.
- An eleventh search drops the oldest. ✕ forgets one, Clear forgets all, and both hold after a reload.
- Sign out and in as somebody else on the same browser: none of the first person's searches. Sign back in as the first: none either, since signing out cleared them.
- In a private window with storage refused, searching works and no error is shown.
- The browser's network log shows no request when the list opens, and none carrying a past search.
- Open `/search?q=seeds&scope=feeds&sort=recent` in a new tab: Feeds, most recent first. Reload: the same.

## Dependencies

- None. Part 1 does not need the others.
- **Soft:** row 21 (the web shell) changes how the app is served, not how search works.

## Documentation

A phase is finished only when these pages match the code.

- **web `architecture.md`:** the search box and recent searches, that they are kept in the browser only, and what the search page keeps in its address.

## Status

| Item | State |
| --- | --- |
| Plan | written 2026-10-11 |
| Implementation | not started |
