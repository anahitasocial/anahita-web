# Working on anahita-web

Anahita's web app: React with Material UI, talking to the Go services in
anahita-services. This file is for anybody changing the code, a person or
an agent. It holds only what the code cannot tell you; everything else is in
the docs.

1. Website: <https://www.anahita.io>
2. Founder & Core Architect: Rastin Mehr
3. Maintained and developed by rmd Studio, <https://www.rmdstudio.com>
4. Commercial inquiries: <https://www.rmdstudio.com/contact>

## Where to begin

| To learn | Read |
| --- | --- |
| What there is, page by page | [`docs/README.md`](docs/README.md) |
| How the app is built | [`docs/architecture.md`](docs/architecture.md) |
| Running it against the services | [`docs/getting-started.md`](docs/getting-started.md) |
| What is planned, and in what order | [`docs/plans/roadmap.md`](docs/plans/roadmap.md) |
| The services, the API and its reference | anahita-services: `docs/README.md` and `docs/api/` |

Roadmap rows are referred to by number. Read the row and its plan before
starting one, and keep the plan's status up to date as work lands.

## Material UI

The app is on `@mui/material` v9 throughout; nothing imports the old
`@material-ui/*` packages. This repository configures the MUI MCP server
(`mui-mcp`, in `.mcp.json`). For any question or change involving Material
UI:

1. Call `useMuiDocs` for the documentation of the relevant MUI package.
2. Call `fetchDocs` for further pages, using only addresses the previous
   calls returned.
3. Repeat until everything relevant is gathered, then answer from what was
   fetched, not from memory.

## The interface

The tone, for everything people see: calm and restrained, as if Jony Ive
had designed it. Fewer things on the screen, each where it is expected;
quiet type, small inside cards; one clear main action, short labels, and
the explanation in plain words beside them. Nothing shouts, wraps, overlaps
or repeats. When in doubt, take something away. The rules below are this
tone made specific; where they are silent, follow it.

1. A button's label is short, three words at most, and never wraps:
   "Close", not "Record what was done". What a choice means goes in a line of
   text beside the buttons, not in the label. Backing out is always "Cancel".
