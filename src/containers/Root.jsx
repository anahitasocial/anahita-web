import React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@mui/material/styles';
import App from './App';
import Routes from '../routes';
import styles from '../styles';
import ColourPicker, { ColourPickerContext, savedPalette } from '../components/ColourPicker';

// The colour picker is for the dev server alone, while the colours are
// tried again (docs/plans/colours.md).
const picking = process.env.NODE_ENV === 'development';

const Root = ({ store }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [palette, setPalette] = React.useState(() => {
    return picking ? savedPalette() : undefined;
  });
  const [picker, setPicker] = React.useState(false);
  const openPicker = React.useCallback(() => { setPicker(true); }, []);

  const theme = React.useMemo(
    () => {
      return styles(prefersDarkMode, palette);
    },
    [prefersDarkMode, palette],
  );

  return (
    <Provider store={store}>
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
              onChoose={setPalette}
              open={picker}
              onClose={() => { setPicker(false); }}
            />
          )}
        </HelmetProvider>
      </ThemeProvider>
    </Provider>
  );
};

Root.propTypes = {
  store: PropTypes.object.isRequired,
};

export default Root;
