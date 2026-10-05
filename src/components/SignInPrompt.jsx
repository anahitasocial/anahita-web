import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import i18n from '../languages';

// A line where something was held back from a visitor, offering the way
// to it.
//
// An installation can show people who are not signed in only the start
// of what is public (SITE_READ_ACCESS=preview on the server). The server
// does the holding back: a post's text arrives already cut, comments and
// follower lists are refused. This is what stands where the rest would
// be, so a cut post does not read as one that ends mid-thought and a
// missing list does not read as an empty one.
//
// `what` picks the wording:
//   readMore   under a post that was cut
//   comments   where a post's comments would be
//   followers  where a list of who follows whom would be
//
// `show` is so it can sit under every post without a condition around
// it: a post that is whole passes false and nothing is drawn.
const SignInPrompt = ({
  what = 'readMore',
  show = true,
}) => {
  if (!show) {
    return null;
  }

  return (
    <Typography variant="body2" sx={{ mt: 1 }}>
      <Link component={RouterLink} to="/auth" underline="hover">
        {i18n.t(`home:preview.${what}`)}
      </Link>
    </Typography>
  );
};

SignInPrompt.propTypes = {
  what: PropTypes.oneOf(['readMore', 'comments', 'followers']),
  show: PropTypes.bool,
};

export default SignInPrompt;
