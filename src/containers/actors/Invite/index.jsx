import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import InviteIcon from '@mui/icons-material/PersonAddAlt1Outlined';

import ActorAvatar from '../../../components/ActorAvatar';
import Progress from '../../../components/Progress';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import ActorType from '../../../proptypes/Actor';
import PersonType from '../../../proptypes/Person';
import utils from '../../../utils';
import invites from '../../../utils/invites';
import socialgraph from '../../../utils/socialgraph';
import { App as APP } from '../../../constants';

const { getActorName } = utils.node;
const { LIMIT } = APP.BROWSE;

// The most one request may name. The server refuses more.
const MAX = 50;

const FOLLOWERS = 'followers';
const WAITING = 'waiting';

// Inviting people to follow a group.
//
// Who can be invited is the viewer's own followers: the list is theirs,
// found by name, and each is ticked. The server answers for each person,
// and what it said is shown beside their name: invited, follows already,
// declined lately, and so on. Nobody becomes a follower here. They are
// told, and choose.
//
// Whoever looks after the group also sees who is still to answer, and can
// take an invitation back.
const ActorsInvite = ({
  actor,
  viewer,
  canSeeWaiting = false,
  alertError,
}) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(FOLLOWERS);
  const [q, setQ] = useState('');
  // The viewer's followers: { rows, total } once read.
  const [people, setPeople] = useState(null);
  const [chosen, setChosen] = useState([]);
  // What the server said of each person asked so far.
  const [results, setResults] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [waiting, setWaiting] = useState(null);
  const [hasFailed, setHasFailed] = useState(false);

  const loadPeople = (start, search) => {
    api.socialgraph.browse({
      filter: 'followers',
      actor: viewer,
      start,
      limit: LIMIT,
      q: search,
    }).then((result) => {
      setPeople((before) => {
        return socialgraph.merge(before, result.data, start);
      });
    }).catch(() => {
      setHasFailed(true);
    });
  };

  const loadWaiting = () => {
    api.socialgraph.invites({ actor, limit: 100 }).then((result) => {
      setWaiting(result.data.data || []);
    }).catch(() => {
      setHasFailed(true);
    });
  };

  // Each time it is opened it starts over.
  useEffect(() => {
    if (open) {
      setTab(FOLLOWERS);
      setQ('');
      setChosen([]);
      setResults({});
      setWaiting(null);
      setHasFailed(false);
    }
  }, [open, actor.id]);

  // The list follows what is typed, a moment after the typing stops.
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setPeople(null);
    const timer = setTimeout(() => {
      loadPeople(0, q);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [open, q, viewer.id]);

  useEffect(() => {
    if (open && tab === WAITING && waiting === null) {
      loadWaiting();
    }
  }, [open, tab, waiting]);

  const handleSend = () => {
    setIsSending(true);
    api.socialgraph.invite({ actor, personIds: chosen }).then((result) => {
      setResults((before) => {
        return { ...before, ...invites.byPerson(result.data.data) };
      });
      setChosen([]);
      // Whoever was just invited is now among those waiting.
      setWaiting(null);
    }).catch((error) => {
      const status = error.response && error.response.status;
      alertError(i18n.t(status === 429 ?
        'socialgraph:invite.tooMany' :
        'socialgraph:invite.failed'));
    }).finally(() => {
      setIsSending(false);
    });
  };

  const handleWithdraw = (person) => {
    api.socialgraph.withdrawInvite({ actor, person }).then(() => {
      setWaiting((before) => {
        return (before || []).filter((each) => {
          return each.person.id !== person.id;
        });
      });
      setResults((before) => {
        const { [person.id]: gone, ...rest } = before;
        return rest;
      });
    }).catch(() => {
      alertError(i18n.t('socialgraph:invite.failed'));
    });
  };

  const scrollId = `invite-scroll-${actor.id}`;

  return (
    <>
      <Button
        startIcon={<InviteIcon />}
        onClick={() => {
          setOpen(true);
        }}
      >
        {i18n.t('socialgraph:invite.open')}
      </Button>
      <Dialog
        open={open}
        onClose={isSending ? undefined : () => {
          setOpen(false);
        }}
        fullWidth
        maxWidth="sm"
        aria-labelledby={`invite-title-${actor.id}`}
      >
        <DialogTitle id={`invite-title-${actor.id}`}>
          {i18n.t('socialgraph:invite.title', { name: getActorName(actor) })}
        </DialogTitle>
        {canSeeWaiting &&
          <Tabs
            value={tab}
            onChange={(event, value) => {
              setTab(value);
            }}
            variant="fullWidth"
            aria-label={i18n.t('socialgraph:invite.open')}
          >
            <Tab value={FOLLOWERS} label={i18n.t('socialgraph:invite.tabs.followers')} />
            <Tab value={WAITING} label={i18n.t('socialgraph:invite.tabs.waiting')} />
          </Tabs>}
        {tab === FOLLOWERS &&
          <Box sx={{ px: 3, pt: 2 }}>
            <TextField
              fullWidth
              size="small"
              value={q}
              onChange={(event) => {
                setQ(event.target.value);
              }}
              placeholder={i18n.t('socialgraph:invite.search')}
              slotProps={{
                htmlInput: {
                  'aria-label': i18n.t('socialgraph:invite.search'),
                  maxLength: 100,
                },
              }}
            />
            <Typography variant="body2" color="textSecondary" sx={{ pt: 1, pb: 1 }}>
              {i18n.t('socialgraph:invite.help')}
            </Typography>
          </Box>}
        <DialogContent dividers id={scrollId} sx={{ p: 0, minHeight: 240 }}>
          {hasFailed &&
            <Typography variant="body2" color="error" role="alert" sx={{ p: 2 }}>
              {i18n.t('socialgraph:failed')}
            </Typography>}
          {tab === FOLLOWERS && !people && !hasFailed && <Progress />}
          {tab === FOLLOWERS && people && people.rows.length === 0 &&
            <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
              {i18n.t(q ? 'socialgraph:invite.noMatch' : 'socialgraph:invite.noFollowers')}
            </Typography>}
          {tab === FOLLOWERS && people && people.rows.length > 0 &&
            <InfiniteScroll
              dataLength={people.rows.length}
              next={() => {
                loadPeople(people.rows.length, q);
              }}
              hasMore={people.rows.length < people.total}
              loader={<Progress key="invite-progress" />}
              scrollableTarget={scrollId}
            >
              <List disablePadding>
                {people.rows.map((person) => {
                  const result = results[person.id];
                  const labelId = `invite-person-${person.id}`;
                  return (
                    <ListItem key={`invite-${person.id}`} divider disablePadding>
                      <ListItemButton
                        // Somebody already answered for is not asked again
                        // from here.
                        disabled={Boolean(result) || isSending}
                        onClick={() => {
                          setChosen(invites.toggle(chosen, person.id, MAX));
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 0 }}>
                          <Checkbox
                            edge="start"
                            tabIndex={-1}
                            disableRipple
                            checked={chosen.includes(person.id)}
                            slotProps={{ input: { 'aria-labelledby': labelId } }}
                          />
                        </ListItemIcon>
                        <ListItemAvatar>
                          <ActorAvatar actor={person} />
                        </ListItemAvatar>
                        <ListItemText
                          id={labelId}
                          primary={getActorName(person)}
                          secondary={result ?
                            i18n.t(invites.resultKey(result)) :
                            (person.alias && `@${person.alias}`)}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </InfiniteScroll>}
          {tab === WAITING && waiting === null && !hasFailed && <Progress />}
          {tab === WAITING && waiting && waiting.length === 0 &&
            <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
              {i18n.t('socialgraph:invite.noneWaiting')}
            </Typography>}
          {tab === WAITING && waiting && waiting.length > 0 &&
            <List disablePadding>
              {waiting.map((each) => {
                return (
                  <ListItem
                    key={`waiting-${each.person.id}`}
                    divider
                    secondaryAction={
                      <Button
                        onClick={() => {
                          handleWithdraw(each.person);
                        }}
                      >
                        {i18n.t('socialgraph:invite.withdraw')}
                      </Button>
                    }
                  >
                    <ListItemAvatar>
                      <ActorAvatar actor={each.person} linked />
                    </ListItemAvatar>
                    <ListItemText
                      primary={getActorName(each.person)}
                      secondary={each.inviter ?
                        i18n.t('socialgraph:invite.by', { name: getActorName(each.inviter) }) :
                        null}
                    />
                  </ListItem>
                );
              })}
            </List>}
        </DialogContent>
        <DialogActions>
          {/* Side by side, each half the width: Close, then the one that
              does it. */}
          <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
            <Button
              fullWidth
              disabled={isSending}
              onClick={() => {
                setOpen(false);
              }}
            >
              {i18n.t('commons:close')}
            </Button>
            {tab === FOLLOWERS &&
              <Button
                fullWidth
                variant="contained"
                color="primary"
                disabled={isSending || chosen.length === 0}
                onClick={handleSend}
              >
                {!isSending && i18n.t('socialgraph:invite.send', { count: chosen.length })}
                {isSending && <CircularProgress size={24} />}
              </Button>}
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
};

ActorsInvite.propTypes = {
  // The group people are invited to follow.
  actor: ActorType.isRequired,
  viewer: PersonType.isRequired,
  // Whether the viewer looks after the group, and so sees who is still to
  // answer.
  canSeeWaiting: PropTypes.bool,
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

export default connect(mapStateToProps, mapDispatchToProps)(ActorsInvite);
