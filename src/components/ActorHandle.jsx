import React from 'react';
import PropTypes from 'prop-types';
import slugify from 'slugify';

import Typography from '@mui/material/Typography';

import utils from '../utils';

// Somebody's handle, in grey after their name: @ana for somebody here,
// @alice@mastodon.example whole for somebody elsewhere, since the server is
// the half that says who they are. Written as the profile's own header
// writes it (federation.displayHandle).
//
// After the name where there is room, under it where there is not (the
// user, 2026-10-16), and a long handle from elsewhere breaks rather than
// running out of its card.
const ActorHandle = ({ actor = null, variant = 'body2' }) => {
  const handle = utils.federation.displayHandle(actor, slugify);
  if (!handle) {
    return null;
  }
  return (
    <Typography
      component="span"
      variant={variant}
      color="textSecondary"
      dir="ltr"
      sx={{ overflowWrap: 'anywhere', minWidth: 0 }}
    >
      {handle}
    </Typography>
  );
};

ActorHandle.propTypes = {
  actor: PropTypes.object,
  variant: PropTypes.string,
};

export default ActorHandle;
