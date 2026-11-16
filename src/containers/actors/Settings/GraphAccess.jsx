import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FollowsIcon from '@mui/icons-material/People';

import ActorType from '../../../proptypes/Actor';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import utils from '../../../utils';
import graphAccess from '../../../utils/graphAccess';

// Who may see a profile's followers and whom it follows (roadmap row 151),
// without making the profile itself more private. Laid out as the Access
// card is, with its names and descriptions for the levels, so that nobody
// learns them twice (the user, 2026-11-15); "Same as this profile" first,
// then only the levels narrower than the profile's own
// (utils/graphAccess.js). Saved as soon as it is chosen.
const ActorsSettingsGraphAccess = ({
  namespace,
  actor,
  read,
  alertSuccess,
  alertError,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const isPerson = utils.node.isPerson(actor);
  const chosen = graphAccess.fromServer(actor.graphAccess, isPerson);
  const choices = graphAccess.choicesFor(actor.access, isPerson);

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

  const nameOf = (level) => {
    return level ? i18n.t(`access:${level}`) : i18n.t('socialgraph:graphAccess.same');
  };
  const descriptionOf = (level) => {
    return level ?
      i18n.t(`actor:access.descriptions.${level}`) :
      i18n.t('socialgraph:graphAccess.sameDescription');
  };

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
      <RadioGroup
        name={`${namespace}-graph-access`}
        aria-label={i18n.t('socialgraph:graphAccess.title')}
        value={chosen}
        onChange={(event) => {
          choose(event.target.value);
        }}
      >
        <List disablePadding>
          {choices.map((level) => {
            return (
              <ListItemButton
                key={`graph-access-${level || 'same'}`}
                divider
                disabled={isSaving}
                onClick={() => {
                  choose(level);
                }}
              >
                <ListItemIcon>
                  <Radio
                    checked={chosen === level}
                    value={level}
                    color="primary"
                    slotProps={{ input: { 'aria-label': nameOf(level) } }}
                  />
                </ListItemIcon>
                <ListItemText primary={nameOf(level)} secondary={descriptionOf(level)} />
              </ListItemButton>
            );
          })}
        </List>
      </RadioGroup>
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
