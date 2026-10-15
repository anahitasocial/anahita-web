# Finishing the signup workflow, now that there are recommendations (item 45)

Asked for by the user on 2026-10-13: "finishing up the signup workflow now
that we have recommendations". Built 2026-10-14; see What was built.

## Where it was left

Somebody who has just joined is taken through three steps
(`containers/onboarding/Steps`): their picture, their profile, and the
accounts the installation features. The plan for onboarding
([done/onboarding.md](onboarding.md)) had a third phase, put off until
there was something to recommend with:

> Suggestions from interests: deferred to the recommendation engine. When
> it lands it adds an "Interests" step (hashtags and locations as chips)
> and a "Suggested" step, both under the empty-list rule.

The recommendation service exists since M7 (row 20). It already answers for
somebody who has just joined and follows nobody
(`GET /recommendations/actors?context=onboarding`, which leaves out
everything worked out from who they follow); the web app's onboarding does
not ask it yet.

## What changed since that was written

- **Nobody picks interests by hand.** The recommendation service takes what
  somebody is interested in from the hashtags on what they wrote and liked.
  Somebody who has just joined has written and liked nothing, so for them
  there is nothing to go by but who invited them, what is popular and what
  is featured. An "Interests" step would be what gives it something.
- **A hashtag and a place can be followed,** each as a feed on the home page
  (`containers/feeds/FollowFeed.jsx`). That is a second thing an
  "Interests" step could do with what is picked, besides recommending by
  it.
- **People on other servers can be followed.** Whether somebody who has
  just joined is offered them, and is asked whether they want to be on the
  fediverse themselves, is a question this did not have before.

## Sketch

1. **A "Recommended for you" step** after the featured accounts, asking the
   recommendation service with `context=onboarding`: people and groups,
   each with the reason it is recommended, and a Follow button. Skipped
   when the answer is empty, or the service is not there, as the featured
   step is.
2. **An "Interests" step before it:** hashtags, and perhaps places, picked
   as chips from the ones most used on the installation. What is picked is
   followed as feeds, and is what the next step recommends by. This needs
   the recommendation service to take interests that are picked and not
   only ones that are worked out, which it does not yet
   (`docs/recommendations.md` in the services, "Interests somebody picks").
3. **The home page of somebody new** not being empty when they arrive on
   it: what they followed in the steps before is there to read.

## A site that has just been set up

The "Interests" step offers the hashtags most used on the installation,
and a new installation has none. The user's thought (2026-10-12): when
the recipes are made (item 40), a recipe can put in the hashtags a site
of its kind is likely to use, so there is something to pick from on the
first day. Recorded in the services' `docs/plans/recipes.md`, under what
recipes will show is missing. Until then the step is skipped when there
is nothing to offer, as the others are.

## To decide when it is built

- Whether there is an "Interests" step at all, or only the recommended one.
- Whether somebody who has just joined is asked about the fediverse here,
  or left to find it in their settings. It is off until they say, and has
  to stay a choice they make.
- Whether events are recommended in onboarding as they are on the
  Recommendations page.

## Depends on

Recommendations (row 20) and following a hashtag or a place (done). The
"Interests" step also needs the services' side of picked interests.
Hashtags a recipe puts in (item 40) would make that step useful on a new
site; it does not wait for them.

## Decided (user, 2026-10-14)

- **An Interests step: yes, hashtags as chips.** Not places, for now.
- **The fediverse is not asked about in signing up.** It stays off until
  somebody turns it on in Settings › Fediverse.
- **People and groups only** in the recommended step, not events.

## What was built

Steps now: photo, profile, **interests**, featured accounts, **recommended
for you**, then the home page.

- **Interests** (`containers/onboarding/Steps/Interests.jsx`): the hashtags
  on the most public posts, as chips. Each one picked is followed as
  following a hashtag is anywhere: a feed of it on the home page, the
  person's alone (`api/customFeeds.js#follow`, which the Follow button on a
  hashtag's page now uses too). Left out with fewer than three to offer.
- **Recommended for you** (`Steps/Recommended.jsx`): five people and five
  groups from the recommendation service as for a newcomer
  (`context=onboarding`), each with its reason, asked when the step is
  reached so that the hashtags just followed count. Checkboxes, as for the
  featured accounts: nothing is followed without a tick. Moves on by itself
  when there is nothing to show; not there at all without the service.
- **The recommendation service** (anahita-services):
  - `GET /recommendations/interests`, the hashtags to offer: public posts
    of public profiles only, spellings that differ in case put together,
    each on at least two posts. It looks at the last three months, then the
    year, then all time, until it has eight, so that a site quiet lately
    still offers something; on the development database that is #anahita,
    #hackathon, #ReactJS and the like.
  - **Hashtags somebody follows count as their interests** (the
    `shared_interest` reason), read from the hashtags of the custom feeds
    they own, even with "use what I do" turned off, and for a newcomer.
- **Found on the way and fixed:** the trending lists of hashtags and of
  places ignored the time window the web app asks for ("weekly" was
  accepted and never understood, so they always showed the last day), and
  refused the window they defaulted to.
- **Found and not fixed:** 14 hashtags were made on 2026-10-13 as case
  doubles of existing ones ("Anahita" beside "anahita"), from posts that
  came from other servers. Feeds and search still match both, since the
  column ignores case, but a hashtag's page and counts are split in two.
  Recorded in the roadmap as a fix to make.
- Tested: which steps somebody gets (`onboarding/__tests__`), and against
  MySQL that a followed hashtag is recommended by and what is offered
  (`signals_integration_test.go`).

### After the user tried it: 2026-10-14

The user made an account (Captain Picard), went through, and deleted it.
Changed from what they saw:

- **The profile comes before the photo,** so the circle can show the
  initials of the name just given. The circle was white on a white card;
  in signing up it now has a border in the theme's colour, dashed until
  there is a picture, with the initials in that colour (the avatar form's
  `prominent`).
- **The language they post in starts on the browser's,** and so the
  computer's, rather than on nothing chosen.
- **What is picked makes one feed, "My interests",** of all the hashtags
  picked, not a feed for each: up to ten, as many as a feed takes. First
  called "For You", and renamed at the user's word: on other platforms
  "For You" is a feed an algorithm chooses, and this one is the posts with
  the hashtags they chose, newest first. The last step is called
  "Recommended".
