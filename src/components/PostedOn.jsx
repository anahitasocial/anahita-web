import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

import NodeType from '../proptypes/Node';
import i18n from '../languages';
import utils from '../utils';

const { getURL } = utils.node;

// Out of sight, still read by a screen reader.
const visuallyHidden = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
};

// Where a post was made, in its author's own line on a card in a list:
// "Rastin Mehr ▸ Sarah Noble" (the user, 2026-11-21). It was a row of its own
// above the author, which on a mobile, where cards are parted by a line,
// stood alone between two lines. Only when the two differ: a post on its
// author's own profile says nothing new by naming them twice. The name is in
// the author's size and colour, so it can be read (the user, 2026-10-17);
// a screen reader hears "on Sarah Noble". A post's own page keeps the row
// (MediumOwnerCardHeader.jsx).
export const isElsewhere = (owner, author) => {
  return Boolean(owner && owner.id && author && author.id !== owner.id);
};

const PostedOn = ({ owner = null, author = null, fontSize = 'inherit' }) => {
  if (!isElsewhere(owner, author)) {
    return null;
  }

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex', alignItems: 'baseline', gap: 1, minWidth: 0,
      }}
    >
      <Box component="span" aria-hidden sx={{ color: 'text.secondary' }}>▸</Box>
      <Box component="span" sx={visuallyHidden}>{i18n.t('feed:postedOn')}</Box>
      <Link href={getURL(owner)} sx={{ fontSize, overflowWrap: 'anywhere' }}>
        {owner.name}
      </Link>
    </Box>
  );
};

PostedOn.propTypes = {
  owner: NodeType,
  author: NodeType,
  // The author's name's size beside it, where the card sets one of its own.
  fontSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default PostedOn;
