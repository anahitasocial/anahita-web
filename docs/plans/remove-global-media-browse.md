# Remove the site-wide media browse views

*Roadmap item 2, planned 2026-09-28. See the [roadmap](roadmap.md) for order and dependencies.*

## Answer: no, we don't need them
Media discovery should go through feeds, search, hashtags and actor profiles.
- The site-wide lists are just the profile list with the owner filter left off. They show every post on the site in date order, with no ranking and no context.
- They are reachable only from four left-menu entries.
- On a federated network, a "list every note on the server" page means little. Discovery belongs to feeds.
- `anahita-services/docs/plans/feed-generators.md` already makes feed generators the discovery surface, including a first-party "Trending" feed ranked by degree and trending score. That feed replaces these pages.

## What exists today
**anahita-web**
- Routes: `src/routes/index.js:81-91` build `Media('articles'|'notes'|'photos'|'topics')`, mounted at `/articles`, `/notes`, `/photos`, `/topics` (:291-301). Each type also has a `/:id` read route, which stays.
- Wrapper: `src/containers/media/index.jsx:10-24` renders `Browse(namespace)` with `oid: 0, sort: RECENT`.
- Menu: `src/assets/default/navs/LeftMenu.jsx:89-128` (items) and `:13-16` (icon imports).
- Profile tabs reuse the same list: `src/containers/actors/Read/index.jsx:20,124-131` renders `MediaBrowse(tab)` with `queryFilters={{ oid: actor.id }}`, and tabs are chosen by `TAB_COMPONENTS` in `src/constants/actor.js:21-31`.
- Dead code found along the way: `src/containers/Explore.jsx` (not routed), `APP.TABS.EXPLORE` in `src/constants/app.js:20-29`, and `src/assets/components/{MediaCard,NodesCard,MapCard}.jsx`, which link to unrouted `/explore/*` pages and are imported nowhere.
- No tests touch any of this.

**anahita-services**
- `text-service/cmd/api/routes.go:33-34,48-49,63-64` and `photo-service/cmd/api/routes.go:32-33` register both `GET /` and `GET /:owner_id/` on the same `Browse` handler.
- `anahita-libs/requests/media.go:49-56`: `OwnerID` binds from `param:"owner_id"` or `query:"oid"` with `omitempty`, so owner 0 gives the site-wide list.
- graph-grpc (`cmd/server/handlers/medium.go:38,69`, `data/repositories/nodes.go:30,125`) applies the owner filter only when it is > 0. Nothing else calls the site-wide list: search, hashtags and locations use their own queries.

**Bug found along the way:** the client sends `sort=recent`, but the API binds `ordering` (`media.go:52`), so the sort is silently ignored on both the site-wide and profile lists.

## Implementation
**anahita-web**
1. Remove the four site-wide routes and the `Media(...)` constants in `src/routes/index.js`. Keep the `/:id` read routes.
2. Remove the four menu items and icon imports in `LeftMenu.jsx`.
3. Delete `src/containers/media/index.jsx` and the dead Explore code (`Explore.jsx`, `APP.TABS.EXPLORE` and its language strings, the three unused cards).
4. Switch the browse API call in `src/api/create.js:6-15` from `GET /{ns}/?oid=` to `GET /{ns}/{oid}/`.
5. Fix the sort parameter: send `ordering` with a value the API accepts (`created_on`), or drop it.
6. Keep `containers/media/Browse/*`, `Stepper`, the browse actions and reducers, and `api/create.js`; the profile tabs depend on them.
7. Old bookmarks: `/notes`, `/photos`, `/topics` and `/articles` will fall through to the not-found page. Optionally redirect them to the home feed.

**anahita-services** (deploy after the web change, since the web change stops calling `GET /`)
1. Remove `GET /` from the list routes in `text-service` (articles, notes, topics) and `photo-service`.
2. Make the owner required: in `MediumBrowseRequest` (`anahita-libs/requests/media.go:55`) change `omitempty` to `required,min=1`. Without this, `GET /notes/?oid=` still returns the site-wide list. Also require it in `MediaGRPCBrowseRequest` (`anahita-libs/data/services/media_request.go:30`).
3. Handler tests: `GET /notes/` returns 404 or 405, `GET /notes/0/` returns 400, `GET /notes/{id}/` works.
4. No graph-grpc changes; `nodesRepo.Browse` and `Count` are shared by everything.
5. Docs: update any API docs that list `GET /{ns}/`.

## Estimate

| Part | Time |
| --- | --- |
| Web (routes, menu, dead code, API path, sort fix) | about 1½–2 h |
| Services (routes, validation, tests) | about 1 h |
| **Total** | **about half a session (2½–3 h)** |

## Verification
- Web: the left menu has no Notes, Photos, Topics or Articles entries, and `/notes` shows the not-found page (or redirects). Every profile media tab still lists, pages and sorts that actor's media. Links from search, hashtags and feeds to `/notes/:id` still open.
- Services: the handler tests pass. `curl` `GET /notes/` is rejected and `GET /notes/{person_id}/` returns that person's notes.
- `npm run lint`, `npm test` and `go test ./...` in the touched services.

## Decision (item 2)
- Remove them early in the roadmap. Don't wait for the feed-generators "Trending" feed; it becomes the discovery surface when it ships.
- No dependency on items 0 and 1. Do it after them, since they fix a leak and delete data.

## Documentation

A phase is finished only when these pages match the code. anahita-services pages are under its `docs/`, anahita-web pages under its `docs/`. When a page is added, add it to that repo's `docs/README.md` contents too.

- **web `architecture.md`**, *Routes*: remove `/notes`, `/photos`, `/topics`, `/articles` as list pages; media lists live only on profiles.
- **services `architecture.md`**, *Routing*: media list routes are `GET /{ns}/:owner_id/` only.

## Status

| Item | State |
| --- | --- |
| Plan | written 2026-09-28 |
| Implementation | not started |
