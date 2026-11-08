# Conversations that read as conversations (roadmap row 129)

Asked for by the user on 2026-11-07: "each time we reply to someone's reply,
it becomes a new nested reply with their reply as the parent. Ideally we want
a thread under a post or under a reply rather than reply on a reply on a
reply on a reply." And, once the direction was set: "a design decision,
while respecting the reply tree at the data level." Done the same day.

## Contents

1. [Settled](#settled)
2. [What there is now](#what-there-is-now)
3. [The rules](#the-rules)
4. [Out of scope](#out-of-scope)
5. [Phases](#phases)

## Settled

1. **The data stays a tree.** Each reply keeps the one it answers as its
   parent, as the fediverse (`inReplyTo`) and Bluesky (`reply.parent`) need,
   and notifications too. Only how replies are drawn changes.
2. **Drawn as Bluesky and Threads draw them:** no staircase; a conversation
   flat, joined by a line; a short look at each, then a way into it; a
   reply's own page with what it answers above it.

## What there is now

1. **Every reply sits under the one it answers,** a level further in each
   time, up to four levels, then lined up under each other
   (`utils/thread.js`, `MAX_INDENT`; `containers/replies/ReplyItem.jsx`).
2. **The post's writer's own chain comes first,** flat, joined by a line
   (row 126, `thread.chainOf`).
3. **A reply has a page of its own,** with what it answers in a box above it
   and the part of the thread under it (`ReplyContext.jsx`, `thread.under`).

## The rules

1. **One level of nesting, at most, anywhere.** The replies to the post, or
   to the reply a page is about, stand at the first level. Under each, its
   conversation is drawn flat at the second level, joined by a line, whoever
   answers whom: never a step further in.
2. **A conversation follows its earliest branch.** Under a reply with
   several replies, the earliest is followed, and the rest are counted:
   "2 more replies", which opens that reply's page.
3. **Three in sight, then the rest a tap away.** Under each reply at the
   first level, the first three of its conversation; then "Show the
   conversation (n)", which opens the reply's page. A post's page stays
   short however much is said under it.
4. **A reply's own page** has what it answers above it as a short chain, the
   post at the top and each reply down to it joined by the line, cut to a
   line or two each; then the reply; then its replies under the same rules.
5. **Who is answered is said,** where the place no longer says it: a reply
   in a conversation that answers somebody other than the one above it says
   "Replying to @name", and the reply box says whom it answers.
6. **What stays:** the order chosen (newest or oldest first) for the first
   level, the post's writer's chain first (row 126), hidden replies apart,
   and every action on every reply.

## Out of scope

1. Changing what a reply answers, here or on other networks.
2. An indented tree for whoever wants one, as Bluesky offers in its
   settings: weighed once this has been used.

## Phases

1. **The rules in `utils/thread.js`,** as plain functions with tests: the
   first level, each conversation's earliest branch, the counts of the rest.
   Half a session.
2. **The post's page and a reply's page** (`Thread.jsx`, `ReplyItem.jsx`,
   `ReplyContext.jsx`), tried at both sizes with a long, branching
   conversation made for it on the development stack, screenshots for the
   user before it is finished. A session.

## Done

2026-11-07, both phases, before v1.0.18 at the user's word. The rules in
`utils/thread.js` (`conversationOf`, with tests), the post's page and a
reply's page; tried at both sizes with a conversation of seven replies, one
branch, between two people on the development stack, deleted after. Three
changes from the plan while building it:

1. **The link to a branch** sits right under the reply it answers and names
   its writer, "1 more reply to Worf Mogh": placed after the reply followed,
   it read as answering that one.
2. **No step in at all,** after the user showed how Threads draws it: each
   reply of a conversation at the same width, joined to the next by a line
   in the pictures' column, from under one picture to the next. The writer's
   own chain on the post's page is drawn the same way. The links to more
   sit inside the reply they belong to, under its actions.
3. **The chain above a reply's own page** is the post, then the reply just
   above it, "Then replying to…" (`ReplyParent.jsx`), not every reply on the
   way: each would be a request of its own, and these two say what is being
   answered.
