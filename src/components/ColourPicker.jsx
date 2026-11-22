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
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseIcon from '@mui/icons-material/Close';

import palettes from '../styles/palettes';
import i18n from '../languages';
import rounder, { CORNER_RADII } from '../utils/corners';

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

// How round the corners are, for somebody who chose (roadmap row 168): the
// five steps Material UI names, none, sm, md, lg and xl (utils/corners.js),
// kept by name, worked with in pixels. The site's own is what everybody else
// sees (CORNER_RADIUS).
const CORNERS_KEY = 'anahita-corners';

const STEP_NAMES = Object.keys(CORNER_RADII);

// A step's mark under the slider: its name, but 0 for none, which is
// shorter (the user, 2026-11-21); a screen reader still hears "none".
const markOf = (name) => {
  return name === 'none' ? '0' : name;
};

// A radius's name, or undefined for one that is not a step.
const nameOf = (radius) => {
  return STEP_NAMES.find((name) => { return CORNER_RADII[name] === radius; });
};

// The corners chosen in this browser, in pixels, or undefined for the
// site's own.
export const savedCorners = () => {
  try {
    const name = window.localStorage.getItem(CORNERS_KEY);
    return Object.hasOwn(CORNER_RADII, name) ? CORNER_RADII[name] : undefined;
  } catch {
    return undefined;
  }
};

const saveCorners = (radius) => {
  try {
    const name = nameOf(radius);
    if (name) {
      window.localStorage.setItem(CORNERS_KEY, name);
    } else {
      window.localStorage.removeItem(CORNERS_KEY);
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
// swatch is marked, since the site's own may be none of them. On a mobile,
// the sheet across the bottom, as tall as its rows and the corners, so the page
// above it shows what each palette does; on a wider screen, a small card
// beside the left menu, where each swatch says its name when pointed at.
const Palettes = ({
  current = undefined,
  corners = undefined,
  siteCorners = CORNER_RADII.sm,
  choose,
  chooseCorners,
  onClose,
  mobile,
}) => {
  const size = mobile ? 40 : 32;
  // Where the corners' slider stands: the chosen, or the site's.
  const shownCorners = corners === undefined ? siteCorners : corners;
  return (
    <Box sx={mobile ?
      { maxHeight: '67vh', display: 'flex', flexDirection: 'column' } :
      { width: 304 }}
    >
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1, pl: 2, pr: 1, pt: 1,
      }}
      >
        <Typography variant="subtitle1" noWrap sx={{ flexGrow: 1, minWidth: 0, fontWeight: 500 }}>
          {current ? current.name : i18n.t('colours:site')}
        </Typography>
        {/* Reset at the top, beside close, where it is seen, and only when
            there is something of one's own to reset: at the foot it was out
            of sight, and in the home-screen app under the home bar (the
            user, 2026-11-21). */}
        {(current || corners !== undefined) &&
          <Button
            size="small"
            onClick={() => {
              choose(undefined);
              chooseCorners(undefined);
            }}
          >
            {i18n.t('colours:reset')}
          </Button>}
        <IconButton aria-label={i18n.t('actions:close')} onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ overflowY: mobile ? 'auto' : 'visible', px: 2 }}>
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
                // mobile. Room all round for the ring of the chosen one.
                justifyContent: mobile ? 'flex-start' : 'space-between',
                overflowX: mobile ? 'auto' : 'visible',
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
                  return mobile ? swatch : (
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
      {/* The corners, under the colours: a slider over the five steps
          Material UI names (the user, 2026-11-21). Until somebody moves it,
          it stands where the site's own are, and moving it makes them
          theirs; Reset gives the site's back. */}
      <Box sx={{ px: 2, mt: 1 }}>
        <Typography
          id="colour-picker-corners"
          variant="overline"
          color="text.secondary"
          component="p"
          sx={{ lineHeight: 2 }}
        >
          {i18n.t('colours:corners')}
        </Typography>
        <Box sx={{ px: 1 }}>
          <Slider
            aria-labelledby="colour-picker-corners"
            value={Math.max(STEP_NAMES.indexOf(nameOf(shownCorners)), 0)}
            min={0}
            max={STEP_NAMES.length - 1}
            step={1}
            marks={STEP_NAMES.map((name, at) => { return { value: at, label: markOf(name) }; })}
            getAriaValueText={(at) => { return STEP_NAMES[at]; }}
            onChange={(event, at) => {
              chooseCorners(CORNER_RADII[STEP_NAMES[at]]);
            }}
            size="small"
          />
        </Box>
      </Box>
      {/* Room at the foot, and above the phone's home bar on a mobile. */}
      <Box sx={{ pb: mobile ? 'calc(16px + env(safe-area-inset-bottom))' : 2 }} />
    </Box>
  );
};

Palettes.propTypes = {
  current: PropTypes.object,
  corners: PropTypes.number,
  siteCorners: PropTypes.number,
  choose: PropTypes.func.isRequired,
  chooseCorners: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  mobile: PropTypes.bool.isRequired,
};

// Colours of one's own, for somebody signed in: Customize in the left menu
// opens the palettes (docs/plans/colours.md), and the one chosen is the
// app's colours at once, in light mode and dark, kept in this browser.
// Under them, how round the corners are. Reset, at the top once something is
// chosen, goes back to the site's own, colours and corners. It does not dim
// or hold the page, which can be scrolled with it open; a click or a tap
// outside it closes it.
const ColourPicker = ({
  current = undefined,
  corners = undefined,
  siteCorners = CORNER_RADII.sm,
  onChoose,
  onChooseCorners,
  open,
  anchorEl = null,
  onClose,
}) => {
  const mobile = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });
  const choose = (palette) => {
    save(palette && palette.id);
    onChoose(palette);
  };
  const chooseCorners = (radius) => {
    saveCorners(radius);
    onChooseCorners(radius);
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
        <Palettes
          current={current}
          corners={corners}
          siteCorners={siteCorners}
          choose={choose}
          chooseCorners={chooseCorners}
          onClose={onClose}
          mobile={mobile}
        />
      </Box>
    </ClickAwayListener>
  );

  // On a mobile, a sheet across the bottom; its contents stay as it slides
  // away.
  if (mobile) {
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

  // On a wider screen, a small card opening up from the Customize item.
  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      // Up from the Customize item, near the foot of the menu, as a menu opens
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
          borderRadius: rounder(3),
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
  // The corners chosen, in pixels, or undefined for the site's own.
  corners: PropTypes.number,
  // The site's own corners, in pixels, where the slider stands until moved.
  siteCorners: PropTypes.number,
  onChoose: PropTypes.func.isRequired,
  onChooseCorners: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  // The Customize item it opens beside, on a wider screen.
  anchorEl: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default ColourPicker;
