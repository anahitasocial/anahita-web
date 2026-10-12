# Anahita roadmap

*Planned 2026-09-28; items 22–26 and 0d added 2026-10-02, item 27 on 2026-10-03. One plan file per item, in the repo the item mostly touches.*

**The order follows four principles:**
1. Fix security and data problems first.
2. Lay shared foundations before the features that need them.
3. Build moderation before growth.
4. Save the biggest item, federation, for when everything it builds on exists.

Each milestone ends in a shippable state.

**Definition of done.** A phase is finished when its code, its tests and its documentation are done: every plan has a *Documentation* section listing the pages that phase must update. When a plan is finished, set its Status table, move it to `docs/plans/done/`, and update the plans table in anahita-services' `docs/README.md`.

`⬜ todo` · `🚧 in progress` · `✅ done`

| # | State | Item | Plan file | Repo | Est. sessions | Needs |
| --- | --- | --- | --- | --- | --- | --- |
| **Now** | ⬜ | Rotate the AWS key found in `k8s/00-secret.yml` | — | services | ops, minutes | — |
| **M1. Safety and cleanup** | ✅ | | | | **about 4–5** | |
| 1 | ✅ | 0 · Feed access leak | [feed-access-leak.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/feed-access-leak.md) | services | ½–1 | — |
| 1b | ✅ | 0b · auth-service hardening: IP lookup, `X-Forwarded-For`, refresh re-checks `Enabled`, TOTP freshness | [auth-service-hardening.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/auth-service-hardening.md) | services | 2 | — |
| 1c | ✅ | 0d · Remove unused legacy node columns; rename `hits` to `view_count` | [remove-unused-node-columns.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/remove-unused-node-columns.md) | services + web | ½ | — |
| 2 | ✅ | 1 · Remove private notes | [remove-private-notes.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/remove-private-notes.md) | services + web | 1 | — |
| 3 | ✅ | 18 · Delete legacy photo sets | (section of [photo-albums.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/photo-albums.md)) | services | ½ | — |
| 4 | ✅ | 2 · Remove site-wide media browse | [remove-global-media-browse.md](done/remove-global-media-browse.md) | web + services | ½ | — |
| **M2. Foundations** | ✅ | | | | **about 14–18** | |
| 5 | ✅ | 9 · Cloud-neutral (storage, local Garage, upload hardening, keys, k8s overlays) | [cloud-neutral.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/cloud-neutral.md) | services + web | 5–6 | — |
| 5b | ✅ | 0c · gRPC calls authenticated and encrypted: mTLS (cert-manager or Linkerd) | [auth-service-hardening.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/auth-service-hardening.md) | services | 2–3 | 9, 0b |
| 6 | ✅ | 6 · Sign in with a code | [login-code.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/login-code.md) | services | 3–4 | — |
| 7 | ✅ | 6b · Codes for signup, reset and email change (step-up by code left out) | [login-code.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/login-code.md) (phase 2) | services + web | 3–4 | 6 |
| **M3. Administration and moderation** | ✅ | | | | **about 15** | |
| 8 | ✅ | 4a · Admin area | [admin-area.md](done/admin-area.md) | web | 1 | — |
| 9 | ✅ | 4b · Abuse reports | [abuse-report-service.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/abuse-report-service.md) | services + web | 6 | 4a |
| 10 | ✅ | 5 · Complete purge + bulk cleanup | [actor-hard-delete.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/actor-hard-delete.md) | services + web | 6 | 4a |
| 10b | ✅ | 28 · One name for timestamps: every date-and-time column and field ends in `_at` | [timestamp-names.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/timestamp-names.md) | services + web | 2 | 4b, 5 |
| **M4. Posting experience** | ✅ | | | | **about 10–14** | |
| 11 | ✅ | 13 · Composer audience picker; members-only, preview and no-new-public settings | [instance-privacy.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/instance-privacy.md) | services + web | 5–7 | 4a |
| 12 | ✅ | 20 · Language on posts (the author chooses; detection and backfill left for later) | [content-language.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/content-language.md) | services + web | 2–3 | — |
| 14 | ✅ | 17 · Up to 4 images per photo post | [photo-albums.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/photo-albums.md) | services + web | 3–4 | 9 |
| 14b | ✅ | 29 · One actor service: people and groups merged into `actor-service`. Addresses and type names unchanged; nothing in the web app changes | [actor-service.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/actor-service.md) | services | under 1 | — |
| 14c | ✅ | 31 · One identity image service: avatars and covers merged into `identity-image-service`. Addresses unchanged; removing or replacing a picture now cleans up after itself; an actor's avatar has its own column, `avatar_filename`; nothing in the web app changes | [identity-image-service.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/identity-image-service.md) | services | under 1 | 29 |
| **M5. Conversations** | ✅ | | | | **about 17–22** | |
| 15 | ✅ | 7 · Notes as replies; retire comment-service. Done 2026-10-05: every comment is a reply, a post's author chooses who can reply, and comment-service and the comment code are removed | [notes-as-replies.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/notes-as-replies.md) | services + web | 7–9 | 0, 1 |
| 15b | ✅ | 24 · Profile tabs for replies and reposts, with a "show my reposts" setting. Done 2026-10-05, with a page for a single reply | [profile-tabs-and-reposts.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/profile-tabs-and-reposts.md) | services + web | 2 | 7 |
| 15c | ✅ | 25 · Quote posts. Done 2026-10-05 | [quote-posts.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/quote-posts.md) | services + web | 3–4 | 13 |
| 16 | ✅ | 15 · Pinned posts (one a profile); story-service removed. Done 2026-10-05. The "New from people you follow" tray was built and taken out again: see Kept for later | [pinned-posts-and-activity-tray.md](done/pinned-posts-and-activity-tray.md) | services + web | 3–4 | 0 |
| 16b | ✅ | 22 · Interactions (first called Post activity): likes, reposts, quotes and replies, with who did each. Done 2026-10-05. Views and insights were set aside by the user's decision | [post-insights.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/post-insights.md) | services + web | 2–3 | 7, 25 |
| 16c | ✅ | 33 · Saved posts: save a post privately, and a Saved page in the left menu (first a tab on your own profile). No folders. Collections (34) are a separate feature and leave this as it is. Asked for and done 2026-10-06; no plan file, see the architecture pages of both repos | — | services + web | 1 | — |
| **M6. Community** | ✅ | | | | **about 10–13** | |
| 17 | ✅ | 11 · Invitations (plus 8 socialgraph bug fixes). Done 2026-10-10. Step 0 fixed the eight and five more found on the way, two of them holes. Then: a private profile that lets people ask shows its name and picture with Request to follow; the Social Graph tab became a dialog opened from the number of followers, with Blocked moved to settings; and invitations themselves, where nobody joins a group without saying yes | [actor-invitations.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/actor-invitations.md) | services + web | 5–6 | 4b limiter |
| 18 | ✅ | 12 · Events. Done 2026-10-10: an event is an actor served beside groups, with times in a chosen zone, places, Going and Maybe, calling off, hosting by a group, a calendar file, reminders, archiving and notifications; Events in the menu, the form with a place, the event page, and a group's Events tab. `EVENTS_FROM` decides who may make one. An event can be opened to its host group's followers. Decided against: turning an event into a group | [events.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/events.md) | services + web | 5–7 | 11 |
| **M7. Discovery** | ✅ | | | | **about 16–19** | |
| 19 | ✅ | 14 · Custom feeds. Done 2026-10-11: a feed is a node with what it shows as a definition, read for whoever is looking so that it never widens what they may see; made, changed, copied, deleted and previewed; kept as tabs on Home after Following, in the viewer's order; "Custom feeds" in the menu; following a hashtag is a feed of it. Newest first only. Not tried signed in by Claude | [feed-generators.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/feed-generators.md) (update) | services + web | 5–7 | 0 |
| 20 | ✅ | 3 · Recommendation service. Done 2026-10-11: an optional `recommendation-service` that suggests people and groups from who follows whom, who invited whom, what was liked and posted about, each with its reason; nobody suggested whom the viewer may not see or who asked not to be; Who to follow on Home, a Suggestions page, and the choices in settings. Left out: interests picked by hand, suggestions in onboarding, nearby. Not tried signed in by Claude | [recommendation-service.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/recommendation-service.md) | services + web | 6 | 0, 1 |
| 21 | ✅ | 10 · Link previews + web shell (Open Graph). Done 2026-10-11: an optional `link-preview-service` reads the page a link points to, safely, and a note carries its card, with the picture kept on this installation; an optional `web-shell` sends the app with each public page's own title, description and picture, so a shared link shows as itself. The shell is on the app's own host, since the app's pages and the API's calls share paths. Left out: oEmbed, places' and feeds' pages | [link-previews.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/link-previews.md) + [open-graph.md](done/open-graph.md) | services + web | 4–5 | 9 |
| 21b | ✅ | 23 · Share button. Done 2026-10-11, ahead of its place: one share dialog (copy, email, Mastodon, Bluesky, the device's sheet), on posts' and profiles' menus and on shared custom feeds | [share-button.md](done/share-button.md) | web | ½–1 | 10 |
| **M8. Media and portability** | ✅ | | | | **about 13–17** | |
| 22 | ✅ | 16 · Video service + worker. Done 2026-10-11: a browser sends a video straight to storage in parts; `video-worker` checks it, makes 1080p, 720p and 360p (up to 4K by setting) and a poster with ffmpeg, and only then makes the post; played with a quality menu. Ten minutes and 500 MB unless the installation says more. Off until `VIDEO_UPLOADS=on`. Left out: a notification when a video is ready, PeerTube embeds, HLS | [video-service.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/video-service.md) | services + web | 5–7 | 9 |
| 22b | ✅ | 37 · Downloading what a post holds. Done 2026-10-11: an "Allow download" switch on each photo and video, off unless turned on, starting from a default on the person's or group's profile; a Download button for whoever can see the post, and for its author always. Left out: attached files (not built), a zip of several images | [downloads.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/downloads.md) | services + web | 2–3 | 16 |
| 23 | ✅ | 21 · Download your data. Done 2026-10-11: somebody who has just proved who they are asks for a copy of everything they put here; `export-worker` gathers their posts, replies, photos, videos, follows and blocks into one zip with a page to read it from and ActivityStreams files, kept a week. One at a time and one a week. Left out: the account's own data, a notification when it is ready | [data-export.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/data-export.md) | services + web | 6–7 | 9, 5 |
| **M9. Federation** |  | | | | **about 23–30** | |
| 24 | ✅ | 8 · Phase 0 groundwork. Done 2026-10-12: every node has a UUID; one place says where the installation is; a post's text is converted both ways and safely; the graph keeps people and notes from other servers and refuses anything else; a public profile's pictures have an address that stays; what is to be sent waits in a durable queue; the web app's host sends other servers on to the API; and a lab with GoToSocial runs on one machine (`make fedi_lab`). Nothing is sent to another server yet. The gateway's routes to `activitypub-service` come with that service | [federation.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/federation.md) | services | 5–6 | 0, 9, 10 |
| 25 | 🚧 | 8 · Phase 1 ActivityPub. Begun 2026-10-12: `activitypub-service`; a person turns federation on for themselves and is given a signing key; another server finds them by their handle and reads their description (tried against GoToSocial in the lab); requests are signed and checked; somebody on another server is looked up and kept (GoToSocial accepted the signed request); somebody on another server follows somebody here through the inbox and is sent an Accept from a durable queue (followed and unfollowed from GoToSocial); somebody here follows somebody elsewhere, settled by that server's yes or no (tried with GoToSocial, approval and unfollow included); public notes go out to followers and come in from people followed, with their changes and deletions (all four ways tried with GoToSocial); the web app has the Fediverse switch in settings, shows people and posts from other servers, and looks people up from search. A person can leave again (which other servers treat as for good), profile changes and closed accounts travel, an administrator can refuse a server, and the services' `docs/federation.md` has the guide to setting it up. Left: a screen for refused servers, avatars of people elsewhere, a test against Mastodon itself | [federation.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/federation.md) | services + web | 7–9 | 24 |
| 26 | ⬜ | 8 · Phase 1 AT Protocol | [federation.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/federation.md) | services + web | 6–8 | 24 |
| 26b | ⬜ | 26 · Verified domains: prove you own a website; domain as Bluesky handle, verified link on Mastodon | [verified-domains.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/verified-domains.md) | services + web | 4–5 | 8, 10 |
| **Before the first release** |  | | | | **about 1–1½** | |
| 27 | ⬜ | 27 · One clean schema: fold the migrations into a baseline | [migration-baseline.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/migration-baseline.md) | services | 1–1½ | every schema change above |
| 28 | ⬜ | 38 · The API reference: every request and answer as OpenAPI, made from the code, with a test that fails when it is out of date. Planned 2026-10-11; **place in the order not decided** | [api-reference.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/api-reference.md) | services + web | 7–9 | — |
| 29 | ⬜ | 39 · Documentation agents can use: `AGENTS.md` with the working agreements in both repositories, where the code is on every page, and a read-only MCP server for the docs, plans and API reference. No second set of docs. Planned 2026-10-11; **place in the order not decided** | [docs-for-agents.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/docs-for-agents.md) | services + web | 3–4 | 38 for its route lookups |
| 30 | ⬜ | 40 · Anahita Recipes: a starting Kubernetes configuration for each kind of site (newsroom, council, school, university, neighbourhood, household, community), chosen apart from where it runs and how big it is. Planned 2026-10-11; **place in the order not decided** | [recipes.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/recipes.md) | services + web | 3–4 | 9, 13; 8 for federating |
| 31 | ⬜ | 41 · Animated images: a GIF, APNG or animated WebP posted through the video service as a short, silent, looping clip, as Mastodon does. Planned 2026-10-12; **place in the order not decided** | [animated-images.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/animated-images.md) | services + web | 2–3 | 16; 8 phase 3 to federate |
| **Kept for later** (not scheduled, not counted in the total) |  | | | | | |
| — | ⬜ | 30 · The Website actor: a website as something to follow, fed by syndication, with plugins for WordPress, Drupal and Joomla if needed. Goal and name recorded 2026-10-05; **scope open, not to be built yet** | [website-actor.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/website-actor.md) | services + web | not estimated | 29, 8, 26 |
| — | ⬜ | 32 · Stories, as the user described them on 2026-10-05: a queue of posts an actor has shared, which lasts 24 hours, shown above the feed with one queue for each actor. Not needed while an installation has few people and little activity. **Not designed and not to be built yet**; the tray that was tried and removed is described in the plan | [pinned-posts-and-activity-tray.md](done/pinned-posts-and-activity-tray.md) | services + web | not estimated | 15 |
| — | ⬜ | 34 · Collections: an album of posts of any kind. A collection is a media node (title, description, audience, likes, replies, reposts), its author orders what is in it, it opens as a slide show, and people, groups and events can have them. Filled from saved posts; saving itself stays as it is. Anahita only, not federated. Shape decided by the user 2026-10-06, five questions open, **not scheduled** | [collections.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/collections.md) | services + web | not estimated, roughly 6 | 33; 12 for events |
| — | ⬜ | 42 · A command-line client: Anahita in a terminal, text only, for a slow connection, SSH or a screen reader. Our own client against the API, generated from the API reference, with a way to sign in where there is no browser (a device flow in auth-service). Existing Mastodon and Bluesky clients cannot be used, and a Mastodon-compatible client API is decided against. A repository of its own, `anahita-cli`. Recorded 2026-10-12, **for later; gone into more deeply when `anahita-mobile` (React Native) is planned** | [cli-client.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/cli-client.md) | anahita-cli + services | 5–6 | 38 |
| — | ⬜ | 36 · Search: recent searches kept in the browser, the search page keeping its tab and order in the address, and words for an empty search. Raised by the user 2026-10-11, **not scheduled** | [search-improvements.md](search-improvements.md) | web | 1½, or 2 with results as you type | — |
| — | ⬜ | 35 · Refinements the user asked to come back to on 2026-10-09: the followers dialog (Followers, Following, In common), and the header of an actor's profile. **Not specified yet** | — | web | not estimated | 11 |
| — | ⬜ | 19 · Creative Commons licences. Taken out of M4 on 2026-10-04: the licence label does not reach Mastodon or Bluesky. Look again after items 16 and 17 | [content-licences.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/content-licences.md) | services + web | 3–4, or 1 for a badge only | 16, 17 |

**Total: about 472–622 hours, roughly 116–156 sessions** at about 4 h per session. Shared pieces built once save a few percent:
- the rate limiter;
- `FilterNodesForViewer`;
- the jobs queue;
- the file-grpc streaming RPCs;
- the ingress/TLS work.

**Deliberately early groundwork for federation:**
- item 9 already fixes storage, TLS and ingress;
- item 10 settles web hosting on the same front as the API;
- item 7 gives replies the ActivityPub shape.

To get to federation sooner, you can move **M9 phase 0** right after M3 and do **phase 1 ActivityPub** after M5. The cost is building feeds, events and video afterwards with federation in mind. Everything is already designed for that.

**Shared components, built by whichever item comes first:**

| Component | Used by |
| --- | --- |
| Shared rate limiter (`anahita-libs`) | 4b, 3, 10, 11, 20, 21 |
| `FilterNodesForViewer` (graph-grpc) | 3, 4b |
| Durable jobs queue (`anahita-libs/jobs`) | 8, 16, 21 |
| file-grpc streaming RPCs | 16, 21 |
| Stable public media URLs | 9 A / 8 phase 0.4, used by 10, 16, 17, 19 |
| Kustomize base, TLS, ingress | 9 E, used by 8 phase 0.8 |

### Plan files

**anahita-services** (`docs/plans/`), linked in the table above:
- scheduled: `auth-service-hardening.md` (items 0b and 0c);
- new: `feed-access-leak.md`, `remove-private-notes.md`, `recommendation-service.md`,
  `abuse-report-service.md`, `actor-hard-delete.md`, `login-code.md`, `federation.md`,
  `cloud-neutral.md`, `link-previews.md`, `actor-invitations.md`, `events.md`,
  `instance-privacy.md`, `video-service.md`, `photo-albums.md`, `content-licences.md`,
  `content-language.md`, `data-export.md`, `post-insights.md`, `profile-tabs-and-reposts.md`,
  `quote-posts.md`, `verified-domains.md`, `migration-baseline.md`;
- extended with a "Decisions and schedule" section: `notes-as-replies.md`, `feed-generators.md`;
- pointers added: `done/onboarding.md` (recommendations) and `actor-profile-management.md` §2 (hard delete).
- finished, in `done/`: `signup-and-onboarding.md`, `onboarding.md`, `dissolve-people-people.md`, `actor-lifecycle-states.md`, `remove-unused-node-columns.md`, `feed-access-leak.md`, `remove-private-notes.md`.

**anahita-web** (`docs/plans/`): this roadmap, `admin-area.md`,
`open-graph.md`, `pinned-posts-and-activity-tray.md`, `share-button.md`; finished, in `done/`: `deps-upgrade.md`, `mui-upgrade.md`, `onboarding.md`, `remove-global-media-browse.md`.

The operator guide `anahita-services/docs/deploying.md` (provider matrix and `STORAGE_*` settings)
is written as part of item 9, once those settings exist.
