import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import AltIcon from '@mui/icons-material/SubtitlesOutlined';
import EarlierIcon from '@mui/icons-material/ArrowBack';
import LaterIcon from '@mui/icons-material/ArrowForward';
import RemoveIcon from '@mui/icons-material/Close';
import RetryIcon from '@mui/icons-material/Refresh';

import i18n from '../languages';
import photoFiles from '../utils/photoFiles';
import { slideStyles } from './SlideRow';

const { STATUS } = photoFiles;

const useStyles = makeStyles()((theme) => {
  return {
    slide: slideStyles(),
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
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing(1),
    },
    // Why a photo was not taken, over it, in white on a dark band.
    failed: {
      color: theme.palette.common.white,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(0.5, 1),
      maxWidth: '80%',
      textAlign: 'center',
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
  };
});

// One photo of PhotoFilesEditor's row, as wide as the editor: the photo,
// how far its upload has got or why it failed, the way to remove it or move
// it, and its description under it.
const PhotoFileSlide = ({
  item,
  at,
  count,
  isShown,
  disabled = false,
  canRetry,
  onRetry,
  onRemove,
  onMove,
  onAltText,
}) => {
  const { classes, cx } = useStyles();
  // Whether its description was asked to be written.
  const [describing, setDescribing] = useState(false);

  const position = i18n.t('photos:slides.position', {
    index: at + 1,
    total: count,
  });
  const isReady = item.status === STATUS.READY;
  const described = (item.altText || '').length;

  return (
    <div
      className={classes.slide}
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
            <CircularProgress
              size={32}
              variant={item.progress ? 'determinate' : 'indeterminate'}
              value={item.progress || 0}
              aria-label={i18n.t('photos:editor.uploading')}
            />
          </div>}
        {/* Why it failed, and sending it again where it can be. */}
        {item.status === STATUS.FAILED &&
          <div className={classes.centre} role="alert">
            <Typography variant="body2" className={classes.failed}>
              {item.error || i18n.t('photos:editor.failed')}
            </Typography>
            {canRetry &&
              <Button
                size="small"
                variant="contained"
                startIcon={<RetryIcon />}
                onClick={onRetry}
                disabled={disabled}
              >
                {i18n.t('photos:editor.retry')}
              </Button>}
          </div>}
        <Tooltip title={i18n.t('photos:editor.remove')}>
          <IconButton
            className={cx(classes.over, classes.remove)}
            aria-label={`${i18n.t('photos:editor.remove')} (${position})`}
            onClick={onRemove}
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
              onMove(-1);
            }}
            disabled={disabled || at === 0}
          >
            {i18n.t('photos:editor.earlier')}
          </Button>
          <Button
            size="small"
            endIcon={<LaterIcon fontSize="small" />}
            onClick={() => {
              onMove(1);
            }}
            disabled={disabled || at === count - 1}
          >
            {i18n.t('photos:editor.later')}
          </Button>
        </div>}
      {/* Its description for people who cannot see it. Asked for in words
          that say why, and opened by pressing them: the post has a
          description of its own just below, and two fields called the same
          were taken for one thing. Open already when it has one. */}
      {!(described > 0 || describing) &&
        <Button
          className={classes.ask}
          variant="outlined"
          color="inherit"
          fullWidth
          startIcon={<AltIcon />}
          onClick={() => {
            setDescribing(true);
          }}
          disabled={disabled}
        >
          <span>
            <strong>{i18n.t('photos:editor.askAlt')}</strong>
            <br />
            {i18n.t('photos:editor.askAltWhy')}
          </span>
        </Button>}
      {(described > 0 || describing) &&
        <TextField
          className={classes.field}
          fullWidth
          multiline
          minRows={2}
          maxRows={6}
          size="small"
          variant="outlined"
          // Put to work at once when it was asked for.
          autoFocus={describing && described === 0}
          label={i18n.t('photos:editor.altLabel')}
          placeholder={i18n.t('photos:editor.altHelp')}
          // Why it is asked for, and how long it is once it is getting
          // long.
          helperText={described > photoFiles.ALT_TEXT_MAX_LENGTH * 0.8 ?
            `${described} / ${photoFiles.ALT_TEXT_MAX_LENGTH}` :
            i18n.t('photos:editor.altWhy')}
          value={item.altText || ''}
          onChange={(event) => {
            onAltText(event.target.value);
          }}
          disabled={disabled}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: {
              dir: 'auto',
              maxLength: photoFiles.ALT_TEXT_MAX_LENGTH,
              'aria-label': `${i18n.t('photos:editor.altLabel')} (${position})`,
              // Only the photo on show takes the keyboard.
              tabIndex: isShown ? 0 : -1,
            },
          }}
        />}
    </div>
  );
};

PhotoFileSlide.propTypes = {
  // The photo as the editor holds it (utils/photoFiles).
  item: PropTypes.object.isRequired,
  // Its place in the row, and how many there are.
  at: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  // Whether it is the photo on show, which alone takes the keyboard.
  isShown: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  // Whether a failed upload can be sent again, and the way to.
  canRetry: PropTypes.bool.isRequired,
  onRetry: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  // Given -1 to move it earlier, 1 later.
  onMove: PropTypes.func.isRequired,
  // Given its description as it is typed.
  onAltText: PropTypes.func.isRequired,
};

export default PhotoFileSlide;
