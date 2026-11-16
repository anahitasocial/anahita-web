export default {
  public: 'Public',
  registered: 'Signed-in people',
  followers: 'Followers',
  leaders: 'Following',
  mutuals: 'Mutuals',
  admins: 'Admins',
  myself: 'Only me',
  // Choosing who can see a post while writing it. Its own wording, not
  // the bare level names above: here each one has to say whose followers
  // and whose administrators are meant.
  audience: {
    label: 'Who can see this: {{ name }}',
    names: {
      public: 'Public',
      registered: 'Signed-in people',
      followers: 'Followers',
      leaders: 'Following',
      mutuals: 'Mutuals',
      admins: 'Admins',
      myself: 'Only me',
    },
    descriptions: {
      public: 'Anyone, signed in or not',
      registered: 'Anyone who is signed in',
      own: {
        followers: 'People who follow you',
        leaders: 'People you follow',
        mutuals: 'You and they follow each other',
        myself: 'Nobody else',
      },
      person: {
        followers: 'People who follow {{ name }}',
        leaders: 'People {{ name }} follows',
        mutuals: 'People {{ name }} follows who follow them back',
        myself: 'Only {{ name }}',
      },
      group: {
        followers: 'People who follow {{ name }}',
        admins: 'The admins of {{ name }}',
      },
    },
    capped: 'Not available here: {{ name }} is not visible that widely, so a post on it cannot be either.',
  },
  // The access dialog's reasons a level cannot be chosen (roadmap row 155).
  dialog: {
    notOnSite: 'This site keeps what is new to people who are signed in',
    notNarrower: 'No narrower than this profile',
  },
};
