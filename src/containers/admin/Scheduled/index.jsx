import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import ScheduledIcon from '@mui/icons-material/DeleteOutlined';
import PersonIcon from '@mui/icons-material/PersonOutlined';
import GroupIcon from '@mui/icons-material/GroupsOutlined';
import EventIcon from '@mui/icons-material/EventOutlined';
import WebsiteIcon from '@mui/icons-material/RssFeed';

import Progress from '../../../components/Progress';
import ScheduledDeletion from '../../../components/ScheduledDeletion';
import actions from '../../../actions';
import api from '../../../api';
import deletion from '../../../utils/deletion';
import i18n from '../../../languages';

// The kinds of profile that can be scheduled for deletion, with their icon.
const KINDS = {
  person: <PersonIcon />,
  group: <GroupIcon />,
  event: <EventIcon />,
  website: <WebsiteIcon />,
};

// As many of each kind as one request lists. A site with more on their way
// out than this at once is cleaning up in bulk, which is the Accounts tab's.
const LIMIT = 100;

// Where a profile is read.
const profilePath = (account) => {
  return account.kind === 'person' ?
    `/people/${account.alias}/` :
    `/@${account.alias}/`;
};

// Where it is restored or removed for good: its settings. A person restores
// their own by signing in; a super administrator can remove them for good
// from theirs.
const settingsPath = (account) => {
  if (account.kind === 'person') {
    return `/people/${account.alias}/settings`;
  }
  return `/${account.kind}s/${account.id}/settings`;
};

// Every profile scheduled for deletion, of every kind, soonest first (the
// user, 2026-10-18): for a super administrator, who sees them all. Each
// carries its days left and leads to its settings.
const Scheduled = ({ alertError }) => {
  const [items, setItems] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all(Object.keys(KINDS).map((kind) => {
      return api.accounts.browse({ kind, state: 'deleted', limit: LIMIT })
        .then(({ data }) => {
          return (data.data || []).map((account) => {
            return { ...account, kind };
          });
        });
    }))
      .then((lists) => {
        if (cancelled) {
          return;
        }
        const all = lists.flat().sort((a, b) => {
          return (deletion.daysLeft(a) || 0) - (deletion.daysLeft(b) || 0);
        });
        setItems(all);
      })
      .catch(() => {
        alertError(i18n.t('admin:scheduled.loadError'));
      })
      .finally(() => {
        if (!cancelled) {
          setIsFetching(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [alertError]);

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            <ScheduledIcon />
          </Avatar>
        }
        title={
          <Typography variant="h6">
            {i18n.t('admin:scheduled.title')}
          </Typography>
        }
        subheader={i18n.t('admin:scheduled.description')}
      />
      <Divider />
      {isFetching && <Progress />}
      {!isFetching && items.length === 0 &&
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            {i18n.t('admin:scheduled.empty')}
          </Typography>
        </CardContent>}
      {items.length > 0 &&
        <List>
          {items.map((account) => {
            return (
              <ListItem
                key={`${account.kind}-${account.id}`}
                divider
                alignItems="flex-start"
                secondaryAction={
                  <Button
                    size="small"
                    component={Link}
                    to={settingsPath(account)}
                  >
                    {i18n.t('admin:scheduled.settings')}
                  </Button>
                }
              >
                <ListItemAvatar>
                  <Avatar>
                    {KINDS[account.kind]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  sx={{ pr: 10 }}
                  primary={
                    <Typography variant="subtitle1">
                      <MuiLink
                        component={Link}
                        to={profilePath(account)}
                        underline="hover"
                        color="inherit"
                      >
                        {account.name || account.alias}
                      </MuiLink>
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="textSecondary">
                        {`@${account.alias} · ${i18n.t(`admin:scheduled.kinds.${account.kind}`)}`}
                      </Typography>
                      <ScheduledDeletion actor={account} sx={{ mt: 0.5 }} />
                    </>
                  }
                />
              </ListItem>
            );
          })}
        </List>}
    </Card>
  );
};

Scheduled.propTypes = {
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(Scheduled);
