import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';

import actions from '../../actions';
import api from '../../api';
import PersonType from '../../proptypes/Person';
import i18n from '../../languages';

// Asking to follow a profile the viewer may not see, and taking the asking
// back.
//
// The profile's owner, or a group's administrators, answer it. Until they
// do the button says the request was sent, and pressing it again withdraws
// it. Once accepted the profile opens like any other, so this never has to
// show "following".
const ControlsFollowRequest = ({
  actor,
  viewer,
  alertError,
}) => {
  const [requested, setRequested] = useState(Boolean(actor.isFollowRequestedByViewer));
  const [waiting, setWaiting] = useState(false);

  const handleClick = () => {
    setWaiting(true);

    const call = requested ?
      api.socialgraph.withdrawFollowRequest({ actor, viewer }) :
      api.socialgraph.requestFollow({ actor, viewer });

    call.then(() => {
      setRequested(!requested);
    }).catch(() => {
      alertError(i18n.t('actor:limited.failed'));
    }).finally(() => {
      setWaiting(false);
    });
  };

  return (
    <Button
      fullWidth
      variant={requested ? 'outlined' : 'contained'}
      color={requested ? 'inherit' : 'primary'}
      disabled={waiting}
      onClick={handleClick}
      title={requested ? i18n.t('actor:limited.withdraw') : undefined}
    >
      {requested ? i18n.t('actor:limited.requested') : i18n.t('actor:limited.request')}
    </Button>
  );
};

ControlsFollowRequest.propTypes = {
  // What the server sent of the profile: id, name, and whether the viewer
  // has asked already.
  actor: PropTypes.object.isRequired,
  viewer: PersonType.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    viewer: state.session.viewer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ControlsFollowRequest);