2. Buttons in a card's or a dialog's action row, when one backs out
   (Cancel, Dismiss, Decline) beside the main action, are full width and
   side by side, never stacked: the one that backs out first, then the main
   action, the only contained one (the user, 2026-10-20). A button alone
   there is normal size, aligned right (`sx={{ justifyContent: 'flex-end' }}`
   on a card's row). A dialog's padding is in the theme (`MuiDialogActions`).
   Full width alone only where a button is the whole of a page or a step
   (Sign in, Continue, onboarding), for a row of equal answers, for the
   actions on a profile or a post, and for "Show more" at a list's foot.
3. Calm, not busy: one flat list, never indented lists under headings inside
   it. A choice with many options under it opens a select right under the
   choice (`ReportDialog.jsx`, "Which rule").
4. A list of more than three items is numbered, so that one can be pointed
   to ("rule 4"); three or fewer are not (`utils/lists.js`).
5. Nothing overlaps, and nothing is said twice. A status chip sits beside a
   title that wraps (`minWidth: 0` on the text), and a title made from a
   post's opening is not followed by the same text.
6. Type stays small inside cards: `subtitle1` for a card's title, `body2` for
   what explains it; `h6` only for a section's heading.
7. Spacing (margins, paddings, gaps) in whole 8-pixel steps.
8. Menu items carry an icon before their label (`MenuItemLabel.jsx`).
9. Infinite scroll, not "Show more", inside dialogs too
   (`react-infinite-scroll-component` with `scrollableTarget`).
10. A new reply is one line that sends on Enter, with the whole form a step
    away in a dialog (`ReplyBox.jsx`); on a touch screen Enter is a new line.
11. Nothing jumps: a form or dialog keeps its height as somebody types.
    Reserve the error line (`helperText={error || ' '}`), or put what appears
    where it moves nothing.
12. A profile's tab row is for content. Lists about a profile open in a
    dialog from a count; what is private to the viewer goes in the left menu
    or settings. Prefer dialogs to new tabs.
13. Facts about a profile go in its About card, not in a wide banner.
14. A card's main action goes in its action area at the bottom:
    `CardActions`, after `CardContent`, never inside it. Keep a list
    card's action row short: Download only on a post's own page. Share is
    always the last action, after Download.
15. No Delete inside an edit form when the list or page has one already.
16. A person's settings have a Fediverse tab for network settings.
17. Every string is in every base, `src/languages/en-CA`, `fr-FR`, `de-DE`,
    `es-419` and `pt-BR`; in a layer (`en-US`, `fr-CA`) only when it differs there. `yarn test` fails on
    a base missing one. The translations are Claude's; the docs say so.

## Checking a change

Look at every interface change yourself before handing it over: headless
Chrome (puppeteer-core) against the development stack, at desktop
(1280×900) and mobile (390×844, touch) sizes. Look at the screenshots, and
check the API's answer and the rows in MySQL. Say what headless Chrome
cannot tell: Safari, real keyboards, how it feels. Delete what you posted to
try it.

People and places made up for a test, or to try a change, are named after
Star Trek characters and places.

## Product principles

The same in anahita-services' AGENTS.md.

1. Fediverse first: ActivityPub and AT Protocol natively; nothing that does
   not federate sensibly. Federation is opt-in for each profile: sharing is
   consented to, never assumed.
2. The default feed is chronological. There is no site-wide "For You"; a
   ranked feed is one a person makes, and is always called a **custom feed**.
3. Nobody is tracked: no profile analytics, share counts or viewer lists.
4. Old and useful counts as much as new: nothing is pushed down only for
   being old, and how fast the past fades is the operator's choice.
5. The breadth (groups, events, articles, custom feeds) is the product, for
   schools, newsrooms, libraries, research groups and non-profits leaving
   Meta and X.

## Wording, in anything people read

1. A group has **followers**, never members ("abonnés" in French). "Member"
   is somebody with an account on the site.
2. **Location**, as Instagram has it, for a place posts are tagged with; "Place"
   only for the ActivityStreams type a post from elsewhere carries.
3. **Profile**, not "actor" or "account". "Actor" is the code's word;
   "account" is for signing in.
4. **Admins** look after a group or a website: in labels and in sentences,
   "Add admins", "its first admin". An event's are its **hosts**.
   **Administrator** and **super administrator** are only the account
   types, the site's own: "Administrators only", "Tell the administrators".
5. **Profile photo** and **cover photo** for a profile's two pictures,
   never "avatar", which is the code's word.
6. **Account type** for registered, administrator or super administrator,
   never "user type", "person type" or "role"; `person_type` is the code's
   word.
7. **+ Follow** (a plus icon, then Follow), with no name after it: no
   "Follow #tag". **+ Follow back** for somebody who follows the viewer
   already.
8. Action labels name no entity: "Delete", "Edit", "View", not "Delete
   reply", unless two actions in one menu would otherwise read the same.
9. Releases are **Embryo** (the main branch) and **Birth** (a tagged
   release), not alpha and beta.

## Naming in code

BREAD, in code and in addresses: **Browse, Read, Edit, Add, Delete**
(the user, 2026-11-07). `/feeds/add`, not `/feeds/new`; `edit`, not
`update`; `browse`, not `list`; `deleteItem` in the API client, where
`delete` is a word JavaScript keeps. What a person does that is not one of
the five keeps its own verb (`follow`, `rsvp`, `approve`). Labels may say
otherwise ("Create"), though BREAD is preferred there too.

**Mobile**, not "phone", for the small screen and the device, in code and
the docs (the user, 2026-11-07): `isMobile`, "full screen on a mobile".
"Phone" is kept for a telephone number (`SUPPORT_PHONE`), for names that are
not ours (`PhoneIcon`, iPhone), and in what the app says to people.

## Docs

1. One set of docs, for people and agents alike: descriptive, plain and
   current. The same word for the same thing every time; exact paths,
   settings, endpoints and defaults, in tables where there are several.
2. When a feature, a setting or a page changes, grep the docs of both
   repositories for its name and change every page that says it. Remove "not
   built" the day it is built.
3. A renamed heading breaks the links to it: `yarn test` names them
   (`src/__tests__/docsLinks.test.js`).
4. A phase is not finished until its docs match the code. A finished plan
   moves to `docs/plans/done/` in the same commit, with every link to it
   fixed.
5. A list of more than three items is numbered, in the docs as in the app;
   three or fewer are bullets. `yarn test` names a list that is not
   (`src/__tests__/docsLists.test.js`).

## Commits and branches

- One branch per milestone or feature, from an up-to-date `main`
  (`git fetch` first); one commit per item, in each repository.
- A commit message is a short subject line, a blank line, then one line per
  change, each beginning with its kind: `- added:`, `- changed:`,
  `- removed:`, `- fixed:` or `- note:` (what stays the same, what it goes
  with). Only the kinds that apply.
