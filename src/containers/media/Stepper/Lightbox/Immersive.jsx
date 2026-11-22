import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { withStyles } from 'tss-react/mui';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import { ThemeProvider, useTheme } from '@mui/material/styles';

import CloseIcon from '@mui/icons-material/Close';
import ReplyIcon from '@mui/icons-material/ModeCommentOutlined';
import ZoomOutIcon from '@mui/icons-material/FullscreenExit';

import ActorAvatar from '../../../../components/ActorAvatar';
import EntityBody from '../../../../components/NodeBody';
import PostActionsRow from '../../../../components/PostActionsRow';
import { Blurred, useWarning } from '../../../../components/WarningCover';
import MediumType from '../../../../proptypes/Medium';
import makeTheme from '../../../../styles';
import i18n from '../../../../languages';
import photoFiles from '../../../../utils/photoFiles';
import timeAgo from '../../../../utils/timeAgo';
import utils from '../../../../utils';
import warnings from '../../../../utils/warnings';
import MediaPane from './MediaPane';
import styles from './styles';
import usePortrait from './usePortrait';
import useSwipe from './useSwipe';

const {
  getActorName, getAuthor, getURL,
} = utils.node;

// Two taps closer than this are a double tap.
const DOUBLE_TAP_MS = 280;
// How far down a picture is pulled before letting go closes the lightbox.
const CLOSE_DISTANCE = 120;
// How far a pull goes before it is taken for one, up or down, not a swipe.
const DRAG_START = 10;
// How much fingers spread, or come together, before it is a pinch.
const PINCH_IN = 1.25;
const PINCH_OUT = 0.8;

// Above and below the picture: white on a dark band, the same on every
// photo, nothing fading into it.
const BAND = 'rgba(0, 0, 0, 0.72)';

const distanceOf = (touches) => {
  const [a, b] = [touches[0], touches[1]];
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
};

// The lightbox takes a step in the browser's history, so that the phone's
// back gesture closes it, as it closes a photo in any app, and leaves the
// page where it was. Closing it any other way takes that step back.
const useBackToClose = (onClose) => {
  const pushed = useRef(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    window.history.pushState({ ...(window.history.state || {}), lightbox: true }, '');
    pushed.current = true;
    const onPop = () => {
      // Back from the replies over it (useSheet) lands here still.
      if (window.history.state && window.history.state.lightbox) return;
      if (!pushed.current) return;
      pushed.current = false;
      closeRef.current();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (pushed.current) {
        pushed.current = false;
        window.history.back();
      }
    };
  }, []);

  return useCallback(() => {
    if (pushed.current) {
      window.history.back();
    } else {
      closeRef.current();
    }
  }, []);
};

// The replies over the picture, open or not, with a step in the history of
// their own: the back gesture closes them first, then the lightbox.
const useSheet = (postId) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    window.history.pushState({ ...(window.history.state || {}), sheet: true }, '');
    let popped = false;
    const onPop = () => {
      if (window.history.state && window.history.state.sheet) return;
      popped = true;
      setIsOpen(false);
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (!popped && window.history.state && window.history.state.sheet) window.history.back();
    };
  }, [isOpen]);

  // Another post stepped to: its replies are not these.
  useEffect(() => {
    setIsOpen(false);
  }, [postId]);

  return [isOpen, setIsOpen];
};

