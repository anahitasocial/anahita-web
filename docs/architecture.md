# Architecture

[Documentation](README.md) › Architecture

How the app is put together, and how it talks to anahita-services.

## Contents

- [Directory layout](#directory-layout)
- [Talking to the API](#talking-to-the-api)
- [Signing in](#signing-in)
- [State](#state)
- [Routes](#routes)
- [What a viewer may do](#what-a-viewer-may-do)
- [Translations](#translations)
- [Styling](#styling)

## Directory layout

Everything is under `src/`:

| Directory | What it holds |
| --- | --- |
| `api/` | One module per API resource. Each returns axios promises; `index.js` sets up axios and exports them all |
| `actions/` | Redux thunks that call the API and dispatch the result |
| `reducers/` | Redux reducers, most of them made by shared factories |
| `store/` | The Redux store, with a development and a production version |
| `containers/` | Pages and components connected to the store, grouped by feature (`actors`, `media`, `comments`, `settings`, `auth`…) |
| `components/` | Presentational components with no store access |
| `routes/` | The route table and the two route guards |
| `permissions/` | What the viewer may do, mostly read from the server's answers |
| `languages/` | Translations, one directory per language |
| `assets/` | Themes: logo, home page, left menu, styles and static pages |
| `statics/` | Files shipped with the app, including the Terms of Service and Privacy Policy |
| `proptypes/` | PropTypes shapes and matching default objects for the API's entities |
| `styles/` | Builds the Material UI theme from the active theme's `styles` |
| `constants/`, `utils/`, `middleware/` | Shared helpers |

## Talking to the API

All requests go through axios, configured in `src/api/index.js`:

- **Base URL.** Every request is relative to `REACT_APP_API_BASE_URL`.
- **Cookies.** Requests are sent with credentials, because the session is a
  cookie set by the API's domain.
- **Key casing.** The API speaks `snake_case` and the app `camelCase`. A request
  interceptor converts outgoing keys, including form-data field names, to
  `snake_case`. A response interceptor converts incoming keys to `camelCase`.
  Code in the app never sees a `snake_case` key.
- **Redirects** are not followed (`maxRedirects: 0`).

A few documents come from elsewhere and skip the interceptors. For example, the
OpenID configuration goes through `api/publicClient.js`, which repeats the key
conversion itself.

## Signing in

The app never handles a password. Signing in is OAuth 2.0 authorization code
with PKCE, as the first-party client `anahita-web` (`src/api/session.js`):

1. **Sign in.** The app generates a random state and PKCE verifier, keeps them
   in `sessionStorage`, and sends the browser to the server's
   `/oauth/authorize`.
2. **Callback.** auth-service shows its own sign-in page, then redirects back
   to `/oauth/callback` with a code (`containers/OAuthCallback.jsx`).
3. **Session.** The app posts the code and verifier to the server's
   `/oauth/session`. The server exchanges them for tokens, keeps the tokens
   itself, and sets a session cookie. From then on, requests carry the cookie
   and the gateway attaches the access token on the way in.
4. **Viewer.** The app reads the signed-in person from `/oauth/userinfo`.

Signing up, accepting an invitation and confirming an email address are pages
on auth-service too. The app only links to them.

Two components guard routes (`src/routes/`):

- **`AuthenticatedRoute`** sends signed-out visitors to `/auth`. It waits for
  the session check to finish first, so a signed-in person is not bounced on
  every reload.
- **`AgreementsGate`** wraps the whole route table. It sends a signed-in person
  to `/agreements` when the Terms of Service or Privacy Policy has a newer
  version than the one they accepted. See
  [Terms of Service and Privacy Policy](customising.md#terms-of-service-and-privacy-policy).

## State

State is kept in Redux, with `redux-thunk` for asynchronous actions.

Most resources behave the same way, so their actions and reducers are made by
factories instead of being written out each time:

- `actions/create.js` makes `browse`, `read`, `edit`, `add` and `deleteItem`
  actions for a namespace, such as `people`, `groups`, `notes` or `photos`.
- `reducers/create.js` makes the matching reducer. It keeps each namespace's
  items by id, their order, the `current` item being viewed, and loading and
  error state.

`actions/index.js` and `reducers/index.js` list the namespaces and wire them
up. Anything that does not fit the pattern, such as the session or the
socialgraph, has its own module.

In development the store also logs every action and mounts the Redux DevTools
dock.

## Routes

The route table is `src/routes/index.js`, using React Router 7 with browser
history. The main paths:

| Path | Page |
| --- | --- |
| `/` | The home page when signed out, the dashboard when signed in |
| `/auth`, `/oauth/callback` | Signing in |
| `/people`, `/people/:id` | People, and a person's profile. `:id` is their username |
| `/people/:id/settings/:section` | A person's settings, grouped into sections |
| `/groups`, `/groups/:id` | Groups, and a group. `:id` is `<id>-<slug>` |
| `/groups/:id/settings` | A group's settings |
| `/notes/:id`, `/articles/:id`, `/topics/:id`, `/photos/:id` | One post. There is no page listing every post of a type; the bare paths send an old bookmark home |
| `/hashtags/:alias`, `/locations/:id` | Hashtags and places |
| `/notifications` | The viewer's notifications |
| `/admin/:tab` | The administration area. The tab is in the address so an email can link to it. See below |
| `/invites` | Invitations, for a member who may invite. An administrator is sent to `/admin/invites` |
| `/settings` | Site settings, for super administrators only. A page and a menu entry of its own |
| `/signup-requests` | Where the signup queue used to be. Redirects to `/admin/signup-requests` |
| `/legal/tos`, `/legal/privacy`, `/agreements` | The legal documents, and accepting new versions |
| `/search`, `/blogs`, `/support`, `/about` | Everything else |

### A members-only site

An installation can serve nothing to people who are not signed in
(`SITE_READ_ACCESS=registered` on the server). The server enforces it: every
content route answers 401 to them. NodeInfo still answers and says so in
`metadata.readAccess`, and `routes/MembersOnlyGate.jsx`, which wraps the whole
route table, reads that. Somebody who is not signed in then sees a notice with
a Sign in button and the home page, in place of whatever page they asked for
and at the same address, so a link to a post leads to the post once they are
in. Every page carries `robots: noindex`.

The pages that stay open, the ways in and the pages about the site, are listed
in `routes/membersOnly.js`.

### The administration area

`/admin` is one page with a tab per thing administrators look after
(`src/containers/admin`). Each tab names who may see it in
`containers/admin/tabs.js`, reusing the rule the page behind it enforces:

| Tab | Address | Who sees it |
| --- | --- | --- |
| Reports | `/admin/reports`, and `/admin/reports/:id` for one case | Administrators and super administrators |
| Signup requests | `/admin/signup-requests` | Administrators and super administrators |
| Invites | `/admin/invites` | Administrators and super administrators |
| Accounts | `/admin/accounts` | Super administrators only |

Site settings are not a tab. They configure the installation, where this area
looks after the people on it, so they keep their own page (`/settings`) and
menu entry.

**Accounts** (`containers/admin/Accounts`) lists every person or group, least
recently active first, with filters for finding the ones nobody uses: an
activity tier (empty, dormant, active), dates, never verified, never onboarded,
nothing written, and for groups, no administrator. Accounts are ticked, or all
that match are selected at once, up to 500, and "Delete permanently" opens a
dialog that says what will go, asks for the count to be typed (`PURGE 37`) and
for a proof of identity, then shows the progress. The server answers a purge
before the work is done, so `usePurgeProgress` asks how the batch is doing
until nothing is queued. Administrators and the viewer cannot be ticked. A
group with no administrator links to its settings, where one is appointed.

The same purge for one account is the last card in a profile's Danger zone,
"Delete permanently" (`containers/actors/Settings/Purge.jsx`), offered to
super administrators on anybody's profile but their own. What a purge removes
is in the services' `docs/account-lifecycle.md`.

A tab the viewer may not see is not drawn, and its address lands on the first
tab they may. Somebody with no tabs sees a "restricted" message, and has no
Administration entry in the left menu.

The menu entry carries the number of things waiting: open reports plus pending
signup requests. The app reads it when an administrator's session is known,
every five minutes, when the window regains focus, and after a request is
approved or rejected (`actions.admin.readCounts`, `state.admin.counts`).

### Reporting

Every menu that sits on a node has a **Report** item: profiles, posts, feed
items, comments, hashtags and places. It is offered to anybody signed in,
except on themselves and on what they wrote (`permissions/report.js`). A menu
that somebody could do nothing else in is now drawn for them, holding Report.

The item comes from the `useReport(viewer, node)` hook in
`containers/reports`, which also returns the dialog. The dialog is rendered
beside the menu, not inside it, because choosing the item closes the menu.
The reasons it lists come from the server, for the kind of thing being
reported and in the app's language, and are fetched once per kind.

The Reports tab lists cases, filtered by status and by reason with two select
lists, and adds more with a "Show more" button. It opens one case at a time. It records an
administrator's decision; it does not delete or disable anything. "View"
goes to the reported thing, where those controls already live. See
anahita-services' `docs/abuse-reports.md`.

## What a viewer may do

**The server decides, and the app follows.** Every person, group, post and
comment the API returns carries an `authorized` object answering what the
viewer may do with it. The server works each answer out with the same checks it
enforces:

| Field | On | Answers |
| --- | --- | --- |
| `edit`, `delete`, `administration` | Everything | Whether the viewer may edit, delete or administer it |
| `composers` | People and groups | Which kinds of post the viewer may create on the profile |
| `audiences` | People and groups | Who a post the viewer writes there may be shown to |
| `addFollower` | Groups | Whether the viewer may add somebody else as a follower |
| `comment` | Posts | Whether the viewer may comment |
| `like` | Posts and comments | Whether the viewer may like it |

The helpers in `src/permissions/` read these answers. Where a response does not
carry an answer, the helpers fall back to a simple rule, and the server still
refuses anything it must. The app never works out a permission rule itself:
the rules depend on the profile's access, the viewer's relationship to it and
the profile's own settings, and a second copy of them in the browser has
drifted before.

The rules themselves, and how to change their defaults, are documented in
anahita-services under Permissions.

### Choosing who can see a post

One button, `components/AudienceButton.jsx`, in the two places the question
comes up: beside Post in the composer
(`containers/media/Composer/Audience.jsx`), and on a post that exists, for
somebody who may change who sees it (`containers/controls/medium/Access.jsx`).
A post carries its own `authorized.audiences` for that.

In the composer, it names the current choice and
opens a short menu; the choice is sent with the post as `access`, so a post is
never public first and narrowed afterwards.

What it offers comes from the server: every person and group carries
`authorized.audiences`, the audiences a new post there may have (the services'
`docs/permissions.md`, *Choosing who can see a post*). `src/utils/audience.js`
reads that and adds what the server has no opinion on:

- The options depend on where the post is going: your own profile, somebody
  else's, or a group. In a group, followers are called Members.
- An audience wider than the profile itself is shown disabled, with the
  reason: a post is never seen more widely than its profile.
- It starts on the last audience used for that kind of place, remembered per
  person in the browser's `localStorage`, or else on the widest the profile
  allows. It works the same with storage unavailable, only without a memory.

## Translations

Text is translated with i18next (`src/languages/`). Each language is a
directory named for its locale, such as `en-GB` or `fr-FR`. Each file in it is
a namespace, such as `people.js` or `settings.js`, used as
`i18n.t('people:settings.info')`.

The app is currently set to English (`lng: 'en'` in `src/languages/index.js`).
The French translations are maintained, but are not used unless that setting
changes. See [Languages](customising.md#languages).

## Styling

The UI is Material UI 9 (`@mui/material`), styled with Emotion. The theme is
made in `src/styles/index.js` with `createTheme`, from the options the active
theme's `styles.global()` returns (see [Themes](customising.md#themes)), and
provided in `src/containers/Root.jsx`. Under the theme's options,
`src/styles/index.js` puts back a few Material-UI 4 defaults, such as the
breakpoint widths and the background colours, so that the app kept its look
through the upgrade; a theme can override any of them.

Components style themselves in one of two ways:

- `makeStyles` or `withStyles` from `tss-react/mui`, which return class names
  built from the theme. Most existing components use these.
- The `sx` prop, for a few rules on one element.

Styles are plain objects. `theme.spacing(n)` returns a string with its unit
(`'16px'`), so write `theme.spacing(-2)`, not `-theme.spacing(2)`, and don't
add `px` after it.

Material UI 9 supports Chrome 117, Edge 121, Firefox 121 and Safari 17 and
later; `browserslist` in `package.json` matches.
