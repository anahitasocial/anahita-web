import { useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

// How a feed is laid out on a wide screen: one post under another, or in
// columns. The choice is the viewer's, kept in their browser, and the same on
// Home and on a profile. On a narrow screen there is one column either way.
export const STREAM = 'stream';
export const COLUMNS = 'columns';
const VIEW_KEY = 'home.feedView';

const rememberedView = () => {
  try {
    return window.localStorage.getItem(VIEW_KEY) === COLUMNS ? COLUMNS : STREAM;
  } catch (e) {
    return STREAM;
  }
};

const rememberView = (view) => {
  try {
    window.localStorage.setItem(VIEW_KEY, view);
  } catch (e) {
    // Not kept, and chosen again next time.
  }
};

const useFeedView = () => {
  const [view, setView] = useState(rememberedView);
  const isWide = useMediaQuery((theme) => {
    return theme.breakpoints.up('md');
  });

  return {
    view,
    isWide,
    columns: isWide && view === COLUMNS,
    // One post under another, with the tabs beside them.
    sideTabs: isWide && view === STREAM,
    chooseView: (chosen) => {
      setView(chosen);
      rememberView(chosen);
    },
  };
};

export default useFeedView;
