# Search: recent searches, and a search that keeps its place

*Roadmap item 36, raised by the user on 2026-10-11 ("jazz up our search so it caches recent searches"). Row 33 of M10. See the [roadmap](../roadmap.md).*

## Context

The search box in the top bar is a plain form: type, press Enter, and the page reloads on `/search/?q=…`. It remembers nothing. Somebody who looks for the same group every morning types its name every morning.

This plan is recent searches first, which is what was asked for, and then three small things found while reading the search page that make it feel finished. Each part stands alone and can be built without the others.

## What exists

- **The box:** `src/components/SearchBox.jsx`, an HTML form that submits to `/search/`, with a full page load. No suggestions, no history.
- **The page:** `src/containers/search/Browse/index.jsx`. Tabs All, Media, Actors and Feeds (`scope`), an order (Relevant, Most recent) and a distance slider. The term is in the address (`?q=`). The tab can be given in the address (`?scope=feeds`) and is then kept only in the page's own state, as the order and the distance are: reload, or come back to the page, and they are as they started.
- **The server:** `GET /search/?term=&scope=&sort=…` on search-service. The term is required. Feeds have been among the results since row 19.
- **Browser storage in the app:** used for a handful of the viewer's own conveniences (`utils/postLanguage.js`, `utils/share.js`, the home page's layout), each read and written inside try/catch.

## Part 1: Recent searches

**What somebody sees**

- Focusing the empty search box opens a short list under it: their last searches, most recent first, with a clock icon beside each.
- Pressing one searches for it again. Typing narrows the list to the ones that start with, or contain, what was typed.
- Each has an ✕ to forget that one, and the list ends with **Clear recent searches**.
- Arrow keys move through the list and Enter chooses, like any list under a field.

**Where they are kept: in the browser, and nowhere else**

- `localStorage`, under a key that includes the viewer's id (`search.recent.<id>`), so two people who share a computer do not see each other's. A visitor who is not signed in has none.
- **Nothing is sent to the server and nothing is stored there.** What somebody looked for is theirs. This is the same reasoning as views and shares: the installation does not keep a record of what people look at. It also means recent searches do not follow somebody to another device, which is the cost of that choice.
- Cleared on signing out, so a shared computer is left clean.
- Read and written inside try/catch: where storage is unavailable (a private window, a full disk) search works as it does today.

**The rules**

- Ten at most. An eleventh pushes the oldest out.
- A search is remembered when it is run, not as it is typed.
- The same search again moves it to the top and is not kept twice. Compared without regard to case or to space at the ends; kept as it was last typed.
- Nothing shorter than two characters, and nothing longer than the 100 the server takes.
- The tab searched under is kept with the term, so choosing "seeds" last searched under Feeds opens Feeds.

**How it is built**

- `src/utils/recentSearches.js`: `list(viewerId)`, `add(viewerId, term, scope)`, `remove(viewerId, term)`, `clear(viewerId)`. Pure but for storage, which is passed in for the tests.
- `SearchBox.jsx` becomes an MUI `Autocomplete` in free-solo mode with the recent searches as its options (check its docs through the MUI MCP server first, per `CLAUDE.md`). Submitting goes through the router (`navigate('/search?q=…')`) and not a form post, which also removes the full page load.
- The search page calls `add` when it runs a search, so a search reached by a link is remembered too.
- `actions/session` clears them on sign-out.
- Strings in en-GB and fr-FR.

## Part 2: The search page keeps its place

The tab, the order and the distance go in the address beside the term (`?q=seeds&scope=feeds&sort=recent`). Reloading, the browser's Back, and a link somebody sends all open the page as it was. Today only the term survives.

The distance is left out of the address when it is at its widest, and the order when it is the default, so the plain address stays plain.

## Part 3: Words for an empty search

Today a search that finds nothing shows an empty page, and so does the Feeds tab before anything is typed.

- **Nothing found:** "Nothing matches “seeds”", with the other tabs offered if they would have something ("3 under Feeds"). The counts are one request each (`limit=1`, reading `pagination.total`) and are asked for only when the open tab is empty.
- **Nothing typed:** the recent searches, in the page, and nothing else.

## Part 4: As you type (later, and only if wanted)

A few results under the box while typing: the first profiles and groups that match, before Enter. It is what people now expect of a search box and is the one part with a real cost: a request on every pause in typing, against a query that uses `LIKE '%term%'` and is not indexed for it.

Left out unless asked for. If it is, it should wait 300 ms after the last key, ask only for actors (`scope=actors&limit=5`), ask nothing under three characters, and drop an answer that arrives after a newer question.

## Part 5: A better "Most relevant" (asked for by the user, 2026-10-13)

