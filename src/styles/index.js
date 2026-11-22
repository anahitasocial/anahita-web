import { createTheme } from '@mui/material/styles';
import { colors } from '@mui/material';
import assets from '../assets';
import { CORNER_RADII } from '../utils/corners';

const { red } = colors;
const { styles } = assets;

// Material-UI v5 changed a number of defaults. These put back the v4 values,
// so the app looks the way it did before the upgrade. An asset theme can
// still override any of them.
const v4Look = (prefersDarkMode) => {
  return {
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    palette: {
      background: prefersDarkMode
        ? { default: '#303030', paper: '#424242' }
        : { default: '#fafafa', paper: '#fff' },
    },
    components: {
      MuiAppBar: {
        defaultProps: { enableColorOnDark: true },
      },
      // Content straight after a card's header drops its top padding: the
      // header's own padding below it is the gap, and the two together were
      // twice that. A picture or anything else between them keeps both.
      // On a mobile a card's action row has 16 pixels under it, not 8: the
      // buttons belong to the card above them, not to the next card, which
      // begins at the line just under them (the user, 2026-11-21).
      MuiCardActions: {
        styleOverrides: {
          root: ({ theme }) => {
            return {
              [theme.breakpoints.down('sm')]: {
                paddingBottom: theme.spacing(2),
              },
            };
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            '.MuiCardHeader-root + &': {
              paddingTop: 0,
            },
          },
        },
      },
      // Choices that are on are ink, not red: red is Anahita's accent, and
      // also means an error, so a list of switches in red would read as a
      // list of warnings.
      MuiCheckbox: {
        defaultProps: { color: 'primary' },
      },
      // A dialog's buttons line up with its text, and sit off its bottom
      // edge (AGENTS.md, "The interface").
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: '8px 24px 16px',
          },
        },
      },
      // On a mobile, cards lie flat on the page, edge to edge: square, with
      // no shadow, and a line under each, as Bluesky and Threads have them
      // (the user, 2026-11-21). The page is the cards' own colour, and the
      // line is all there is between two cards.
      // How round corners are is for a wider screen.
      MuiCard: {
        styleOverrides: {
          // Not an outlined card: one inside another, as a post a repost
          // quotes, keeps the site's corners and its own outline (the user,
          // 2026-11-21).
          root: ({ theme, ownerState }) => {
            if (ownerState && ownerState.variant === 'outlined') {
              return {};
            }
            return {
              [theme.breakpoints.down('sm')]: {
                borderRadius: 0,
                boxShadow: 'none',
                borderBottom: `1px solid ${theme.palette.divider}`,
                // No gap under it: the line is the gap, and the gap with the
                // next card's own padding was twice the room above its
                // header (the user, 2026-11-21). Doubled, to outweigh the
                // margins lists give their cards one by one.
                '&&': { marginBottom: 0 },
              },
            };
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: (theme) => {
          return {
            body: {
              fontSize: '0.875rem',
              lineHeight: 1.43,
              letterSpacing: '0.01071em',
              [theme.breakpoints.down('sm')]: {
                backgroundColor: theme.palette.background.paper,
              },
            },
            // A placeholder takes its direction from its own words. In a box
            // set right to left for a post in Persian or Arabic, an English
            // placeholder then still reads "What's new?" and not "?What's
            // new", with no translation needed.
            'input::placeholder, textarea::placeholder': {
              unicodeBidi: 'plaintext',
            },
          };
        },
      },
      MuiLink: {
        defaultProps: { underline: 'hover' },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'unset' } },
      },
      MuiRadio: {
        defaultProps: { color: 'primary' },
      },
      MuiStepper: {
        styleOverrides: { root: { padding: 24 } },
      },
      MuiSwitch: {
        defaultProps: { color: 'primary' },
      },
      MuiTab: {
        styleOverrides: {
          root: ({ theme }) => {
            return {
              minWidth: 72,
              maxWidth: 264,
              padding: '6px 12px',
              [theme.breakpoints.up('md')]: {
                minWidth: 160,
              },
            };
          },
        },
      },
      MuiTabs: {
        defaultProps: {
          indicatorColor: 'secondary',
          textColor: 'inherit',
        },
      },
      MuiTooltip: {
        defaultProps: { disableInteractive: true },
      },
    },
  };
};

// A palette somebody chose for themselves (components/ColourPicker), over
// the theme's own colours, so that it is theirs on any site, whatever its
// theme says.
const ofChosen = (palette, prefersDarkMode) => {
  const chosen = palette && palette[prefersDarkMode ? 'dark' : 'light'];
  return chosen ?
    { primary: { main: chosen.primary }, secondary: { main: chosen.secondary } } :
    {};
};

// How round the corners are, in pixels: somebody's own choice or the
// site's (roadmap row 168); undefined leaves the theme's, Material UI's 4.
// With it, Material UI's named shape tokens, borderRadiusSm to
// borderRadiusXl, for what is to be as round whatever is chosen.
const ofCorners = (radius, shape = {}) => {
  return {
    shape: {
      ...shape,
      borderRadiusSm: CORNER_RADII.sm,
      borderRadiusMd: CORNER_RADII.md,
      borderRadiusLg: CORNER_RADII.lg,
      borderRadiusXl: CORNER_RADII.xl,
      ...(typeof radius === 'number' && radius >= 0 ? { borderRadius: radius } : {}),
    },
  };
};

export default (prefersDarkMode, palette, corners) => {
  const style = styles.global({
    colors: {
      red,
    },
    prefersDarkMode,
    palette,
  });
  const base = v4Look(prefersDarkMode);
  const components = { ...base.components };
  Object.keys(style.components || {}).forEach((name) => {
    components[name] = { ...components[name], ...style.components[name] };
  });

  return createTheme({
    ...base,
    ...style,
    palette: { ...base.palette, ...style.palette, ...ofChosen(palette, prefersDarkMode) },
    components,
    ...ofCorners(corners, style.shape),
    // What it was made from, for a part of the page that must be dark
    // whatever the reader's mode, to be made again in dark with the same
    // colours (media/Stepper/Lightbox/Immersive.jsx).
    anahita: { palette, corners },
  });
};
