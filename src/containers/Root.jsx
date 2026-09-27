import React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import App from './App';
import Routes from '../routes';
import styles from '../styles';

const Root = ({ store }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () => {
      return styles(prefersDarkMode);
    },
    [prefersDarkMode],
  );

  return (
    <Provider store={store}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <HelmetProvider>
            <App>
              <Routes store={store} />
            </App>
          </HelmetProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </Provider>
  );
};

Root.propTypes = {
  store: PropTypes.object.isRequired,
};

export default Root;
