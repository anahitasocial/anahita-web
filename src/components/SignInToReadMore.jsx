import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import i18n from '../languages';

// Under a post whose text the server cut short.
//
// An installation can show people who are not signed in only the start
// of what is public (SITE_READ_ACCESS=preview on the server). The cutting
// is done there: the text arrives already shortened, with `truncated`
// set on the post. This says so, and offers the way to the rest. Without
// it a cut post reads as a post that ends mid-thought.
//
// Renders nothing for a post that is whole, so it can sit under every
// post without a condition around it.
const SignInToReadMore = ({ truncated = false }) => {
  if (!truncated) {
    return null;
  }

  return (
    <Typography variant="body2" sx={{ mt: 1 }}>
      <Link component={RouterLink} to="/auth" underline="hover">
        {i18n.t('home:preview.readMore')}
      </Link>
    </Typography>
  );
};

SignInToReadMore.propTypes = {
  truncated: PropTypes.bool,
};

export default SignInToReadMore;
