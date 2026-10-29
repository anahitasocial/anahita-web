import React, { useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import PhotoIcon from '@mui/icons-material/Photo';
import GifIcon from '@mui/icons-material/GifBoxOutlined';
import VideoIcon from '@mui/icons-material/VideocamOutlined';
import RemoveIcon from '@mui/icons-material/Close';

import LinkPreviewCard from '../../components/LinkPreviewCard';
import PhotoFilesEditor from '../../components/PhotoFilesEditor';
import useLinkPreview from '../media/Composer/useLinkPreview';
import useTextareaHashtags from '../media/Composer/useHashtagSuggestions';
import HashtagSuggestions from '../../components/HashtagSuggestions';
import ThreadParts from '../media/Composer/ThreadParts';
import linkPreviews from '../../utils/linkPreviews';
import photoFiles from '../../utils/photoFiles';
import videos from '../../utils/videos';
import i18n from '../../languages';
import { Medium as MEDIUM } from '../../constants';
import LIMITS from '../../constants/limits';

const { CONTENT } = MEDIUM.FIELDS;

// The box a reply is written in: under a post, under a reply, or in place of
// a reply that is being changed.
//
// It holds the text while it is being written and hands it over when sent,
// with the card for the first link in it: a reply is a note, and carries
// one the same way. `linkPreview` is the card of a reply being changed.
// Sending is the caller's: it returns a promise, and the box empties itself
// only when that succeeds, so a reply that could not be posted is still
// there to send again.
//
// With `attachments`, a new reply can carry pictures (up to four, each
// with what it shows, uploaded at once for the person replying) or a GIF
// or a video, one or the other, with words or without. A reply with
// pictures is a photo post in the thread, and one with a video a video
// post; who sees it, who may answer it and its language follow the
// thread, so nothing about those is asked here. The GIF or video button is
// there only where videos may be posted.
const ReplyForm = ({
  onSubmit,
  onCancel = null,
  initial = '',
  placeholder = i18n.t('replies:placeholder'),
  submitLabel = i18n.t('replies:send'),
  autoFocus = false,
  flush = false,
  linkPreview = null,
  hint = '',
  direction = 'auto',
  attachments = false,
}) => {
  const [body, setBody] = useState(initial);
  const [isSending, setIsSending] = useState(false);
  const [isAddingPhotos, setIsAddingPhotos] = useState(false);
  const [photoItems, setPhotoItems] = useState([]);
  // A thread written in one go, under a new reply: the notes after the
  // first (roadmap row 101).
  const [moreParts, setMoreParts] = useState([]);
  const [video, setVideo] = useState(null);
  const [videoProblem, setVideoProblem] = useState('');
  const picker = useRef(null);
  const viewer = useSelector((state) => { return state.session.viewer; });
  const nodeInfo = useSelector((state) => { return state.app.nodeInfo; });

  const text = body.trim();
  const hasPhotos = photoItems.length > 0;
  const photosReady = hasPhotos && photoFiles.canSubmit(photoItems);
  const canAddVideo = attachments && videos.isOn(nodeInfo);
  // Something to send: words, pictures that are all stored, or a video.
  const hasSomething = Boolean(text) || photosReady || Boolean(video);
  const isHeldBack = (hasPhotos && !photosReady) || isSending;
  // Of words alone, and only for a new reply.
  const canThread = attachments && !hasPhotos && !video && !isAddingPhotos;
  const threadParts = canThread ?
    moreParts.map((each) => { return each.trim(); }).filter(Boolean) : [];

  const known = useMemo(() => {
    return linkPreview ?
      { url: linkPreviews.urlToPreview(initial), preview: linkPreview } :
      null;
  }, [linkPreview, initial]);
  const card = useLinkPreview(body, true, known);
  // Hashtags in use offered as one is typed (roadmap row 78).
  const phone = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });
  const hashtags = useTextareaHashtags({ value: body, onChange: setBody, phone });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!hasSomething || isHeldBack) {
      return;
    }

    let attached = {};
    if (photosReady) {
      attached = { uploads: photoFiles.toRequest(photoItems) };
    } else if (threadParts.length > 0 && text) {
      attached = { thread: threadParts };
    } else if (video) {
      attached = { video };
    }

    setIsSending(true);
    onSubmit(text, {
      ...(card.url ? { linkPreviewUrl: card.url } : {}),
      ...(card.isRemoved ? { linkPreviewRemove: true } : {}),
    }, attached).then(() => {
      card.reset();
      setBody('');
      setPhotoItems([]);
      setMoreParts([]);
      setIsAddingPhotos(false);
      setVideo(null);
    }).catch(() => {
      // The caller has said what went wrong. The text stays.
    }).finally(() => {
      setIsSending(false);
    });
  };

  return (
    // Spacing here and through the thread is in whole steps of the theme's
    // 8 pixels: 8, 16, 24. Nothing in between.
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{ p: flush ? 0 : 2, mt: flush ? 1 : 0 }}
    >
      <TextField
        value={body}
        onChange={(event) => {
          setBody(event.target.value);
        }}
        onPaste={card.onPaste}
        placeholder={placeholder}
        aria-label={placeholder}
        autoFocus={autoFocus}
        disabled={isSending}
        variant="outlined"
        size="small"
        multiline
        fullWidth
        inputRef={hashtags.inputRef}
        slotProps={{
          htmlInput: {
            dir: direction,
            maxLength: CONTENT.MAX_LENGTH,
            ...hashtags.handlers,
          },
        }}
      />
      <HashtagSuggestions {...hashtags.overlay} />
      {/* A card for a link only where there is nothing else to show. */}
      {!hasPhotos && !video &&
        <LinkPreviewCard
          preview={card.preview}
          onRemove={isSending ? null : card.remove}
        />}
      {canThread &&
        <ThreadParts
          parts={moreParts}
          onChange={setMoreParts}
          canAdd={Boolean(text) && !moreParts.some((each) => { return !each.trim(); })}
          max={LIMITS.THREAD_PARTS_MAX}
          disabled={isSending}
          direction={direction}
          outlined
        />}
      {attachments && isAddingPhotos && viewer && viewer.id &&
        <Box sx={{ mt: 1 }}>
          <PhotoFilesEditor
            owner={viewer}
            items={photoItems}
            onChange={setPhotoItems}
            max={photoFiles.maxFiles(nodeInfo)}
            disabled={isSending}
          />
        </Box>}
      {video &&
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1, mt: 1,
        }}
        >
          <VideoIcon fontSize="small" color="action" />
          <Typography variant="body2" sx={{ flexGrow: 1, overflowWrap: 'anywhere' }}>
            {`${video.name} · ${videos.megabytes(video.size)}`}
          </Typography>
          <IconButton
            size="small"
            disabled={isSending}
            aria-label={i18n.t('replies:attachments.removeVideo')}
            title={i18n.t('replies:attachments.removeVideo')}
            onClick={() => {
              setVideo(null);
            }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
        </Box>}
      {videoProblem &&
        <Typography variant="caption" color="error" component="p" role="alert" sx={{ mt: 1 }}>
          {videoProblem}
        </Typography>}
      {/* Pictures or a video, one or the other: the button for the other
          goes while one is there. */}
      {attachments && !isSending &&
        <Box sx={{
          display: 'flex', gap: 0.5, mt: 0.5, ml: -1,
        }}
        >
          {!video && !isAddingPhotos &&
            <Tooltip title={i18n.t('replies:attachments.addPhotos')}>
              <IconButton
                size="small"
                aria-label={i18n.t('replies:attachments.addPhotos')}
                onClick={() => {
                  setIsAddingPhotos(true);
                }}
              >
                <PhotoIcon fontSize="small" />
              </IconButton>
            </Tooltip>}
          {canAddVideo && !hasPhotos && !isAddingPhotos && !video &&
            <Tooltip title={i18n.t('replies:attachments.addVideo')}>
              <IconButton
                size="small"
                aria-label={i18n.t('replies:attachments.addVideo')}
                onClick={() => {
                  setVideoProblem('');
                  picker.current.click();
                }}
              >
                <GifIcon fontSize="small" />
              </IconButton>
            </Tooltip>}
          {isAddingPhotos && !hasPhotos &&
            <Button
              size="small"
              onClick={() => {
                setIsAddingPhotos(false);
              }}
            >
              {i18n.t('replies:attachments.noPhotos')}
            </Button>}
          <input
            ref={picker}
            type="file"
            accept={videos.PICKER}
            hidden
            onChange={(event) => {
              const chosen = event.target.files && event.target.files[0];
              // The same file can be chosen again after it is taken off.
              // eslint-disable-next-line no-param-reassign
              event.target.value = '';
              if (!chosen) {
                return;
              }
              const problem = videos.problem(chosen, nodeInfo);
              if (problem) {
                setVideoProblem(i18n.t(`videos:problems.${problem}`, {
                  size: videos.megabytes(videos.maxBytes(nodeInfo)),
                  minutes: Math.floor(videos.maxSeconds(nodeInfo) / 60),
                  animationSize: videos.megabytes(videos.animationMaxBytes(nodeInfo)),
                  seconds: videos.animationMaxSeconds(nodeInfo),
                }));
                return;
              }
              setVideo(chosen);
            }}
          />
        </Box>}
      {hint &&
        <Typography variant="caption" color="textSecondary" component="p" sx={{ mt: 1 }}>
          {hint}
        </Typography>}
      {/* One for sending, and before it one for backing out where there is
          something to back out of: the two side by side, each half the
          width; the one alone at its own size, at the right. */}
      <Box sx={{
        display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end',
      }}
      >
        {onCancel &&
          <Button fullWidth onClick={onCancel} disabled={isSending}>
            {i18n.t('actions:cancel')}
          </Button>}
        <Button
          fullWidth={Boolean(onCancel)}
          type="submit"
          variant="contained"
          color="primary"
          disabled={!hasSomething || isHeldBack}
          sx={{ minWidth: 88 }}
        >
          {!isSending && submitLabel}
          {isSending && <CircularProgress size={20} />}
        </Button>
      </Box>
    </Box>
  );
};

ReplyForm.propTypes = {
  // Called with the text and what to do about its card. Returns a promise.
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  initial: PropTypes.string,
  placeholder: PropTypes.string,
  submitLabel: PropTypes.string,
  autoFocus: PropTypes.bool,
  // Without padding of its own, for where it sits inside a reply that
  // already has some.
  flush: PropTypes.bool,
  // The card a reply being changed already has.
  linkPreview: PropTypes.object,
  // Something to know before sending, said above the buttons.
  hint: PropTypes.string,
  // Right to left for somebody who writes Persian, Arabic or Hebrew.
  direction: PropTypes.oneOf(['auto', 'rtl']),
  // Whether pictures or a video can be added: for a new reply, not for
  // changing one. Sent as a third argument to onSubmit: { uploads } or
  // { video }. A new reply can also be a thread written in one go:
  // { thread }, the words of the notes after the first.
  attachments: PropTypes.bool,
};

export default ReplyForm;
