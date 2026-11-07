import React from 'react';

import Button from '@mui/material/Button';
import LikeIcon from '@mui/icons-material/FavoriteBorder';
import ReplyIcon from '@mui/icons-material/ModeCommentOutlined';
import RepostIcon from '@mui/icons-material/Repeat';

import i18n from '../languages';

// A post's likes, replies and reposts, for somebody not signed in: the same
// icons and numbers as the buttons a member presses, in the same places in
// the row, shown and not offered. Who they were is under Interactions, as
// for anybody.
const count = (key, icon, label, number) => {
  return (
    <Button
      key={key}
      disabled
      color="inherit"
      startIcon={icon}
      aria-label={label}
      title={label}
      fullWidth
      sx={{ '&.Mui-disabled': { color: 'text.secondary' } }}
    >
      {number > 0 && number}
    </Button>
  );
};

// The counts of a post, in the order of the member's row: likes, replies
// (left out where there is no reply button, as on a reply's own page), and
// reposts with quotes, the times it was passed on.
const postCounts = (post, { replies = true } = {}) => {
  const likes = post.likesCount || 0;
  const answered = post.commentCount || 0;
  const passedOn = (post.repostCount || 0) + (post.quoteCount || 0);
  return [
    count(`count-likes-${post.id}`, <LikeIcon />, i18n.t('media:activity.likes', { count: likes }), likes),
    replies && count(`count-replies-${post.id}`, <ReplyIcon />, i18n.t('media:activity.replies', { count: answered }), answered),
    count(`count-reposts-${post.id}`, <RepostIcon />, i18n.t('media:activity.reposts', { count: passedOn }), passedOn),
  ].filter(Boolean);
};

export default postCounts;
