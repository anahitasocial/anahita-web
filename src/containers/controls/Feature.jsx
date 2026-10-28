import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { singularize } from 'inflection';
import MenuItem from '@mui/material/MenuItem';
import FeatureIcon from '@mui/icons-material/StarBorder';
import FeaturedIcon from '@mui/icons-material/Star';

import MenuItemLabel from '../../components/MenuItemLabel';

import actions from '../../actions';
import api from '../../api';
import ActorType from '../../proptypes/Actor';
import i18n from '../../languages';
import utils from '../../utils';

// Features an actor, or stops featuring it, for onboarding.
//
// A menu item only: it lives in the profile's menu beside Settings, for super
// administrators. Whether the actor is featured is the menu's to keep
// (actors/Read/Controls), since this item goes when the menu closes: kept
// here, the label would go back to the profile as it was read.
const ControlsFeature = React.forwardRef(({
  actor,
  featured,
  onFeatured,
  alertError,
}, ref) => {
  const [waiting, setWaiting] = useState(false);

  const namespace = utils.node.getNamespace(actor);
  const featuredApi = api[namespace][singularize(namespace)].featured;

  const handleClick = () => {
    setWaiting(true);

    featuredApi.edit(actor, !featured)
      .then(() => { onFeatured(!featured); })
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
      <MenuItemLabel icon={featured ? <FeaturedIcon fontSize="small" /> : <FeatureIcon fontSize="small" />}>
        {featured
          ? i18n.t('actor:featured.unfeature')
          : i18n.t('actor:featured.feature')}
      </MenuItemLabel>
    </MenuItem>
  );
});

ControlsFeature.propTypes = {
  actor: ActorType.isRequired,
  featured: PropTypes.bool.isRequired,
  onFeatured: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertError: (message) => { return dispatch(actions.app.alert.error(message)); },
  };
};

export default connect(null, mapDispatchToProps, null, { forwardRef: true })(ControlsFeature);
