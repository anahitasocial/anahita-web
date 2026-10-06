import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import AuthenticatedRoute from './AuthenticatedRoute';
import analytics from '../utils/analytics';

import AuthPage from '../containers/auth';

import HomePage from '../containers/home';

import Actors from '../containers/actors';
import ActorsRead from '../containers/actors/Read';
import ActorsAdd from '../containers/actors/Add';
import ActorsSettings from '../containers/actors/Settings';
import ActorsNotificationsEdit from '../containers/actors/Notifications/Edit';

import Blogs from '../containers/blogs';
import SupportPage from '../containers/support';
import LegalPage from '../containers/legal';
import AgreementsPage from '../containers/agreements';
import AgreementsGate from './AgreementsGate';
import OnboardingGate from './OnboardingGate';
import MembersOnlyGate from './MembersOnlyGate';
import OnboardingPage from '../containers/onboarding';

import Hashtags from '../containers/hashtags';
import HashtagsRead from '../containers/hashtags/Read';

import Locations from '../containers/locations';
import LocationsRead from '../containers/locations/Read';

import MediaRead from '../containers/media/Read';

import Notifications from '../containers/notifications/Browse';

import OAuthCallback from '../containers/OAuthCallback';

import People from '../containers/people/Browse';
import PeopleAdd from '../containers/people/Add';

import FeedsPage from '../containers/feeds';
import SavedPage from '../containers/saved';
import SearchPage from '../containers/search/Browse';
import About from '../containers/about';
import Admin from '../containers/admin';
import Settings from '../containers/settings';
import AdminRedirects from '../containers/admin/Redirects';
import StaticPage from '../containers/page';
import NotFoundPage from '../containers/NotFound';

const GroupsBrowse = Actors('groups');
const GroupsRead = ActorsRead('groups');
const GroupsAdd = ActorsAdd('groups');
const GroupsSettings = ActorsSettings('groups');
const GroupsNotificationsEdit = ActorsNotificationsEdit('groups');

const PeopleRead = ActorsRead('people');
const PeopleSettings = ActorsSettings('people');
const PeopleNotificationsEdit = ActorsNotificationsEdit('people');

// Sends an old per-card settings URL to the section that card now lives in,
// keeping the :id it arrived with. replace, so the back button skips the
// redirect instead of bouncing off it.
const SettingsSectionRedirect = ({ section }) => {
  const { id } = useParams();
  return <Navigate to={`/people/${id}/settings/${section}`} replace />;
};

SettingsSectionRedirect.propTypes = {
  section: PropTypes.string.isRequired,
};

const ArticlesRead = MediaRead('articles');

const NotesRead = MediaRead('notes');

const PhotosRead = MediaRead('photos');

const TopicsRead = MediaRead('topics');

