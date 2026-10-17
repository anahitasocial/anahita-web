# anahita-web

## Material UI docs

This repo configures the MUI MCP server (`mui-mcp`, in `.mcp.json`). For any
question or change involving Material UI:

1. Call `useMuiDocs` for the documentation of the relevant MUI package.
2. Call `fetchDocs` for further pages, using only URLs the previous calls
   returned.
3. Repeat until everything relevant is gathered, then answer from what was
   fetched, not from memory.

The app is on `@mui/material` v9 throughout. The upgrade from Material-UI v4
(`@material-ui/*`) is finished and nothing imports the old packages; see
`docs/plans/done/mui-upgrade.md`.

## Web interface (anahita-web)

- Buttons in forms and dialogs are full width and side by side in one row,
  never stacked: Cancel on the left, the main action on the right
  (`<Stack direction="row" spacing={1}>`, as in `ReplyForm.jsx`).
- Spacing (margins, paddings, gaps) in whole 8-pixel steps.
- Menu items carry an icon before their label (`MenuItemLabel.jsx`).
- Infinite scroll, not "Show more", including inside dialogs
  (`react-infinite-scroll-component` with `scrollableTarget`).
- No jiggly UI: a form or dialog must not change height as somebody types.
  Reserve the error line (`helperText={error || ' '}`), or put what appears
  where it moves nothing.
- Keep the profile's tab row for content. Lists about a profile open in a
  dialog from a count. Things private to the viewer go in the left menu or
  settings. Prefer dialogs over new tabs.
- Facts about a profile go in its About card, not in a wide banner.
- A card's main action goes in its action area at the bottom. Keep the
  action row on a list card short: Download only on a post's own page.
  Share is always the last action, after Download.
- No delete button inside an edit form when the list or page already has
  one.
- Person settings have a Fediverse tab for network settings.
- Check every UI change yourself before handing it over: headless Chrome
  (puppeteer-core) against the dev stack, at desktop (1280×900) and phone
  (390×844, touch) sizes; look at the screenshots, and check the API's
  answer and the rows in MySQL. Say what headless Chrome can't tell
  (Safari, real keyboards, feel).
- Use user's own dev server on :3000. Never leave one of your own on that
  port, and never delete `node_modules/.cache` while it runs.
- Delete test posts afterwards.

## Working with User

- Number every list in replies (1., 2., 3.), not bullets, so items can be
  referred to by number. Keep the numbers stable when a list is repeated.
- Roadmap rows are referred to by number. Check `docs/plans/roadmap.md` and
  the row's plan file before starting work, and update the plan's status as
  work lands.
- When a name or direction is still open, settle it before making bulk
  changes.
- One branch per milestone (or per feature), one commit per item, in each
  repo. user pushes and merges. Branch from an up-to-date `main`
  (`git fetch` first). Don't suggest merging mid-milestone.
- `gh` is not installed: write PR text for user to paste.
- Before beginning a milestone, check the docs of both repos against the
  code.

  ## Product principles

- Fediverse first: ActivityPub and AT Protocol natively; nothing that
  doesn't federate sensibly. Federation is opt-in per person: sharing must
  be consensual.
- The default feed is chronological. No site-wide "For You". A ranked feed
  is one a person makes, and is always called a **custom feed**.
- No tracking of who viewed what: no profile analytics, share counts or
  viewer lists.
- Old and useful counts as much as new. Anahita builds knowledge systems as
  well as news: never push content down only for being old. Weigh whether
  it is still found useful, and leave how fast the past fades to the
  operator.
- Anahita is for operators and outside builders (schools, newsrooms,
  libraries, research groups, non-profits) leaving Meta and X. Its breadth
  (groups, events, articles, custom feeds) is the product, not its
  lightness.

  ## Wording

- A group has **followers**, never members ("abonnés" in French). "Member"
  is fine for somebody with an account on the site.
- "Profile", not "actor" or "account", in anything people read. "Actor" is
  the code's word. "Account" is fine for sign-in and credentials.
- One follow wording everywhere: **+ Follow** (a plus icon, then Follow),
  with no name after it: no "Follow back" or "Follow #tag".
- Action labels carry no entity name: "Delete", "Edit", "View", not
  "Delete reply". Keep a name only where two actions in one menu would read
  the same.

  ## Docs

- Docs are for people: descriptive, plain and current. One set for people
  and AI alike.
- Use the same term for the same thing every time. Give exact paths,
  settings, endpoints and defaults, in tables where there are several.
- Remove "not built yet" lines the moment something is built.
- A phase isn't done until its docs are updated.
- When a roadmap row is done, move its plan to `docs/plans/done/` in the
  same commit, and fix every link to it.
