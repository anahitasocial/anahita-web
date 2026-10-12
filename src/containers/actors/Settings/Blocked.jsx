import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';

import ActorAvatar from '../../../components/ActorAvatar';
import Progress from '../../../components/Progress';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import ActorType from '../../../proptypes/Actor';
import PersonType from '../../../proptypes/Person';
import utils from '../../../utils';

const { getActorName, getURL } = utils.node;

// How many are asked for at a time, and how long after the last key a
// search is made.
const PAGE = 20;
const PAUSE = 300;

// The people the viewer has blocked, with a way to unblock each.
//
// Theirs alone, so it is in their settings. It was a tab of the Social
// Graph on their profile, which is what other people look at.
//
// The list can be long. It is read a page at a time, most lately blocked
// first, with more read as the page is scrolled, and it can be searched by
// name, which is asked of the server: somebody blocked long ago is found
// without scrolling to them.
const ActorsSettingsBlocked = ({
  actor,
  viewer,
  alertError,
}) => {
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  // How many there are with nothing searched for: whether there is anybody
  // to search among.
  const [everybody, setEverybody] = useState(0);
  const [hasFailed, setHasFailed] = useState(false);
  const [waiting, setWaiting] = useState(0);
  const [typed, setTyped] = useState('');
  const [query, setQuery] = useState('');
  // What is searched for now, for an answer that arrives after it changed.
  const latest = useRef('');
  latest.current = query;

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(typed.trim());
    }, PAUSE);
    return () => {
      clearTimeout(timer);
    };
  }, [typed]);

  const read = (start, q) => {
    return api.socialgraph.browse({
      filter: 'blocks',
      actor,
      start,
      limit: PAGE,
      q: q || undefined,
    });
  };

  // From the top, whenever what is searched for changes.
  useEffect(() => {
    let current = true;
    setHasFailed(false);

    read(0, query).then((result) => {
      if (!current) {
        return;
      }
      const found = (result.data.pagination && result.data.pagination.total) || 0;
      setRows(result.data.data || []);
      setTotal(found);
      if (!query) {
        setEverybody(found);
      }
    }).catch(() => {
      if (current) {
        setHasFailed(true);
      }
    });

    return () => {
      current = false;
    };
  }, [actor.id, query]);

  const readMore = () => {
    const asked = query;
    read(rows.length, asked).then((result) => {
      setRows((before) => {
        // Not added to a list that has since been searched afresh, and
        // nobody twice: one unblocked meanwhile moves the rest up a place.
        if (asked !== latest.current || !before) {
          return before;
        }
        const have = new Set(before.map((each) => {
          return each.id;
        }));
        return before.concat((result.data.data || []).filter((each) => {
          return !have.has(each.id);
        }));
      });
    }).catch(() => {
      setHasFailed(true);
    });
  };

  const handleUnblock = (person) => {
    setWaiting(person.id);
    api.socialgraph.unblock({ actor: person, viewer }).then(() => {
      setRows((before) => {
        return before.filter((each) => {
          return each.id !== person.id;
        });
      });
      setTotal((before) => {
        return Math.max(0, before - 1);
      });
      setEverybody((before) => {
        return Math.max(0, before - 1);
      });
    }).catch(() => {
      alertError(i18n.t('socialgraph:blocked.failed'));
    }).finally(() => {
      setWaiting(0);
    });
  };

  // Offered once there are more than fit on a page, and kept while
  // something is typed in it.
  const canSearch = everybody > PAGE || typed !== '';

  return (
    <Card>
      <CardHeader
        title={i18n.t('socialgraph:blocks')}
        subheader={everybody > 0 ? i18n.t('socialgraph:blocked.count', { count: everybody }) : null}
      />
      <CardContent sx={{ pt: 0 }}>
        {canSearch &&
          <TextField
            value={typed}
            onChange={(event) => {
              setTyped(event.target.value);
            }}
            placeholder={i18n.t('socialgraph:blocked.search')}
            aria-label={i18n.t('socialgraph:blocked.search')}
            size="small"
            fullWidth
            sx={{ mb: 2 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
              htmlInput: { maxLength: 100 },
            }}
          />}
        {!rows && !hasFailed && <Progress />}
        {hasFailed &&
          <Typography variant="body2" color="error" role="alert">
            {i18n.t('socialgraph:failed')}
          </Typography>}
        {rows && rows.length === 0 && !hasFailed &&
          <Typography variant="body2" color="textSecondary">
            {i18n.t(query ? 'socialgraph:blocked.noMatch' : 'socialgraph:blocked.none')}
          </Typography>}
        {rows && rows.length > 0 &&
          <InfiniteScroll
            dataLength={rows.length}
            next={readMore}
            hasMore={rows.length < total && !hasFailed}
            loader={<Progress key="blocked-progress" />}
          >
            <List disablePadding>
              {rows.map((person) => {
                return (
                  <ListItem
                    key={`blocked-${person.id}`}
                    disableGutters
                    secondaryAction={
                      <Button
                        disabled={waiting === person.id}
                        onClick={() => {
                          handleUnblock(person);
                        }}
                      >
                        {i18n.t('actions:unblock')}
                      </Button>
                    }
                  >
                    <ListItemAvatar>
                      <ActorAvatar actor={person} linked />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Link href={getURL(person)} color="inherit" underline="hover">
                          {getActorName(person)}
                        </Link>
                      }
                      secondary={person.alias ? `@${person.alias}` : null}
                      slotProps={{
                        primary: { noWrap: true },
                        secondary: { noWrap: true },
                      }}
                      // Room for the button beside it.
                      sx={{ pr: 8 }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </InfiniteScroll>}
      </CardContent>
    </Card>
  );
};

ActorsSettingsBlocked.propTypes = {
  actor: ActorType.isRequired,
  viewer: PersonType.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    viewer: state.session.viewer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActorsSettingsBlocked);
