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
| `containers/` | Pages and components connected to the store, grouped by feature (`actors`, `media`, `replies`, `settings`, `auth`…) |
| `components/` | Presentational components with no store access |
| `routes/` | The route table and the four route guards |
| `permissions/` | What the viewer may do, mostly read from the server's answers |
| `languages/` | Translations, one directory per language |
| `assets/` | Themes: logo, home page (what somebody not signed in sees at `/`), left menu, styles and static pages |
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

Four components guard routes (`src/routes/`):

- **`AuthenticatedRoute`** sends signed-out visitors to `/auth`. It waits for
  the session check to finish first, so a signed-in person is not bounced on
  every reload.
- **`AgreementsGate`** wraps the whole route table. It sends a signed-in person
  to `/agreements` when the Terms of Service or Privacy Policy has a newer
  version than the one they accepted. See
  [Terms of Service and Privacy Policy](customising.md#terms-of-service-and-privacy-policy).
- **`OnboardingGate`**, inside it, sends a signed-in person with an
  incomplete profile to `/onboarding`, once, and waits while the agreements
  are outstanding so the two never send somebody back and forth.
- **`MembersOnlyGate`**, on a members-only site, shows somebody who is not
  signed in a way in instead of the page they asked for. See
  [A members-only site](#a-members-only-site).

All four are gates on the interface. What may be read is decided by the
server.

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

In development the store also logs every action, and connects to the Redux
DevTools browser extension when it is installed.

## Routes

The route table is `src/routes/index.js`, using React Router 7 with browser
history. The main paths:

| Path | Page |
| --- | --- |
| `/` | The landing page when signed out. Signed in, home: `containers/feeds`, with the composer and the feed. `/dashboard` leads here |
| `/auth`, `/oauth/callback` | Signing in |
| `/people`, `/people/:id` | People, and a person's profile. `:id` is their username, or for somebody on another server their whole handle, `alice@mastodon.example` |
| `/people/:id/:tab`, `/groups/:id/:tab` | A profile opened on one of its tabs: one of its kinds of post, or for a person `replies` or `reposts` |
| `/saved` | The posts the viewer saved. Signed in only; in the left menu |
| `/recommendations` | People, groups and events the viewer might follow, and feeds people have shared, a tab each (`?kind=`). Signed in only; reached from Who to follow on Home, and from the left menu where the installation has the recommendation service. `/suggestions`, its first address, leads to it |
| `/feeds`, `/feeds/new`, `/feeds/:id/edit` | The viewer's custom feeds, making one, changing one. Signed in only |
| `/feeds/:id` | A custom feed's own page. Read without signing in when the feed is public |
| `/events`, `/events/add`, `/events/:id` | The viewer's own events, making one, an event's page. `/events/:id/edit` sends to the event's settings. See *Events* |
| `/people/add`, `/groups/add` | Making a person (administrators) or a group |
| `/people/:id/notifications`, and the same for groups and events | What notifications the viewer gets from that profile |
| `/people/:id/settings/password` | The old address of the password form, linked from older emails. Sends to Security |
| `/people/:id/settings/:section` | A person's settings, grouped into sections |
| `/groups`, `/groups/:id` | Groups, and a group. `:id` is `<id>-<slug>` |
| `/groups/:id/settings` | A group's settings |
| `/notes/:id`, `/articles/:id`, `/topics/:id`, `/photos/:id`, `/videos/:id` | One post. There is no page listing every post of a type; the bare paths send an old bookmark home |
| `/hashtags`, `/hashtags/:alias`, `/locations`, `/locations/:id` | Hashtags and places, the lists and each one. The old `/tags/:alias` sends to `/hashtags/:alias` |
| `/notifications` | The viewer's notifications |
| `/admin/:tab` | The administration area. The tab is in the address so an email can link to it. See below |
| `/invites` | Invitations, for a member who may invite. An administrator is sent to `/admin/invites` |
| `/settings` | Site settings, for super administrators only. A page and a menu entry of its own: OAuth clients, signing keys, Privacy, which shows what the installation lets visitors read and can make everything public members-only, and Fediverse, the servers the site refuses |
| `/signup-requests` | Where the signup queue used to be. Redirects to `/admin/signup-requests` |
| `/legal/tos`, `/legal/privacy`, `/agreements` | The legal documents, and accepting new versions |
| `/onboarding` | Where somebody signed in with an incomplete profile is sent, once (`routes/OnboardingGate.jsx`): a name and a few words; a picture, in a circle that shows the initials of that name until there is one; hashtags they are interested in, up to ten, which make one "My interests" feed on their home page; profiles the site features; then people and groups recommended for them, with the reason for each. Nothing is followed without a tick. A step with nothing to show is left out (`onboarding/featured.js#stepsFor`), every step can be skipped, and without the recommendation service there are no interests and no recommendations (`containers/onboarding`) |
| `/pages/:alias` | A page of the installation's own, from the theme's `pages/` folder (`src/assets/<theme>/pages`). `/pages/tos` and `/pages/privacy` redirect to `/legal` |
| `/404`, and any address not above | The not-found page |
| `/search`, `/blogs`, `/support`, `/about` | Everything else |

### A members-only site

Everything about who can see what, on the server and here, is in one place:
[Privacy](https://github.com/purplerat/anahita-services/blob/main/docs/privacy.md)
in anahita-services. What follows is the app's part of it.

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

The setting has a middle value, `preview`: visitors are sent only the start of
what is public, cut on the server. The pages work, so the same gate leaves
them in place under a notice that this is a preview. A post that was cut
arrives with `truncated` set, and `components/SignInPrompt.jsx` shows the way
to the rest under it. Lists stop at their first page by themselves: the server
lowers their total to what it sent.

**The app does not ask for what a visitor will be refused.** `utils/visitor.js`
answers, from the session and NodeInfo, whether the viewer is a visitor and on
which kind of site:

- On a preview site the replies under a post and the lists of who follows
  whom are not requested. A sign-in prompt stands where they would be.
- On a members-only site the search box and the People, Groups, Hashtags and
  Places menu entries are not shown.

**A page that could be refused waits to be drawn** until the session has been
read and NodeInfo has answered. Drawn sooner, it asks for its content at once,
is refused, and shows the refusal before the gate has caught up. The wait is a
moment, and an open site does not pay it: what the site said last time is kept
in the browser (`site.readAccess` in `localStorage`), and a site that said
`public` is drawn straight away.

A request that is refused anyway, because some page did not expect it, is
caught in `src/index.js`: an unhandled "sign in first" answer from the server
is dropped instead of reaching the screen as an error. Every other unhandled
failure is left to be seen.

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
items, replies, hashtags and places. It is offered to anybody signed in,
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
reply the API returns carries an `authorized` object answering what the
viewer may do with it. The server works each answer out with the same checks it
enforces:

| Field | On | Answers |
| --- | --- | --- |
| `edit`, `delete`, `administration` | Everything | Whether the viewer may edit, delete or administer it |
| `composers` | People and groups | Which kinds of post the viewer may create on the profile |
| `audiences` | People and groups | Who a post the viewer writes there may be shown to |
| `addFollower` | Groups | Whether the viewer may add somebody else as a follower |
| `comment` | Posts and replies | Whether the viewer may reply. The name is from when replies were comments |
| `like` | Posts and replies | Whether the viewer may like it |

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
  else's, or a group.
- An audience wider than the profile itself is shown disabled, with the
  reason: a post is never seen more widely than its profile.
- It starts on the last audience used for that kind of place, remembered per
  person in the browser's `localStorage`, or else on the widest the profile
  allows. It works the same with storage unavailable, only without a memory.

### The language of a post

Beside the audience button the composer has a language button
(`components/LanguageButton.jsx`), showing a code such as `EN`. The choice is
sent with the post as `language`. `src/utils/postLanguage.js` decides where it
starts: the posting language on their profile, which the session's viewer
carries; then the browser's language, which is the computer's; then
English. A different language chosen for one post applies to that post only.
It once remembered the language somebody last posted in, which made one post
sent in the wrong language the start of every post after it; it no longer
does, and clears what it kept. Language names come from the browser
(`Intl.DisplayNames`), in the language the app is being read in.

Where a post's text is drawn, `components/NodeBody.jsx` puts the post's
language on it as the `lang` attribute, so a screen reader reads each post in
the right one.

**Right-to-left writing.** The interface is left to right and has no
right-to-left layout. What people write is another matter: a post's title and
text, and the fields they are typed into, carry `dir="auto"`, so Persian,
Arabic or Hebrew runs right to left and aligns to the right. The direction
comes from the text, not from the language tag, so it holds for untagged and
older posts, and each paragraph of a post is judged on its own. **While a
post is written** the box follows the language chosen for it
(`postLanguage.directionOf`): right to left for Persian, Arabic, Hebrew,
Urdu and the others, so an empty box starts at the right, and changing the
language changes the direction at once; otherwise from the first letter
typed. Replies and quotes have no language button and follow the
writer's own language. A placeholder takes its direction from its own words
(`unicode-bidi: plaintext`, in `styles/index.js`), so an English one reads
rightly in a box set right to left. Mirroring the
whole interface (MUI's `direction: 'rtl'` theme with the stylis RTL plugin)
would come with a Persian or Arabic translation of it, and there is none yet.

"Language you post in" is in the profile form. It is the language somebody
writes in, not the language of the interface.

What the server stores and accepts is in the services'
`docs/post-language.md`.

### The photos of a post

A photo post holds up to four images. The number comes from the server
(`metadata.photoMaxFiles` in NodeInfo); the app does not carry it.

**Making one.** The photo composer (`Composer/Forms/Photo.jsx`) shows
`components/PhotoFilesEditor.jsx`: pick or drop several images, put them in
order with the arrows under each, remove one, and describe each with its
`ALT` button. Each image is uploaded the moment it is picked, in a request of
its own (`api.photos.upload`), so the Post button waits until all of them are
stored and the post itself is then a small JSON request naming the uploads.

**Showing one.** A post with more than one image is drawn by
`components/PhotoSlides.jsx` on the post card, in the feed and on the photo's
page. Material UI has no carousel, so this is one made for this one job from
its small parts (`ButtonBase`, `IconButton`, `MobileStepper` for the dots)
with no other library. The photos sit side by side in a row that the browser
scrolls sideways and brings to rest on one photo (CSS scroll snap), so on a
phone a photo follows the finger and carries on with the flick. Where there
is a mouse there are arrows, and the left and right keys work on the focused
post. Photos after the first load when they are about to come into view. The
frame takes the first photo's shape, kept between 4 by 5 and about 2 by 1,
and a photo of another shape is shown whole inside it.

The lightbox shows a post's images as the same kind of row, swiped the same
way. It goes through a post's images before it goes on to the next post: the
arrows and the arrow keys step through them, and a swipe leaves the post only
from its first or last image. `Stepper/index.jsx` holds which image is on
show; the row tells it when a swipe has moved. Zooming takes the image on
show out of the row and shows it at full size, as for any photo. A post with
one image is drawn as it always was.

Every image carries its description as `alt`. One without a description falls
back to the post's title.

**Changing one.** "Edit photos" in a photo's menu opens
`containers/media/PhotoFilesDialog.jsx`, the same editor over what the post
has. Save sends the whole list as it is to be; nothing changes before that.

The rules that can be tested without a browser are in
`src/utils/photoFiles.js`: what can be sent, how a list is reordered, what a
step lands on. `asSingle(medium, index)` gives the post as if one of its
images were its only one, which is how everything that already draws a
photo from `portraitUrls` draws any of them.

In preview mode a visitor is sent one small image of a post however many it
has, so it is drawn as a single photo.

What the server stores and accepts is in the services' `docs/photos.md`.

### Replies

A post of any kind is answered with replies: notes, each of which can be
answered in turn. `containers/replies/Thread.jsx` shows them, as the Replies
tab on a post's page and in the lightbox. What used to be comments are
replies, made directly to the post.

- **The thread is read whole** (`api.replies.thread`) and kept in the
  component, not in the store. Nothing else on the page shows it.
- **`src/utils/thread.js`** arranges the flat list the server sends into
  replies and the replies under them, and holds the rule for each change: a
  reply added, edited, removed, hidden. After a change is made on the server
  the same change is made to the copy on the page, so the thread is not read
  again after every reply. It is plain functions with tests.
- **What a viewer may do comes with each reply,** in `authorized`: `comment`
  (reply to it), `edit`, `delete`, `hide`, `like`. A control is drawn only
  when its answer is yes. Whether somebody may reply to the post at all comes
  with the thread, as `canReply`.
- **A removed reply that had been answered** arrives as `deleted`, with no
  text and no author, and is drawn as a line saying so with its replies still
  under it.
- **Hidden replies** are sent only to whoever may show them again, marked
  `hidden`. They are drawn apart, under the thread, closed until opened.
- Replies are set in a level for each step down, up to four, with a line down
  the side. Past that they line up, so a long exchange fits a phone.

- **Who can reply** is the post's own setting, chosen by its author:
  anyone, nobody, or any of the people who follow them, the people they
  follow and the people the post mentions. `components/ReplyAccessDialog.jsx`
  asks it as two questions, anyone or nobody and then who is let in anyway,
  and `utils/replyAccess.js` turns that into the one value the server keeps.
  The dialog opens from `ReplyAccessButton` in the composer, beside the
  audience and the language, and from "Who can reply" in a post's menu
  (`controls/medium/ReplyAccess.jsx`). The thread reads the setting with the
  replies and says it when it is limited.

- **A post's menu in a feed** has Edit and Delete where the server says the
  viewer may (`authorized.edit`, `authorized.delete`, sent with each feed
  item). Edit opens the post's page with its form up (`?edit=1`, which is
  then taken out of the address). A deleted post leaves every feed on the
  page, with any repost of it (`reducers/createFeed.js`).
- **In a feed**, the reply button under a post is a link to the post's page,
  where its thread is (`containers/feed/components/ReplyButton.jsx`). How
  many replies it has is in its interactions.

- **A reply has a page of its own**, at `/notes/:id` like any note. It is
  drawn as the post, with what it answers above it
  (`containers/replies/ReplyContext.jsx`) and below it the part of the thread
  that is under it: the thread is read whole for the post at the top, and
  `utils/thread.js` picks out the branch. Replying there answers that reply.
- **Where a reply was said** is shown above it wherever it is away from its
  thread: the profile the thread is on, a person, a group or any other actor,
  from `root.owner`. A reply is owned by whoever wrote it, so its own owner
  does not say. A post shows the profile it is on the same way when that is
  not its author's own.
- **A person's profile has three lists**: Posts, Replies and Reposts. Only
  people reply and repost, so a group has Posts alone. They are the first
  tabs of `containers/actors/Read/Body.jsx`. All three are the profile's feed
  asked for with a different `filter` (`containers/feed/Actor`); they share
  one place in the store, so each is keyed and read when its tab is opened.
  Posts are one column beside the profile's details; Replies and Reposts
  fill the page in the same masonry as the lists of notes, articles and
  photos (`components/BreakpointMasonry.jsx`). In Reposts the reposted post
  is drawn as itself, not inside a card for whoever reposted it.
  The tab is in the address. Reposts are not among the posts unless the
  profile's owner asks for that, under Settings › Privacy
  (`containers/actors/Settings/RepostsOnProfile.jsx`), and the server applies
  it.

### Home

Home for somebody signed in is `containers/feeds/index.jsx` (it was
`Dashboard.jsx`; the menu says "Home" either way): the composer and the feed
of the people and groups the viewer follows, with the custom feeds the viewer
keeps there as tabs after it.

### Suggestions

Suggestions of who to follow come from the installation's recommendation
service (`/recommendations/`; the services' `docs/recommendations.md`). The
service is optional, and everything here draws nothing where there is none:
a request that fails as it does without the service
(`utils/recommendations.js#isAbsent`) is taken as there being no suggestions.

- **Who to follow** on the home page, under the composer
  (`containers/recommendations/WhoToFollow.jsx`): three people, each with the
  reason, a Follow button and a way to say not interested, and a button on
  to the rest. Not drawn while it is read or when there is nobody. The ✕ in
  its header puts the whole card away for seven days, remembered in the
  browser (`utils/recommendations.js#hide`); Reset on the Recommendations
  page brings it back.
- **The page** at `/recommendations` (`containers/recommendations/index.jsx`):
  People, Groups and Events, the open tab in the address (`?kind=group`),
  as cards with the reason inside each, under the name. An event is drawn with the event's
  own card and is not followed from here. It is in the left menu as
  **Recommendations**, where the installation has the service
  (`useHasSuggestions.js` asks once).
- **Feeds,** the last tab (`?kind=feed`, `containers/recommendations/SharedFeeds.jsx`),
  is not chosen by the recommendation service: it is the feeds people have
  shared that the viewer may open, newest first (feed-service,
  `GET /feeds/discover`), without the viewer's own, each with the button
  that adds it to the home page. The weights and preferences beside the
  tabs do not change it.
- **What counts** is the viewer's to weigh. The button beside the tabs, and
  one in settings, opens a dialog of sliders
  (`containers/recommendations/WeightsDialog.jsx`), one a reason, from nothing,
  which leaves the reason out, to the most there is; Reset puts them back
  to the installation's own. Saved, the list is read again. The server
  names a reason in snake case and the keys of what it sends are put in
  camel case on the way in: `utils/recommendations.js#weightKey` is the one
  place that knows.
  The last slider is not a reason: how lately a person must have been here
  to be suggested at all, over the steps the server gives, from the last
  month to any time. A year unless the viewer says.
- **The reason is always shown.** `utils/recommendations.js#reasonText`
  puts the first reason into words from what the service sent with it
  ("Followed by Ana and 2 others"), and counts where it may name nobody.
- **Not interested** takes a suggestion out at once and tells the service,
  which does not make it again.
- **What the viewer is recommended** is chosen on the Recommendations page
  itself, from the cog beside the weights
  (`containers/recommendations/PreferencesDialog.jsx`): whether people, groups
  and events are suggested, whether what they like and post is used, and
  the suggestions they removed, each to be taken back.
- **Whether they are suggested to others** is a privacy choice, and is the
  one switch in Settings › Privacy
  (`containers/actors/Settings/Suggestions.jsx`).

### Videos

A video post plays in `components/VideoPlayer.jsx`, the browser's own
player with a cog in its top corner that opens the sizes in a menu, the one playing ticked. Posting one is a composer of its
own, because a video is too big to be sent with the post (the services'
`docs/videos.md`).

- **Whether there is video at all** is the installation's choice. Where it
  is off, the server leaves the video feature off every profile, so there
  is no Video composer and no Videos tab, and nothing here has to hide
  them. NodeInfo's `videoUploads`, `videoMaxBytes` and `videoMaxSeconds`
  say what is allowed (`utils/videos.js`).
- **Posting** (`containers/media/Composer/Video`): the file is refused at
  once if it is not a video or is too large. `useVideoUpload.js` then
  begins the upload, cuts the file into parts and sends them to storage
  three at a time, each tried again when it fails, asking for addresses a
  few at a time. The page has to stay open for that, and says so. When
  everything is sent the server prepares the video, and the page can be
  left: the composer asks after it and says when it is posted.
- **Videos on the way** are listed under the composer: ones still being
  prepared, and ones that failed in the last day, each with why.
- **The parts go to storage, not to the API**, through an axios instance
  of their own (`api/videos.js#sendPart`) that sends no cookies and none
  of the API's handling.
- **Playing:** a video is kept at a few sizes. It starts at 720p, at the
  smallest where the browser says the connection is slow, or at the size
  chosen last time, which is kept in the browser (`utils/videos.js#pick`).
  1080p and above are played only when chosen. Changing size carries on
  from the same moment. Nothing changes size while playing.
- **A video's files are paths under the API** (`video.files[].url`,
  `video.poster`), which ask each time whether the viewer may see the post
  and send the browser on to storage. The player is a plain `<video>`, so
  the browser sends the session cookie itself.
- A video is a kind of post like the others: `/videos/:id`, the `videos`
  namespace in the store, and the kind `video` in custom feeds.

### Downloading

A photo or a video has a Download button in the row under it on its own
page, where the server said this viewer may download it
(`authorized.download`; `utils/downloads.js`). Whoever posted it decides,
and it is off until they say otherwise. It is not on a post's card in a
feed or a list: a card is narrow, and one more button does not fit on a
phone.

- **When posting**, the photo and video composers have a download button
  among the post's options (`components/DownloadOptionButton.jsx`), which
  starts on what the profile being posted on says.
- **Afterwards**, "Allow download" and "Do not allow download" are in the
  post's menu on its own page, for whoever may edit it
  (`containers/controls/medium/Download.jsx`).
- **The default** is a switch under Settings › Permissions, for a person
  and for a group, not for an event
  (`containers/actors/Settings/DownloadDefault.jsx`).
- **The download** sends the browser to the API's address for the file,
  which answers with something to save, so the page stays where it is. A
  post with several images offers each in a short menu.

### Download your data

**Settings › Account › Download your data**
(`containers/actors/Settings/DataExport.jsx`), on the viewer's own
settings: a copy of everything they put here, as one file, from the
installation's export service (`/exports`; the services'
`docs/data-export.md`).

- **Asking** opens the step-up dialog (`containers/auth/StepUp`) when the
  server says a fresh proof is needed, and asks again once it is given.
- **While it is made**, the card asks after it every five seconds and can
  be left; it can be cancelled.
- **When it is ready**, the card says how big it is and until when it is
  kept. Download asks the server for the file's address at the press: the
  address is good for a few minutes, so one read with the page may have
  run out.
- **One at a time, and one a week** unless the installation says
  otherwise. The card says when the next can be asked for
  (`utils/exports.js#canAsk`).
- **Where there is no export service**, the card says the download is not
  available here (`utils/exports.js#isAbsent`).

### Link previews

A note with a link in it can carry a card for the link: the page's picture,
site, title and a line about it (`components/LinkPreviewCard.jsx`). The
card comes from the installation's link preview service (`/link-previews`;
the services' `docs/link-previews.md`), which is optional: with none there
is simply no card.

- **While a note is written**, `containers/media/Composer/useLinkPreview.js`
  finds the first link once the writer has paused for half a second, or
  at once when it was pasted, and asks for its card. The ✕ on the card posts the note without it. A link
  with nothing to show, or whose card was taken off, is not asked for
  again.
- **While a note is edited** on its own page the same hook is used, given
  the card the note already has, which it shows without asking again. A
  different link gets its own card, and the ✕ saves the note without one
  (`link_preview_remove`).
- **A reply is a note** and has the card the same way: the reply box
  (`containers/replies/ReplyForm.jsx`) uses the same hook, for a new reply
  and for one being changed, and a reply shows its card under its text.
- **The note is sent with the link only** (`link_preview_url`). What the
  card says is what the server read off the page, never what the browser
  sends.
- **On a post**, the card is `linkPreview` on the node, drawn under the
  text on the feed, on cards and on the post's own page. Its picture is the
  installation's own copy (`utils/linkPreviews.js#imageOf`), so reading a
  note asks nothing of the other site.
- **A link the player plays** (YouTube, Vimeo and the others in
  `components/Player.jsx`) keeps the player and has no card
  (`utils/linkPreviews.js#isShown`).

### Titles and tags

`components/HeaderMeta.jsx` keeps the tab's title and the page's tags in
step as the viewer moves about. A site a link is pasted into never sees
them: it runs no JavaScript. What it reads is written into `index.html` by
the services' `web-shell`, when the app is hosted through it
([Deploying](deploying.md#through-the-web-shell)). The site's name and
description in the build's `index.html` are what the shell uses for pages
with nothing of their own to say.

### Privacy and permissions in settings

A profile's settings keep two things apart:

- **Privacy** is who can see what: who can see the profile, whether
  reposts show on it, who is blocked, and whether the person is suggested
  to others. (Its key in the code and in the address is still `access`.)
- **Permissions** is who can do what: who can post and reply, who can
  quote, and whether new photos and videos start out downloadable.

A setting goes where its question does. What somebody is shown, such as
which recommendations, is neither, and is chosen where it is shown.

### Sharing

Share is the paper plane. It opens one dialog for the whole app
(`containers/share/Dialog.jsx`, drawn once beside the routes) with the link
and the ways to send it: copy it, email it, post it on Mastodon or Bluesky,
and, where the browser has one, the device's own share sheet ("More
options"), which has every app the person uses. Mastodon asks for the
person's server the first time and keeps it in the browser.

- **Anything on a page opens it** through `utils/share.js#open`:
  `ShareAction`, `ShareButton` and `ShareMenuItem` in
  `containers/controls/Share.jsx`. A menu can close behind its item, since
  the dialog is not the menu's.
- **Where it is:** under a post, in the row with like, reply and repost, in
  a feed, in a list and on its page; a profile's menu; a shared custom
  feed.
- **Only what a visitor could open is sent beyond the site.** Something that
  is not public, and anything on a members-only site, is offered to copy and
  nothing else, with a note saying who can open the link.
- **Nothing is counted and nothing is sent to the server.** The links to
  other networks are plain addresses, and no script of theirs is loaded.

### The width of a page

`App.jsx` wraps every page in one `Container`, which sets the most a page can
be and its gutters. Inside it a page chooses its own width.
`components/PageColumn.jsx` is the usual choice: the whole width on a phone,
two thirds of the page, centred, on a wide screen, or all of it with `wide`.
Home, the pages of custom feeds, a post's own page and the event forms use
it. A profile, with its side column, lays itself out.

### Describing photos

Each image of a photo post has its own description, for people who cannot
see it (`altText` on each of `medium.files`).

- **Writing it** is a field under each photo in the composer and in
  "Edit photos" (`components/PhotoFilesEditor.jsx`). The photos are a row
  that is swiped through one at a time, like the slides a reader sees,
  each with its place in the order and the way to remove it; a photo just
  picked is the one shown. Under a photo with no description is a prompt,
  "Add an alt description", with why in a line beneath it; pressing it
  opens the field, which is called "Alt description" so that it is not
  taken for the post's own description just below. It is never required.
- **Hearing it:** it is the `alt` of the image wherever a photo is drawn
  (`utils/photoFiles.js#altOf`, which falls back to the post's title).
- **Reading it:** `components/AltBadge.jsx` puts "ALT" in the corner of a
  photo that has a description of its own (`descriptionOf`, which does not
  fall back), and shows it when pressed. It sits over photos that are
  links or open the lightbox, and pressing it does neither.

### Pictures that are no longer kept

The server removes the pictures of a post from another network once the
post has been left alone for a while, and copies them again when asked. A
post whose pictures are gone has no `files` and carries
`mediaRemoved: { count, alts, gone }`.

`components/RemovedPictures.jsx` is drawn where the pictures were: how
many there were, what each showed, and a button that asks for them
(`api/federation.js#restorePictures`, which goes to whichever service the
post came through). When they are back it reads the post again and draws
them itself. On the post's own page it asks at once. When the answer is
that they are no longer to be had, it says so in place of the button.

### New posts in an open feed

A feed that is open asks again, now and then, for its first page
(`containers/feed/useNewPosts.js`, for the home feed and every custom
feed).

- **It asks less and less often, and stops.** After 15 seconds, then 30,
  60, 120 and 240; when the last of those finds nothing, it asks no more
  (`utils/heartbeat.js`). Finding something begins it again at 15 seconds.
  So does the reader coming back to the tab or the window, which is asked
  at once. Nothing is asked while the tab is hidden.
- **At the top of the page, what is new is put in at once.** Further
  down, the page is left alone, since a page that grows above what is
  being read loses the reader's place: a button, "3 new posts", stays in
  sight (`containers/feed/components/NewPosts.jsx`) and puts them in and
  goes to the top when pressed.
- **In the store** it is `<FEED>_BROWSE_PREPEND` (`reducers/createFeed.js`):
  the page goes before what is held, in the server's order, and what is
  held already is brought up to date. When none of the page is held, more
  was posted than a page holds, and the feed is begun again from it.

### Custom feeds

A custom feed is one somebody builds: where its posts come from, what they
are about, what to leave out. The server's side is in the services'
`docs/feeds.md`. The words a person reads are always "custom feed", never
"algorithm".

- **Home tabs.** The first tab is Following, the feed there always was
  (`containers/feed/Leaders`). After it, the feeds from `GET /feeds/pinned`,
  in the viewer's order. The open tab is in the address as `?feed=<id>`. The
  button at the end of the tabs leads to `/feeds`.
- **One column or several.** On a wide screen a pair of buttons at the end
  of the tabs lays the open feed out one post under another or in columns
  (`components/BreakpointMasonry`), when it takes the width of the page. The
  choice is kept in the browser (`home.feedView`). On a narrow screen there
  is one column and no buttons.
- **One set of cards.** `containers/feed/components/Items.jsx` draws a feed's
  posts and reposts, with their menus and buttons, for Following and for
  custom feeds alike. `containers/feed/Custom` is the list for a custom feed,
  given a saved `feed` or an unsaved `definition`.
- **Paging.** A custom feed is paged by a cursor the server hands back, and
  the store's lists are kept by how far down they are. `api/customFeeds.js`
  keeps each list's cursor and reports a page to the store in the store's
  terms (`feed_custom`, beside `feed_leaders` and `feed_actor`).
- **Under Home in the left menu** are the feeds on the viewer's home page, in
  their order, each opening Home on that feed. The list page is an entry of
  its own below them, **Feeds**, like Saved. A feed is made from the + on the Feeds page. A feed is put on its maker's home page when it is made, so it
  appears there at once. The menu and the tabs read the same list
  (`containers/feeds/usePinnedFeeds.js`), again whenever a feed is made,
  changed, deleted or moved: `api/customFeeds.js` tells whoever asked
  (`onChange`).
- **The list page** (`containers/feeds/Manage.jsx`, reached from the button at
  the end of the tabs and from "Feeds" in the menu): the viewer's
  feeds and the ones of other people's they keep.
- **Rows of one height.** A feed's row in the list is its name, who can
  see it and when it was made, and one line cut short: what it is for, or
  what it shows when it does not say. Pressing the name opens the feed in
  full in a dialog (`containers/feeds/DetailsDialog.jsx`): its description
  and every setting it has, one line each, with a button on to the feed.
- **Finding shared feeds:** the site's search, and the Feeds tab of
  Recommendations (see *Suggestions*). In search a feed that matches is a
  result like any other, among the profiles and posts under **All**, and by
  itself under a **Feeds** tab (`scope=feeds`). Search sends it as a node
  with a `feed` block; `containers/feeds/SearchCard.jsx` draws it as a card
  (`components/CustomFeedCard.jsx`) in the same columns, with the button
  that adds it to the home page. Feeds kept to their owners are never found.
- **The editor** (`containers/feeds/Form.jsx`) is a form in the page, for a
  new feed at `/feeds/new` (`Add.jsx`) and for changing one at
  `/feeds/:id/edit` (`Edit.jsx`). Both are reached from the list of feeds:
  the + in its header, and the pencil on a feed's card. Hashtags and keywords
  are typed as chips (`components/WordsField.jsx`); profiles and places are
  searched for and picked (`components/NodesField.jsx`). People on other
  servers are found there too, through the site's search, if anybody here
  has followed or looked them up; the lists of people and groups keep to
  this site's own. "Posted on" (people, groups, events; people meaning
  people here and elsewhere) is not offered when profiles named by hand
  are the feed's only source, since it could only hide some of their
  posts, and is not sent then. Under the fields is
  what the feed shows, in a sentence. There is no preview: saving opens the
  feed, Home on its tab when it is kept there. Everything done to a feed is
  done from the list page. Home has only the way to it.
- **A feed's icon** is one of sixteen, chosen in the editor from a list that
  names each, on the same line as the feed's name, and kept by name
  (`icon` on the feed; the server's `feeds.Icons`). `components/CustomFeedIcon`
  draws it: in the menu under Home, on the tabs, in the list and on the
  feed's page.
- **Deleting a feed** is offered to its owner in two places, each asking
  first: its card in the list and its own page. Not in the editor, which is
  for changing a feed.
- **Ten feeds** is the most a person owns, the number the home page holds.
- **The sentence** is `utils/customFeeds.js#summary`, from the definition
  alone. It is on the editor, on a feed's page and in the list, so nothing
  about what a feed shows is hidden. The same file repeats the server's
  limits so the editor can say what would be refused before it is sent. The
  server decides.
- **A feed's page** (`containers/feeds/Read.jsx`): add to home, copy, and for
  its owner edit and delete. Copying makes a feed of the viewer's own, seen
  by them alone, and opens it in the editor.
- **Share** is on a shared feed's card (in search and in Recommendations ›
  Feeds), in the list of feeds and on the feed's page.
  See [Sharing](#sharing). Not on a feed kept to its owner.
- **Following a hashtag or a place** (`containers/feeds/FollowHashtag.jsx`
  and `FollowLocation.jsx`, on the hashtag's and the place's page; both are
  `FollowFeed.jsx`) makes a feed of that one hashtag or place, the viewer's
  alone, and puts it on the home page, or puts there the one the viewer
  already has. The feed is given the hashtag's or the place's own picture.
  It goes into no other feed. A feed of a place shows only
  what the viewer could see anyway, and who follows a place is kept
  nowhere.
- **Naming in requests.** The definition's keys are snake case on the server
  (`hashtags_any`) and camel case here (`hashtagsAny`), converted both ways
  by the interceptors like every other body.

### Pinned posts

"Pin to profile" and "Unpin" are in a post's menu, on its page and in a feed
(`containers/controls/medium/Pin.jsx`), where the server says the viewer may
(`authorized.pin`). A pinned post has a "Pinned" line at the top of its card
(`components/PinnedLabel.jsx`). A profile has one pin, so pinning moves it:
the change is told to every list on the page (`POST_PIN_CHANGED`, handled in
`reducers/create.js` by `utils/reducer.js`), and the post that had the pin
stops saying so. The new order shows when the list is next read.

### Saved posts

"Save" in a post's menu puts it on the viewer's own list; the same item reads
"Remove from saved" once it is (`containers/controls/medium/Save.jsx`,
`isSavedByViewer` on the post). The list is a page of its own, **Saved** in
the left menu under Home, at `/saved` (`containers/saved/index.jsx`, the list
in `Browse.jsx`), in the same masonry as the other lists. It was a tab on the
viewer's own profile for a day and was moved on 2026-10-06: a profile is what
other people look at. There are no folders. Collections, planned for later, would be a separate feature filled from
this list, and would leave it as it is.

It is private end to end: the server never says who saved a post. The page
says so in one line under its title. The mark is told to every list on the page (`POST_SAVED_CHANGED`,
handled in `reducers/create.js`).

### A post's interactions

"Interactions" is a dialog about a post: who liked it, reposted it, quoted
it and replied to it (`containers/activity/PostActivity.jsx`,
`utils/activity.js`). It has a tab for each of the four, with its icon and
its number; under the tabs is the list of who, each row a link. In the code it is still
called activity. Each list is read when its tab is first opened.

It opens from **the last button in the row under a post**
(`containers/likes`, drawn by `components/PostActionsRow.jsx`, which every
layout of a post uses), there to press when the post has any of the four,
and from "Interactions" in a post's menu. There is one row under a post:
like, reply, repost, share and interactions, each the same kind of button
and as wide as the others, so the row is shared out evenly. None is an
icon button. The separate row of counts, of likes and of replies, is gone.

There are no views in it, and nothing anywhere counts them.

### The top of a profile

`actors/Read/ActorHeader.jsx` lays it out the same way on a phone and a
desktop, left aligned:

- **The cover,** when there is one, as a wide band three times as wide as
  it is tall and no taller than 320px (`components/CoverForm.jsx`). With
  none it is not drawn at all, apart from a slim "Add a cover photo" band
  for whoever may add one. Cards of profiles use the same band.
- **The picture** over the cover's lower edge, or at the top of the card
  with no cover, smaller on a phone; **beside it, the buttons**: Follow
  (filled while not following, outlined once following), the others the
  viewer may use, and the ⋮ menu. They were a row of their own under
  everything, which left a band of white.
- **The name, with the pronouns after it** in a lighter grey, "Sarah Noble
  (they/them)".
- **The handle,** and "· Follows you" after it for somebody who follows
  the viewer.
- **One line of counts,** "22 followers · 16 following"
  (`actors/Read/SocialgraphMeta.jsx`), each opening the dialog below on
  that list. Following is counted only for this site's people: whom
  somebody on another server follows is not known here.

What the profile says of itself is in its About card, not here.

### Followers, following and what is in common

Under a profile's name are its counts. Pressing one opens a
dialog (`actors/Read/SocialgraphDialog.jsx`, `utils/socialgraph.js`) with up
to three lists:

- **Followers:** who follows the profile.
- **Following:** who the profile follows. Only people follow, so only a
  person's profile has it. The code and the API call these `leaders`.
- **In common:** the people the viewer follows who also follow this
  profile. Only for somebody signed in, on a profile that is not their own.
 Each is
read when first opened and more of it as its end is scrolled to, whoever
followed most lately first. The order is a small menu at the right of the
dialog's title, Latest or Oldest (`?dir=asc`); it was a row of its own under
the tabs. Each tab's count is in grey after its name, as on the search
page. A group's administrators can remove a follower
there.

What is in common is found by one query in the graph, so it is whole, paged
and counted; its number is on its tab once the tab has been opened.

A person who follows the viewer says so: "Follows you" after their handle on
their profile, and beside their name in these lists.

**One word for following.** Every button that follows anything, a profile,
a hashtag or a place, reads "Follow" with a plus before it
(`controls/Follow.jsx`, `feeds/FollowFeed.jsx`), except for somebody who
follows the viewer already, where it reads "Follow back" (asked for by the
user on 2026-10-14). Two things keep words of their own because they are not that
button: "Request to follow", which asks and does not follow, and "Follow
<name>" in a post's menu, where what is followed is not what the menu
belongs to.

There is no Social Graph tab. An old address such as
`/people/ana/socialgraph/leaders` opens the profile with that list showing.

**Blocked** is not in the dialog: who you have blocked is yours alone. It is
one row under Settings › Privacy (`actors/Settings/Blocked.jsx`) saying how
many there are, which opens a dialog: everybody blocked, with their picture,
read a page at a time as the list is scrolled, a box to search it by name,
and Unblock on each.

### Events

An event is an actor like a group, so most of it is the containers a group
uses, told the `events` namespace: its page (`actors/Read`), its settings, its
administrators, its access. What only an event has is in `containers/events`.

| Where | What |
| --- | --- |
| **Events** in the left menu, `/events` | The viewer's own: Upcoming, Invited, Hosting, Past (`events/index.jsx`). There is no list of every event. Its + follows the installation's `eventsFrom` (`permissions/actor.js`), a setting apart from the one for groups |
| `/events/add`, `/events/add?host=<group id>` | The form (`events/Form.jsx`). With a host it is the group's event |
| `/events/:id` | The actor page with `events/Panel.jsx` above the tabs: when it is, who hosts it, how many are going, Going and Maybe, Add to calendar. Its administrators change it from its settings |
| Info under its settings | The same form, to change it. The old address `/events/:id/edit` sends there; calling an event off is in the Danger zone |
| A group's **Events** tab | What the group hosts, upcoming or past, with Add event for its administrators (`events/Hosted.jsx`) |

**Times** are kept as instants with the name of the zone they were chosen in.
The form works on that zone's clocks, whatever zone the browser is in; a
reader sees them on their own, with a second line for the event's zone when
it differs. `utils/events.js` does both with `Intl`, clock changes included,
and has the tests for it.

**Capacity** is set on a slider on the form, not typed: its stops are close
together where the numbers are small and further apart as they grow, and all
the way up is no limit (`events.capacityStops`). An event whose number is
not one of the stops has it added, so opening it to change something else
does not change how many may go.

**Changing and cancelling** are in the event's settings, reached from its
menu like a group's. The Info tab is the event's own form
(`events/Form.jsx`), so the event's page has no Edit button, and
`/events/:id/edit` leads to the settings. Cancelling is the first card of the
Danger zone (`events/CancelSetting.jsx`): it cannot be undone, and it is the
thing to weigh against archiving and deleting.

**Answering** is Going or Maybe, and is following the event, so an event's
page has no Follow button. Not going, Maybe and Going are one group of
buttons the width of the card, the chosen one filled; Not going takes an
answer back. The number going opens who they are
(`events/Attendees.jsx`). The link to join online is sent by the server only
to whoever is going or looks after the event.

**Where it is** is an address typed on the event's form and kept on the
event, not a place on the site's map: places are public, and an event at
somebody's home should not put their home on it. The server sends the address
only to whoever is going or looks after the event, and the About card on the
event's page shows it (`actors/Read/About.jsx`), which is drawn for an event
with an address even when it has no description. Everybody else is told there
is an address for people who are going.

**A map** is drawn in that card when the address came with a point. The form
has a "Show a map" checkbox, off unless ticked, because finding an address
means the server sending it to a geocoder. The marker opens nothing
(`linked={false}` on `components/Map.jsx`). Pressing the "Where" row opens a
menu of Apple Maps, Google Maps and OpenStreetMap (`events.mapLinks`). Each
opens at the point when there is one, and otherwise looks the address up, from
the reader's own browser and only when picked. The event's website, a field
on its form, is the row above "Where", so the map sits right under the
address. A public venue can still be tagged from the
event's Locations tab, and the panel names it.

**An event for a group's followers.** An event hosted by a group has a
checkbox on its form: everyone who follows the group can see it and answer.
A follower who has not answered is shown its name, time and description with
Maybe and Going (`events/Answer.jsx`), on its page and in the group's Events
tab. Once they answer they follow the event, and its page opens to them.

**No avatar.** An event's picture is its cover. Wherever an avatar would be
drawn, `components/ActorAvatar.jsx` draws `EventDateTile` for an event: the
month over the day it starts on, on the reader's calendar, or a calendar icon
where the event is named without its times. Its page has no avatar to upload.

**Add to calendar** asks the server for the event as an `.ics` file and hands
it to the browser to save.

### Inviting people to a group

A group's page has **Invite** for whoever the group lets invite
(`authorized.invite`). It opens `containers/actors/Invite`: the viewer's own
followers, found by name and ticked, up to 50 at a time. The server answers
for each person, and its answer is shown beside the name (`utils/invites.js`).
Whoever looks after the group has a second tab, **Invited**, with who is still
to answer and a way to take an invitation back.

The person invited answers with `containers/controls/InviteAnswer.jsx`,
Decline and Accept, in three places: on the notification, on the group's page,
and on the limited card when the group is one they could not otherwise see.

Who can invite is set under Settings › Permissions. The old "Who can add a
follower?" row is gone: nobody is added without saying yes. The "+ Followers"
button and its picker went with it.

### Private profiles and asking to follow

A profile the viewer may not see is refused by the server, unless it lets
people ask to follow it. Then the server sends its name and picture, marked
`restricted`, and the web app draws `components/LimitedActorCard.jsx`: as the
card in the lists of people and of groups (`actors/Browse/Card.jsx`), and as
the whole page when the profile is opened (`actors/Read/index.jsx`).

The button on it is `containers/controls/FollowRequest.jsx`: "Request to
follow", then "Requested", which takes the request back when pressed. Whoever
looks after the profile answers from the follow requests on their own
profile, and is told by a notification.

### The home page of somebody not signed in

`assets/default/home`, the theme's, drawn at `/` in place of the feeds. It is
about the installation and not about Anahita: its name and description as
its operator set them (NodeInfo's `nodeName` and `nodeDescription`, the
build's until that has answered), how many people and posts are on it,
whether it is part of the fediverse, and the two ways in, Sign in and, where
NodeInfo says profiles can be made, Create a profile. Under that, three
cards on what can be done here, and links to what may be looked at without a
profile: people, groups, hashtags and About. That it runs on Anahita is one
line at the foot. A members-only installation never draws it
(`routes/MembersOnlyGate.jsx`).

### The fediverse

People on other servers (Mastodon and the like), and what they post. The
server's side is `activitypub-service`, described in the services'
`docs/federation.md`. It is optional: where there is none, everything here
draws nothing (`utils/federation.js#isAbsent`).

- **The composer says when a note will stay here.** Somebody on the
  fediverse, writing a note on their own profile for fewer than everybody,
  is told above the Post button that it will not be shared with the
  fediverse (`media/Composer/useOnFediverse.js`, asked once and kept up to
  date by the switch in settings). Nothing is said to anybody else, or
  about any other kind of post: only public notes go out.
- **Answering something from another server** is offered where the server
  says the viewer may (`authorized.comment`), as for any post: the reply is
  the viewer's own note and is sent to whoever it answers when the viewer
  is on the fediverse. When they are not, the reply form says that it will
  be read here and not there (`useReplyStaysHere`, in
  `media/Composer/useOnFediverse.js`). Liking and reposting something from
  elsewhere work the same way, where the server allows them
  (`authorized.like`), and reach its author's server.
- **A hashtag at `/tags/<name>`** leads to `/hashtags/<name>`
  (`routes/index.js#HashtagMoved`). It is the address other servers are
  given for a hashtag's page, where Mastodon has its own, because some of
  the apps people read with know a hashtag's link by that shape.
- **A profile from another server has three lists,** what was posted,
  Notes and Photos (`utils/node.js#getActorFeatureTabs`, `REMOTE_TABS`): a
  post of theirs that came with pictures is a photo post here. Articles
  and videos are not taken in from other servers, so those lists would be
  empty for ever and say the person has none; each comes back when it is
  taken in. Their replies and reposts are in what was posted, not in lists
  of their own. Nor is there the box of locations: where
  somebody is is theirs to say, and their server says nothing of it.
- **The servers the site refuses** are in Site settings, under Fediverse
  (`settings/Fediverse.jsx`), for super administrators as every tab there
  is: the list with why, and a button to stop refusing one. The list is
  read fifty at a time as it is scrolled and searched on the server, by
  name or reason, since an installation that takes up somebody else's list
  has thousands; a server is refused from a dialog, which says that
  refusing it does not remove what already came from it.

- **The switch** is a card under Settings › Fediverse, beside the Bluesky
  card, on the viewer's own profile only (`actors/Settings/Fediverse.jsx`): "Let people on other servers find and
  follow me". Off until the person turns it on, and theirs alone to turn
  on. It shows their handle, says that what is sent cannot be called back,
  asks before it is turned off (other servers are told to remove the
  person, and may not take them back), says that making a profile private
  has the same effect,
  and when they cannot turn it on (their profile is not open to everybody,
  or the site does not federate) it is disabled with the server's reason
  beside it.
- **Closing a profile is the one way to leave by accident,** so the card
  where a profile's audience is chosen (`actors/Settings/Access.jsx`) asks
  whether the person is on the fediverse, warns beside the choice as soon
  as anything but "everybody" is picked, and asks once more before saving.
  It is the only choice on that card that is confirmed, because it is the
  only one that cannot be undone. An administrator changing somebody
  else's profile is warned the same way.
- **Somebody from another server is a person like any other** to the app:
  their type ends in `person`, so they are opened at `/people/<handle>`,
  where the handle is whole, `alice@mastodon.example`, and the same page
  draws them. What differs is told by `utils/federation.js`:
  - their handle is drawn whole (`displayHandle`), where a username here
    is made safe first;
  - their About card says which network they are on, in a row with the
    network's mark (the butterfly for Bluesky, the hub for the fediverse),
    what of them is kept here, and a way to their own page there
    (`actors/Read/About.jsx`). Nothing is added to the header: it is a
    fact about the profile, not something to act on;
  - the server sends nothing they can be edited, run or posted on by, so
    none of those controls is drawn. Follow is, and works as for anybody.
- **A post from another server** is an ordinary note with a `uri`. Its menu
  has "View on <server>" (`media/MediaMenu.jsx`). It cannot be edited
  here, whatever the viewer's role (`permissions/node.js#canEdit`): it is
  its author's to change, on their own server. It can be liked, replied to
  and reposted wherever the server allows (`authorized`).
- **Looking somebody up** is on the search page
  (`search/RemoteLookup.jsx`): when what was searched for is a handle with
  a server in it or the address of a profile, a card offers to ask that
  server. It asks when the button is pressed, since asking tells another
  server that this site did; then the person found is drawn first among the
  search page's results, with their card and its Follow button. It asks at once,
  without the button, when somebody signed in typed an unmistakable
  handle into the search box and pressed Enter (`isClearHandle`:
  `@alice@mastodon.example`, a Bluesky DID, or a Bluesky handle written
  with `@` or on `bsky.social`). The box says so in the router's state; a
  link to the same search does not, so a link cannot make this site call
  another server just by being opened. See [Search](#search).
- **Bluesky is read through a service of its own,** which may be there
  when the fediverse's is not, or the other way round. To the app,
  somebody on Bluesky is somebody from another server like any other.
  What differs is in `utils/federation.js`:
  - **which service a lookup asks** is told by how the handle is written
    (`lookupKind`): `@alice@mastodon.example` has its server after a
    second `@`; `alice.bsky.social`, a `did:plc:…` or an address under
    `bsky.app/profile/` is Bluesky. `api/federation.js#lookup` sends it to
    `/activitypub/lookup` or `/atproto/lookup`, and the card goes for the
    one network whose service is not there, not for both;
  - **the page of a post or a person** (`pageOf`): on the fediverse the
    address a thing has between servers is its page; on Bluesky it is an
    `at://` address, and the page is worked out from it. "View on …"
    leads there, in the menus and on the profile;
  - **a reply to a post from Bluesky stays here unless its writer
    connected their Bluesky account:** `useReplyStaysHere` answers with
    the words to say so under the reply being written, and with nothing
    for somebody connected (`useOnBluesky`, asked once and kept up to
    date by the settings card).
- **A person's own Bluesky account** is connected in their settings,
  under Fediverse (`actors/Settings/Bluesky.jsx`): a handle and an app
  password, with a link to where Bluesky makes one, then "Connected as"
  and a button to disconnect, which asks first. When Bluesky no longer
  takes the connection the card says so and offers the form again.
  Once connected, a second button follows here the accounts they follow
  on Bluesky already. It asks first: a dialog says how many they follow
  there, offers a number (the 25, 100 or 500 followed most recently, or
  all of them when there are fewer), and says what it does and that it is
  not undone in one step. The server carries on with it after answering.
  Nothing is drawn where the installation does not write to Bluesky.

### Search

- **The box in the top bar** (`components/SearchBox.jsx`) is an MUI
  `Autocomplete` in free-solo mode. Searching opens the search page
  through the router, without reloading the app, and marks the search as
  typed (see Looking somebody up, above).
- **Recent searches** (`utils/recentSearches.js`): focused while empty,
  the box lists the last ten searches, newest first, each with the tab it
  was run under; typing narrows them; each can be forgotten, or all at
  once. The search page lists them too when nothing has been typed
  (`search/Browse/RecentSearches.jsx`). They are kept **in this browser
  only**, under a key with the person's id, and cleared when they sign
  out. Nothing about what somebody searched for reaches the server, so
  they do not follow somebody to another device. A search is remembered
  when it is run, however it was reached.
- **The controls:** the order as a small menu with, beside it, the two
  choices below as chips; the row wraps on a narrow screen. The distance
  is a slider on a line of its own under them (25 to 100 km, or anywhere),
  written to the address when it is let go.
- **Two choices for "Most relevant"** (`utils/searchChoices.js`), chips
  shown only with that order and only to somebody signed in: **Profiles I
  follow first** (people, groups and events they follow, and what is
  posted on them, before everything else) and **Newer results first** (the
  newest first among results that match equally well). Off as they
  come, kept in this browser per person, and sent with a search only when
  chosen (`followed_first`, `recent_first`).
- **The page keeps its place in its address** (`utils/searchAddress.js`):
  `?q=seeds&scope=feeds&sort=recent&km=50`. Reloading, going back and a
  link sent to somebody open it as it was. What is as it comes is left
  out. Changing the tab, the order or the distance replaces the address
  rather than adding to the history.
- **Each tab says how many it finds,** in grey after its name and short
  however large (`utils/shortCount.js`: 515, 1.2K, 48K, 3.1M, as the
  reader's language writes them). One request for each tab, asking for a
  single result and reading the total (`search/Browse/useScopeCounts.js`),
  again when the words or the distance change but not the order. **A tab
  that finds nothing is not drawn,** except All and the open one.
- **A search that finds nothing** says so (`search/Browse/NothingFound.jsx`),
  and offers the other tabs that would find something, from the same
  counts. A handle from another server is left to the lookup card instead.
- **A distance needs a place.** The server leaves the distance out when
  it is not told where the searcher is, so when the browser cannot say or
  was not allowed to, the page says that the search is not limited by
  distance, rather than search everywhere and look as though it had not.
  While the browser is still asking, it waits.

### Long posts

A long post on a card shows its first lines and **Read more**
(`components/ReadMore.jsx`): six lines on a post, four on a profile card.
The whole text is always drawn and only its height is kept short, with the
last line fading out, so nothing is cut through: a link or bold text near
the cut stays whole, and a screen reader has all of it. Read more is shown
only when the text is taller than that, measured as it is drawn and again
when a picture in it loads.

### Menus

Every item in the menus on posts, feed items, replies and profiles has an
icon before its words, through `components/MenuItemLabel.jsx`.

### Quote posts

A quote is a note that carries another post under its own words. It is an
ordinary note in every other way: its own audience, likes and replies.

- **Making one.** The repost button under a post opens a small menu, upward:
  Repost, or Quote (`containers/controls/Repost.jsx`). Quote is switched off
  where the server said this viewer may not quote this post
  (`authorized.quote`). It opens `containers/controls/QuoteDialog.jsx`, which
  posts a note on the writer's own profile with `quote_id`. A refusal at that
  point is said in the server's words (`utils/quotes.js`).
- **Showing one.** A note that quotes is sent `quote`: the post, or why it is
  not shown (`unavailable`, `detached`). `components/QuoteEmbed.jsx` draws
  either, inside the note, in feeds, lists and on the note's page. The server
  sends the post only to a reader who may see it.
- **Taking a post out.** On the page of a note that quotes their post, the
  quoted author has "Remove my post from this quote"
  (`containers/controls/QuoteDetach.jsx`). It cannot be undone.
- **Who can quote** is the third part of a post's interaction settings
  (`components/ReplyAccessDialog.jsx`): anyone, the author's followers, or
  nobody. A post that has never been asked follows its author's own setting,
  "Who can quote my posts", under Settings › Permissions
  (`containers/actors/Settings/QuotePolicy.jsx`).

There is no comment code left: the comment components, actions, reducers,
API modules and prop types went with the comment service. Two names remain
from then, because the server still uses them: `authorized.comment` and
`commentCount`.

The rules are the server's, in the services' `docs/permissions.md`, Replies.

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
