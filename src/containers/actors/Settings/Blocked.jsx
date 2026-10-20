import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
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

// The people a profile has blocked, each with a way to unblock them, in a
// dialog of their own: the viewer's own blocks, or a group's or an event's,
// for whoever runs it.
//
// The list can be long. It is read a page at a time, most lately blocked
// first, with more read as the dialog is scrolled, and it can be searched
// by name, which is asked of the server: somebody blocked long ago is found
// without scrolling to them.
//
// `onCount` is told how many there are, whenever that is learned or
// changes, for whoever shows the number.
// The words for the viewer's own blocks, or for a group's.
const textsFor = (actor, viewer) => {
  return actor.id === viewer.id ? 'socialgraph:blocked' : 'socialgraph:groupBlocked';
};

const BlockedDialog = ({
  actor,
  viewer,
  alertError,
  open,
  onClose,
  onCount,
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
    if (!open) {
      return undefined;
    }

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
        onCount(found);
      }
    }).catch(() => {
      if (current) {
        setHasFailed(true);
      }
    });

    return () => {
      current = false;
    };
  }, [actor.id, query, open]);

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
    // Lifted by whoever made it: the profile these are the blocks of.
    api.socialgraph.unblock({ actor: person, viewer: actor }).then(() => {
      setRows((before) => {
        return before.filter((each) => {
          return each.id !== person.id;
        });
      });
      setTotal((before) => {
        return Math.max(0, before - 1);
      });
      setEverybody((before) => {
        const left = Math.max(0, before - 1);
        onCount(left);
        return left;
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

  const scrollId = `blocked-scroll-${actor.id}`;
  const texts = textsFor(actor, viewer);
  const name = getActorName(actor);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby={`blocked-title-${actor.id}`}
    >
      <DialogTitle id={`blocked-title-${actor.id}`}>
        {i18n.t(`${texts}.title`, { name })}
      </DialogTitle>
      <DialogContent dividers id={scrollId} sx={{ minHeight: 240 }}>
        {canSearch &&
          <TextField
            value={typed}
            onChange={(event) => {
              setTyped(event.target.value);
            }}
            placeholder={i18n.t(`${texts}.search`)}
            aria-label={i18n.t(`${texts}.search`)}
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
            {i18n.t(query ? `${texts}.noMatch` : `${texts}.none`)}
          </Typography>}
        {rows && rows.length > 0 &&
          <InfiniteScroll
            dataLength={rows.length}
            next={readMore}
            hasMore={rows.length < total && !hasFailed}
            loader={<Progress key="blocked-progress" />}
            scrollableTarget={scrollId}
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {i18n.t('commons:close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

BlockedDialog.propTypes = {
  actor: ActorType.isRequired,
  viewer: PersonType.isRequired,
  alertError: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCount: PropTypes.func.isRequired,
};

// Who the viewer has blocked, in their settings, or who a group or an event
// has, in its settings: how many, and the way to the list.
//
// A person's blocks are theirs alone, so they are in their settings. One line, however many there
// are: the list itself opens in a dialog, so that a long one does not push
// the rest of the page out of reach.
const ActorsSettingsBlocked = ({
  actor,
  viewer,
  alertError,
}) => {
  // null until it is known.
  const [count, setCount] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    api.socialgraph.browse({
      filter: 'blocks',
      actor,
      start: 0,
      limit: 1,
    }).then((result) => {
      setCount((result.data.pagination && result.data.pagination.total) || 0);
    }).catch(() => {
      // The number is left out. The list says what went wrong, if asked.
    });
  }, [actor.id]);

  return (
    <Card>
      <CardHeader
        title={i18n.t('socialgraph:blocks')}
        subheader={count === null ? null : i18n.t(count > 0 ?
          'socialgraph:blocked.count' :
          `${textsFor(actor, viewer)}.none`, { count })}
        action={
          <Button
            onClick={() => {
              setIsOpen(true);
            }}
            disabled={count === 0}
          >
            {i18n.t('socialgraph:blocked.manage')}
          </Button>
        }
        sx={{ '& .MuiCardHeader-action': { alignSelf: 'center', m: 0 } }}
      />
      <BlockedDialog
        actor={actor}
        viewer={viewer}
        alertError={alertError}
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        onCount={setCount}
      />
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
