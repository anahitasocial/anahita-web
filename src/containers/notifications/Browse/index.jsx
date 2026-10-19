import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import NotificationsIcon from '@mui/icons-material/Notifications';

import NotificationsList from './List';
import Progress from '../../../components/Progress';

import NotificationsType from '../../../proptypes/Notifications';

import actions from '../../../actions';
import i18n from '../../../languages';
import { App as APP } from '../../../constants';

const {
  LIMIT,
} = APP.BROWSE;

const NotificationsBrowse = ({
  browseList,
  resetList,
  editItem,
  deleteItem,
  successAlert,
  errorAlert,
  lessUnread,
  items,
  isFetching,
  newestAt,
  total = 0,
}) => {
  // Each time the list is loaded from its start.
  const [round, setRound] = useState(0);
  const [failed, setFailed] = useState(false);
  const [answered, setAnswered] = useState(false);
  const loadedAt = useRef(null);

  const load = (start) => {
    setFailed(false);
    return browseList({ start, limit: LIMIT }).then(() => {
      setAnswered(true);
    }).catch(() => {
      setFailed(true);
    });
  };

  useEffect(() => {
    return () => {
      resetList();
    };
  }, []);

  useEffect(() => {
    resetList();
    loadedAt.current = newestAt;
    load(0);
  }, [round]);

  // Something new, by the bell's last check: the list is loaded again from
  // its start, so that it is at the top. Only newer: deleting the newest
  // makes it older, and moves nothing.
  useEffect(() => {
    if (loadedAt.current === null || !newestAt) {
      return;
    }
    if (!loadedAt.current || Date.parse(newestAt) > Date.parse(loadedAt.current)) {
      setRound(round + 1);
    }
  }, [newestAt]);

  // The next page begins after those on the page: a notification deleted
  // here, or taken away by the server, moves the rest up.
  const fetchList = () => {
    load(items.allIds.length);
  };

  const handleEdit = (item) => {
    if (item.isRead) {
      return;
    }
    editItem(item).then(() => {
      lessUnread();
      successAlert(i18n.t('notifications:markedRead'));
    }).catch(() => {
      errorAlert(i18n.t('prompts:updated.error'));
    });
  };

  const handleDelete = (item) => {
    deleteItem(item).then(() => {
      if (!item.isRead) {
        lessUnread();
      }
      successAlert(i18n.t('prompts:deleted.success'));
    }).catch(() => {
      errorAlert(i18n.t('prompts:deleted.error'));
    });
  };

  const empty = answered && !isFetching && items.allIds.length === 0;

  return (
    <Container maxWidth="md">
      <Card>
        <CardHeader
          avatar={
            <Avatar>
              <NotificationsIcon />
            </Avatar>
          }
          title={
            <Typography variant="h6" component="h1">
              {i18n.t('notifications:cTitle')}
            </Typography>
          }
        />
        {failed &&
          <CardContent>
            <Alert
              severity="warning"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    load(items.allIds.length);
                  }}
                >
                  {i18n.t('search:retry')}
                </Button>
              }
            >
              {i18n.t('notifications:failed')}
            </Alert>
          </CardContent>}
        {!answered && !failed && <Progress />}
        {empty && !failed &&
          <CardContent>
            <Typography variant="body2" color="textSecondary">
              {i18n.t('notifications:none')}
            </Typography>
          </CardContent>}
        <NotificationsList
          items={items}
          hasMore={!failed && total > items.allIds.length}
          fetchList={fetchList}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      </Card>
    </Container>
  );
};

NotificationsBrowse.propTypes = {
  browseList: PropTypes.func.isRequired,
  resetList: PropTypes.func.isRequired,
  editItem: PropTypes.func.isRequired,
  deleteItem: PropTypes.func.isRequired,
  successAlert: PropTypes.func.isRequired,
  errorAlert: PropTypes.func.isRequired,
  lessUnread: PropTypes.func.isRequired,
  items: NotificationsType.isRequired,
  isFetching: PropTypes.bool.isRequired,
  newestAt: PropTypes.string.isRequired,
  total: PropTypes.number,
};

const mapStateToProps = (state) => {
  const {
    notifications: items,
    total,
    isFetching,
  } = state.notifications;

  return {
    items,
    total,
    isFetching,
    newestAt: state.notificationsUnread.newestAt,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    browseList: (params) => {
      return dispatch(actions.notifications.browse(params));
    },
    resetList: () => {
      return dispatch(actions.notifications.reset());
    },
    editItem: (item) => {
      return dispatch(actions.notifications.edit(item));
    },
    deleteItem: (item) => {
      return dispatch(actions.notifications.deleteItem(item));
    },
    successAlert: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    errorAlert: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
    lessUnread: () => {
      return dispatch(actions.notifications.unread.less());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(NotificationsBrowse);
