# Locations: without an address, in the composer, and from the fediverse

*Roadmap row 82, planned 2026-10-18. See the [roadmap](roadmap.md) for order
and dependencies.*

## Context

A location is a node, `node.tag.location`, that posts are tied to as a tag:
a name, a point (latitude and longitude), and an address. Today the address
is required, and the point is always worked out from it by the geocoder, so
a beach, a trail or a viewpoint cannot be added without making up an address.
A post is tied to a location only after it is posted, from its Locations tab.

Row 82 began as locations to and from other servers. On 2026-10-17 the user
decided that locations come in from the fediverse and none go out; on
2026-10-18 the row took in four smaller pieces of work on locations that make
it easier for people here, done first.

## Decisions

Settled with the user on 2026-10-18:

- **"Location" is the word in what people read,** as Instagram has it, since
  Anahita's people are leaving Meta. "Place" is used only for the
  ActivityStreams type, `Place`.
- **A location needs a name and a point.** The address is optional: it is
  there to find a point, and many locations have none.
- **Locations come in from the fediverse, and none go out.** A `Place` on a
  post from another server becomes a location here, or is matched to one,
  and the post is tagged with it.
- **Nobody's position is kept.** The only position stored is a location's
  own point, chosen or found on purpose. The one exception was always a
  location tag, which is kept as it is.
- **No text trigger for locations,** as `#` is for hashtags: there is no
  convention, and `!` already names a community on Lemmy and other forums.
  A button in the composer instead.
- **A photo's own position is never kept.** It may be read in the browser,
  when the person asks, to suggest locations near it.
- **An actor's own position is a separate plan, for later:** with the
  consent of the person, or of the administrators of a profile such as a
  device's. Roadmap row 94, under Kept for later.

## Design

### 1. One word

Everything people read says "location": the English strings that say
"place" ("A post can have up to 5 places"), and the services' docs in their
prose. The translations already use their language's ordinary word (*Lieux*,
*Orte*, *Lugares*, *Locais*) and stay. Both `AGENTS.md` gain a wording rule:
**Location, in what people read; `Place` only for the ActivityStreams type.**

### 2. Locations without an address

**Server (location-service):**

| | Today | Becomes |
| --- | --- | --- |
| Address, city, country | Required | Optional |
| The point | Always geocoded from the address | Given (`latitude`, `longitude`), or geocoded from an address when one is given and no point is |
| A geocoder that finds nothing | 400, nothing saved | 400 only when there is no point either |
| An edit | Geocodes again when the address changes | Geocodes again only when the address changes, is not empty, and no point is given; clearing the address keeps the point |

A location without a point is refused. Points are rounded to six decimals
(about 10 cm), as they are kept today.

**Web app:** the Add and Edit forms gain a small map (Leaflet, already in
the app) with a pin to place by a tap or a drag, and **Use my position**,
which asks the browser for one reading, used only as the pin's start. The
address fields are optional; an address typed and not yet geocoded moves the
pin when the server answers. The Add locations dialog keeps its fixed
height: the map sits in its scrolling part.

### 3. A location button in the composers

- A pin among the composer's small buttons, **Add location**, in the short
  and the long composer, for new posts. Not for replies, which belong to
  their thread.
- It opens a small popover on the button: a search field with results as
  one types, one line each (the name, and its city). The arrow keys and
  Enter work as in the hashtag suggestions. A **Near me** chip asks the
  browser for a position only when it is tapped, to put nearby locations
  first.
- A chosen location is a small chip under the text, `📍 English Bay Beach ×`,
  where the link card is. Up to five, the most a post may have.
- The last line of the results is **Add “…” as a new location**, which opens
  the Add locations dialog with the name filled in.
- On posting, the post is tagged with the same calls the Locations tab uses.
  A tag that fails does not lose the post: the composer says so, and the
  location can be added from the post's page.
- A draft keeps its locations.

### 4. Locations from the fediverse

In activitypub-service, when a post is kept (`store`, for public posts by
people followed here):

1. **Read** the `Place`s of its `location` (where it was made) and of its
   `tag` (what it is about), with the existing `ReadPlace`: a name and a
   point, and its `id` when it has one (places.pub gives OpenStreetMap
   places stable addresses). At most five, as for any post.
