import { createTheme } from '@mui/material/styles';
import { colors } from '@mui/material';
import assets from '../assets';

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
      MuiCheckbox: {
        defaultProps: { color: 'secondary' },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontSize: '0.875rem',
            lineHeight: 1.43,
            letterSpacing: '0.01071em',
          },
        },
      },
      MuiLink: {
        defaultProps: { underline: 'hover' },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'unset' } },
      },
      MuiRadio: {
        defaultProps: { color: 'secondary' },
      },
      MuiStepper: {
        styleOverrides: { root: { padding: 24 } },
      },
      MuiSwitch: {
        defaultProps: { color: 'secondary' },
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

export default (prefersDarkMode) => {
  const style = styles.global({
    colors: {
      red,
    },
    prefersDarkMode,
  });
  const base = v4Look(prefersDarkMode);
  const components = { ...base.components };
  Object.keys(style.components || {}).forEach((name) => {
    components[name] = { ...components[name], ...style.components[name] };
  });

  return createTheme({
    ...base,
    ...style,
    palette: { ...base.palette, ...style.palette },
    components,
  });
};
