import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import {
  Link as RouterLink, Navigate, useNavigate, useParams,
} from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import ActorHeader from './ActorHeader';
import BlockedNotice from './BlockedNotice';
import ActorBody from './Body';
import ActorsFollowRequests from './FollowRequests';
import ActorsBrowseFeature from '../Browse/Gadget';
import Admins from './Admins';
import Avatar from './Avatar';
import ActorControls from './Controls';
import Cover from '../../cover';

import ControlFollow from '../../controls/Follow';
import ControlFollowRequest from '../../controls/FollowRequest';
import ControlInviteAnswer from '../../controls/InviteAnswer';
import ActorInvite from '../Invite';
import EventDateTile from '../../../components/EventDateTile';
import EventAnswer from '../../events/Answer';
import EventPanel from '../../events/Panel';
import EventWhen from '../../events/When';
import EventsHosted from '../../events/Hosted';
import LimitedActorCard from '../../../components/LimitedActorCard';
import BackToTop from '../../../components/BackToTop';
import FeedViewToggle from '../../../components/FeedViewToggle';
import useFeedView, { PROFILES } from '../../feeds/useFeedView';
import LocationsGadget from '../../locations/Gadget';
import MediaBrowse from '../../media/Browse';
import Progress from '../../../components/Progress';
import FeedActorBrowse from '../../feed/Actor';
import HeaderMeta from '../../../components/HeaderMeta';

import actions from '../../../actions';
import permissions from '../../../permissions/actor';
import reportPermissions from '../../../permissions/report';
import api from '../../../api';
import utils from '../../../utils';
import i18n from '../../../languages';
import { Actor as ACTOR } from '../../../constants';

import ActorsType from '../../../proptypes/Actors';
import PersonType from '../../../proptypes/Person';
import { canRefuseAccount } from '../../moderation/useRefuseAccount';

const {
  getPortraitURL,
  getActorFeatureTabs,
} = utils.node;

const { TAB_COMPONENTS } = ACTOR;

// What somebody shown only the outside of a profile can do about it.
//
//   - Invited, to a group or an event: Decline and Accept.
//   - Let into an event as a follower of the group hosting it: Maybe and
//     Going. Nobody asked them one by one, so there is nothing to decline.
//   - Otherwise, where the profile lets people ask: Request to follow.
//
// `reload` reads the profile again, which opens it once they are in.
const limitedAction = (actor, reload) => {
  if (actor.isInvited) {
    return (
      <ControlInviteAnswer
        actor={actor}
        onAnswered={(accepted) => {
          if (accepted) {
            reload();
          }
        }}
      />
    );
  }

  if (actor.viaHost && actor.event) {
    return <EventAnswer actor={actor} onAnswered={reload} />;
  }

  return actor.allowFollowRequest ? <ControlFollowRequest actor={actor} /> : null;
};

const limitedNote = (actor) => {
  if (actor.isInvited) {
    return i18n.t('socialgraph:invite.invited');
  }

  return actor.viaHost ? i18n.t('events:event.viaHost') : '';
};

// Whether the profile kept is the one the address asks for: a person by
// their handle, whatever its case, and anything else by its id.
export const isProfileAsked = (actor, id, namespace) => {
  if (!actor || !actor.id || !id) {
    return false;
  }
  if (String(actor.id) === String(id)) {
    return true;
  }
  return namespace === 'people' && Boolean(actor.alias) &&
    actor.alias.toLowerCase() === String(id).toLowerCase();
};