2. **Match** each to a location here: one with the same address (its `uri`,
   where an earlier `Place` set it); else one with the same name within
   25 km (Pixelfed's places are mostly cities); else any within 100 m.
3. **Make** one when none matches: its name, its point rounded to four
   decimals (about 11 m), its address as its `uri` when it has one, and the
   post's author as the one who made it, as hashtags are put down to whoever
   first used them.
4. **Tag** the post with it. An edited post's locations follow its latest
   version: tags it no longer names are taken off. A post taken away takes
   its tags with it, as today.

Nothing is sent out: posts from here carry no `location`. Bluesky has no
field for one and is left alone. `Arrive` and other check-ins are not read:
they are about where a person is (row 94).

### 5. Suggesting locations from a photo's position

When a photo is added in the composer, the browser reads its GPS position,
if it has one, before upload (`exifr`, a small library). The file sent is
unchanged and is stripped on the server as today. If there is a position,
the location popover offers one line: **This photo has a location. Suggest
locations near it?** Only when tapped is the position used, once, as the
nearby point of the search, and as the pin's start if a new location is
added. It is never shown, sent elsewhere or kept.

## For the session that builds it

Written 2026-10-18 at the end of the session that planned the row, so the
next one can start without finding its way again. Check each pointer against
the code before relying on it.

### Where things stand

- anahita-web: branch `locations` from `main` (row 90 merged), holding this
  plan and roadmap rows 82 and 94. Nothing built yet.
- anahita-services: `release-polish` (row 90's server side) is merged, and
  branch `locations` was made from that `main` on 2026-10-18. Nothing on it
  yet; `git fetch` and bring it up to date with `main` before starting.
- Work in the order of the Design, one commit per part in each repository.
  Ask the user before each commit, showing the message (their `CLAUDE.md`).
  Say when the row is ready to merge, with the pull request text for both.

### Part 1, one word: where "place" is said

- `grep -rn -i "place" src/languages/en-CA` in the web app (for example
  `locations.add.full`: "A post can have up to {{ count }} places"), and the
  Portuguese, which says *Locais*: leave the other translations.
- Services docs: `docs/hashtags.md` ("At most five places", "A hashtag's and
  a place's posts"), `docs/search.md`, `docs/federation.md`. Renaming a
  heading breaks links to it: `make docs_check` names them; fix the index in
  `docs/README.md` too.
- Add the rule to the Wording section of both `AGENTS.md`.

### Part 2, without an address

**Server, location-service:**

| What | Where |
| --- | --- |
| The add and edit requests: `Address`, `City`, `Country` are `validate:"required"` | `location-service/requests/location.go` (the add and edit structs, about lines 85–110) |
| Add: builds the node, then always geocodes `address, city, province, country` with `h.Srv.Location.GeocodeSimple`, answering 400 on failure | `location-service/cmd/api/handlers/location.go`, `Add` (about line 338) |
| Edit: geocodes again when the address changed | same file, `Edit` (about line 268) |
| Validation of a location node | `v.ValidateAdd`, `v.ValidateEdit` in the same handlers; find the validator they come from |
| The point on a node | `GeoLatitude`, `GeoLongitude`, `GeoAddress`, `GeoCity`, `GeoStateProvince`, `GeoCountry` on `entities.AnahitaNode` (`anahita-libs/data/entities/node.go`) |
| The geocoder | `anahita-libs/geocoding` (Nominatim, Photon, rate limited) |

Add optional `latitude` and `longitude` (`validate:"omitempty,latitude"`,
`"omitempty,longitude"`), make the address fields optional, and require a
point from one source or the other. Then `make api_docs` and commit the
reference with it. Handler tests: point and no address kept; neither
refused; an edit clearing the address keeps the point.

**Web app:**

| What | Where |
| --- | --- |
| The Add tab of the Add locations dialog, its form and submit | `src/containers/locations/Add/Add.jsx`, `AddForm.jsx` (redesigned in row 90: fixed height, form in `DialogContent`, Add button in `DialogActions` tied by `form="location-add-form"`) |
| The edit form | `src/containers/locations/Read/EditForm.jsx`, used by `Read/index.jsx` |
| Which fields are required, and fixed by the operator | `fieldNames` and `REACT_APP_LOCATION_FIXED_*` at the top of `Add.jsx`; `src/utils/form` validates |
| The map | `src/components/Map.jsx` (Leaflet; tiles from `REACT_APP_MAP_TILE_URL`), used by `locations/Gadget/index.jsx` |
| The browser's position | `react-geolocated` (`useGeolocated`), as in `locations/Add/index.jsx` |

Read the MUI docs through the MUI MCP server before changing MUI parts
(`AGENTS.md`). Keep the dialog's height fixed: the map goes in the scrolling
part.

### Part 3, the composer button

| What | Where |
| --- | --- |
| The short composer; its bottom row of small buttons (`attachButtons`, `options`) | `src/containers/media/Composer/Short.jsx` (the `Stack` near the end); the post is built about line 195 and sent with the namespace's add action |
| The long composer | `Composer/Long.jsx`, `LongEditor.jsx` |
| The audience, language and who-may-reply choices, for the pattern of a button with a choice | `Composer/usePostChoices.jsx`, `Composer/Audience.jsx`, `src/components/LanguageButton.jsx` |
| Hashtag suggestions, for the keyboard behaviour of the results | `Composer/useHashtagSuggestions.js`, `src/components/HashtagSuggestions.jsx` |
| The link card under the text, where the chips go | `useLinkPreview.js` and its card in `Short.jsx` |
| Drafts | `Composer/useDraft.js` |
| Searching locations | `GET /locations/?q=&nearby_latitude=&nearby_longitude=` (the shared `locations` browse action, as in `locations/Add/List.jsx`) |
| Tagging a post | `api.tagGraph(post).add(location)`, which is `POST /locations/:id/inbounds/` with `source_id` the post; refused past `MaxLocationsOfAPost` (5, `anahita-libs/constants/tags.go`) |
| Strings | `composer.js` and `locations.js` in every base (`en-CA`, `fr-FR`, `de-DE`, `es-419`, `pt-BR`); `yarn test` fails on a base missing one |

### Part 4, from the fediverse

| What | Where |
| --- | --- |
| A post kept from another server | `activitypub-service/cmd/api/handlers/inbox.go`: `keepNote` then `store`, which builds the node and calls `h.Nodes.UpsertRemote`, then `announceKept` (the event hashtag-service listens for) |
| What a received post carries | `ReceivedNote` in `activitypub-service/ap/note.go` (about line 256): add a `Location` field, a `json.RawMessage` read from `"location"`; `Tag` is there already |
| Reading a `Place` | `federation.ReadPlace` in `anahita-libs/federation/place.go`, tested in `place_test.go`; it reads the first `Place` with a point. Extend it, or add a reader, for several and for `Place`s in `tag`, and for the `id` |
| Finding locations near a point | the graph's node browse with `NearbyLatitude`, `NearbyLongitude`, `NearbyRadius` (`GraphNodeGRPC.Browse`, `anahita-libs/data/services/graph_node_grpc.go`; the query is in `graph-grpc-service/data/repositories/nodes.go`, whose comment is unsure whether the radius is metres or kilometres: check before relying on it) |
| Making a node, tying it | `h.Nodes.Add` (graph node gRPC); the edge as location-service's inbound `Add` makes it (`location-service/cmd/api/handlers/inbound.go`, `GraphEdgeGRPC`); activitypub-service may need the edge client added to its `Handlers` |
| Its tests | `inbox_test.go`; the lab (`make fedi_lab`, `docs/federation-lab.md`: GoToSocial's `alice@gts.test`, whose password and token script are in that page) |

GoToSocial may not send a `location`; a test can post the activity by hand
(`inbox_test.go` builds signed activities).

### Part 5, a photo's position

`exifr` is a new dependency: `yarn add exifr`, used only in the browser,
when a photo is chosen in the composer (`Composer/AttachButtons.jsx` and
where the photo uploads start). Nothing about the position is sent but the
`nearby_latitude` and `nearby_longitude` of one search the person asks for.

### Running and checking

- **After a change to `anahita-libs`, rebuild everything:** `make up_build`
  in anahita-services. For one service, `make <service>` (`make graph`,
  `make location`, `make activitypub`): it compiles the binary first.
  `docker compose up --build` alone does not, and runs the old program.
- **Tests that need a database** use a throwaway MySQL, never the dev one:
  `docker run -d --name anahita-test -e MYSQL_ALLOW_EMPTY_PASSWORD=1 -e MYSQL_DATABASE=fresh -p 13309:3306 mysql:9.6`,
  load `migration-job/schema/init.sql`, run with
  `ACCESS_TEST_DSN='root@tcp(127.0.0.1:13309)/fresh?parseTime=true'`, and
  remove it with `docker rm -fv`.
- **In a browser:** headless Chrome (`puppeteer-core` in a scratchpad
  folder, Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`)
  against the user's own dev server on :3000, at 1280×900 and 390×844
  (touch). Sign in as the dev test account (in the agent's memory, *Dev test
  account*); the app's API calls use cookies, so a script's own calls need
  `credentials: 'include'`. A note is posted as a form with `content` and
  `access`. Delete what was posted. Look at every screenshot.
- `yarn test` in the web app, `make test` in the services (it runs the docs'
  link check and the schema test, which needs Docker).

## What stays the same

- The code's word stays `location`: node and edge types, `location-service`,
  `/locations/…` in the API and the web app.
- A post has at most five locations.
- Locations already kept, with their addresses and points.

## Documentation

| Page | Change |
| --- | --- |
| services `hashtags.md` | "location" in the prose; locations without an address; locations from the fediverse |
| services `federation.md` | Posts coming in: their locations; nothing going out |
| services `configuration.md` | The geocoder is needed only for addresses |
| web `architecture.md` | The location button and popover |
| both `AGENTS.md` | The wording rule |
| API reference | Locations' new fields and rules |

## Verification

- Tests: a location with a point and no address is kept; one with neither
  is refused; an edit that clears the address keeps the point; matching a
  `Place` by address, by name within 25 km, and by point within 100 m, and
  making one otherwise; an edited post's tags following it.
- In the lab: a post from GoToSocial with a `Place` is tagged with a
  location here.
- In headless Chrome, desktop and phone: the map and pin in the Add form,
  the composer's popover and chips, a post tagged on posting, and the photo
  suggestion.

## Open questions

1. **An operator's switch** for taking in locations from the fediverse: on by
   default, off by default, or none?

## Estimate

| Part | Time |
| --- | --- |
| 1. One word | ½ h |
| 2. Without an address | 4 h |
| 3. The composer button | 4 h |
| 4. From the fediverse | 4–5 h |
| 5. A photo's position | 2 h |
| **Total** | **about 15 h, 4 sessions** |

## Status

| Item | State |
| --- | --- |
| Plan | written 2026-10-18 |
| Implementation | not begun; branch `locations` in both repositories |
