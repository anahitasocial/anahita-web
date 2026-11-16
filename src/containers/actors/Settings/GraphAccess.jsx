import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import ActorType from '../../../proptypes/Actor';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import utils from '../../../utils';

const { isPerson, getActorName } = utils.node;

// Who may see a profile's followers and whom it follows (roadmap row 151),
// without making the profile itself more private. Whoever may see the
// profile, unless its owner or admins choose fewer; never more, which the
// server sees to. Saved as soon as it is chosen, as who may quote is.
//
// A person has every level; a group or an event follows nobody, so people
// it follows and mutuals are not offered.
const levelsFor = (actor) => {
  return isPerson(actor) ?
    ['', 'public', 'registered', 'followers', 'leaders', 'mutuals', 'admins'] :
    ['', 'public', 'registered', 'followers', 'admins'];
};

const labelOf = (actor, level) => {
  const name = getActorName(actor);
  const said = 'access:audience.descriptions';
  if (level === '') {
    return isPerson(actor) ?
      i18n.t('socialgraph:graphAccess.same') :
      i18n.t('socialgraph:graphAccess.sameOf', { name });
  }
  if (level === 'public' || level === 'registered') {
    return i18n.t(`${said}.${level}`);
  }
  if (isPerson(actor)) {
    return i18n.t(`${said}.own.${level === 'admins' ? 'myself' : level}`);
  }
  return i18n.t(`${said}.group.${level}`, { name });
};

const ActorsSettingsGraphAccess = ({
  namespace,
  actor,
  read,
  alertSuccess,
  alertError,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (event) => {
    setIsSaving(true);
    api.graphAccess.edit(namespace, actor, event.target.value).then(() => {
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

  return (
    <Card>
      <CardHeader
        title={i18n.t('socialgraph:graphAccess.title')}
        slotProps={{ title: { variant: 'subtitle1' } }}
      />
      <CardContent sx={{ pt: 0 }}>
        <TextField
          select
          fullWidth
          id={`graph-access-${actor.id}`}
          label={i18n.t('socialgraph:graphAccess.label')}
          value={actor.graphAccess || ''}
          onChange={handleChange}
          disabled={isSaving}
          helperText={i18n.t('socialgraph:graphAccess.help')}
          slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
        >
          {levelsFor(actor).map((level) => {
            return (
              <MenuItem key={level || 'same'} value={level}>
                {labelOf(actor, level)}
              </MenuItem>
            );
          })}
        </TextField>
      </CardContent>
    </Card>
  );
};

ActorsSettingsGraphAccess.propTypes = {
  namespace: PropTypes.string.isRequired,
  actor: ActorType.isRequired,
  read: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (namespace) => {
  return (state) => {
    return {
      namespace,
      actor: state[namespace][namespace].current,
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
