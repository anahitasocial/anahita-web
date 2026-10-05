import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import HomePage from '../containers/home';
import Progress from '../components/Progress';
import visitor from '../utils/visitor';
import i18n from '../languages';
import membersOnly from './membersOnly';

// On a members-only installation, shows somebody who is not signed in a
// way in, in place of whatever page they asked for.
//
// It also handles the setting between open and members-only, `preview`,
// where the pages stay and a notice goes above them; see below.
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
  const nodeInfoResolved = useSelector((state) => { return state.app.nodeInfoResolved; });
  const readAccess = useSelector((state) => { return visitor.readAccessOf(state); });

  // Kept for the next page load; see below.
  useEffect(() => {
    if (nodeInfoResolved) {
      visitor.rememberReadAccess(readAccess);
    }
  }, [nodeInfoResolved, readAccess]);

  // Somebody signed in is never held up or turned away here.
  if (isAuthenticated) {
    return children;
  }

  // Not known yet who is looking, or what kind of site this is: the
  // session is still being read, or NodeInfo has not answered.
  //
  // Drawing the page now means it asks the server for its content at
  // once. On a restricted site every one of those requests is refused,
  // and each page showed that as an error of its own before this gate
  // caught up and replaced it. So a page that could be refused waits,
  // for the moment the two answers take.
  //
  // Not on a site that said it was open last time, which is nearly all
  // of them: there the page is drawn straight away, as it always was.
  // If such a site has been closed since, this one load sees the old
  // behaviour and the next one waits.
  if (!isResolved || !nodeInfoResolved) {
    const drawNow = membersOnly.isOpen(location.pathname) ||
      visitor.rememberedReadAccess() === visitor.PUBLIC;

    return drawNow ? children : <Progress />;
  }

  // The middle setting: visitors are shown the start of what is public.
  // The pages work, so they are left in place, under a line saying that
  // this is not all of it. Not on the pages that are the same for
  // everybody: nothing there was cut.
  if (readAccess === 'preview') {
    if (membersOnly.isOpen(location.pathname)) {
      return children;
    }

    return (
      <>
        <Box sx={{ mb: 2 }}>
          <Alert
            severity="info"
            action={
              <Button color="inherit" size="small" component={Link} to="/auth">
                {i18n.t('home:preview.signIn')}
              </Button>
            }
          >
            <AlertTitle>{i18n.t('home:preview.cTitle')}</AlertTitle>
            {i18n.t('home:preview.cDescription')}
          </Alert>
        </Box>
        {children}
      </>
    );
  }

  if (readAccess !== 'registered') {
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
