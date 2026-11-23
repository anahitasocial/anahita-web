import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import RemoveIcon from '@mui/icons-material/Close';
import ExpandIcon from '@mui/icons-material/OpenInFull';

import LinkPreviewCard from '../../components/LinkPreviewCard';
import HashtagSuggestions from '../../components/HashtagSuggestions';
import ThreadParts, { SplitWords, ThreadLine } from '../media/Composer/ThreadParts';
import ReplyAttachments from './ReplyAttachments';
import useReplyForm from './useReplyForm';
import chosenMedia from '../../utils/chosenMedia';
import sendOnEnter from '../../utils/sendOnEnter';
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
// there to send again. What it holds and the rules for sending are
// useReplyForm's; this draws them.
//
// With `attachments`, a new reply can carry pictures (up to four, each
// with what it shows, uploaded at once for the person replying) or a GIF
// or a video, one or the other, with words or without. A reply with
// pictures is a photo post in the thread, and one with a video a video
// post; who sees it, who may answer it and its language follow the
// thread, so nothing about those is asked here. The pictures button is there
// only where the site offers photo posts, and the GIF or video button only
// where videos may be posted.
//
// `compact` is one line, for ReplyBox: Enter sends, on a touch screen too,
// Shift and Enter make a new line, and the rest of the form is a step away,
// through `onExpand`. It has no send button: Enter is it.
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
  compact = false,
  onExpand = null,
  onDraft = null,
}) => {
  const form = useReplyForm({
    onSubmit, initial, linkPreview, autoFocus, attachments, compact, onDraft,
  });
  const {
    body, card, hashtags, isSending, viewer, nodeInfo,
  } = form;
  const { onKeyDown: keyForHashtags, ...hashtagHandlers } = hashtags.handlers;
  // A new reply in the whole form can be a thread: its first note's count,
  // and the notes after it.
  const isThreaded = form.canThread && !compact;

  return (
    // Spacing here and through the thread is in whole steps of the theme's
    // 8 pixels: 8, 16, 24. Nothing in between.
    <Box
      component="form"
      onSubmit={form.submit}
      noValidate
      sx={{ p: flush ? 0 : 2, mt: flush ? 1 : 0 }}
    >
      <TextField
        value={body}
        onChange={(event) => {
          form.setBody(event.target.value);
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
            // One line: a mobile keyboard's return key says Send, as Enter
            // sends here.
            ...(compact ? { style: { padding: '4px 0 4px 14px' }, enterKeyHint: 'send' } : {}),
            ...hashtagHandlers,
            onKeyDown: (event) => {
              keyForHashtags(event);
              // Enter that chose a hashtag has been used.
              if (compact && !event.defaultPrevented && sendOnEnter(event)) {
                form.submit(event);
              }
            },
          },
          input: compact ? {
            sx: { py: 0.5, pl: 0, pr: 0.5 },
            endAdornment: (
              <InputAdornment
                position="end"
                sx={{ alignSelf: 'flex-end', height: 'auto', maxHeight: 'none' }}
              >
                {onCancel &&
                  <IconButton
                    size="small"
                    aria-label={i18n.t('actions:cancel')}
                    title={i18n.t('actions:cancel')}
                    disabled={isSending}
                    onClick={onCancel}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>}
                {onExpand &&
                  <IconButton
                    size="small"
                    aria-label={i18n.t('replies:more')}
                    title={i18n.t('replies:more')}
                    disabled={isSending}
                    onClick={() => {
                      onExpand(body);
                    }}
                  >
                    <ExpandIcon fontSize="small" />
                  </IconButton>}
                {/* Enter sends: no button for it. While it goes, this. */}
                {isSending &&
                  <CircularProgress size={20} sx={{ m: 0.5 }} aria-label={submitLabel} />}
              </InputAdornment>
            ),
          } : undefined,
        }}
      />
      <HashtagSuggestions {...hashtags.overlay} />
      {isThreaded &&
        <ThreadLine
          length={form.split.length}
          limit={form.noteLimit}
        >
          <SplitWords split={form.split} />
        </ThreadLine>}
      {/* A card for a link only where there is nothing else to show. */}
      {!form.hasPhotos && !form.video &&
        <LinkPreviewCard
          preview={card.preview}
          onRemove={isSending ? null : card.remove}
        />}
      <ReplyAttachments form={form} attachments={attachments} compact={compact} />
      {/* The notes after the first, under its pictures and its buttons
          (roadmap row 143). */}
      {isThreaded &&
        <ThreadParts
          parts={form.moreParts}
          onChange={form.setMoreParts}
          canAdd={form.canAddNote}
          max={LIMITS.THREAD_PARTS_MAX}
          disabled={isSending}
          direction={direction}
          limit={form.noteLimit}
          outlined
          uploader={viewer && viewer.id ? viewer : null}
          photosMax={form.canAddPhotos ? form.photosMax : 0}
          videoOffers={{ video: form.canAddVideo, audio: false }}
          checkVideo={(chosen) => { return chosenMedia.problemOf(chosen, nodeInfo, false); }}
        />}
      {hint &&
        <Typography variant="caption" color="textSecondary" component="p" sx={{ mt: 1 }}>
          {hint}
        </Typography>}
      {/* One for sending, and before it one for backing out where there is
          something to back out of: the two side by side, each half the
          width; the one alone at its own size, at the right. */}
      {!compact &&
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
          disabled={!form.hasSomething || form.isHeldBack}
          sx={{ minWidth: 88 }}
        >
          {!isSending && submitLabel}
          {isSending && <CircularProgress size={20} />}
        </Button>
      </Box>}
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
  // { thread }, the words of the notes after the first; and have a content
  // warning, { warning }, as utils/warnings has it.
  attachments: PropTypes.bool,
  // One line with its buttons inside it: see above.
  compact: PropTypes.bool,
  // Called with the text, to go on with the whole of the form.
  onExpand: PropTypes.func,
  // Called with the text as it changes.
  onDraft: PropTypes.func,
};

export default ReplyForm;
