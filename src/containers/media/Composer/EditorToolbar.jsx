import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import Tooltip from '@mui/material/Tooltip';
import BoldIcon from '@mui/icons-material/FormatBold';
import ItalicIcon from '@mui/icons-material/FormatItalic';
import HeadingIcon from '@mui/icons-material/Title';
import BulletsIcon from '@mui/icons-material/FormatListBulleted';
import NumbersIcon from '@mui/icons-material/FormatListNumbered';
import QuoteIcon from '@mui/icons-material/FormatQuote';
import CodeIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';
import MediaIcon from '@mui/icons-material/PermMediaOutlined';
import PhotoIcon from '@mui/icons-material/Photo';
import GifIcon from '@mui/icons-material/GifBoxOutlined';
import VideoIcon from '@mui/icons-material/VideocamOutlined';

import videos from '../../../utils/videos';
import i18n from '../../../languages';

// What the GIF and Video buttons open the file window on.
const ANIMATIONS = videos.ANIMATION_TYPES.join(',');
const { MOVIES } = videos;

// The buttons that shape the text, in their order: each its name, as
// useLongEditor says whether it is on, its icon, its words, and what it
// does to the editor's chain. Code is kept as it was written: pasted into a
// code block, its lines and indentation stay. No colours: they would add to
// what the page loads (the user, 2026-10-16).
const FORMATS = [
  ['bold', BoldIcon, 'composer:editor.bold', (chain) => { return chain.toggleBold(); }],
  ['italic', ItalicIcon, 'composer:editor.italic', (chain) => { return chain.toggleItalic(); }],
  ['heading', HeadingIcon, 'composer:editor.heading', (chain) => { return chain.toggleHeading({ level: 2 }); }],
  ['bullets', BulletsIcon, 'composer:editor.bullets', (chain) => { return chain.toggleBulletList(); }],
  ['numbers', NumbersIcon, 'composer:editor.numbers', (chain) => { return chain.toggleOrderedList(); }],
  ['quote', QuoteIcon, 'composer:editor.quote', (chain) => { return chain.toggleBlockquote(); }],
  ['code', CodeIcon, 'composer:editor.code', (chain) => { return chain.toggleCodeBlock(); }],
];

// The row of buttons above the text of long writing (LongEditor.jsx). They
// stay in sight above the text as it scrolls, and scroll sideways on a
// mobile rather than wrapping.
//
// `editing` is what useLongEditor gives; `withMedia`, the Photo, GIF, Video
// and Media buttons, which put one in where the caret is, as the library's
// Upload does, the same in writing and in editing (the user, 2026-10-16);
// the library, what is there already. GIF and Video only where the server
// takes videos (`canVideo`).
const EditorToolbar = ({
  editing,
  disabled,
  withMedia,
  canVideo,
  stickyTop,
}) => {
  const { editor, on, chain } = editing;
  const gifPicker = useRef(null);
  const videoPicker = useRef(null);

  const button = (name, icon, title, run) => {
    return (
      <Tooltip title={title} key={name}>
        <ToggleButton
          value={name}
          selected={Boolean(on[name])}
          size="small"
          aria-label={title}
          disabled={disabled || !editor}
          // The caret stays in the text: a button that took the focus would
          // lose the selection it is to act on.
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onChange={run}
          sx={{ border: 0, borderRadius: 1, flexShrink: 0 }}
        >
          {icon}
        </ToggleButton>
      </Tooltip>
    );
  };

  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{
        position: 'sticky',
        top: stickyTop,
        // Over what scrolls under it, an embed's own buttons too.
        zIndex: 3,
        px: 1,
        pt: 1.5,
        pb: 0.5,
        overflowX: 'auto',
        bgcolor: 'background.paper',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
      }}
    >
      {FORMATS.map(([name, Icon, title, run]) => {
        return button(name, <Icon />, i18n.t(title), () => {
          run(chain()).run();
        });
      })}
      {button('link', <LinkIcon />, i18n.t('composer:editor.link'), editing.link.open)}
      {withMedia &&
        button('photo', <PhotoIcon />, i18n.t('composer:photo'), () => {
          editing.library.open({ tab: 'upload' });
        })}
      {withMedia && canVideo &&
        button('gif', <GifIcon />, i18n.t('composer:gif'), () => {
          gifPicker.current.click();
        })}
      {withMedia && canVideo &&
        button('video', <VideoIcon />, i18n.t('composer:video'), () => {
          videoPicker.current.click();
        })}
      {withMedia &&
        button('media', <MediaIcon />, i18n.t('composer:editor.media'), () => {
          editing.library.open({});
        })}
      {withMedia && canVideo &&
        [
          [gifPicker, ANIMATIONS],
          [videoPicker, MOVIES],
        ].map(([picker, accept]) => {
          return (
            <input
              key={accept}
              ref={picker}
              type="file"
              accept={accept}
              hidden
              onChange={(event) => {
                const file = event.target.files && event.target.files[0];
                // eslint-disable-next-line no-param-reassign
                event.target.value = '';
                if (file) {
                  editing.library.open({ tab: 'upload', file });
                }
              }}
            />
          );
        })}
    </Stack>
  );
};

EditorToolbar.propTypes = {
  editing: PropTypes.object.isRequired,
  disabled: PropTypes.bool.isRequired,
  withMedia: PropTypes.bool.isRequired,
  canVideo: PropTypes.bool.isRequired,
  stickyTop: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired,
};

export default EditorToolbar;
