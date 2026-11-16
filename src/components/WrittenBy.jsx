import React from 'react';
import PropTypes from 'prop-types';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import i18n from '../languages';
import utils from '../utils';

const { getActorName, getURL } = utils.node;

// Which of a channel's admins wrote a post or a reply made as the channel
// (anahita-services roadmap row 147). The server sends it only to the
// channel's admins and the site's administrators; everybody else sees the
// channel alone, and this shows nothing. A line of its own, under the time.
const WrittenBy = ({ node }) => {
  const writer = node && node.writtenBy;
  if (!writer || !writer.id) {
    return null;
  }

  return (
    <Typography
      component="span"
      variant="caption"
      color="textSecondary"
      sx={{ display: 'block' }}
    >
      {i18n.t('media:writtenBy')}
      {' '}
      <Link href={getURL(writer)} color="inherit" underline="hover">
        {getActorName(writer)}
      </Link>
    </Typography>
  );
};

WrittenBy.propTypes = {
  node: PropTypes.shape({
    writtenBy: PropTypes.shape({
      id: PropTypes.number,
    }),
  }).isRequired,
};

export default WrittenBy;
