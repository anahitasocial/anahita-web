// The slides are a group somebody can stop on and step through with the
// arrow keys, which is the carousel pattern. The lint rules below assume a
// plain div is never meant to take the keyboard.
/* eslint jsx-a11y/no-noninteractive-element-interactions: off */
/* eslint jsx-a11y/no-noninteractive-tabindex: off */
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';

import IconButton from '@mui/material/IconButton';
import MobileStepper from '@mui/material/MobileStepper';

import NextIcon from '@mui/icons-material/NavigateNext';
import PrevIcon from '@mui/icons-material/NavigateBefore';

import MediumType from '../proptypes/Medium';
import i18n from '../languages';
import utils from '../utils';
import photoFiles from '../utils/photoFiles';

const { getPortraitURLs } = utils.node;

// A drag shorter than this is a tap, not a swipe.
const SWIPE_THRESHOLD = 50;

const useStyles = makeStyles()((theme) => {
  return {
    root: {
      position: 'relative',
      outlineOffset: -2,
    },
    frame: {
      position: 'relative',
      // Holds the place while an image arrives, so the card does not jump.
      minHeight: 160,
      backgroundColor: theme.palette.action.hover,
    },
    open: {
      display: 'block',
      width: '100%',
      padding: 0,
      border: 0,
      background: 'none',
      cursor: 'pointer',
    },
    image: {
      display: 'block',
      width: '100%',
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
    },
    dots: {
      justifyContent: 'center',
      background: 'none',
      padding: theme.spacing(0.5),
    },
  };
});

// The images of a photo post, one at a time: arrows, a swipe on a touch
// screen, the left and right keys, and dots that show where you are.
//
// Only the image on show is in the page, so a post with four images loads
// one until somebody asks for the next. The one after is fetched quietly
// in advance, which is what makes the step feel instant.
const PhotoSlides = ({
  medium,
  size = 'medium',
  onOpen = null,
}) => {
  const { classes, cx } = useStyles();
  const [index, setIndex] = useState(0);
  // How many of this image's sizes have failed to load. A size the server
  // lists is not always one it stored, so the next smaller is tried.
  const [failed, setFailed] = useState(0);
  const touchStart = useRef(null);

  const count = photoFiles.countOf(medium);

  // The same card is reused as a list is paged through.
  useEffect(() => {
    setIndex(0);
    setFailed(0);
  }, [medium.id]);

  const candidates = getPortraitURLs(photoFiles.asSingle(medium, index), size);
  const src = candidates[Math.min(failed, candidates.length - 1)] || '';

  useEffect(() => {
    if (index + 1 >= count) {
      return;
    }
    const [next] = getPortraitURLs(photoFiles.asSingle(medium, index + 1), size);
    if (next) {
      const ahead = new window.Image();
      ahead.src = next;
    }
  }, [medium, index, count, size]);

  const go = (delta) => {
    setFailed(0);
    setIndex((current) => {
      return photoFiles.step(current, delta, count);
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

  const handleTouchEnd = (event) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (start === null) {
      return;
    }
    const distance = event.changedTouches[0].clientX - start;
    if (Math.abs(distance) >= SWIPE_THRESHOLD) {
      go(distance < 0 ? 1 : -1);
    }
  };

  const position = i18n.t('photos:slides.position', {
    index: index + 1,
    total: count,
  });

  const image = (
    <img
      className={classes.image}
      src={src}
      alt={photoFiles.altOf(medium, index)}
      draggable={false}
      onError={() => {
        if (failed < candidates.length - 1) {
          setFailed(failed + 1);
        }
      }}
    />
  );

  return (
    <div
      className={classes.root}
      role="group"
      aria-roledescription="carousel"
      aria-label={medium.name || i18n.t('photos:mTitle')}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={(event) => {
        touchStart.current = event.changedTouches[0].clientX;
      }}
      onTouchEnd={handleTouchEnd}
    >
      <div className={classes.frame}>
        {onOpen &&
          <button
            type="button"
            className={classes.open}
            aria-label={i18n.t('media:stepper.open')}
            onClick={() => {
              onOpen(index);
            }}
          >
            {image}
          </button>}
        {!onOpen && image}
        <span className={classes.count} aria-live="polite">
          {position}
        </span>
        {index > 0 &&
          <IconButton
            className={cx(classes.nav, classes.prev)}
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
            className={cx(classes.nav, classes.next)}
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
