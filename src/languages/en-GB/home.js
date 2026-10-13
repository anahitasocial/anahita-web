export default {
  cTitle: 'Home',
  mTitle: 'Home',
  // The home page of somebody who is not signed in.
  guest: {
    signIn: 'Sign in',
    join: 'Create a profile',
    people: '{{ formatted }} person',
    people_plural: '{{ formatted }} people',
    posts: '{{ formatted }} post',
    posts_plural: '{{ formatted }} posts',
    federated: 'Part of the fediverse',
    reasons: {
      follow: {
        title: 'People, groups and events',
        body: 'Follow the people, groups and events that matter to you, and read what they post in one place.',
      },
      feeds: {
        title: 'Feeds you shape yourself',
        body: 'Build your own feeds from hashtags, places and the profiles you choose. Nothing is ranked behind your back: the newest comes first.',
      },
      yours: {
        title: 'What you post stays yours',
        body: 'You choose who sees each post, and you can take a copy of everything you have made whenever you like.',
      },
      // On an installation that takes part in other networks: which.
      networks: {
        both: {
          title: 'Part of the fediverse',
          body: 'Follow people on Mastodon and Bluesky, and be followed and answered by them, without leaving this site. It speaks both of their protocols: ActivityPub and the AT Protocol.',
        },
        activitypub: {
          title: 'Part of the fediverse',
          body: 'Follow people on Mastodon and the other servers of the fediverse, and be followed and answered by them, without leaving this site. It speaks their protocol, ActivityPub.',
        },
        atproto: {
          title: 'Connected to Bluesky',
          body: 'Follow people on Bluesky, and answer them as your own Bluesky account, without leaving this site. It speaks Bluesky’s protocol, the AT Protocol.',
        },
      },
    },
    lookAround: 'Have a look around',
    places: {
      people: 'People',
      groups: 'Groups',
      hashtags: 'Hashtags',
      about: 'About this site',
    },
    runsOn: 'This site runs on',
    runsOnAfter: ', open source software for communities.',
  },
  // Shown in place of every page to somebody who is not signed in, on an
  // installation that is members-only (SITE_READ_ACCESS=registered).
  membersOnly: {
    cTitle: 'This site is for its members',
    cDescription: 'Sign in to read it. Nothing here is shown to people who are not signed in.',
    signIn: 'Sign in',
  },
  // For somebody who is not signed in, on an installation that shows
  // visitors only the start of what is public (SITE_READ_ACCESS=preview).
  preview: {
    cTitle: 'You are seeing a preview',
    cDescription: 'Sign in to read whole posts, replies and everything past the first page.',
    signIn: 'Sign in',
    readMore: 'Sign in to read more',
    comments: 'Sign in to read the replies',
    followers: 'Sign in to see who follows whom',
  },
};
