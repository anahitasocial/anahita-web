import React, {
  lazy, Suspense, useEffect, useRef,
} from 'react';
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
import PostDialog from './PostDialog';
import analytics from '../utils/analytics';
import Progress from '../components/Progress';

import HomePage from '../containers/home';
import AgreementsGate from './AgreementsGate';
import OnboardingGate from './OnboardingGate';
import MembersOnlyGate from './MembersOnlyGate';

import MediaRead from '../containers/media/Read';

import FeedsPage from '../containers/feeds';
import ShareDialog from '../containers/share/Dialog';
import NotFoundPage from '../containers/NotFound';

const AuthPage = lazy(() => { return import('../containers/auth'); });

const ActorByHandle = lazy(() => { return import('../containers/actors/ByHandle'); });
const GroupsAdd = lazy(() => { return import('../containers/actors/Add'); });

const SupportPage = lazy(() => { return import('../containers/support'); });
const LegalPage = lazy(() => { return import('../containers/legal'); });
const AgreementsPage = lazy(() => { return import('../containers/agreements'); });
const RulesPage = lazy(() => { return import('../containers/rules'); });
const OnboardingPage = lazy(() => { return import('../containers/onboarding'); });

const Hashtags = lazy(() => { return import('../containers/hashtags'); });
const HashtagsRead = lazy(() => { return import('../containers/hashtags/Read'); });

const Locations = lazy(() => { return import('../containers/locations'); });
const LocationsRead = lazy(() => { return import('../containers/locations/Read'); });

const Notifications = lazy(() => { return import('../containers/notifications/Browse'); });

const OAuthCallback = lazy(() => { return import('../containers/OAuthCallback'); });

const People = lazy(() => { return import('../containers/people/Browse'); });
const PeopleAdd = lazy(() => { return import('../containers/people/Add'); });
const CustomFeedsBrowse = lazy(() => { return import('../containers/feeds/Browse'); });
const CustomFeedAdd = lazy(() => { return import('../containers/feeds/Add'); });
const CustomFeedEdit = lazy(() => { return import('../containers/feeds/Edit'); });
const CustomFeedRead = lazy(() => { return import('../containers/feeds/Read'); });
const RecommendationsPage = lazy(() => { return import('../containers/recommendations'); });
const SavedPage = lazy(() => { return import('../containers/saved'); });
const EventsPage = lazy(() => { return import('../containers/events'); });
const EventAdd = lazy(() => { return import('../containers/events/Add'); });
const SearchPage = lazy(() => { return import('../containers/search/Browse'); });
const About = lazy(() => { return import('../containers/about'); });
const Admin = lazy(() => { return import('../containers/admin'); });
const Settings = lazy(() => { return import('../containers/settings'); });
// A lazy component is the module's default export, drawn as it is: one of
// several components in it is taken out here, or it renders as undefined.
const InvitesRedirect = lazy(() => {
  return import('../containers/admin/Redirects').then((module) => {
    return { default: module.default.InvitesPage };
  });
});
const StaticPage = lazy(() => { return import('../containers/page'); });
const WebsiteConnect = lazy(() => { return import('../containers/websites/Connect'); });

// Each page's code is fetched the first time it is opened, not with the app
// (roadmap row 128): the feed, the home page and a post are what nearly every
// visit begins with, and stay in the first script. Until a page has come,
// the progress bar shows where it will be.
//
// lazyMade is lazy for a page a function makes, as Actors('groups') makes a
// group's list: the function is called once its module has come.
const lazyMade = (load, namespace) => {
  return lazy(() => {
    return load().then((module) => {
      return { default: module.default(namespace) };
    });
  });
};

const GroupsBrowse = lazyMade(() => { return import('../containers/actors'); }, 'groups');
const GroupsRead = lazyMade(() => { return import('../containers/actors/Read'); }, 'groups');
const GroupsSettings = lazyMade(() => { return import('../containers/actors/Settings'); }, 'groups');

