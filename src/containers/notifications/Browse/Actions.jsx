import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ReplyIcon from '@mui/icons-material/ReplyOutlined';

import ControlFollow from '../../controls/Follow';
import ReplyForm from '../../replies/ReplyForm';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import postLanguage from '../../../utils/postLanguage';

// What a reader can do from a notification (roadmap row 97, part 2), as the
// server says it is still to be done (`actions`): accept or decline a
// request to follow, + Follow whoever followed, or reply. Using any of them
// reads it (`onActed`).
const NotificationActions = ({
  item,
  viewer,
  onActed,
  alertSuccess,
  alertError,
}) => {
  const [answered, setAnswered] = useState('');
  const [replying, setReplying] = useState(false);
  const [replied, setReplied] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const can = item.actions || [];

  if (can.length === 0) {
    return null;
  }

  // A request to follow: the profile asked (the viewer, or one they look
  // after) lets the asker follow, or does not.
  const answer = (accept) => {
    const params = { actor: item.target, followRequest: item.subject };
    setWaiting(true);
    (accept ? api.person.followRequests.add(params) : api.person.followRequests.deleteItem(params))
      .then(() => {
        setAnswered(accept ? 'accepted' : 'declined');
        onActed(item);
      }).catch(() => {
        alertError(i18n.t('notifications:answerFailed'));
      }).finally(() => {
        setWaiting(false);
      });
  };

  // A reply answers the reply; a mention or a quote, the post.
  const reply = (body, card = {}) => {
    const parent = { id: item.commentId || (item.object && item.object.id) };
    const language = postLanguage.defaultFor(viewer);
    return api.replies.add(parent, { content: body, card, language }).then(() => {
      setReplying(false);
      setReplied(true);
      onActed(item);
      alertSuccess(i18n.t('replies:prompts.added'));
    }).catch((error) => {
      const status = error && error.response && error.response.status;
      alertError(i18n.t(status === 403 ? 'replies:prompts.notAllowed' : 'replies:prompts.notAdded'));
      throw error;
    });
  };

  return (
    <Box component="span" sx={{ display: 'block', pt: 1 }}>
      {can.includes('answer_request') && (answered ?
        <Typography variant="body2" color="textSecondary" component="span">
          {i18n.t(`notifications:${answered}`)}
        </Typography> :
        // Side by side, the one that turns it down on the left.
        <Stack direction="row" spacing={1} sx={{ maxWidth: 320 }}>
          <Button
            fullWidth
            variant="outlined"
            disabled={waiting}
            onClick={() => {
              answer(false);
            }}
          >
            {i18n.t('notifications:decline')}
          </Button>
          <Button
            fullWidth
            variant="contained"
            disabled={waiting}
            onClick={() => {
              answer(true);
            }}
          >
            {i18n.t('notifications:accept')}
          </Button>
        </Stack>)}
      {can.includes('follow') &&
        // Any press reads it; the button says the rest.
        <Box
          component="span"
          sx={{ display: 'inline-block' }}
          onClickCapture={() => {
            onActed(item);
          }}
        >
          <ControlFollow actor={{ ...item.subject, isLeadingViewer: false }} variant="outlined" />
        </Box>}
      {can.includes('reply') && !replying && (replied ?
        <Typography variant="body2" color="textSecondary" component="span">
          {i18n.t('notifications:replied')}
        </Typography> :
        <Button
          startIcon={<ReplyIcon />}
          onClick={() => {
            setReplying(true);
          }}
        >
          {i18n.t('replies:reply')}
        </Button>)}
      {replying &&
        <ReplyForm
          autoFocus
          flush
          direction={postLanguage.directionOf(postLanguage.defaultFor(viewer))}
          onSubmit={reply}
          onCancel={() => {
            setReplying(false);
          }}
        />}
    </Box>
  );
};

NotificationActions.propTypes = {
  item: PropTypes.object.isRequired,
  viewer: PropTypes.object.isRequired,
  onActed: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    viewer: state.session.viewer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NotificationActions);
