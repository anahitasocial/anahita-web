import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import BackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import ExpandIcon from '@mui/icons-material/OpenInFull';

import ActorAvatar from '../../../components/ActorAvatar';
import LIMITS from '../../../constants/limits';
import i18n from '../../../languages';
import ActorType from '../../../proptypes/Actor';
import utils from '../../../utils';
import photoFiles from '../../../utils/photoFiles';
import threadNotes from '../../../utils/threadNotes';
import { TagPeoplePicker } from '../TagPeopleDialog';
import { ThreadJoin } from './NoteParts';
import ProgressButton from './ProgressButton';
import ShortDetails from './ShortDetails';
import ShortWords from './ShortWords';
import ThreadParts from './ThreadParts';
import useShortComposer from './useShortComposer';

// The one box a post is written in, as a reply is: words, pictures, or a GIF
// or a video. What it becomes follows from what is in it: words alone are a
// note, pictures a photo post, a video a video post. None of them has a title;
// long writing, with one, is the extended composer's (`onExpand`).
//
// A dialog, opened by the + button (ComposeButton.jsx, roadmap row 99), in
// the middle of the screen on a desktop and filling it on a mobile, where the
// keyboard needs the room; nothing in it changes height as somebody types.
// What is written is kept as a draft until it is posted (useDraft).
//
// Two steps (roadmap row 114), walked through in turn: the post itself, its
// words and its photos, GIF or video, then Next (ShortWords); and every
// choice that goes with it, each a row, then Post (ShortDetails). Back
// returns to the words with everything kept.
//
// `kinds` is what this profile takes, of note, photo, video and audio
// (kinds.js). A video or a sound posted from it is the app's to send
// (Video/SharedVideoUpload), and the + button says how far it has got once
// this is closed. What it holds, its rules and its sending are
// useShortComposer's; this only draws them.
const ShortComposer = ({
  actor,
  kinds,
  open: isOpen,
  onClose,
  onExpand = null,
}) => {
  const composer = useShortComposer({
    actor, kinds, open: isOpen, onClose, onExpand,
  });
  const {
    viewer, mobile, room, choices, files, busy, isSending, onDetails,
  } = composer;

  // Who writes it, above each note: the viewer, wherever it is posted.
  const writerName = utils.node.getActorName(viewer);

  // The notes after the first: beside the writer's small picture on a
  // desktop, joined by one line to theirs on the first, as Threads writes a
  // thread (the user, 2026-11-08); on a mobile, where the words have the
  // width, a line alone.
  const thread = (
    <ThreadParts
      parts={composer.moreParts}
      onChange={composer.setMoreParts}
      canAdd={(Boolean(composer.text) || composer.photosReady || Boolean(files.video)) &&
        !composer.moreParts.some((note) => { return !threadNotes.hasSomething(note); })}
      max={LIMITS.THREAD_PARTS_MAX}
      disabled={busy}
      direction={choices.direction}
      limit={composer.noteLimit}
      writer={mobile ? null : viewer}
      uploader={viewer}
      writerName={writerName}
      photosMax={files.canPhotos ? photoFiles.maxFiles(composer.nodeInfo) : 0}
      // A GIF, a video or a sound in a note, while none is on its way: the
      // app sends one thread's files at a time.
      videoOffers={{
        video: files.canVideo && !files.videoBusy,
        audio: files.canAudio && !files.videoBusy,
      }}
      checkVideo={files.checkFile}
    />
  );

  // Open, in a dialog: the whole screen on a mobile, where the keyboard
  // needs the room, and in the middle of it on a desktop. The same in both.
  return (
    <Dialog
      fullScreen={mobile}
      fullWidth
      maxWidth="sm"
      open={isOpen}
      slotProps={{
        container: { sx: room.container },
        paper: { sx: room.paper },
      }}
      // It may be closed while a video is sent: it goes on being sent,
      // and the + button says how far it has got.
      onClose={() => {
        if (!isSending) {
          onClose();
        }
      }}
    >
      <Box
        component="form"
        ref={composer.form}
        onSubmit={composer.submit}
        noValidate
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: onDetails && !mobile ? composer.held : undefined,
        }}
      >
        {/* Close, Long post and Next at the top, where a thumb finds them
            above the keyboard; on Details, Back in place of Close, and
            Post. */}
        {/* What is seen sits 16 px from the edges, as the words below do,
            at every width (the user, 2026-11-08): the X's glyph, inside its
            button's own 8 px, and Next. MUI's Toolbar would pad 24 px and
            stand 64 px tall from 600 px up. */}
        <Toolbar
          variant="dense"
          disableGutters
          sx={{
            gap: 1, pl: 1, pr: 2, py: 1,
          }}
        >
          {onDetails ?
            <IconButton
              aria-label={i18n.t('composer:details.back')}
              onClick={composer.back}
            >
              <BackIcon />
            </IconButton> :
            <IconButton
              aria-label={i18n.t('composer:close')}
              disabled={isSending}
              onClick={() => {
                onClose();
              }}
            >
              <CloseIcon />
            </IconButton>}
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, minWidth: 0 }}>
            {i18n.t('composer:newPost')}
          </Typography>
          {/* Hidden rather than disabled while posting: a tooltip on a
              disabled button is never seen. Its words, Long post, beside
              the icon on a mobile too: the icon alone said nothing of
              where it led. */}
          {!onDetails && composer.expand && !busy &&
            <Button
              startIcon={<ExpandIcon />}
              sx={{ color: 'text.secondary', flexShrink: 0 }}
              onClick={composer.expand}
            >
              {i18n.t('composer:longContent')}
            </Button>}
          {onDetails ?
            <ProgressButton
              type="submit"
              variant="contained"
              color="primary"
              busy={isSending}
              disabled={!composer.hasSomething || composer.isHeldBack}
            >
              {i18n.t('actions:post')}
            </ProgressButton> :
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!composer.canGoOn}
              sx={{ minWidth: 88 }}
            >
              {i18n.t('composer:next')}
            </Button>}
        </Toolbar>
        <Divider />
        {onDetails &&
          <Box sx={{ flexGrow: 1, overflowY: 'auto', pb: 2 }}>
            <ShortDetails composer={composer} />
          </Box>}
        {/* Kept while Details is open, hidden, so that the photos being
            sent go on being sent. */}
        <Box
          sx={{
            flexGrow: 1, overflowY: 'auto', p: 2, display: onDetails ? 'none' : 'block',
          }}
        >
          {/* The words have the width on a mobile: who is posting is the
              viewer, and their picture beside the box took a fifth of the
              screen (roadmap row 112). */}
          <Stack direction="row" spacing={2}>
            {!mobile &&
              <Box sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0,
              }}
              >
                <ActorAvatar actor={viewer} />
                {composer.canThread && <ThreadJoin />}
              </Box>}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <ShortWords composer={composer} thread={thread} />
            </Box>
          </Stack>
          {composer.canThread && !mobile && thread}
        </Box>
      </Box>
      {composer.rules.dialog}
      <TagPeoplePicker
        open={files.isTagging}
        value={files.people}
        onChange={files.setPeople}
        onClose={() => { files.setIsTagging(false); }}
      />
    </Dialog>
  );
};

ShortComposer.propTypes = {
  actor: ActorType.isRequired,
  // What this profile takes, of `note`, `photo`, `video` and `audio`.
  kinds: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Opens the extended composer, with what was written so far. Not given
  // where the profile takes no articles or topics.
  onExpand: PropTypes.func,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ShortComposer;
