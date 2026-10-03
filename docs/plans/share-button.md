# Share button (share outside the network)

*Roadmap item 23, planned 2026-10-02. See the [roadmap](roadmap.md) for order and dependencies.*

## Context
Every post, and every profile, gets a share button (the paper-airplane icon) for sending its link outside Anahita: to a messaging app, an email, or another social network.

## What exists
- No share control. The only clipboard use is the OAuth client secret (`src/containers/settings/OAuthClients/OAuthClientSecret.jsx`).
- Links are built by `getURL(node)` in `src/utils/node.js:292`.
- Per-node actions follow the `src/containers/controls/*` pattern (`Feature.jsx`, `Block.jsx`).
- A shared link only previews well once the web shell serves per-page Open Graph tags ([open-graph.md](open-graph.md), item 10).

## Decisions
- **Use the device's own share sheet where there is one** (`navigator.share`): on phones and on desktop Safari and Edge it offers every app the person has, and we ship no third-party SDKs or tracking scripts.
- **Elsewhere, a small menu:** Copy link, Share by email, Share on Mastodon, Share on Bluesky. These four are plain links. No Facebook, X or WhatsApp buttons: the device sheet covers them where they are installed, and a button per network is a maintenance tail.
- **Only public content gets the full share options.** A post that isn't public offers Copy link only, with a note that only people who can already see it can open it.
- **Sharing is not counted.** No "shares" number and no record of who shared (in line with [pinned-posts-and-activity-tray.md](pinned-posts-and-activity-tray.md) and the insights plan).

## Design
- **`src/containers/controls/Share.jsx`:** an icon button (MUI `Send` icon; check the MUI docs through the MCP server before choosing, per `CLAUDE.md`) placed in the action row of post cards, the read page and the profile header.
- **Behaviour on click:**
  1. Build the canonical URL: `window.location.origin + getURL(node)`, with no tracking parameters.
  2. If `navigator.share` exists and `navigator.canShare({ url })` passes, call it with `{ title, text, url }`: the title is the post's title or the author's name, the text is the first ~100 characters. A cancelled sheet (`AbortError`) is ignored.
  3. Otherwise open a `Menu`:
     - **Copy link:** `navigator.clipboard.writeText(url)`, then a "Link copied" snackbar (`actions.app.alert.success`). Falls back to a selectable text field when the clipboard API is unavailable (plain HTTP).
     - **Email:** `mailto:?subject=…&body=…`.
     - **Mastodon:** asks once for the person's server (remembered in `localStorage`, with try/catch), then opens `https://<server>/share?text=<text and url>`.
     - **Bluesky:** opens `https://bsky.app/intent/compose?text=<text and url>`.
- **Non-public posts:** the button shows Copy link only, with the note. The audience is on the node already (`access`).
- **Members-only and preview instances** (`instance-privacy` plan, item 13): in members-only mode only Copy link is offered, since outsiders can't open the page.
- **Remote posts** (item 8): share the original URL on its home server, not our copy.
- **Accessibility:** `aria-label` "Share", keyboard reachable, menu items are real links where they are links.
- i18n in en-GB and fr-FR.

## Estimate
**About 2–3 h, half a session to one session:** the control, the fallback menu, placement in three spots, i18n, and a test of the URL and menu logic.

## Verification
- On a phone, the system share sheet opens with the right title and link. Cancelling shows no error.
- On desktop Firefox, the menu opens; Copy link puts the canonical URL on the clipboard and shows the snackbar.
- Mastodon asks for a server the first time and remembers it; Bluesky opens the compose window with the text and link.
- A followers-only post offers Copy link only, with the note.
- The shared link, pasted into Mastodon or a messaging app, shows the post's own preview (after item 10).
- No request is sent to the API when sharing.

## Dependencies
- **Soft:** item 10 (per-page previews make shared links look right; the button works without it), item 13 (members-only mode), item 8 (remote posts share their original URL).

## Documentation

A phase is finished only when these pages match the code. When a page is added, add it to `docs/README.md` too.

- **web `architecture.md`**: the Share control, the share-sheet-first rule, and that nothing is counted or sent to the server.

## Status

| Item | State |
| --- | --- |
| Plan | written 2026-10-02 |
| Implementation | not started |
