import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import i18n from '../languages';
import warnings from '../utils/warnings';

// A post's content warning (anahita-services row 122): none, or one of the
// five kinds, each with a line saying what it is for; Other asks for the
// author's words, right under it.
//
// Used for a post being written, where Save only hands the warning back,
// and for one that exists, where the caller saves it and says so with
// `saving`. Nothing changes until Save either way.
const ContentWarningDialog = ({
  open,
  value,
  onClose,
  onSave,
  saving = false,
}) => {
  const [kind, setKind] = useState(value.kind || '');
  const [text, setText] = useState(value.text || '');
  const [tried, setTried] = useState(false);

  // Each time it is opened it starts from what is set now.
  useEffect(() => {
    if (open) {
      setKind(value.kind || '');
      setText(value.text || '');
      setTried(false);
    }
  }, [open, value.kind, value.text]);

  const chosen = { kind, text };
  const complete = warnings.isComplete(chosen);
  const isOther = kind === warnings.OTHER;
  // The line under the words is kept even when empty, so nothing moves as
  // somebody types (AGENTS.md, rule 11).
  let helper = `${Array.from(text).length}/${warnings.TEXT_MAX}`;
  if (tried && !complete) {
    helper = i18n.t('warnings:wordsNeeded');
  }

  const option = (each, label, line) => {
    return (
      <FormControlLabel
        key={each || 'none'}
        value={each}
        control={<Radio />}
        sx={{ alignItems: 'flex-start', '& .MuiRadio-root': { mt: -1 } }}
        label={
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body1">{label}</Typography>
            {line &&
              <Typography variant="body2" color="textSecondary">{line}</Typography>}
          </Box>
        }
      />
    );
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="content-warning-title"
    >
      <DialogTitle id="content-warning-title">
        {i18n.t('warnings:title')}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <FormControl disabled={saving}>
            <RadioGroup
              aria-labelledby="content-warning-title"
              name="content-warning-kind"
              value={kind}
              onChange={(event) => {
                setKind(event.target.value);
              }}
            >
              <Stack spacing={1}>
                {option('', i18n.t('warnings:none'), '')}
                {warnings.KINDS.map((each) => {
                  return option(
                    each,
                    i18n.t(`warnings:kinds.${each}`),
                    i18n.t(`warnings:lines.${each}`),
                  );
                })}
              </Stack>
            </RadioGroup>
          </FormControl>
          {isOther &&
            <TextField
              value={text}
              onChange={(event) => {
                setText(event.target.value);
              }}
              label={i18n.t('warnings:words')}
              autoFocus
              fullWidth
              size="small"
              disabled={saving}
              error={tried && !complete}
              helperText={helper}
              slotProps={{ htmlInput: { maxLength: warnings.TEXT_MAX } }}
            />}
          <Typography variant="body2" color="textSecondary">
            {i18n.t('warnings:help')}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button fullWidth disabled={saving} onClick={onClose}>
              {i18n.t('actions:cancel')}
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              disabled={saving}
              onClick={() => {
                if (!complete) {
                  setTried(true);
                  return;
                }
                onSave(isOther ? { kind, text: text.trim() } : { kind, text: '' });
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

ContentWarningDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  // { kind, text }: kind '' for none.
  value: PropTypes.shape({
    kind: PropTypes.string,
    text: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  // Called with { kind, text }.
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

export default ContentWarningDialog;
