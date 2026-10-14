import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import LinkPreviewCard from '../../components/LinkPreviewCard';
import useLinkPreview from '../media/Composer/useLinkPreview';
import linkPreviews from '../../utils/linkPreviews';
import i18n from '../../languages';
import { Medium as MEDIUM } from '../../constants';

const { BODY } = MEDIUM.FIELDS;

// The box a reply is written in: under a post, under a reply, or in place of
// a reply that is being changed.
//
// It holds the text while it is being written and hands it over when sent,
// with the card for the first link in it: a reply is a note, and carries
// one the same way. `linkPreview` is the card of a reply being changed.
// Sending is the caller's: it returns a promise, and the box empties itself
// only when that succeeds, so a reply that could not be posted is still
// there to send again.
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
}) => {
  const [body, setBody] = useState(initial);
  const [isSending, setIsSending] = useState(false);

  const text = body.trim();

  const known = useMemo(() => {
    return linkPreview ?
      { url: linkPreviews.urlToPreview(initial), preview: linkPreview } :
      null;
  }, [linkPreview, initial]);
  const card = useLinkPreview(body, true, known);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!text || isSending) {
      return;
    }

    setIsSending(true);
    onSubmit(text, {
      ...(card.url ? { linkPreviewUrl: card.url } : {}),
      ...(card.isRemoved ? { linkPreviewRemove: true } : {}),
    }).then(() => {
      card.reset();
      setBody('');
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
        slotProps={{
          htmlInput: {
            dir: direction,
            maxLength: BODY.MAX_LENGTH,
          },
        }}
      />
      <LinkPreviewCard
        preview={card.preview}
        onRemove={isSending ? null : card.remove}
      />
      {hint &&
        <Typography variant="caption" color="textSecondary" component="p" sx={{ mt: 1 }}>
          {hint}
        </Typography>}
      {/* Buttons the width of the box, as in the composer and the edit
          forms: one for sending, and beside it one for backing out where
          there is something to back out of. */}
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        {onCancel &&
          <Button onClick={onCancel} disabled={isSending} fullWidth>
            {i18n.t('actions:cancel')}
          </Button>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!text || isSending}
          fullWidth
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
};

export default ReplyForm;
