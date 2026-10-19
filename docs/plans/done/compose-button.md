# One button to post from anywhere

*Roadmap row 99, planned 2026-10-19. See the [roadmap](../roadmap.md) for order
and dependencies.*

## Context

The composer was a box at the top of the home page and of every profile the
viewer may post to: a button that opened the short composer in a dialog, and
beside it the way to the long one. It took the top of those pages, where
content belongs, and was nowhere else.

The user, 2026-10-19: modern social networks have stopped putting the
composer at the top, as Facebook does, and put a floating **+** button at the
bottom of the page instead; it opens the small composer, which can be
expanded. That improves the home page and the profiles.

## Decisions

Settled with the user on 2026-10-19:

- **A large round button with a +**, at the bottom right. Material Design,
  Bluesky and Gmail put it there; it is under the thumb on a phone, and on a
  desktop it leaves the left menu alone.
- **On the home page and on a profile the viewer may post to, and nowhere
  else** (the user, 2026-10-19). On the home page it posts to their own
  profile; on a profile, to that profile (their own, or a group or event
  that takes their posts). The composer is called "New post" wherever it is: the
  page says where (the user, 2026-10-19).
- **It opens the short composer,** in a dialog (the whole screen on a phone),
  as the box did, with its way to the long composer. A profile that takes
  only long writing opens the long composer at once.
- **The boxes at the top go,** from the home page and the profiles.

## Design

1. **Where it posts** (`reducers/composeTarget.js`). The page that is open
   says so: a profile, when the viewer may post to it
   (`authorized.composers`), or the home page, for their own profile, which
   is read once. Any other page says nothing, and has no button.
2. **The button** (`containers/media/Composer/ComposeButton.jsx`): a `Fab`,
   fixed at the bottom right, clear of a phone's home bar, labelled "New
   post" for screen readers. A ring goes round it while a video
   is being prepared, which the box used to say.
3. **The composers** keep everything else. The short one is opened by the
   button instead of by its box; what the box showed (a video being prepared,
   uploads still in hand) is in its dialog.
4. **Nothing hidden under it:** pages with it leave room at their foot, and
   on a phone the alerts rise above it.
5. **A post is seen at once** (`reducers/lastPosted.js`, `feed/usePosted.js`):
   what the viewer posts is put at the head of the home feed and of the
   profile it was posted to, where before it waited for the feed's next
   look for new posts, or for a reload.

Asked for on the way, the same day:

- **Who to follow** on the home page is as wide as the feeds: when they are
  read in columns, its three are side by side, each outlined like a card; a
  list otherwise.
- **Mark all read** on the notifications page (`PATCH
  /notifications/read-all`), brought forward from row 97.

## Documentation

- `docs/architecture.md`: the composer.
- `docs/plans/done/unified-composer.md` describes the box; it is history,
  and stays as it was.

## Status

| Part | State |
| --- | --- |
| The button, where it posts, the boxes removed | ✅ 2026-10-19 |
