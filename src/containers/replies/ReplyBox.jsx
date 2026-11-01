import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';

import ReplyForm from './ReplyForm';
import i18n from '../../languages';

// A new reply: one line that sends on Enter, and beside it a way to the whole
// of the form, in a dialog, for pictures, a video or a thread (the user,
// 2026-11-01). The words go with it both ways. The dialog closes only by its
// own buttons: a click beside it would lose pictures being uploaded.
const ReplyBox = ({
  onSubmit,
  onCancel = null,
  placeholder = i18n.t('replies:placeholder'),
  autoFocus = false,
  flush = false,
  hint = '',
  direction = 'auto',
  attachments = false,
}) => {
  const [draft, setDraft] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  // The line starts again from the draft each time the dialog closes.
  const [round, setRound] = useState(0);
  const phone = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });

  const close = () => {
    setIsOpen(false);
  };

  return (
    <>
      <ReplyForm
        key={round}
        compact
        initial={draft}
        placeholder={placeholder}
        autoFocus={autoFocus || round > 0}
        flush={flush}
        hint={hint}
        direction={direction}
        onCancel={onCancel}
        onExpand={attachments ? (text) => {
          setDraft(text);
          setIsOpen(true);
        } : null}
        onSubmit={(body, card) => {
          return onSubmit(body, card, {}).then(() => {
            setDraft('');
          });
        }}
      />
      <Dialog
        open={isOpen}
        fullWidth
        maxWidth="sm"
        fullScreen={phone}
        disableEscapeKeyDown
        disableRestoreFocus
        // Once it has gone, or the line could not take the focus back.
        slotProps={{
          transition: {
            onExited: () => {
              setRound((count) => { return count + 1; });
            },
          },
        }}
      >
        <DialogTitle>{i18n.t('replies:send')}</DialogTitle>
        <DialogContent>
          <ReplyForm
            initial={draft}
            placeholder={placeholder}
            autoFocus
            flush
            hint={hint}
            direction={direction}
            attachments
            onDraft={setDraft}
            onCancel={close}
            onSubmit={(body, card, attached) => {
              return onSubmit(body, card, attached).then(() => {
                setDraft('');
                close();
              });
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

ReplyBox.propTypes = {
  // Called with the text, what to do about its card, and what is attached.
  // Returns a promise.
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  flush: PropTypes.bool,
  hint: PropTypes.string,
  direction: PropTypes.oneOf(['auto', 'rtl']),
  // Whether there is more than words to offer: without it, no dialog.
  attachments: PropTypes.bool,
};

export default ReplyBox;