const AppRoutes = () => {
  const isAuthenticated = useSelector((state) => {
    return state.session.isAuthenticated;
  });
  const location = useLocation();

  // Analytics is off unless the build configures it; see utils/analytics.js.
  // start runs once, and hands back the function that records a page view.
  const pageview = useRef(null);
  if (pageview.current === null) {
    pageview.current = analytics.start();
  }

  useEffect(() => {
    pageview.current(location.pathname + location.search);
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <MembersOnlyGate>
      <AgreementsGate>
        <OnboardingGate>
          <Routes>
            <Route path="/oauth/callback" element={<OAuthCallback />} />

            <Route
              path="/"
              element={isAuthenticated ? <FeedsPage /> : <HomePage />}
            />

            {/* Public, like /support and /legal below. Everything on it is
            already world-readable in /nodeinfo/2.1, and the people who
            most need it — deciding whether to join — are the ones with no
            account to sign in with.

            It rendered HomePage behind AuthenticatedRoute before this: a
            placeholder that showed signed-in people the dashboard-or-home
            split and showed everybody else the login screen. */}
            <Route path="/about" element={<About />} />

            <Route path="/blogs" element={<Blogs />} />
            {/* Public on purpose. The emails that link here go to somebody who
            cannot sign in, so gating it would make it reachable only by the
            people who do not need it. */}
            <Route path="/support" element={<SupportPage />} />
            <Route path="/search" element={<SearchPage />} />

            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/:tab" element={<AuthPage />} />

            <Route
              path="/dashboard"
              element={<Navigate to="/" replace />}
            />

            {/* People — static paths before parameterized */}
            <Route path="/people" element={<People />} />
            <Route
              path="/people/add"
              element={
                <AuthenticatedRoute>
                  <PeopleAdd />
                </AuthenticatedRoute>
          }
            />
            {/* The password card now lives inside the Security section, so this
            redirects rather than selecting a tab. The URL is not ours to
            retire: it is in the username-change notification email.
            Password is the first card in that
            section, so the redirect arrives on it without scrolling. */}
            <Route
              path="/people/:id/settings/password"
              element={
                <AuthenticatedRoute>
                  <SettingsSectionRedirect section="security" />
                </AuthenticatedRoute>
          }
            />
            {/* One route for every section — account, security, privacy, danger.
            The section is in the path rather than local state so it survives
            a reload, can be shared, and works with the back button.

            /settings/account is covered by this and needs no alias: it was a
            legacy landing after the old Account tab was split up, and it is
            a real section again. */}
            <Route
              path="/people/:id/settings/:section"
              element={
                <AuthenticatedRoute>
                  <PeopleSettings />
                </AuthenticatedRoute>
          }
            />
            <Route
              path="/people/:id/settings"
              element={
                <AuthenticatedRoute>
                  <PeopleSettings />
                </AuthenticatedRoute>
          }
            />
            <Route
              path="/people/:id/notifications"
              element={
                <AuthenticatedRoute>
                  <PeopleNotificationsEdit />
                </AuthenticatedRoute>
          }
            />
            <Route path="/people/:id/:tab/:subtab" element={<PeopleRead />} />
            <Route path="/people/:id/:tab" element={<PeopleRead />} />
            <Route path="/people/:id" element={<PeopleRead />} />

            {/* Groups — static paths before parameterized */}
            <Route path="/groups" element={<GroupsBrowse />} />
            <Route
              path="/groups/add"
              element={
                <AuthenticatedRoute>
                  <GroupsAdd />
                </AuthenticatedRoute>
          }
            />
            <Route
              path="/groups/:id/settings"
              element={
                <AuthenticatedRoute>
                  <GroupsSettings />
                </AuthenticatedRoute>
          }
            />
            <Route
              path="/groups/:id/notifications"
              element={
                <AuthenticatedRoute>
                  <GroupsNotificationsEdit />
                </AuthenticatedRoute>
          }
            />
            <Route path="/groups/:id/:tab/:subtab" element={<GroupsRead />} />
            <Route path="/groups/:id/:tab" element={<GroupsRead />} />
            <Route path="/groups/:id" element={<GroupsRead />} />

            {/* What the viewer saved. Reached from the left menu. */}
            <Route
              path="/saved"
              element={
                <AuthenticatedRoute>
                  <SavedPage />
                </AuthenticatedRoute>
          }
            />
            <Route
              path="/notifications"
              element={
                <AuthenticatedRoute>
                  <Notifications />
                </AuthenticatedRoute>
          }
            />
            {/* The administration area. One page, with the tab in the address
            so an email can link to the tab it is about. Which tabs appear,
            and whether the page opens at all, is decided by who is looking:
            see containers/admin/tabs. AuthenticatedRoute only establishes
            that somebody is signed in. */}
            <Route
              path="/admin"
              element={
                <AuthenticatedRoute>
                  <Admin />
                </AuthenticatedRoute>
          }
            />
            <Route
              path="/admin/:tab"
              element={
                <AuthenticatedRoute>
                  <Admin />
                </AuthenticatedRoute>
          }
            />
            {/* One thing inside a tab: a reported case, /admin/reports/12. */}
            <Route
              path="/admin/:tab/:id"
              element={
                <AuthenticatedRoute>
                  <Admin />
                </AuthenticatedRoute>
          }
            />

            {/* Site settings: super administrators only, and a page of its own
            for that reason. The administration area is what every
            administrator shares. The page checks the permission itself. */}
            <Route
              path="/settings"
              element={
                <AuthenticatedRoute>
                  <Settings />
                </AuthenticatedRoute>
          }
            />

            {/* Where the signup queue used to live, kept so bookmarks and
            links in mail already sent still arrive.
            /settings/signup-requests never existed as a page: it is the
            address the signup-request email carried by mistake. */}
            <Route
              path="/settings/signup-requests"
              element={<Navigate to="/admin/signup-requests" replace />}
            />
            <Route
              path="/signup-requests"
              element={<Navigate to="/admin/signup-requests" replace />}
            />

            {/* Still a page of its own for a member who may invite; a tab in
            the administration area for an administrator. */}
            <Route
              path="/invites"
              element={
                <AuthenticatedRoute>
                  <AdminRedirects.InvitesPage />
                </AuthenticatedRoute>
          }
            />

            {/*
            Media types. A post has a page; a type does not. There is no list
            of every note or photo on the site: posts are found through feeds,
            search, hashtags and profiles. The bare paths used to be such
            lists, so they send an old bookmark home instead of to Not Found.
          */}
            <Route path="/articles" element={<Navigate to="/" replace />} />
            <Route path="/articles/:id" element={<ArticlesRead />} />

            <Route path="/notes" element={<Navigate to="/" replace />} />
            <Route path="/notes/:id" element={<NotesRead />} />

            <Route path="/photos" element={<Navigate to="/" replace />} />
            <Route path="/photos/:id" element={<PhotosRead />} />

            <Route path="/topics" element={<Navigate to="/" replace />} />
            <Route path="/topics/:id" element={<TopicsRead />} />

            <Route path="/hashtags" element={<Hashtags />} />
            <Route path="/hashtags/:alias" element={<HashtagsRead />} />

            <Route path="/locations" element={<Locations />} />
            <Route path="/locations/:id" element={<LocationsRead />} />

            {/* Legal documents. Public — people read the terms before they have an
            account, which is why the signup form links to them.

            The two /pages URLs redirect because every document anybody has
            accepted so far was linked from there, and a link in a sent email
            cannot be updated after the fact. */}
            {/* Where somebody behind on either legal document is sent. Signed-in
            only — there is nobody to record an acceptance for otherwise. */}
            <Route
              path="/agreements"
              element={
                <AuthenticatedRoute>
                  <AgreementsPage />
                </AuthenticatedRoute>
          }
            />
            {/* Where somebody with an incomplete profile is sent, once. */}
            <Route
              path="/onboarding"
              element={
                <AuthenticatedRoute>
                  <OnboardingPage />
                </AuthenticatedRoute>
          }
            />
            <Route path="/legal" element={<Navigate to="/legal/tos" replace />} />
            <Route path="/legal/:tab" element={<LegalPage />} />
            <Route path="/pages/tos" element={<Navigate to="/legal/tos" replace />} />
            <Route path="/pages/privacy" element={<Navigate to="/legal/privacy" replace />} />
            <Route path="/pages/:alias" element={<StaticPage />} />

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </OnboardingGate>
      </AgreementsGate>
    </MembersOnlyGate>
  );
};

export default AppRoutes;
