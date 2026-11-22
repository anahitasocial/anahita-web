import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';

import IconButton from '@mui/material/IconButton';
import MobileStepper from '@mui/material/MobileStepper';

import NextIcon from '@mui/icons-material/NavigateNext';
import PrevIcon from '@mui/icons-material/NavigateBefore';

import i18n from '../languages';

// What a row of photos is made of, wherever one is drawn: a reader's
// slides (PhotoSlides), the composer's (PhotoFilesEditor) and the
// lightbox's. Its place in the row is kept by useSlideRow.

// The CSS is given as a new object each time: tss-react writes the name of
// the class onto the object it is given, so one object shared by several
// would be named after whichever came first.

// A row of photos, each as wide as the row, that the browser itself
// scrolls sideways and brings to rest on a photo. The photo follows the
// finger and carries on with the flick, as it would in any list; none of
// that is ours to get wrong.
const rowStyles = () => {
  return {
    display: 'flex',
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollSnapType: 'x mandatory',
    // A sideways swipe that reaches the end stays here: it does not go on
    // to become the browser's "back".
    overscrollBehaviorX: 'contain',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  };
};

// One photo of the row, brought to rest in the middle. One photo for one
// swipe, however hard the flick.
const slideStyles = () => {
  return {
    flex: '0 0 100%',
    minWidth: 0,
    scrollSnapAlign: 'center',
    scrollSnapStop: 'always',
  };
};

// `top` is where the arrows sit: the middle of the photo, which is the
// middle of the row unless the row holds more than the photo.
const useStyles = makeStyles()((theme, { top }) => {
  return {
    nav: {
      position: 'absolute',
      top,
      transform: 'translateY(-50%)',
      color: theme.palette.common.white,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      },
      // Where there is no pointer to hover with there is a finger to swipe
      // with, and arrows would only sit on top of the photo.
      '@media (hover: none)': {
        display: 'none',
      },
    },
    prev: {
      left: theme.spacing(1),
    },
    next: {
      right: theme.spacing(1),
    },
    dots: {
      justifyContent: 'center',
      background: 'none',
      padding: theme.spacing(0.5),
    },
    // On the photo, at its foot, on a soft dark pill so that they read on
    // any picture (the user, 2026-11-21): the one on show white, the rest
    // half so.
    dotsOver: {
      position: 'absolute',
      left: '50%',
      bottom: theme.spacing(1),
      transform: 'translateX(-50%)',
      padding: '4px 8px',
      borderRadius: 12,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      pointerEvents: 'none',
      '& .MuiMobileStepper-dot': {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
      },
      '& .MuiMobileStepper-dotActive': {
        backgroundColor: theme.palette.common.white,
      },
    },
  };
});

// The arrows to the photo before and after, where there is one: shown
// where there is a mouse, over the photo.
const SlideArrows = ({
  index,
  count,
  show,
  top = '50%',
}) => {
  const { classes, cx } = useStyles({ top });
  return (
    <>
      {index > 0 &&
        <IconButton
          className={cx(classes.nav, classes.prev)}
          aria-label={i18n.t('photos:slides.previous')}
          onClick={() => {
            show(index - 1);
          }}
          size="small"
        >
          <PrevIcon />
        </IconButton>}
      {index < count - 1 &&
        <IconButton
          className={cx(classes.nav, classes.next)}
          aria-label={i18n.t('photos:slides.next')}
          onClick={() => {
            show(index + 1);
          }}
          size="small"
        >
          <NextIcon />
        </IconButton>}
    </>
  );
};

SlideArrows.propTypes = {
  // The photo on show, and how many there are.
  index: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  // Given the photo to go to.
  show: PropTypes.func.isRequired,
  // Where the arrows sit, from the top of the row.
  top: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

// The dots under a row of several, one for each photo, the one on show
// filled. Only for the eye: "2 of 4" says it in words.
const SlideDots = ({ steps, activeStep, over = false }) => {
  const { classes, cx } = useStyles({ top: '50%' });
  return (
    <MobileStepper
      className={cx(classes.dots, over && classes.dotsOver)}
      variant="dots"
      position="static"
      steps={steps}
      activeStep={activeStep}
      backButton={null}
      nextButton={null}
      elevation={0}
      aria-hidden
    />
  );
};

SlideDots.propTypes = {
  steps: PropTypes.number.isRequired,
  activeStep: PropTypes.number.isRequired,
  // On the photo, at its foot, rather than under it.
  over: PropTypes.bool,
};

export {
  rowStyles,
  slideStyles,
  SlideArrows,
  SlideDots,
};
