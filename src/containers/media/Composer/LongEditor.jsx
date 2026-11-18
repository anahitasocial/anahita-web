import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { EditorContent } from '@tiptap/react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import DragHandleIcon from '@mui/icons-material/DragHandle';

import EditorToolbar from './EditorToolbar';
import MediaLibrary from './MediaLibrary';
import useLongEditor from './useLongEditor';
import HashtagSuggestions from '../../../components/HashtagSuggestions';
import videos from '../../../utils/videos';
import i18n from '../../../languages';

// The text of long writing, written as it will read: bold, headings, lists,
// quotes and links as themselves, with a row of buttons for them above it.
// What is kept is Markdown, as it always was, so posts written before, the
// embeds and what other servers are sent are as they were (Tiptap, the
// user's choice on 2026-10-16).
//
// It looks as the outlined fields around it do: their border and corners,
// their label sitting on the border, a line under it for what is wrong. It
// starts `minHeight` tall and grows as somebody writes, and its corner can
// be dragged to make it taller or shorter, with a finger as with a mouse.

// The text as the article reads once it is posted, at least `height` tall.
const textSx = (theme, height) => {
  return {
    ...theme.typography.body1,
    // 8px more than an outlined field's own 14px, so the text
    // and what is embedded in it start where the B of the bold
    // button does (the user, 2026-10-17).
    px: '22px',
    py: 2,
    cursor: 'text',
    '& .ProseMirror': {
      outline: 'none',
      minHeight: height,
      wordWrap: 'break-word',
    },
    // A line's space under each paragraph, heading, list or
    // quote, as the article reads once it is posted, and none
    // under the last.
    '& .ProseMirror h2': { ...theme.typography.h5 },
    '& .ProseMirror h3': { ...theme.typography.h6 },
    '& .ProseMirror ul, & .ProseMirror ol': { pl: 3 },
    '& .ProseMirror > *': { mt: 0, mb: 2 },
    '& .ProseMirror > *:last-child': { mb: 0 },
    '& .ProseMirror li p': { m: 0 },
    // As a quotation is shown once posted (NodeBody).
    '& .ProseMirror blockquote': {
      mx: 0,
      my: 2,
      px: 2,
      py: 1,
      borderInlineStart: 4,
      borderColor: 'primary.main',
      borderStartEndRadius: 8,
      borderEndEndRadius: 8,
      bgcolor: 'action.hover',
      color: 'text.secondary',
    },
    '& .ProseMirror blockquote > :first-child': { mt: 0 },
    '& .ProseMirror blockquote > :last-child': { mb: 0 },
    '& .ProseMirror a': { color: 'primary.main' },
    '& .ProseMirror pre': {
      p: 1.5,
      bgcolor: 'background.default',
      overflowX: 'auto',
      fontFamily: 'monospace',
      fontSize: '0.875rem',
      whiteSpace: 'pre',
      tabSize: 4,
    },
    // What it says while it is empty. Emotion warns of
    // :first-child because of server rendering, which this app
    // does not do, so the warning is switched off for it.
    '& .ProseMirror p.is-editor-empty:first-child/* emotion-disable-server-rendering-unsafe-selector-warning-please-do-not-use-this-the-warning-exists-for-a-reason */::before': {
      content: 'attr(data-placeholder)',
      color: 'text.disabled',
      float: 'left',
      height: 0,
      pointerEvents: 'none',
    },
  };
};

// The border's own grey, as an outlined field's.
const borderGrey = (theme) => {
  return theme.palette.mode === 'dark' ?
    'rgba(255, 255, 255, 0.23)' :
    'rgba(0, 0, 0, 0.23)';
};

