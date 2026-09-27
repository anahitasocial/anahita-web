import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { makeStyles } from 'tss-react/mui';

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

const useStyles = makeStyles()((theme) => {
  return ({
    chip: {
      marginLeft: theme.spacing(1),
      height: 20,
      fontSize: '0.75rem',
    },
  });
});

const AuthLogsCard = ({
  items = [],
  handleDelete,
  loading,
}) => {
  const { classes } = useStyles();

  if (items.length === 0) {
    return (<></>);
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
          title: { variant: 'h5' },
        }}
      />
      <List>
        {items.map((authLog, index) => {
          const key = `authLog-${index}`;
          const createdAt = moment.utc(authLog.createdAt).local().format('LLL').toString();
          const avatarIcon = getIcon(authLog);
          const canDelete = authLog.isActive === true && authLog.isViewer === false;
          const clientName = clientDisplayName(authLog.clientId);
          return (
            <div key={key}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    {avatarIcon}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  secondary={i18n.t('auth:authLogs.cDesc', {
                    ...authLog,
                  })}
                  primary={
                    <>
                      <span>
                        {clientName ? `${createdAt} · ${clientName}` : createdAt}
                      </span>
                      {authLog.isActive && (
                        <Chip
                          label={i18n.t('auth:authLogs.cActive')}
                          size="small"
                          color="primary"
                          className={classes.chip}
                        />
                      )}
                    </>
                  }
                />
                {canDelete &&
                  <ListItemSecondaryAction>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        handleDelete(authLog);
                      }}
                      disabled={loading}
                    >
                      {i18n.t('auth:authLogs.actions.forceLogout')}
                    </Button>
                  </ListItemSecondaryAction>}
              </ListItem>
              <Divider variant="inset" component="li" />
            </div>
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
