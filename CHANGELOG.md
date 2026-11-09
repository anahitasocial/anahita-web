# Changelog

What changes in Anahita Web that people using it, or somebody running it,
would notice. The newest first. **Embryo** is `main`, which is what a site
building from `main` runs; a Birth release, tagged with the same version
as anahita-services on the same day, takes the Embryo section under its
version and date. Each change adds its line here
when it is made. Kept from 2026-11-07; what came before is in the commits.

## Embryo

### Fixed

1. **The composer no longer zooms on an iPhone.** Its words are 16 px on
   a touch screen, where Safari zooms into any smaller field as it is
   focused and the composer opened wider than the screen; 15 px on a
   desktop.
2. **A link in a thread's later note shows its card,** as in the first,
   and the card goes with the note.

## v1.2.1 Birth, 2026-11-08

A maintenance release of the web app alone, for Anahita Services v1.2.0.

### Fixed

1. **A thread's counts line up.** Each note's ✕ is on its name's line, as
   on Threads, so every note has the composer's width and its count ends
   where the first note's does.

## v1.2.0 Birth, 2026-11-08

### Added

1. **Videos from Bluesky and the fediverse play here.** Pressing play on
   one has it copied to this site, "Getting the video…" for a few seconds
   the first time, then it plays in the post, never from the other server.
2. **Audio posts.** An Audio button beside Video in the composer posts a
   sound: MP3, M4A, AAC, Ogg, Opus, WAV or FLAC, up to an hour. It plays in
   the post, with its cover beside it when the file has one, and a
   profile's audio posts are in its Audio tab.

### Changed

1. **A thread is written as it is read.** On a desktop, the composer joins
   its notes with one line, from the writer's profile photo down through
   each note's small one to Add to thread, and the composer's edges are an
   even 16 px all round.
2. **Add to thread is there wherever a post goes:** once a note has words,
   in the composer and in a reply. It waited for a full note, which on a
   post that stays on the site meant 8,000 letters.
3. **Photos in a thread's notes** (roadmap row 143): each note has its own
   Photo button under its words, and the first may keep its photos when
   the thread grows. The Photo, GIF, Video and Audio buttons are under the
   words, in line with them, not at the foot of the composer, and each
   note says who writes it, with its place in the thread ("2/3"). The
   words are a step smaller, at 15 px.
4. **Short posts of 500 characters** (roadmap row 144): a note, a reply and
   a photo's, video's or sound's words hold 500, as on Mastodon and
   Threads, a link counted as 23 however long; longer is a thread, an
   article or a topic, which keep 8,000. The count goes down as Bluesky's
   does, a number and a ring, which turns amber past 300 when the post goes
   to Bluesky and red past 500. An edit is held to 500 too.

## v1.1.0 Birth, 2026-11-08

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
6. **A profile's posts, replies and reposts no longer skip a page.** A
   scroll could ask for the next page twice, and the list then fetched the
   one after it, leaving out twenty.
7. **Follow is offered only to somebody one has not blocked:** a post's
   menu asked of a field nothing sends, and offered Follow to somebody
   blocked, which the server refused.
8. **A quoted post's links are links,** not Markdown written out, and
   "&amp;" from another server reads "&", in the quote under a note and in
   every short excerpt of a post.

### Changed

1. **Somebody on Mastodon who approves their followers is asked** (roadmap
   row 130): the button says "Request to follow", then "Requested" until
   they answer there, as for a profile here seen only by its followers.
   It used to say Follow, and Following at once, before they had said yes.
   Opening such a profile reads it again from Mastodon when it is more than
   an hour old, so that a change there shows here.
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
14. **Follow post** and **Unfollow post,** in a post's menu, in place of
   Get notifications and Stop notifications: following a post is hearing
   of its replies, as following a profile is hearing of its posts.
15. **A card's buttons are full width,** one or two of them, on every card
   (AGENTS.md, rule 2, the user, 2026-11-08): easy to reach with a thumb,
   and in the same place on every card. A third action is in a menu: a
   feed's page keeps Add to home and Edit (or Copy), with Copy and Delete
   in its ⋮; a report's case keeps Open, with Remove as spam and Refuse in
   its ⋮. Dialogs and lists keep their own.
16. **The Feeds page's filter** is in its header card, and its line says
   it in nine words: "Feeds you build: your sources, your topics, newest
   first." A feed on one's home says "On your home", short enough not to
   wrap on a mobile.

### Added

1. **The app's icons** at fixed addresses (`icon-32.png`, `icon-180.png`,
   `icon-192.png`, `icon-512.png`), and a manifest that names it, for a site
   to replace with its own ([Customising](docs/customising.md)).
2. **Mute** (roadmap row 133), in a person's menu and in the menu of a post
   or a reply by somebody else: their posts, reposts and replies leave one's
   feeds and lists, and, ticked to begin with, their notifications; until
   unmuted, or for a day, a week or a month. Nobody is told. Settings ›
   Privacy › Muted lists them, with when each mute ends, and Unmute.
3. **Your data,** a tab of a person's settings (roadmap row 124): Download
   your data, moved there from Account, and **Bring your lists in**: who
   you follow, block and mute, and what you saved, from another Anahita's
   download or a file from Mastodon or Misskey. What is in the file is
   shown first, a tick for each kind; while it runs a bar says how far it
   has got; at the end, the list of what could not be brought in, and why.
4. **Somebody who moved** (roadmap row 124, part 2): the profile of
   somebody on another server who moved their account says "Moved to",
   with the new handle, and View new profile in place of + Follow. Whoever
   followed them is told they follow the new profile now, or asked to.
5. **Moving one's account** (roadmap row 124, part 3), under Settings ›
   Fediverse. Moving here: name the old accounts this one also is, then
   move from there, and the followers follow you here. Moving away: to an
   account that names this one, after proving who you are again; the
   followers follow you there, the posts stay, and this account shows
   where you went and no longer posts, follows or likes. Come back takes
   it back.
6. **A video from Bluesky shows as its poster,** with a play button that
   opens it on Bluesky, in place of a bare "▶ bsky.app" link.

### Removed

1. **The blogs page** (`/blogs`): not in the menu for a long time, and
   asking the server for something it no longer has.
