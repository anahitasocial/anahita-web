import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MenuItem from '@mui/material/MenuItem';

import actions from '../../../actions';
import api from '../../../api';
import NodeType from '../../../proptypes/Node';
import i18n from '../../../languages';

// "Save" and "Remove from saved", in a post's menu.
//
// A saved post goes on the viewer's own list, the Saved tab of their
// profile, to find again. It is private: the post's author is not told and
// the post shows nothing of it to anybody else.
const ControlsMediumSave = React.forwardRef(({
  medium,
  changed,
  alertSuccess,
  alertError,
  onDone = null,
}, ref) => {
  const [isWaiting, setIsWaiting] = useState(false);

  const saved = Boolean(medium.isSavedByViewer);
  const label = i18n.t(saved ? 'media:saved.remove' : 'media:saved.save');

  const handleClick = () => {
    setIsWaiting(true);

    api.saved.set(medium, !saved).then(() => {
      changed(medium.id, !saved);
      alertSuccess(i18n.t(saved ? 'media:saved.removed' : 'media:saved.saved'));
    }).catch(() => {
      alertError(i18n.t('media:saved.failed'));
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

ControlsMediumSave.propTypes = {
  medium: NodeType.isRequired,
  changed: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
  // Called when it is over, either way: to close the menu.
  onDone: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => {
  return {
    // Told to every list on the page: the same post can be in a feed and
    // in a list of notes at once.
    changed: (id, saved) => {
      return dispatch({ type: 'POST_SAVED_CHANGED', id, saved });
    },
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(null, mapDispatchToProps, null, { forwardRef: true })(ControlsMediumSave);
