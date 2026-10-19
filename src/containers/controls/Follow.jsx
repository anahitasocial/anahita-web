import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import FollowIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import UnfollowIcon from '@mui/icons-material/PersonRemoveOutlined';

import MenuItemLabel from '../../components/MenuItemLabel';

import actions from '../../actions/socialgraph';
import appActions from '../../actions/app';
import utils from '../../utils';
import PersonType from '../../proptypes/Person';
import i18n from '../../languages';

const ControlsFollow = React.forwardRef((props, ref) => {
  const {
    followActor,
    unfollowActor,
    alertError,
    actor,
    component = 'button',
    // One word wherever anything is followed, a profile, a hashtag or a
    // place, with a plus before it on a button.
    // Left out, "Follow", or "Follow back" for somebody who follows the
    // viewer already.
    followLabel = '',
    unfollowLabel = i18n.t('actions:unfollow'),
    viewer,
    // The width of what it is in, for a row of buttons of one width.
    fullWidth = false,
    // How the button is drawn, where the place it is in wants more than
    // the plain one: 'outlined' beside another outlined button.
    variant = 'text',
    // The one thing to do on a profile's header: filled while not
    // following, outlined once following. Overrides `variant`.
    prominent = false,
  } = props;

  const [leader, setLeader] = useState(actor.isLeadingViewer);
  const [waiting, setWaiting] = useState(false);

  // A follow or an unfollow that fails gives the button back and says so,
  // in a sentence (the user, 2026-10-19). It used to wait for ever: the
  // failure was never caught, and nothing was said.
  const failed = (key) => {
    return () => {
      setWaiting(false);
      alertError(i18n.t(`socialgraph:${key}`, { name: utils.node.getActorName(actor) }));
    };
  };

  const handleFollow = () => {
    setWaiting(true);
    followActor({ actor, viewer })
      .then(() => {
        setWaiting(false);
        setLeader(true);
      })
      .catch(failed('followFailed'));
  };

  const handleUnfollow = () => {
    setWaiting(true);
    unfollowActor({ actor, viewer })
      .then(() => {
        setWaiting(false);
        setLeader(false);
      })
      .catch(failed('unfollowFailed'));
  };

  const askLabel = followLabel ||
    i18n.t(actor.isFollowingViewer ? 'actions:followBack' : 'actions:follow');
  const title = leader ? unfollowLabel : askLabel;
  const onClick = leader ? handleUnfollow : handleFollow;
  const color = leader ? 'inherit' : 'primary';
  let drawn = variant;
  if (prominent) {
    drawn = leader ? 'outlined' : 'contained';
  }

  if (component === 'menuitem') {
    return (
      <MenuItem
        onClick={onClick}
        disabled={waiting}
        ref={ref}
      >
        <MenuItemLabel icon={leader ? <UnfollowIcon fontSize="small" /> : <FollowIcon fontSize="small" />}>
          {title}
        </MenuItemLabel>
      </MenuItem>
    );
  }

  return (
    <Button
      onClick={onClick}
      disabled={waiting}
      color={color}
      fullWidth={fullWidth}
      variant={drawn}
      startIcon={leader ? null : <AddIcon />}
      ref={ref}
    >
      {title}
    </Button>
  );
});

ControlsFollow.propTypes = {
  followActor: PropTypes.func.isRequired,
  unfollowActor: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
  actor: PropTypes.object.isRequired,
  component: PropTypes.oneOf(['button', 'menuitem']),
  followLabel: PropTypes.string,
  unfollowLabel: PropTypes.string,
  fullWidth: PropTypes.bool,
  variant: PropTypes.oneOf(['text', 'outlined', 'contained']),
  prominent: PropTypes.bool,
  viewer: PersonType.isRequired,
};

const mapStateToProps = (state) => {
  const {
    viewer,
  } = state.session;

  return {
    viewer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    followActor: (params) => {
      return dispatch(actions.follow(params));
    },
    unfollowActor: (params) => {
      return dispatch(actions.unfollow(params));
    },
    alertError: (message) => {
      return dispatch(appActions.alert.error(message));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ControlsFollow);
