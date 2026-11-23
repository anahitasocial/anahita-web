import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import i18n from '../../../languages';

// The small parts a note is drawn with in the composer and the reply form,
// the first note and each after it alike: its head, the line under it with
// its count, what is said of a split, and the line that joins the notes of
// a thread.

// How much room is left, as Bluesky counts it down (the user, 2026-11-08):
// what is left, then a ring that fills. Ink as it fills; the error's past
// the limit, where the post cannot go.
export const CharacterCount = ({ length, limit }) => {
  const left = limit - length;
  const color = left < 0 ? 'error' : 'primary';
  return (
    <Box
      role="img"
      aria-label={i18n.t('composer:thread.count', { count: length, max: limit })}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0,
      }}
    >
      <Typography
        variant="caption"
        color={left < 0 ? 'error' : 'textSecondary'}
        sx={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {left}
      </Typography>
      <Box sx={{ position: 'relative', display: 'flex' }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={20}
          thickness={5}
          sx={{ color: 'divider' }}
        />
        <CircularProgress
          variant="determinate"
          value={Math.min(length / limit, 1) * 100}
          size={20}
          thickness={5}
          color={color}
          sx={{ position: 'absolute', left: 0 }}
        />
      </Box>
    </Box>
  );
};

CharacterCount.propTypes = {
  length: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
};

// The line under a note's words (roadmap row 126): what is to be said of
// them on the left, one line, cut short rather than wrapped; on the right,
// how much room is left of what a note holds. Its room is kept, so nothing
// moves as it changes.
export const ThreadLine = ({
  length = -1, limit = 0, children = ' ',
}) => {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="caption" color="textSecondary" component="p" noWrap sx={{ minWidth: 0 }}>
        {children}
      </Typography>
      {length >= 0 && limit > 0 &&
        <CharacterCount length={length} limit={limit} />}
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

// The words of a note in the composer: 15 px, as Threads writes them, a
// step under MUI's 16 (the user, 2026-11-08); but 16 on a touch screen,
// where Safari zooms the page into any field smaller as it is focused, and
// the composer opened wider than the screen.
export const WORDS = {
  fontSize: '0.9375rem',
  '@media (pointer: coarse)': { fontSize: '1rem' },
};

// Above a note's words in the composer: its writer's name, and, in a thread,
// where it is in it, "2/3", as Threads writes a thread (the user,
// 2026-11-08).
export const NoteHead = ({ name, number = 0, count = 0 }) => {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'baseline', gap: 1, minWidth: 0,
    }}
    >
      <Typography variant="subtitle2" component="span" noWrap sx={{ minWidth: 0, fontWeight: 'bold' }}>
        {name}
      </Typography>
      {count > 1 &&
        <Typography
          variant="caption"
          color="textSecondary"
          aria-label={i18n.t('composer:thread.positionLabel', { number, count })}
          sx={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
        >
          {i18n.t('composer:thread.position', { number, count })}
        </Typography>}
    </Box>
  );
};

NoteHead.propTypes = {
  name: PropTypes.string.isRequired,
  // Its place in the thread, from 1, and how many notes it has.
  number: PropTypes.number,
  count: PropTypes.number,
};

// As wide as the first note's picture, MUI's 40 px.
const COLUMN = 5;

// The line from under a picture down to the next one's: 8 px clear of each.
export const ThreadJoin = () => {
  return (
    <Box
      aria-hidden
      sx={{
        flex: 1, width: 2, bgcolor: 'divider', borderRadius: 1, mt: 1, mb: -1,
      }}
    />
  );
};

// The column a note's picture is in, as wide as the first note's.
export const Column = ({ children }) => {
  return (
    <Box sx={{
      width: (theme) => { return theme.spacing(COLUMN); },
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      alignSelf: 'stretch',
    }}
    >
      {children}
    </Box>
  );
};

Column.propTypes = {
  children: PropTypes.node.isRequired,
};
