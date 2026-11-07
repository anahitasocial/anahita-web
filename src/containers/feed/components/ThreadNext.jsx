import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import i18n from '../../../languages';
import plainText from '../../../utils/plainText';

// A note that opens a thread, in a list (roadmap row 126): under its words,
// the next note of the thread, joined to it by a line as a thread is read,
// its words cut to three lines; then the way to the whole thread, with how
// many notes it has. The writer is the first note's, so is not said again.
// Its likes and replies are on the thread's page; the card's actions are
// the first note's.
const ThreadNext = ({ thread, next, url }) => {
  if (!thread || thread < 2) {
    return null;
  }

  const words = next ? plainText(next.content || next.body || '') : '';

  return (
    <Box sx={{ px: 2, pb: 2 }}>
      {words &&
        <Box
          sx={{
            borderLeft: 2,
            borderColor: 'divider',
            pl: 2,
            ml: 1,
            mb: 1,
          }}
        >
          <Typography
            variant="body2"
            lang={next.language || undefined}
            dir="auto"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              overflowWrap: 'anywhere',
            }}
          >
            {words}
          </Typography>
        </Box>}
      <Link component={RouterLink} to={url} variant="body2" underline="hover">
        {i18n.t('feed:thread.show', { count: thread })}
      </Link>
    </Box>
  );
};

ThreadNext.propTypes = {
  // How many notes the thread has, the first counted.
  thread: PropTypes.number,
  // The second note, as the list sends it.
  next: PropTypes.shape({
    content: PropTypes.string,
    body: PropTypes.string,
    language: PropTypes.string,
  }),
  // The thread's page: the first note's.
  url: PropTypes.string.isRequired,
};

export default ThreadNext;
