import React from 'react';

import Fab from '@mui/material/Fab';
import Fade from '@mui/material/Fade';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import UpIcon from '@mui/icons-material/ArrowUpward';

import i18n from '../languages';

// The width of the left menu where it stays open (App.jsx).
const MENU_WIDTH = 240;

// Back to the top of a long feed (the user, 2026-10-20): an arrow at the
// bottom left, across from the + button, once somebody has scrolled a
// screen or so down, and gone again near the top.
const BackToTop = () => {
  const far = useScrollTrigger({ disableHysteresis: true, threshold: 800 });

  return (
    <Fade in={far}>
      <Fab
        size="small"
        aria-label={i18n.t('commons:backToTop')}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        sx={{
          position: 'fixed',
          left: { xs: 16, sm: 24, lg: MENU_WIDTH + 24 },
          bottom: { xs: 'calc(16px + env(safe-area-inset-bottom))', sm: 24 },
          zIndex: (theme) => { return theme.zIndex.speedDial; },
        }}
      >
        <UpIcon />
      </Fab>
    </Fade>
  );
};

export default BackToTop;
