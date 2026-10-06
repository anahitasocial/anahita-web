import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MenuItem from '@mui/material/MenuItem';

import actions from '../../../actions';
import api from '../../../api';
import NodeType from '../../../proptypes/Node';
import i18n from '../../../languages';

// "Pin to profile" and "Unpin", in a post's menu.
//
// A pinned post leads the profile it is on. A profile has one pin, so
// pinning a post moves the pin to it from whichever post had it. Offered
// where the server said the viewer may: on their own profile, and in a
// group they administer.
const ControlsMediumPin = React.forwardRef(({
  medium,
  changed,
  alertSuccess,
  alertError,
  onDone = null,
}, ref) => {
  const [isWaiting, setIsWaiting] = useState(false);

  const pinned = Boolean(medium.pinned);
  const label = i18n.t(pinned ? 'media:pin.unpin' : 'media:pin.pin');

  const handleClick = () => {
    setIsWaiting(true);

    api.pins.set(medium, !pinned).then((result) => {
      // Told to every list on the page. With the owner the menu has: the
      // answer is the post as its own page shows it, and a feed's copy
      // of the owner is the one the lists are matched on.
      changed({
        ...result.data,
        owner: medium.owner || result.data.owner,
      });
      alertSuccess(i18n.t(pinned ? 'media:pin.unpinned' : 'media:pin.pinned'));
    }).catch(() => {
      alertError(i18n.t('media:pin.failed'));
    })
      .finally(() => {
        setIsWaiting(false);
        if (onDone) {
          onDone();
        }
      });
  };

  return (
    <MenuItem
      onClick={handleClick}
      disabled={isWaiting}
      aria-label={label}
      ref={ref}
    >
      {label}
    </MenuItem>
  );
});

ControlsMediumPin.propTypes = {
  medium: NodeType.isRequired,
  changed: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
  // Called when it is over, either way: to close the menu.
  onDone: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => {
  return {
    changed: (node) => {
      return dispatch({ type: 'POST_PIN_CHANGED', node });
    },
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(null, mapDispatchToProps, null, { forwardRef: true })(ControlsMediumPin);
