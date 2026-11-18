import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import ZoomOutIcon from '@mui/icons-material/FullscreenExit';

import MediumType from '../../../../proptypes/Medium';
import PhotoSlideImage from '../../../../components/PhotoSlideImage';
import VideoPlayer from '../../../../components/VideoPlayer';
import { WarningVeil } from '../../../../components/WarningCover';
import i18n from '../../../../languages';
import photoFiles from '../../../../utils/photoFiles';
import StepButton, { labelOf } from './StepButton';

// A button that zooms into the picture it holds. Fitted, a real button
// carries the affordance and gives the keyboard a way in.
const ZoomButton = ({
  className,
  label,
  children,
  ...props
}) => {
  return (
    <button
      type="button"
      className={className}
      title={label}
      aria-label={label}
      {...props}
    >
      {children}
    </button>
  );
};

ZoomButton.propTypes = {
  className: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

// The lightbox's left-hand pane, beside the post: a video playing where a
// photo would be, or the picture, fitted or zoomed into, with the arrows
// to the post before and after over it. A post with several images shows
// them as a row to swipe through; zoomed, it is the one image at full
// size, as for any photo. Nothing for a post with neither.
//
// What it draws comes from usePortrait (`picture`) and useSwipe (`swipe`).
const MediaPane = ({
  classes,
  medium,
  fileIndex,
  fileCount,
  hasRow,
  warned,
  picture,
  swipe,
  hasNext,
  hasPrev,
  handleNext,
  handlePrev,
}) => {
  const {
    hasPortrait,
    src,
    isPortraitLoaded,
    canZoom,
    isZoomed,
    isZoomLoading,
    isPanning,
    paneRef,
    handleZoomToggle,
  } = picture;
  const zoomLabel = i18n.t(isZoomed ? 'media:stepper.zoomOut' : 'media:stepper.zoomIn');

  // A video plays where a photo would be shown; the arrows to step are
  // under the post, as for anything without a picture.
  if (!hasPortrait) {
    return medium.video ? (
      <Grid
        // Keyed, so that a video and a photo are never the same pane.
        key="video"
        className={classes.mediaPane}
        size={{ xs: 12, md: 8 }}
      >
        <Box
          sx={{
            width: '100%',
            // As tall as the pane at most, so a portrait video keeps its
            // controls in view (styles.js: the pane's two heights).
            '& video': {
              display: 'block',
              width: '100%',
              maxHeight: { xs: '60vh', md: 'calc(100vh - 49px)' },
              objectFit: 'contain',
            },
          }}
        >
          <VideoPlayer video={medium.video} title={medium.title} />
        </Box>
        {/* Its content warning over it (row 122), for each post. */}
        <WarningVeil state={warned} />
      </Grid>
    ) : null;
  }

  const image = src ? (
    <img
      className={clsx(
        classes.portrait,
        isPortraitLoaded && classes.portraitLoaded,
        isZoomed && classes.portraitZoomed,
      )}
      alt={photoFiles.altOf(medium, fileIndex)}
      src={src}
      draggable={false}
      onLoad={picture.handleImageLoad}
      onError={picture.handleImageError}
    />
  ) : null;

  // The arrows over the picture, to the post before and after.
  const overlayStep = (way, onClick, disabled, placeClass) => {
    return (
      <div className={clsx(classes.overlayNav, placeClass)}>
        <Tooltip title={labelOf(way)}>
          <span>
            <StepButton
              way={way}
              className={classes.overlayNavButton}
              onClick={onClick}
              disabled={disabled}
            />
          </span>
        </Tooltip>
      </div>
    );
  };

  return (
    <Grid
      key="portrait"
      ref={paneRef}
      className={clsx(
        classes.mediaPane,
        isZoomed && classes.mediaPaneZoomed,
        isPanning && classes.mediaPanePanning,
      )}
      onTouchStart={swipe.handleTouchStart}
      onTouchEnd={swipe.handleTouchEnd}
      onMouseDown={picture.handleMouseDown}
      onMouseMove={picture.handleMouseMove}
      onMouseUp={picture.handleMouseUp}
      onMouseLeave={picture.handleMouseUp}
      size={{ xs: 12, md: 8 }}
    >
      <WarningVeil state={warned} />
      {(isZoomLoading || (!isPortraitLoaded && !(hasRow && !isZoomed))) &&
        <CircularProgress className={classes.spinner} />}
      {fileCount > 1 && !isZoomed &&
        <span className={classes.fileCount} aria-live="polite">
          {i18n.t('photos:slides.position', {
            index: fileIndex + 1,
            total: fileCount,
          })}
        </span>}
      {/* Zoomed, the pane itself takes the click so a pan does not
          register as one. */}
      {isZoomed && image}
      {!isZoomed && hasRow &&
        <div
          // A row of its own for each post, so it starts where that post
          // should and not where the last one was left.
          key={`files-${medium.id}`}
          ref={swipe.rowRef}
          className={classes.fileRow}
          // Left to right whatever the page, so the arithmetic that reads
          // the position holds.
          dir="ltr"
          onScroll={swipe.handleRowScroll}
        >
          {photoFiles.filesOf(medium).map((file, at) => {
            return (
              <div
                className={classes.fileSlide}
                key={file.id || at}
              >
                <ZoomButton
                  className={classes.zoomButton}
                  label={zoomLabel}
                  // Only the image on show takes the keyboard, and only it
                  // can be zoomed.
                  tabIndex={at === fileIndex ? 0 : -1}
                  disabled={!canZoom}
                  onClick={() => {
                    if (at === fileIndex) handleZoomToggle();
                  }}
                >
                  <PhotoSlideImage
                    medium={medium}
                    index={at}
                    size="large"
                    imageClassName={classes.fileImage}
                  />
                </ZoomButton>
              </div>
            );
          })}
        </div>}
      {!isZoomed && !hasRow && canZoom && image &&
        <ZoomButton
          className={classes.zoomButton}
          label={zoomLabel}
          onClick={handleZoomToggle}
        >
          {image}
        </ZoomButton>}
      {!isZoomed && !hasRow && !canZoom && image}
      {isZoomed &&
        <div className={classes.zoomExit}>
          <Tooltip title={zoomLabel}>
            <IconButton
              className={classes.overlayNavButton}
              aria-label={zoomLabel}
              onClick={handleZoomToggle}
              size="large"
            >
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
        </div>}
      {!isZoomed && overlayStep('prev', handlePrev, !hasPrev, classes.overlayNavPrev)}
      {!isZoomed && overlayStep('next', handleNext, !hasNext, classes.overlayNavNext)}
    </Grid>
  );
};

MediaPane.propTypes = {
  classes: PropTypes.object.isRequired,
  medium: MediumType.isRequired,
  // Which image of a post with several is on show, and how many it has.
  fileIndex: PropTypes.number.isRequired,
  fileCount: PropTypes.number.isRequired,
  // Whether its images are a row to swipe through.
  hasRow: PropTypes.bool.isRequired,
  // Its content warning, from useWarning.
  warned: PropTypes.object.isRequired,
  // What usePortrait and useSwipe give.
  picture: PropTypes.object.isRequired,
  swipe: PropTypes.object.isRequired,
  hasNext: PropTypes.bool.isRequired,
  hasPrev: PropTypes.bool.isRequired,
  handleNext: PropTypes.func.isRequired,
  handlePrev: PropTypes.func.isRequired,
};

export default MediaPane;
