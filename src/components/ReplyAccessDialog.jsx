import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import i18n from '../languages';
import quotes from '../utils/quotes';
import replyAccess from '../utils/replyAccess';

// A post's interaction settings: who can reply to it, and who can quote it.
//
// Who can reply: anyone, or nobody but the people ticked.
//
// Asked as two questions, the way Bluesky asks it. The boxes are an
// exception to "nobody", so they are only live under it.
//
// Who can quote: anyone, the author's followers, or nobody. A post that has
// never been asked follows its author's own setting, so the dialog opens on
// that (`defaultQuotePolicy`) and only a choice that differs is a choice.
//
// Used for a post being written, where Save only hands the choices back,
// and for one that exists, where the caller saves them and says so with
// `saving`. Nothing changes until Save either way. Save is called with who
// can reply and who can quote.
const ReplyAccessDialog = ({
  open,
  value,
  quotePolicy = '',
  defaultQuotePolicy = '',
  onClose,
  onSave,
  saving = false,
}) => {
  const [choice, setChoice] = useState(replyAccess.toChoice(value));
  const startingQuotePolicy = quotes.effective(quotePolicy, defaultQuotePolicy);
  const [whoQuotes, setWhoQuotes] = useState(startingQuotePolicy);

  // Each time it is opened it starts from what is set now.
  useEffect(() => {
    if (open) {
      setChoice(replyAccess.toChoice(value));
      setWhoQuotes(startingQuotePolicy);
    }
  }, [open, value, startingQuotePolicy]);

  const toggle = (group) => {
    return (event) => {
      setChoice({ ...choice, [group]: event.target.checked });
    };
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="reply-access-title"
    >
      <DialogTitle id="reply-access-title">
        {i18n.t('replies:access.title')}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <FormControl disabled={saving}>
            <FormLabel id="reply-access-who">
              {i18n.t('replies:access.who')}
            </FormLabel>
            <RadioGroup
              row
              aria-labelledby="reply-access-who"
              name="reply-access-who"
              value={choice.anyone ? replyAccess.ANYONE : replyAccess.NOBODY}
              onChange={(event) => {
                setChoice({
                  ...choice,
                  anyone: event.target.value === replyAccess.ANYONE,
                });
              }}
            >
              <FormControlLabel
                value={replyAccess.ANYONE}
                control={<Radio />}
                label={i18n.t('replies:access.anyone')}
              />
              <FormControlLabel
                value={replyAccess.NOBODY}
                control={<Radio />}
                label={i18n.t('replies:access.nobody')}
              />
            </RadioGroup>
          </FormControl>
          <FormControl
            component="fieldset"
            disabled={saving || choice.anyone}
          >
            <FormLabel component="legend">
              {i18n.t('replies:access.except')}
            </FormLabel>
            <FormGroup>
              {replyAccess.GROUPS.map((group) => {
                return (
                  <FormControlLabel
                    key={group}
                    control={
                      <Checkbox
                        checked={!choice.anyone && Boolean(choice[group])}
                        onChange={toggle(group)}
                      />
                    }
                    label={i18n.t(`replies:access.groups.${group}`)}
                  />
                );
              })}
            </FormGroup>
          </FormControl>
          <Typography variant="body2" color="textSecondary">
            {i18n.t('replies:access.help')}
          </Typography>
          <FormControl disabled={saving}>
            <FormLabel id="quote-policy-who">
              {i18n.t('replies:quote.policy.who')}
            </FormLabel>
            <RadioGroup
              aria-labelledby="quote-policy-who"
              name="quote-policy-who"
              value={whoQuotes}
              onChange={(event) => {
                setWhoQuotes(event.target.value);
              }}
            >
              {quotes.POLICIES.map((policy) => {
                return (
                  <FormControlLabel
                    key={policy}
                    value={policy}
                    control={<Radio />}
                    label={i18n.t(`replies:quote.policy.${policy}`)}
                  />
                );
              })}
            </RadioGroup>
          </FormControl>
          <Typography variant="body2" color="textSecondary">
            {i18n.t('replies:quote.policy.help')}
          </Typography>
          {/* Side by side, each half the width: Cancel, then the one
              that does it. */}
          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              disabled={saving}
              onClick={onClose}
            >
              {i18n.t('actions:cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={saving}
              onClick={() => {
                // Who can quote is only sent when it is not what the post
                // had already: a post left on its author's setting stays
                // on it.
                onSave(
                  replyAccess.fromChoice(choice),
                  whoQuotes === startingQuotePolicy ? quotes.normalize(quotePolicy) : whoQuotes,
                );
              }}
            >
              {!saving && i18n.t('actions:save')}
              {saving && <CircularProgress size={24} />}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

ReplyAccessDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  // "anyone", "nobody", or groups joined by commas. See utils/replyAccess.
  value: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  // Who can quote, as the post has it: '' when it has never been said.
  quotePolicy: PropTypes.string,
  // The author's own setting, which such a post follows.
  defaultQuotePolicy: PropTypes.string,
  // Called with who can reply and who can quote ('' for "not said").
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

export default ReplyAccessDialog;
