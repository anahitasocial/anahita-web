import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink, useLocation } from 'react-router-dom';
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
import Link from '@mui/material/Link';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import RepliesIcon from '@mui/icons-material/ModeCommentOutlined';
import Progress from '../../components/Progress';
import SignInPrompt from '../../components/SignInPrompt';
import ReplyBox from './ReplyBox';
import ReplyItem from './ReplyItem';
import VideoReplyOnTheWay from './VideoReplyOnTheWay';

import actions from '../../actions';
import api from '../../api';

import EmptyList from '../../components/EmptyList';
import i18n from '../../languages';
import { useReplyStaysHere } from '../media/Composer/useOnFediverse';
import MediumType from '../../proptypes/Medium';
import PersonType from '../../proptypes/Person';
import postLanguage from '../../utils/postLanguage';
import warnings from '../../utils/warnings';
import replyAccess from '../../utils/replyAccess';
import thread from '../../utils/thread';
import threadNotes from '../../utils/threadNotes';
import visitor from '../../utils/visitor';
import utils from '../../utils';
import events from '../../utils/events';
import replyOrder from '../../utils/replyOrder';

const { federation } = utils;
const { getAuthor, getURL } = utils.node;

// Who wrote a post or a reply, for the writer's chain.
const writerOf = (node) => {
  const author = getAuthor(node);
  return (author && author.id) || 0;
};

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
  under = null,
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
  const [order, setOrder] = useState(replyOrder.load);
  const location = useLocation();
  const [isTruncated, setIsTruncated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  // What is waiting on a yes: a message and what to do.
  const [asking, setAsking] = useState(null);
  // Replies with a GIF or a video on their way: sent, then prepared.
  const [onTheWay, setOnTheWay] = useState([]);

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

  // Answering something from another server, and not on the fediverse:
  // said before it is sent. Asked here, before anything is returned, as
  // every hook is.
  const staysHere = useReplyStaysHere(viewer, under || root);

  useEffect(() => {
    // Not asked for when the answer is known to be no: on a site that
    // shows visitors a preview, what is said under a post is for members.
    if (heldBack) {
      setIsLoading(false);
      return;
    }
    load();
  }, [load, heldBack]);

  // A reply with words alone is a note; with pictures, a photo post; with a
  // GIF or a video, a video post, which is in the thread once it has been
  // sent and prepared.
  const handleReply = (parent, body, card = {}, attached = {}) => {
    // The language this person writes in, as for any post.
    const language = postLanguage.defaultFor(viewer);
    // Its content warning, when its writer gave it one (row 122): a
    // thread's is every note's.
    const warning = warnings.toRequest(attached.warning);

    if (attached.video) {
      setOnTheWay((current) => {
        return [...current, {
          key: `${Date.now()}-${current.length}`, parent, body, language, warning, file: attached.video,
        }];
      });
      return Promise.resolve();
    }

    // A thread written in one go: its notes made together, in order, each
    // answering the one before (roadmap row 101), each with words,
    // pictures or both (row 143).
    if (attached.thread) {
      const first = {
        content: body,
        language,
        ...(attached.uploads ? { uploads: attached.uploads } : {}),
        ...(!attached.uploads && card.linkPreviewUrl ?
          { linkPreviewUrl: card.linkPreviewUrl } : {}),
      };
      const parts = [first, ...attached.thread.map((note) => {
        return threadNotes.toPart(note, language);
      })];
      return api.replies.addReplyThread(parent, parts, warning).then((result) => {
        setReplies((current) => {
          return result.data.parts.reduce((list, part) => {
            return thread.add(list, part);
          }, current);
        });
      }).catch((error) => {
        const status = error && error.response && error.response.status;
        alertError(i18n.t(status === 403 ?
          'replies:prompts.notAllowed' :
          'replies:prompts.notAdded'));
        throw error;
      });
    }

    const sent = attached.uploads ?
      api.replies.addWithPictures(parent, {
        content: body, language, uploads: attached.uploads, warning,
      }) :
      api.replies.add(parent, {
        content: body, card, language, warning,
      });

    return sent.then((result) => {
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

  const handleEdit = (reply, body, card = {}) => {
    return api.replies.edit(reply, { content: body, card }).then((result) => {
      setReplies((current) => {
        // Only what an edit changes. The answer to an edit is the note as
        // any note is sent, and the thread's own answers about this reply
        // are kept.
        return thread.replace(current, {
          id: reply.id,
          content: result.data.content,
          language: result.data.language,
          // Its card follows the edit: kept, changed or gone.
          linkPreview: result.data.linkPreview || null,
        });
      });
      alertSuccess(i18n.t('replies:prompts.saved'));
    }).catch((error) => {
      alertError(i18n.t('replies:prompts.notSaved'));
      throw error;
    });
  };

  // A reply's content warning (row 122), given, changed or taken off.
  const handleWarning = (reply, warning) => {
    return api.warnings.edit(reply, warning).then((result) => {
      setReplies((current) => {
        return thread.replace(current, {
          id: reply.id,
          warning: result.data.warning || null,
        });
      });
      alertSuccess(i18n.t('warnings:saved'));
    }).catch((error) => {
      alertError(i18n.t('warnings:notSaved'));
      throw error;
    });
  };

  const handleDelete = (reply) => {
    setAsking({
      message: i18n.t('replies:confirm.delete'),
      confirm: i18n.t('replies:actions.delete'),
      run: () => {
        return api.replies.deleteItem(reply).then(() => {
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

    // A reply from the fediverse is hidden here only, which is said.
    const author = utils.node.getAuthor(reply);
    const fediverse = federation.fromFediverse(reply) || federation.fromFediverse(author);
    const domain = federation.domainOf(reply) || federation.domainOf(author);

    setAsking({
      message: fediverse && domain ?
        i18n.t('replies:confirm.hideFediverse', { domain }) :
        i18n.t('replies:confirm.hide'),
      confirm: i18n.t('replies:actions.hide'),
      run: () => {
        return setHidden(reply, true);
      },
    });
  };

  // The group or the event the thread is in blocking whoever wrote a reply,
  // for whoever runs it. The thread is read again afterwards: what the
  // blocked person wrote in it is out of sight now, for everybody.
  const group = root.owner || {};
  const groupName = utils.node.getActorName(group);

  const handleBlockFromOwner = (reply) => {
    const author = utils.node.getAuthor(reply);

    setAsking({
      message: i18n.t('socialgraph:blockFromOwner.confirm', {
        person: utils.node.getActorName(author),
        name: groupName,
      }),
      confirm: i18n.t('actions:block'),
      run: () => {
        return api.socialgraph.block({ actor: author, viewer: group }).then(() => {
          alertSuccess(i18n.t('socialgraph:blockFromOwner.done', { name: groupName }));
          load();
        }).catch(() => {
          alertError(i18n.t('socialgraph:blockFromOwner.failed'));
        });
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

  // On the page of a single reply, only what was said under that reply,
  // and what is written here answers it.
  const top = under || root;
  // On the post's own page, its writer's chain first, flat, as the post goes
  // on (roadmap row 126); everybody else's replies after it.
  const chained = under ?
    { chain: [], rest: replies, answers: () => { return 0; } } :
    thread.chainOf(replies, root.id, writerOf(root), writerOf);
  const { thread: shown, hidden } = thread.split(
    under ? thread.under(replies, under.id) : chained.rest,
    top.id,
  );

  const item = (node) => {
    const answers = chained.answers(node.reply);
    return (
      <ReplyItem
        key={`reply-${node.reply.id}`}
        node={node}
        context={answers ? i18n.t('replies:answersNote', { number: answers }) : ''}
        viewer={viewer}
        writerId={writerOf(root)}
        onReply={handleReply}
        onEdit={handleEdit}
        onWarning={handleWarning}
        onDelete={handleDelete}
        onHide={handleHide}
        onLike={handleLike}
        onBlockFromOwner={handleBlockFromOwner}
        blockFromOwnerLabel={i18n.t(events.isEvent(group) ?
          'socialgraph:blockFromOwner.actionEvent' :
          'socialgraph:blockFromOwner.action')}
      />
    );
  };

  // A reply of the first level, then its conversation (roadmap row 129):
  // flat, one step in, joined by a line, whoever answers whom; the
  // earliest branch followed and the rest counted, a tap from where they
  // hang; three in sight, then the whole of it on the reply's own page.
  // Each reply still answers what it answered: only the drawing is flat.
  const toPage = (reply) => {
    return getURL(reply);
  };
  const conversationLink = (to, words) => {
    return (
      <Link
        component={RouterLink}
        to={to}
        variant="body2"
        underline="hover"
        sx={{ display: 'block', pt: 1 }}
      >
        {words}
      </Link>
    );
  };
  const withConversation = (node) => {
    const conversation = thread.conversationOf(node);
    const { steps } = conversation;
    // Each reply drawn as it is, at the same width, joined to the next by
    // the line in the pictures' column. Under a reply with more than one
    // answer, the rest a tap away, named; under the last in sight, the
    // whole conversation.
    const drawn = [{ reply: node.reply }, ...steps];
    return (
      <Box key={`conversation-${node.reply.id}`}>
        {/* A thin rule between one conversation and the next: the line
            joins only within one (after Threads, the user, 2026-11-07). */}
        <Divider sx={{ mt: 1 }} />
        {drawn.map((each, index) => {
          const next = steps[index];
          const isLast = index === drawn.length - 1;
          const footer = (
            <>
              {next && next.more > 0 &&
                conversationLink(toPage(each.reply), i18n.t('replies:conversation.more', {
                  count: next.more,
                  name: (getAuthor(each.reply) || {}).name || '',
                }))}
              {isLast && conversation.hasMore &&
                conversationLink(toPage(node.reply), i18n.t('replies:conversation.show', {
                  count: conversation.total,
                }))}
            </>
          );
          return (
            <ReplyItem
              key={`reply-${each.reply.id}`}
              node={{ reply: each.reply, children: [] }}
              viewer={viewer}
              joined={!isLast}
              footer={footer}
              writerId={writerOf(root)}
              context={chained.answers(each.reply) ?
                i18n.t('replies:answersNote', { number: chained.answers(each.reply) }) : ''}
              onReply={handleReply}
              onEdit={handleEdit}
              onWarning={handleWarning}
              onDelete={handleDelete}
              onHide={handleHide}
              onLike={handleLike}
              onBlockFromOwner={handleBlockFromOwner}
              blockFromOwnerLabel={i18n.t(events.isEvent(group) ?
                'socialgraph:blockFromOwner.actionEvent' :
                'socialgraph:blockFromOwner.action')}
            />
          );
        })}
      </Box>
    );
  };

  return (
    // Twice the step at its foot, so that a conversation's line ends clear
    // of the card's edge.
    <Card sx={{ pb: 2 }}>
      {/* The rest of the post, by its writer: joined by a line, as one
          piece, before anybody's reply. */}
      {chained.chain.length > 0 &&
        <Box>
          {chained.chain.map((reply, index) => {
            return (
              <ReplyItem
                key={`reply-${reply.id}`}
                node={{ reply, children: [] }}
                viewer={viewer}
                joined={index < chained.chain.length - 1}
                onReply={handleReply}
                onEdit={handleEdit}
                onWarning={handleWarning}
                onDelete={handleDelete}
                onHide={handleHide}
                onLike={handleLike}
                onBlockFromOwner={handleBlockFromOwner}
                blockFromOwnerLabel={i18n.t(events.isEvent(group) ?
                  'socialgraph:blockFromOwner.actionEvent' :
                  'socialgraph:blockFromOwner.action')}
              />
            );
          })}
        </Box>}
      {canReply &&
        <ReplyBox
          autoFocus={Boolean(location.state && location.state.reply)}
          hint={staysHere ? i18n.t(staysHere) : ''}
          direction={postLanguage.directionOf(postLanguage.defaultFor(viewer))}
          placeholder={(getAuthor(top) || {}).name ?
            i18n.t('replies:placeholderTo', { name: getAuthor(top).name }) :
            i18n.t('replies:placeholder')}
          attachments
          onSubmit={(body, card, attached) => {
            return handleReply(top, body, card, attached);
          }}
        />}
      {onTheWay.map((each) => {
        return (
          <VideoReplyOnTheWay
            key={`on-the-way-${each.key}`}
            viewer={viewer}
            parent={each.parent}
            body={each.body}
            language={each.language}
            warning={each.warning}
            file={each.file}
            onReady={load}
            onGone={() => {
              setOnTheWay((current) => {
                return current.filter((other) => {
                  return other.key !== each.key;
                });
              });
            }}
          />
        );
      })}
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
      {/* Nothing at all under the post: not when only its writer has
          gone on under it. */}
      {!isLoading && !hasFailed && shown.length === 0 && chained.chain.length === 0 &&
        <EmptyList icon={<RepliesIcon />} inCard />}
      {shown.length >= replyOrder.MIN_TO_CHOOSE &&
        <Box sx={{
          display: 'flex', justifyContent: 'flex-end', px: 2, pb: 1,
        }}
        >
          <ToggleButtonGroup
            size="small"
            color="primary"
            exclusive
            value={order}
            aria-label={i18n.t('replies:order.label')}
            onChange={(event, chosen) => {
              if (chosen) {
                setOrder(chosen);
                replyOrder.save(chosen);
              }
            }}
          >
            <ToggleButton value={replyOrder.NEWEST} sx={{ px: 2 }}>
              {i18n.t('replies:order.newest')}
            </ToggleButton>
            <ToggleButton value={replyOrder.OLDEST} sx={{ px: 2 }}>
              {i18n.t('replies:order.oldest')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>}
      {replyOrder.arrange(shown, order).map(withConversation)}
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
            fullWidth
            onClick={() => {
              setAsking(null);
            }}
          >
            {i18n.t('actions:cancel')}
          </Button>
          <Button
            fullWidth
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
  root: PropTypes.shape({
    id: PropTypes.number.isRequired,
    replyAccess: PropTypes.string,
    // The profile it is on: a group, for blocking somebody from it.
    owner: PropTypes.object,
  }).isRequired,
  // A reply in the thread, to show only what is under it.
  under: MediumType,
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
