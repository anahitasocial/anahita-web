import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import CheckIcon from '@mui/icons-material/Check';
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

// The palette chosen in this browser, or undefined for Anahita's own.
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

// How the left menu opens the colour picker: a function where the picker is
// on (the dev server), null elsewhere, so that the menu has no item for it.
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

// On a phone: a sheet across the bottom, a third of the screen, so that the
// page above it shows what each palette does. Each group is a row of
// swatches, scrolled sideways, and the chosen one's name is at the top.
const Sheet = ({ current = undefined, choose, onClose }) => {
  return (
    <Box sx={{ height: '34vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1, pl: 2, pr: 1, pt: 1,
      }}
      >
        <Typography variant="subtitle1" noWrap sx={{ flexGrow: 1, minWidth: 0, fontWeight: 500 }}>
          {current ? current.name : i18n.t('colours:title')}
        </Typography>
        <Button size="small" onClick={() => { choose(undefined); }} disabled={!current}>
          {i18n.t('colours:reset')}
        </Button>
        <IconButton aria-label={i18n.t('actions:close')} onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ overflowY: 'auto', px: 2, pb: 2 }}>
        {groups.map((group) => {
          return (
            <Box key={group.name} sx={{ mt: 1 }}>
              <Typography variant="overline" color="text.secondary" component="p">
                {group.name}
              </Typography>
              <Box sx={{
                display: 'flex', gap: 2, overflowX: 'auto', py: 1, px: 0.5,
              }}
              >
                {group.palettes.map((palette) => {
                  const selected = Boolean(current && current.id === palette.id);
                  return (
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
                      <Swatch palette={palette} size={40} />
                    </ButtonBase>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

Sheet.propTypes = {
  current: PropTypes.object,
  choose: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

// On a wider screen: a panel at the right, the palettes listed under their
// groups.
const Panel = ({ current = undefined, choose, onClose }) => {
  return (
    <Box sx={{
      width: 360, maxWidth: '100vw', px: 2, pt: 2, pb: 2, overflowY: 'auto',
    }}
    >
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1, pl: 1,
      }}
      >
        <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 500 }}>
          {i18n.t('colours:title')}
        </Typography>
        <Button size="small" onClick={() => { choose(undefined); }} disabled={!current}>
          {i18n.t('colours:reset')}
        </Button>
        <IconButton aria-label={i18n.t('actions:close')} onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ px: 1, mb: 2 }}>
        {i18n.t('colours:explain')}
      </Typography>
      {groups.map((group) => {
        return (
          <List
            key={group.name}
            dense
            subheader={(
              <ListSubheader
                disableSticky
                sx={{
                  px: 1,
                  pt: 2,
                  bgcolor: 'transparent',
                  lineHeight: '24px',
                  typography: 'overline',
                  color: 'text.secondary',
                }}
              >
                {group.name}
              </ListSubheader>
            )}
          >
            {group.palettes.map((palette) => {
              const selected = Boolean(current && current.id === palette.id);
              return (
                <ListItemButton
                  key={palette.id}
                  selected={selected}
                  onClick={() => { choose(palette); }}
                  sx={{
                    gap: 1.5, borderRadius: 2, px: 1, py: 1,
                  }}
                >
                  <Swatch palette={palette} />
                  <ListItemText
                    primary={palette.name}
                    slotProps={{ primary: { noWrap: true } }}
                    sx={{ minWidth: 0, my: 0 }}
                  />
                  {selected && <CheckIcon fontSize="small" color="primary" />}
                </ListItemButton>
              );
            })}
          </List>
        );
      })}
    </Box>
  );
};

Panel.propTypes = Sheet.propTypes;

// Anahita's colours tried again, on the dev server only
// (docs/plans/colours.md): Colours in the left menu opens the palettes, and
// the one chosen is the app's colours at once, in light mode and dark, kept
// in this browser. It does not dim or hold the page: the page can be
// scrolled and used with it open, to see what a palette does.
const ColourPicker = ({
  current = undefined, onChoose, open, onClose,
}) => {
  const phone = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });
  const choose = (palette) => {
    save(palette && palette.id);
    onChoose(palette);
  };
  const Body = phone ? Sheet : Panel;

  return (
    <Drawer
      anchor={phone ? 'bottom' : 'right'}
      variant="persistent"
      open={open}
      slotProps={{
        paper: {
          sx: phone ?
            { borderTopLeftRadius: 16, borderTopRightRadius: 16, boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.12)' } :
            { boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.08)' },
        },
      }}
    >
      <Body current={current} choose={choose} onClose={onClose} />
    </Drawer>
  );
};

ColourPicker.propTypes = {
  current: PropTypes.object,
  onChoose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ColourPicker;
