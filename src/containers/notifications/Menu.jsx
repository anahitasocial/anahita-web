import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import MarkAllReadIcon from '@mui/icons-material/DoneAll';

import NotificationItem from './Browse/ListItem';
import Progress from '../../components/Progress';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';

// How many the menu shows. The rest are on the page.
const SHOWN = 8;

// The bell's menu, on a desktop (roadmap row 97, part 4): the latest few,
// grouped and with what can be done from them, as on the page, and Mark all
// read and See all. Its own short list, apart from the page's. Following a
// link in it reads that one and closes it.
const NotificationsMenu = ({
  anchorEl,
  onClose,
  newestAt,
  unread,
  setUnread,
  readAll,
  successAlert,
  errorAlert,
}) => {
  const open = Boolean(anchorEl);
  const [items, setItems] = useState(null);
  const [failed, setFailed] = useState(false);

  // Read when opened, and again when something new comes while it is.
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    let current = true;
    setFailed(false);
    api.notifications.browse({ start: 0, limit: SHOWN }).then(({ data }) => {
      if (current) {
        setItems(data.data || []);
      }
    }).catch(() => {
      if (current) {
        setFailed(true);
      }
    });
    return () => {
      current = false;
    };
  }, [open, newestAt]);

  const recount = () => {
    api.notifications.count().then(({ data }) => {
      setUnread(Number(data.count) || 0, data.newestAt || '');
    }).catch(() => {
      // The bell's next look says it.
    });
  };

  const idsOf = (item) => {
    return item.ids && item.ids.length ? item.ids : [item.id];
  };

  const changed = (item, change) => {
    setItems((list) => {
      return change ?
        list.map((each) => { return each.id === item.id ? { ...each, ...change } : each; }) :
        list.filter((each) => { return each.id !== item.id; });
    });
  };

  const read = (item, quietly = false) => {
    if (item.isRead) {
      return;
    }
    Promise.all(idsOf(item).map((id) => { return api.notifications.edit({ id }); })).then(() => {
      changed(item, { isRead: true });
      recount();
      if (!quietly) {
        successAlert(i18n.t('notifications:markedRead'));
      }
    }).catch(() => {
      if (!quietly) {
        errorAlert(i18n.t('prompts:updated.error'));
      }
    });
  };

  const remove = (item) => {
    const gone = idsOf(item).map((id) => { return api.notifications.deleteItem({ id }); });
    Promise.all(gone).then(() => {
      changed(item, null);
      recount();
      successAlert(i18n.t('prompts:deleted.success'));
    }).catch(() => {
      errorAlert(i18n.t('prompts:deleted.error'));
    });
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: {
          sx: {
            width: 440, maxHeight: 'min(600px, calc(100vh - 96px))', display: 'flex', flexDirection: 'column',
          },
        },
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', px: 2, py: 1 }}>
        <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
          {i18n.t('notifications:cTitle')}
        </Typography>
        <Tooltip title={i18n.t('notifications:markAllRead')}>
          <span>
            <IconButton
              aria-label={i18n.t('notifications:markAllRead')}
              disabled={unread === 0}
              onClick={() => {
                readAll().then(() => {
                  setItems((list) => {
                    return (list || []).map((each) => { return { ...each, isRead: true }; });
                  });
                  successAlert(i18n.t('notifications:allMarkedRead'));
                }).catch(() => {
                  errorAlert(i18n.t('prompts:updated.error'));
                });
              }}
            >
              <MarkAllReadIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
      <Divider />
      {/* A link followed goes where it leads, and the menu closes. */}
      <Box
        sx={{ overflowY: 'auto', flexGrow: 1 }}
        onClickCapture={(event) => {
          if (event.target.closest && event.target.closest('a')) {
            onClose();
          }
        }}
      >
        {!items && !failed && <Progress />}
        {failed &&
          <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
            {i18n.t('notifications:failed')}
          </Typography>}
        {items && items.length === 0 &&
          <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
            {i18n.t('notifications:none')}
          </Typography>}
        {items && items.length > 0 &&
          <List disablePadding>
            {items.map((item) => {
              // The list's own shape: camel case, as the store keeps it.
              return (
                <NotificationItem
                  key={`menu-notification-${item.id}`}
                  item={item}
                  handleEdit={(each) => { read(each); }}
                  handleDelete={remove}
                  handleOpen={(each) => { read(each, true); }}
                />
              );
            })}
          </List>}
      </Box>
      <Divider />
      <Box sx={{ p: 1 }}>
        <Button fullWidth component={Link} to="/notifications" onClick={onClose}>
          {i18n.t('notifications:seeAll')}
        </Button>
      </Box>
    </Popover>
  );
};

NotificationsMenu.propTypes = {
  anchorEl: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  newestAt: PropTypes.string.isRequired,
  unread: PropTypes.number.isRequired,
  setUnread: PropTypes.func.isRequired,
  readAll: PropTypes.func.isRequired,
  successAlert: PropTypes.func.isRequired,
  errorAlert: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    newestAt: state.notificationsUnread.newestAt,
    unread: state.notificationsUnread.count,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setUnread: (count, newestAt) => {
      return dispatch(actions.notifications.unread.set(count, newestAt));
    },
    readAll: () => {
      return dispatch(actions.notifications.readAll());
    },
    successAlert: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    errorAlert: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NotificationsMenu);
