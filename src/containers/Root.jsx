import React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import PropTypes from 'prop-types';
import { Provider, useSelector } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@mui/material/styles';
import App from './App';
import Routes from '../routes';
import styles from '../styles';
import ColourPicker, { ColourPickerContext, savedPalette } from '../components/ColourPicker';

// The app in its colours: the site's, or for somebody signed in, the ones
// they chose for themselves in this browser (components/ColourPicker). Signed
// out, everybody sees the site's; the choice stays in the browser for the
// next time they sign in.
const Themed = ({ store }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const picking = useSelector((state) => { return state.session.isAuthenticated; });
  const [chosen, setChosen] = React.useState(savedPalette);
  const palette = picking ? chosen : undefined;
  // Where the picker opens from: the Colours item, which its popup opens
  // beside on a wider screen; null while it is closed.
  const [picker, setPicker] = React.useState(null);
  const openPicker = React.useCallback((from) => { setPicker(from || document.body); }, []);

  const theme = React.useMemo(
    () => {
      return styles(prefersDarkMode, palette);
    },
    [prefersDarkMode, palette],
  );

  return (
    <ThemeProvider theme={theme}>
      <HelmetProvider>
        <ColourPickerContext.Provider value={picking ? openPicker : null}>
          <App>
            <Routes store={store} />
          </App>
        </ColourPickerContext.Provider>
        {picking && (
        <ColourPicker
          current={palette}
          onChoose={setChosen}
          open={Boolean(picker)}
          anchorEl={picker}
          onClose={() => { setPicker(null); }}
        />
        )}
      </HelmetProvider>
    </ThemeProvider>
  );
};

Themed.propTypes = {
  store: PropTypes.object.isRequired,
};

const Root = ({ store }) => {
  return (
    <Provider store={store}>
      <Themed store={store} />
    </Provider>
  );
};

Root.propTypes = {
  store: PropTypes.object.isRequired,
};

export default Root;
