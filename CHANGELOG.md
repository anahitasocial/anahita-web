# Changelog

What changes in Anahita Web that people using it, or somebody running it,
would notice. The newest first. **Embryo** is `main`, which is what a site
building from `main` runs; a Birth release, when one is tagged, takes the
Embryo section under its version and date. Each change adds its line here
when it is made. Kept from 2026-11-07; what came before is in the commits.

## Embryo

### Fixed

1. **A profile's page shows that profile.** Moving from one profile to
   another, as from a notification, could lead back to the profile one was
   on, or show the first one's name and profile photo under the new address.
2. **A map's marker shows.** Its picture was broken: leaflet doubled its
   address.
3. **The cookie notice on a mobile** sits at the foot, above the + button,
   no longer over the logo.
4. **Dates are written in the language shown.** moment's locales had been
   given to a second copy of it, so dates were in English.

### Changed

1. **A thread reads as one** (roadmap row 126): in a list, a post its
   writer went on under shows the next note and "Show the thread" with how
   many notes it has; on the post's page their notes come first, flat and
   joined by a line, and everybody else's replies after them. Writing one,
   each note counts its letters against where the post goes (300 for
   Bluesky, 500 for the fediverse), "Add to thread" is offered when a note
   is full, and long words can be split into a thread in one tap.
2. **The Feeds page lists every feed one may see** (roadmap row 125), newest
   first: Everyone's, People you follow, Yours, or On your home, in its
   order; a page at a time as one scrolls, with a line to Search › Feeds.
   Edit, Delete and Share are in a menu on each row.
3. **The first page loads faster:** each page's code is fetched when it is
   first opened, maps only where one is shown, and only the language shown;
   what the first page loads went from 3,097 kB to 1,895 kB (935 kB to
   646 kB gzipped).
4. **A card's buttons are in its action row,** at its foot: the feed's
   page, the feed form, the group and event forms, an event's panel.
5. **Adding a feed is at `/feeds/add`.** `/feeds/new` leads there.

### Added

1. **The app's icons** at fixed addresses (`icon-32.png`, `icon-180.png`,
   `icon-192.png`, `icon-512.png`), and a manifest that names it, for a site
   to replace with its own ([Customising](docs/customising.md)).
