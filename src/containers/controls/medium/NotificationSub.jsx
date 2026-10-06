import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MenuItem from '@mui/material/MenuItem';
import SubscribeIcon from '@mui/icons-material/NotificationsNoneOutlined';
import UnsubscribeIcon from '@mui/icons-material/NotificationsOffOutlined';

import MenuItemLabel from '../../../components/MenuItemLabel';

import actions from '../../../actions';
import MediumType from '../../../proptypes/Medium';
import i18n from '../../../languages';

const ControlsMediumNotification = React.forwardRef(({
  subscribe,
  unsubscribe,
  medium,
  isSubscribedByViewer = false,
  subscribeLabel = i18n.t('actions:subscribe'),
  unsubscribeLabel = i18n.t('actions:unsubscribe'),
  isFetching,
}, ref) => {
  const [subscribed, setSubscribed] = useState(isSubscribedByViewer);

  const handleSubscribe = () => {
    subscribe(medium).then(() => {
      setSubscribed(true);
    });
  };

  const handleUnsubscribe = () => {
    unsubscribe(medium).then(() => {
      setSubscribed(false);
    });
  };

  const title = subscribed ? unsubscribeLabel : subscribeLabel;
  const onClick = subscribed ? handleUnsubscribe : handleSubscribe;

  return (
    <MenuItem
      onClick={onClick}
      disabled={isFetching}
      ref={ref}
    >
      <MenuItemLabel icon={subscribed ? <UnsubscribeIcon fontSize="small" /> : <SubscribeIcon fontSize="small" />}>
        {title}
      </MenuItemLabel>
    </MenuItem>
  );
});

ControlsMediumNotification.propTypes = {
  subscribe: PropTypes.func.isRequired,
  unsubscribe: PropTypes.func.isRequired,
  medium: MediumType.isRequired,
  isSubscribedByViewer: PropTypes.bool,
  subscribeLabel: PropTypes.string,
  unsubscribeLabel: PropTypes.string,
  isFetching: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => {
  const {
    isFetching,
  } = state.notifications;

  return {
    isFetching,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    subscribe: (medium) => {
      return dispatch(actions.notifications.subs.add(medium));
    },
    unsubscribe: (medium) => {
      return dispatch(actions.notifications.subs.remove(medium));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ControlsMediumNotification);
