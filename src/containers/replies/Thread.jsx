import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import Progress from '../../components/Progress';
import SignInPrompt from '../../components/SignInPrompt';
import ReplyForm from './ReplyForm';
import ReplyItem from './ReplyItem';

import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import MediumType from '../../proptypes/Medium';
import PersonType from '../../proptypes/Person';
import postLanguage from '../../utils/postLanguage';
import replyAccess from '../../utils/replyAccess';
import thread from '../../utils/thread';
import visitor from '../../utils/visitor';

// Everything said under a post: the replies to it, the replies to those, and
// a place to add one.
//
// The thread is read whole and kept here, not in the store. Nothing else on
// the page shows it, and it is thrown away when the page is left. Each
// change is made on the server first and then in the copy held here, by the
// same rule the server follows (see utils/thread), so the thread does not
// have to be read again after every reply.
//
// What the viewer may do comes from the server with each reply, and with
// the thread itself for whether they may reply at all.
const RepliesThread = ({
  root,
  viewer,
  isAuthenticated,
  heldBack = false,
  alertSuccess,
  alertError,
}) => {
  const [replies, setReplies] = useState([]);
  const [canReply, setCanReply] = useState(false);
  // Who the post's author lets reply, as the server reads it.
  const [limitedTo, setLimitedTo] = useState(replyAccess.ANYONE);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  // What is waiting on a yes: a message and what to do.
  const [asking, setAsking] = useState(null);

  const load = useCallback(() => {
    setIsLoading(true);
    setHasFailed(false);

    return api.replies.thread(root).then((result) => {
      setReplies(result.data.data || []);
      setCanReply(Boolean(result.data.canReply));
      setLimitedTo(replyAccess.normalize(result.data.replyAccess));
      setIsTruncated(Boolean(result.data.truncated));
    }).catch(() => {
      setHasFailed(true);
    }).finally(() => {
      setIsLoading(false);
    });
  // Read again when who can reply is changed from the post's menu.
  }, [root.id, root.replyAccess]);

  useEffect(() => {
    // Not asked for when the answer is known to be no: on a site that
    // shows visitors a preview, what is said under a post is for members.
    if (heldBack) {
      setIsLoading(false);
      return;
    }
    load();
  }, [load, heldBack]);

  const handleReply = (parent, body) => {
    return api.replies.add(parent, {
      body,
      // The language this person writes in, as for any post.
      language: postLanguage.defaultFor(viewer),
    }).then((result) => {
      setReplies((current) => {
        return thread.add(current, result.data);
      });
    }).catch((error) => {
      const status = error && error.response && error.response.status;
      alertError(i18n.t(status === 403 ?
        'replies:prompts.notAllowed' :
        'replies:prompts.notAdded'));
      throw error;
    });
  };

  const handleEdit = (reply, body) => {
    return api.replies.edit(reply, { body }).then((result) => {
      setReplies((current) => {
        // Only what an edit changes. The answer to an edit is the note as
        // any note is sent, and the thread's own answers about this reply
        // are kept.
        return thread.replace(current, {
          id: reply.id,
          body: result.data.body,
          language: result.data.language,
        });
      });
      alertSuccess(i18n.t('replies:prompts.saved'));
    }).catch((error) => {
      alertError(i18n.t('replies:prompts.notSaved'));
      throw error;
    });
  };

  const handleDelete = (reply) => {
    setAsking({
      message: i18n.t('replies:confirm.delete'),
      confirm: i18n.t('replies:actions.delete'),
      run: () => {
        return api.replies.remove(reply).then(() => {
          setReplies((current) => {
            return thread.remove(current, reply.id);
          });
          alertSuccess(i18n.t('replies:prompts.deleted'));
        }).catch(() => {
          alertError(i18n.t('replies:prompts.notDeleted'));
        });
      },
    });
  };

  const setHidden = (reply, hidden) => {
    return api.replies.setHidden(reply, hidden).then(() => {
      setReplies((current) => {
        return thread.setHidden(current, reply.id, hidden);
      });
      alertSuccess(i18n.t(hidden ? 'replies:prompts.hidden' : 'replies:prompts.shown'));
    }).catch(() => {
      alertError(i18n.t('replies:prompts.notHidden'));
    });
  };

  const handleHide = (reply, hidden) => {
    // Showing a reply again needs no second thought. Hiding one takes
    // everything under it out of the thread, so it is asked about.
    if (!hidden) {
      setHidden(reply, false);
      return;
    }

    setAsking({
      message: i18n.t('replies:confirm.hide'),
      confirm: i18n.t('replies:actions.hide'),
      run: () => {
        return setHidden(reply, true);
      },
    });
  };

  const handleLike = (reply) => {
    const call = reply.isLikedByViewer ? api.likes.deleteItem : api.likes.add;

    call(reply).then((result) => {
      const liked = result.data || {};
      setReplies((current) => {
        return thread.replace(current, {
          id: reply.id,
          isLikedByViewer: !reply.isLikedByViewer,
          likesCount: typeof liked.likesCount === 'number' ?
            liked.likesCount :
            Math.max((reply.likesCount || 0) + (reply.isLikedByViewer ? -1 : 1), 0),
        });
      });
    }).catch(() => {
      alertError(i18n.t('replies:prompts.notHidden'));
    });
  };

  // Where the replies would be, a way to them.
  if (heldBack) {
    return (
      <Card>
        <CardContent>
          <SignInPrompt what="comments" />
        </CardContent>
      </Card>
    );
  }

  const { thread: shown, hidden } = thread.split(replies, root.id);

  const item = (node) => {
    return (
      <ReplyItem
        key={`reply-${node.reply.id}`}
        node={node}
        viewer={viewer}
        onReply={handleReply}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onHide={handleHide}
        onLike={handleLike}
      />
    );
  };

  return (
    <Card sx={{ pb: 1 }}>
      {canReply &&
        <ReplyForm
          onSubmit={(body) => {
            return handleReply(root, body);
          }}
        />}
      {/* Said to everybody, the people who can still reply included, so
          a thread with few voices in it explains itself. */}
      {!isLoading && !hasFailed && replyAccess.isLimited(limitedTo) &&
        <CardContent sx={{ pb: 0 }}>
          <Typography variant="body2" color="textSecondary">
            {replyAccess.summary(limitedTo, i18n.t.bind(i18n))}
          </Typography>
        </CardContent>}
      {isAuthenticated && !isLoading && !hasFailed && !canReply &&
        !replyAccess.isLimited(limitedTo) &&
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            {i18n.t('replies:prompts.notAllowed')}
          </Typography>
        </CardContent>}
      {isLoading && <Progress />}
      {hasFailed &&
        <CardContent>
          <Typography variant="body2" color="error" role="alert">
            {i18n.t('replies:loadFailed')}
          </Typography>
          <Button onClick={load} sx={{ mt: 1 }}>
            {i18n.t('replies:retry')}
          </Button>
        </CardContent>}
      {!isLoading && !hasFailed && shown.length === 0 &&
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            {i18n.t('replies:empty')}
          </Typography>
        </CardContent>}
      {shown.map(item)}
      {isTruncated &&
        <CardContent>
          <Typography variant="caption" color="textSecondary">
            {i18n.t('replies:truncated')}
          </Typography>
        </CardContent>}
      {hidden.length > 0 &&
        <>
          <Divider sx={{ mt: 2 }} />
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="subtitle2">
              {i18n.t('replies:hidden.title', { count: hidden.length })}
            </Typography>
            <Typography variant="caption" color="textSecondary" component="p">
              {i18n.t('replies:hidden.help')}
            </Typography>
            <Button
              size="small"
              aria-expanded={showHidden}
              onClick={() => {
                setShowHidden(!showHidden);
              }}
              sx={{ ml: -1 }}
            >
              {i18n.t(showHidden ? 'replies:hidden.close' : 'replies:hidden.open')}
            </Button>
          </Box>
          {showHidden && hidden.map(item)}
        </>}
      <Dialog
        open={Boolean(asking)}
        onClose={() => {
          setAsking(null);
        }}
        aria-describedby="reply-confirm-message"
        fullWidth
        maxWidth="xs"
      >
        <DialogContent>
          <DialogContentText id="reply-confirm-message">
            {asking && asking.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAsking(null);
            }}
          >
            {i18n.t('actions:cancel')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              const { run } = asking;
              setAsking(null);
              run();
            }}
          >
            {asking && asking.confirm}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

RepliesThread.propTypes = {
  // The post the thread hangs from.
  root: MediumType.isRequired,
  viewer: PersonType.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  // True for a visitor on a site that shows only a preview.
  heldBack: PropTypes.bool,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { viewer, isAuthenticated } = state.session;

  return {
    viewer,
    isAuthenticated,
    heldBack: visitor.isPreviewVisitor(state),
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

export default connect(mapStateToProps, mapDispatchToProps)(RepliesThread);
