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
    <div
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
