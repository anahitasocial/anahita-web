import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import VideoIcon from '@mui/icons-material/VideocamOutlined';

import ActorAvatar from '../../../components/ActorAvatar';
import LinkPreviewCard from '../../../components/LinkPreviewCard';
import PhotoFilesEditor from '../../../components/PhotoFilesEditor';
import LIMITS from '../../../constants/limits';
import i18n from '../../../languages';
import threadSplit from '../../../utils/threadSplit';
import videos from '../../../utils/videos';
import AttachButtons from './AttachButtons';
import {
  Column, NoteHead, ThreadJoin, ThreadLine, WORDS, blueskyCut,
} from './NoteParts';
import useThreadNote from './useThreadNote';

// A note of a thread, as ThreadParts holds them (utils/threadNotes).
export const notePropType = PropTypes.shape({
  key: PropTypes.string.isRequired,
  words: PropTypes.string.isRequired,
  linkPreviewUrl: PropTypes.string,
  photos: PropTypes.arrayOf(PropTypes.object).isRequired,
  // A GIF, a video or a sound, the file chosen.
  video: PropTypes.object,
});

// One note after the first: its words, its pictures with their own Photo
// button (roadmap row 143), and the line under it. Its pictures are
// uploaded for `uploader`, the writer, whose the notes after the first are.
// What it holds and how it changes are useThreadNote's.
const ThreadNote = ({
  note,
  index,
  count,
  writerName,
  isLast,
  hasNext,
  onChange,
  disabled,
  direction,
  goesToBluesky,
  outlined,
  limit,
  writer,
  uploader,
  photosMax,
  videoOffers,
  checkVideo,
}) => {
  const held = useThreadNote({
    note, onChange, uploader, photosMax, checkVideo,
  });
  const { card, canPhotos } = held;
  const { words, photos, video } = note;

  const removeButton = (sx) => {
    return (
      <IconButton
        size="small"
        aria-label={i18n.t('composer:thread.remove')}
        disabled={disabled}
        onClick={held.remove}
        sx={sx}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    );
  };

  return (
    <Stack direction="row" spacing={writer ? 2 : 1} sx={{ mt: 2 }}>
      {writer ?
        // Its picture, in the middle of the words' first line, and the
        // line on to the next.
        <Column>
          <Box>
            <ActorAvatar actor={writer} size="small" />
          </Box>
          {hasNext && <ThreadJoin />}
        </Column> :
        // The line that joins it to the one before.
        <Box sx={{
          width: 2, borderRadius: 1, bgcolor: 'divider', flexShrink: 0,
        }}
        />}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        {/* With a head, its ✕ is on the name's line, as Threads has it, so
            that the note has the whole width and its count lines up with
            the first note's; the glyph at the edge, and the line no taller. */}
        {writerName &&
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <NoteHead name={writerName} number={index + 2} count={count} />
            </Box>
            {removeButton({ my: '-6px', mr: '-5px' })}
          </Box>}
        <TextField
          value={words}
          onChange={(event) => {
            held.setWords(event.target.value);
          }}
          onPaste={card.onPaste}
          placeholder={i18n.t('composer:thread.placeholder')}
          aria-label={i18n.t('composer:thread.part', { number: index + 2 })}
          autoFocus={isLast}
          disabled={disabled}
          variant={outlined ? 'outlined' : 'standard'}
          size={outlined ? 'small' : 'medium'}
          multiline
          minRows={1}
          fullWidth
          slotProps={{
            ...(outlined ? {} : { input: { disableUnderline: true, sx: WORDS } }),
            htmlInput: { dir: direction, maxLength: LIMITS.POST_BODY_MAX },
          }}
        />
        {photos.length === 0 && !video &&
          <LinkPreviewCard
            preview={card.preview}
            onRemove={disabled ? null : card.remove}
          />}
        {canPhotos && (photos.length > 0 || held.incoming) &&
          <Box sx={{ mt: 1 }}>
            <PhotoFilesEditor
              owner={uploader}
              items={photos}
              onChange={held.changePhotos}
              max={photosMax}
              disabled={disabled}
              incoming={held.incoming}
              onIncomingTaken={held.takeIncoming}
            />
          </Box>}
        {/* Its file, by name and size, which can be taken off. */}
        {video &&
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1, mt: 1,
          }}
          >
            <VideoIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ flexGrow: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
              {`${video.name} · ${videos.megabytes(video.size)}`}
            </Typography>
            <IconButton
              size="small"
              disabled={disabled}
              aria-label={i18n.t('replies:attachments.removeVideo')}
              title={i18n.t('replies:attachments.removeVideo')}
              onClick={held.removeVideo}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>}
        {held.videoProblem &&
          <Typography variant="caption" color="error" component="p" role="alert" sx={{ mt: 1 }}>
            {held.videoProblem}
          </Typography>}
        {/* Its Photo, GIF, Video and Audio buttons, their glyphs in line
            with the words as under the first note, then what is said of it
            and its count. A Stack's spacing would undo the button's own
            margin. */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {held.offersVideo && !disabled && (canPhotos || videoOffers.video || videoOffers.audio) &&
            <Box sx={{ ml: -1, flexShrink: 0, display: 'flex' }}>
              <AttachButtons
                mobile
                photos={canPhotos}
                video={videoOffers.video}
                audio={videoOffers.audio}
                onPhotos={held.addPhotos}
                onVideo={held.takeVideo}
              />
            </Box>}
          {(goesToBluesky || limit > 0) &&
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <ThreadLine
                length={limit > 0 ? threadSplit.lengthOf(words) : -1}
                limit={limit}
                warnAt={goesToBluesky ? LIMITS.BLUESKY_POST_MAX : 0}
              >
                {blueskyCut(goesToBluesky, words)}
              </ThreadLine>
            </Box>}
        </Box>
      </Box>
      {!writerName && removeButton({ alignSelf: 'flex-start' })}
    </Stack>
  );
};

ThreadNote.propTypes = {
  note: notePropType.isRequired,
  index: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  writerName: PropTypes.string,
  isLast: PropTypes.bool.isRequired,
  hasNext: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  direction: PropTypes.string.isRequired,
  goesToBluesky: PropTypes.bool.isRequired,
  outlined: PropTypes.bool.isRequired,
  limit: PropTypes.number.isRequired,
  writer: PropTypes.object,
  uploader: PropTypes.object,
  photosMax: PropTypes.number.isRequired,
  videoOffers: PropTypes.shape({ video: PropTypes.bool, audio: PropTypes.bool }).isRequired,
  checkVideo: PropTypes.func,
};

export default ThreadNote;