// A hashtag's page is told to other servers as /tags/<name>, where
// Mastodon and most of the fediverse have theirs, because some of the apps
// people read with know a hashtag's link by that shape. Whoever follows
// one lands here and is shown the page.
const HashtagMoved = () => {
  const { alias } = useParams();

  return <Navigate to={`/hashtags/${alias}`} replace />;
};

// Recommendations were at /suggestions before they were named as the
// service is. The old address leads to the new, with the tab it asked for
// (?kind=group), for links already made.
const SuggestionsMoved = () => {
  const { search } = useLocation();

  return <Navigate to={`/recommendations${search}`} replace />;
};

// An event is an actor like a group, so its page and its settings are the
// same containers told a different namespace.
// An event is changed in its settings, where its form is the Info tab. The
// page it used to have of its own leads there, for links already made.
const EventEditRedirect = () => {
  const { id } = useParams();

  return <Navigate to={`/events/${id}/settings`} replace />;
};

// A website is a website's feed as a profile, read and looked after as a
// group is. It is made by connecting a website, not by a form of its own.
const WebsitesBrowse = lazyMade(() => { return import('../containers/actors'); }, 'websites');
const WebsitesRead = lazyMade(() => { return import('../containers/actors/Read'); }, 'websites');
const WebsitesSettings = lazyMade(() => { return import('../containers/actors/Settings'); }, 'websites');

const EventsRead = lazyMade(() => { return import('../containers/actors/Read'); }, 'events');
const EventsSettings = lazyMade(() => { return import('../containers/actors/Settings'); }, 'events');

