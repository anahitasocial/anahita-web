import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { makeStyles } from 'tss-react/mui';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import MobileStepper from '@mui/material/MobileStepper';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/AddPhotoAlternate';
import AltIcon from '@mui/icons-material/SubtitlesOutlined';
import EarlierIcon from '@mui/icons-material/ArrowBack';
import LaterIcon from '@mui/icons-material/ArrowForward';
import RemoveIcon from '@mui/icons-material/Close';
import FailedIcon from '@mui/icons-material/ErrorOutlined';
import NextIcon from '@mui/icons-material/NavigateNext';
import PrevIcon from '@mui/icons-material/NavigateBefore';

import api from '../api';
import i18n from '../languages';
import photoFiles from '../utils/photoFiles';

const { STATUS } = photoFiles;

const useStyles = makeStyles()((theme) => {
  return {
    root: {
      marginBottom: theme.spacing(1),
    },
    frame: {
      position: 'relative',
    },
    // A row of photos, each as wide as the editor, that the browser itself
    // scrolls sideways and brings to rest on a photo: the same as the
    // slides a reader swipes through (PhotoSlides).
    scroller: {
      display: 'flex',
      overflowX: 'auto',
      overflowY: 'hidden',
      scrollSnapType: 'x mandatory',
      overscrollBehaviorX: 'contain',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    },
    slide: {
      flex: '0 0 100%',
      minWidth: 0,
      scrollSnapAlign: 'center',
      scrollSnapStop: 'always',
    },
    photo: {
      position: 'relative',
      height: 240,
      borderRadius: theme.shape.borderRadius,
      overflow: 'hidden',
      backgroundColor: theme.palette.action.hover,
    },
    image: {
      width: '100%',
      height: '100%',
      // The whole photo, as it will be seen.
      objectFit: 'contain',
      display: 'block',
      userSelect: 'none',
    },
    dimmed: {
      opacity: 0.4,
    },
    // Over the image, so it reads on any photo.
    over: {
      position: 'absolute',
      color: theme.palette.common.white,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      },
    },
    remove: {
      top: 8,
      right: 8,
      padding: 4,
    },
    label: {
      position: 'absolute',
      top: 8,
      left: 8,
      padding: '0 8px',
      borderRadius: 12,
      fontSize: 12,
      lineHeight: '24px',
      color: theme.palette.common.white,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      pointerEvents: 'none',
    },
    centre: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    // To the photo before and after, where there is a pointer to press
    // them with. A finger swipes.
    nav: {
      position: 'absolute',
      top: 120,
      transform: 'translateY(-50%)',
      color: theme.palette.common.white,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      },
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
    order: {
      display: 'flex',
      justifyContent: 'center',
      gap: theme.spacing(1),
      margin: theme.spacing(1, 0),
    },
    field: {
      marginTop: theme.spacing(1.5),
    },
    // The words that ask for a description, as wide as the photo and set
    // out as a sentence, not as a shouted label.
    ask: {
      marginTop: theme.spacing(1.5),
      justifyContent: 'flex-start',
      textAlign: 'left',
      textTransform: 'none',
      fontWeight: 400,
      lineHeight: 1.4,
      padding: theme.spacing(1, 2),
    },
    // Clear of the last photo's description.
    add: {
      marginTop: theme.spacing(2),
    },
    dots: {
      justifyContent: 'center',
      background: 'none',
      padding: theme.spacing(0.5),
    },
  };
});

// Why an upload was refused, in words. The server sends a short code.
const failureText = (error) => {
  const response = (error && error.response) || {};
  // Too large for the gateway is refused there, before the photo service
  // sees it, with the status and no code.
  const code = (response.data && response.data.error) ||
    (response.status === 413 ? 'file_too_large' : '');
  const known = {
    file_unsupported: 'photos:editor.unsupported',
    file_too_large: 'photos:editor.tooLarge',
    file_unreadable: 'photos:editor.unreadable',
  };
  return i18n.t(known[code] || 'photos:editor.failed');
};