**What it is today** (`graph-grpc-service/data/repositories/search.go`, `GetRelevantSortQuery`): popularity alone, replies + likes + subscribers + followers, highest first. The words searched for decide what is found, not the order. So a post that mentions "seeds" once comes before a group called *Seeds* when the post has more likes; nothing new can rise above what is old and liked; and with no tiebreak, results with equal counts may come back in another order on the next page, so scrolling can show some twice and skip others.

**A principle, from the user (2026-10-13): old and useful counts as much as new.** Anahita is meant for building knowledge as well as for news: a school's notes, a library's guides, a research group's findings stay useful for years. So the order must never push something down only for being old. What it may weigh is whether something is **still being found useful**, which is a different thing from when it was written.

It is built in three layers, each useful alone.

### Layer 1: a scored order (to build first)

Each result is given a score from four parts, then a fixed tiebreak by id so that pages never overlap.

**1. How well it matches.** This part outweighs the others, so that a profile called *Seeds* always comes before a post that mentions seeds once.

| Where the words are | Points |
| --- | --- |
| The handle exactly (`rastin.example`, `ana`) | 100 |
| The name exactly | 90 |
| The name begins with them | 70 |
| A word in the name begins with them ("Jericho **Bea**ch") | 60 |
| Somewhere in the name | 50 |
| A hashtag on the post | 40 |
| A whole word in the body | 20 |
| Only inside a word in the body ("**coffee**house") | 10 |

With several words, all of them beats some of them, and the exact phrase beats both.

**2. The searcher's connections.** About +15 when they follow the profile, or the post is on a profile they follow: enough to put what they know above strangers at the same level of match, never enough to put a mention in a body above a name.

**3. Usefulness, on a logarithmic scale.** For a post, `log(1 + likes + saves + 2 × replies + 2 × reposts and quotes)`; for a profile, `log(1 + followers)`. The logarithm keeps one post liked a thousand times from burying everything: it comes first, not a hundred times first.

**4. Time, counted by when it was found useful, not by when it was written.** This is where the principle above is kept:

- What counts toward usefulness is weighted by **when each like, save, reply or repost happened**: a guide from 2019 liked and saved this month counts as fully as a post from this week. A post written last year that nobody has touched since weighs only its old interest.
- **How much the past fades is the operator's choice,** `half_life_days` in the weights file: a newsroom may halve the weight of interest every 30 days; a library, a school or a research group may set a year, or `0` for never, so that what was useful once stays as useful.
- A profile is weighed by when it was last active, under the same setting.

Interest kept by when it happened needs the time of each like, save and reply, which the edges and nodes already have (`created_at`). Counting by it means reading the edges rather than the counters on the node, which is affordable at this size and can be kept in a small table refreshed every hour if it is not.

**Who tunes it:**

- **The operator,** with every number above in a weights file, as the recommendation service has. The recipes (item 40) give each kind of site its own: `newsroom` short, `library`, `research`, `school` and `university` long or never.
- **Each person,** with a switch or two rather than weights, kept with their settings: "put people and groups I follow first", and perhaps "prefer what is recent". Which switches is to be settled with the user.

**To check it:** a handful of searches the user really makes, with the result they expect first ("coffee", "rastin"), made into tests, so that the weights are held to what people expect and not to guesses.

Services only, apart from the switches. **About 1½–2 sessions,** with time counted by interest; half a session more for the switches. "Most recent" stays as it is.

### Layer 2: a real index of words (put off, 2026-10-13)

**Tried on a throwaway MySQL 9.6 before anything was built, and put off: it is not dependable enough to find what search finds now.** With the `ngram` parser on names and bodies, a phrase search (`MATCH … AGAINST ('"coffee"' IN BOOLEAN MODE)`):

- with the stopwords as they come, found "coffee" only in a name and not in two bodies, found nothing for "joomla" or for Japanese, and found the coffee posts for "cafe": two-letter pieces that happen to be English stopwords ("of", "la") are dropped;
- with stopwords off (`innodb_ft_enable_stopword`, which must also be off when the index is built), an index built over rows already there still missed the bodies, while rows written after it was built were found; Japanese was still not found.

A search that misses posts without saying so is worse than a slow one, and search is not slow: after the fix of quotes (below) the commonest words answer in a third of a second on the development database's 22,000 nodes. So this waits until the database is many times larger, and should then be weighed against a search engine run beside the database (Meilisearch, or OpenSearch), which handles languages, accents and word forms properly, rather than MySQL's index. If it is MySQL's after all, it needs its own tests of what it finds against what `LIKE` finds, in several languages, before it replaces it.

What follows is the plan as first written.


Search today matches with `LIKE '%coffee%'`, which reads every row and knows nothing of words or languages. A MySQL `FULLTEXT` index on names and bodies (with the `ngram` parser for languages written without spaces) and `MATCH … AGAINST` give a score for the words themselves and are fast; that score replaces the last two rows of the table above. A migration, so it comes before row 27 folds the migrations into a baseline. **About 1 session.**

