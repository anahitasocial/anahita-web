import React, { useState } from 'react';
import PropTypes from 'prop-types';

import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import AccessDialog, { AccessOptionType } from './AccessDialog';
import { accessIconOf } from './accessIcons';

// A choice of access level in a settings card (roadmap row 155): the
// question, and the level chosen under it, opening the access dialog.
const AccessRow = ({
  label,
  options,
  value,
  onChange,
  disabled = false,
  divider = false,
}) => {
  const [open, setOpen] = useState(false);
  const chosen = options.find((option) => { return option.value === value; }) || options[0];
  const Icon = (chosen && chosen.icon) || accessIconOf(value);

  return (
    <>
      <ListItemButton
        divider={divider}
        disabled={disabled}
        aria-haspopup="dialog"
        onClick={() => { setOpen(true); }}
      >
        <ListItemIcon>
          <Icon />
        </ListItemIcon>
        <ListItemText
          primary={label}
          secondary={chosen ? chosen.name : ''}
        />
        <ChevronRightIcon color="action" />
      </ListItemButton>
      <AccessDialog
        open={open}
        title={label}
        options={options}
        value={value}
        onClose={() => { setOpen(false); }}
        onChoose={(level) => {
          setOpen(false);
          if (level !== value) {
            onChange(level);
          }
        }}
      />
    </>
  );
};

AccessRow.propTypes = {
  // The question: "Who can see this profile?"
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(AccessOptionType).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  divider: PropTypes.bool,
};

export default AccessRow;
