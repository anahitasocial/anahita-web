import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// ProseMirror's own parts come through @tiptap/pm by a path its package
// declares in "exports", which the build reads and the linter's resolver
// does not.
// eslint-disable-next-line import/no-unresolved
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Node, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import RemoveIcon from '@mui/icons-material/Close';

import PostEmbed from '../../../components/PostEmbed';
import linkPreviewsApi from '../../../api/linkPreviews';
import embeds from '../../../utils/embeds';
import i18n from '../../../languages';

// An address on a line of its own, shown in the editor as it will be in
// the article: a post here as itself, a page elsewhere by its card. In the
// text it is still the address, on its line (renderMarkdown), so nothing
// stored changes.

// The address a paragraph is and nothing else: one link, reading as its
// own address. '' otherwise.
const addressOf = (paragraph) => {
  if (paragraph.type.name !== 'paragraph' || paragraph.childCount === 0) {
    return '';
  }
  // The link, and nothing beside it but spaces: typing the space after an
  // address is what makes it a link, and leaves the space there.
  let href = '';
  let words = '';
  let other = false;
  paragraph.forEach((child) => {
    if (!child.isText) {
      other = true;
      return;
    }
    const link = child.marks.find((mark) => {
      return mark.type.name === 'link';
    });
    if (!link) {
      if (child.text.trim()) {
        other = true;
      }
      return;
    }
    if (href && link.attrs.href !== href) {
      other = true;
    }
    href = link.attrs.href;
    words += child.text;
  });
  if (other || !href || words.trim() !== href || !embeds.alone(href)) {
    return '';
  }
  return href;
};

// The paragraphs that are an address alone, but not the one being written
// in: an address becomes what it shows once the caret has left its line.
const toEmbeds = (state, type) => {
  const { selection } = state;
  const found = [];
  state.doc.forEach((child, offset) => {
    const address = addressOf(child);
    if (!address) {
      return;
    }
    const inside = selection.from >= offset && selection.from <= offset + child.nodeSize;
    if (!inside) {
      found.push({ from: offset, to: offset + child.nodeSize, address });
    }
  });
  if (found.length === 0) {
    return null;
  }
  const { tr } = state;
  // From the last, so the places of the others do not move.
  found.reverse().forEach(({ from, to, address }) => {
    tr.replaceWith(from, to, type.create({ url: address }));
  });
  return tr;
};

const View = ({ node, deleteNode, selected }) => {
  const { url } = node.attrs;
  const [cards, setCards] = useState([]);

  // A page elsewhere is shown by its card, asked for as the server will
  // keep it. A post here PostEmbed reads for itself.
  useEffect(() => {
    let current = true;
    if (embeds.isOurs(url)) {
      return undefined;
    }
    linkPreviewsApi.read(url).then((result) => {
      if (current && result.data && result.data.url) {
        setCards([result.data]);
      }
    }).catch(() => {});
    return () => {
      current = false;
    };
  }, [url]);

  return (
    <NodeViewWrapper data-drag-handle>
      <Box
        contentEditable={false}
        sx={{
          position: 'relative',
          // Dotted, light and square: a block set into the text, soon to
          // be part of it, not a frame (the user, 2026-10-16). Darker and
          // heavier while it is selected. An outline, not a border, so
          // nothing in it moves when it is selected.
          outlineStyle: 'dotted',
          outlineWidth: selected ? 2 : 1,
          outlineColor: selected ? 'text.secondary' : 'divider',
          outlineOffset: 4,
        }}
      >
        {/* Shown, not used: a click in the editor is not to leave it. */}
        <Box sx={{ pointerEvents: 'none' }}>
          <PostEmbed url={url} cards={cards} />
        </Box>
        <IconButton
          size="small"
          aria-label={i18n.t('composer:editor.removeEmbed')}
          onClick={deleteNode}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': { bgcolor: 'background.paper' },
          }}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>
      </Box>
    </NodeViewWrapper>
  );
};

View.propTypes = {
  node: PropTypes.object.isRequired,
  deleteNode: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
};

const KEY = new PluginKey('embeds');

const EmbedNode = Node.create({
  name: 'embed',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      url: { default: '' },
    };
  },

  parseHTML() {
    return [{
      tag: 'div[data-embed]',
      getAttrs: (element) => {
        return { url: element.getAttribute('data-embed') };
      },
    }];
  },

  renderHTML({ node }) {
    return ['div', { 'data-embed': node.attrs.url }, node.attrs.url];
  },

  // On a line of its own, bare, as the reader and the server look for it.
  renderMarkdown(node) {
    return (node.attrs && node.attrs.url) || '';
  },

  addNodeView() {
    return ReactNodeViewRenderer(View);
  },

  addProseMirrorPlugins() {
    const { type } = this;
    return [
      new Plugin({
        key: KEY,
        appendTransaction: (transactions, before, state) => {
          const changed = transactions.some((each) => {
            return each.docChanged || each.selectionSet;
          });
          return changed ? toEmbeds(state, type) : null;
        },
      }),
    ];
  },

  // What was there when it was opened: a draft, or an article being edited.
  onCreate() {
    const tr = toEmbeds(this.editor.state, this.type);
    if (tr) {
      this.editor.view.dispatch(tr.setMeta('addToHistory', false));
    }
  },
});

export default EmbedNode;