// The images of a photo post while somebody arranges them: picking, putting
// in order, describing, removing.
//
// One photo at a time, as wide as the editor, swiped through like the
// slides a reader sees, with its description under it: a field that is
// there to be written in. A stack of small photos and fields was a long
// way to scroll on a phone, and before that the description was behind a
// small "ALT" mark that people did not find. Under the photos it says how
// many have no description yet: said, never insisted on, since a
// description that had to be given is how photos come to be described as
// "photo".
const PhotoFilesEditor = ({
  owner,
  items,
  onChange,
  max = photoFiles.DEFAULT_MAX,
  supportedMimetypes = ['image/jpeg', 'image/png'],
  disabled = false,
}) => {
  const { classes, cx } = useStyles();
  // Which photo is on show, read from where the row has been scrolled to.
  const [index, setIndex] = useState(0);
  const scroller = useRef(null);
  // The photos whose description was asked to be written, by key.
  const [describing, setDescribing] = useState({});
  // How many photos of the last pick did not fit. The system's own file
  // window cannot be told how many to allow, so somebody can pick more
  // than a post holds; the extra ones are left out and this says so.
  const [leftOut, setLeftOut] = useState(0);

  // The browser's own addresses for the picked files, let go of when this
  // goes away so the files are not held in memory.
  const previews = useRef([]);
  useEffect(() => {
    return () => {
      previews.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const room = photoFiles.room(items, max);

  const handleDrop = (files) => {
    // No more than there is room for; the rest are left out, not queued.
    setLeftOut(Math.max(files.length - room, 0));

    files.slice(0, room).forEach((file) => {
      const previewUrl = URL.createObjectURL(file);
      previews.current.push(previewUrl);

      const item = photoFiles.picked(file, previewUrl);
      onChange((current) => {
        return [...current, item];
      });

      // Uploaded straight away, so by the time the caption is written the
      // images are already stored.
      api.photos.upload(owner, file).then((result) => {
        onChange((current) => {
          return photoFiles.update(current, item.key, {
            status: STATUS.READY,
            uploadId: result.data.uploadId,
          });
        });
      }).catch((error) => {
        onChange((current) => {
          return photoFiles.update(current, item.key, {
            status: STATUS.FAILED,
            error: failureText(error),
          });
        });
      });
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    // react-dropzone takes a map of MIME type to file extensions.
    accept: Object.fromEntries(supportedMimetypes.map((type) => {
      return [type, []];
    })),
    multiple: true,
    disabled: disabled || room === 0,
    onDrop: handleDrop,
  });

  const undescribed = photoFiles.undescribed(items);
  const count = items.length;

  const show = (to, smooth = true) => {
    const row = scroller.current;
    if (!row) {
      return;
    }
    const still = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    row.scrollTo({
      left: Math.min(Math.max(to, 0), Math.max(count - 1, 0)) * row.clientWidth,
      behavior: smooth && !still ? 'smooth' : 'auto',
    });
  };

  const handleScroll = () => {
    const row = scroller.current;
    if (!row || !row.clientWidth) {
      return;
    }
    const at = Math.round(Math.abs(row.scrollLeft) / row.clientWidth);
    setIndex(Math.min(Math.max(at, 0), Math.max(count - 1, 0)));
  };

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
              const position = i18n.t('photos:slides.position', {
                index: at + 1,
                total: count,
              });
              const isReady = item.status === STATUS.READY;
              const described = (item.altText || '').length;

              return (
                <div
                  className={classes.slide}
                  key={item.key}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={position}
                >
                  <div className={classes.photo}>
                    <img
                      className={cx(classes.image, !isReady && classes.dimmed)}
                      src={item.previewUrl}
                      alt={item.altText || position}
                      draggable={false}
                    />
                    <span className={classes.label}>
                      {at === 0 && count > 1 ?
                        `${i18n.t('photos:editor.first')} · ${position}` :
                        position}
                    </span>
                    {item.status === STATUS.UPLOADING &&
                      <div className={classes.centre}>
                        <CircularProgress size={32} aria-label={i18n.t('photos:editor.uploading')} />
                      </div>}
                    {item.status === STATUS.FAILED &&
                      <Tooltip title={item.error || i18n.t('photos:editor.failed')}>
                        <div className={classes.centre} role="alert">
                          <FailedIcon color="error" aria-label={item.error} />
                        </div>
                      </Tooltip>}
                    <Tooltip title={i18n.t('photos:editor.remove')}>
                      <IconButton
                        className={cx(classes.over, classes.remove)}
                        aria-label={`${i18n.t('photos:editor.remove')} (${position})`}
                        onClick={() => {
                          setLeftOut(0);
                          onChange((current) => {
                            return photoFiles.remove(current, item.key);
                          });
                        }}
                        disabled={disabled}
                        size="small"
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </div>
                  {count > 1 &&
                    <div className={classes.order}>
                      <Button
                        size="small"
                        startIcon={<EarlierIcon fontSize="small" />}
                        onClick={() => {
                          move(item.key, -1);
                        }}
                        disabled={disabled || at === 0}
                      >
                        {i18n.t('photos:editor.earlier')}
                      </Button>
                      <Button
                        size="small"
                        endIcon={<LaterIcon fontSize="small" />}
                        onClick={() => {
                          move(item.key, 1);
                        }}
                        disabled={disabled || at === count - 1}
                      >
                        {i18n.t('photos:editor.later')}
                      </Button>
                    </div>}
                  {/* Its description for people who cannot see it. Asked
                      for in words that say why, and opened by pressing
                      them: the post has a description of its own just
                      below, and two fields called the same were taken
                      for one thing. Open already when it has one. */}
                  {!(described > 0 || describing[item.key]) &&
                    <Button
                      className={classes.ask}
                      variant="outlined"
                      color="inherit"
                      fullWidth
                      startIcon={<AltIcon />}
                      onClick={() => {
                        setDescribing((open) => {
                          return { ...open, [item.key]: true };
                        });
                      }}
                      disabled={disabled}
                    >
                      <span>
                        <strong>{i18n.t('photos:editor.askAlt')}</strong>
                        <br />
                        {i18n.t('photos:editor.askAltWhy')}
                      </span>
                    </Button>}
                  {(described > 0 || describing[item.key]) &&
                    <TextField
                      className={classes.field}
                      fullWidth
                      multiline
                      minRows={2}
                      maxRows={6}
                      size="small"
                      variant="outlined"
                      // Put to work at once when it was asked for.
                      autoFocus={Boolean(describing[item.key]) && described === 0}
                      label={i18n.t('photos:editor.altLabel')}
                      placeholder={i18n.t('photos:editor.altHelp')}
                      // Why it is asked for, and how long it is once it
                      // is getting long.
                      helperText={described > photoFiles.ALT_TEXT_MAX_LENGTH * 0.8 ?
                        `${described} / ${photoFiles.ALT_TEXT_MAX_LENGTH}` :
                        i18n.t('photos:editor.altWhy')}
                      value={item.altText || ''}
                      onChange={(event) => {
                        const altText = event.target.value;
                        onChange((current) => {
                          return photoFiles.update(current, item.key, { altText });
                        });
                      }}
                      disabled={disabled}
                      slotProps={{
                        inputLabel: { shrink: true },
                        htmlInput: {
                          dir: 'auto',
                          maxLength: photoFiles.ALT_TEXT_MAX_LENGTH,
                          'aria-label': `${i18n.t('photos:editor.altLabel')} (${position})`,
                          // Only the photo on show takes the keyboard.
                          tabIndex: at === index ? 0 : -1,
                        },
                      }}
                    />}
                </div>
              );
            })}
          </div>
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
          {count > 1 &&
            <MobileStepper
              className={classes.dots}
              variant="dots"
              position="static"
              steps={count}
              activeStep={Math.min(index, count - 1)}
              backButton={null}
              nextButton={null}
              elevation={0}
              aria-hidden
            />}
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
          {i18n.t(count ? 'photos:editor.addMore' : 'photos:editor.add')}
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
};

export default PhotoFilesEditor;
