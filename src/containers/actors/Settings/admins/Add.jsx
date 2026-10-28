import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';

import ActorAvatar from '../../../../components/ActorAvatar';
import ActorType from '../../../../proptypes/Actor';
import PersonType from '../../../../proptypes/Person';
import actions from '../../../../actions';
import api from '../../../../api';
import utils from '../../../../utils';
import i18n from '../../../../languages';

const { getActorName } = utils.node;

const ActorsSettingsAdminsAdd = (props) => {
  const {
    actor,
    addAdmin,
    namespace,
    viewer,
  } = props;

  const [keyword, setkeyword] = useState('');
  const [options, setOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Who may be made one: the people the viewer follows who follow them
  // back, by name. Only people here: somebody from another server cannot
  // look after a profile on this one, and the server would refuse them.
  const fetchList = (q) => {
    if (q.length === 0) {
      setOptions([]);
      return;
    }

    setIsFetching(true);

    api.socialgraph.browse({
      filter: 'mutuals',
      actor: viewer,
      q,
      limit: 20,
    })
      .then(({ data }) => {
        const people = (data && data.data) || [];
        return setOptions(people.filter((person) => {
          return utils.node.isPerson(person) && !utils.federation.isRemote(person);
        }));
      })
      .catch(() => {
        setOptions([]);
      })
      .then(() => {
        setIsFetching(false);
      });
  };

  return (
    <Autocomplete
      id={`${namespace}-select-add`}
      open={isOpen}
      onOpen={() => {
        setIsOpen(true);
      }}
      onClose={() => {
        setIsOpen(false);
      }}
      onChange={(event, admin) => {
        addAdmin({ actor, admin });
      }}
      isOptionEqualToValue={(option, value) => {
        return option.id === value.id;
      }}
      // By name, or by handle for somebody who has not given one.
      getOptionLabel={(option) => {
        return getActorName(option) || '';
      }}
      // The server has searched already, by name and handle; filtering
      // again here by the label alone would drop whoever matched on the
      // handle.
      filterOptions={(found) => {
        return found;
      }}
      onInputChange={(event, q) => {
        fetchList(q);
        setkeyword(q);
      }}
      options={options}
      loading={isFetching}
      renderOption={(optionProps, admin) => {
        const { key, ...rest } = optionProps;
        return (
          <li key={key} {...rest}>
            <ListItemAvatar>
              <ActorAvatar
                actor={admin}
                size="small"
              />
            </ListItemAvatar>
            <ListItemText
              primary={getActorName(admin)}
            />
          </li>
        );
      }}
      renderInput={(params) => {
        return (
          <TextField
            variant="standard"
            {...params}
            label={i18n.t('actor:addAdmins')}
            value={keyword}
            placeholder="Jane smith ..."
            slotProps={{
              ...params.slotProps,
              input: {
                ...params.slotProps.input,
                endAdornment: (
                  <>
                    {isFetching ? <CircularProgress size={20} /> : null}
                    {params.slotProps.input.endAdornment}
                  </>
                ),
              },
            }}
          />
        );
      }}
    />
  );
};

ActorsSettingsAdminsAdd.propTypes = {
  actor: ActorType.isRequired,
  viewer: PersonType.isRequired,
  addAdmin: PropTypes.func.isRequired,
  namespace: PropTypes.string.isRequired,
};

const mapStateToProps = (namespace) => {
  return (state) => {
    const {
      [namespace]: {
        current: actor,
      },
    } = state[namespace];

    const {
      viewer,
    } = state.session;

    return {
      viewer,
      actor,
      namespace,
    };
  };
};

const mapDispatchToProps = (namespace) => {
  return (dispatch) => {
    return {
      addAdmin: (params) => {
        return dispatch(actions[namespace].settings.admins.add(params));
      },
    };
  };
};

export default (namespace) => {
  return connect(
    mapStateToProps(namespace),
    mapDispatchToProps(namespace),
  )(ActorsSettingsAdminsAdd);
};
