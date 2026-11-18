// The slides are a group somebody can stop on and step through with the
// arrow keys, which is the carousel pattern, and each photo in it is a
// group of its own. The lint rules below assume a
// plain div is never meant to take the keyboard.
/* eslint jsx-a11y/no-noninteractive-element-interactions: off */
/* eslint jsx-a11y/no-noninteractive-tabindex: off */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from 'tss-react/mui';

import ButtonBase from '@mui/material/ButtonBase';

import AlbumIcon from '@mui/icons-material/CollectionsOutlined';

import MediumType from '../proptypes/Medium';
import i18n from '../languages';
import photoFiles from '../utils/photoFiles';
import AltBadge from './AltBadge';
import Slide from './PhotoSlideImage';
import {
  rowStyles,
  slideStyles,
  SlideArrows,
  SlideDots,
} from './SlideRow';
import useSlideRow from './useSlideRow';

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

// The first photo's own shape, kept nowhere within anything: in an article,
// where a picture fills the column and is as tall as it is (the user,
// 2026-10-16). 0 when the server does not know it.
const ownRatio = (medium) => {
  const [first] = photoFiles.filesOf(medium);
  return first && first.width && first.height ? first.width / first.height : 0;
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
    // The row itself is SlideRow's.
    scroller: {
      ...rowStyles(),
      // Nothing behind a photo of another shape than the frame: the card
      // shows beside it, in its own colour. A grey band there looked like
      // something missing.
      backgroundColor: 'transparent',
    },
    slide: {
      position: 'relative',
      ...slideStyles(),
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
      // Full bleed: the photo fills the frame, a little cut off at the
      // edges where its shape is not the frame's, as in any feed of photos;
      // empty bands beside it looked poor (the user, 2026-10-28). The whole
      // photo is in the viewer it opens.
      objectFit: 'cover',
      userSelect: 'none',
    },
    // In an article, where the frame is the photo's own shape: any other
    // photo of the post is shown whole within it.
    whole: {
      objectFit: 'contain',
    },
    // A slide that is a post of several photos, where the slides are
    // posts and not one post's photos (a profile's Photos card).
    album: {
      position: 'absolute',
      top: theme.spacing(1),
      left: theme.spacing(1),
      // On the count's backing, so it reads on a light photo too.
      boxSizing: 'content-box',
      fontSize: 14,
      padding: 4,
      borderRadius: 12,
      color: theme.palette.common.white,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      pointerEvents: 'none',
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
  };
});

// Material UI has no carousel, so this is one made for this one job from
// its small parts: ButtonBase for a photo that opens, IconButton for the
// arrows, MobileStepper for the dots (both in SlideRow). The swiping itself is the browser's
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
  natural = false,
  albumAt = null,
}) => {
  const { classes } = useStyles();
  // The first photo's shape as it loads, where the server does not know it.
  const [measured, setMeasured] = useState(0);

  const files = photoFiles.filesOf(medium);
  const count = files.length;
  // One photo is a photo, not slides: no dots, no "1/1".
  const several = count > 1;
  const {
    scroller,
    index,
    setIndex,
    show,
    handleScroll,
  } = useSlideRow(count);

  // The same card is reused as a list is paged through.
  useEffect(() => {
    setIndex(0);
    setMeasured(0);
    if (scroller.current) {
      scroller.current.scrollLeft = 0;
    }
  }, [medium.id]);

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(index - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + 1);
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
      aria-roledescription={several ? 'carousel' : undefined}
      aria-label={medium.title || i18n.t('photos:mTitle')}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className={classes.frame}>
        <div
          ref={scroller}
          className={classes.scroller}
          style={{
            // In an article, a photo whose shape is not known yet is
            // given none: it lays itself out as it loads, at the full
            // width, rather than starting in a frame of a guessed shape and
            // jumping to its own (the user, 2026-10-16).
            aspectRatio: natural ?
              (ownRatio(medium) || measured || undefined) :
              frameRatio(medium),
          }}
          // Left to right whatever the page, so "the next photo" is always
          // the same way and the arithmetic in useSlideRow holds.
          dir="ltr"
          onScroll={handleScroll}
        >
          {files.map((file, at) => {
            const photo = (
              <Slide
                medium={medium}
                index={at}
                size={size}
                onMeasure={natural && at === 0 && !ownRatio(medium) ? setMeasured : null}
                imageClassName={clsx(classes.image, natural && classes.whole)}
              />
            );
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
                    {photo}
                  </ButtonBase>}
                {!onOpen && photo}
                {albumAt && albumAt(at) &&
                  <AlbumIcon
                    className={classes.album}
                    titleAccess={i18n.t('photos:slides.album')}
                  />}
              </div>
            );
          })}
        </div>
        {several &&
          <span className={classes.count} aria-live="polite">
            {position}
          </span>}
        <AltBadge text={photoFiles.descriptionOf(medium, index)} />
        <SlideArrows index={index} count={count} show={show} />
      </div>
      {several && <SlideDots steps={count} activeStep={index} />}
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
  // The frame the first photo's own shape, whatever it is, rather than kept
  // between 4 by 5 and 2 by 1 as in a column of posts: a picture shown
  // within an article, filling its width.
  natural: PropTypes.bool,
  // Where each slide is a post of its own (a profile's Photos card): told
  // a slide's place, says whether its post holds several photos, which an
  // icon on it then shows. A post's own slides need none: "2 of 4" and the
  // dots say so.
  albumAt: PropTypes.func,
};

export default PhotoSlides;
