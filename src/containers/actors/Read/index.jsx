import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import ActorHeader from './ActorHeader';
import BlockedNotice from './BlockedNotice';
import ActorBody from './Body';
import ActorsFollowRequests from './FollowRequests';
import ActorsBrowseFeature from '../Browse/Gadget';
import Admins from './Admins';
import Avatar from './Avatar';
import Composers from '../../media/Composer';
import ActorControls from './Controls';
import Cover from '../../cover';
import NotificationsDialog from '../Notifications/Dialog';

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
import LocationsGadget from '../../locations/Gadget';
import MediaBrowse from '../../media/Browse';
import Progress from '../../../components/Progress';
import FeedActorBrowse from '../../feed/Actor';
import HeaderMeta from '../../../components/HeaderMeta';

import actions from '../../../actions';
import permissions from '../../../permissions/actor';
import reportPermissions from '../../../permissions/report';
import utils from '../../../utils';
import i18n from '../../../languages';
import { Actor as ACTOR } from '../../../constants';

import ActorsType from '../../../proptypes/Actors';
import PersonType from '../../../proptypes/Person';

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

  if (!actor.id) {
    if (isFetching) {
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
  const showFollow = isAuthenticated && canFollow && !isEvent && !isBlocked;
  // Inviting follows the group's "who can invite" setting, which the
  // server answers as authorized.invite.
  const showInvite = isAuthenticated && Boolean(actor.authorized && actor.authorized.invite);
  // Invited to a group the viewer can already see: answered from here.
  const showInviteAnswer = isAuthenticated && Boolean(actor.isInvited) && !actor.isLeadingViewer;
  // Super administrators see the menu on every profile, for Feature, even
  // where they do not administer the actor.
  // And anybody signed in sees it on somebody else's profile, where it
  // holds Block and Report.
  const showCommands = isAuthenticated && (
    canAdminister ||
    permissions.canFeature(actor, viewer) ||
    reportPermissions.canAdd(viewer, actor)
  );
  const showEditNotifications = isAuthenticated && actor.isLeader;
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

    if (componentType === 'medium') {
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
          />
        }
        // An event has no avatar to show or to upload: its cover is its
        // picture, and where the avatar would be is the day it is on.
        avatar={isEvent ?
          <EventDateTile actor={actor} size="large" /> :
          <Avatar
            node={actor}
            canEdit={canEdit}
          />}
        actor={actor}
        hasCover={Boolean(utils.node.getCoverURL(actor))}
        // /people/ana/socialgraph/leaders was a tab of the profile. It now
        // opens the profile with that list showing.
        socialgraphOpenOn={tab === 'socialgraph' ? (subtab || 'followers') : ''}
        muted={isBlocked}
        followAction={
          <>
            {showEditNotifications && <NotificationsDialog actor={actor} />}
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
        composers={isAuthenticated && actor.id && viewer.id &&
        <Composers actor={actor} />}
        onTabChange={(newTab) => {
          navigate(newTab ? `${base}/${newTab}` : base);
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
          // Not for somebody on another server: where they are is theirs
          // to say, and their server says nothing of it.
        locations={actor.id && !utils.federation.isRemote(actor) &&
        <LocationsGadget
          node={actor}
          viewer={viewer}
        />}
      />}
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
