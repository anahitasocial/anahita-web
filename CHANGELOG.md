# Changelog

What changes in Anahita Web that people using it, or somebody running it,
would notice. The newest first. **Embryo** is `main`, which is what a site
building from `main` runs; a Birth release, when one is tagged, takes the
Embryo section under its version and date. Each change adds its line here
when it is made. Kept from 2026-11-07; what came before is in the commits.

## Embryo

### Fixed

1. **Inviting from People works:** the + led an administrator to a page
   that broke the app. It now opens the invitation form on the Invites
   page, whose own + is in its header, in place of a button at its foot.
2. **A profile's page shows that profile.** Moving from one profile to
   another, as from a notification, could lead back to the profile one was
   on, or show the first one's name and profile photo under the new address.
3. **A map's marker shows.** Its picture was broken: leaflet doubled its
   address.
4. **The cookie notice on a mobile** sits at the foot, above the + button,
   no longer over the logo.
5. **Dates are written in the language shown.** moment's locales had been
   given to a second copy of it, so dates were in English.

### Changed

1. **Somebody on Mastodon who approves their followers is asked** (roadmap
   row 130): the button says "Request to follow", then "Requested" until
   they answer there, as for a profile here seen only by its followers.
   It used to say Follow, and Following at once, before they had said yes.
2. **A reply reads as a Threads reply:** name, handle and when on one line,
   the words right under, then a heart and a reply icon, each with its
   number, in place of the word "Reply"; "Author" beside the post's
   writer's name; a thin rule between conversations; and the box under the
   post saying whom it answers.
3. **Search on a mobile is a magnifying glass** beside the bell; it opens
   the search box across the bar, with Back to close it. Recent searches
   stay on one line, a long handle cut short, its whole on hover.
4. **Lighter marks:** the line leading to a video kept on Bluesky has a
   light play icon, not a heavy triangle; the notifications bell is plain,
   not a second round picture beside the viewer's own; a profile photo seen
   larger is round, with a ring, as it is everywhere else.
5. **A conversation reads as one** (roadmap row 129): under each reply, the
   replies to it at the same width, joined by a line in the pictures'
   column, as Threads draws it; three in sight, then "Show the
   conversation"; a reply with more than one answer says how many more,
   under it. A reply's own page says, above it, the post and the
   reply it answers. Each reply still answers what it answered.
6. **A repost says it is one:** "Reposted" before when, in its header.
7. **A post's numbers show without opening it:** the reply button has its
   count beside likes and reposts, and somebody not signed in sees all
   three. In Interactions they are asked to sign in to see who, and a list
   whose people keep their profiles private says so, where both had read
   as an error.
8. **A reply sends on Enter,** on a mobile too, from the one-line box,
   which has no send button now, only the way to the whole form; Shift and
   Enter make a new line. Above a reply on its own page, the whole "Replying
   to" box opens what it answers.
9. **A thread reads as one** (roadmap row 126): in a list, a post its
   writer went on under shows the next note and "Show the thread" with how
   many notes it has; on the post's page their notes come first, flat and
   joined by a line, and everybody else's replies after them. Writing one,
   each note counts its letters against where the post goes (300 for
   Bluesky, 500 for the fediverse), "Add to thread" is offered when a note
   is full, and long words can be split into a thread in one tap.
10. **The Feeds page lists every feed one may see** (roadmap row 125), newest
   first: Everyone's, People you follow, Yours, or On your home, in its
   order; a page at a time as one scrolls, with a line to Search › Feeds.
   Edit, Delete and Share are in a menu on each row.
11. **The first page loads faster:** each page's code is fetched when it is
   first opened, maps only where one is shown, and only the language shown;
   what the first page loads went from 3,097 kB to 1,895 kB (935 kB to
   646 kB gzipped).
12. **A card's buttons are in its action row,** at its foot: the feed's
   page, the feed form, the group and event forms, an event's panel.
13. **Adding a feed is at `/feeds/add`.** `/feeds/new` leads there.

### Added

1. **The app's icons** at fixed addresses (`icon-32.png`, `icon-180.png`,
   `icon-192.png`, `icon-512.png`), and a manifest that names it, for a site
   to replace with its own ([Customising](docs/customising.md)).
