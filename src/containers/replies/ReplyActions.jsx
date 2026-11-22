import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LikeIcon from '@mui/icons-material/FavoriteBorder';
import LikedIcon from '@mui/icons-material/Favorite';
import ReplyIcon from '@mui/icons-material/ModeCommentOutlined';

import i18n from '../../languages';

// A reply's buttons: an icon and its number, as small as the text, close
// together at the left (after Threads, the user, 2026-11-07). A number shown
// where the button cannot be pressed is in grey, not faded.
const action = {
  minWidth: 0,
  px: 1,
  gap: 0.5,
  '& .MuiButton-startIcon': { m: 0 },
  '&.Mui-disabled': { color: 'text.secondary' },
};

// The heart and the reply button under a reply, each there where it can be
// pressed or has a number to show. The heart alone where nothing toggles a
// reply box: beside its pictures, in the theatre.
const ReplyActions = ({
  reply,
  authorized,
  isReplying,
  onLike,
  onToggleReplying = null,
}) => {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1, ml: -1,
    }}
    >
      {(authorized.like || reply.likesCount > 0) &&
        <Button
          size="small"
          color={reply.isLikedByViewer ? 'primary' : 'inherit'}
          disabled={!authorized.like}
          startIcon={reply.isLikedByViewer ?
            <LikedIcon fontSize="small" /> :
            <LikeIcon fontSize="small" />}
          aria-label={i18n.t(reply.isLikedByViewer ?
            'replies:actions.unlike' :
            'replies:actions.like')}
          aria-pressed={Boolean(reply.isLikedByViewer)}
          sx={action}
          onClick={() => {
            onLike(reply);
          }}
        >
          {reply.likesCount > 0 ? reply.likesCount : ''}
        </Button>}
      {onToggleReplying && (authorized.comment || reply.commentCount > 0) &&
        <Button
          size="small"
          color="inherit"
          disabled={!authorized.comment}
          startIcon={<ReplyIcon fontSize="small" />}
          aria-label={i18n.t('replies:reply')}
          title={i18n.t('replies:reply')}
          aria-expanded={authorized.comment ? isReplying : undefined}
          sx={action}
          onClick={onToggleReplying}
        >
          {reply.commentCount > 0 ? reply.commentCount : ''}
        </Button>}
    </Box>
  );
};

ReplyActions.propTypes = {
  reply: PropTypes.object.isRequired,
  // What the viewer may do with it, from the server.
  authorized: PropTypes.object.isRequired,
  isReplying: PropTypes.bool.isRequired,
  onLike: PropTypes.func.isRequired,
  onToggleReplying: PropTypes.func,
};

export default ReplyActions;
