import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from '@mui/material/Typography';

import DesktopMacIcon from '@mui/icons-material/DesktopMac';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import MobileIcon from '@mui/icons-material/Smartphone';
import TabletIcon from '@mui/icons-material/Tablet';
import BotIcon from '@mui/icons-material/Warning';
import AuthLogsIcon from '@mui/icons-material/History';

import i18n from '../../../languages';
import { OAuthClients as OAUTH_CLIENTS } from '../../../constants';

const clientDisplayName = (clientId) => {
  if (!clientId) return '';
  return OAUTH_CLIENTS[clientId] || clientId;
};

const AuthLogsCard = ({
  items = [],
  handleDelete,
  loading,
}) => {
  if (items.length === 0) {
    return null;
  }

  const getIcon = (authLog) => {
    const color = authLog.isActive === true ? 'primary' : 'disabled';

    if (authLog.device === 'mobile') {
      return <MobileIcon color={color} />;
    }

    if (authLog.device === 'tablet') {
      return <TabletIcon color={color} />;
    }

    if (authLog.device === 'desktop') {
      if (authLog.os === 'macOS') {
        return <DesktopMacIcon color={color} />;
      }

      return <DesktopWindowsIcon color={color} />;
    }

    return <BotIcon color={color} />;
  };

  // This device first, then the rest newest first.
  const sorted = [...items].sort((a, b) => {
    if (a.isViewer !== b.isViewer) return a.isViewer ? -1 : 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            <AuthLogsIcon />
          </Avatar>
        }
        title={i18n.t('auth:authLogs.cTitle')}
        slotProps={{
          title: { variant: 'subtitle1', sx: { fontWeight: 500 } },
        }}
      />
      <List disablePadding>
        {sorted.map((authLog, index) => {
          const key = `authLog-${authLog.id || index}`;
          const createdAt = moment.utc(authLog.createdAt).local().format('LLL').toString();
          const canDelete = authLog.isActive === true && authLog.isViewer === false;
          const clientName = clientDisplayName(authLog.clientId);

          let status = null;
          if (authLog.isViewer) {
            status = (
              <Chip label={i18n.t('auth:authLogs.thisDevice')} size="small" color="primary" />
            );
          } else if (authLog.isActive) {
            status = (
              <Chip
                label={i18n.t('auth:authLogs.cActive')}
                size="small"
                color="primary"
                variant="outlined"
              />
            );
          }

          // Every row the same shape, at every width: the app and its status;
          // the browser, system and place; when; Sign out under them, so that
          // nothing sits over the words on a mobile.
          return (
            <ListItem key={key} divider alignItems="flex-start">
              <ListItemAvatar>
                <Avatar>
                  {getIcon(authLog)}
                </Avatar>
              </ListItemAvatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" noWrap sx={{ flex: 1, minWidth: 0 }}>
                    {clientName || createdAt}
                  </Typography>
                  {status}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {i18n.t('auth:authLogs.cDesc', { ...authLog })}
                </Typography>
                {clientName && (
                  <Typography variant="body2" color="text.secondary">
                    {createdAt}
                  </Typography>
                )}
                {canDelete && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={() => {
                      handleDelete(authLog);
                    }}
                    disabled={loading}
                  >
                    {i18n.t('auth:authLogs.actions.forceLogout')}
                  </Button>
                )}
              </Box>
            </ListItem>
          );
        })}
      </List>
    </Card>
  );
};

AuthLogsCard.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any),
  handleDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default AuthLogsCard;
