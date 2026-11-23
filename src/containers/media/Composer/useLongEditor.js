import { useEffect, useRef, useState } from 'react';
import { useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from '@tiptap/markdown';

import EmbedNode from './EmbedNode';
import { useOffer, samePlace } from './useHashtagSuggestions';
import embeds from '../../../utils/embeds';
import { hashtagsIn } from '../../../utils/contentfilter/hashtag';
import { typedHashtag, isFullAmong } from '../../../utils/hashtagTyping';

// The least the text can be dragged down to: a few lines.
export const MIN_HEIGHT = 96;

// Not typing a hashtag.
const NOT_TYPING = { typed: null, full: false, rect: null };

// What the text of long writing is, and what is done to it (LongEditor.jsx
// draws it): the Tiptap editor, kept as Markdown; which of the buttons are
// on where the caret is; a hashtag being typed, and those in use offered
// for it; the link being put in; the media library; and how tall the text
// is, as its corner is dragged.
//
// `value`, `onChange`, `label`, `placeholder`, `disabled`, `dir` and
// `minHeight` are LongEditor's own; `mobile`, where the offered hashtags
// are shown.
const useLongEditor = ({
  value,
  onChange,
  label,
  placeholder,
  disabled,
  dir,
  minHeight,
  mobile,
}) => {
  // What this editor last said the text was, so that a value coming back
  // the same is not put in again, which would move the caret.
  const said = useRef(value);

  // A hashtag being typed where the caret is, and hashtags in use offered
  // for it (roadmap row 78), as in the short box. The keys the list takes
  // are passed to it before the editor's own.
  const [typing, setTyping] = useState(NOT_TYPING);
  const listKeys = useRef(() => { return false; });
  const handleKeyDown = (view, event) => {
    if (listKeys.current(event)) {
      event.preventDefault();
      return true;
    }
    return false;
  };
  // What the text is to the browser and to a screen reader.
  const editorProps = () => {
    return {
      attributes: {
        dir,
        'aria-label': label,
        'aria-multiline': 'true',
        role: 'textbox',
      },
      handleKeyDown,
    };
  };

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
      EmbedNode,
      Markdown,
    ],
    content: value,
    contentType: 'markdown',
    editable: !disabled,
    editorProps: editorProps(),
    onUpdate: ({ editor: current }) => {
      // A link that reads as its own address is kept as the bare address:
      // on a line of its own, an embed (utils/embeds).
      const markdown = embeds.tidy(current.getMarkdown());
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
      editor.setOptions({ editorProps: editorProps() });
    }
  }, [editor, dir, label]);

  // Whether a hashtag is being typed, and where, as the caret moves, the
  // text changes and what is around it scrolls.
  useEffect(() => {
    if (!editor) {
      return undefined;
    }
    const look = () => {
      const { selection } = editor.state;
      if (!editor.isFocused || !selection.empty) {
        setTyping(NOT_TYPING);
        return;
      }
      const { $from } = selection;
      const typed = typedHashtag($from.parent.textBetween(0, $from.parentOffset, null, '￼'));
      if (typed === null) {
        setTyping(NOT_TYPING);
        return;
      }
      const others = hashtagsIn(editor.getText()).filter((alias) => {
        return alias !== typed.toLowerCase();
      });
      const at = editor.view.coordsAtPos(selection.from);
      setTyping((was) => {
        const rect = samePlace(was.rect, { top: at.top, bottom: at.bottom, left: at.left });
        const full = isFullAmong(others, typed);
        if (was.typed === typed && was.full === full && was.rect === rect) {
          return was;
        }
        return { typed, full, rect };
      });
    };
    editor.on('selectionUpdate', look);
    editor.on('update', look);
    editor.on('focus', look);
    editor.on('blur', look);
    window.addEventListener('scroll', look, true);
    return () => {
      editor.off('selectionUpdate', look);
      editor.off('update', look);
      editor.off('focus', look);
      editor.off('blur', look);
      window.removeEventListener('scroll', look, true);
    };
  }, [editor]);

  const chain = () => {
    return editor.chain().focus();
  };

  // The hashtag picked in place of what was typed after the #, and a space.
  const pickHashtag = (item) => {
    const { from } = editor.state.selection;
    chain()
      .insertContentAt(
        { from: from - typing.typed.length - 1, to: from },
        { type: 'text', text: `#${item.name} ` },
      )
      .run();
  };
  const offer = useOffer({
    typed: typing.typed,
    full: typing.full,
    mobile,
    onPick: pickHashtag,
  });
  listKeys.current = offer.onKey;

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
        code: current.isActive('codeBlock'),
        link: current.isActive('link'),
      };
    },
  }) || {};

  // The link being put in, in a small window by the Link button: its
  // address, and the button it opened from.
  const [linkAnchor, setLinkAnchor] = useState(null);
  const [linkAddress, setLinkAddress] = useState('');
  const closeLink = () => {
    setLinkAnchor(null);
  };

  // The library, and how it opens: on which tab, and with a GIF or a video
  // picked outside it to put up at once.
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryStart, setLibraryStart] = useState({});

  // How tall the text is at least: where it started, or where its corner
  // was dragged to. It grows past it as somebody writes.
  const [height, setHeight] = useState(minHeight);
  useEffect(() => {
    setHeight(minHeight);
  }, [minHeight]);
  const drag = useRef(null);
  const letGo = () => {
    drag.current = null;
  };

  return {
    editor,
    on,
    chain,
    typing,
    offer,
    pickHashtag,
    height,
    // The handle's, a mouse's and a finger's alike: it takes the drag for
    // itself, so on a mobile moving it does not scroll the page instead.
    resize: {
      onPointerDown: (event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { from: event.clientY, height };
      },
      onPointerMove: (event) => {
        if (!drag.current) {
          return;
        }
        const moved = event.clientY - drag.current.from;
        setHeight(Math.max(MIN_HEIGHT, Math.round(drag.current.height + moved)));
      },
      onPointerUp: letGo,
      onPointerCancel: letGo,
    },
    link: {
      anchor: linkAnchor,
      address: linkAddress,
      setAddress: setLinkAddress,
      open: (event) => {
        setLinkAddress(editor.getAttributes('link').href || '');
        setLinkAnchor(event.currentTarget);
      },
      close: closeLink,
      // The address given, or none to take the link off.
      apply: () => {
        const address = linkAddress.trim();
        if (!address) {
          chain().extendMarkRange('link').unsetLink().run();
        } else {
          chain().extendMarkRange('link').setLink({ href: address }).run();
        }
        closeLink();
      },
      remove: () => {
        setLinkAddress('');
        chain().extendMarkRange('link').unsetLink().run();
        closeLink();
      },
    },
    library: {
      isOpen: isLibraryOpen,
      start: libraryStart,
      open: (start = {}) => {
        setLibraryStart(start);
        setIsLibraryOpen(true);
      },
      close: () => {
        setIsLibraryOpen(false);
      },
      // A photo or a video of one's own, put in as an embed, after what is
      // selected, never in its place; then the caret on a new line under
      // it. Left selected, the embed was taken away by whatever came next,
      // text pasted or a hashtag typed, unseen on a mobile, where it is
      // out of sight above (the user, 2026-11-23).
      pick: (url) => {
        setIsLibraryOpen(false);
        chain()
          .insertContentAt(editor.state.selection.to, [
            { type: 'embed', attrs: { url } },
            { type: 'paragraph' },
          ])
          .run();
      },
    },
  };
};

export default useLongEditor;
