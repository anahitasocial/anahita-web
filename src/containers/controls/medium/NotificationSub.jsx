import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MenuItem from '@mui/material/MenuItem';
import SubscribeIcon from '@mui/icons-material/NotificationsNoneOutlined';
import UnsubscribeIcon from '@mui/icons-material/NotificationsOffOutlined';

import MenuItemLabel from '../../../components/MenuItemLabel';

import actions from '../../../actions';
import api from '../../../api';
import MediumType from '../../../proptypes/Medium';
import i18n from '../../../languages';

// Get notifications, in a post's menu: its replies are told to whoever
// asks (roadmap row 96, part 4), until they stop them.
const ControlsMediumNotification = React.forwardRef(({
  medium,
  isSubscribedByViewer = false,
  subscribeLabel = i18n.t('actions:subscribe'),
  unsubscribeLabel = i18n.t('actions:unsubscribe'),
  alertError,
}, ref) => {
  const [subscribed, setSubscribed] = useState(isSubscribedByViewer);
  const [busy, setBusy] = useState(false);

  const onClick = () => {
    setBusy(true);
    const asked = subscribed ?
      api.notificationsSub.deleteItem(medium) :
      api.notificationsSub.add(medium);
    asked.then(() => {
      setSubscribed(!subscribed);
    }).catch(() => {
      alertError(i18n.t('prompts:updated.error'));
    }).finally(() => {
      setBusy(false);
    });
  };

  return (
    <MenuItem
      onClick={onClick}
      disabled={busy}
      ref={ref}
    >
      <MenuItemLabel icon={subscribed ? <UnsubscribeIcon fontSize="small" /> : <SubscribeIcon fontSize="small" />}>
        {subscribed ? unsubscribeLabel : subscribeLabel}
      </MenuItemLabel>
    </MenuItem>
  );
});

ControlsMediumNotification.propTypes = {
  medium: MediumType.isRequired,
  isSubscribedByViewer: PropTypes.bool,
  subscribeLabel: PropTypes.string,
  unsubscribeLabel: PropTypes.string,
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(
  null,
  mapDispatchToProps,
)(ControlsMediumNotification);
