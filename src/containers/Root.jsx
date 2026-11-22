import React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import PropTypes from 'prop-types';
import { Provider, useSelector } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@mui/material/styles';
import App from './App';
import SharedVideoUpload from './media/Composer/Video/SharedVideoUpload';
import Routes from '../routes';
import styles from '../styles';
import ColourPicker, { ColourPickerContext, savedCorners, savedPalette } from '../components/ColourPicker';
import contentChoices from '../utils/contentChoices';
import { CORNER_RADII } from '../utils/corners';

// Material UI's sm breakpoint as the theme has it (styles/index.js): below
// it is a mobile.
const BREAKPOINT_SM = 600;

// The viewer's choices for content warnings (anahita-services row 122,
// phase 2), read once they are signed in, and forgotten when they sign
// out: everybody else has Warn.
const ContentChoices = () => {
  const personId = useSelector((state) => {
    return state.session.isAuthenticated ? state.session.viewer.id : null;
  });
  React.useEffect(() => {
    if (personId) {
      contentChoices.load(personId);
    } else {
      contentChoices.clear();
    }
  }, [personId]);
  return null;
};

// The app in its colours: the site's, or for somebody signed in, the ones
// they chose for themselves in this browser (components/ColourPicker). Signed
// out, everybody sees the site's; the choice stays in the browser for the
// next time they sign in.
const Themed = ({ store }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const picking = useSelector((state) => { return state.session.isAuthenticated; });
  const [chosen, setChosen] = React.useState(savedPalette);
  const palette = picking ? chosen : undefined;
  // How round the corners are: the ones this person chose, as their colours
  // are, on every screen; or the site's, which has its own for a mobile
  // (CORNER_RADIUS and CORNER_RADIUS_MOBILE, through NodeInfo; roadmap row
  // 168). Below 600 pixels they are md unless the site says otherwise, sm
  // above (the user, 2026-11-21).
  const [chosenCorners, setChosenCorners] = React.useState(savedCorners);
  const narrow = useMediaQuery(`(max-width:${BREAKPOINT_SM - 0.05}px)`);
  const siteCorners = useSelector((state) => {
    const { metadata } = state.app.nodeInfo;
    const key = narrow ? 'cornerRadiusMobile' : 'cornerRadius';
    if (metadata && typeof metadata[key] === 'number') {
      return metadata[key];
    }
    return narrow ? CORNER_RADII.md : undefined;
  });
  const corners = picking && chosenCorners !== undefined ? chosenCorners : siteCorners;
  // Where the picker opens from: the Customize item, which its popup opens
  // beside on a wider screen; null while it is closed.
  const [picker, setPicker] = React.useState(null);
  const openPicker = React.useCallback((from) => { setPicker(from || document.body); }, []);

  const theme = React.useMemo(
    () => {
      return styles(prefersDarkMode, palette, corners);
    },
    [prefersDarkMode, palette, corners],
  );

  return (
    <ThemeProvider theme={theme}>
      <ContentChoices />
      <HelmetProvider>
        <ColourPickerContext.Provider value={picking ? openPicker : null}>
          {/* A video posted goes on being sent from page to page. */}
          <SharedVideoUpload>
            <App>
              <Routes store={store} />
            </App>
          </SharedVideoUpload>
        </ColourPickerContext.Provider>
        {picking && (
        <ColourPicker
          current={palette}
          corners={chosenCorners}
          siteCorners={siteCorners}
          onChoose={setChosen}
          onChooseCorners={setChosenCorners}
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
