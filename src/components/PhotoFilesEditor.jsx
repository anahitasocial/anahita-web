import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/AddPhotoAlternate';

import i18n from '../languages';
import photoFiles from '../utils/photoFiles';
import { PHOTO_TYPES } from '../utils/preparePhoto';
import PhotoFileSlide from './PhotoFileSlide';
import { rowStyles, SlideArrows, SlideDots } from './SlideRow';
import usePhotoUploads from './usePhotoUploads';
import useSlideRow from './useSlideRow';

const useStyles = makeStyles()((theme) => {
  return {
    root: {
      marginBottom: theme.spacing(1),
    },
    frame: {
      position: 'relative',
    },
    // A row of photos, each as wide as the editor: the same as the slides a
    // reader swipes through (PhotoSlides).
    scroller: rowStyles(),
    // Clear of the last photo's description.
    add: {
      marginTop: theme.spacing(2),
    },
  };
});

// The arrows to the photo before and after sit at the middle of the photo,
// which is 240 pixels high (PhotoFileSlide), not of the row, which holds
// its description too.
const ARROWS_TOP = 120;

// The images of a photo post while somebody arranges them: picking, putting
// in order, describing, removing.
//
// One photo at a time, as wide as the editor, swiped through like the
// slides a reader sees, with its description under it: a field that is
// there to be written in. A stack of small photos and fields was a long
// way to scroll on a mobile, and before that the description was behind a
// small "ALT" mark that people did not find. Under the photos it says how
// many have no description yet: said, never insisted on, since a
// description that had to be given is how photos come to be described as
// "photo".
const PhotoFilesEditor = ({
  owner,
  items,
  onChange,
  max = photoFiles.DEFAULT_MAX,
  supportedMimetypes = PHOTO_TYPES,
  disabled = false,
  videoMimetypes = [],
  onVideo = null,
  onPicked = null,
  incoming = null,
  onIncomingTaken = null,
}) => {
  const { classes } = useStyles();
  const {
    room,
    takesVideo,
    leftOut,
    setLeftOut,
    getRootProps,
    getInputProps,
    canRetry,
    retry,
  } = usePhotoUploads({
    owner,
    items,
    onChange,
    max,
    supportedMimetypes,
    disabled,
    videoMimetypes,
    onVideo,
    onPicked,
    incoming,
    onIncomingTaken,
  });

  const undescribed = photoFiles.undescribed(items);
  const count = items.length;
  // Which photo is on show, read from where the row has been scrolled to.
  const {
    scroller,
    index,
    show,
    handleScroll,
  } = useSlideRow(count);

  // A photo that was just picked is the one shown: it is the one to
  // describe. And when one is removed, the row comes to rest on what is
  // there.
  const before = useRef(count);
  useEffect(() => {
    if (count > before.current) {
      show(count - 1);
    } else if (count < before.current) {
      show(Math.min(index, count - 1), false);
    }
    before.current = count;
  }, [count]);

  // Moving a photo earlier or later takes the view with it.
  const move = (key, delta) => {
    onChange((current) => {
      return photoFiles.move(current, key, delta);
    });
    show(index + delta);
  };

  return (
    <div className={classes.root}>
      {count > 0 &&
        <div className={classes.frame}>
          <div
            ref={scroller}
            className={classes.scroller}
            // Left to right whatever the page, so "the next photo" is
            // always the same way.
            dir="ltr"
            onScroll={handleScroll}
          >
            {items.map((item, at) => {
              return (
                <PhotoFileSlide
                  key={item.key}
                  item={item}
                  at={at}
                  count={count}
                  isShown={at === index}
                  disabled={disabled}
                  canRetry={canRetry(item.key)}
                  onRetry={() => {
                    retry(item.key);
                  }}
                  onRemove={() => {
                    setLeftOut(0);
                    onChange((current) => {
                      return photoFiles.remove(current, item.key);
                    });
                  }}
                  onMove={(delta) => {
                    move(item.key, delta);
                  }}
                  onAltText={(altText) => {
                    onChange((current) => {
                      return photoFiles.update(current, item.key, { altText });
                    });
                  }}
                />
              );
            })}
          </div>
          <SlideArrows index={index} count={count} show={show} top={ARROWS_TOP} />
          {count > 1 && <SlideDots steps={count} activeStep={Math.min(index, count - 1)} />}
        </div>}
      {room > 0 &&
        <Button
          {...getRootProps()}
          className={count > 0 ? classes.add : undefined}
          variant="outlined"
          color="primary"
          startIcon={<AddIcon />}
          disabled={disabled}
          fullWidth
        >
          <input {...getInputProps()} />
          {count > 0 && i18n.t('photos:editor.addMore')}
          {count === 0 && i18n.t(takesVideo ? 'photos:editor.addOrVideo' : 'photos:editor.add')}
        </Button>}
      {leftOut > 0 &&
        <Typography variant="caption" color="error" component="p" role="alert" sx={{ mt: 1 }}>
          {i18n.t('photos:editor.leftOut', { count: leftOut, max })}
        </Typography>}
      <Typography variant="caption" color="textSecondary" component="p" sx={{ mt: 1 }}>
        {i18n.t('photos:editor.limit', { max })}
      </Typography>
      {/* With several photos, most are out of sight: how many still have
          no description is said here. With one, the prompt says it. */}
      {undescribed > 0 && count > 1 &&
        <Typography variant="caption" color="textSecondary" component="p">
          {i18n.t('photos:editor.undescribed', { count: undescribed })}
        </Typography>}
    </div>
  );
};

PhotoFilesEditor.propTypes = {
  // The profile the post is on. An image is stored for a profile.
  owner: PropTypes.shape({ id: PropTypes.number }).isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Called with a function from the list as it is to the list as it is to
  // be, which is what a state setter takes.
  onChange: PropTypes.func.isRequired,
  max: PropTypes.number,
  supportedMimetypes: PropTypes.arrayOf(PropTypes.string),
  disabled: PropTypes.bool,
  // What else may be picked or dropped before any photo is in, and who takes
  // it: a video, in the composer.
  videoMimetypes: PropTypes.arrayOf(PropTypes.string),
  onVideo: PropTypes.func,
  // Given the files picked, as they are picked.
  onPicked: PropTypes.func,
  // Files picked by another button, { files }: a new object each time.
  incoming: PropTypes.shape({ files: PropTypes.array }),
  // Told once `incoming` is taken, to let it go.
  onIncomingTaken: PropTypes.func,
};

export default PhotoFilesEditor;
