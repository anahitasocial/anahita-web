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

import RefusedIcon from '@mui/icons-material/PersonOffOutlined';
import RemoveIcon from '@mui/icons-material/Delete';

import Progress from '../../components/Progress';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import federation from '../../utils/federation';

const LIMIT = 50;

// How long after the last key the list is asked for again.
const SEARCH_WAIT = 300;

// The accounts on other networks this installation refuses one by one, the
// Fediverse tab's Accounts (Fediverse.jsx; anahita-services'
// docs/federation.md, "Accounts that are refused"): on the fediverse by
// their address, on Bluesky by their DID. Nothing is taken from them or
// sent to them, nobody here can follow them, and what was here of them was
// removed when they were refused.
//
// Administrators', as moderating one account is theirs. Refused here by a
// handle or an address, kept here or not; or from the account's own
// profile, or a report about it. Read a page at a time, newest first, and
// searched on the server, as the servers are.
const FediverseAccounts = ({
  alertSuccess,
  alertError,
}) => {
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [isFetching, setIsFetching] = useState(true);
  // An installation may not run the service at all.
  const [absent, setAbsent] = useState(false);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Only the latest answer is kept, whatever order they come back in.
  const asked = useRef(0);

  const load = useCallback((q, offset) => {
    asked.current += 1;
    const mine = asked.current;

    setIsFetching(true);

    return api.federation.refusedAccounts({ q, limit: LIMIT, offset })
      .then(({ data }) => {
        if (mine !== asked.current) {
          return;
        }

        const page = data.data || [];

        setAccounts((kept) => {
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

  // What an account is called in the list: its name, else its handle,
  // else what it is kept by.
  const nameOf = (account) => {
    return account.name || account.handle || account.identifier;
  };

  const close = () => {
    setOpen(false);
    setAddress('');
    setReason('');
  };

  const add = (event) => {
    event.preventDefault();
    setSubmitting(true);

    return api.federation.refuseAccount({ address: address.trim(), reason: reason.trim() })
      .then(({ data }) => {
        alertSuccess(i18n.t('settings:fediverse.accounts.added', { name: nameOf(data) }));
        close();
        return load(query, 0);
      })
      .catch((err) => {
        alertError(i18n.t(`settings:fediverse.accounts.errors.${federation.reasonOf(err)}`, {
          defaultValue: i18n.t('settings:fediverse.errors.generic'),
        }));
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  // Taken out of what is shown and not read again, keeping the reader's
  // place in a long list.
  const remove = (account) => {
    return api.federation.letAccountBack(account.id)
      .then(() => {
        alertSuccess(i18n.t('settings:fediverse.accounts.removed', { name: nameOf(account) }));
        setAccounts((kept) => {
          return kept.filter((other) => {
            return other.id !== account.id;
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

  // Under its name: its handle where that is not its name, the network,
  // and why it is refused.
  const detailsOf = (account) => {
    const parts = [];
    if (account.handle && account.handle !== nameOf(account)) {
      parts.push(account.handle);
    }
    parts.push(i18n.t(`settings:fediverse.accounts.networks.${account.network}`, {
      defaultValue: account.network,
    }));
    parts.push(account.reason || i18n.t('settings:fediverse.accounts.noReason'));
    return parts.join(' · ');
  };

  // In the card of the Fediverse tab, under its tabs.
  return (
    <>
      <CardHeader
        avatar={
          <Avatar>
            <RefusedIcon />
          </Avatar>
        }
        title={
          <Typography variant="h6">
            {i18n.t('settings:fediverse.accounts.cTitle')}
          </Typography>
        }
        subheader={i18n.t('settings:fediverse.accounts.cDescription')}
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
                label={i18n.t('settings:fediverse.accounts.search')}
                helperText={i18n.t('settings:fediverse.accounts.count', { count: total })}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                }}
                autoComplete="off"
                size="small"
                fullWidth
              />
            </CardContent>}

          {!isFetching && accounts.length === 0 &&
            <CardContent>
              <Typography variant="body2">
                {searching ?
                  i18n.t('settings:fediverse.accounts.noneFound') :
                  i18n.t('settings:fediverse.accounts.none')}
              </Typography>
            </CardContent>}

          {accounts.length > 0 &&
            <InfiniteScroll
              dataLength={accounts.length}
              next={() => {
                load(query, accounts.length);
              }}
              hasMore={accounts.length < total}
              loader={<Progress key="refused-accounts-progress" />}
            >
              <List>
                {accounts.map((account) => {
                  const label = i18n.t('settings:fediverse.accounts.remove', { name: nameOf(account) });
                  return (
                    <ListItem
                      key={account.id}
                      divider
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label={label}
                          title={label}
                          onClick={() => {
                            remove(account);
                          }}
                        >
                          <RemoveIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={nameOf(account)}
                        secondary={detailsOf(account)}
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

          {/* Last, so the list ends on its own line and not on the edge
              of the card. */}
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Button
              color="secondary"
              variant="contained"
              onClick={() => {
                setOpen(true);
              }}
            >
              {i18n.t('settings:fediverse.accounts.open')}
            </Button>
          </CardActions>
        </>}

      <Dialog
        open={open}
        onClose={submitting ? undefined : close}
        aria-labelledby="refuse-account-title"
        fullWidth
      >
        <form onSubmit={add}>
          <DialogTitle id="refuse-account-title">
            {i18n.t('settings:fediverse.accounts.open')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {i18n.t('settings:fediverse.accounts.removes')}
            </DialogContentText>
            <TextField
              name="address"
              label={i18n.t('settings:fediverse.accounts.address.label')}
              helperText={i18n.t('settings:fediverse.accounts.address.help')}
              value={address}
              onChange={(event) => {
                setAddress(event.target.value);
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
              helperText={i18n.t('settings:fediverse.accounts.reasonHelp')}
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
            <Button fullWidth onClick={close} variant="outlined" disabled={submitting}>
              {i18n.t('settings:fediverse.cancel')}
            </Button>
            <Button
              fullWidth
              type="submit"
              color="secondary"
              variant="contained"
              disabled={!address.trim() || submitting}
            >
              {i18n.t('settings:fediverse.accounts.add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

FediverseAccounts.propTypes = {
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

export default connect(null, mapDispatchToProps)(FediverseAccounts);
