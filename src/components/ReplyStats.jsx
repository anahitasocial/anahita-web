import React from 'react';
import Button from '@mui/material/Button';
import ReplyIcon from '@mui/icons-material/Comment';

import NodeType from '../proptypes/Node';
import utils from '../utils';

const { getURL } = utils.node;

const ReplyStats = (props) => {
  const { node } = props;
  const url = getURL(node);

  return (
    <Button
      component="a"
      href={url}
      startIcon={<ReplyIcon />}
      disabled={node.commentCount === 0}
      size="small"
    >
      {node.commentCount}
    </Button>
  );
};

ReplyStats.propTypes = {
  node: NodeType.isRequired,
};

export default ReplyStats;
