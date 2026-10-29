# Posting from a phone

*Roadmap row 112, planned 2026-10-28. See the [roadmap](roadmap.md) for order
and dependencies.*

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

Proposed 2026-10-28; to be settled with the user before the layout is built.

- **The text has the width.** No avatar column on a phone; who is posting is
  in the header, as "New post" beside a small picture, or nowhere.
- **Attachments in one row above the keyboard:** photo, GIF, video and
  location, each an icon with its name for screen readers. Kept above the
  keyboard by the browser's own measure of what is left of the screen
  (`window.visualViewport`).
- **The settings in one quiet line above them,** "Public · English · Anyone
  can reply", which opens a sheet with the three.
- **One tap to the picker.** The panel goes; what is chosen shows at once as
  thumbnails, from the phone itself, before anything is sent.
- **Uploading begins when files are chosen,** while the post is written: each
  thumbnail with its own progress, an ✕ to take it out, and "Try again" when
  one fails. Post waits only for what is still on its way, and says so.
- **Photos made smaller on the phone** before they are sent, to the largest
  size the site keeps; a video goes as it is.
- **A video says how far it has got and the time left,** and keeps the screen
  awake while it is sent (Screen Wake Lock), so that a phone set down does
  not stop it.
- **The long composer is "Article",** its drafts behind a labelled button,
  and its formatting bar scrolls rather than being cut off.
- **The reply box** follows the same rules.
- **The cookie notice** moves where it covers nothing a person needs.

## Parts

| Part | What | Where |
| --- | --- | --- |
| 1 | The video pickers ask for any video (`video/*`), and the app lets any video type through to the worker, which reads what it is: done 2026-10-28 | web |
| 2 | The cookie notice clear of the + button | web |
| 3 | The short composer's layout: full width, the attachments row above the keyboard, the settings line and its sheet | web |
| 4 | One tap to the picker, thumbnails at once, uploads as soon as chosen, each with its progress, removal and retry | web |
| 5 | Photos made smaller before they are sent | web |
| 6 | Videos: progress with the time left, the screen kept awake | web |
| 7 | HEIC photos taken by photo-service, so that photos too can be asked for as any image, and an iPhone hands them over unconverted | services |
| 8 | The long composer and the reply box, by the same rules | web |

Each part is checked at 390 by 844 and 1280 by 900 in headless Chrome, and
then by the user on an iPhone, which headless Chrome is not: the pickers,
the keyboard and Safari's handling of a page set aside are only seen there.

## Status

| Item | State |
| --- | --- |
| Plan | written 2026-10-28 |
| Part 1 | done 2026-10-28 |
| The layout's decisions | to be settled with the user |
