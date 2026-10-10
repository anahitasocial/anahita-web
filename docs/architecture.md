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
| `/` | The landing page when signed out. Signed in, home: `containers/feeds`, with the composer and the feed. `/dashboard` leads here |
| `/auth`, `/oauth/callback` | Signing in |
| `/people`, `/people/:id` | People, and a person's profile. `:id` is their username |
| `/people/:id/:tab`, `/groups/:id/:tab` | A profile opened on one of its tabs: one of its kinds of post, or for a person `replies` or `reposts` |
| `/saved` | The posts the viewer saved. Signed in only; in the left menu |
| `/events`, `/events/add`, `/events/:id`, `/events/:id/edit` | The viewer's own events, making one, an event's page, changing it. See *Events* |
| `/people/:id/settings/:section` | A person's settings, grouped into sections |
| `/groups`, `/groups/:id` | Groups, and a group. `:id` is `<id>-<slug>` |
| `/groups/:id/settings` | A group's settings |
| `/notes/:id`, `/articles/:id`, `/topics/:id`, `/photos/:id` | One post. There is no page listing every post of a type; the bare paths send an old bookmark home |
| `/hashtags/:alias`, `/locations/:id` | Hashtags and places |
| `/notifications` | The viewer's notifications |
| `/admin/:tab` | The administration area. The tab is in the address so an email can link to it. See below |
| `/invites` | Invitations, for a member who may invite. An administrator is sent to `/admin/invites` |
| `/settings` | Site settings, for super administrators only. A page and a menu entry of its own: OAuth clients, signing keys, and Privacy, which shows what the installation lets visitors read and can make everything public members-only |
| `/signup-requests` | Where the signup queue used to be. Redirects to `/admin/signup-requests` |
| `/legal/tos`, `/legal/privacy`, `/agreements` | The legal documents, and accepting new versions |
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
starts: the language this person last posted in, in this browser; then the
posting language on their profile, which the session's viewer carries; then
the browser's language; then English. Language names come from the browser
(`Intl.DisplayNames`), in the language the app is being read in.

Where a post's text is drawn, `components/NodeBody.jsx` puts the post's
language on it as the `lang` attribute, so a screen reader reads each post in
the right one.

**Right-to-left writing.** The interface is left to right and has no
right-to-left layout. What people write is another matter: a post's title and
text, and the fields they are typed into, carry `dir="auto"`, so Persian,
Arabic or Hebrew runs right to left and aligns to the right. The direction
comes from the text, not from the language tag, so it holds for untagged and
older posts, and each paragraph of a post is judged on its own. Mirroring the
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
  where its thread is (`containers/feed/components/ReplyButton.jsx`), and
  `components/ReplyStats.jsx` shows how many replies it has.

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
  profile's owner asks for that, under Settings › Access
  (`containers/actors/Settings/RepostsOnProfile.jsx`), and the server applies
  it.

### Home

Home for somebody signed in is `containers/feeds/index.jsx` (it was
`Dashboard.jsx`; the menu says "Home" either way): the composer and the feed
of the people and groups the viewer follows. It lives under `feeds` because
custom feeds will be tabs on it.

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
other people look at. There are no folders. Collections (roadmap item 34) are a
separate feature, filled from this list, and leave it as it is.

It is private end to end: the server never says who saved a post. The page
says so in one line under its title. The mark is told to every list on the page (`POST_SAVED_CHANGED`,
handled in `reducers/create.js`).

### A post's interactions

"Interactions" is a dialog with four lists: who liked a post, reposted it,
quoted it and replied to it, with an icon and the count of each on its tab
(`containers/activity/PostActivity.jsx`, `utils/activity.js`). It opens from
the number of likes under a post, which can be pressed whenever the post has
any of the four, and from "Interactions" in a post's menu. In the code it is
still called activity. Each list is read
when its tab is first opened. People in the likes and reposts lists have a
Follow button; quotes and replies show what was said and lead to the note.

There are no views in it, and nothing anywhere counts them.

### Followers, following and what is in common

Under a profile's name is the number of its followers. Pressing it opens a
dialog (`actors/Read/SocialgraphDialog.jsx`, `utils/socialgraph.js`) with up
to three lists: **Followers**, **Following** (who the profile follows; people
only; `leaders` in the code and the API, which is Anahita's own word for it), and **In common** (the people the viewer follows who follow this
profile; for somebody signed in, on a profile that is not their own). Each is
read when first opened and more of it as its end is scrolled to, whoever
followed most lately first. A Latest / Oldest switch above the list turns the
order round (`?dir=asc`). A group's administrators can remove a follower
there.

What is in common is found by one query in the graph, so it is whole, paged
and counted; its number is on its tab once the tab has been opened.

A person who follows the viewer says so: "Follows you" under their name on
their profile, and beside their name in these lists. The button that follows
them then reads "Follow back" (`utils/socialgraph.js`, `controls/Follow.jsx`).

There is no Social Graph tab. An old address such as
`/people/ana/socialgraph/leaders` opens the profile with that list showing.

**Blocked** is not in the dialog: who you have blocked is yours alone, and is
a card under Settings › Access (`actors/Settings/Blocked.jsx`), with Unblock
on each.

### Events

An event is an actor like a group, so most of it is the containers a group
uses, told the `events` namespace: its page (`actors/Read`), its settings, its
administrators, its access. What only an event has is in `containers/events`.

| Where | What |
| --- | --- |
| **Events** in the left menu, `/events` | The viewer's own: Upcoming, Invited, Hosting, Past (`events/index.jsx`). There is no list of every event |
| `/events/add`, `/events/add?host=<group id>` | The form (`events/Form.jsx`). With a host it is the group's event |
| `/events/:id` | The actor page with `events/Panel.jsx` above the tabs: when it is, who hosts it, how many are going, Going and Maybe, Add to calendar, and for its administrators Edit and Cancel |
| `/events/:id/edit`, and Info under its settings | The same form, to change it |
| A group's **Events** tab | What the group hosts, upcoming or past, with Add event for its administrators (`events/Hosted.jsx`) |

**Times** are kept as instants with the name of the zone they were chosen in.
The form works on that zone's clocks, whatever zone the browser is in; a
reader sees them on their own, with a second line for the event's zone when
it differs. `utils/events.js` does both with `Intl`, clock changes included,
and has the tests for it.

**Answering** is Going or Maybe, and is following the event, so an event's
page has no Follow button. The number going opens who they are
(`events/Attendees.jsx`). The link to join online is sent by the server only
to whoever is going or looks after the event.

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
  "Who can quote my posts", under Settings › Access
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
