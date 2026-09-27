import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { singularize } from 'inflection';
import MenuItem from '@material-ui/core/MenuItem';

import actions from '../../actions';
import api from '../../api';
import ActorType from '../../proptypes/Actor';
import i18n from '../../languages';
import utils from '../../utils';

// Features an actor, or stops featuring it, for onboarding.
//
// A menu item only: it lives in the profile's menu beside Settings, for super
// administrators. The state is the actor's own featuredAt, kept locally after
// a change so the label flips without re-reading the profile.
const ControlsFeature = React.forwardRef(({
  actor,
  alertError,
}, ref) => {
  const [featured, setFeatured] = useState(Boolean(actor.featuredAt));
  const [waiting, setWaiting] = useState(false);

  const namespace = utils.node.getNamespace(actor);
  const featuredApi = api[namespace][singularize(namespace)].featured;

  const handleClick = () => {
    setWaiting(true);

    featuredApi.edit(actor, !featured)
      .then(() => { setFeatured(!featured); })
      .catch((error) => {
        const status = error.response && error.response.status;
        alertError(status === 409
          ? i18n.t('actor:featured.errors.conflict')
          : i18n.t('actor:featured.errors.generic'));
      })
      .then(() => { setWaiting(false); });
  };

  return (
    <MenuItem
      onClick={handleClick}
      disabled={waiting}
      ref={ref}
    >
      {featured
        ? i18n.t('actor:featured.unfeature')
        : i18n.t('actor:featured.feature')}
    </MenuItem>
  );
});

ControlsFeature.propTypes = {
  actor: ActorType.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertError: (message) => { return dispatch(actions.app.alert.error(message)); },
  };
};

export default connect(null, mapDispatchToProps, null, { forwardRef: true })(ControlsFeature);
