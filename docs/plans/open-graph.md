# Open Graph for shared Anahita links (web shell)

*Roadmap item 10 (part B), planned 2026-09-28. See the [roadmap](roadmap.md) for order and dependencies.*

## Context
1. **Link previews:** when someone pastes a link into a note, show a preview card (title, description, image, site) in the composer and on the published note.
2. **Open Graph:** when an Anahita URL is shared on Facebook, LinkedIn, Mastodon, Bluesky, Slack, Discord, WhatsApp and so on, it should show the right title, description and image for *that* page.

**Why the past attempt didn't work:**
- Per-page tags are set in the browser with `react-helmet-async` (`anahita-web/src/components/HeaderMeta.jsx`).
- Crawlers don't run JavaScript. They only see `public/index.html`, which carries **site-wide** tags (`%REACT_APP_NAME%`, `ogimage.jpg`). So every share looks identical.
- `HeaderMeta` also emits `og:site` where the tag should be `og:url`.
- Legacy PHP rendered OG on the server (`libraries/default/base/view/og.php`), which is why it worked there.

**Nothing exists** for link previews in either repo.

## Answering the questions
- **Can the React app detect a crawler and redirect?** No. The React app only runs in a browser, and the crawler never runs it. Detection has to happen *in front of* the app, on the server or edge that returns the HTML.
- **Is user-agent sniffing needed?** No. The better, current approach is **per-route meta tags written into the app's `index.html` on the server**, with the **same HTML for every client**:
  - Every page route returns the normal `index.html`, but with that page's `<title>`, `og:*`, `twitter:*`, `canonical` and ActivityPub `alternate` link filled in.
  - Browsers boot React as usual, and crawlers read the tags. The URL never changes and there's no redirect.
  - No user-agent sniffing. Crawler lists go stale, and sniffing can look like cloaking.
  - **No server-side copy of each page is cached.** It's one small lookup per HTML request, cached in memory for about 60 s, and filling in about 10 tags is a string operation.
  - Full SSR (a Next.js rewrite) and prerender services (third-party, against item 9) are rejected.
- **Where it runs:** decided 2026-09-28: **our nginx plus a small Go shell**, not a vendor edge function.
  - nginx serves `/static/*` and the other build assets directly, and routes page URLs to the shell.
  - That puts the web app on the same host as the API routing, which also settles item 8's phase 0.1: WebFinger, host-meta and ActivityPub content negotiation live on the same front.

Part A (link previews in notes) is in anahita-services' `docs/plans/link-previews.md`.

## Part B — Open Graph through a web shell (new `web-shell`, Go, very small)
1. **Serving:**
   - At startup, load `build/index.html`, from the web build copied into the image or mounted.
   - nginx sends `/static/*`, `/manifest.json`, `/favicon.ico` and `/statics/*` to the files, the API prefixes to their services, and **everything else** to the shell.
   - Also add long-lived cache headers on hashed assets.
2. **Route matching:**

   | Route | Tags from |
   | --- | --- |
   | `/people/:alias`, `/groups/:id` | Name, bio, avatar or cover |
   | `/notes/:id-slug` | First ~200 characters, author, the link preview image or author avatar |
   | `/photos/:id` | Title or description, the photo |
   | `/articles/:id`, `/topics/:id` | Title, excerpt, cover or author |
   | `/hashtags/:tag`, `/locations/:id` | Tag or place name, site image |
   | Any other route | Site-wide defaults |

3. **Data:**
   - Read the node through graph-grpc as the **anonymous viewer**. **Only public nodes get specific tags.** Anything restricted, disabled, archived or deleted gets the site-wide defaults, so nothing private leaks into a preview.
   - Purged actors: defaults (and a `410` for ActivityPub, per item 8).
4. **Tags:**
   - `og:title`, `og:description`, `og:image` (plus `:width`/`:height`/`:alt`), `og:url`, `og:type` (`profile` | `article` | `website`), `og:site_name`;
   - `twitter:card=summary_large_image`;
   - `<link rel="canonical">`;
   - for item 8, `<link rel="alternate" type="application/activity+json" href=…>`;
   - optionally an oEmbed discovery link (later).
   
   Everything is HTML-escaped.
