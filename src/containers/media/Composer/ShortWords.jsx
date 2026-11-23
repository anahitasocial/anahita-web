import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AudioIcon from '@mui/icons-material/HeadphonesOutlined';
import CloseIcon from '@mui/icons-material/Close';
import VideoIcon from '@mui/icons-material/VideocamOutlined';

import HashtagSuggestions from '../../../components/HashtagSuggestions';
import LinkPreviewCard from '../../../components/LinkPreviewCard';
import PhotoFilesEditor from '../../../components/PhotoFilesEditor';
import { Medium as MEDIUM } from '../../../constants';
import LIMITS from '../../../constants/limits';
import i18n from '../../../languages';
import utils from '../../../utils';
import photoFiles from '../../../utils/photoFiles';
import videos from '../../../utils/videos';
import AttachButtons from './AttachButtons';
import {
  NoteHead, SplitWords, ThreadLine, WORDS,
} from './NoteParts';

const { CONTENT } = MEDIUM.FIELDS;

// A recording's length as a clock shows it: 0:42, 12:05.
export const clock = (seconds) => {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

// While a sound is recorded, in place of the icons: a red dot and the
// time, then Cancel and Done.
const Recording = ({ recorder }) => {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0,
    }}
    >
      <Box
        aria-hidden
        sx={{
          width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main', flexShrink: 0,
        }}
      />
      <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums', mr: 1 }} role="timer">
        {`${i18n.t('composer:recording')} ${clock(recorder.seconds)}`}
      </Typography>
      <Button size="small" onClick={recorder.cancel}>
        {i18n.t('actions:cancel')}
      </Button>
      <Button size="small" onClick={recorder.stop}>
        {i18n.t('composer:recordDone')}
      </Button>
    </Box>
  );
};

Recording.propTypes = {
  recorder: PropTypes.object.isRequired,
};

// A line of small print under the words.
const Said = ({ children }) => {
  return (
    <Typography variant="caption" color="textSecondary" component="p" sx={{ mt: 1 }}>
      {children}
    </Typography>
  );
};

Said.propTypes = {
  children: PropTypes.node.isRequired,
};

