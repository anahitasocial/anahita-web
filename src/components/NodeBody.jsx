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
    <div className={cx(classes.root, classes[size])}>
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
};

export default NodeBody;
