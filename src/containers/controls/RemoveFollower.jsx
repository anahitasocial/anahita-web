import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@mui/material/Button';

import actions from '../../actions';
import ActorType from '../../proptypes/Actor';
import PersonType from '../../proptypes/Person';
import i18n from '../../languages';

import DialogConfirm from '../../components/DialogConfirm';

const ControlsRemoveFollower = React.forwardRef(({
  removefollower,
  actor,
  follower,
  alertSuccess,
  alertError,
  confirmTitle = i18n.t('prompts:confirm.title'),
  confirmMessage = i18n.t('prompts:confirm.message'),
  onRemoved = () => {},
}, ref) => {
  const [waiting, setWaiting] = useState(false);

  const handleAction = () => {
    setWaiting(true);
    removefollower(actor, follower)
      .then(() => {
        alertSuccess(i18n.t('prompts:removed.success'));
        onRemoved(follower);
      }).catch((err) => {
        console.error(err);
        alertError(i18n.t('prompts:removed.error'));
        // It can be tried again.
        setWaiting(false);
      });
  };

  const label = i18n.t('actions:remove');

  return (
    <DialogConfirm
      title={confirmTitle}
      message={confirmMessage}
      confirm={label}
    >
      <Button
        onClick={handleAction}
        disabled={waiting}
        aria-label={label}
        ref={ref}
      >
        {label}
      </Button>
    </DialogConfirm>
  );
});

ControlsRemoveFollower.propTypes = {
  removefollower: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  actor: ActorType.isRequired,
  follower: PersonType.isRequired,
  confirmTitle: PropTypes.string,
  confirmMessage: PropTypes.string,
  // Told once the follower is removed, so that a list can drop them.
  onRemoved: PropTypes.func,
};

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    // The action takes both in one object; given two arguments it read
    // neither, and Remove never reached the server.
    removefollower: (actor, follower) => {
      return dispatch(actions.socialgraph.removefollower({ actor, follower }));
    },
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ControlsRemoveFollower);
