/* eslint-disable react/jsx-no-duplicate-props */
import React from 'react';
import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PasswordIcon from '@mui/icons-material/Lock';

import i18n from '../../../languages';
import { Password as PASSWORD } from '../../../constants';

const { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } = PASSWORD;

// Collapsed by default: header plus a single "Update password" button.
// Opening the form is a deliberate act, and Cancel puts it away again.
const PasswordEdit = ({
  isEditing,
  fields,
  errors,
  submitting,
  showNewPassword,
  onOpen,
  onCancel,
  onChange,
  onSubmit,
  onToggleVisibility,
}) => {
  return (
    <Card>
      {/* CardHeader rather than an inline Typography heading, matching
          the Two-Factor Auth, Passkeys, and Authentications cards this
          now sits alongside in the Security tab. */}
      <CardHeader
        avatar={
          <Avatar>
            <PasswordIcon />
          </Avatar>
        }
        title={i18n.t('password:cTitle')}
        subheader={i18n.t('password:cDesc')}
        slotProps={{
          title: { variant: 'h5' },
        }}
      />
      <Divider />
      {!isEditing &&
        <CardActions>
          <Button
            onClick={onOpen}
            color="primary"
            variant="outlined"
            fullWidth
          >
            {i18n.t('password:submit')}
          </Button>
        </CardActions>}

      {isEditing &&
        <>
          <form onSubmit={onSubmit} noValidate>
            <CardContent>
              {/* Kept as body copy rather than folded into the subheader —
                  it carries the length requirement, which the person needs
                  while typing, not just while deciding whether to open the
                  card. */}
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {i18n.t('password:description', { count: PASSWORD_MIN_LENGTH })}
              </Typography>

              <TextField
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                label={i18n.t('password:fields.new')}
                value={fields.newPassword.value}
                onChange={onChange}
                error={Boolean(errors.newPassword)}
                helperText={errors.newPassword || ''}
                fullWidth
                margin="normal"
                variant="outlined"
                autoComplete="new-password"
                disabled={submitting}
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showNewPassword
                              ? i18n.t('password:toggle.hide')
                              : i18n.t('password:toggle.show')
                          }
                          aria-pressed={showNewPassword}
                          onClick={onToggleVisibility}
                          edge="end"
                          disabled={submitting}
                          tabIndex={-1}
                          size="large"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },

                  htmlInput: {
                    minLength: PASSWORD_MIN_LENGTH,
                    maxLength: PASSWORD_MAX_LENGTH,
                    'aria-label': i18n.t('password:fields.new'),
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
                {submitting ? i18n.t('password:submitting') : i18n.t('password:update')}
              </Button>
            </CardActions>
          </form>
        </>}
    </Card>
  );
};

PasswordEdit.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  fields: PropTypes.shape({
    newPassword: PropTypes.shape({ value: PropTypes.string }).isRequired,
  }).isRequired,
  errors: PropTypes.shape({
    newPassword: PropTypes.string,
  }).isRequired,
  submitting: PropTypes.bool.isRequired,
  showNewPassword: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onToggleVisibility: PropTypes.func.isRequired,
};

export default PasswordEdit;
