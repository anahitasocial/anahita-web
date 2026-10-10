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
| **M6. Community** |  | | | | **about 10–13** | |
| 17 | ✅ | 11 · Invitations (plus 8 socialgraph bug fixes). Done 2026-10-10. Step 0 fixed the eight and five more found on the way, two of them holes. Then: a private profile that lets people ask shows its name and picture with Request to follow; the Social Graph tab became a dialog opened from the number of followers, with Blocked moved to settings; and invitations themselves, where nobody joins a group without saying yes | [actor-invitations.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/actor-invitations.md) | services + web | 5–6 | 4b limiter |
| 18 | 🚧 | 12 · Events. Phase 1 done 2026-10-10, server only: an event can be made, read, changed, answered (going or maybe, with places guarded) and called off. Still to do: lists, calendar file, sweep, notifications, the web app | [events.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/events.md) | services + web | 5–7 | 11 |
| **M7. Discovery** |  | | | | **about 16–19** | |
| 19 | ⬜ | 14 · Custom feeds ("your algorithm") | [feed-generators.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/feed-generators.md) (update) | services + web | 5–7 | 0 |
| 20 | ⬜ | 3 · Recommendation service | [recommendation-service.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/recommendation-service.md) | services + web | 6 | 0, 1 |
| 21 | ⬜ | 10 · Link previews + web shell (Open Graph) | [link-previews.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/link-previews.md) + [open-graph.md](open-graph.md) | services + web | 4–5 | 9 |
| 21b | ⬜ | 23 · Share button | [share-button.md](share-button.md) | web | ½–1 | 10 |
| **M8. Media and portability** |  | | | | **about 11–14** | |
| 22 | ⬜ | 16 · Video service + worker | [video-service.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/video-service.md) | services + web | 5–7 | 9 |
| 23 | ⬜ | 21 · Download your data | [data-export.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/data-export.md) | services + web | 6–7 | 9, 5 |
| **M9. Federation** |  | | | | **about 23–30** | |
| 24 | ⬜ | 8 · Phase 0 groundwork | [federation.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/federation.md) | services | 5–6 | 0, 9, 10 |
| 25 | ⬜ | 8 · Phase 1 ActivityPub | [federation.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/federation.md) | services + web | 7–9 | 24 |
| 26 | ⬜ | 8 · Phase 1 AT Protocol | [federation.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/federation.md) | services + web | 6–8 | 24 |
| 26b | ⬜ | 26 · Verified domains: prove you own a website; domain as Bluesky handle, verified link on Mastodon | [verified-domains.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/verified-domains.md) | services + web | 4–5 | 8, 10 |
| **Before the first release** |  | | | | **about 1–1½** | |
| 27 | ⬜ | 27 · One clean schema: fold the migrations into a baseline | [migration-baseline.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/migration-baseline.md) | services | 1–1½ | every schema change above |
| **Kept for later** (not scheduled, not counted in the total) |  | | | | | |
| — | ⬜ | 30 · The Website actor: a website as something to follow, fed by syndication, with plugins for WordPress, Drupal and Joomla if needed. Goal and name recorded 2026-10-05; **scope open, not to be built yet** | [website-actor.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/website-actor.md) | services + web | not estimated | 29, 8, 26 |
| — | ⬜ | 32 · Stories, as the user described them on 2026-10-05: a queue of posts an actor has shared, which lasts 24 hours, shown above the feed with one queue for each actor. Not needed while an installation has few people and little activity. **Not designed and not to be built yet**; the tray that was tried and removed is described in the plan | [pinned-posts-and-activity-tray.md](done/pinned-posts-and-activity-tray.md) | services + web | not estimated | 15 |
| — | ⬜ | 34 · Collections: an album of posts of any kind. A collection is a media node (title, description, audience, likes, replies, reposts), its author orders what is in it, it opens as a slide show, and people, groups and events can have them. Filled from saved posts; saving itself stays as it is. Anahita only, not federated. Shape decided by the user 2026-10-06, five questions open, **not scheduled** | [collections.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/collections.md) | services + web | not estimated, roughly 6 | 33; 12 for events |
| — | ⬜ | 35 · Refinements the user asked to come back to on 2026-10-09: the followers dialog (Followers, Following, In common), and the header of an actor's profile. **Not specified yet** | — | web | not estimated | 11 |
| — | ⬜ | 19 · Creative Commons licences. Taken out of M4 on 2026-10-04: the licence label does not reach Mastodon or Bluesky. Look again after items 16 and 17 | [content-licences.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/content-licences.md) | services + web | 3–4, or 1 for a badge only | 16, 17 |

**Total: about 463–610 hours, roughly 114–153 sessions** at about 4 h per session. Shared pieces built once save a few percent:
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
