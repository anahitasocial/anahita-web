import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';

import InteractionsIcon from '@mui/icons-material/BarChartOutlined';

import PostActivity from '../activity/PostActivity';
import i18n from '../../languages';
import NodeType from '../../proptypes/Node';
import activity from '../../utils/activity';

// The one icon at the end of the row under a post. It opens the post's
// interactions: how many times it was liked, reposted, quoted and replied
// to, and who did each. There to press when there is any of the four.
//
// There were two counts here, of likes and of replies, in a row of their
// own, and neither said anything of reposts or quotes. One icon stands for
// all four and leads to where they are told apart.
const Interactions = ({ node }) => {
  const [open, setOpen] = useState(false);

  const label = i18n.t('media:activity.title');
  const total = activity.total(node);

  return (
    <>
      <PostActivity
        post={node}
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      />
      <IconButton
        onClick={() => {
          setOpen(true);
        }}
        disabled={total === 0}
        aria-label={label}
        title={label}
      >
        <InteractionsIcon />
      </IconButton>
    </>
  );
};

Interactions.propTypes = {
  node: NodeType.isRequired,
};

export default Interactions;
