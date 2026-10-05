import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import HomePage from '../containers/home';
import i18n from '../languages';
import membersOnly from './membersOnly';

// On a members-only installation, shows somebody who is not signed in a
// way in, in place of whatever page they asked for.
//
// The server decides this, not the app: with SITE_READ_ACCESS=registered
// every route that serves content answers 401 to them. Without this gate
// each page would load, ask, be refused, and show its own error. NodeInfo
// still answers on such a site and says which kind of site it is
// (`metadata.readAccess`), which is how the app knows before asking for
// anything else.
//
// The address is left as it is. Somebody following a link to a post sees
// the way in at that address, and is at the post once they are signed in.
//
// What stays reachable is in ./membersOnly.

const MembersOnlyGate = ({ children }) => {
  const location = useLocation();

  const isAuthenticated = useSelector((state) => { return state.session.isAuthenticated; });
  const isResolved = useSelector((state) => { return state.session.isResolved; });
  const readAccess = useSelector((state) => {
    const { nodeInfo } = state.app;
    return (nodeInfo && nodeInfo.metadata && nodeInfo.metadata.readAccess) || 'public';
  });

  // Until the session has been read there is no telling a member from a
  // visitor, and showing a member the door for a moment on every reload
  // would be worse than showing a visitor a page that then fails.
  if (readAccess !== 'registered' || !isResolved || isAuthenticated) {
    return children;
  }

  // Nothing on a members-only site is for a search engine, including the
  // pages that are open.
  const noIndex = (
    <Helmet>
      <meta name="robots" content="noindex" />
    </Helmet>
  );

  if (membersOnly.isOpen(location.pathname)) {
    return (
      <>
        {noIndex}
        {children}
      </>
    );
  }

  return (
    <>
      {noIndex}
      <Box sx={{ mb: 2 }}>
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" component={Link} to="/auth">
              {i18n.t('home:membersOnly.signIn')}
            </Button>
          }
        >
          <AlertTitle>{i18n.t('home:membersOnly.cTitle')}</AlertTitle>
          {i18n.t('home:membersOnly.cDescription')}
        </Alert>
      </Box>
      <HomePage />
    </>
  );
};

MembersOnlyGate.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MembersOnlyGate;
