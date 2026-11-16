import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';

import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import PersonType from '../../../proptypes/Person';
import Progress from '../../../components/Progress';

// The servers the viewer blocked for themselves (roadmap row 152), beside
// whom they blocked and muted: how many, and Manage, which opens the list,
// each with Unblock, and a way to block another by its name, a handle or
// an address on it. Most lately blocked first, read a page at a time.
const PAGE = 20;

// What a refusal from the server means, said.
const refusalOf = (error) => {
  const code = error && error.response && error.response.data && error.response.data.error;
  if (code === 'server_invalid') {
    return i18n.t('socialgraph:servers.invalid');
  }
  if (code === 'server_on_bluesky') {
    return i18n.t('socialgraph:servers.bluesky');
  }
  return i18n.t('socialgraph:servers.failed');
};

const BlockedServersDialog = ({
  viewer,
  open,
  onClose,
  onCount,
  alertError,
}) => {
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const load = (start) => {
    api.serverBlocks.browse({ person: viewer, start, limit: PAGE }).then((result) => {
      const page = result.data.data || [];
      const count = (result.data.pagination && result.data.pagination.total) || 0;
      setRows((before) => {
        return start === 0 || !before ? page : before.concat(page);
      });
      setTotal(count);
      onCount(count);
    }).catch(() => {
      setRows((before) => {
        return before || [];
      });
      alertError(i18n.t('socialgraph:servers.failed'));
    });
  };

  useEffect(() => {
    if (open) {
      setRows(null);
      setTyped('');
      setError('');
      load(0);
    }
  }, [open]);

  const block = () => {
    if (!typed.trim() || isSaving) {
      return;
    }
    setIsSaving(true);
    setError('');
    api.serverBlocks.add(viewer, typed.trim()).then(() => {
      setTyped('');
      load(0);
    }).catch((err) => {
      setError(refusalOf(err));
    }).finally(() => {
      setIsSaving(false);
    });
  };

  const unblock = (domain) => {
    api.serverBlocks.deleteItem(viewer, domain).then(() => {
      setRows((before) => {
        return (before || []).filter((row) => {
          return row.domain !== domain;
        });
      });
      setTotal(total - 1);
      onCount(total - 1);
    }).catch(() => {
      alertError(i18n.t('socialgraph:servers.failed'));
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="blocked-servers-title"
    >
      <DialogTitle id="blocked-servers-title">
        {i18n.t('socialgraph:servers.title')}
      </DialogTitle>
      <DialogContent id="blocked-servers-scroll" sx={{ minHeight: 240 }}>
        {/* The error line is kept, so that nothing moves when one comes. */}
        <Box
          component="form"
          sx={{
            display: 'flex', gap: 1, alignItems: 'flex-start', pt: 1,
          }}
          onSubmit={(event) => {
            event.preventDefault();
            block();
          }}
        >
          <TextField
            fullWidth
            size="small"
            label={i18n.t('socialgraph:servers.add')}
            placeholder={i18n.t('socialgraph:servers.placeholder')}
            value={typed}
            onChange={(event) => {
              setTyped(event.target.value);
              setError('');
            }}
            error={Boolean(error)}
            helperText={error || ' '}
            disabled={isSaving}
            slotProps={{
              htmlInput: { autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false },
              // Two lines kept for what is said under it, the longest of
              // which wraps on a mobile: nothing below moves.
              formHelperText: { sx: { minHeight: '2.66em' } },
            }}
          />
          <Button type="submit" variant="contained" disabled={isSaving || !typed.trim()} sx={{ flexShrink: 0, mt: 0.25 }}>
            {i18n.t('socialgraph:servers.block')}
          </Button>
        </Box>
        {rows === null && <Progress />}
        {rows !== null && rows.length > 0 &&
          <InfiniteScroll
            dataLength={rows.length}
            next={() => {
              load(rows.length);
            }}
            hasMore={rows.length < total}
            loader={<Progress />}
            scrollableTarget="blocked-servers-scroll"
          >
            <List disablePadding>
              {rows.map((row) => {
                return (
                  <ListItem
                    key={row.domain}
                    divider
                    secondaryAction={
                      <Button
                        onClick={() => {
                          unblock(row.domain);
                        }}
                      >
                        {i18n.t('actions:unblock')}
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={row.domain}
                      slotProps={{ primary: { noWrap: true } }}
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

BlockedServersDialog.propTypes = {
  viewer: PersonType.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCount: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const ActorsSettingsBlockedServers = ({ viewer, alertError }) => {
  // null until it is known.
  const [count, setCount] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    api.serverBlocks.browse({ person: viewer, start: 0, limit: 1 }).then((result) => {
      setCount((result.data.pagination && result.data.pagination.total) || 0);
    }).catch(() => {
      // The number is left out; the list says what went wrong, if asked.
    });
  }, [viewer.id]);

  return (
    <Card>
      <CardHeader
        title={i18n.t('socialgraph:servers.title')}
        subheader={count === null ? null : i18n.t(count > 0 ?
          'socialgraph:servers.count' :
          'socialgraph:servers.none', { count })}
        action={
          <Button
            onClick={() => {
              setIsOpen(true);
            }}
          >
            {i18n.t('socialgraph:blocked.manage')}
          </Button>
        }
        sx={{ '& .MuiCardHeader-action': { alignSelf: 'center', m: 0 } }}
      />
      <BlockedServersDialog
        viewer={viewer}
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        onCount={setCount}
        alertError={alertError}
      />
    </Card>
  );
};

ActorsSettingsBlockedServers.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(ActorsSettingsBlockedServers);
