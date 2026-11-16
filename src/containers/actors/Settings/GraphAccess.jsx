import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import FollowsIcon from '@mui/icons-material/People';

import ActorType from '../../../proptypes/Actor';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import utils from '../../../utils';
import graphAccess from '../../../utils/graphAccess';
import audience from '../../../utils/audience';
import AccessRow from '../../../components/AccessRow';
import PersonType from '../../../proptypes/Person';

// Who may see a profile's followers and whom it follows (roadmap row 151),
// without making the profile itself more private. Laid out as the Access
// card is, with its names and descriptions for the levels, so that nobody
// learns them twice (the user, 2026-11-15); "Same as this profile" first,
// then only the levels narrower than the profile's own
// (utils/graphAccess.js). Saved as soon as it is chosen.
const ActorsSettingsGraphAccess = ({
  namespace,
  actor,
  viewer,
  read,
  alertSuccess,
  alertError,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const isPerson = utils.node.isPerson(actor);
  const chosen = graphAccess.fromServer(actor.graphAccess, isPerson);

  const choose = (level) => {
    if (level === chosen || isSaving) {
      return;
    }
    setIsSaving(true);
    api.graphAccess.edit(namespace, actor, graphAccess.toServer(level)).then(() => {
      return read(actor);
    }).then(() => {
      alertSuccess(i18n.t('socialgraph:graphAccess.saved'));
    }).catch(() => {
      alertError(i18n.t('socialgraph:graphAccess.notSaved'));
    })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const place = audience.placeOf(actor, viewer);
  const options = graphAccess.optionsFor(actor.access, isPerson).map((option) => {
    if (option.value === '') {
      return {
        value: '',
        name: i18n.t('socialgraph:graphAccess.same'),
        description: i18n.t('socialgraph:graphAccess.sameDescription'),
      };
    }
    return {
      value: option.value,
      name: audience.nameOf(option.value, i18n.t),
      description: audience.describe(option.value, place, actor.name, i18n.t),
      disabled: !option.narrower,
      reason: i18n.t('access:dialog.notNarrower'),
    };
  });

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            <FollowsIcon />
          </Avatar>
        }
        title={i18n.t('socialgraph:graphAccess.title')}
        subheader={i18n.t('socialgraph:graphAccess.cDescription')}
        slotProps={{
          title: { variant: 'subtitle1', sx: { fontWeight: 500 } },
        }}
      />
      <Divider />
      <List disablePadding>
        <AccessRow
          label={i18n.t('socialgraph:graphAccess.whoCanSee')}
          value={chosen}
          options={options}
          onChange={choose}
          disabled={isSaving}
        />
      </List>
    </Card>
  );
};

ActorsSettingsGraphAccess.propTypes = {
  namespace: PropTypes.string.isRequired,
  actor: ActorType.isRequired,
  viewer: PersonType.isRequired,
  read: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (namespace) => {
  return (state) => {
    return {
      namespace,
      actor: state[namespace][namespace].current,
      viewer: state.session.viewer,
    };
  };
};

const mapDispatchToProps = (namespace) => {
  return (dispatch) => {
    return {
      read: (actor) => {
        return dispatch(actions[namespace].read(utils.node.readKeyOf(actor), namespace));
      },
      alertSuccess: (message) => {
        return dispatch(actions.app.alert.success(message));
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
  )(ActorsSettingsGraphAccess);
};
