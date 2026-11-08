import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

import Invites from '../auth/Invites';
import utils from '../../utils';

const { isAdmin } = utils.node;

// /invites, which is two pages depending on who opens it.
//
// An administrator's invitations are a tab in the administration area.
// A member who may invite (INVITES_FROM) has no administration area, so
// for them this address is still the page itself.
const InvitesPage = () => {
  const viewer = useSelector((state) => {
    return state.session.viewer;
  });
  const location = useLocation();

  // What the page was asked to do, as opening the form from People's +,
  // goes with it.
  if (isAdmin(viewer)) {
    return <Navigate to="/admin/invites" replace state={location.state} />;
  }

  return <Invites />;
};

export default {
  InvitesPage,
};
