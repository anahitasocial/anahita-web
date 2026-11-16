import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';

import PermissionsIcon from '@mui/icons-material/Tune';
import ApproveIcon from '@mui/icons-material/HowToVote';

import AccessRow from '../../../components/AccessRow';

import ActorType from '../../../proptypes/Actor';
import actions from '../../../actions';
import i18n from '../../../languages';
import utils from '../../../utils';
import {
  getPermissionGroups,
  toFeatures,
  toValues,
} from './featurePermissions';

// Icons for the choices that are not access levels.
const CHOICE_ICONS = {
  approve: ApproveIcon,
};

const ActorsSettingsPermissions = (props) => {
  const {
    editFeatures,
    actor,
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
      <Card>
        <CardHeader
          avatar={
            <Avatar>
              <PermissionsIcon />
            </Avatar>
          }
          title={i18n.t('actor:permissions.title')}
          subheader={i18n.t('actor:permissions.cDescription')}
          slotProps={{
            title: { variant: 'subtitle1', sx: { fontWeight: 500 } },
          }}
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
                // A row may have words of its own for a choice ("Nobody" may
                // mention you), and the rest are the shared ones.
                const label = (choice) => {
                  return i18n.t([
                    `actor:permissions.entities.${row.entity}.choices.${choice}`,
                    `actor:permissions.choices.${choiceLabels}.${choice}`,
                  ], {
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

                // The level chosen, opening the access dialog (roadmap row
                // 155): each choice with its words, a row's own where it
                // has them ("Nobody" may mention you).
                return (
                  <AccessRow
                    key={`${group.service}-${row.entity}`}
                    label={question}
                    value={value}
                    divider
                    options={row.choices.map((choice) => {
                      return {
                        value: choice,
                        name: label(choice),
                        description: i18n.t([
                          `actor:permissions.entities.${row.entity}.descriptions.${choice}`,
                          `actor:permissions.descriptions.${choiceLabels}.${choice}`,
                        ], { defaultValue: '', name: actor.name }),
                        icon: CHOICE_ICONS[choice],
                      };
                    })}
                    onChange={(choice) => {
                      setAccess(group.service, row.entity, choice);
                    }}
                  />
                );
              })}
            </List>
          );
        })}

        {/* Side by side, each button taking an equal share of the row:
            the secondary "restore defaults" action first, the primary
            submit action last. */}
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          {/* No confirmation, as on the Access card: every value is on
              screen and restoring is undone by setting them again. */}
          <Button
            fullWidth
            onClick={() => {
              return save([]);
            }}
            disabled={waiting}
          >
            {i18n.t('actor:permissions.restoreDefaults')}
          </Button>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            disabled={waiting || groups.length === 0}
          >
            {i18n.t('actions:update')}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
};

ActorsSettingsPermissions.propTypes = {
  actor: ActorType.isRequired,
  editFeatures: PropTypes.func.isRequired,
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
