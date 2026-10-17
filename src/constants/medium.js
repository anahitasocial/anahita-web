import LIMITS from './limits';

export default {
  FIELDS: {
    NAME: {
      MAX_LENGTH: LIMITS.TITLE_MAX,
    },
    BODY: {
      MAX_LENGTH: LIMITS.POST_BODY_MAX,
    },
  },
  // The most hashtags a post is filed under: the first this many different
  // ones in its text; the rest are words (the services'
  // constants.MaxHashtagsOfAPost).
  MAX_HASHTAGS: 10,
  // The most places a post is tied to; one more is refused
  // (constants.MaxLocationsOfAPost).
  MAX_LOCATIONS: 5,
};
