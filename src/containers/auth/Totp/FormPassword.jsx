import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { Totp as TOTP } from '../../../constants';
import i18n from '../../../languages';

const TOTPFormPassword = ({
  fields: {
    password,
  },
  handleOnChange,
  isFetching = false,
  success = false,
}) => {
  // Shown or hidden as on the password change, so the person can see what
  // they typed before it is checked.
  const [shown, setShown] = useState(false);
  const disabled = success || isFetching;

  return (
    <>
      <Typography variant="h5" color="primary">
        {i18n.t('auth:totp.password.title')}
      </Typography>
      <TextField
        variant="standard"
        type={shown ? 'text' : 'password'}
        name="password"
        value={password.value}
        onChange={handleOnChange}
        label={i18n.t('auth:totp.password.label')}
        margin="normal"
        fullWidth
        required
        disabled={disabled}
        error={password.error !== ''}
        helperText={password.error}
        autoComplete="off"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={shown ? i18n.t('password:toggle.hide') : i18n.t('password:toggle.show')}
                  aria-pressed={shown}
                  onClick={() => { setShown(!shown); }}
                  edge="end"
                  disabled={disabled}
                  tabIndex={-1}
                  size="large"
                >
                  {shown ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
          htmlInput: {
            maxLength: TOTP.FIELDS.PASSWORD.MAX_LENGTH,
            minLength: TOTP.FIELDS.PASSWORD.MIN_LENGTH,
          },
        }}
      />
    </>
  );
};

TOTPFormPassword.propTypes = {
  handleOnChange: PropTypes.func.isRequired,
  fields: PropTypes.objectOf(PropTypes.any).isRequired,
  isFetching: PropTypes.bool,
  success: PropTypes.bool,
};

export default TOTPFormPassword;
