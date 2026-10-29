import React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import AllowedIcon from '@mui/icons-material/FileDownloadOutlined';
import NotAllowedIcon from '@mui/icons-material/FileDownloadOff';

import DetailRow from './DetailRow';
import i18n from '../languages';

// Whether the photo or video being posted may be downloaded by whoever can
// see it: one of the choices that go with a post, beside its audience and
// its language. Pressed to change; it says which way it is.
const DownloadOptionButton = ({
  value,
  onChange,
  disabled = false,
  row = false,
}) => {
  const label = i18n.t(value ? 'media:download.allowed' : 'media:download.notAllowed');

  // On a post's Details page: a row with a switch, which the row's whole
  // width turns.
  if (row) {
    return (
      <DetailRow
        icon={value ? <AllowedIcon /> : <NotAllowedIcon />}
        label={i18n.t('media:download.allow')}
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => {
          onChange(!value);
        }}
        end={
          <Switch
            edge="end"
            checked={value}
            tabIndex={-1}
            slotProps={{ input: { 'aria-hidden': true } }}
          />
        }
      />
    );
  }

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
  // A row of a post's Details page, with a switch.
  row: PropTypes.bool,
};

export default DownloadOptionButton;
