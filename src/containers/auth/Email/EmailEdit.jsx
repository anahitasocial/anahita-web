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
  sent,
  onOpen,
  onCancel,
  onChange,
  onSubmit,
}) => {
  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            <EmailIcon />
          </Avatar>
        }
        titleTypographyProps={{ variant: 'h5' }}
        title={i18n.t('email:title')}
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
          {sent &&
            <Typography variant="body2" color="primary" gutterBottom>
              {i18n.t('email:sent', { email: currentEmail })}
            </Typography>}
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

      {isEditing &&
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
                inputProps={{
                  minLength: EMAIL_LIMITS.EMAIL_MIN_LENGTH,
                  maxLength: EMAIL_LIMITS.EMAIL_MAX_LENGTH,
                  'aria-label': i18n.t('email:fields.new'),
                }}
                disabled={submitting}
                required
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
  sent: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default EmailEdit;
