import React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import AllowedIcon from '@mui/icons-material/FileDownloadOutlined';
import NotAllowedIcon from '@mui/icons-material/FileDownloadOff';

import i18n from '../languages';

// Whether the photo or video being posted may be downloaded by whoever can
// see it: one of the choices that go with a post, beside its audience and
// its language. Pressed to change; it says which way it is.
const DownloadOptionButton = ({
  value,
  onChange,
  disabled = false,
}) => {
  const label = i18n.t(value ? 'media:download.allowed' : 'media:download.notAllowed');

  return (
    <Button
      size="small"
      color={value ? 'primary' : 'inherit'}
      aria-pressed={value}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={() => {
        onChange(!value);
      }}
      sx={{ flexShrink: 0, minWidth: 0 }}
    >
      {value ? <AllowedIcon fontSize="small" /> : <NotAllowedIcon fontSize="small" />}
    </Button>
  );
};

DownloadOptionButton.propTypes = {
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default DownloadOptionButton;
