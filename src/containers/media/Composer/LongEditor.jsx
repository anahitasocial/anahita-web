import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from '@tiptap/markdown';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import Tooltip from '@mui/material/Tooltip';
import BoldIcon from '@mui/icons-material/FormatBold';
import ItalicIcon from '@mui/icons-material/FormatItalic';
import HeadingIcon from '@mui/icons-material/Title';
import BulletsIcon from '@mui/icons-material/FormatListBulleted';
import NumbersIcon from '@mui/icons-material/FormatListNumbered';
import QuoteIcon from '@mui/icons-material/FormatQuote';
import LinkIcon from '@mui/icons-material/Link';

import embeds from '../../../utils/embeds';
import i18n from '../../../languages';

// The text of long writing, written as it will read: bold, headings, lists,
// quotes and links as themselves, with a row of buttons for them above it.
// What is kept is Markdown, as it always was, so posts written before, the
// embeds and what other servers are sent are as they were (Tiptap, the
// user's choice on 2026-10-16).
//
// It looks as the outlined fields around it do: their border and corners,
// their label sitting on the border, a line under it for what is wrong. It
// starts `minHeight` tall and grows as somebody writes.
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
}) => {
  // What this editor last said the text was, so that a value coming back
  // the same is not put in again, which would move the caret.
  const said = useRef(value);
  const [linkAnchor, setLinkAnchor] = useState(null);
  const [linkAddress, setLinkAddress] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
        },
      }),
      Placeholder.configure({ placeholder }),
      Markdown,
    ],
    content: value,
    contentType: 'markdown',
    editable: !disabled,
    editorProps: {
      attributes: {
        dir,
        'aria-label': label,
        'aria-multiline': 'true',
        role: 'textbox',
      },
    },
    onUpdate: ({ editor: current }) => {
      // A link that reads as its own address is kept as the bare address:
      // on a line of its own, an embed (utils/embeds).
      const markdown = embeds.bareLinks(current.getMarkdown());
      said.current = markdown;
      onChange(markdown);
    },
  });

  // A value from outside: the text carried from the short box, a draft, or
  // nothing once it is posted.
  useEffect(() => {
    if (editor && value !== said.current) {
      said.current = value;
      editor.commands.setContent(value || '', { contentType: 'markdown', emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  // The direction of the post's language, through the editor's own
  // options: its view is not there to be touched until it is mounted.
  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            dir,
            'aria-label': label,
            'aria-multiline': 'true',
            role: 'textbox',
          },
        },
      });
    }
  }, [editor, dir, label]);

  // Which buttons are on where the caret is.
  const on = useEditorState({
    editor,
    selector: ({ editor: current }) => {
      if (!current) {
        return {};
      }
      return {
        bold: current.isActive('bold'),
        italic: current.isActive('italic'),
        heading: current.isActive('heading'),
        bullets: current.isActive('bulletList'),
        numbers: current.isActive('orderedList'),
        quote: current.isActive('blockquote'),
        link: current.isActive('link'),
      };
    },
  }) || {};

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

  const chain = () => {
    return editor.chain().focus();
  };

  const openLink = (event) => {
    setLinkAddress(editor.getAttributes('link').href || '');
    setLinkAnchor(event.currentTarget);
  };

  const applyLink = () => {
    const address = linkAddress.trim();
    if (!address) {
      chain().extendMarkRange('link').unsetLink().run();
    } else {
      chain().extendMarkRange('link').setLink({ href: address }).run();
    }
    setLinkAnchor(null);
  };

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
          zIndex: 2,
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
            return theme.palette.mode === 'dark' ?
              'rgba(255, 255, 255, 0.23)' :
              'rgba(0, 0, 0, 0.23)';
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
        {/* The buttons stay in sight above the text as it scrolls, and
            scroll sideways on a phone rather than wrapping. */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            px: 1,
            pt: 1.5,
            pb: 0.5,
            overflowX: 'auto',
            bgcolor: 'background.paper',
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
        >
          {button('bold', <BoldIcon />, i18n.t('composer:editor.bold'), () => {
            chain().toggleBold().run();
          })}
          {button('italic', <ItalicIcon />, i18n.t('composer:editor.italic'), () => {
            chain().toggleItalic().run();
          })}
          {button('heading', <HeadingIcon />, i18n.t('composer:editor.heading'), () => {
            chain().toggleHeading({ level: 2 }).run();
          })}
          {button('bullets', <BulletsIcon />, i18n.t('composer:editor.bullets'), () => {
            chain().toggleBulletList().run();
          })}
          {button('numbers', <NumbersIcon />, i18n.t('composer:editor.numbers'), () => {
            chain().toggleOrderedList().run();
          })}
          {button('quote', <QuoteIcon />, i18n.t('composer:editor.quote'), () => {
            chain().toggleBlockquote().run();
          })}
          {button('link', <LinkIcon />, i18n.t('composer:editor.link'), openLink)}
        </Stack>
        <Divider />
        <Box
          sx={(theme) => {
            return {
              ...theme.typography.body1,
              px: '14px',
              py: 2,
              cursor: 'text',
              '& .ProseMirror': {
                outline: 'none',
                minHeight,
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
              '& .ProseMirror blockquote': {
                pl: 2,
                borderInlineStart: 3,
                borderColor: 'divider',
                color: 'text.secondary',
              },
              '& .ProseMirror a': { color: 'primary.main' },
              '& .ProseMirror pre': {
                p: 1,
                bgcolor: 'background.default',
                overflowX: 'auto',
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
          }}
          onClick={() => {
            if (editor && !editor.isFocused) {
              editor.commands.focus();
            }
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Box>
      <FormHelperText error={error} sx={{ mx: '14px' }}>
        {helperText}
      </FormHelperText>
      <Popover
        open={Boolean(linkAnchor)}
        anchorEl={linkAnchor}
        onClose={() => {
          setLinkAnchor(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            applyLink();
          }}
          sx={{ p: 2, width: 320, maxWidth: '100vw' }}
        >
          <TextField
            value={linkAddress}
            onChange={(event) => {
              setLinkAddress(event.target.value);
            }}
            label={i18n.t('composer:editor.linkAddress')}
            placeholder="https://"
            autoFocus
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { dir: 'ltr' } }}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
              fullWidth
              onClick={() => {
                setLinkAddress('');
                chain().extendMarkRange('link').unsetLink().run();
                setLinkAnchor(null);
              }}
            >
              {i18n.t('composer:editor.unlink')}
            </Button>
            <Button type="submit" variant="contained" fullWidth>
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
};

export default LongEditor;