// The lightbox on a mobile (the user, 2026-11-22): the picture has the
// whole screen, on black. Over it, a bar with the way out and which picture
// this is, and at the bottom the writer, the words and the post's buttons.
// A tap hides them, to see the picture alone, and brings them back.
//
// As a phone's own photos are looked at: swiped left and right through the
// pictures, and on to the next post after the last; pulled down to close;
// a double tap or a pinch to zoom in, a tap or a pinch to come out; the back
// gesture closes it.
//
// Reply opens the post's replies in a sheet over the picture, to be read and
// answered without leaving it (the user, 2026-11-22); pulled down, tapped
// above or gone back from, it closes, and the picture is as it was. Its
// locations and what cites it are on the post's own page. On a wider screen
// the lightbox keeps its side panel (Default.jsx).
const Immersive = ({
  classes,
  medium,
  fileIndex = 0,
  handleFileIndex = null,
  actions = null,
  menu = null,
  stats = null,
  replies = null,
  hasNext,
  hasPrev,
  handleNext,
  handlePrev,
  handleClose,
}) => {
  const fileCount = photoFiles.countOf(medium);
  const hasRow = fileCount > 1;
  const warned = useWarning(medium);
  const picture = usePortrait({ medium, fileIndex });
  const swipe = useSwipe({
    medium,
    fileIndex,
    fileCount,
    hasRow,
    isZoomed: picture.isZoomed,
    handleFileIndex,
    hasNext,
    hasPrev,
    handleNext,
    handlePrev,
  });
  const close = useBackToClose(handleClose);
  const [isSheetOpen, setIsSheetOpen] = useSheet(medium.id);

  // The bars over the picture, shown until a tap hides them. Where there is
  // no picture, a video or words alone, they stay, above and below.
  const [showBars, setShowBars] = useState(true);
  const overlay = picture.hasPortrait;
  const bars = showBars || !overlay;
  // The words in two lines, or all of them, a tap apart; each post opens
  // on two.
  const [isOpenWords, setIsOpenWords] = useState(false);
  useEffect(() => {
    setIsOpenWords(false);
  }, [medium.id]);

  // Dark whatever the reader's mode, in the reader's own colours.
  const outer = useTheme();
  const dark = useMemo(() => {
    if (outer.palette.mode === 'dark') return outer;
    const made = outer.anahita || {};
    return makeTheme(true, made.palette, made.corners);
  }, [outer]);

  // One tap shows or hides the bars; two zoom in.
  const lastTap = useRef(0);
  const tapTimer = useRef(null);
  useEffect(() => {
    return () => {
      clearTimeout(tapTimer.current);
    };
  }, []);
  const onTap = useCallback(() => {
    const now = Date.now();
    clearTimeout(tapTimer.current);
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      picture.handleZoomToggle();
      return;
    }
    lastTap.current = now;
    tapTimer.current = setTimeout(() => {
      setShowBars((shown) => { return !shown; });
    }, DOUBLE_TAP_MS);
  }, [picture.handleZoomToggle]);

  // A finger pulling the picture down, or two pinching it.
  const gesture = useRef(null);
  const [pulled, setPulled] = useState(0);
  const onTouchStart = (event) => {
    const { touches } = event;
    if (touches.length === 2) {
      gesture.current = { pinch: distanceOf(touches) };
      setPulled(0);
      return;
    }
    if (touches.length === 1 && !picture.isZoomed) {
      gesture.current = { x: touches[0].clientX, y: touches[0].clientY, pull: null };
    }
  };
  const onTouchMove = (event) => {
    const now = gesture.current;
    if (!now) return;
    const { touches } = event;
    if (now.pinch && touches.length === 2) {
      const spread = distanceOf(touches) / now.pinch;
      if ((spread > PINCH_IN && !picture.isZoomed) || (spread < PINCH_OUT && picture.isZoomed)) {
        gesture.current = null;
        picture.handleZoomToggle();
      }
      return;
    }
    if (now.pinch || touches.length !== 1) return;
    const dx = touches[0].clientX - now.x;
    const dy = touches[0].clientY - now.y;
    if (now.pull === null) {
      if (Math.abs(dx) < DRAG_START && Math.abs(dy) < DRAG_START) return;
      // Down, and more down than across: a pull. Anything else is a swipe,
      // the row's and useSwipe's.
      now.pull = dy > 0 && Math.abs(dy) > Math.abs(dx) * 1.2;
    }
    if (now.pull) setPulled(Math.max(dy, 0));
  };
  const onTouchEnd = () => {
    const now = gesture.current;
    gesture.current = null;
    if (now && now.pull && pulled > CLOSE_DISTANCE) {
      close();
      return;
    }
    setPulled(0);
  };

  const author = getAuthor(medium);
  const url = getURL(medium);
  const hasWords = Boolean(medium.title || medium.content);
  // Where it has no picture, its words are what there is: all of them.
  const wordsOpen = isOpenWords || !overlay;

  const replyButton = replies && (
    <Button
      key={`reply-${medium.id}`}
      onClick={() => {
        setIsSheetOpen(true);
      }}
      aria-haspopup="dialog"
      color="inherit"
      startIcon={<ReplyIcon />}
      aria-label={i18n.t('replies:cTitle')}
      sx={{ flex: 1 }}
    >
      {medium.commentCount > 0 ? medium.commentCount : ''}
    </Button>
  );
  const actionList = [].concat(actions || []).filter(Boolean);
  if (replyButton) actionList.splice(1, 0, replyButton);

  const bar = {
    position: overlay ? 'absolute' : 'static',
    left: 0,
    right: 0,
    zIndex: 2,
    bgcolor: BAND,
    color: 'common.white',
  };

  return (
    <>
      <ThemeProvider theme={dark}>
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            height: '100dvh',
            bgcolor: '#000',
            color: 'common.white',
            overflow: 'hidden',
            // The pinch is the lightbox's, not the page's.
            touchAction: 'pan-x pan-y',
          }}
        >
          {bars &&
          <Box
            sx={{
              ...bar,
              top: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1,
              pt: 'env(safe-area-inset-top)',
              minHeight: 56,
            }}
          >
            <IconButton
              aria-label={i18n.t('commons:close')}
              onClick={close}
              color="inherit"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="body2" sx={{ flex: 1, fontVariantNumeric: 'tabular-nums' }} aria-live="polite">
              {hasRow && !picture.isZoomed ?
                i18n.t('photos:slides.position', { index: fileIndex + 1, total: fileCount }) :
                ''}
            </Typography>
            {picture.isZoomed &&
              <IconButton
                aria-label={i18n.t('media:stepper.zoomOut')}
                onClick={picture.handleZoomToggle}
                color="inherit"
              >
                <ZoomOutIcon />
              </IconButton>}
            {menu}
          </Box>}
          <Box
            sx={{
              position: overlay ? 'absolute' : 'relative',
              inset: overlay ? 0 : undefined,
              flex: overlay ? undefined : 1,
              minHeight: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: pulled ? `translateY(${pulled}px)` : 'none',
              opacity: pulled ? Math.max(1 - (pulled / (CLOSE_DISTANCE * 3)), 0.4) : 1,
              transition: pulled ? 'none' : 'transform 150ms ease-out, opacity 150ms ease-out',
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchEnd}
          >
            <MediaPane
              classes={classes}
              medium={medium}
              fileIndex={fileIndex}
              fileCount={fileCount}
              hasRow={hasRow}
              warned={warned}
              picture={picture}
              swipe={swipe}
              hasNext={hasNext}
              hasPrev={hasPrev}
              handleNext={handleNext}
              handlePrev={handlePrev}
              onTap={onTap}
            />
          </Box>
          {bars &&
          <Box
            sx={{
              ...bar,
              bottom: 0,
              pb: 'env(safe-area-inset-bottom)',
              maxHeight: overlay ? '60%' : '50%',
              overflowY: 'auto',
            }}
          >
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1, px: 2, pt: 2,
            }}
            >
              <ActorAvatar actor={author} linked={Boolean(author.id)} size="small" />
              <Typography variant="subtitle2" noWrap sx={{ minWidth: 0 }}>
                {getActorName(author)}
              </Typography>
              <Link
                component={RouterLink}
                to={url}
                variant="caption"
                color="inherit"
                underline="hover"
                sx={{ flexShrink: 0, opacity: 0.8 }}
              >
                {timeAgo(medium.createdAt)}
              </Link>
            </Box>
            {hasWords &&
              <Blurred state={warned} off={warnings.hasMedia(medium)}>
                <Box
                  role="button"
                  tabIndex={0}
                  aria-expanded={wordsOpen}
                  onClick={(event) => {
                    // A link in the words is followed, not a tap on them.
                    if (event.target.closest('a')) return;
                    setIsOpenWords(!isOpenWords);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') setIsOpenWords(!isOpenWords);
                  }}
                  sx={{
                    px: 2,
                    pt: 1,
                    cursor: 'pointer',
                    '& p': { m: 0 },
                    ...(wordsOpen ? {} : {
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }),
                  }}
                >
                  {medium.title &&
                    <Typography variant="subtitle1" component="p">
                      {medium.title}
                    </Typography>}
                  {medium.content &&
                    <EntityBody size="body2">
                      {utils.contentfilter({
                        text: medium.content,
                        filters: ['hashtag', 'mention', 'url'],
                      })}
                    </EntityBody>}
                </Box>
              </Blurred>}
            <PostActionsRow actions={actionList.length ? actionList : null} stats={stats} />
          </Box>}
        </Box>
      </ThemeProvider>
      {/* In the reader's own colours, light or dark, over the lightbox. */}
      {replies &&
      <SwipeableDrawer
        anchor="bottom"
        open={isSheetOpen}
        onOpen={() => {
          setIsSheetOpen(true);
        }}
        onClose={() => {
          setIsSheetOpen(false);
        }}
        disableSwipeToOpen
        sx={{ zIndex: (theme) => { return theme.zIndex.modal + 1; } }}
        slotProps={{
          paper: {
            'aria-label': i18n.t('replies:cTitle'),
            sx: {
              height: '75dvh',
              borderTopLeftRadius: (theme) => { return theme.shape.borderRadius * 2; },
              borderTopRightRadius: (theme) => { return theme.shape.borderRadius * 2; },
              pb: 'env(safe-area-inset-bottom)',
            },
          },
        }}
      >
        {/* The handle it is pulled down by, and the way out. */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1, pl: 2, pr: 1, pt: 1, flexShrink: 0,
        }}
        >
          <Box
            aria-hidden
            sx={{
              position: 'absolute', top: 8, left: '50%', ml: -2, width: 32, height: 4, borderRadius: 2, bgcolor: 'divider',
            }}
          />
          <Typography variant="subtitle1" component="h2" sx={{ flex: 1, pt: 1 }}>
            {i18n.t('replies:cTitle')}
          </Typography>
          <IconButton
            aria-label={i18n.t('commons:close')}
            onClick={() => {
              setIsSheetOpen(false);
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {isSheetOpen && replies}
        </Box>
      </SwipeableDrawer>}
    </>
  );
};

Immersive.propTypes = {
  classes: PropTypes.object.isRequired,
  medium: MediumType.isRequired,
  fileIndex: PropTypes.number,
  handleFileIndex: PropTypes.func,
  actions: PropTypes.node,
  menu: PropTypes.node,
  stats: PropTypes.node,
  // The post's thread: Reply and its count open it over the picture.
  replies: PropTypes.node,
  hasNext: PropTypes.bool.isRequired,
  hasPrev: PropTypes.bool.isRequired,
  handleNext: PropTypes.func.isRequired,
  handlePrev: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default withStyles(Immersive, styles);
