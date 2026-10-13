# Alt text for photos that people can find (item 46)

Asked for by the user on 2026-10-13: "we need alt text for our photos,
everyone keeps asking for it". Planned, not built.

## Where it is today

Alt text exists, and almost nobody finds it. That people keep asking for
something that is there is what this item is about.

- **Writing it.** In the photo composer and the "Edit photos" dialog, each
  thumbnail has a small "ALT" mark over its corner
  (`components/PhotoFilesEditor.jsx`). Pressing it opens a field for the
  description, up to 1,500 characters. Nothing says it is there, nothing
  asks for it, and a photo posted without one looks no different.
- **Keeping it.** Each image has its own (`photo_files.alt_text`).
- **Reading it.** It is the `alt` of the image wherever a photo is drawn
  (`utils/photoFiles.js#altOf`), so a screen reader says it. Somebody who
  can see the photo has no way to read it.
- **Other networks.** It goes to Mastodon and Bluesky with the photo, and
  arrives with photos from both.

## What to build

1. **Make writing it obvious.** A description field under each photo in
   the composer, visible without pressing anything, with the words
   already there ("Say what the photo shows, for people who cannot see
   it"). The small mark stays as the sign that one has been written.
2. **Let people read it.** An "ALT" badge on a photo that has a
   description, in the feed, on the post's page and in the lightbox.
   Pressing it shows the description. This is what Mastodon and Bluesky
   do, and it is what most people mean when they ask whether a site "has
   alt text".
3. **A reminder, as each person's choice.** A setting, off by default:
   "Remind me when I post a photo without a description". With it on,
   posting says so once and offers to add one or to post anyway. Never a
   block: a reminder that cannot be dismissed is how people come to write
   "photo".
4. **Photos without one.** In "Edit photos", say which have none.

## To decide when it is built

- Whether the reminder is on or off for somebody new. Off is assumed
  above; Mastodon leaves it to each person, and Bluesky has it as a
  setting too.
- Whether the same is wanted for videos (a description of what is shown),
  and for the picture of a link's card, which has none today.
- Avatars and covers are described by whose they are, and are left as
  they are.

## Size

About one session, in the web app alone: nothing changes in the services.

## Depends on

Nothing. Item 17 (several images in a post) built what this stands on.

## What was built (2026-10-13)

No change to how it is kept: each image already has its own description
(`photo_files.alt_text`), which is where it belongs, since a post holds up
to four images and each shows something different. A field on the post
itself could hold one description for all of them.

- **Writing it.** In the composer and in "Edit photos", each photo is a
  row: the photo, and beside it a field labelled "Description" with the
  hint in it, there to be written in (`components/PhotoFilesEditor.jsx`).
  The small "ALT" mark and the dialog behind it are gone.
- **Photos without one.** Under the list: "2 photos have no description
  yet", with why one matters. Said, and never in the way of posting.
- **Reading it.** An "ALT" badge in the corner of a photo that has a
  description, in the feed, on the post's page, in profile lists and on
  each slide of a post with several (`components/AltBadge.jsx`). Pressing
  it shows the description.

**Not built:** the reminder as a setting. With the field in plain sight
and the line under the list, a second prompt at the moment of posting
seemed one too many; it is easy to add if people still post without.
**Not done:** the badge in the lightbox.

