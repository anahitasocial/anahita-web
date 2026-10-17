import LIMITS from './limits';

export default {
  FILTER: {
    ADMINISTERING: 'administering',
    FOLLOWING: 'following',
  },
  FIELDS: {
    NAME: {
      MAX_LENGTH: LIMITS.DISPLAY_NAME_MAX,
    },
    // Typed to confirm deleting a profile: whatever its address is.
    ALIAS: {
      MAX_LENGTH: 100,
      MIN_LENGTH: 3,
    },
    BODY: {
      MAX_LENGTH: LIMITS.BIO_MAX,
    },
    METADATA: {
      MAX_LENGTH: 100,
    },
  },
  TAB_COMPONENTS: {
    // Actor types
    groups: 'actor',
    people: 'actor',
    // Medium types
    notes: 'medium',
    articles: 'medium',
    topics: 'medium',
    photos: 'medium',
    videos: 'medium',
  },
};