5. **Images must be stable public URLs,** never the 15-minute presigned ones, because crawlers cache OG images for days. This uses item 8's media proxy (phase 0.4) or item 9's public endpoint, which makes it a hard dependency. A missing image falls back to `statics/media/ogimage.jpg`.
6. **Caching:** an in-memory LRU of per-route tags with a 60 s TTL, plus `Cache-Control: public, max-age=60` on HTML. That's enough for the traffic when a post federates: every Mastodon server that receives a post fetches its link.
7. **Web app changes:**
   - Keep `HeaderMeta` for in-app tab titles, but fix `og:site` to `og:url`.
   - Remove the `%REACT_APP_*%` OG tags from `public/index.html`, or leave them as markers the shell replaces.
   - `docs/deploying.md` switches from Amplify to "served by the stack"; `amplify.yml` stays as an option without per-page OG.
8. **Deployment:** the web build becomes a Docker image (nginx + static files), plus the `web-shell` image, both in compose and in the k8s overlays (item 9 E).

## Estimate

| Part | Time |
| --- | --- |
| A: link-preview-service (SSRF-safe fetcher, parser, thumbnail re-encode, cache table, API, rate limit, tests) | 6–8 h |
| A: text-service snapshot in `meta`, composer detection + card + rendering (web) | 3–4 h |
| B: web-shell (index loading, route matching, anonymous reads, escaping, LRU) + tests | 4–5 h |
| B: nginx routing, web Docker image, compose/k8s, deploying doc, HeaderMeta fix | 3–4 h |
| **Total** | **about 16–21 h, 4–5 sessions** |

## Verification
- **SSRF tests:** `http://127.0.0.1`, `http://169.254.169.254/`, `http://[::1]`, a public name that resolves to `10.0.0.5`, and a redirect to a private IP are all refused. A 50 MB response is cut off at 1 MB, and a slow server times out at 5 s.
- **Previews:** pasting a news article URL shows the card, and the posted note keeps it after the source page changes. A YouTube URL shows the player, not a card.
- **OG:** `curl -A facebookexternalhit/1.1 https://DOMAIN/photos/123-sunset` and a plain browser `curl` return the **same** HTML with the photo's tags. Also check with the Facebook Sharing Debugger, the LinkedIn Post Inspector, a Mastodon post and a Bluesky post, through the item 8 tunnel for local testing.
- **Privacy:** a followers-only photo's URL returns only site-wide tags.
- **Loading:** hashed assets come with long cache headers, and the page's time-to-interactive doesn't get worse.

## Decisions (item 10)
- Previews apply to notes only and use the first link. The preview is stored as a snapshot on the note, and its image is re-encoded into our own storage.
- The web app is served through our nginx plus a Go `web-shell` that fills in per-route tags. No user-agent sniffing and no vendor edge functions.

## Dependencies
- **Hard:** stable public media URLs (item 9 A or item 8 phase 0.4) for `og:image` and preview thumbnails.
- **Shared:** item 4b's rate limiter.
- **Settles item 8's phase 0.1:** the web app and API share one front, so WebFinger and content negotiation can live there.
- **Before item 8's AT outbound work,** so posts carry `embed.external`. Not required, though.

## Documentation

A phase is finished only when these pages match the code. anahita-services pages are under its `docs/`, anahita-web pages under its `docs/`. When a page is added, add it to that repo's `docs/README.md` contents too.

- **web `deploying.md`**: rewrite *Hosting* for the web image plus the Go web shell behind nginx; keep Amplify as an option without per-page Open Graph.
- **web `architecture.md`**: `HeaderMeta` (in-app titles only) versus the web shell (crawler-visible tags); the link preview card.
- **services `architecture.md`**, *Routing*: page routes go to web-shell, static assets to nginx.

## Status

| Item | State |
| --- | --- |
| Plan | written 2026-09-28 |
| Implementation | not started |
