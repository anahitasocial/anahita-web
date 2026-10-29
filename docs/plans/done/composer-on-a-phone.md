# Posting from a phone

*Roadmap row 112, planned and done 2026-10-28. See the [roadmap](../roadmap.md)
for order and dependencies.*

## Context

The user, 2026-10-28, after posting a video and Mehrzad photos from an
iPhone on banu.io: the composers are not easy to use on a phone, the file
pickers stall, the layout wastes the screen, and "composer design makes or
breaks a social network, because people just won't be posting content".

What was found, on the development stack at 390 by 844 and on banu.io:

1. **iOS converts what it hands over.** The pickers asked for exact types:
   photos as `image/jpeg,image/png`, videos as MP4, QuickTime and WebM. iOS
   turns each photo kept as HEIC into a JPEG, and each video into one of the
   types listed, before the page sees it; for a long video, or many photos,
   its sheet sits there for minutes and cannot be closed. The video pickers
   ask for any video since 2026-10-28 (below); photos cannot yet, as
   photo-service takes only JPEG and PNG.
2. **Two taps to a photo.** Add pictures opens a panel saying "Select or drop
   photos or a video here", and only that opens the picker. "Drop" means
   nothing on a phone, and the label wraps.
3. **Whole files go over the phone's connection,** a 12-megapixel photo as
   several megabytes, though banu.io keeps it at most about 2,000 pixels
   wide.
4. **An upload stops when the phone sleeps:** Safari holds a page that is
   not in front, and the user's video finished only because the phone was
   left awake.
5. **The bottom row is cut off.** Photo, GIF, video and location share it
   with who can see, the language and who can reply, and "Anyone can reply"
   runs off the screen.
6. **The avatar takes a column of its own** beside the text, a fifth of a
   phone's width (the user: "the avatar on the side takes up a lot of nice
   space").
7. **The keyboard.** Safari does not make the page shorter for it, so a row
   fixed to the bottom is under it, and the attachments are out of reach
   while typing.
8. **The long composer** is called "Long content", has two icons by Post that
   say nothing (its drafts), and its formatting bar is cut off.
9. **The cookie notice covers the + button** on a phone until OK is pressed.

## Decisions

Proposed 2026-10-28, and left by the user to be designed ("your inner Jony
Ive"); as built:

- **The text has the width.** No avatar column on a phone: who is posting
  is the viewer, or the profile named where it posts.
- **Two quiet rows at the bottom,** above the keyboard: first who can see,
  the language and who can reply; under them photo, GIF, video, location and
  people. Kept above the keyboard by the browser's own measure of what is
  left of the screen (`window.visualViewport`). Two rows rather than a line
  that opens a sheet: each choice is one tap, and nothing is cut off.
- **"Long post"** in words beside Post, on a phone too.
- **One tap to the picker,** for several photos. What is chosen shows at
  once, from the phone itself, before anything is sent, and the box for
  words gets shorter to sit close above it. Taking out the last photo closes
  the photos; there is no "No pictures" button.
- **Uploading begins when photos are chosen,** while the post is written:
  each with its progress, an ✕ to take it out, and "Try again" when one
  fails. Post waits only for what is still on its way.
- **Photos are made ready on the phone** before they are sent: no more than
  2,048 pixels on the longest side (the largest the site keeps), turned
  upright, and a HEIC made a JPEG. So the pickers ask for HEIC by name, and
  an iPhone hands its photos over without converting them first; photo-service
  stays as it is (part 7). A video goes as it is.
- **A video says how far it has got and about how many minutes are left,**
  and keeps the screen on while it is sent (Screen Wake Lock, in Safari from
  16.4), asked for again when the page is back in front.
- **The long composer** is named for what it is, "Article" or "Topic", where
  the profile takes only one, and "Long post" above the tabs where it takes
  both. On a phone, Drafts is a word, not an icon, and Save draft is the
  first item in its menu; on a desktop both are beside Post. The formatting
  bar scrolls sideways, the next button showing at the edge.
- **The reply box** opens the picker in one tap too, the same editor under it.
- **The cookie notice** is at the top on a phone, clear of the + button.
- **A video posted from the + button is the app's to send,** not the
  composer's, so leaving the page no longer stops it (the user,
  2026-10-28: "What happens if I go to a different page while the animation
  is going around the + button"). The composer can be closed while it is
  sent; the ring round the + fills as it is sent and turns while it is
  prepared, a small line takes its place on pages without one, the notice
  that it is posted shows on whatever page is open, and the post is put at
  the head of an open feed. Leaving the site while it is sent is asked
  about first. Switching apps on a phone can still pause it; parts that
  fail are tried again.

## Parts

| Part | What | Where |
| --- | --- | --- |
| 1 | The video pickers ask for any video (`video/*`), and the app lets any video type through to the worker, which reads what it is | web |
| 2 | The cookie notice clear of the + button | web |
| 3 | The short composer's layout: full width, the two rows above the keyboard | web |
| 4 | One tap to the picker, photos shown at once, uploads as soon as chosen, each with its progress, removal and retry | web |
| 5 | Photos made smaller and turned upright before they are sent (`utils/preparePhoto.js`) | web |
| 6 | Videos: progress with the minutes left, the screen kept on (`useVideoUpload.js`) | web |
| 7 | HEIC photos: made JPEG in the browser rather than taken by photo-service, which stays JPEG and PNG | web |
| 8 | The long composer's header and drafts, and the reply box, by the same rules | web |
| 9 | A video from the + button sent by the app, from page to page (`Composer/Video/SharedVideoUpload.jsx`) | web |

Each part is checked at 390 by 844 and 1280 by 900 in headless Chrome, and
then by the user on an iPhone, which headless Chrome is not: the pickers,
the keyboard and Safari's handling of a page set aside are only seen there.

## Status

| Item | State |
| --- | --- |
| Plan | written 2026-10-28 |
| Part 1 | done 2026-10-28 |
| Parts 2 to 8 | done 2026-10-28; tried by the user on an iPhone: "significantly improved" |
| Part 9 | done 2026-10-28, checked in headless Chrome with storage stood in for |
| Not tried on the development stack | a photo or a video really being stored: the development bucket is gone (banu.io's `docs/plans/launch.md`, row A7), so each upload there fails, which shows Try again |
