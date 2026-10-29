import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import FediverseIcon from '@mui/icons-material/Hub';
import RemoveIcon from '@mui/icons-material/Delete';

import Progress from '../../components/Progress';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import federation from '../../utils/federation';

const LIMIT = 50;

// How long after the last key the list is asked for again.
const SEARCH_WAIT = 300;

// The servers this installation refuses, the Fediverse tab's Servers
// (Fediverse.jsx): nothing is taken from them, nothing is sent to them,
// and nobody on them can be looked up.
//
// Here, with the other settings that are the whole installation's, and
// not with the reports: refusing a server is a choice made for everybody
// on the site. The server holds it to super administrators as well.
//
// The list is read a page at a time and searched on the server. Most
// installations refuse a few dozen servers, but one that takes up a list
// somebody else keeps has thousands, and nobody finds a name in that by
// scrolling. Refusing one is done in a dialog, opened from the foot of the
// card: a form there would be a long way to read past.
//
// Refusing a server does not reach back. People from it who are already
// kept here stay, with their posts; that is said where one is refused,
// since the opposite is what most would expect.
const FediverseServers = ({
  alertSuccess,
  alertError,
}) => {
  const [blocks, setBlocks] = useState([]);
  const [total, setTotal] = useState(0);
  const [isFetching, setIsFetching] = useState(true);
  // An installation may not run the service at all.
  const [absent, setAbsent] = useState(false);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Answers come back in the order the server sends them, not the order
  // they were asked in: only the latest is kept.
  const asked = useRef(0);

  const load = useCallback((q, offset) => {
    asked.current += 1;
    const mine = asked.current;

    setIsFetching(true);

    return api.federation.blocks({ q, limit: LIMIT, offset })
      .then(({ data }) => {
        if (mine !== asked.current) {
          return;
        }

        const page = data.data || [];

        setBlocks((kept) => {
          return offset === 0 ? page : kept.concat(page);
        });
        setTotal((data.pagination && data.pagination.total) || 0);
      })
      .catch((err) => {
        if (federation.isAbsent(err)) {
          setAbsent(true);
          return;
        }
        alertError(i18n.t('settings:fediverse.errors.load'));
      })
      .finally(() => {
        if (mine === asked.current) {
          setIsFetching(false);
        }
      });
  }, [alertError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
    }, SEARCH_WAIT);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    load(query, 0);
  }, [load, query]);

  const close = () => {
    setOpen(false);
    setDomain('');
    setReason('');
  };

  const add = (event) => {
    event.preventDefault();
    setSubmitting(true);

    return api.federation.addBlock({ domain: domain.trim(), reason: reason.trim() })
      .then(({ data }) => {
        alertSuccess(i18n.t('settings:fediverse.added', { domain: data.domain }));
        close();
        return load(query, 0);
      })
      .catch((err) => {
        alertError(i18n.t(`settings:fediverse.errors.${federation.reasonOf(err)}`, {
          defaultValue: i18n.t('settings:fediverse.errors.generic'),
        }));
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  // Taken out of what is shown and not read again: reading again would
  // lose the reader's place in a long list.
  const remove = (block) => {
    return api.federation.removeBlock(block.domain)
      .then(() => {
        alertSuccess(i18n.t('settings:fediverse.removed', { domain: block.domain }));
        setBlocks((kept) => {
          return kept.filter((other) => {
            return other.domain !== block.domain;
          });
        });
        setTotal((count) => {
          return Math.max(count - 1, 0);
        });
      })
      .catch(() => {
        alertError(i18n.t('settings:fediverse.errors.generic'));
      });
  };

  const searching = query !== '';
  // Nothing to search until there is something refused.
  const showSearch = searching || total > 0;

  // In the card of the Fediverse tab, under its tabs.
  return (
    <>
      <CardHeader
        avatar={
          <Avatar>
            <FediverseIcon />
          </Avatar>
          }
        title={
          <Typography variant="h6">
            {i18n.t('settings:fediverse.cTitle')}
          </Typography>
          }
        subheader={i18n.t('settings:fediverse.cDescription')}
      />
      <Divider />
      {isFetching && <LinearProgress />}

      {absent &&
      <CardContent>
        <Typography variant="body2" color="textSecondary">
          {i18n.t('settings:fediverse.absent')}
        </Typography>
      </CardContent>}

      {!absent &&
      <>
        {showSearch &&
        <CardContent sx={{ pb: 0 }}>
          <TextField
            name="search"
            type="search"
            label={i18n.t('settings:fediverse.search')}
            helperText={i18n.t('settings:fediverse.count', { count: total })}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            autoComplete="off"
            size="small"
            fullWidth
          />
        </CardContent>}

        {!isFetching && blocks.length === 0 &&
        <CardContent>
          <Typography variant="body2">
            {searching ?
              i18n.t('settings:fediverse.noneFound') :
              i18n.t('settings:fediverse.none')}
          </Typography>
        </CardContent>}

        {blocks.length > 0 &&
        <InfiniteScroll
          dataLength={blocks.length}
          next={() => {
            load(query, blocks.length);
          }}
          hasMore={blocks.length < total}
          loader={<Progress key="blocks-progress" />}
        >
          <List>
            {blocks.map((block) => {
              return (
                <ListItem
                  key={block.domain}
                  divider
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label={i18n.t('settings:fediverse.remove', { domain: block.domain })}
                      title={i18n.t('settings:fediverse.remove', { domain: block.domain })}
                      onClick={() => {
                        remove(block);
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                        }
                >
                  <ListItemText
                    primary={block.domain}
                    secondary={block.reason || i18n.t('settings:fediverse.noReason')}
                    slotProps={{
                      primary: { sx: { overflowWrap: 'anywhere' } },
                      secondary: { sx: { overflowWrap: 'anywhere' } },
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        </InfiniteScroll>}

        {/* Last, so the list ends on its own line and not on the
                edge of the card. */}
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => {
              setOpen(true);
            }}
          >
            {i18n.t('settings:fediverse.open')}
          </Button>
        </CardActions>
      </>}

      <Dialog
        open={open}
        onClose={close}
        aria-labelledby="refuse-server-title"
        fullWidth
      >
        <form onSubmit={add}>
          <DialogTitle id="refuse-server-title">
            {i18n.t('settings:fediverse.open')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {i18n.t('settings:fediverse.staysHere')}
            </DialogContentText>
            <TextField
              name="domain"
              label={i18n.t('settings:fediverse.domain.label')}
              helperText={i18n.t('settings:fediverse.domain.help')}
              value={domain}
              onChange={(event) => {
                setDomain(event.target.value);
              }}
              autoComplete="off"
              margin="normal"
              autoFocus
              required
              fullWidth
            />
            <TextField
              name="reason"
              label={i18n.t('settings:fediverse.reason.label')}
              helperText={i18n.t('settings:fediverse.reason.help')}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
              }}
              slotProps={{ htmlInput: { maxLength: 500 } }}
              autoComplete="off"
              margin="normal"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button fullWidth onClick={close} variant="outlined">
              {i18n.t('settings:fediverse.cancel')}
            </Button>
            <Button
              fullWidth
              type="submit"
              color="secondary"
              variant="contained"
              disabled={!domain.trim() || submitting}
            >
              {i18n.t('settings:fediverse.add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

FediverseServers.propTypes = {
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(FediverseServers);
