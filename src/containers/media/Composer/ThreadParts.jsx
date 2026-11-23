import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

import ActorAvatar from '../../../components/ActorAvatar';
import threadNotes from '../../../utils/threadNotes';
import i18n from '../../../languages';
import { Column } from './NoteParts';
import ThreadNote, { notePropType } from './ThreadNote';

// The parts of a note, drawn here before they had a file of their own, for
// the composer and the reply form (replies/ReplyForm.jsx) to go on taking
// from here.
export {
  CharacterCount, NoteHead, SplitWords, ThreadJoin, ThreadLine, WORDS,
} from './NoteParts';

// The notes of a thread written in one go after the first (roadmap row
// 101): each a box of its own under the one before, joined by a line, as a
// thread is read; and "Add to thread" for the next, up to `max` in all with
// the first. Posted together with the first, in order, all or none.
//
// `parts` is the notes, each its words and its pictures (utils/threadNotes),
// in order. `limit` is what each holds, 300 when the post goes to Bluesky
// (utils/threadSplit.limitFor).
//
// With `writer`, as in the composer on a desktop, each note has the
// writer's small picture in the column under theirs on the first, and one
// line runs down through them to "Add to thread", as a thread is shown in
// its replies (ReplyItem.jsx) and as Threads writes one (the user,
// 2026-11-08).
const ThreadParts = ({
  parts,
  onChange,
  canAdd,
  max,
  disabled = false,
  direction = 'ltr',
  outlined = false,
  limit = 0,
  writer = null,
  uploader = null,
  photosMax = 0,
  writerName = '',
  videoOffers = { video: false, audio: false },
  checkVideo = null,
}) => {
  const add = () => {
    onChange((notes) => { return [...notes, threadNotes.make()]; });
  };

  return (
    <>
      {parts.map((note, index) => {
        return (
          <ThreadNote
            key={note.key}
            note={note}
            index={index}
            count={parts.length + 1}
            writerName={writerName}
            isLast={index === parts.length - 1}
            hasNext={index < parts.length - 1 || parts.length + 1 < max}
            onChange={onChange}
            disabled={disabled}
            direction={direction}
            outlined={outlined}
            limit={limit}
            writer={writer}
            uploader={uploader}
            photosMax={photosMax}
            videoOffers={videoOffers}
            checkVideo={checkVideo}
          />
        );
      })}
      {parts.length + 1 < max && writer &&
        // Where the line ends: the writer's picture, faint, beside the way
        // to the next note, its words in line with theirs above.
        <Box sx={{
          display: 'flex', gap: 2, mt: 1, alignItems: 'center',
        }}
        >
          <Column>
            <Box sx={{ opacity: 0.5 }}>
              <ActorAvatar actor={writer} size="small" />
            </Box>
          </Column>
          <Button
            size="small"
            sx={{ ml: '-5px' }}
            disabled={disabled || !canAdd}
            onClick={add}
          >
            {i18n.t('composer:thread.add')}
          </Button>
        </Box>}
      {parts.length + 1 < max && !writer &&
        <Box sx={{ mt: 1 }}>
          {/* 8 px to the left, so that the plus, not the button's own
              padding, lines up with the words above (the user, 2026-11-08). */}
          <Button
            size="small"
            startIcon={<AddIcon />}
            sx={{ ml: -1 }}
            disabled={disabled || !canAdd}
            onClick={add}
          >
            {i18n.t('composer:thread.add')}
          </Button>
        </Box>}
    </>
  );
};

ThreadParts.propTypes = {
  // The notes after the first, in order (utils/threadNotes).
  parts: PropTypes.arrayOf(notePropType).isRequired,
  // A state setter: given a function from the notes as they are to the
  // notes as they are to be.
  onChange: PropTypes.func.isRequired,
  // Whether another may be added now: the last says something.
  canAdd: PropTypes.bool.isRequired,
  max: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  direction: PropTypes.string,
  // Boxed, as in the reply form; plain, as in the composer.
  outlined: PropTypes.bool,
  // Where a note ends, where the post goes: each note's count is shown
  // against it (roadmap row 126). None, no count.
  limit: PropTypes.number,
  // Whose pictures go beside the notes, in a column as wide as the first
  // note's; none, a line alone.
  writer: PropTypes.object,
  // Whom a note's photos are uploaded for: the writer. None, no photos.
  uploader: PropTypes.object,
  // How many photos a note may have (photoFiles.maxFiles).
  photosMax: PropTypes.number,
  // The writer's name, above each note with its place in the thread. None,
  // as in the reply form, none said.
  writerName: PropTypes.string,
  // Whether a note may have a GIF or a video, or a sound (roadmap row 143),
  // and what is wrong with a file chosen, in words, '' for nothing.
  videoOffers: PropTypes.shape({ video: PropTypes.bool, audio: PropTypes.bool }),
  checkVideo: PropTypes.func,
};

export default ThreadParts;
