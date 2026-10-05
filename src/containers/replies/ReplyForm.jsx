import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';

import i18n from '../../languages';
import { Medium as MEDIUM } from '../../constants';

const { BODY } = MEDIUM.FIELDS;

// The box a reply is written in: under a post, under a reply, or in place of
// a reply that is being changed.
//
// It holds the text while it is being written and hands it over when sent.
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
}) => {
  const [body, setBody] = useState(initial);
  const [isSending, setIsSending] = useState(false);

  const text = body.trim();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!text || isSending) {
      return;
    }

    setIsSending(true);
    onSubmit(text).then(() => {
      setBody('');
    }).catch(() => {
      // The caller has said what went wrong. The text stays.
    }).finally(() => {
      setIsSending(false);
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ p: 2, pt: 1 }}>
      <TextField
        value={body}
        onChange={(event) => {
          setBody(event.target.value);
        }}
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
            dir: 'auto',
            maxLength: BODY.MAX_LENGTH,
          },
        }}
      />
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
  // Called with the text. Returns a promise.
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  initial: PropTypes.string,
  placeholder: PropTypes.string,
  submitLabel: PropTypes.string,
  autoFocus: PropTypes.bool,
};

export default ReplyForm;