// The short box's first step, beside the writer's picture on a desktop:
// the first note's words, and what is put with them, photos, or a GIF, a
// video or a sound; then one line under it, as under each note of a thread
// (the user, 2026-11-08, after Threads), with what can be added to it and
// how much room is left. Nothing in it changes height as somebody types.
//
// `composer` is what useShortComposer gives; `thread`, the notes after the
// first, which come after all of it on a mobile.
const ShortWords = ({ composer, thread }) => {
  const {
    actor, viewer, mobile, choices, nodeInfo, files, busy, body, text,
    linkPreview, hashtags, split, noteLimit, morePictures,
  } = composer;
  const {
    hasPhotos, video, isSound, recorder, offers,
  } = files;

  const placeholder = utils.node.isPerson(actor) && actor.id !== viewer.id ?
    i18n.t('notes:composer.bodyPlaceholderPerson', { name: actor.name }) :
    i18n.t('notes:composer.bodyPlaceholder');

  return (
    <>
      <NoteHead
        name={utils.node.getActorName(viewer)}
        number={1}
        count={composer.canThread ? composer.moreParts.length + 1 : 1}
      />
      <TextField
        value={body}
        onChange={(event) => {
          composer.setBody(event.target.value);
        }}
        onPaste={linkPreview.onPaste}
        placeholder={placeholder}
        aria-label={placeholder}
        autoFocus
        disabled={busy}
        variant="standard"
        multiline
        // Room to write in, until a photo or a video is the post's: then
        // two lines, so that it sits close; one, as each note after it, once
        // a thread has a second note.
        minRows={(composer.moreParts.length > 0 && 1) || (hasPhotos || video ? 2 : 6)}
        fullWidth
        inputRef={hashtags.inputRef}
        slotProps={{
          input: { disableUnderline: true, sx: WORDS },
          htmlInput: {
            dir: choices.direction,
            maxLength: CONTENT.MAX_LENGTH,
            ...hashtags.handlers,
          },
        }}
      />
      <HashtagSuggestions {...hashtags.overlay} />
      {!hasPhotos && !video &&
        <LinkPreviewCard
          preview={linkPreview.preview}
          onRemove={busy ? null : linkPreview.remove}
        />}
      {files.isAddingPhotos &&
        <Box sx={{ mt: 1 }}>
          <PhotoFilesEditor
            owner={actor}
            items={files.photoItems}
            onChange={files.setPhotoItems}
            max={photoFiles.maxFiles(nodeInfo)}
            disabled={busy}
            videoMimetypes={files.canVideo ? videos.TYPES : []}
            onVideo={files.takeVideo}
            incoming={files.incoming}
            onIncomingTaken={files.takeIncoming}
            onPicked={files.photosPicked}
          />
        </Box>}
      {video &&
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
          {isSound ?
            <AudioIcon fontSize="small" color="action" /> :
            <VideoIcon fontSize="small" color="action" />}
          <Typography variant="body2" sx={{ flexGrow: 1, overflowWrap: 'anywhere' }}>
            {`${video.name} · ${videos.megabytes(video.size)}`}
          </Typography>
          {!busy &&
            <IconButton
              size="small"
              aria-label={i18n.t(isSound ? 'composer:removeAudio' : 'replies:attachments.removeVideo')}
              onClick={files.removeVideo}
            >
              <CloseIcon fontSize="small" />
            </IconButton>}
        </Stack>}
      {files.listenTo &&
        <Box
          component="audio"
          src={files.listenTo}
          controls
          preload="metadata"
          aria-label={i18n.t('composer:listenBack')}
          sx={{ display: 'block', width: '100%', mt: 1 }}
        />}
      {files.videoProblem &&
        <Typography variant="caption" color="error" component="p" role="alert" sx={{ mt: 1 }}>
          {files.videoProblem}
        </Typography>}
      {!composer.canWords && text && !hasPhotos && !video &&
        <Said>{i18n.t('composer:needsPicture')}</Said>}
      {morePictures &&
        <Said>{i18n.t(morePictures, { max: LIMITS.PICTURES_SHOWN_MAX })}</Said>}
      {/* What can be added to it, the icons' glyphs in line with the
          words; then, kept so that nothing moves as the words grow, what
          Bluesky shows of them or the thread they can be split into, and
          how many letters they have of what a note holds where it goes. */}
      <Box sx={{
        display: 'flex', gap: 1, alignItems: 'center', mt: 1,
      }}
      >
        {(offers.photos || offers.video || offers.audio || offers.record) &&
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', ml: -1, flexShrink: 0 }}>
            <AttachButtons
              mobile
              photos={offers.photos}
              video={offers.video}
              audio={offers.audio}
              record={offers.record}
              onPhotos={files.addPhotos}
              onVideo={files.takeVideo}
              onRecord={recorder.start}
            />
          </Stack>}
        {recorder.phase === 'recording' && <Recording recorder={recorder} />}
        {composer.canWords &&
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <ThreadLine
              length={split.length}
              limit={noteLimit}
            >
              <SplitWords split={split} />
            </ThreadLine>
          </Box>}
      </Box>
      {(files.canVideo || files.canAudio) && files.videoBusy && !hasPhotos &&
        <Said>{files.onItsWay}</Said>}
      {/* What the browser asks before recording, and what to do when the
          microphone was not allowed. */}
      {(recorder.phase === 'asking' || recorder.phase === 'refused') &&
        <Typography
          variant="caption"
          color={recorder.phase === 'refused' ? 'error' : 'textSecondary'}
          component="p"
          role={recorder.phase === 'refused' ? 'alert' : undefined}
          sx={{ mt: 1 }}
        >
          {i18n.t(recorder.phase === 'refused' ? 'composer:micRefused' : 'composer:micAsking')}
        </Typography>}
      {composer.canThread && mobile && thread}
    </>
  );
};

ShortWords.propTypes = {
  composer: PropTypes.object.isRequired,
  thread: PropTypes.node.isRequired,
};

export default ShortWords;
