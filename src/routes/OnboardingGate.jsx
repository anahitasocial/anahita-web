import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

import agreementsUtil from '../utils/agreements';
import onboardingUtil from '../utils/onboarding';
import isReachable from './reachable';

// Sends a signed-in person with an incomplete profile to /onboarding, once.
//
// Sits inside AgreementsGate, for the same reason that one wraps the whole
// route table: the dashboard is rendered at / without passing through
// AuthenticatedRoute. And it stands aside while the terms are outstanding, so
// the agreements always come first and the two gates never send somebody back
// and forth between them.
//
// Like AgreementsGate, a gate on the interface, not on the API.

const OnboardingGate = ({ children }) => {
  const location = useLocation();

  // Three selectors rather than one returning an object; see AgreementsGate.
  const viewer = useSelector((state) => { return state.session.viewer; });
  const isAuthenticated = useSelector((state) => { return state.session.isAuthenticated; });
  const isResolved = useSelector((state) => { return state.session.isResolved; });

  // Only on the session as READ. The cached viewer from before somebody
  // finished onboarding has no onboardedAt, and would send them back for one
  // render on every reload.
  if (!isResolved || !isAuthenticated) {
    return children;
  }

  if (agreementsUtil.hasOutdatedTerms(viewer)) {
    return children;
  }

  if (onboardingUtil.needsOnboarding(viewer) && !isReachable(location.pathname, '/onboarding')) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

OnboardingGate.propTypes = {
  children: PropTypes.node.isRequired,
};

export default OnboardingGate;
