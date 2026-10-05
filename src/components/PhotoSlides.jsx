// The slides are a group somebody can stop on and step through with the
// arrow keys, which is the carousel pattern, and each photo in it is a
// group of its own. The lint rules below assume a
// plain div is never meant to take the keyboard.
/* eslint jsx-a11y/no-noninteractive-element-interactions: off */
/* eslint jsx-a11y/no-noninteractive-tabindex: off */
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from 'tss-react/mui';

import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import MobileStepper from '@mui/material/MobileStepper';

import NextIcon from '@mui/icons-material/NavigateNext';
import PrevIcon from '@mui/icons-material/NavigateBefore';

import MediumType from '../proptypes/Medium';
import i18n from '../languages';
import utils from '../utils';
import photoFiles from '../utils/photoFiles';

const { getPortraitURLs } = utils.node;

// The shape of the frame is the first photo's, kept within what reads well
// in a column of posts: no taller than 4 by 5, no wider than about 2 by 1.
const TALLEST = 4 / 5;
const WIDEST = 1.91;

const frameRatio = (medium) => {
  const [first] = photoFiles.filesOf(medium);
  if (!first || !first.width || !first.height) {
    return 4 / 3;
  }
  return Math.min(Math.max(first.width / first.height, TALLEST), WIDEST);
};

