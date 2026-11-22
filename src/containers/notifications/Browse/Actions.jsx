import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ReplyIcon from '@mui/icons-material/ReplyOutlined';
import { Link as RouterLink } from 'react-router-dom';

import ControlFollow from '../../controls/Follow';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import utils from '../../../utils';

// What a reader can do from a notification (roadmap row 97, part 2), as the
// server says it is still to be done (`actions`): accept or decline a
// request to follow, + Follow whoever followed, or reply. Using any of them
// reads it (`onActed`). Reply leads to the post, to be read before it is
// answered, and not to a box here (the user, 2026-11-22).
const NotificationActions = ({
  item,
  viewer,
  onActed,
  alertError,
}) => {
  const [answered, setAnswered] = useState('');
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

  // Being tagged in a photo or a video (roadmap row 103): in it, or not.
  const answerTag = (accept) => {
    const post = { id: item.object && item.object.id };
    setWaiting(true);
    (accept ? api.peopleTags.approve(viewer, post) : api.peopleTags.deleteItem(viewer, post))
      .then(() => {
        setAnswered(accept ? 'accepted' : 'declined');
        onActed(item);
      }).catch(() => {
        alertError(i18n.t('notifications:answerFailed'));
      }).finally(() => {
        setWaiting(false);
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
      {can.includes('answer_tag') && (answered ?
        <Typography variant="body2" color="textSecondary" component="span">
          {i18n.t(`notifications:${answered}`)}
        </Typography> :
        <Stack direction="row" spacing={1} sx={{ maxWidth: 320 }}>
          <Button
            fullWidth
            variant="outlined"
            disabled={waiting}
            onClick={() => {
              answerTag(false);
            }}
          >
            {i18n.t('notifications:decline')}
          </Button>
          <Button
            fullWidth
            variant="contained"
            disabled={waiting}
            onClick={() => {
              answerTag(true);
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
          {/* They follow the viewer, so: + Follow back. */}
          <ControlFollow
            actor={{ ...item.subject, isLeadingViewer: false, isFollowingViewer: true }}
            variant="outlined"
          />
        </Box>}
      {can.includes('reply') && item.object && item.object.id &&
        // To the post a reply, a mention or a quote is in: read first.
        <Button
          component={RouterLink}
          to={utils.node.getURL(item.object)}
          startIcon={<ReplyIcon />}
          onClick={() => {
            onActed(item);
          }}
        >
          {i18n.t('replies:reply')}
        </Button>}
    </Box>
  );
};

NotificationActions.propTypes = {
  item: PropTypes.object.isRequired,
  viewer: PropTypes.object.isRequired,
  onActed: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    viewer: state.session.viewer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NotificationActions);
