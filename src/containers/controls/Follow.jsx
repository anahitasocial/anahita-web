import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FollowIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import UnfollowIcon from '@mui/icons-material/PersonRemoveOutlined';

import MenuItemLabel from '../../components/MenuItemLabel';

import actions from '../../actions/socialgraph';
import PersonType from '../../proptypes/Person';
import i18n from '../../languages';
import socialgraph from '../../utils/socialgraph';

const ControlsFollow = React.forwardRef((props, ref) => {
  const {
    followActor,
    unfollowActor,
    actor,
    component = 'button',
    // "Follow back" for somebody who already follows the viewer: it says
    // what pressing it would make of the two of them.
    followLabel = i18n.t(socialgraph.followLabelKey(props.actor)),
    unfollowLabel = i18n.t('actions:unfollow'),
    viewer,
  } = props;

  const [leader, setLeader] = useState(actor.isLeadingViewer);
  const [waiting, setWaiting] = useState(false);

  const handleFollow = () => {
    setWaiting(true);
    followActor({ actor, viewer })
      .then(() => {
        setWaiting(false);
        setLeader(true);
      });
  };

  const handleUnfollow = () => {
    setWaiting(true);
    unfollowActor({ actor, viewer })
      .then(() => {
        setWaiting(false);
        setLeader(false);
      });
  };

  const title = leader ? unfollowLabel : followLabel;
  const onClick = leader ? handleUnfollow : handleFollow;
  const color = leader ? 'inherit' : 'primary';

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
      ref={ref}
    >
      {title}
    </Button>
  );
});

ControlsFollow.propTypes = {
  followActor: PropTypes.func.isRequired,
  unfollowActor: PropTypes.func.isRequired,
  actor: PropTypes.object.isRequired,
  component: PropTypes.oneOf(['button', 'menuitem']),
  followLabel: PropTypes.string,
  unfollowLabel: PropTypes.string,
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
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ControlsFollow);
