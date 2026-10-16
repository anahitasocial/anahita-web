# One composer

Roadmap row 74, item 57. For the 1.0 release. Planned 2026-10-16.

## Context

The composer at the top of a profile and of the home page is a row of tabs,
one for each kind of post the profile takes: Notes, Articles, Topics, Photos,
Videos (`containers/media/Composer`). Each tab is a form of its own. Somebody
has to decide what kind of post they are writing before they write it.

The reply form does not ask. Words make a reply, pictures make it a photo post
in the thread, a video makes it a video post (`containers/replies/ReplyForm.jsx`,
row 39). The user, 2026-10-16: "Our replies look quite nice and unified ... perhaps
we can do something similar with our composer." Every network people come from
works that way: one box, and what you add decides what it is.

What stands in the way today:

- **Five forms for one act.** A note, a photo and a video differ in what is
  attached, not in how they are written.
- **Titles where nobody wants one.** Photo posts ask for a title, which no
  network people know asks for.
- **Long writing in a small box.** An article is written in the same small card
  as a note.
- **Mobile.** A row of tabs above a card is cramped on a phone, and the card
  scrolls with the page.

## Decisions (the user, 2026-10-16)

1. **One box for short posts,** as the reply form: words, pictures, a GIF or a
   video. A note, a photo post or a video post follows from what is in it.
2. **An extended composer for long writing,** in a larger dialog: full screen
   on a phone. It has tabs, **Article** and **Topic**, since an article can be
   posted in a group too. An article is a blog post, with a cover and pictures
   and videos in its text; a topic is a post with a title, for discussion.
3. **Titles only in the extended composer.** A short post has no title. The
   extended composer has the title, and a fuller picture uploader and editor
   (order, alt text, cropping) than the short box.
4. **No Todo or File composer.** Neither exists, and their leftover forms are
   removed. Sharing documents is a service of its own, kept for later (row 75).
5. **For 1.0, and it has to be excellent on a phone as well as on a desktop.**
   The user: "IMPORTANT: it has to look good and deliver excellent ui/ux for
   mobile users as well as desktop users."

**Open, to settle before building:** whether topics and articles become one
kind of post. The user sees them growing alike ("for the sake of minimalism"),
and the cost is the separate Topics and Articles lists on a profile. My view:
keep both for 1.0, behind the extended composer's two tabs, which costs nothing
now and keeps the lists; merge later if the tabs show nobody tells them apart.
Merging is a change to stored types, feeds and federation, and is not needed
for the composer.

## Design

### The short box

- **Collapsed:** "What's on your mind?" and the viewer's avatar, one line,
  as the reply form starts. Tapping it opens it in place on a desktop and as a
  sheet from the bottom on a phone, where the keyboard has room.
- **Open:** the text, then what is attached (pictures in a row that scrolls
  sideways, or a video's progress), then one row of controls: pictures, GIF or
  video, audience, language, who may reply, and Post. The same controls as the
  reply form, in the same order, so both are learnt once.
- **What it becomes:** words alone, a note; pictures, a photo post; a GIF or a
  video, a video post. Pictures and a video together are refused, as in a reply.
  A link still makes its card (`useLinkPreview`), and a quote still sits under
  the words.
- **"Expand"** (an icon at the end of the controls) carries what was written,
  and what was attached, into the extended composer.

### The extended composer

- **A dialog:** wide on a desktop, full screen on a phone, with Post and Close
  in a bar that stays at the top while the text scrolls.
- **Tabs: Article, Topic,** where the profile takes both; only the one it takes
  otherwise, and no tabs at all.
- **Fields:** title, then the text, in a larger editor. An article adds an
  excerpt and a cover. Pictures and videos within an article's text are part of
  this row, as is whether the editor stays Markdown or becomes one that shows
  what it writes; settled in phase 1.
- **Pictures:** the fuller uploader: order by dragging, alt text for each,
  cropping. The same parts as "Edit photos" (`PhotoFilesEditor`).

### Phones and desktops

- Touch targets of at least 48px, controls in the bottom row within a thumb's
  reach, nothing that needs hovering.
- The sheet and the full-screen dialog move with the keyboard, so Post is never
  under it.
- No height that changes as somebody types: an error's line is kept, a row of
  pictures has its height before they arrive (the user's rule: no jiggly UI).
- Nothing written is lost by closing it by mistake: a draft is kept in the
  browser until it is posted or thrown away.
- Checked at 360px wide, a tablet, and a desktop, in light and dark, before each
  phase is called done.

### What is not part of it

- The server. Notes, photos, videos, articles and topics are posted as they are
  today; the composer picks the route from what the post holds, as the reply
  form does. Merging topics and articles (above) would change that, and is not
  this row.
- Sharing documents (row 75), todos.

## Phases and estimate

| Phase | Work | Time |
| --- | --- | --- |
| 1 | The short box: one form for notes, photos and videos, on the reply form's parts; the sheet on a phone; drafts | 1½–2 sessions |
| 2 | The extended composer: the dialog, Article and Topic, title, excerpt, cover, the fuller picture editor; "Expand" | 1½–2 sessions |
| 3 | The old tabs and forms removed; every place a composer appears checked on a phone and a desktop | ½–1 session |
| | **Total** | **3½–5 sessions** |

## Verification

- A note, a photo post, a video post, an article and a topic are each posted
  from the new composer, on a phone's width and a desktop's, and read back as
  before.
- Nothing moves as somebody types or as a picture uploads.
- A draft survives closing the composer and reloading the page.
- The tests the composers have still pass, with tests for which kind a post
  becomes from what it holds.

## Documentation

- web `docs/architecture.md`: the composer, in place of the tabs.
- services: none, unless topics and articles are merged.

## Status

| Item | State |
| --- | --- |
| Plan | written 2026-10-16, with the user's decisions |
| Todo and File composer forms | removed 2026-10-16 |
| Phases 1–3 | after row 38 (Pulse), for 1.0 |
