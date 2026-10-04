import React from 'react';
import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import EmailIcon from '@mui/icons-material/Email';

import i18n from '../../../languages';
import { Email as EMAIL_LIMITS } from '../../../constants';

// Change-email card.
//
// Collapsed by default: the address plus a single "Change email"
// button. A settings page is read far more often than it is edited, and
// a form sitting permanently open invites accidental edits to the one
// field that controls account recovery. Opening it is a deliberate act.
const EmailEdit = ({
  currentEmail,
  isEditing,
  fields,
  errors,
  submitting,
  pendingEmail,
  code,
  codeError,
  confirming,
  onOpen,
  onCancel,
  onChange,
  onSubmit,
  onCodeChange,
  onConfirm,
}) => {
  // Two steps inside the open card: the new address, then the code that
  // was mailed to the current one.
  const awaitingCode = isEditing && Boolean(pendingEmail);

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            <EmailIcon />
          </Avatar>
        }
        title={i18n.t('email:title')}
        slotProps={{
          title: { variant: 'h5' },
        }}
      />
      <Divider />

      {/* Shown in both states. Collapsed it answers "what is my
          address"; expanded it is the reference the person checks the
          new address against before confirming. */}
      <List>
        <ListItem>
          <ListItemText
            primary={i18n.t('email:fields.current')}
            secondary={currentEmail}
          />
        </ListItem>
      </List>

      {!isEditing &&
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            {i18n.t('email:description')}
          </Typography>
        </CardContent>}

      {!isEditing &&
        <CardActions>
          <Button
            onClick={onOpen}
            color="primary"
            variant="outlined"
            fullWidth
          >
            {i18n.t('email:change')}
          </Button>
        </CardActions>}

      {awaitingCode &&
        <>
          <Divider />
          <form onSubmit={onConfirm} noValidate>
            <CardContent>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {i18n.t('email:sent', { email: currentEmail, newEmail: pendingEmail })}
              </Typography>

              <TextField
                name="code"
                label={i18n.t('email:fields.code')}
                value={code}
                onChange={onCodeChange}
                error={Boolean(codeError)}
                helperText={codeError || ''}
                fullWidth
                margin="normal"
                variant="outlined"
                autoComplete="one-time-code"
                autoFocus
                disabled={confirming}
                required
                slotProps={{
                  htmlInput: {
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    maxLength: 6,
                    'aria-label': i18n.t('email:fields.code'),
                  },
                }}
              />
            </CardContent>

            <CardActions>
              <Button
                onClick={onCancel}
                disabled={confirming}
                fullWidth
              >
                {i18n.t('actions:cancel')}
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={confirming}
                startIcon={confirming ? <CircularProgress size={16} color="inherit" /> : null}
                fullWidth
              >
                {confirming ? i18n.t('email:confirming') : i18n.t('email:confirm')}
              </Button>
            </CardActions>
          </form>
        </>}

      {isEditing && !awaitingCode &&
        <>
          <Divider />
          <form onSubmit={onSubmit} noValidate>
            <CardContent>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {i18n.t('email:description')}
              </Typography>

              <TextField
                type="email"
                name="email"
                label={i18n.t('email:fields.new')}
                value={fields.email.value}
                onChange={onChange}
                error={Boolean(errors.email)}
                helperText={errors.email || ''}
                fullWidth
                margin="normal"
                variant="outlined"
                autoComplete="off"
                autoFocus
                disabled={submitting}
                required
                slotProps={{
                  htmlInput: {
                    minLength: EMAIL_LIMITS.EMAIL_MIN_LENGTH,
                    maxLength: EMAIL_LIMITS.EMAIL_MAX_LENGTH,
                    'aria-label': i18n.t('email:fields.new'),
                  },
                }}
              />

            </CardContent>

            <CardActions>
              <Button
                onClick={onCancel}
                disabled={submitting}
                fullWidth
              >
                {i18n.t('actions:cancel')}
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
                fullWidth
              >
                {submitting ? i18n.t('email:submitting') : i18n.t('email:submit')}
              </Button>
            </CardActions>
          </form>
        </>}
    </Card>
  );
};

EmailEdit.propTypes = {
  currentEmail: PropTypes.string.isRequired,
  isEditing: PropTypes.bool.isRequired,
  fields: PropTypes.objectOf(PropTypes.any).isRequired,
  errors: PropTypes.objectOf(PropTypes.string).isRequired,
  submitting: PropTypes.bool.isRequired,
  pendingEmail: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  codeError: PropTypes.string.isRequired,
  confirming: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCodeChange: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default EmailEdit;
