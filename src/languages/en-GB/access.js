export default {
  public: 'Public',
  registered: 'Registered',
  followers: 'Followers',
  leaders: 'Leaders',
  mutuals: 'Mutuals',
  admins: 'Admins',
  myself: 'Myself',
  // Choosing who can see a post while writing it. Its own wording, not
  // the bare level names above: here each one has to say whose followers
  // and whose administrators are meant.
  audience: {
    label: 'Who can see this: {{ name }}',
    names: {
      public: 'Public',
      registered: 'Signed-in people',
      followers: 'Followers',
      leaders: 'Leaders',
      mutuals: 'Mutuals',
      admins: 'Administrators',
      myself: 'Only me',
    },
    descriptions: {
      public: 'Anyone, signed in or not',
      registered: 'Anyone who is signed in',
      own: {
        followers: 'People who follow you',
        leaders: 'People you follow',
        mutuals: 'People you follow who follow you back',
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
        admins: 'The administrators of {{ name }}',
      },
    },
    capped: 'Not available here: {{ name }} is not visible that widely, so a post on it cannot be either.',
  },
};