### Layer 3: ranking by citation (to be decided, a few months from now)

**Set aside by the user on 2026-10-13, to be decided in a few months, when there are more nodes and a denser graph.** Not part of row 33: row 33's Part 5 is done with layers 1 and 2.

Asked about by the user on 2026-10-13, as Google ranks the web: PageRank on Anahita's own graph. A citation between posts is a quote, a repost, a reply or a link from one post to another; between profiles, a follow, a mention or a like of their posts. One counts for more when it comes from something itself well cited. It would run as a job every hour, keep a score for each node, and become one more part of the score in layer 1. Its personalised form, started from the people and groups the searcher follows, ranks by what their part of the network cites.

**It suits knowledge systems especially,** which is why it is kept: it is how scholarly citation works, and it values what is old and still cited, which is the principle above.

**Why not now: the numbers on the development database (2026-10-13).**

| | Count |
| --- | --- |
| Posts | 7,597 |
| Replies | 11,126 |
| Profiles | 872 |
| Follows | 3,119 |
| Likes | 6,537 |
| Mentions | 296 |
| Reposts | 3 |
| Quotes | 0 |

- **Between posts there is almost no graph.** Citation analysis needs chains: B cites A, C cites B, and A gains from being cited by something cited. Nearly every citation here is a reply under a post; 2,254 posts have at least one and 447 have five or more, but not one post cites a post that is itself cited. Without chains, PageRank comes out as the number of replies, lightly weighted, which layer 1 already counts.
- **Between profiles there is a little more:** three or four follows each. PageRank could say "followed by people who are themselves well followed", but at this size follower counts and "followed by people you follow" (the recommendation service already has it) say nearly as much.

**When to look at it again**, whichever comes first:

- quotes and reposts in the thousands, so that posts cite posts in chains (both are new, and federation brings more);
- profiles in the tens of thousands with denser follows, when counts grow noisy and easy to inflate;
- signs of gaming, such as accounts liking each other in rings, which counters cannot tell from real interest;
- an installation used as a knowledge system (a `library`, `research` or `university` site) whose posts link to one another, which is where it pays soonest.

Profiles would gain from it first (searching for people, and suggestions), posts after.

**To be careful of, when it is built:** only public edges may count, or a private follow or a followers-only repost could show through the order of results; rings of accounts citing each other, which PageRank resists better than counters but not entirely; and posts from other servers, whose citations on their own network are not seen here, so their score is this site's interest in them.

**Size:** about 2–3 sessions, one more for the personalised form.

## Decided against

- **Keeping searches on the server.** See Part 1.
- **Popular or trending searches.** That is a record of what everybody looked for, which is the thing above, added up.
- **Search suggestions from other people's searches.** The same.

## Estimate

| Part | Time |
| --- | --- |
| 1. Recent searches: the helper and its tests, the box as an Autocomplete, the page remembering, sign-out, strings | 3–4 h |
| 2. Tab, order and distance in the address | 1 h |
| 3. Words for an empty search, with counts for the other tabs | 1–2 h |
| **Parts 1 to 3** | **5–7 h, about a session and a half** |
| 4. As you type | 2–3 h more |
| 5, layer 1. A scored order, time counted by interest | 1½–2 sessions, half a session more for each person's switches |
| 5, layer 2. An index of words | put off: not dependable in MySQL as tried; to be weighed against a search engine when the database is much larger |
| 5, layer 3. Ranking by citation | to be decided in a few months; about 2–3 sessions |

## How it would be checked

- Search for three things, focus the empty box: the three, newest first. Search for the first again: it moves to the top and is there once.
- An eleventh search drops the oldest. ✕ forgets one, Clear forgets all, and both hold after a reload.
- Sign out and in as somebody else on the same browser: none of the first person's searches. Sign back in as the first: none either, since signing out cleared them.
- In a private window with storage refused, searching works and no error is shown.
- The browser's network log shows no request when the list opens, and none carrying a past search.
- Open `/search?q=seeds&scope=feeds&sort=recent` in a new tab: Feeds, most recent first. Reload: the same.

## Dependencies

- None. Part 1 does not need the others.
- **Soft:** row 21 (the web shell) changes how the app is served, not how search works.

## Documentation

A phase is finished only when these pages match the code.

- **web `architecture.md`:** the search box and recent searches, that they are kept in the browser only, and what the search page keeps in its address.

## Status

| Item | State |
| --- | --- |
| Plan | written 2026-10-11 |
| Implementation | parts 1 to 3 built 2026-10-13, with looking a handle up at once; Part 5 layer 1 built 2026-10-13, each person's choices 2026-10-14; layer 2 tried and put off; layer 3 to be decided; Part 4 not |

