import React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import CheckIcon from '@mui/icons-material/Check';

import { accessIconOf } from './accessIcons';
import i18n from '../languages';

// The one way to choose an access level (roadmap row 155): who can see a
// post, a profile, its followers and whom it follows, and who may do what
// on a profile. Each level with its icon, its name and who it admits; one
// that cannot be chosen here shown greyed, with why under it, never left
// out. Choosing one closes it; Cancel leaves things as they were.
const AccessDialog = ({
  open,
  title,
  options,
  value,
  onChoose,
  onClose,
}) => {
  const titleId = 'access-dialog-title';
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" aria-labelledby={titleId}>
      <DialogTitle id={titleId}>{title}</DialogTitle>
      <List role="radiogroup" aria-labelledby={titleId} sx={{ pt: 0 }}>
        {options.map((option) => {
          const Icon = option.icon || accessIconOf(option.value);
          const chosen = option.value === value;
          return (
            <ListItemButton
              key={`access-${option.value || 'same'}`}
              role="radio"
              aria-checked={chosen}
              selected={chosen}
              disabled={option.disabled}
              onClick={() => {
                onChoose(option.value);
              }}
            >
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
              <ListItemText
                primary={option.name}
                // A level that cannot be chosen says why, where the others
                // say whom they admit.
                secondary={option.disabled && option.reason ? option.reason : option.description}
                slotProps={{ secondary: { sx: { whiteSpace: 'normal' } } }}
              />
              {chosen &&
                <CheckIcon fontSize="small" color="primary" sx={{ ml: 1 }} />}
            </ListItemButton>
          );
        })}
      </List>
      <DialogActions>
        <Button onClick={onClose}>
          {i18n.t('actions:cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const AccessOptionType = PropTypes.shape({
  // The level: "public", "followers", or "" for the same as the profile.
  value: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  // Why it cannot be chosen here.
  reason: PropTypes.string,
  // An icon of its own, for a choice that is not a level ("approve").
  icon: PropTypes.elementType,
});

AccessDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(AccessOptionType).isRequired,
  value: PropTypes.string.isRequired,
  onChoose: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AccessDialog;
