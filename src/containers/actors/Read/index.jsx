import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import ActorHeader from './ActorHeader';
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
  } = props;

  const { id: slug, tab, subtab } = useParams();
  const navigate = useNavigate();
  const [id] = slug.split('-');

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
            action={isAuthenticated && (actor.isInvited ?
              <ControlInviteAnswer
                actor={actor}
                onAnswered={(accepted) => {
                  if (accepted) {
                    readItem(id);
                  }
                }}
              /> :
              actor.allowFollowRequest && <ControlFollowRequest actor={actor} />)}
            note={actor.isInvited ? i18n.t('socialgraph:invite.invited') : ''}
          />
        </Grid>
      </Grid>
    );
  }

  const canEdit = permissions.canEdit(actor);
  const canAdminister = permissions.canAdminister(actor);
  const canFollow = permissions.canFollow(actor, viewer);

  const showFollow = isAuthenticated && canFollow;
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
  const showFollowRequests = isAuthenticated && canAdminister;
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
        avatar={
          <Avatar
            node={actor}
            canEdit={canEdit}
          />
        }
        actor={actor}
        // /people/ana/socialgraph/leaders was a tab of the profile. It now
        // opens the profile with that list showing.
        socialgraphOpenOn={tab === 'socialgraph' ? (subtab || 'followers') : ''}
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
            {showFollow && !showInviteAnswer && <ControlFollow actor={actor} />}
          </>
        }
        headerActions={showCommands &&
          <ActorControls
            actor={actor}
            viewer={viewer}
            isAuthenticated={isAuthenticated}
          />}
      />
      <ActorBody
        actor={actor}
        viewer={viewer}
        selectedTab={tab}
        tabPanels={tabPanels}
        admins={actor.administrators &&
          <Admins actor={actor} />}
        composers={isAuthenticated && actor.id && viewer.id &&
          <Composers actor={actor} />}
        onTabChange={(newTab) => {
          navigate(newTab ? `/${namespace}/${slug}/${newTab}` : `/${namespace}/${slug}`);
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
        locations={actor.id &&
          <LocationsGadget
            node={actor}
            viewer={viewer}
          />}
      />
    </>
  );
};

ActorsRead.propTypes = {
  readItem: PropTypes.func.isRequired,
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
