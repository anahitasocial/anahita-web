import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import LanguageIcon from '@mui/icons-material/Translate';

import i18n from '../languages';
import postLanguage from '../utils/postLanguage';

// The language button: which language a post is written in.
//
// It sits beside the audience button in the composer and works the same
// way: a button naming the current choice, opening a menu. Most people
// never open it. It starts on the language they last posted in, or the
// one on their profile, or their browser's; see utils/postLanguage.
//
// It shows the code, "EN", not the name: the row it sits in is narrow,
// and the name is in the menu and the tooltip. Names are in the language
// the app is being read in.
const LanguageButton = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const uiLanguage = i18n.language || 'en';
  const nameOf = (code) => {
    return postLanguage.nameOf(code, uiLanguage);
  };

  return (
    <>
      <Button
        size="small"
        color="inherit"
        startIcon={<LanguageIcon fontSize="small" />}
        aria-haspopup="menu"
        aria-expanded={anchorEl ? 'true' : undefined}
        aria-label={i18n.t('media:language.label', { name: nameOf(value) })}
        title={i18n.t('media:language.label', { name: nameOf(value) })}
        disabled={disabled}
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
        sx={{ flexShrink: 0, whiteSpace: 'nowrap', minWidth: 0 }}
      >
        {value.toUpperCase()}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
        }}
        // Sixty languages: a list to scroll, not a screenful.
        slotProps={{
          paper: { sx: { maxHeight: 360 } },
        }}
      >
        {postLanguage.optionsWith(value).map((code) => {
          return (
            <MenuItem
              key={code}
              role="menuitemradio"
              selected={code === value}
              onClick={() => {
                onChange(code);
                setAnchorEl(null);
              }}
            >
              <ListItemText
                primary={nameOf(code)}
                secondary={code}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

LanguageButton.propTypes = {
  // A language code: "en", "fr".
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default LanguageButton;
