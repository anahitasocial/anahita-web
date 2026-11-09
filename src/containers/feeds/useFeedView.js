import { useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

// How a feed is laid out on a wide screen: one post under another, or in
// columns. The choice is the viewer's, kept in their browser, one for the
// feeds and another for profiles, so that columns on Home leave profiles in
// one (the user, 2026-11-09). Each starts as one column. On a narrow screen
// there is one column either way.
export const STREAM = 'stream';
export const COLUMNS = 'columns';
export const FEEDS = 'feeds';
export const PROFILES = 'profiles';
// Where each is kept: the feeds' under the name both had before.
const VIEW_KEYS = {
  [FEEDS]: 'home.feedView',
  [PROFILES]: 'profile.feedView',
};

const rememberedView = (key) => {
  try {
    return window.localStorage.getItem(key) === COLUMNS ? COLUMNS : STREAM;
  } catch (e) {
    return STREAM;
  }
};

const rememberView = (key, view) => {
  try {
    window.localStorage.setItem(key, view);
  } catch (e) {
    // Not kept, and chosen again next time.
  }
};

// `place` is FEEDS or PROFILES.
const useFeedView = (place = FEEDS) => {
  const key = VIEW_KEYS[place] || VIEW_KEYS[FEEDS];
  const [view, setView] = useState(() => {
    return rememberedView(key);
  });
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
      rememberView(key, chosen);
    },
  };
};

export default useFeedView;
