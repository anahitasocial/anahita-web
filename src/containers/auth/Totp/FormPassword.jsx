import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

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
  return (
    <>
      <Typography variant="h5" color="primary">
        {i18n.t('auth:totp.password.title')}
      </Typography>
      <TextField
        variant="standard"
        type="password"
        name="password"
        value={password.value}
        onChange={handleOnChange}
        label={i18n.t('auth:totp.password.label')}
        margin="normal"
        fullWidth
        required
        disabled={success || isFetching}
        error={password.error !== ''}
        helperText={password.error}
        autoComplete="off"
        slotProps={{
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
