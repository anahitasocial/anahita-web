import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import PermissionsIcon from '@material-ui/icons/Tune';

import ActorType from '../../../proptypes/Actor';
import actions from '../../../actions';
import i18n from '../../../languages';
import utils from '../../../utils';
import {
  getPermissionGroups,
  toFeatures,
  toValues,
} from './featurePermissions';

const ActorsSettingsPermissions = (props) => {
  const {
    editFeatures,
    actor,
    namespace,
  } = props;

  const isPerson = utils.node.isPerson(actor);
  // "Admins" of a person is that person, which nobody would guess from the
  // word — so the choices are labelled per actor type.
  const choiceLabels = isPerson ? 'person' : 'group';

  const [values, setValues] = useState(toValues(actor.features));
  const [waiting, setWaiting] = useState(false);

  // Re-seeded from the store after every save. Restoring the defaults in
  // particular only learns what they are from the response.
  useEffect(() => {
    setValues(toValues(actor.features));
  }, [actor.features]);

  const groups = getPermissionGroups(actor.features, {
    isPerson,
    access: actor.access,
  });

  // Success and failure come back as the page-level alert in
  // containers/actors/Settings, which watches the namespace's edit state —
  // the same path Info takes. Alerting here as well would say it twice.
  const save = (features) => {
    setWaiting(true);

    return editFeatures({ id: actor.id, features })
      .catch(() => {})
      .finally(() => {
        setWaiting(false);
      });
  };

  const handleOnSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }

    return save(toFeatures(actor.features, values));
  };

  const setAccess = (service, entity, access) => {
    setValues({
      ...values,
      [service]: {
        ...values[service],
        [entity]: access,
      },
    });
  };

  return (
    <form onSubmit={handleOnSubmit}>
      <Card variant="outlined">
        <CardHeader
          avatar={
            <Avatar>
              <PermissionsIcon />
            </Avatar>
          }
          titleTypographyProps={{ variant: 'h5' }}
          title={i18n.t('actor:permissions.title')}
          subheader={i18n.t('actor:permissions.cDescription')}
        />
        <Divider />

        {groups.length === 0 &&
          <ListItem>
            <ListItemText
              secondary={i18n.t('actor:permissions.empty')}
            />
          </ListItem>}

        {groups.map((group) => {
          return (
            <List
              key={group.service}
              disablePadding
              subheader={
                <ListSubheader disableSticky>
                  {i18n.t(`features:${group.key}.title`, {
                    defaultValue: group.key,
                  })}
                </ListSubheader>
              }
            >
              {group.rows.map((row) => {
                const question = i18n.t(
                  `features:${group.key}.addPermissions.${row.entity}`,
                  { defaultValue: row.entity },
                );
                const value = (values[group.service] || {})[row.entity] || row.access;
                const label = (choice) => {
                  return i18n.t(`actor:permissions.choices.${choiceLabels}.${choice}`, {
                    defaultValue: choice,
                  });
                };

                // Comments on a profile narrower than registered follow the
                // profile's access, so there is nothing to choose — say who
                // can comment and why, rather than offer a select the server
                // would ignore.
                if (row.lock) {
                  return (
                    <ListItem key={`${group.service}-${row.entity}`} divider>
                      <ListItemText
                        primary={question}
                        secondary={i18n.t(`actor:permissions.commentLocked.${row.lock}`)}
                      />
                    </ListItem>
                  );
                }

                return (
                  <ListItem key={`${group.service}-${row.entity}`} divider>
                    {/* Stacked on every screen, question above a full-width
                        select. Side by side, a long question — or a longer
                        translation — squeezed the select or wrapped it under
                        the text at a width nobody chose; stacked, the
                        question just wraps. Not the select's own floating
                        label either: an outlined label that long is cut off
                        in the border's notch. */}
                    <Box width="100%" py={1}>
                      <Box mb={1}>
                        <Typography variant="body1">{question}</Typography>
                      </Box>
                      {/* A select rather than radios: a person has five
                          levels on most rows, which as radios made a wall of
                          buttons. What the Access card gets from its radio
                          list — a sentence per choice — each option here
                          still carries, shown when the list is open. */}
                      <TextField
                        select
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={value}
                        onChange={(event) => {
                          setAccess(group.service, row.entity, event.target.value);
                        }}
                        SelectProps={{
                          renderValue: label,
                        }}
                        inputProps={{
                          // Namespaced per service: comment and like appear
                          // under more than one service.
                          name: `${namespace}-${group.service}-${row.entity}`,
                          'aria-label': question,
                        }}
                      >
                        {row.choices.map((choice) => {
                          return (
                            <MenuItem key={choice} value={choice}>
                              <ListItemText
                                primary={label(choice)}
                                secondary={i18n.t(
                                  `actor:permissions.descriptions.${choiceLabels}.${choice}`,
                                  { defaultValue: '' },
                                )}
                              />
                            </MenuItem>
                          );
                        })}
                      </TextField>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          );
        })}

        {/* Stacked, the primary action first. Side by side each button got
            half the width, and a longer label — the French "Rétablir les
            valeurs par défaut" — wrapped inside a half-width button on a
            phone. */}
        <CardActions>
          <Box width="100%">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={waiting || groups.length === 0}
              fullWidth
            >
              {i18n.t('actions:update')}
            </Button>
            {/* No confirmation, as on the Access card: every value is on
                screen and restoring is undone by setting them again. */}
            <Box mt={1}>
              <Button
                onClick={() => {
                  return save([]);
                }}
                disabled={waiting}
                fullWidth
              >
                {i18n.t('actor:permissions.restoreDefaults')}
              </Button>
            </Box>
          </Box>
        </CardActions>
      </Card>
    </form>
  );
};

ActorsSettingsPermissions.propTypes = {
  actor: ActorType.isRequired,
  editFeatures: PropTypes.func.isRequired,
  namespace: PropTypes.string.isRequired,
};

const mapStateToProps = (namespace) => {
  return (state) => {
    const {
      [namespace]: {
        current: actor,
      },
    } = state[namespace];

    return {
      actor,
      namespace,
    };
  };
};

const mapDispatchToProps = (namespace) => {
  return (dispatch) => {
    return {
      editFeatures: (params) => {
        return dispatch(actions[namespace].settings.features.edit(params));
      },
    };
  };
};

export default (namespace) => {
  return connect(
    mapStateToProps(namespace),
    mapDispatchToProps(namespace),
  )(ActorsSettingsPermissions);
};
