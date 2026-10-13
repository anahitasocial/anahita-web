import React from 'react';
import Button from '@mui/material/Button';
import ReplyIcon from '@mui/icons-material/ModeCommentOutlined';

import NodeType from '../../../proptypes/Node';
import i18n from '../../../languages';
import replyPerms from '../../../permissions/reply';
import utils from '../../../utils';

const { getURL } = utils.node;

// The reply button under a post in a feed. Replying is done in the post's
// thread, on its own page, so this goes there. It is off when the server
// says the viewer may not reply.
const FeedReplyButton = ({ post }) => {
  return (
    <Button
      component="a"
      href={getURL(post)}
      disabled={!replyPerms.canAdd(post)}
      aria-label={i18n.t('replies:reply')}
      title={i18n.t('replies:reply')}
      // The colour and the size of the others in the row. Left to
      // itself a button is the theme's own colour, which made this the
      // one blue icon among white ones.
      color="inherit"
      fullWidth
      startIcon={<ReplyIcon />}
    />
  );
};

FeedReplyButton.propTypes = {
  // The post to reply to: for a repost, the post it reposts.
  post: NodeType.isRequired,
};

export default FeedReplyButton;
