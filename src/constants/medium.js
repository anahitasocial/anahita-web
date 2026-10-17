export default {
  FIELDS: {
    NAME: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 100,
    },
    BODY: {
      MAX_LENGTH: 8000,
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
