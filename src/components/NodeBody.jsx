import React, { createContext, useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import remarkGfm from 'remark-gfm';
import { makeStyles } from 'tss-react/mui';

import PostEmbed from './PostEmbed';
import utils from '../utils';
import embedsOf from '../utils/embeds';

// The words of a link, as it reads.
const textOf = (node) => {
  if (!node) {
    return '';
  }
  if (node.type === 'text') {
    return node.value;
  }
  return (node.children || []).map(textOf).join('');
};

// The address a paragraph is and nothing else: one link, reading as its own
// address, as Markdown makes of an address on a line of its own. ''
// otherwise; a link with words of its own stays a link.
const addressAlone = (paragraph) => {
  const children = (paragraph.children || []).filter((child) => {
    return !(child.type === 'text' && !child.value.trim());
  });
  if (children.length !== 1 || children[0].tagName !== 'a') {
    return '';
  }
  const link = children[0];
  const href = (link.properties && link.properties.href) || '';
  if (textOf(link).trim() !== href || !embedsOf.alone(href)) {
    return '';
  }
  return href;
};

// The cards kept with the post being drawn, for its paragraphs to find.
const Cards = createContext([]);

// A paragraph, or what the address it is and nothing else is to. Made once,
// here: one made as the text is drawn would be a new kind of thing each
// time, and an embedded video would start again with every change.
// eslint-disable-next-line react/prop-types
const Paragraph = ({ node, children, ...rest }) => {
  const cards = useContext(Cards);
  const address = addressAlone(node);
  if (address) {
    return <PostEmbed url={address} cards={cards} />;
  }
  return <p {...rest}>{children}</p>;
};

const WITH_EMBEDS = { p: Paragraph };

const useStyles = makeStyles()((theme) => {
  const { body1, body2 } = theme.typography;
  return {
    root: {
      '& a': {
        color: theme.palette.primary.main,
        textDecoration: 'none',
        wordWrap: 'break-word',
      },
      '& pre': {
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(1),
        overflowX: 'scroll',
      },
      '& code': {
        overflowX: 'scroll',
      },
      // Each paragraph runs in the direction of what is written in it, so
      // a Persian paragraph and an English one in the same post both read
      // properly.
      '& p, & li, & blockquote, & h1, & h2, & h3, & h4, & h5, & h6': {
        unicodeBidi: 'plaintext',
        textAlign: 'start',
      },
      // A paragraph keeps a line's space from the next, but none above the
      // first or below the last: the card around the text has its own
      // padding, and a browser's margin on top of it left a wide gap
      // between a post's or a profile's header and what it says.
      //
      // :first-child, not :first-of-type, which would also take the margin
      // off the first list or quote in the middle of a text. Emotion warns
      // of :first-child because of server rendering, which this app does
      // not do, so the warning is switched off for it.
      '& > :first-child/* emotion-disable-server-rendering-unsafe-selector-warning-please-do-not-use-this-the-warning-exists-for-a-reason */': {
        marginTop: 0,
      },
      '& > :last-child': {
        marginBottom: 0,
      },
    },
    body1,
    body2,
  };
});

const NodeBody = ({
  children,
  size = 'body1',
  contentFilter = false,
  filters = [
    'hashtag',
    'mention',
  ],
  lang = '',
  embeds = false,
  cards = [],
}) => {
  const { classes, cx } = useStyles();
  let body = `${children}`;

  // Empty paragraphs at the end of long writing, which its editor wrote
  // as &nbsp; before it learnt not to, left a gap under the text.
  if (embeds) {
    body = body.replace(/(\s*&nbsp;\s*)+$/, '');
  }

  if (contentFilter) {
    body = utils.contentfilter({
      text: body,
      filters,
    });
  }

  return (
    // The language the author said it is in, so a screen reader reads a
    // French post with French pronunciation on an English page. Left off
    // when they did not say: the page's own language then applies.
    //
    // The direction comes from the text itself, not from the language: a
    // post in Persian or Arabic runs right to left whatever it was tagged.
    <div
      dir="auto"
      className={cx(classes.root, classes[size])}
      lang={lang && lang !== 'und' ? lang : undefined}
    >
      <Cards.Provider value={cards}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={embeds ? WITH_EMBEDS : undefined}
        >
          {body}
        </ReactMarkdown>
      </Cards.Provider>
    </div>
  );
};

NodeBody.propTypes = {
  children: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['body1', 'body2']),
  contentFilter: PropTypes.bool,
  filters: PropTypes.arrayOf(PropTypes.string),
  // A language tag, "fr" or "fr-CA".
  lang: PropTypes.string,
  // An address on a line of its own drawn as what it is to (PostEmbed): in
  // an article or a topic.
  embeds: PropTypes.bool,
  // The cards of the pages elsewhere it embeds, as kept with the post.
  cards: PropTypes.arrayOf(PropTypes.object),
};

export default NodeBody;
