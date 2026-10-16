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
5. **Pictures and videos in the extended composer too** (the user, later the
   same day): "Media decides". Pictures added there make a photo post, with a
   title and a long description; a video makes a video post with a title;
   with nothing attached it is an article or a topic, by the tabs, which go
   once something is attached. No change to the services.
6. **For 1.0, and it has to be excellent on a phone as well as on a desktop.**
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
  otherwise, and no tabs at all. The tabs go once pictures or a video are
  attached, which make a photo or a video post instead (decision 5).
- **Fields:** title, then the text, in a larger editor. An article adds an
  excerpt and a cover. Pictures and videos within an article's text are part of
  this row, as is whether the editor stays Markdown or becomes one that shows
  what it writes; settled in phase 1.
- **Pictures:** the fuller uploader: order by dragging, alt text for each,
  cropping. The same parts as "Edit photos" (`PhotoFilesEditor`).

### Embedding posts and pages in long writing

The user's design, 2026-10-16: paste an address; a page elsewhere shows as
its preview, a post here as itself, in the text, seamless, with a
paragraph's margins. And an edge between the two posts, for search and
recommendations.

- **What embeds:** an address on a line of its own in an article or a
  topic. One inside a sentence stays a link, so a post can be mentioned
  without being shown. The text stays plain Markdown: elsewhere on the
  fediverse the line is the link it is.
- **A post here** (`/articles/`, `/topics/`, `/notes/`, `/photos/`,
  `/videos/` with its id): the reader's browser asks for it as for any
  post, so somebody who may not see it gets the link and nothing else.
  Shown as part of the text: pictures as slides, a video playing, words
  as a quiet block with who wrote them. No card around it.
- **A page elsewhere:** its card, made as a note's is. The composer asks
  link-preview-service for each such address while it is written; when
  the post is saved, text-service copies the kept previews into its meta
  (`link_previews`, beside a note's single `link_preview`), so a card reads
  the same later and nobody's reading fetches anything. No card, a link.
- **The edge:** `edge.medium.embed.v1`, from the post to each post here it
  embeds, written by text-service when the post is added or edited, and
  taken away with the line. Search and recommendations reading it come
  later, as their own work.
- **Not now:** embedding in short posts; notifying the author of a post
  that was embedded (to ask the user); sending embeds as anything but
  links to other servers.

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

### The one change to the services

A photo post and a video post need a title today, and a photo post words as
well (`MediumAddRequest`, photo-service; the video upload refuses a post
without a name). A reply with pictures or a video needs neither. A short post
has no title, so for photo and video posts, as for replies: the title is
optional, and the words are optional when there are pictures or a video. The
same for changing one. Where a post is shown, one without a title shows its
words, as a reply with pictures does.

### What is not part of it

- Merging topics and articles (above), which would change stored types.
  Otherwise notes, photos, videos, articles and topics are posted by the
  routes they have today; the composer picks the route from what the post
  holds, as the reply form does.
- Sharing documents (row 75), todos.

## Phases and estimate

| Phase | Work | Time |
| --- | --- | --- |
| 1 | The short box: one form for notes, photos and videos, on the reply form's parts; full screen on a phone; drafts; photo and video posts without a title | 1½–2 sessions |
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
- services: the API reference, where photo and video posts take no title.

## Status

| Item | State |
| --- | --- |
| Plan | written 2026-10-16, with the user's decisions |
| Todo and File composer forms | removed 2026-10-16 |
| Order | the composer before Pulse (row 38), at the user's word on 2026-10-16 |
| Phase 1 | done 2026-10-16 on branch `unified-composer`; to try in a browser |
| Phase 2 | begun 2026-10-16: one form of its own, with pictures and videos; the cover, pictures within an article's text, and the editor are still to do |
| Phase 3 | to do |

### What phase 1 did

- **The short box** (`containers/media/Composer/Short.jsx`): closed, one line
  with the viewer's avatar, a button for pictures and one to expand; open, in
  place on a desktop and full screen on a phone, Close and Post at the top
  and the attachments and choices in one row at the bottom. The full-screen
  composer is the height of what can be seen, so a phone's keyboard does
  not cover its bottom row (iOS shrinks only that). What a post becomes is
  `utils/composer.js`, with its tests. The draft is `useDraft.js`.
- **The extended composer, for now** (`Long.jsx`): a dialog, full screen on a
  phone, with Article and Topic tabs holding the forms there were. Phase 2
  gives it its own editor.
- **The tabs are gone,** and with them the Note and Photo forms and the video
  composer; the list of videos being prepared is `VideoUploads.jsx`.
- **The services:** photo and video posts take no title, and a photo post no
  words (services branch `unified-composer`). On the way, a reply of
  pictures or a video with nothing said failed with a 500: the graph asked
  for a title or words where a file is enough. Fixed there.
- **Tried on the dev stack** as the test account, in a headless browser at a
  desktop's width and a phone's: a note, a photo post with words, and a
  two-second video, each posted from the short box without a title, shown,
  and deleted after.

### What phase 2 has done so far

- **One form of its own** (`Long.jsx`) in place of the old Article and Topic
  forms, which are removed with the composer they ran in (`Default`): the
  title, the text growing as it is written, an article's excerpt, and the
  same bottom row as the short box, with Photos and Video beside the post's
  choices (`usePostChoices.jsx`, shared by both). An article or a topic
  needs a title of 10 characters and some text, said under each field in
  the line kept for it.
- **Pictures and a video** (decision 5), shown under the title where they
  are seen; the text is shorter then.
- **Its own draft** of the title and the text (`useDraft` with a slot).
  What was written in the short box moves to it when expanded.
- **Tried on the dev stack** as the test account at a desktop's width and a
  phone's: a photo post with a title and two lines of text, an article, and
  a two-second video with a title, each posted, read back, and deleted.

### Cover and embeds (2026-10-16)

- **Cover:** chosen in the long content form for an article and sent once
  it exists (`CoverPicker.jsx`, the `/covers/` endpoint profiles use);
  changed or removed on the article's page by its author. The article
  layout no article used (`Read/Article.jsx`) is gone. Fixed on the way:
  the cover widget read its cover once; an edited excerpt was dropped by
  text-service, and no post's excerpt was in what the server answers. The
  edit form has the excerpt.
- **Embeds:** as designed above. Server: `anahita-libs/embeds`,
  `link_previews` in a post's meta and response, the edges in
  text-service (`handlers/embeds.go`). Web: `utils/embeds.js`,
  `components/PostEmbed.jsx`, drawn by `NodeBody` for articles and topics;
  the composer asks for page previews as it is written. Tried on dev: a
  photo, a note and Wikipedia embedded in an article, at a desktop's
  width and a phone's; both edges and the card were there; deleted after.
- **Not done:** a cover can't be cleared from the edit form, only from the
  page; an excerpt can't be emptied once set (the graph skips an empty
  one); articles are still not sent to other servers.

### Found on the way, not part of this row

- A photo post just made shows in the home feed without its picture until
  the page is reloaded: the feed's check for new posts takes it before its
  pictures are attached. It was so with the old composer too.
- The post's choices are labelled in three styles side by side: "Public",
  "EN", "ANYONE" (the reply button's capitals are MUI's default).
- The welcome page logs React's warning about a list without keys
  (`Home`).
