import React, { useState } from 'react';
import Button from '@mui/material/Button';

import LikeIcon from '@mui/icons-material/Favorite';

import PostActivity from '../activity/PostActivity';
import i18n from '../../languages';
import NodeType from '../../proptypes/Node';
import activity from '../../utils/activity';

// The number of likes under a post, which opens the post's activity: who
// liked it, reposted it, quoted it and replied to it.
//
// It is there to press whenever the post has any of the four, so that a
// post with reposts and no likes can still be looked into.
const Likes = ({ node }) => {
  const [open, setOpen] = useState(false);

  const label = i18n.t('media:activity.title');

  return (
    <>
      <PostActivity
        post={node}
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      />
      <Button
        variant="text"
        onClick={() => {
          setOpen(true);
        }}
        disabled={activity.total(node) === 0}
        startIcon={<LikeIcon />}
        aria-label={label}
        title={label}
        size="small"
      >
        {node.likesCount}
      </Button>
    </>
  );
};

Likes.propTypes = {
  node: NodeType.isRequired,
};

export default Likes;
