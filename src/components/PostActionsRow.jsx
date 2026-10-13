import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';

// The one row under a post: what can be done with it (like, reply, repost,
// share), spread across as they always were, and at the end the one icon
// that opens its interactions.
//
// There were two rows, counts above and actions below, which said some of
// the same things twice and left reposts and quotes uncounted. Every
// layout of a post draws this, so they cannot drift apart again.
const PostActionsRow = ({ actions = null, stats = null }) => {
  if (!actions && !stats) {
    return null;
  }

  return (
    <CardActions>
      {actions}
      {/* Alone in the row, for somebody who is not signed in, it keeps to
          the end where it always is. */}
      {!actions && <Box sx={{ flex: 1 }} />}
      {stats}
    </CardActions>
  );
};

PostActionsRow.propTypes = {
  actions: PropTypes.node,
  // The interactions icon: containers/likes.
  stats: PropTypes.node,
};

export default PostActionsRow;
