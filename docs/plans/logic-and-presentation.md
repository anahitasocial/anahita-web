# Logic apart from presentation

*Roadmap row 140. Planned on 2026-11-07, at the user's word; this plan
written 2026-11-08, when stage 1 was reached. See the
[roadmap](roadmap.md) for order.*

## Contents

1. [Why](#why)
2. [What is there now](#what-is-there-now)
3. [Decisions](#decisions)
4. [Stage 1: the lists](#stage-1-the-lists)
5. [The stages after](#the-stages-after)
6. [Status](#status)

## Why

A container that fetches, keeps state, applies rules and lays out, all in
one file, is hard to change without breaking something, and cannot be
tested without drawing it. Row 139 will show each list as a list, a grid or
masonry, and let a site choose; the mobile app will want the same data with
a different face. Both are easier when what a list holds and how it is drawn
are apart.

In stages, between the features, never all at once (the user, 2026-11-07:
"I don't want the items down the list starve while we are code
refactoring"). Each stage is the area the next features touch.

## What is there now

Eight containers browse a list of posts or profiles, and each repeats the
same steps around the store: a `start`, set to `0`; the list emptied when the
page is left; the next page asked for when `start` moves; an error shown
when one comes; and the next start worked out when the reader scrolls to the
end. Then each hands the items to a component that draws them.

| Container | Lines | Draws with |
| --- | --- | --- |
| `feed/Leaders` (home) | 177 | `feed/components/Items.jsx` |
| `feed/Actor` (a profile's posts, replies, reposts) | 360 | `feed/components/Items.jsx`, and replies and reposts of its own |
| `feed/Custom` | 175 | `feed/components/Items.jsx` |
| `media/Browse` (notes, photos, articles, topics) | 163 | `media/Browse/List.jsx` |
| `blogs/Browse` | 147 | its own cards |
| `inbounds/Browse` (a hashtag's or a location's posts) | 158 | its own cards |
| `actors/Browse` (people, groups, events) | 200 | its own cards |
| `search/Browse/SearchList` | 258 | its own cards |

How a feed is laid out, one post under another or in columns, is already
apart: `feeds/useFeedView.js`, kept in the browser, and the `columns` flag the
drawing components take.

## Decisions

1. **One hook for browsing, `useBrowse`** (BREAD's word): given the list's
   actions and its place in the store, it holds the items, whether there
   are more, whether a page is on its way, and gives `next()`, `prepend()`
   and `reset()`. It empties the list when the page is left and shows an
   error when one comes. Where it lives: `containers/browse/useBrowse.js`.
2. **The store stays.** The lists keep their reducers and actions; the hook
   reads them with `useSelector` and `useDispatch` in place of each
   container's `connect`. Moving off Redux is not part of this row.
3. **Drawing components take what to draw,** never fetch: the items, `next`,
   `hasMore`, and how to lay them out. A container is then the hook and the
   component, a few lines.
4. **Nothing changes for people.** Every list looks and works as before;
   each stage is checked by screenshots of every list it touches, before
   and after, at desktop and mobile sizes, compared.
5. **Tested on its own:** each hook gets a test, drawn with React's own
   `createRoot` and `act`, as `components/__tests__/ColumnViews.test.jsx`
   tests `useFeedView`; no new testing library.

## Stage 1: the lists

1. `useBrowse`, and its test: the first page asked for, the next when
   scrolled, the list emptied when left, an error shown, new posts put on
   top.
2. The eight containers above moved onto it, one commit each, each checked
   in the browser before the next.
3. A list that keeps its own rules keeps them in a hook of its own beside
   it: `feed/Actor`'s three filters, `actors/Browse`'s query, the new posts
   of the home feed (`useNewPosts`, as now).
4. The docs: `architecture.md` says where a list's data is and where it is
   drawn.

About two sessions.

## The stages after

Each when the features after it need it, as the roadmap's order says:

1. **The composer** (`media/Composer/Short.jsx`, 778 lines;
   `LongEditor.jsx`, `Long.jsx`): before the next change to posting.
2. **The photo and video pages** (`media/Stepper/Lightbox/Default.jsx`,
   `components/PhotoFilesEditor.jsx`).
3. **Replies** (`replies/Thread.jsx`, `ReplyItem.jsx`, `ReplyForm.jsx`).
4. **Settings** (`actors/Settings`, `admin/Accounts`, `feeds/Form.jsx`).

## Status

| Item | State |
| --- | --- |
| Plan | written 2026-11-08 |
| Stage 1, the lists | not started |