// An old address of a person's page, /people/ana/photos, sent to /@ana/photos.
const PeopleToHandle = () => {
  const { id, tab, subtab } = useParams();
  const rest = [tab, subtab].filter(Boolean).join('/');
  return <Navigate to={`/@${id}${rest ? `/${rest}` : ''}`} replace />;
};
const PeopleSettings = lazyMade(() => { return import('../containers/actors/Settings'); }, 'people');

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
const VideosRead = MediaRead('videos');
// An audio post is video-service's, read from its address (roadmap row
// 137), at /audio/12-a-title/ here.
const AudioRead = MediaRead('videos');

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

  // A post opened over a list (PostDialog): the list is what the routes go on
  // showing, and it keeps its place while the post is open, and after.
  const background = location.state && location.state.background;
  const lastBackground = useRef(null);

  useEffect(() => {
    pageview.current(location.pathname + location.search);

    const returned = lastBackground.current &&
      lastBackground.current.pathname === location.pathname &&
      lastBackground.current.search === location.search;
    lastBackground.current = background || null;

    // A tab has its own address, and moves nothing: the list that opens is
    // in the same place on the page.
    const stays = location.state && location.state.keepPlace;

    if (!background && !returned && !stays) {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <MembersOnlyGate>
      <AgreementsGate>
        <OnboardingGate>
          {/* The one share dialog, opened from any share button. */}
          <ShareDialog />
          <Suspense fallback={<Progress />}>
            <Routes location={background || location}>
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
              {/* A person's page is at their alias, /@ana: an old address
                is sent there, with its tab. */}
              <Route path="/people/:id/:tab/:subtab" element={<PeopleToHandle />} />
              <Route path="/people/:id/:tab" element={<PeopleToHandle />} />
              <Route path="/people/:id" element={<PeopleToHandle />} />

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
              {/* Events — static paths before parameterized. /events is
            what is on, for everybody, and the viewer's own lists. */}
              <Route path="/events" element={<EventsPage />} />
              <Route
                path="/events/add"
                element={
                  <AuthenticatedRoute>
                    <EventAdd />
                  </AuthenticatedRoute>
          }
              />
              <Route
                path="/events/:id/edit"
                element={<EventEditRedirect />}
              />
              <Route
                path="/events/:id/settings"
                element={
                  <AuthenticatedRoute>
                    <EventsSettings />
                  </AuthenticatedRoute>
          }
              />
              <Route path="/events/:id/:tab/:subtab" element={<EventsRead />} />
              <Route path="/events/:id/:tab" element={<EventsRead />} />
              <Route path="/events/:id" element={<EventsRead />} />

              {/* Websites — static paths before parameterized */}
              <Route path="/websites" element={<WebsitesBrowse />} />
              <Route
                path="/websites/connect"
                element={
                  <AuthenticatedRoute>
                    <WebsiteConnect />
                  </AuthenticatedRoute>
          }
              />
              <Route
                path="/websites/:id/settings"
                element={
                  <AuthenticatedRoute>
                    <WebsitesSettings />
                  </AuthenticatedRoute>
          }
              />
              <Route path="/websites/:id/:tab/:subtab" element={<WebsitesRead />} />
              <Route path="/websites/:id/:tab" element={<WebsitesRead />} />
              <Route path="/websites/:id" element={<WebsitesRead />} />

              <Route path="/groups/:id/:tab/:subtab" element={<GroupsRead />} />
              <Route path="/groups/:id/:tab" element={<GroupsRead />} />
              <Route path="/groups/:id" element={<GroupsRead />} />

              {/* Custom feeds: the viewer's list, making one, and a feed's own
            page. A public feed is read without signing in. Static paths
            before the parameterized one. */}
              <Route
                path="/feeds"
                element={
                  <AuthenticatedRoute>
                    <CustomFeedsBrowse />
                  </AuthenticatedRoute>
          }
              />
              {/* Where adding a feed was before it was called adding. */}
              <Route path="/feeds/new" element={<Navigate to="/feeds/add" replace />} />
              <Route
                path="/feeds/add"
                element={
                  <AuthenticatedRoute>
                    <CustomFeedAdd />
                  </AuthenticatedRoute>
          }
              />
              <Route
                path="/feeds/:id/edit"
                element={
                  <AuthenticatedRoute>
                    <CustomFeedEdit />
                  </AuthenticatedRoute>
          }
              />
              <Route path="/feeds/:id" element={<CustomFeedRead />} />

              {/* People and groups the viewer might follow. Reached from the
            card on the home page. */}
              <Route
                path="/recommendations"
                element={
                  <AuthenticatedRoute>
                    <RecommendationsPage />
                  </AuthenticatedRoute>
          }
              />
              {/* What the page was called first. The tab asked for goes
            with it. */}
              <Route path="/suggestions" element={<SuggestionsMoved />} />

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
                    <InvitesRedirect />
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

              <Route path="/videos" element={<Navigate to="/" replace />} />
              <Route path="/videos/:id" element={<VideosRead />} />

              <Route path="/audio" element={<Navigate to="/" replace />} />
              <Route path="/audio/:id" element={<AudioRead />} />

              <Route path="/topics" element={<Navigate to="/" replace />} />
              <Route path="/topics/:id" element={<TopicsRead />} />

              <Route path="/hashtags" element={<Hashtags />} />
              <Route path="/hashtags/:alias" element={<HashtagsRead />} />
              {/* What other servers are given for a hashtag's page, the address
            Mastodon has one at. See HashtagMoved. */}
              <Route path="/tags/:alias" element={<HashtagMoved />} />

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
              {/* The site's rules (roadmap row 102): where somebody behind on them
            is sent, after the agreements, to tick each; for anybody else, the
            rules to read. */}
              <Route path="/rules" element={<RulesPage />} />
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

              {/* A profile of any kind at its alias: /@ana, /@ana/photos.
                Anything else of one word is not found there. */}
              <Route path="/:handle/*" element={<ActorByHandle />} />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          {background &&
            <Routes>
              <Route path="/articles/:id" element={<PostDialog><ArticlesRead /></PostDialog>} />
              <Route path="/notes/:id" element={<PostDialog><NotesRead /></PostDialog>} />
              <Route path="/photos/:id" element={<PostDialog><PhotosRead /></PostDialog>} />
              <Route path="/videos/:id" element={<PostDialog><VideosRead /></PostDialog>} />
              <Route path="/audio/:id" element={<PostDialog><AudioRead /></PostDialog>} />
              <Route path="/topics/:id" element={<PostDialog><TopicsRead /></PostDialog>} />
            </Routes>}
        </OnboardingGate>
      </AgreementsGate>
    </MembersOnlyGate>
  );
};

export default AppRoutes;