## What was built

### Parts 1 to 3: 2026-10-13

As planned, with these differences:

- **A handle typed into the box is looked up at once** (asked for by the user while this was built). Only an unmistakable one: `@alice@mastodon.social`, a Bluesky DID, or a Bluesky handle written with `@` or on `bsky.social`. A bare name with dots (`seeds.org`) may be a word, and an address may be anything; those keep the button. Only when it was typed and Enter pressed: a link to the same search waits for the button, or a link could make the site call any server by being opened. Who is found is shown on the search page with their card and Follow button, for the button too; it first opened their profile, and the user asked for it to stay on the search page.
- **A distance needs a place** (found by the user: "coffee" within 25 km showed a café in Amsterdam). The browser had not given the page its location, and the server leaves the distance out when it is not told where the searcher is, so the search was everywhere and looked as though it was near. The page now says when that is so, and waits while the browser is asking. **And the real cause was in the page:** it compared the distance in metres (25,000) with the limit in kilometres (100), took every distance for "anywhere" and never sent the browser's location, permission or not. That had been so before this work; the distance is now kept in kilometres until it is sent, in metres.
- **The card of somebody looked up had no picture:** the lookup answers with who they are and not with their avatar, so they are now read as their profile is before the card is drawn.
- **The distance is in the address as `km`,** and written there when the slider is let go, not while it is dragged.
- **The search list was not refetched for a new term** when the page was reached without reloading, since its key left the term out. Harmless while the box reloaded the app; it is in the key now.
- **The distance filter listed what was a thousand times too far** (anahita-services, `graph-grpc-service/data/repositories/search.go`): the count compared in metres and the list multiplied by 1000 again, so "within 25 km" of Paris listed posts in Vancouver. Fixed; the list compares in metres as the count does.

Files: `components/SearchBox.jsx`, `utils/recentSearches.js` and `utils/searchAddress.js` with their tests, `search/Browse/{index,SearchList,RecentSearches,NothingFound}.jsx`, `search/RemoteLookup.jsx`, `utils/federation.js#isClearHandle`, `App.jsx` (cleared on signing out), strings in en-GB and fr-FR. Nothing on the server stores a search.

### Part 5, layer 1: 2026-10-13

Built in graph-grpc-service, as planned, with these differences:

- **The order is in three steps, not one score.** Where the words are first; then, among results that match alike, their standing (how useful people have found them, and whether the searcher follows them); then the id. So a profile called *Coffee* always comes before a post that mentions coffee, however liked, which a single sum could not promise.
- **A profile is weighed by its followers counted by when they followed,** the same way posts are weighed by their likes, rather than by when the profile was last active: it is the same rule of "still found useful" for both.
- **Inside the handle** (`decafcoffeeclub`) counts as inside the name, and a handle typed with its `@` is matched without it, so `@rastin.example` finds rastin.example (such a handle was found before only by posts that mention it).
- **Interest fades by half every 365 days as it comes.** `half_life_days` in the file; 0 for never.
- **The weights are in `graph-grpc-defaults/search_ranking.json`,** read again when it changes; anahita-services `docs/search.md` says how to tune it.
- **Not built: each person's switches.** Which ones is still to be settled with the user.

Checked against MySQL with searches as people make them (`search_ranking_integration_test.go`), and on the development database: "coffee" opens on the group *Coffee Love*, then photos whose titles begin with the word; a person's handle on that person, then a handle with it inside, then posts that mention it.
- **Too slow at first, for common words** (found by the user: "joomla" answered 500). A word in thousands of posts took 11 to 36 seconds and the query was cut off at three. Not the character sets, which were checked and are the same throughout (`utf8mb4_0900_ai_ci`), but one lookup: quotes were counted by when they were made, and with nearly no post quoting another, the database judged the index on `quote_id` not worth using and read every node for every result. The index is now named in the query. With it, and the page's ids ranked before its rows are read whole, the commonest words answer in a third of a second.

### Each person's choices: 2026-10-14

Two switches under the order on the search page, for somebody signed in, off as they come:

- **People and groups I follow first:** what they follow, or what is on a profile they follow, before everything else, however it matches.
- **Prefer recent:** among results that match alike, the newest first, then by standing. First built as interest fading within a month, which still put an old post liked this week above this morning's; changed before it was shown, since that is not what "prefer recent" means to anybody choosing it.

Kept in the browser, per person, like recent searches, rather than with the person's settings on the server: nothing about how somebody searches is stored there. Sent as `followed_first` and `recent_first` through search-service to the graph (`SearchBrowseRequest` fields 13 and 14). Checked against MySQL (`TestMostRelevantAsTheSearcherChooses`).
