import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

import LIMITS from '../../../constants/limits';
import i18n from '../../../languages';

// The notes of a thread written in one go after the first (roadmap row
// 101): each a box of its own under the one before, joined by a line, as a
// thread is read; and "Add to thread" for the next, up to `max` in all with
// the first. Posted together with the first, in order, all or none.
//
// `parts` is the words of each, in order. `goesToBluesky` keeps a line under
// each for what Bluesky shows of it, as under the first.
const ThreadParts = ({
  parts,
  onChange,
  canAdd,
  max,
  disabled = false,
  direction = 'ltr',
  goesToBluesky = false,
}) => {
  const change = (index, value) => {
    onChange(parts.map((each, at) => { return at === index ? value : each; }));
  };
  const remove = (index) => {
    onChange(parts.filter((each, at) => { return at !== index; }));
  };

  return (
    <>
      {parts.map((words, index) => {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Stack key={`thread-part-${index}`} direction="row" spacing={1} sx={{ mt: 2 }}>
            {/* The line that joins it to the one before. */}
            <Box sx={{
              width: 2, borderRadius: 1, bgcolor: 'divider', flexShrink: 0,
            }}
            />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <TextField
                value={words}
                onChange={(event) => {
                  change(index, event.target.value);
                }}
                placeholder={i18n.t('composer:thread.placeholder')}
                aria-label={i18n.t('composer:thread.part', { number: index + 2 })}
                autoFocus={index === parts.length - 1}
                disabled={disabled}
                variant="standard"
                multiline
                minRows={2}
                fullWidth
                slotProps={{
                  input: { disableUnderline: true },
                  htmlInput: { dir: direction, maxLength: LIMITS.POST_BODY_MAX },
                }}
              />
              {goesToBluesky &&
                <Typography variant="caption" color="textSecondary" component="p">
                  {[...words].length > LIMITS.BLUESKY_POST_MAX ?
                    i18n.t('federation:composer.cutForBluesky', { max: LIMITS.BLUESKY_POST_MAX }) :
                    ' '}
                </Typography>}
            </Box>
            <IconButton
              size="small"
              aria-label={i18n.t('composer:thread.remove')}
              disabled={disabled}
              onClick={() => {
                remove(index);
              }}
              sx={{ alignSelf: 'flex-start' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        );
      })}
      {parts.length + 1 < max &&
        <Box sx={{ mt: 1 }}>
          <Button
            size="small"
            startIcon={<AddIcon />}
            disabled={disabled || !canAdd}
            onClick={() => {
              onChange([...parts, '']);
            }}
          >
            {i18n.t('composer:thread.add')}
          </Button>
        </Box>}
    </>
  );
};

ThreadParts.propTypes = {
  parts: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  // Whether another may be added now: the last has words in it.
  canAdd: PropTypes.bool.isRequired,
  max: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  direction: PropTypes.string,
  goesToBluesky: PropTypes.bool,
};

export default ThreadParts;
