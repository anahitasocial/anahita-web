import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import moment from 'moment';
import { withStyles } from 'tss-react/mui';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import NextIcon from '@mui/icons-material/NavigateNext';
import PrevIcon from '@mui/icons-material/NavigateBefore';
import ZoomOutIcon from '@mui/icons-material/FullscreenExit';

import MediumType from '../../../../proptypes/Medium';
import ActorTitle from '../../../../components/ActorTitle';
import ActorAvatar from '../../../../components/ActorAvatar';
import CardHeaderOwner from '../../../../components/MediumOwnerCardHeader';
import { PhotoSlideImage } from '../../../../components/PhotoSlides';
import Player from '../../../../components/Player';
import EntityBody from '../../../../components/NodeBody';
import i18n from '../../../../languages';
import utils from '../../../../utils';
import photoFiles from '../../../../utils/photoFiles';
import styles from './styles';

const {
  getAuthor,
  getNamespace,
  getURL,
  getPortraitURL,
  getPortraitURLs,
} = utils.node;

const SWIPE_THRESHOLD = 50;
// Below this a mouse gesture is a click that toggles zoom; above it, a pan.
const DRAG_THRESHOLD = 5;

const TABS = {
  REPLIES: 'replies',
  LOCATIONS: 'locations',
};

const MediumStepperLightboxDefault = ({
  classes,
  medium,
  fileIndex = 0,
  handleFileIndex = null,
  actions,
  menu,
  stats,
  locations,
  replies,
  editing,
  form,
  hasNext,
  hasPrev,
  handleNext,
  handlePrev,
}) => {
  const [tab, setTab] = useState(TABS.REPLIES);
  const [resolvedSrc, setResolvedSrc] = useState('');
  const [loadedSrc, setLoadedSrc] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [isZoomLoading, setIsZoomLoading] = useState(false);
  const [hasZoomFailed, setHasZoomFailed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const touchStartRef = useRef(null);
  const paneRef = useRef(null);
  const dragRef = useRef(null);
  const zoomLoaderRef = useRef(null);
  // The row of a post's images, the image it was last scrolled to, and
  // whether it has only just been put on the page.
  const rowRef = useRef(null);
  const scrolledToRef = useRef(0);
  const rowIsNewRef = useRef(true);
  const rowMediumRef = useRef(null);

  // A size the API lists is not necessarily a size it stored, so these are
  // candidates rather than a URL.
  //
  // A post with several images is shown one image at a time. shown is the
  // post as if the image on show were its only one, which is all the rest
  // of this needs to know about there being several.
  const fileCount = photoFiles.countOf(medium);
  const shown = useMemo(() => {
    return photoFiles.asSingle(medium, fileIndex);
  }, [medium, fileIndex]);

  const portraits = useMemo(() => {
    return getPortraitURLs(shown, 'large');
  }, [shown]);

  // Probing candidates by pointing the visible <img> at them blanks the pane
  // once per 404, so a photo whose 'large' was never generated flickers twice
  // before it appears. Resolve out of band instead and hand the element only a
  // URL that has already loaded — it then paints from cache, in one step.
  useEffect(() => {
    let isCurrent = true;
    setResolvedSrc('');

    const attempt = (index) => {
      const candidate = portraits[index];
      if (!isCurrent || !candidate) return;

      const probe = new window.Image();
      probe.onload = () => {
        if (isCurrent) setResolvedSrc(candidate);
      };
      probe.onerror = () => {
        attempt(index + 1);
      };
      probe.src = candidate;
    };

    attempt(0);

    return () => {
      isCurrent = false;
    };
  }, [portraits]);

  // The full upload runs to several megabytes, so it is fetched only once
  // someone asks to zoom — never on open, and never by the neighbour prefetch.
  const zoom = getPortraitURL(shown, 'original');
  // A post with several images shows them as a row to swipe through.
  // Zoomed, it is the one image at full size, as for any photo.
  const hasRow = fileCount > 1;
  const hasPortrait = portraits.length > 0;
  const src = isZoomed ? zoom : resolvedSrc;
  // Derived rather than reset in an effect: an effect lands a frame late, and
  // that frame shows the previous photo under the new src.
  const isPortraitLoaded = Boolean(src) && loadedSrc === src;
  const canZoom = hasPortrait && Boolean(zoom) && !hasZoomFailed;
  const url = getURL(medium);
  const author = getAuthor(medium);
  const createdAt = moment.utc(medium.createdAt).local().format('LLL').toString();

  // Drop a download still in flight: its photo is no longer the one on screen.
  const cancelZoomLoad = useCallback(() => {
    if (zoomLoaderRef.current) {
      zoomLoaderRef.current.onload = null;
      zoomLoaderRef.current.onerror = null;
      zoomLoaderRef.current = null;
    }
    setIsZoomLoading(false);
  }, []);

  useEffect(() => {
    setIsZoomed(false);
    setHasZoomFailed(false);
    cancelZoomLoad();
  }, [medium.id, fileIndex, cancelZoomLoad]);

  useEffect(() => {
    return cancelZoomLoad;
  }, [cancelZoomLoad]);

  // The original runs to several megabytes, so fetch it out of band and keep
  // the fitted image on screen until it has arrived — swapping src first would
  // blank the pane for the length of the download.
  const handleZoomToggle = useCallback(() => {
    if (isZoomed) {
      // The fitted size is still cached from before the zoom, so mark it
      // loaded as we go back to it rather than fading in from a spinner.
      setLoadedSrc(resolvedSrc);
      setIsZoomed(false);
      return;
    }
    if (!canZoom || isZoomLoading) return;

    const loader = new window.Image();
    zoomLoaderRef.current = loader;
    setIsZoomLoading(true);

    loader.onload = () => {
      if (zoomLoaderRef.current !== loader) return;
      zoomLoaderRef.current = null;
      setIsZoomLoading(false);
      // Marked loaded before it is shown: it is in cache, so the swap must not
      // fade out through a blank frame on the way in.
      setLoadedSrc(zoom);
      setIsZoomed(true);
    };

    loader.onerror = () => {
      if (zoomLoaderRef.current !== loader) return;
      zoomLoaderRef.current = null;
      setIsZoomLoading(false);
      setHasZoomFailed(true);
    };

    loader.src = zoom;
  }, [canZoom, isZoomed, isZoomLoading, zoom, resolvedSrc]);

  // Keeps the row where the stepper says it is. The stepper moves through
  // a post's images for the arrows and the arrow keys; a swipe moves the
  // row itself and tells the stepper afterwards, and that must not be
  // answered by scrolling the row again.
  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) {
      // Not on the page: zoomed, or a post with one image. When it comes
      // back it starts at the first image and has to be put right.
      rowIsNewRef.current = true;
      return;
    }

    // Each post has a row of its own, so another post is a new row too.
    const isNew = rowIsNewRef.current || rowMediumRef.current !== medium.id;
    rowIsNewRef.current = false;
    rowMediumRef.current = medium.id;
    if (!isNew && scrolledToRef.current === fileIndex) {
      return;
    }

    scrolledToRef.current = fileIndex;
    const still = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    row.scrollTo({
      left: fileIndex * row.clientWidth,
      // A step slides. Arriving at a post, or back from a zoom, does not:
      // the image wanted is simply there.
      behavior: isNew || still ? 'auto' : 'smooth',
    });
  }, [fileIndex, medium.id, isZoomed, hasRow]);

  const handleRowScroll = () => {
    const row = rowRef.current;
    if (!row || !row.clientWidth) return;

    const at = photoFiles.step(Math.round(row.scrollLeft / row.clientWidth), 0, fileCount);
    if (at === scrolledToRef.current) return;

    scrolledToRef.current = at;
    if (handleFileIndex) handleFileIndex(at);
  };

  // Panning is mouse-only: a zoomed pane scrolls, so touch already pans itself.
  const handleMouseDown = (event) => {
    if (!isZoomed || !paneRef.current) return;
    event.preventDefault();
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: paneRef.current.scrollLeft,
      scrollTop: paneRef.current.scrollTop,
      moved: false,
    };
    setIsPanning(true);
  };

  const handleMouseMove = (event) => {
    const drag = dragRef.current;
    if (!drag || !paneRef.current) return;

    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      drag.moved = true;
    }

    paneRef.current.scrollLeft = drag.scrollLeft - dx;
    paneRef.current.scrollTop = drag.scrollTop - dy;
  };

  const handleMouseUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    setIsPanning(false);
    // A press that went nowhere was a click, so it zooms back out.
    if (drag && !drag.moved) handleZoomToggle();
  };

  const changeTab = (event, value) => {
    setTab(value);
  };

  const handleTouchStart = (event) => {
    if (isZoomed) return;
    touchStartRef.current = {
      x: event.changedTouches[0].clientX,
      fileIndex,
    };
  };

  const handleTouchEnd = (event) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    // While zoomed a horizontal drag is panning the photo, not stepping off it.
    if (isZoomed || start === null) return;

    const distance = event.changedTouches[0].clientX - start.x;
    if (Math.abs(distance) < SWIPE_THRESHOLD) return;

    // Within a post's images the row scrolls itself. A swipe leaves the
    // post only from its ends: on from the last image, back from the
    // first.
    if (hasRow) {
      if (distance < 0 && start.fileIndex < fileCount - 1) return;
      if (distance > 0 && start.fileIndex > 0) return;
    }

    if (distance < 0 && hasNext) handleNext();
    if (distance > 0 && hasPrev) handlePrev();
  };

  const prevLabel = i18n.t('media:stepper.previous');
  const nextLabel = i18n.t('media:stepper.next');
  const zoomLabel = i18n.t(isZoomed ? 'media:stepper.zoomOut' : 'media:stepper.zoomIn');

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
      onLoad={() => {
        setLoadedSrc(src);
        // Open the zoom on the middle of the photo rather than its top-left
        // corner.
        const pane = paneRef.current;
        if (isZoomed && pane) {
          pane.scrollLeft = (pane.scrollWidth - pane.clientWidth) / 2;
          pane.scrollTop = (pane.scrollHeight - pane.clientHeight) / 2;
        }
      }}
      onError={() => {
        // Everything shown here was fetched successfully moments ago, so this
        // only fires if the cache dropped it. Fall back to the fitted view;
        // the resolver picks a size again on the next photo.
        if (isZoomed) setIsZoomed(false);
      }}
    />
  ) : null;

  return (
    <div className={classes.root}>
      <Grid container>
        {hasPortrait &&
          <Grid
            ref={paneRef}
            className={clsx(
              classes.mediaPane,
              isZoomed && classes.mediaPaneZoomed,
              isPanning && classes.mediaPanePanning,
            )}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            size={{ xs: 12, md: 8 }}
          >
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
                register as one; fitted, a real button carries the affordance
                and gives the keyboard a way in. */}
            {isZoomed && image}
            {!isZoomed && hasRow &&
              <div
                // A row of its own for each post, so it starts where that
                // post should and not where the last one was left.
                key={`files-${medium.id}`}
                ref={rowRef}
                className={classes.fileRow}
                // Left to right whatever the page, so the arithmetic that
                // reads the position holds.
                dir="ltr"
                onScroll={handleRowScroll}
              >
                {photoFiles.filesOf(medium).map((file, at) => {
                  return (
                    <div
                      className={classes.fileSlide}
                      key={file.id || at}
                    >
                      <button
                        type="button"
                        className={classes.zoomButton}
                        title={zoomLabel}
                        aria-label={zoomLabel}
                        // Only the image on show takes the keyboard, and
                        // only it can be zoomed.
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
                      </button>
                    </div>
                  );
                })}
              </div>}
            {!isZoomed && !hasRow && canZoom && image &&
              <button
                type="button"
                className={classes.zoomButton}
                title={zoomLabel}
                aria-label={zoomLabel}
                onClick={handleZoomToggle}
              >
                {image}
              </button>}
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
            {!isZoomed &&
            <div className={clsx(classes.overlayNav, classes.overlayNavPrev)}>
              <Tooltip title={prevLabel}>
                <span>
                  <IconButton
                    className={classes.overlayNavButton}
                    aria-label={prevLabel}
                    onClick={handlePrev}
                    disabled={!hasPrev}
                    size="large"
                  >
                    <PrevIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </div>}
            {!isZoomed &&
            <div className={clsx(classes.overlayNav, classes.overlayNavNext)}>
              <Tooltip title={nextLabel}>
                <span>
                  <IconButton
                    className={classes.overlayNavButton}
                    aria-label={nextLabel}
                    onClick={handleNext}
                    disabled={!hasNext}
                    size="large"
                  >
                    <NextIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </div>}
          </Grid>}
        <Grid size={{ xs: 12, md: hasPortrait ? 4 : 12 }}>
          <div className={classes.details}>
            <div className={hasPortrait ? undefined : classes.detailsInner}>
              <Card>
                {medium.owner && medium.owner.type &&
                  getNamespace(medium.owner) !== 'people' &&
                  <CardHeaderOwner owner={medium.owner} />}
                <CardHeader
                  avatar={
                    <ActorAvatar
                      actor={author}
                      linked={Boolean(author.id)}
                    />
                  }
                  title={
                    <ActorTitle
                      actor={author}
                      linked={Boolean(author.id)}
                    />
                  }
                  subheader={
                    <Link
                      href={url}
                      title={createdAt}
                    >
                      {moment.utc(medium.createdAt).fromNow()}
                    </Link>
                  }
                  action={menu}
                />
                {editing && form}
                {!editing &&
                  <>
                    {medium.body && <Player text={medium.body} />}
                    <CardContent component="article">
                      {medium.name &&
                        <Typography
                          variant="h2"
                          className={classes.title}
                        >
                          {medium.name}
                        </Typography>}
                      {medium.body &&
                        <EntityBody>
                          {utils.contentfilter({
                            text: medium.body,
                            filters: [
                              'hashtag',
                              'mention',
                              'url',
                            ],
                          })}
                        </EntityBody>}
                    </CardContent>
                    {stats &&
                      <CardActions>
                        {stats}
                      </CardActions>}
                    {actions &&
                      <CardActions>
                        {actions}
                      </CardActions>}
                  </>}
              </Card>
              {!hasPortrait && (hasPrev || hasNext) &&
                <Box className={classes.footerNav}>
                  <IconButton
                    aria-label={prevLabel}
                    onClick={handlePrev}
                    disabled={!hasPrev}
                    size="large"
                  >
                    <PrevIcon />
                  </IconButton>
                  <IconButton
                    aria-label={nextLabel}
                    onClick={handleNext}
                    disabled={!hasNext}
                    size="large"
                  >
                    <NextIcon />
                  </IconButton>
                </Box>}
              <Tabs
                className={classes.tabs}
                value={tab}
                onChange={changeTab}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                <Tab label={i18n.t('replies:cTitle')} value={TABS.REPLIES} />
                <Tab label={i18n.t('locations:cTitle')} value={TABS.LOCATIONS} />
              </Tabs>
              {tab === TABS.REPLIES && replies}
              {tab === TABS.LOCATIONS && locations}
            </div>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

MediumStepperLightboxDefault.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.node,
  stats: PropTypes.node,
  menu: PropTypes.node,
  medium: MediumType.isRequired,
  // Which image of a post with several is on show.
  fileIndex: PropTypes.number,
  // Told which image has been swiped to.
  handleFileIndex: PropTypes.func,
  locations: PropTypes.node,
  // The thread of replies under the post.
  replies: PropTypes.node,
  form: PropTypes.node,
  editing: PropTypes.bool,
  hasNext: PropTypes.bool.isRequired,
  hasPrev: PropTypes.bool.isRequired,
  handleNext: PropTypes.func.isRequired,
  handlePrev: PropTypes.func.isRequired,
};

export default withStyles(MediumStepperLightboxDefault, styles);
