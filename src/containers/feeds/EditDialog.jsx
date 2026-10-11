import React from 'react';
import PropTypes from 'prop-types';

import CustomFeedForm from './Form';
import useFeed from './useFeed';

// Changing a custom feed, in a dialog over whatever page it was asked for
// on: Home, with the feed open under it.
//
// The feed is read again first, for the profiles and places it names. Until
// it has been, and if it cannot be, nothing is drawn. Saving tells whoever
// lists feeds (`api.customFeeds.onChange`), so the page under the dialog
// shows the feed as it now is.
const CustomFeedEditDialog = ({
  feedId,
  onClose,
  onDeleted,
}) => {
  const { feed } = useFeed(feedId);

  if (!feed || !feed.authorized || !feed.authorized.edit) {
    return null;
  }

  return (
    <CustomFeedForm
      key={feed.id}
      feed={feed}
      inDialog
      onClose={onClose}
      onSaved={onClose}
      onDeleted={onDeleted}
    />
  );
};

CustomFeedEditDialog.propTypes = {
  feedId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onDeleted: PropTypes.func.isRequired,
};

export default CustomFeedEditDialog;
