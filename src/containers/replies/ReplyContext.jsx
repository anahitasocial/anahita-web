import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import i18n from '../../languages';
import utils from '../../utils';

const { getURL } = utils.node;

// How much of what was answered is shown. Enough to say what the reply is
// about; the rest is a click away.
const EXCERPT = 140;

const excerptOf = (text = '') => {
  const plain = String(text).replace(/\s+/g, ' ').trim();
  return plain.length > EXCERPT ? `${plain.slice(0, EXCERPT).trim()}…` : plain;
};

// What a reply is a reply to, said above it wherever a reply is shown away
// from its thread: on its own page, and in the list of somebody's replies.
//
// `answered` is whatever there is to say it from: a post, or another reply.
// `href` is where to go to read it.
const ReplyContext = ({
  answered,
  href,
  children = null,
}) => {
  if (!answered || !answered.id) {
    return null;
  }

  const author = answered.author && answered.author.name;
  const excerpt = excerptOf(answered.name || answered.body);

  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        borderLeft: 4,
        borderColor: 'divider',
        bgcolor: 'action.hover',
      }}
    >
      <Typography variant="caption" color="textSecondary" component="p">
        <Link href={href || getURL(answered)} color="inherit">
          {author ?
            i18n.t('replies:context.replyingTo', { name: author }) :
            i18n.t('replies:context.replying')}
        </Link>
      </Typography>
      {excerpt &&
        <Typography
          variant="body2"
          color="textSecondary"
          dir="auto"
          sx={{ overflowWrap: 'anywhere' }}
        >
          {excerpt}
        </Typography>}
      {children}
    </Box>
  );
};

ReplyContext.propTypes = {
  answered: PropTypes.shape({
    id: PropTypes.number,
    type: PropTypes.string,
    name: PropTypes.string,
    body: PropTypes.string,
    author: PropTypes.shape({ name: PropTypes.string }),
  }),
  href: PropTypes.string,
  children: PropTypes.node,
};

export default ReplyContext;