// What it holds and does is useLongEditor's; this draws it, its buttons
// (EditorToolbar), the library and the window for a link.
const LongEditor = ({
  value,
  onChange,
  label,
  placeholder = '',
  required = false,
  error = false,
  helperText = ' ',
  disabled = false,
  dir = 'auto',
  minHeight = 280,
  stickyTop = 0,
  uploadAccess = 'public',
  withMedia = true,
}) => {
  const nodeInfo = useSelector((state) => { return state.app.nodeInfo; });
  const canVideo = videos.isOn(nodeInfo);
  const mobile = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });
  const editing = useLongEditor({
    value, onChange, label, placeholder, disabled, dir, minHeight, mobile,
  });
  const {
    editor, typing, offer, link, library,
  } = editing;

  return (
    <Box sx={{ position: 'relative', mb: 0.5 }}>
      <InputLabel
        shrink
        required={required}
        error={error}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: 'translate(14px, -9px) scale(0.75)',
          px: 0.5,
          bgcolor: 'background.paper',
          // Over the buttons' row, which is drawn over what scrolls under
          // it and would otherwise hide the lower half of the label. Once
          // that row is stuck at the top, the label has scrolled away.
          zIndex: 4,
        }}
      >
        {label}
      </InputLabel>
      <Box
        sx={{
          border: 1,
          borderRadius: 1,
          borderColor: (theme) => {
            if (error) {
              return theme.palette.error.main;
            }
            return borderGrey(theme);
          },
          '&:hover': disabled || error ? {} : { borderColor: 'text.primary' },
          // Focused, a second line inside the first, so the width of the
          // border does not change and nothing in it moves.
          '&:focus-within': {
            borderColor: error ? 'error.main' : 'primary.main',
            boxShadow: (theme) => {
              return `inset 0 0 0 1px ${error ? theme.palette.error.main : theme.palette.primary.main}`;
            },
          },
        }}
      >
        <EditorToolbar
          editing={editing}
          disabled={disabled}
          withMedia={withMedia}
          canVideo={canVideo}
          stickyTop={stickyTop}
        />
        <Divider />
        <Box
          sx={(theme) => { return textSx(theme, editing.height); }}
          onClick={() => {
            if (editor && !editor.isFocused) {
              editor.commands.focus();
            }
          }}
        >
          <EditorContent editor={editor} />
        </Box>
        <HashtagSuggestions
          rect={typing.rect}
          items={offer.items}
          notice={offer.notice}
          active={offer.active}
          mobile={mobile}
          onPick={editing.pickHashtag}
        />
        {/* The handle to drag, in the middle of the bottom edge, set into
            the border as the label is into the top one, and the border's
            own grey (the user, 2026-10-17, in place of a corner of slanted
            lines). A finger's width. */}
        <Box sx={{ position: 'relative', height: 0 }}>
          <Box
            role="separator"
            aria-orientation="horizontal"
            aria-label={i18n.t('composer:editor.resize')}
            {...editing.resize}
            sx={{
              position: 'absolute',
              left: '50%',
              // Its middle on the border, a pixel under the box inside it.
              bottom: -13,
              transform: 'translateX(-50%)',
              zIndex: 2,
              width: 48,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.paper',
              cursor: 'ns-resize',
              touchAction: 'none',
              color: borderGrey,
              '&:hover, &:active': { color: 'text.secondary' },
            }}
          >
            <DragHandleIcon />
          </Box>
        </Box>
      </Box>
      <FormHelperText error={error} sx={{ mx: '14px' }}>
        {helperText}
      </FormHelperText>
      {/* A photo or a video of one's own, put in where the caret is, as an
          embed: what pasting its address on a line of its own does. */}
      <MediaLibrary
        open={library.isOpen}
        access={uploadAccess}
        initialTab={library.start.tab}
        file={library.start.file}
        onClose={library.close}
        onPick={library.pick}
      />
      <Popover
        open={Boolean(link.anchor)}
        anchorEl={link.anchor}
        onClose={link.close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            link.apply();
          }}
          sx={{ p: 2, width: 320, maxWidth: '100vw' }}
        >
          <TextField
            value={link.address}
            onChange={(event) => {
              link.setAddress(event.target.value);
            }}
            label={i18n.t('composer:editor.linkAddress')}
            placeholder="https://"
            autoFocus
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { dir: 'ltr' } }}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'flex-end' }}>
            <Button onClick={link.remove}>
              {i18n.t('composer:editor.unlink')}
            </Button>
            <Button type="submit" variant="contained">
              {i18n.t('composer:editor.apply')}
            </Button>
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
};

LongEditor.propTypes = {
  // The text, as Markdown.
  value: PropTypes.string.isRequired,
  // Called with the text, as Markdown, as it is written.
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  dir: PropTypes.string,
  // How tall it starts, in pixels.
  minHeight: PropTypes.number,
  // Where the buttons stay as the text scrolls under them: the top of what
  // scrolls, less its padding, or under the page's bar. A number or, as sx
  // takes it, one for each breakpoint.
  stickyTop: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  // Who may see a picture or a video put up from the library: the
  // writing's own audience.
  uploadAccess: PropTypes.string,
  // The media library and its button: an article's. A topic is talked
  // about, with links pasted in, and no pictures of its own (the user,
  // 2026-10-16).
  withMedia: PropTypes.bool,
};

export default LongEditor;
