import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

import AudienceButton from '../../../components/AudienceButton';
import actions from '../../../actions';
import audience from '../../../utils/audience';
import i18n from '../../../languages';
import MediumType from '../../../proptypes/Medium';
import PersonType from '../../../proptypes/Person';

// Who can see a post that exists, for somebody who may change it.
//
// The same button as the composer's, so the choice looks the same when
// it is made and when it is changed. It used to be a bare globe or
// padlock that opened a list of level names.
//
// The options come with the post (`authorized.audiences`): they depend on
// where the post is and on who wrote it. The server refuses anything
// else with 422.
const ControlsMediumAccess = ({
  medium,
  viewer,
  editAccess,
  alertError,
}) => {
  const [access, setAccess] = useState(medium.access);
  const [waiting, setWaiting] = useState(false);

  // The post can change under the control: another page of the same list,
  // or a read that lands after the list was drawn.
  useEffect(() => {
    setAccess(medium.access);
  }, [medium.id, medium.access]);

  const change = (level) => {
    if (level === access) {
      return;
    }

    const previous = access;

    // Shown at once, and put back if the server says no.
    setAccess(level);
    setWaiting(true);

    editAccess({ ...medium, access: level })
      .catch(() => {
        setAccess(previous);
        alertError(i18n.t('prompts:updated.error'));
      })
      .finally(() => {
        setWaiting(false);
      });
  };

  // It sits on the line under the author's name, after the time the post
  // was made, and needs a little air from it.
  return (
    <Box component="span" sx={{ ml: 1 }}>
      <AudienceButton
        actor={medium.owner}
        viewer={viewer}
        options={audience.optionsForMedium(medium)}
        value={access || 'public'}
        onChange={change}
        disabled={waiting}
      />
    </Box>
  );
};

ControlsMediumAccess.propTypes = {
  medium: MediumType.isRequired,
  viewer: PersonType.isRequired,
  editAccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (namespace) => {
  return (state) => {
    const { viewer } = state.session;
    return {
      viewer,
      namespace,
    };
  };
};

const mapDispatchToProps = (namespace) => {
  return (dispatch) => {
    return {
      editAccess: (medium) => {
        return dispatch(actions[namespace].editAccess(medium));
      },
      alertError: (message) => {
        return dispatch(actions.app.alert.error(message));
      },
    };
  };
};

export default (namespace) => {
  return connect(
    mapStateToProps(namespace),
    mapDispatchToProps(namespace),
  )(ControlsMediumAccess);
};
