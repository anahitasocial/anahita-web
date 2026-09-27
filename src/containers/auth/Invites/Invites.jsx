import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
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
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';

import AddIcon from '@mui/icons-material/Add';
import AcceptedIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpiredIcon from '@mui/icons-material/HourglassEmpty';
import InvitesIcon from '@mui/icons-material/MailOutline';

import i18n from '../../../languages';
import InvitesType from '../../../proptypes/Invites';

const useStyles = makeStyles((theme) => {
  return {
    meta: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginTop: theme.spacing(0.5),
    },
    chip: {
      marginRight: theme.spacing(0.5),
    },
    destructive: {
      color: theme.palette.error.main,
    },
  };
});

const formatDate = (value) => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

// The status is the row's most useful fact, so it leads with an icon
// rather than only a chip — scannable down the left edge on a phone,
// where the chips have wrapped somewhere below the address.
const iconFor = (status) => {
  if (status === 'used') {
    return <AcceptedIcon />;
  }

  if (status === 'expired') {
    return <ExpiredIcon />;
  }

  return <InvitesIcon />;
};

const Invites = ({
  items,
  isFetching = false,
  canAdd = false,
  canDelete = false,
  onAdd,
  onDelete,
}) => {
  const classes = useStyles();
  const [revoking, setRevoking] = useState(null);

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            <InvitesIcon />
          </Avatar>
        }
        title={
          <Typography variant="h6">
            {i18n.t('invites:cTitle')}
          </Typography>
        }
      />
      <Divider />

      {isFetching && <LinearProgress />}

      {!isFetching && items.length === 0 &&
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            {i18n.t('invites:empty')}
          </Typography>
        </CardContent>}

      {items.length > 0 &&
        <List disablePadding>
          {items.map((invite) => {
            // Only a waiting invitation can meaningfully be revoked.
            // Deleting an accepted one would email somebody who
            // already has an account to tell them a link they no
            // longer need has been withdrawn, and an expired one is
            // already dead. The server permits either; the screen
            // does not offer them.
            const revocable = canDelete && invite.status === 'pending';

            return (
              <ListItem key={invite.id} divider>
                <ListItemAvatar>
                  <Avatar>
                    {iconFor(invite.status)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={invite.recipientEmail}
                  // component: div because secondary holds Chips,
                  // which are block-level. Without it MUI nests them
                  // in a <p> and the markup is invalid.
                  secondaryTypographyProps={{ component: 'div' }}
                  secondary={
                    <>
                      {/* No "sent by": the server scopes this list to
                          the viewer, so every row is their own and the
                          author would be the same name on all of
                          them. */}
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(invite.createdAt)}
                      </Typography>
                      <div className={classes.meta}>
                        <Chip
                          size="small"
                          variant="outlined"
                          className={classes.chip}
                          color={invite.status === 'pending' ? 'primary' : 'default'}
                          label={i18n.t(`invites:status.${invite.status}`, {
                            defaultValue: invite.status,
                          })}
                        />
                      </div>
                    </>
                  }
                />
                {revocable &&
                  <ListItemSecondaryAction>
                    <Tooltip title={i18n.t('invites:actions.revoke')}>
                      <IconButton
                        edge="end"
                        className={classes.destructive}
                        aria-label={i18n.t('invites:actions.revokeFor', {
                          email: invite.recipientEmail,
                        })}
                        onClick={() => {
                          setRevoking(invite);
                        }}
                        size="large"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>}
              </ListItem>
            );
          })}
        </List>}

      {canAdd &&
        <CardActions>
          <Button
            color="primary"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAdd}
            fullWidth
          >
            {i18n.t('invites:actions.add')}
          </Button>
        </CardActions>}

      {/* Confirmed because revoking mails the person to say their link
          is dead. Without that mail the invitation would simply stop
          working, which reads as a broken site rather than a decision —
          they have no account to check, so there is nowhere else for
          them to find out. Which also makes it a message sent on a
          click, and worth one question first. */}
      <Dialog
        open={Boolean(revoking)}
        onClose={() => {
          setRevoking(null);
        }}
        fullWidth
        maxWidth="xs"
      >
        {revoking &&
          <>
            <DialogTitle>
              {i18n.t('invites:confirmRevoke.cTitle')}
            </DialogTitle>
            <DialogContent>
              <DialogContentText variant="body2">
                {i18n.t('invites:confirmRevoke.cDescription', {
                  email: revoking.recipientEmail,
                })}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                fullWidth
                onClick={() => {
                  setRevoking(null);
                }}
              >
                {i18n.t('commons:dismiss')}
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => {
                  const invite = revoking;
                  setRevoking(null);
                  onDelete(invite);
                }}
              >
                {i18n.t('invites:actions.revoke')}
              </Button>
            </DialogActions>
          </>}
      </Dialog>
    </Card>
  );
};

Invites.propTypes = {
  items: InvitesType.isRequired,
  isFetching: PropTypes.bool,
  canAdd: PropTypes.bool,
  canDelete: PropTypes.bool,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default Invites;
