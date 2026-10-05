export default {
  ALERT: {
    ADD: 'APP_ALERT_ADD',
    DELETE: 'APP_ALERT_DELETE',
  },
  NODE_INFO: {
    READ: 'APP_NODE_INFO_READ',
    // The request finished without a document: the server could not be
    // reached, or answered with an error.
    UNAVAILABLE: 'APP_NODE_INFO_UNAVAILABLE',
  },
  BROWSE: {
    LIMIT: 20,
    SORTING: {
      TRENDING: 'trending',
      TOP: 'popular',
      RECENT: 'recent',
      UPDATED: 'updated',
      RELEVANT: 'relevant',
    },
  },
};