const useStyles = makeStyles()((theme) => {
  return {
    root: {
      position: 'relative',
      outlineOffset: -2,
    },
    frame: {
      position: 'relative',
    },
    // A row of photos, each as wide as the frame, that the browser itself
    // scrolls sideways and brings to rest on a photo. The photo follows
    // the finger and carries on with the flick, as it would in any list;
    // none of that is ours to get wrong.
    scroller: {
      display: 'flex',
      overflowX: 'auto',
      overflowY: 'hidden',
      scrollSnapType: 'x mandatory',
      // A sideways swipe that reaches the end stays here: it does not go
      // on to become the browser's "back".
      overscrollBehaviorX: 'contain',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
      backgroundColor: theme.palette.action.hover,
    },
    slide: {
      flex: '0 0 100%',
      minWidth: 0,
      scrollSnapAlign: 'center',
      // One photo for one swipe, however hard the flick.
      scrollSnapStop: 'always',
    },
    open: {
      display: 'block',
      width: '100%',
      height: '100%',
    },
    image: {
      display: 'block',
      width: '100%',
      height: '100%',
      // The whole photo, with the frame showing beside one of a different
      // shape, and nothing cut off.
      objectFit: 'contain',
      userSelect: 'none',
    },
    nav: {
      position: 'absolute',
      top: '50%',
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
    count: {
      position: 'absolute',
      top: theme.spacing(1),
      right: theme.spacing(1),
      padding: '2px 8px',
      borderRadius: 12,
      fontSize: 12,
      color: theme.palette.common.white,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      pointerEvents: 'none',
    },
    dots: {
      justifyContent: 'center',
      background: 'none',
      padding: theme.spacing(0.5),
    },
  };
});

// One photo of the row.
const Slide = ({
  medium,
  index,
  size,
  className,
  imageClassName,
}) => {
  // How many of this photo's sizes have failed to load. A size the server
  // lists is not always one it stored, so the next smaller is tried.
  const [failed, setFailed] = useState(0);

  const candidates = getPortraitURLs(photoFiles.asSingle(medium, index), size);
  const src = candidates[Math.min(failed, candidates.length - 1)] || '';

  return (
    <img
      className={clsx(className, imageClassName)}
      src={src}
      alt={photoFiles.altOf(medium, index)}
      // The first is wanted now. The others wait until they are about to
      // come into view, so a post of four loads one until somebody swipes.
      loading={index === 0 ? 'eager' : 'lazy'}
      draggable={false}
      onError={() => {
        if (failed < candidates.length - 1) {
          setFailed(failed + 1);
        }
      }}
    />
  );
};

Slide.propTypes = {
  medium: MediumType.isRequired,
  index: PropTypes.number.isRequired,
  size: PropTypes.string.isRequired,
  className: PropTypes.string,
  imageClassName: PropTypes.string,
};

// Material UI has no carousel, so this is one made for this one job from
// its small parts: ButtonBase for a photo that opens, IconButton for the
// arrows, MobileStepper for the dots. The swiping itself is the browser's
// own sideways scrolling, brought to rest on each photo by CSS scroll snap.
//
// The photos of a post with several, side by side in a row that is swiped
// through: by finger on a touch screen, by trackpad, by the arrows that
// appear where there is a mouse, or by the left and right keys. Dots and
// "2 of 4" say where you are.
const PhotoSlides = ({
  medium,
  size = 'medium',
  onOpen = null,
}) => {
  const { classes } = useStyles();
  const [index, setIndex] = useState(0);
  const scroller = useRef(null);

  const files = photoFiles.filesOf(medium);
  const count = files.length;

  // The same card is reused as a list is paged through.
  useEffect(() => {
    setIndex(0);
    if (scroller.current) {
      scroller.current.scrollLeft = 0;
    }
  }, [medium.id]);

  // Which photo is on show is read from where the row has been scrolled
  // to, whoever scrolled it.
  const handleScroll = () => {
    const row = scroller.current;
    if (!row || !row.clientWidth) {
      return;
    }
    const at = Math.round(Math.abs(row.scrollLeft) / row.clientWidth);
    setIndex(photoFiles.step(at, 0, count));
  };

  const go = (delta) => {
    const row = scroller.current;
    if (!row) {
      return;
    }
    const to = photoFiles.step(index, delta, count);
    // Without motion for somebody who has asked their device for less.
    const still = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    row.scrollTo({
      left: to * row.clientWidth,
      behavior: still ? 'auto' : 'smooth',
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(1);
    }
  };

  const position = i18n.t('photos:slides.position', {
    index: index + 1,
    total: count,
  });

  return (
    <div
      className={classes.root}
      role="group"
      aria-roledescription="carousel"
      aria-label={medium.name || i18n.t('photos:mTitle')}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className={classes.frame}>
        <div
          ref={scroller}
          className={classes.scroller}
          style={{ aspectRatio: frameRatio(medium) }}
          // Left to right whatever the page, so "the next photo" is always
          // the same way and the arithmetic above holds.
          dir="ltr"
          onScroll={handleScroll}
        >
          {files.map((file, at) => {
            return (
              <div
                className={classes.slide}
                key={file.id || at}
                role="group"
                aria-roledescription="slide"
                aria-label={i18n.t('photos:slides.position', {
                  index: at + 1,
                  total: count,
                })}
              >
                {onOpen &&
                  <ButtonBase
                    className={classes.open}
                    aria-label={i18n.t('media:stepper.open')}
                    // No ripple under a finger: most touches on a photo
                    // are the start of a swipe. The keyboard still gets
                    // its focus ring.
                    disableTouchRipple
                    focusRipple
                    // Only the photo on show takes the keyboard.
                    tabIndex={at === index ? 0 : -1}
                    onClick={() => {
                      onOpen(at);
                    }}
                  >
                    <Slide
                      medium={medium}
                      index={at}
                      size={size}
                      imageClassName={classes.image}
                    />
                  </ButtonBase>}
                {!onOpen &&
                  <Slide
                    medium={medium}
                    index={at}
                    size={size}
                    imageClassName={classes.image}
                  />}
              </div>
            );
          })}
        </div>
        <span className={classes.count} aria-live="polite">
          {position}
        </span>
        {index > 0 &&
          <IconButton
            className={clsx(classes.nav, classes.prev)}
            aria-label={i18n.t('photos:slides.previous')}
            onClick={() => {
              go(-1);
            }}
            size="small"
          >
            <PrevIcon />
          </IconButton>}
        {index < count - 1 &&
          <IconButton
            className={clsx(classes.nav, classes.next)}
            aria-label={i18n.t('photos:slides.next')}
            onClick={() => {
              go(1);
            }}
            size="small"
          >
            <NextIcon />
          </IconButton>}
      </div>
      <MobileStepper
        className={classes.dots}
        variant="dots"
        position="static"
        steps={count}
        activeStep={index}
        backButton={null}
        nextButton={null}
        elevation={0}
        aria-hidden
      />
    </div>
  );
};

PhotoSlides.propTypes = {
  medium: MediumType.isRequired,
  // Which stored size to show. Smaller ones are tried if it is missing.
  size: PropTypes.string,
  // Called with the image on show when it is clicked; left out, the image
  // is not a button.
  onOpen: PropTypes.func,
};

export default PhotoSlides;
