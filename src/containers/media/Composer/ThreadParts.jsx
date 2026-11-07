import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

import LIMITS from '../../../constants/limits';
import threadSplit from '../../../utils/threadSplit';
import i18n from '../../../languages';

// The line under a note's words (roadmap row 126): what is to be said of
// them on the left, one line, cut short rather than wrapped; on the right,
// how many letters they have of the most a note holds where the post goes.
// Its room is kept, so nothing moves as it changes.
export const ThreadLine = ({ length = -1, limit = 0, children = ' ' }) => {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Typography variant="caption" color="textSecondary" component="p" noWrap sx={{ minWidth: 0 }}>
        {children}
      </Typography>
      {length >= 0 && limit > 0 &&
        <Typography
          variant="caption"
          color={length > limit ? 'textPrimary' : 'textSecondary'}
          sx={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
        >
          {i18n.t('composer:thread.count', { count: length, max: limit })}
        </Typography>}
    </Stack>
  );
};

ThreadLine.propTypes = {
  length: PropTypes.number,
  limit: PropTypes.number,
  children: PropTypes.node,
};

// What the line under the first note says of a thread: that it was split,
// with Undo; that it can be; that it is too long for one; or `otherwise`.
export const SplitWords = ({ split, otherwise = ' ' }) => {
  const asLink = {
    component: 'button', type: 'button', variant: 'caption', underline: 'hover', sx: { verticalAlign: 'baseline' },
  };
  if (split.undoable) {
    return (
      <>
        {i18n.t('composer:thread.splitDone', { count: split.undoable.count })}
        {' '}
        <Link {...asLink} onClick={split.undo}>
          {i18n.t('composer:thread.undo')}
        </Link>
      </>
    );
  }
  if (split.canSplit) {
    return (
      <Link {...asLink} onClick={split.splitNow}>
        {i18n.t('composer:thread.split')}
      </Link>
    );
  }
  if (split.tooLong) {
    return i18n.t('composer:thread.tooLong');
  }
  return otherwise;
};

SplitWords.propTypes = {
  split: PropTypes.shape({
    undoable: PropTypes.object,
    canSplit: PropTypes.bool,
    tooLong: PropTypes.bool,
    splitNow: PropTypes.func,
    undo: PropTypes.func,
  }).isRequired,
  otherwise: PropTypes.node,
};

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
  outlined = false,
  limit = 0,
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
                variant={outlined ? 'outlined' : 'standard'}
                size={outlined ? 'small' : 'medium'}
                multiline
                minRows={2}
                fullWidth
                slotProps={{
                  ...(outlined ? {} : { input: { disableUnderline: true } }),
                  htmlInput: { dir: direction, maxLength: LIMITS.POST_BODY_MAX },
                }}
              />
              {(goesToBluesky || limit > 0) &&
                <ThreadLine
                  length={limit > 0 ? threadSplit.lengthOf(words) : -1}
                  limit={limit}
                >
                  {goesToBluesky && threadSplit.lengthOf(words) > LIMITS.BLUESKY_POST_MAX ?
                    i18n.t('federation:composer.cutForBluesky', { max: LIMITS.BLUESKY_POST_MAX }) :
                    ' '}
                </ThreadLine>}
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
  // Boxed, as in the reply form; plain, as in the composer.
  outlined: PropTypes.bool,
  // Where a note ends, where the post goes: each note's count is shown
  // against it (roadmap row 126). None, no count.
  limit: PropTypes.number,
};

export default ThreadParts;
