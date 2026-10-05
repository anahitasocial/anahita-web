import React from 'react';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import remarkGfm from 'remark-gfm';
import { makeStyles } from 'tss-react/mui';

import utils from '../utils';

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
}) => {
  const { classes, cx } = useStyles();
  let body = `${children}`;

  if (contentFilter) {
    body = utils.contentfilter({
      text: children,
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
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {body}
      </ReactMarkdown>
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
};

export default NodeBody;
