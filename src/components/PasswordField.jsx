import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import i18n from '../languages';

// A password, with a button that shows what was typed and hides it again:
// every password field in the app, so that nobody has to type one blind.
//
// Everything else is a TextField's. Shown or hidden is the field's own
// unless the form says (`shown` and `onToggle`), as the password change
// does to hide it again once it is saved.
const PasswordField = ({
  shown: controlled,
  onToggle,
  disabled = false,
  slotProps = {},
  ...props
}) => {
  const [own, setOwn] = useState(false);
  const shown = controlled === undefined ? own : controlled;
  const toggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setOwn(!own);
    }
  };

  return (
    <TextField
      {...props}
      type={shown ? 'text' : 'password'}
      disabled={disabled}
      slotProps={{
        ...slotProps,
        input: {
          ...slotProps.input,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={shown ? i18n.t('password:toggle.hide') : i18n.t('password:toggle.show')}
                aria-pressed={shown}
                onClick={toggle}
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
      }}
    />
  );
};

PasswordField.propTypes = {
  shown: PropTypes.bool,
  onToggle: PropTypes.func,
  disabled: PropTypes.bool,
  slotProps: PropTypes.objectOf(PropTypes.any),
};

export default PasswordField;
