# Finishing the signup workflow, now that there are recommendations (item 45)

Asked for by the user on 2026-10-13: "finishing up the signup workflow now
that we have recommendations". Planned, not built.

## Where it was left

Somebody who has just joined is taken through three steps
(`containers/onboarding/Steps`): their picture, their profile, and the
accounts the installation features. The plan for onboarding
([done/onboarding.md](done/onboarding.md)) had a third phase, put off until
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
