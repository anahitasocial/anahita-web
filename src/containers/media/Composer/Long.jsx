import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

import CoverPicker from './CoverPicker';
import DraftsMenu from './DraftsMenu';
import LongEditor from './LazyLongEditor';
import ProgressButton from './ProgressButton';
import SuggestedHashtags from './SuggestedHashtags';
import useLongComposer from './useLongComposer';

import { appendHashtag } from '../../../utils/hashtagTyping';
import ActorType from '../../../proptypes/Actor';
import { Medium as MEDIUM } from '../../../constants';
import i18n from '../../../languages';

const { TITLE } = MEDIUM.FIELDS;

// The text starts a few lines tall, and grows as somebody writes or as its
// corner is dragged (LongEditor).
const BODY_ROWS = 8;

// The extended composer: writing at length, with a title, in a dialog as
// tall as the screen allows and full screen on a mobile.
//
// It is an article or a topic, chosen by the tabs where the profile takes
// both, and either needs its title. In an article, pictures, a GIF or a
// video go into the content as blocks where the caret is, from the
// editor's library or the buttons at the bottom alike, and it may have a
// cover; a topic is talked about, with links pasted in, a post here or a
// page elsewhere, and has neither (the user, 2026-10-16; kinds.js). A photo
// or video post of its own, with a title, is the short box's.
//
// `kinds` is what this profile takes of article and topic. `body` is what
// was written in the short box before it was expanded. The title and the
// content are kept as a draft of their own. What it holds, its rules and
// its sending are useLongComposer's; this only draws them.
const LongComposer = ({
  actor,
  kinds,
  open,
  onClose,
  body: carried = '',
}) => {
  const composer = useLongComposer({
    actor, kinds, open, onClose, carried,
  });
  const {
    mobile, room, choices, postLocations, kind, about, words, title, body, busy,
    isSaving, isSending, tried, titleShort, bodyError, draftId, close,
  } = composer;

  // As tall as the screen allows on a desktop, less the dialog's margins;
  // on a mobile, what the keyboard leaves.
  const paper = mobile ? room.paper : { height: 'calc(100% - 64px)' };

  return (
    <Dialog
      open={open}
      onClose={close}
      fullScreen={mobile}
      fullWidth
      maxWidth="md"
      slotProps={{ container: { sx: mobile ? room.container : {} }, paper: { sx: paper } }}
    >
      <Box
        component="form"
        onSubmit={composer.submit}
        noValidate
        sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        {/* Close and Post at the top, as in the short box on a mobile. */}
        {/* What is seen sits 16 px from the edges, as what is below does: the
            X's glyph, inside its button's own 8 px, and the last button
            (the user, 2026-11-08 and 2026-11-23). */}
        <Toolbar disableGutters sx={{ gap: 1, pl: 1, pr: 2 }}>
          <IconButton
            aria-label={i18n.t('composer:close')}
            disabled={busy}
            onClick={close}
          >
            <CloseIcon />
          </IconButton>
          {/* What it is, where there are no tabs to say so. */}
          <Typography variant="h6" sx={{ flexGrow: 1 }} noWrap>
            {kinds.length > 1 ?
              i18n.t('composer:longContent') :
              i18n.t(`composer:kinds.${kind}`)}
          </Typography>
          <DraftsMenu
            actor={actor}
            kinds={kinds}
            mobile={mobile}
            currentId={draftId}
            disabled={busy}
            saving={isSaving}
            onSave={mobile ? composer.saveDraft : undefined}
            onOpen={composer.openDraft}
            onNew={composer.newDraft}
          />
          {/* Beside Drafts where there is room; in its menu on a mobile. */}
          {!mobile &&
            <ProgressButton
              variant="outlined"
              onClick={composer.saveDraft}
              disabled={busy}
              busy={isSaving}
              sx={{ minWidth: 88, flexShrink: 0 }}
            >
              {i18n.t('composer:drafts.save')}
            </ProgressButton>}
          <ProgressButton
            type="submit"
            variant="contained"
            color="primary"
            disabled={busy}
            busy={isSending}
          >
            {i18n.t('actions:post')}
          </ProgressButton>
        </Toolbar>
        {/* Article or Topic, where the profile takes both. */}
        {kinds.length > 1 &&
          <Tabs
            value={kind}
            onChange={(event, value) => {
              composer.setTab(value);
            }}
            variant="fullWidth"
          >
            {kinds.map((each) => {
              return (
                <Tab
                  key={`long-${each}`}
                  value={each}
                  label={i18n.t(`composer:kinds.${each}`)}
                  // A draft is of the kind it was begun as.
                  disabled={busy || (draftId > 0 && each !== kind)}
                />
              );
            })}
          </Tabs>}
        <Divider />
        <Box
          sx={{
            flexGrow: 1, overflowY: 'auto', px: 2, pt: 3,
          }}
        >
          {about.withCover &&
            <CoverPicker file={composer.cover} onChange={composer.setCover} disabled={busy} />}
          {/* Each field keeps a line under it for what is wrong, so
              nothing moves when it is said. */}
          <TextField
            value={title}
            onChange={(event) => {
              composer.setTitle(event.target.value);
            }}
            label={i18n.t('composer:fields.title')}
            placeholder={i18n.t(words.titlePlaceholder)}
            error={tried && titleShort}
            helperText={tried && titleShort ?
              i18n.t('composer:titleNeeded') : ' '}
            required
            disabled={busy}
            fullWidth
            autoFocus={!mobile}
            slotProps={{
              htmlInput: { dir: choices.direction, maxLength: TITLE.MAX_LENGTH },
              inputLabel: { shrink: true },
            }}
          />
          <LongEditor
            value={body}
            onChange={composer.setBody}
            label={i18n.t('composer:fields.content')}
            placeholder={i18n.t(words.bodyPlaceholder)}
            error={bodyError !== ''}
            helperText={bodyError || ' '}
            required
            disabled={busy}
            dir={choices.direction}
            minHeight={BODY_ROWS * 23}
            // Flush with the top of the dialog's scrolling part, over its
            // padding.
            stickyTop={-24}
            uploadAccess={choices.access}
            withMedia={Boolean(about.withMedia)}
          />
          <SuggestedHashtags
            title={title}
            body={body}
            disabled={busy}
            onAdd={(hashtag) => {
              composer.setBody(appendHashtag(body, hashtag));
            }}
          />
          {postLocations.chips({
            disabled: busy,
            goesOut: composer.goesOut,
          })}
        </Box>
        {composer.staysHere &&
          <Typography variant="caption" color="textSecondary" component="p" sx={{ px: 2, pb: 1 }}>
            {i18n.t('federation:composer.articleStaysHere')}
          </Typography>}
        <Divider />
        {/* The post's choices in one row at the bottom; it scrolls
            sideways on a mobile rather than wrapping. Pictures and videos
            are the editor's own buttons. */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            alignItems: 'center', px: 1, py: 1, overflowX: 'auto',
          }}
        >
          {!busy && postLocations.button()}
          {choices.render({ busy })}
        </Stack>
      </Box>
      {composer.rules.dialog}
    </Dialog>
  );
};

LongComposer.propTypes = {
  actor: ActorType.isRequired,
  // What this profile takes, of `article` and `topic`.
  kinds: PropTypes.arrayOf(PropTypes.string).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  body: PropTypes.string,
};

export default LongComposer;
