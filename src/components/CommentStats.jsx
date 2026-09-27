import React from 'react';
import Button from '@mui/material/Button';
import CommentIcon from '@mui/icons-material/Comment';

import NodeType from '../proptypes/Node';
import utils from '../utils';

const { getURL } = utils.node;

const CommentStats = (props) => {
  const { node } = props;
  const url = getURL(node);

  return (
    <Button
      component="a"
      href={url}
      startIcon={<CommentIcon />}
      disabled={node.commentCount === 0}
      size="small"
    >
      {node.commentCount}
    </Button>
  );
};

CommentStats.propTypes = {
  node: NodeType.isRequired,
};

export default CommentStats;
