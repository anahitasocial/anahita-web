import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { makeStyles } from 'tss-react/mui';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/AddPhotoAlternate';
import EarlierIcon from '@mui/icons-material/ArrowBack';
import LaterIcon from '@mui/icons-material/ArrowForward';
import RemoveIcon from '@mui/icons-material/Close';
import FailedIcon from '@mui/icons-material/ErrorOutlined';

import api from '../api';
import i18n from '../languages';
import photoFiles from '../utils/photoFiles';

const { STATUS } = photoFiles;

const TILE = 112;

const useStyles = makeStyles()((theme) => {
  return {
    // One photo to a row: the photo, and beside it what it shows, in
    // words, where nobody can miss that it is asked for.
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    item: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: theme.spacing(2),
    },
    tile: {
      width: TILE,
      flex: 'none',
    },
    field: {
      flex: '1 1 auto',
      minWidth: 0,
      margin: 0,
    },
    frame: {
      position: 'relative',
      width: TILE,
      height: TILE,
      borderRadius: theme.shape.borderRadius,
      overflow: 'hidden',
      backgroundColor: theme.palette.action.hover,
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
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
      top: 4,
      right: 4,
      padding: 2,
    },
    first: {
      position: 'absolute',
      top: 4,
      left: 4,
      padding: '0 6px',
      borderRadius: 10,
      fontSize: 11,
      lineHeight: '20px',
      color: theme.palette.common.white,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    centre: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    order: {
      display: 'flex',
      justifyContent: 'center',
    },
    add: {
      width: TILE,
      height: TILE,
      flexDirection: 'column',
      textTransform: 'none',
      fontSize: 12,
      lineHeight: 1.3,
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
// Each photo has its description beside it, as a field that is there to be
// written in. It used to be behind a small "ALT" mark on the photo, and
// people kept asking for a feature that was already there. Under the list
// it says how many photos have none yet: said, never insisted on, since a
// description that had to be given is how photos come to be described as
// "photo". Used by the composer for a new post and
// by the dialog that changes the images of one that exists.
//
// It holds nothing itself. The list lives with whoever uses it, and every
// change is handed back as a function of the list as it then is, because
// uploads finish at their own pace and each has to change the list that is
// there when it does, not the one that was there when it started.
const PhotoFilesEditor = ({
  owner,
  items,
  onChange,
  max = photoFiles.DEFAULT_MAX,
  supportedMimetypes = ['image/jpeg', 'image/png'],
  disabled = false,
}) => {
  const { classes, cx } = useStyles();
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

  return (
    <>
      <div className={classes.list}>
        {items.map((item, index) => {
          const position = i18n.t('photos:slides.position', {
            index: index + 1,
            total: items.length,
          });
          const isReady = item.status === STATUS.READY;

          const described = (item.altText || '').length;

          return (
            <div className={classes.item} key={item.key}>
              <div className={classes.tile}>
                <div className={classes.frame}>
                  <img
                    className={cx(classes.image, !isReady && classes.dimmed)}
                    src={item.previewUrl}
                    alt={item.altText || position}
                  />
                  {index === 0 && items.length > 1 &&
                  <span className={classes.first}>
                    {i18n.t('photos:editor.first')}
                  </span>}
                  {item.status === STATUS.UPLOADING &&
                  <div className={classes.centre}>
                    <CircularProgress size={28} aria-label={i18n.t('photos:editor.uploading')} />
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
                {items.length > 1 &&
                <div className={classes.order}>
                  <IconButton
                    aria-label={`${i18n.t('photos:editor.earlier')} (${position})`}
                    title={i18n.t('photos:editor.earlier')}
                    onClick={() => {
                      onChange((current) => {
                        return photoFiles.move(current, item.key, -1);
                      });
                    }}
                    disabled={disabled || index === 0}
                    size="small"
                  >
                    <EarlierIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label={`${i18n.t('photos:editor.later')} (${position})`}
                    title={i18n.t('photos:editor.later')}
                    onClick={() => {
                      onChange((current) => {
                        return photoFiles.move(current, item.key, 1);
                      });
                    }}
                    disabled={disabled || index === items.length - 1}
                    size="small"
                  >
                    <LaterIcon fontSize="small" />
                  </IconButton>
                </div>}
              </div>
              <TextField
                className={classes.field}
                multiline
                minRows={3}
                maxRows={6}
                size="small"
                variant="outlined"
                label={i18n.t('photos:editor.altLabel')}
                placeholder={i18n.t('photos:editor.altHelp')}
                // Said only when it is getting long: most are a sentence.
                helperText={described > photoFiles.ALT_TEXT_MAX_LENGTH * 0.8 ?
                  `${described} / ${photoFiles.ALT_TEXT_MAX_LENGTH}` :
                  undefined}
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
                  },
                }}
              />
            </div>
          );
        })}
      </div>
      <div>
        {room > 0 &&
          <Button
            {...getRootProps()}
            className={classes.add}
            variant="outlined"
            color="primary"
            disabled={disabled}
          >
            <input {...getInputProps()} />
            <AddIcon />
            {i18n.t(items.length ? 'photos:editor.addMore' : 'photos:editor.add')}
          </Button>}
      </div>
      {leftOut > 0 &&
        <Typography variant="caption" color="error" component="p" role="alert">
          {i18n.t('photos:editor.leftOut', { count: leftOut, max })}
        </Typography>}
      <Typography variant="caption" color="textSecondary" component="p">
        {i18n.t('photos:editor.limit', { max })}
      </Typography>
      {undescribed > 0 &&
        <Typography variant="caption" color="textSecondary" component="p">
          {i18n.t('photos:editor.undescribed', { count: undescribed })}
        </Typography>}
    </>
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
