import React from 'react';
import PropTypes from 'prop-types';

import CardActions from '@mui/material/CardActions';

// The one row under a post: what can be done with it (like, reply, repost,
// share) and, last, what opens its interactions. Every one is the same
// kind of button and as wide as the others, so the row is shared out
// evenly between them.
//
// There were two rows, counts above and actions below, which said some of
// the same things twice and left reposts and quotes uncounted. Every
// layout of a post draws this, so they cannot drift apart again.
//
// An icon's slot in a button keeps room for a label beside it, which pushes
// an icon with no count left of the middle. So the room is taken away, and a
// gap between what is in the button comes only when there are two things.
const iconSpacing = {
  '& .MuiButton-root': { gap: 1 },
  '& .MuiButton-startIcon': { m: 0 },
};

const PostActionsRow = ({ actions = null, stats = null }) => {
  if (!actions && !stats) {
    return null;
  }

  return (
    <CardActions sx={iconSpacing}>
      {actions}
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
