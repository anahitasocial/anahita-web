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

import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';

import i18n from '../../../languages';
import { Username as USERNAME } from '../../../constants';

// Change-username card.
//
// Collapsed by default, matching the email and password cards it sits
// beside: a settings page is read far more often than it is edited, and
// a form sitting permanently open invites accidental edits to a field
// that is also this person's public address.
const UsernameEdit = ({
  currentUsername,
  isEditing,
  fields,
  errors,
  submitting,
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
            <AlternateEmailIcon />
          </Avatar>
        }
        titleTypographyProps={{ variant: 'h5' }}
        title={i18n.t('username:title')}
      />
      <Divider />

      {/* Shown in both states. Collapsed it answers "what is my
          handle"; expanded it is what the person checks the new one
          against. */}
      <List>
        <ListItem>
          <ListItemText
            primary={i18n.t('username:fields.current')}
            secondary={currentUsername}
          />
        </ListItem>
      </List>

      {!isEditing &&
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            {i18n.t('username:description')}
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
            {i18n.t('username:change')}
          </Button>
        </CardActions>}

      {isEditing &&
        <>
          <Divider />
          <form onSubmit={onSubmit} noValidate>
            <CardContent>
              {/* Kept as body copy rather than folded into the header:
                  it carries the consequence — the old handle is
                  released and old profile links break — which the
                  person needs while deciding, not just while browsing. */}
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {i18n.t('username:description')}
              </Typography>

              <TextField
                name="username"
                label={i18n.t('username:fields.new')}
                value={fields.username.value}
                onChange={onChange}
                error={Boolean(errors.username)}
                helperText={errors.username || i18n.t('username:helper')}
                fullWidth
                margin="normal"
                variant="outlined"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck="false"
                autoFocus
                inputProps={{
                  minLength: USERNAME.USERNAME_MIN_LENGTH,
                  maxLength: USERNAME.USERNAME_MAX_LENGTH,
                  'aria-label': i18n.t('username:fields.new'),
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
                {submitting ? i18n.t('username:submitting') : i18n.t('username:submit')}
              </Button>
            </CardActions>
          </form>
        </>}
    </Card>
  );
};

UsernameEdit.propTypes = {
  currentUsername: PropTypes.string.isRequired,
  isEditing: PropTypes.bool.isRequired,
  fields: PropTypes.shape({
    username: PropTypes.shape({ value: PropTypes.string }).isRequired,
  }).isRequired,
  errors: PropTypes.shape({
    username: PropTypes.string,
  }).isRequired,
  submitting: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default UsernameEdit;
