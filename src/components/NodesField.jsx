import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';

import PlaceIcon from '@mui/icons-material/PlaceOutlined';

import ActorAvatar from './ActorAvatar';
import utils from '../utils';

const { getActorName, isActor } = utils.node;
const { isRemote, displayHandle } = utils.federation;

// Where people on other servers are looked for.
const REMOTE = 'remote';

const WAIT = 300;
const EACH = 6;

// Several profiles, or several places, found by typing part of a name and
// kept as chips.
//
// `namespaces` is where to look: 'people' and 'groups' for profiles,
// 'locations' for places, and 'remote' for people on other servers. Each
// is asked for names like what was typed, a moment after the typing stops,
// and the answers are offered together. What is offered is what the
// viewer may see, since it is the lists they could open themselves.
//
// The lists of people and groups keep to this site's own. People from
// Mastodon or Bluesky are found through the site's search, which has
// everybody kept here: whoever somebody here followed or looked up. One
// never looked up is not offered until they are.
const NodesField = ({
  label,
  helperText = '',
  namespaces,
  value,
  onChange,
  max = 50,
  disabled = false,
}) => {
  const [options, setOptions] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const timer = useRef(null);
  // Which search is the latest, so an earlier one answering late is not
  // shown over it.
  const asked = useRef(0);

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  const search = (q) => {
    clearTimeout(timer.current);

    if (q.trim().length < 2) {
      setOptions([]);
      return;
    }

    timer.current = setTimeout(() => {
      asked.current += 1;
      const mine = asked.current;
      setIsFetching(true);

      Promise.all(namespaces.map((namespace) => {
        const request = namespace === REMOTE ?
          axios.get('/search/', { params: { term: q.trim(), scope: 'actors', limit: EACH * 3 } }) :
          axios.get(`/${namespace}/`, { params: { q: q.trim(), limit: EACH } });

        return request
          .then((result) => {
            const found = result.data.data || [];
            if (namespace !== REMOTE) {
              return found;
            }
            // The search has this site's own too, which the other lists
            // give; only those from elsewhere are taken from it.
            return found.filter(isRemote).slice(0, EACH);
          })
          .catch(() => {
            return [];
          });
      })).then((lists) => {
        if (mine === asked.current) {
          setOptions(lists.flat());
        }
      }).finally(() => {
        if (mine === asked.current) {
          setIsFetching(false);
        }
      });
    }, WAIT);
  };

  const nameOf = (node) => {
    return isActor(node) ? getActorName(node) : (node.name || node.alias || '');
  };

  return (
    <Autocomplete
      multiple
      filterSelectedOptions
      options={options}
      value={value}
      disabled={disabled}
      loading={isFetching}
      // The server did the matching: what it sent is what is offered.
      filterOptions={(found) => {
        return found;
      }}
      getOptionLabel={nameOf}
      getOptionKey={(node) => {
        return node.id;
      }}
      isOptionEqualToValue={(option, chosen) => {
        return option.id === chosen.id;
      }}
      onInputChange={(event, q, reason) => {
        if (reason === 'input') {
          search(q);
        }
      }}
      onChange={(event, nodes) => {
        onChange(nodes.slice(0, max));
      }}
      renderOption={(optionProps, node) => {
        const { key, ...rest } = optionProps;

        return (
          <li key={key} {...rest}>
            <ListItemAvatar>
              {isActor(node) ?
                <ActorAvatar actor={node} size="small" linked={false} /> :
                <PlaceIcon color="action" />}
            </ListItemAvatar>
            <ListItemText
              primary={nameOf(node)}
              // Somebody elsewhere by their handle, so that two of the same
              // name on different servers can be told apart.
              secondary={isRemote(node) ? displayHandle(node) : null}
            />
          </li>
        );
      }}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            label={label}
            helperText={helperText}
            slotProps={{
              ...params.slotProps,
              input: {
                ...params.slotProps.input,
                endAdornment: (
                  <>
                    {isFetching && <CircularProgress color="inherit" size={20} />}
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

NodesField.propTypes = {
  label: PropTypes.string.isRequired,
  helperText: PropTypes.string,
  namespaces: PropTypes.arrayOf(PropTypes.string).isRequired,
  // The nodes chosen, each with at least an id and a name.
  value: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func.isRequired,
  max: PropTypes.number,
  disabled: PropTypes.bool,
};

export default NodesField;
