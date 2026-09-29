# Pinned posts and a "New from people you follow" tray (instead of stories)

*Roadmap item 15, planned 2026-09-28. See the [roadmap](roadmap.md) for order and dependencies.*

## Context and decision
- **What was proposed:** a story-service where people share one of their posts as a story, followers see stories from the actors they follow and tap through to the post, and each story keeps a list of who viewed it.
- **Decision: don't build stories** (decided 2026-09-28).
  - Ephemeral stories have no standard on the fediverse. Mastodon and Bluesky have none, and Pixelfed's stories only federate between Pixelfed servers.
  - Viewer lists mean recording who looked at what. The fediverse deliberately avoids read receipts and view tracking, and it would add a data-retention and privacy burden.
- **Instead, two fediverse-native pieces that deliver the useful part:**
  1. **Pinned posts** on profiles and groups. These federate as Mastodon's `featured` collection and Bluesky's `pinnedPost`.
  2. **A "New from people you follow" tray:** the story-like row of avatars at the top of home. Tapping one steps through that actor's recent posts and links to each post. There's no new content type and **no server-side view tracking**.

## What exists
- **story-service was never written.** Only dead wiring remains:
  - a compose entry (`docker-compose.yml:338-354`, port 8090);
  - an nginx upstream and location (`nginx/nginx.conf:43-44, ~1030`);
  - `dockerfiles/story-service.dockerfile`.
- The web app's `src/containers/stories/*` (legacy **activity** stories: `PhotoAdd`, `Actor`, `TodoStatus`, …) are imported nowhere, and `stories` is listed in the `src/api/index.js:108` namespaces.
- `nodes.featured_at` exists, but it means *site-featured actors* (super-admin). Pinning is a different concept and gets its own column.
- The leaders feed and the actor feed are in feed-service and graph-grpc (`feed_leaders.go`, `feed_actor.go`).

## Implementation
**A. Pinned posts**
- **Data:** a `nodes.pinned_at datetime NULL` column, indexed with `owner_id` (a migration mirrored in `init.sql` and `legacy/upgrade.sql`).
- **Endpoints:** `PUT /{ns}/:id/pin` and `DELETE /{ns}/:id/pin` for articles, notes, topics and photos (text-service and photo-service, sharing a handler in `anahita-libs`).
  - Allowed for the post's owner, meaning the profile it's on: a person on their own profile, or a group's admins.
  - At most **5** pinned per owner; pinning a 6th returns 409 with the current pins.
  - Pinned replies aren't allowed (item 7).
- **Reads:**
  - the actor feed (`GET /feeds/actor/:id/`) and profile media tabs return pinned posts first (`ORDER BY pinned_at IS NULL, pinned_at DESC, created_on DESC` on the first page only), each marked `pinned: true`;
  - pinned posts are left out of later pages so they don't appear twice.
- **Access:** unchanged. A pinned followers-only post is still hidden from non-followers.
- **Events (item 12):** host announcements use the same pin mechanism.
- **Federation (item 8):**
  - ActivityPub: the actor JSON gets `featured` → an `OrderedCollection` of pinned public notes.
  - AT Protocol: `pinnedPost` goes on the `app.bsky.actor.profile` record (a single pin; send the most recent).
  - Recorded in item 8 phase 2.
- **Web:** "Pin to profile" / "Unpin" in `MediaMenu` and `feed/Menu` (following the `controls/*` pattern), a pin icon plus a "Pinned" label on pinned items, and i18n.

**B. "New from people you follow" tray**
- **Endpoint:** `GET /feeds/leaders/active?hours=24` (feed-service, calling a new graph-grpc RPC).
  - Returns the actors the viewer follows (people, groups, events, and remote actors after item 8) that have **public-to-the-viewer** posts in the window.
  - Each entry: `{ actor, latest_post_at, count, first_post_id }`, ordered by `latest_post_at`, at most 30.
  - It uses the same access gate as the leaders feed, fixed by item 0.
- **What's already seen is tracked only on the device.** The web app keeps `lastSeen[actorId] = timestamp` in `localStorage` (with try/catch). Avatars with posts newer than that get a coloured ring, the rest are dimmed.
  - **Nothing is sent to the server.** Nobody, not even the poster, can see who looked.
  - The trade-off is that "seen" doesn't sync across devices. Acceptable, and consistent with no tracking.
- **Viewer:**
  - Tapping an avatar opens a full-screen stepper (reuse `src/containers/media/Stepper`) over that actor's posts in the window, oldest unseen first.
  - Each card shows the post (text trimmed, photo or cover image) with **"Open post"** linking to the media node.
  - Swipe or arrows move between posts, and the next actor follows at the end.
  - Closing updates `lastSeen`.
- **Placement:** the top of the home page (`src/containers/Dashboard.jsx`), above the tabs from item 14. It's hidden when empty.

**C. Cleanup**
- Remove the dead story-service wiring: the compose entry, the nginx upstream and location, the dockerfile, and any Makefile targets.
- Remove the web app's unused `src/containers/stories/*`, the `stories` API namespace, and their i18n files.
- Update `anahita-services/docs/architecture.md` if it lists story-service.

## Estimate

| Part | Time |
| --- | --- |
| A. Pinned posts: column + migration, shared pin handler, limits, pinned-first reads + tests | 3–4 h |
| A. Web: pin menu items, pinned label | 1–2 h |
| B. Active-leaders RPC + endpoint + access tests | 2–3 h |
| B. Web: tray, stepper viewer, `localStorage` seen state | 4–5 h |
| C. Cleanup | 1–2 h |
| **Total** | **about 11–16 h, 3–4 sessions** |

## Verification
- **Pinning:**
  - Pin 5 posts; the 6th gives 409.
  - Pinned posts lead the profile's first page and don't reappear on page 2.
  - A group member who isn't an admin can't pin in the group.
  - A pinned followers-only post stays hidden from strangers.
- **Tray:**
  - Follow A, B and C; A and C post. The tray shows A and C with rings, and B doesn't appear.
  - Opening A steps through A's posts, "Open post" navigates to the node, and on return A is dimmed.
  - A private post by C isn't counted for a viewer who can't see it.
  - The browser's network log shows no request recording the view.
- **Cleanup:** `docker compose config` no longer lists story-service, nginx starts without the upstream, and the web build has no `stories` code.

## Decisions (item 15)
- No stories and no viewer lists.
- Pinned posts (at most 5 per owner) and a "New from people you follow" tray, with seen state kept on the device only.
- Remove the dead story-service wiring and the legacy web stories code.

## Dependencies
- **Hard:** item 0 (the feed access gate the tray relies on).
- **Soft:** item 14 (the tray sits above the home feed tabs), item 12 (pinned host announcements), item 8 (pins federate as `featured` / `pinnedPost`), item 7 (replies can't be pinned).

## Documentation

A phase is finished only when these pages match the code. anahita-services pages are under its `docs/`, anahita-web pages under its `docs/`. When a page is added, add it to that repo's `docs/README.md` contents too.

- **services `permissions.md`**: who may pin, and the limit of 5.
- **services `architecture.md`**: `pinned_at`, `GET /feeds/leaders/active`, and story-service removed.
- **web `architecture.md`**: the tray (seen state kept on the device only) and pinned posts.

## Status

| Item | State |
| --- | --- |
| Plan | written 2026-09-28 |
| Implementation | not started |