const ActorsRead = (props) => {
  const {
    namespace,
    readItem,
    items: {
      current: actor,
    },
    viewer,
    isAuthenticated,
    isFetching,
    error,
    // From /@alias (ByHandle), which has found the profile already: its
    // id (a person's alias), its tab, and the address its tabs are under.
    routeId = '',
    routeTab = undefined,
    routeSubtab = undefined,
    basePath = '',
  } = props;

  const params = useParams();
  const navigate = useNavigate();
  const feedView = useFeedView(PROFILES);
  const slug = routeId || params.id;
  const tab = routeId ? routeTab : params.tab;
  const subtab = routeId ? routeSubtab : params.subtab;
  // A person is read by alias, whole: an alias may have a hyphen in it. A
  // group or an event by the id at the front of its address, 12-garden.
  const id = namespace === 'people' ? slug : slug.split('-')[0];
  const base = basePath || `/${namespace}/${slug}`;

  useEffect(() => {
    readItem(id);
  }, [id, namespace]);

  // The profile kept in the store is the last one read, which until the new
  // one arrives is the one before: somebody else's, or the viewer's own,
  // under this address, their name and their picture on a stranger's page
  // (the user, 2026-11-07). Shown only once it is the one asked for. One
  // read that comes back after a later one would put the earlier profile
  // back; it is then asked for once more.
  const isAsked = isProfileAsked(actor, id, namespace);
  const askedAgain = useRef('');
  useEffect(() => {
    if (actor.id && !isAsked && !isFetching && askedAgain.current !== id) {
      askedAgain.current = id;
      readItem(id);
    }
  }, [actor.id, isAsked, isFetching, id]);

  // Somebody on the fediverse is read again from their server when what
  // was kept of them is old, and the page with it: whether they approve
  // their followers changes the button (roadmap row 130). Nobody has to
  // know to look them up again. Once each time the page is opened.
  const refreshedFor = useRef(0);
  useEffect(() => {
    const fromMastodon = typeof actor.type === 'string' &&
      actor.type.includes('.activitypub-service.person');
    if (!isAuthenticated || !isAsked || !fromMastodon || refreshedFor.current === actor.id) {
      return;
    }
    refreshedFor.current = actor.id;
    api.federation.refreshPerson(actor).then(({ data }) => {
      if (data && data.refreshed) {
        readItem(id);
      }
    }).catch(() => {});
  }, [actor.id, isAsked, isAuthenticated]);

  // While it is open, the + button posts here, when the viewer may
  // (roadmap row 99): to their own profile, or a group or an event that
  // takes their posts.
  const dispatch = useDispatch();
  const mayPost = Boolean(isAuthenticated && actor.id &&
    utils.node.getComposers(actor).length > 0);
  useEffect(() => {
    if (!mayPost) {
      return undefined;
    }
    dispatch(actions.composeTarget.set(actor));
    return () => {
      dispatch(actions.composeTarget.clear(actor.id));
    };
  }, [mayPost, actor.id, actor.authorized]);

  if (!actor.id || !isAsked) {
    if (isFetching || (actor.id && !error)) {
      return (
        <Progress />
      );
    }

    if (error !== '') {
      return (
        <Navigate to="/404/" replace />
      );
    }

    return null;
  }

  // A profile the viewer may not see, which lets people ask to follow it.
  // The server sent its name and picture, and that is the page.
  if (actor.restricted) {
    return (
      <Grid container sx={{ justifyContent: 'center' }}>
        <Grid size={{ xs: 12, sm: 8, md: 6 }}>
          <LimitedActorCard
            actor={actor}
            // Somebody invited answers the invitation, and on saying yes
            // is shown the profile. Anybody else may ask, where the
            // profile lets people ask.
            action={isAuthenticated && limitedAction(actor, () => {
              readItem(id);
            })}
            note={limitedNote(actor)}
            // Somebody invited to an event is told what it is and when.
            extra={actor.event ?
              <>
                <EventWhen event={actor.event} />
                {actor.body &&
                  <Typography variant="body2" dir="auto" sx={{ pt: 1, whiteSpace: 'pre-wrap' }}>
                    {actor.body}
                  </Typography>}
              </> :
              null}
          />
        </Grid>
      </Grid>
    );
  }

  const canEdit = permissions.canEdit(actor);
  const canAdminister = permissions.canAdminister(actor);
  const canFollow = permissions.canFollow(actor, viewer);

  // An event is answered, Going or Maybe, from its own panel. That is
  // following it, so there is no Follow button beside.
  const isEvent = namespace === 'events';
  // Somebody the viewer has blocked: their profile says so, with the way
  // back, in place of what they post; nothing to follow.
  const isBlocked = isAuthenticated && Boolean(actor.isBlockedByViewer);
  // Somebody from another server who moved their account: followed at
  // their new profile, which takes the place of + Follow.
  const movedTo = actor.movedTo && actor.movedTo.alias ? actor.movedTo : null;
  const showFollow = isAuthenticated && canFollow && !isEvent && !isBlocked && !movedTo;
  // Inviting follows the group's "who can invite" setting, which the
  // server answers as authorized.invite.
  const showInvite = isAuthenticated && Boolean(actor.authorized && actor.authorized.invite);
  // Invited to a group the viewer can already see: answered from here.
  const showInviteAnswer = isAuthenticated && Boolean(actor.isInvited) && !actor.isLeadingViewer;
  // Super administrators see the menu on every profile, for Feature, even
  // where they do not administer the actor.
  // And anybody signed in sees it on somebody else's profile, where it
  // holds Block and Report.
  // And an administrator on a profile from another network, for Refuse on
  // this site.
  const showCommands = isAuthenticated && (
    canAdminister ||
    permissions.canFeature(actor, viewer) ||
    reportPermissions.canAdd(viewer, actor) ||
    canRefuseAccount(viewer, actor)
  );
  // A website is public and followed outright: nobody asks.
  const showFollowRequests = isAuthenticated && canAdminister && namespace !== 'websites';
  const FollowRequests = ActorsFollowRequests(namespace);
  const featureTabs = getActorFeatureTabs(actor);

  const tabPanels = {};

  // eslint-disable-next-line no-shadow
  featureTabs.forEach((tab) => {
    const componentType = TAB_COMPONENTS[tab];

    if (componentType === 'actor') {
      tabPanels[tab] = (
        <ActorsBrowseFeature
          key={`actor-browse-${tab}`}
          namespace={tab}
          owner={actor}
        />
      );
    }

    // Audio posts are video-service's, listed from its address with
    // ?type=audio and kept with the videos (roadmap row 137).
    if (componentType === 'medium' && tab === 'audio') {
      const MediaFeature = MediaBrowse('videos');
      tabPanels[tab] = (
        <MediaFeature
          key={`medium-browse-${tab}`}
          tab={tab}
          queryFilters={{ oid: actor.id, type: 'audio' }}
        />
      );
    } else if (componentType === 'medium') {
      const MediaFeature = MediaBrowse(tab);
      tabPanels[tab] = (
        <MediaFeature
          key={`medium-browse-${tab}`}
          queryFilters={{ oid: actor.id }}
        />
      );
    }
  });

  return (
    <>
      <HeaderMeta
        title={actor.name}
        description={actor.body}
        image={getPortraitURL(actor, 'large')}
      />
      <ActorHeader
        cover={
          <Cover
            node={actor}
            canEdit={canEdit}
            band
          />
        }
        // An event has no avatar to show or to upload: its cover is its
        // picture, and where the avatar would be is the day it is on.
        avatar={isEvent ?
          <EventDateTile actor={actor} size="large" /> :
          <Avatar
            node={actor}
            canEdit={canEdit}
            viewable={!isBlocked}
          />}
        actor={actor}
        // A cover, or the band to put one in for whoever may: the picture
        // overlaps either, so putting one up or taking it down moves nothing.
        hasCover={Boolean(utils.node.getCoverURL(actor)) || canEdit}
        viewToggle={feedView.isWide && !isBlocked &&
          <FeedViewToggle view={feedView.view} onChoose={feedView.chooseView} />}
        // /people/ana/socialgraph/leaders was a tab of the profile. It now
        // opens the profile with that list showing.
        socialgraphOpenOn={tab === 'socialgraph' ? (subtab || 'followers') : ''}
        muted={isBlocked}
        followAction={
          <>
            {showInvite && <ActorInvite actor={actor} canSeeWaiting={canAdminister} />}
            {showFollowRequests && <FollowRequests actor={actor} />}
            {showInviteAnswer &&
              <Box sx={{ minWidth: 240 }}>
                <ControlInviteAnswer
                  actor={actor}
                  onAnswered={(accepted) => {
                    if (accepted) {
                      readItem(id);
                    }
                  }}
                />
              </Box>}
            {showFollow && !showInviteAnswer && <ControlFollow actor={actor} prominent />}
            {movedTo && !isBlocked &&
              <Button
                variant="contained"
                component={RouterLink}
                to={`/@${movedTo.alias}/`}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {i18n.t('socialgraph:moved.view')}
              </Button>}
          </>
        }
        headerActions={showCommands &&
          <ActorControls
            actor={actor}
            viewer={viewer}
            isAuthenticated={isAuthenticated}
            onChanged={() => {
              readItem(id);
            }}
          />}
      />
      {isEvent &&
        <EventPanel
          actor={actor}
          onChanged={() => {
            readItem(id);
          }}
        />}
      {isBlocked &&
        <BlockedNotice
          actor={actor}
          onChanged={() => {
            readItem(id);
          }}
        />}
      {!isBlocked &&
      <ActorBody
        actor={actor}
        feedView={feedView}
        events={namespace === 'groups' && actor.id &&
        <EventsHosted
          group={actor}
          canAdd={isAuthenticated && canAdminister}
          key={`hosted-events-${actor.id}`}
        />}
        viewer={viewer}
        selectedTab={tab}
        tabPanels={tabPanels}
        admins={actor.administrators &&
        <Admins actor={actor} />}
        onTabChange={(newTab) => {
          navigate(newTab ? `${base}/${newTab}` : base, { state: { keepPlace: true } });
        }}
        feed={actor.id &&
        <FeedActorBrowse
          actor={actor}
          filter="posts"
          key={`feed-posts-${actor.id}`}
        />}
        replies={actor.id &&
        <FeedActorBrowse
          actor={actor}
          filter="replies"
          key={`feed-replies-${actor.id}`}
        />}
        reposts={actor.id &&
        <FeedActorBrowse
          actor={actor}
          filter="reposts"
          key={`feed-reposts-${actor.id}`}
        />}
        tagged={actor.id &&
        <FeedActorBrowse
          actor={actor}
          filter="tagged"
          key={`feed-tagged-${actor.id}`}
        />}
          // A profile from another server too (the user, 2026-10-19): the
          // site's administrators may say where an organisation there is,
          // as they may for any profile here. Nobody else sees an empty card.
        locations={actor.id &&
        <LocationsGadget
          node={actor}
          viewer={viewer}
          hideWhenEmpty={utils.federation.isRemote(actor)}
        />}
      />}
      <BackToTop />
    </>
  );
};

ActorsRead.propTypes = {
  readItem: PropTypes.func.isRequired,
  routeId: PropTypes.string,
  routeTab: PropTypes.string,
  routeSubtab: PropTypes.string,
  basePath: PropTypes.string,
  items: ActorsType.isRequired,
  viewer: PersonType.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  namespace: PropTypes.string.isRequired,
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
};

const mapStateToProps = (namespace) => {
  return (state) => {
    const {
      isFetching,
      error,
    } = state[namespace];

    const {
      isAuthenticated,
      viewer,
    } = state.session;

    return {
      items: state[namespace][namespace],
      namespace,
      error,
      isAuthenticated,
      viewer,
      isFetching,
    };
  };
};

const mapDispatchToProps = (namespace) => {
  return (dispatch) => {
    return {
      readItem: (id) => {
        return dispatch(actions[namespace].read(id, namespace));
      },
    };
  };
};

export default (namespace) => {
  return connect(
    mapStateToProps(namespace),
    mapDispatchToProps(namespace),
  )(ActorsRead);
};
