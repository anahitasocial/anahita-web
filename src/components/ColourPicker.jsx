import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import ButtonBase from '@mui/material/ButtonBase';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseIcon from '@mui/icons-material/Close';

import palettes from '../styles/palettes';
import i18n from '../languages';

// The palettes under their groups (Bauhaus, Mid-Century…), in the order of
// the list.
const groups = palettes.reduce((all, palette) => {
  const last = all[all.length - 1];
  if (last && last.name === palette.group) {
    last.palettes.push(palette);
  } else {
    all.push({ name: palette.group, palettes: [palette] });
  }
  return all;
}, []);

const KEY = 'anahita-palette';

// The palette chosen in this browser, or undefined for the site's own.
export const savedPalette = () => {
  try {
    const id = window.localStorage.getItem(KEY);
    return palettes.find((palette) => { return palette.id === id; });
  } catch {
    return undefined;
  }
};

const save = (id) => {
  try {
    if (id) {
      window.localStorage.setItem(KEY, id);
    } else {
      window.localStorage.removeItem(KEY);
    }
  } catch {
    // Not remembered, which is all.
  }
};

// How the left menu opens the colour picker: a function for somebody signed
// in, null otherwise, so that the menu has no item for it.
export const ColourPickerContext = React.createContext(null);

// A palette's two colours in one circle, split on the diagonal.
const Swatch = ({ palette, size = 24 }) => {
  const { primary, secondary } = palette.light;
  return (
    <Box
      component="span"
      sx={{
        display: 'block',
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${primary} 50%, ${secondary} 50%)`,
        boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.08)',
      }}
    />
  );
};

Swatch.propTypes = {
  palette: PropTypes.object.isRequired,
  size: PropTypes.number,
};

// The palettes as rows of swatches, one row for each group, and the chosen
// one's name at the top, or "This site's colours" while none is: then no
// swatch is marked, since the site's own may be none of them. On a phone,
// the sheet across the bottom, as tall as its three rows, so that the page
// above it shows what each palette does; on a wider screen, a small card
// beside the left menu, where each swatch says its name when pointed at.
const Palettes = ({
  current = undefined, choose, onClose, phone,
}) => {
  const size = phone ? 40 : 32;
  return (
    <Box sx={phone ?
      { maxHeight: '50vh', display: 'flex', flexDirection: 'column' } :
      { width: 304 }}
    >
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1, pl: 2, pr: 1, pt: 1,
      }}
      >
        <Typography variant="subtitle1" noWrap sx={{ flexGrow: 1, minWidth: 0, fontWeight: 500 }}>
          {current ? current.name : i18n.t('colours:site')}
        </Typography>
        <IconButton aria-label={i18n.t('actions:close')} onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ overflowY: phone ? 'auto' : 'visible', px: 2 }}>
        {groups.map((group) => {
          return (
            <Box key={group.name} sx={{ mt: 1 }}>
              <Typography variant="overline" color="text.secondary" component="p" sx={{ lineHeight: 2 }}>
                {group.name}
              </Typography>
              <Box sx={{
                display: 'flex',
                gap: 2,
                // Across the card on a wider screen; scrolled sideways on a
                // phone. Room all round for the ring of the chosen one.
                justifyContent: phone ? 'flex-start' : 'space-between',
                overflowX: phone ? 'auto' : 'visible',
                py: 1,
                px: 1,
              }}
              >
                {group.palettes.map((palette) => {
                  const selected = Boolean(current) && current.id === palette.id;
                  const swatch = (
                    <ButtonBase
                      key={palette.id}
                      aria-label={palette.name}
                      aria-pressed={selected}
                      onClick={() => { choose(palette); }}
                      sx={{
                        borderRadius: '50%',
                        flexShrink: 0,
                        outline: selected ? 2 : 0,
                        outlineColor: 'text.primary',
                        outlineOffset: 3,
                      }}
                    >
                      <Swatch palette={palette} size={size} />
                    </ButtonBase>
                  );
                  return phone ? swatch : (
                    <Tooltip key={palette.id} title={palette.name} placement="top">
                      {swatch}
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box sx={{
        display: 'flex', justifyContent: 'flex-end', px: 1, py: 1,
      }}
      >
        <Button size="small" onClick={() => { choose(undefined); }} disabled={!current}>
          {i18n.t('colours:reset')}
        </Button>
      </Box>
    </Box>
  );
};

Palettes.propTypes = {
  current: PropTypes.object,
  choose: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  phone: PropTypes.bool.isRequired,
};

// Colours of one's own, for somebody signed in: Colours in the left menu
// opens the palettes (docs/plans/colours.md), and the one chosen is the
// app's colours at once, in light mode and dark, kept in this browser.
// Reset goes back to the site's own. It does not dim or hold the page, which can be scrolled
// with it open; a click or a tap outside it closes it.
const ColourPicker = ({
  current = undefined, onChoose, open, anchorEl = null, onClose,
}) => {
  const phone = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });
  const choose = (palette) => {
    save(palette && palette.id);
    onChoose(palette);
  };
  // Outside clicks close it from just after it opens: the click that opened
  // it is still on its way to the page when it opens, and would close it.
  const [listening, setListening] = useState(false);
  useEffect(() => {
    if (!open) {
      setListening(false);
      return undefined;
    }
    const timer = setTimeout(() => { setListening(true); }, 0);
    return () => { clearTimeout(timer); };
  }, [open]);

  // A click or a tap outside closes it.
  const body = (
    <ClickAwayListener onClickAway={listening ? onClose : () => {}}>
      <Box sx={{ display: 'contents' }}>
        <Palettes current={current} choose={choose} onClose={onClose} phone={phone} />
      </Box>
    </ClickAwayListener>
  );

  // On a phone, a sheet across the bottom; its contents stay as it slides
  // away.
  if (phone) {
    return (
      <Drawer
        anchor="bottom"
        variant="persistent"
        open={open}
        slotProps={{
          paper: {
            sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16, boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.12)' },
          },
        }}
      >
        {body}
      </Drawer>
    );
  }

  // On a wider screen, a small card opening up from the Colours item.
  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      // Up from the Colours item, near the foot of the menu, as a menu opens
      // there; down instead where there is no room above.
      placement="top-start"
      modifiers={[
        { name: 'offset', options: { offset: [8, 4] } },
        { name: 'flip', options: { fallbackPlacements: ['bottom-start', 'right-end'] } },
      ]}
      sx={{ zIndex: (theme) => { return theme.zIndex.modal; } }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }}
      >
        {body}
      </Paper>
    </Popper>
  );
};

ColourPicker.propTypes = {
  current: PropTypes.object,
  onChoose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  // The Colours item it opens beside, on a wider screen.
  anchorEl: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default ColourPicker;
