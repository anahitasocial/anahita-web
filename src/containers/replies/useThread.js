import { useCallback, useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import { useReplyStaysHere } from '../media/Composer/useOnFediverse';
import replyAccess from '../../utils/replyAccess';
import replyOrder from '../../utils/replyOrder';
import thread from '../../utils/thread';
import visitor from '../../utils/visitor';
import utils from '../../utils';
import sendReply, { addAll, notAddedKey } from './sendReply';

const { federation } = utils;
const { getAuthor, getActorName } = utils.node;

// Who wrote a post or a reply, for the writer's chain.
const writerOf = (node) => {
  const author = getAuthor(node);
  return (author && author.id) || 0;
};

// The thread as it is drawn, from the replies held.
//
// On the page of a single reply, only what was said under that reply. On
// the post's own page, its writer's chain first, flat, as the post goes on
// (roadmap row 126), and everybody else's replies after it. Of those, the
// ones in sight in the order chosen, and the ones hidden by whoever runs
// the thread apart. `answersOf(reply)` is which note of the writer's chain
// a reply answers, or 0.
const arrange = (replies, root, under, order) => {
  const top = under || root;
  const chained = under ?
    { chain: [], rest: replies, answers: () => { return 0; } } :
    thread.chainOf(replies, root.id, writerOf(root), writerOf);
  const { thread: shown, hidden } = thread.split(
    under ? thread.under(replies, under.id) : chained.rest,
    top.id,
  );
  return {
    chain: chained.chain,
    shown: replyOrder.arrange(shown, order),
    hidden,
    answersOf: chained.answers,
  };
};

// Everything said under a post: the replies to it, the replies to those,
// and what can be done with them. Thread.jsx draws what this gives.
//
// The thread is read whole and kept here, not in the store. Nothing else on
// the page shows it, and it is thrown away when the page is left. Each
// change is made on the server first and then in the copy held here, by the
// same rule the server follows (see utils/thread), so the thread does not
// have to be read again after every reply.
//
// What the viewer may do comes from the server with each reply, and with
// the thread itself for whether they may reply at all.
const useThread = ({ root, under = null }) => {
  const dispatch = useDispatch();
  const { viewer, isAuthenticated, heldBack } = useSelector((state) => {
    return {
      viewer: state.session.viewer,
      isAuthenticated: state.session.isAuthenticated,
      heldBack: visitor.isPreviewVisitor(state),
    };
  }, shallowEqual);

  const [replies, setReplies] = useState([]);
  const [canReply, setCanReply] = useState(false);
  // Who the post's author lets reply, as the server reads it.
  const [limitedTo, setLimitedTo] = useState(replyAccess.ANYONE);
  const [order, setOrder] = useState(replyOrder.load);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  // What is waiting on a yes: a message, the label of its button and what
  // to do.
  const [asking, setAsking] = useState(null);
  // Replies with a GIF or a video on their way: sent, then prepared.
  const [onTheWay, setOnTheWay] = useState([]);

  const alertSuccess = (message) => {
    return dispatch(actions.app.alert.success(message));
  };
  const alertError = (message) => {
    return dispatch(actions.app.alert.error(message));
  };

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
  // said before it is sent.
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

  // A change to one reply, made in the copy held here.
  const change = (fields) => {
    setReplies((current) => { return thread.replace(current, fields); });
  };

  const add = (parent, body, card = {}, attached = {}) => {
    return sendReply(viewer, parent, body, card, attached).then((sent) => {
      if (sent.made.length > 0) {
        setReplies((current) => { return addAll(current, sent.made); });
      }
      if (sent.onTheWay) {
        setOnTheWay((current) => {
          return [...current, { key: `${Date.now()}-${current.length}`, ...sent.onTheWay }];
        });
      }
    }).catch((error) => {
      alertError(i18n.t(notAddedKey(error)));
      throw error;
    });
  };

  const edit = (reply, body, card = {}) => {
    return api.replies.edit(reply, { content: body, card }).then((result) => {
      // Only what an edit changes. The answer to an edit is the note as any
      // note is sent, and the thread's own answers about this reply are
      // kept. Its card follows the edit: kept, changed or gone.
      change({
        id: reply.id,
        content: result.data.content,
        language: result.data.language,
        linkPreview: result.data.linkPreview || null,
      });
      alertSuccess(i18n.t('replies:prompts.saved'));
    }).catch((error) => {
      alertError(i18n.t('replies:prompts.notSaved'));
      throw error;
    });
  };

  // A reply's content warning (row 122), given, changed or taken off.
  const warn = (reply, warning) => {
    return api.warnings.edit(reply, warning).then((result) => {
      change({ id: reply.id, warning: result.data.warning || null });
      alertSuccess(i18n.t('warnings:saved'));
    }).catch((error) => {
      alertError(i18n.t('warnings:notSaved'));
      throw error;
    });
  };

  const deleteItem = (reply) => {
    setAsking({
      message: i18n.t('replies:confirm.delete'),
      confirm: i18n.t('replies:actions.delete'),
      run: () => {
        return api.replies.deleteItem(reply).then(() => {
          setReplies((current) => { return thread.remove(current, reply.id); });
          alertSuccess(i18n.t('replies:prompts.deleted'));
        }).catch(() => {
          alertError(i18n.t('replies:prompts.notDeleted'));
        });
      },
    });
  };

  const setHidden = (reply, hidden) => {
    return api.replies.setHidden(reply, hidden).then(() => {
      setReplies((current) => { return thread.setHidden(current, reply.id, hidden); });
      alertSuccess(i18n.t(hidden ? 'replies:prompts.hidden' : 'replies:prompts.shown'));
    }).catch(() => {
      alertError(i18n.t('replies:prompts.notHidden'));
    });
  };

  const hide = (reply, hidden) => {
    // Showing a reply again needs no second thought. Hiding one takes
    // everything under it out of the thread, so it is asked about.
    if (!hidden) {
      setHidden(reply, false);
      return;
    }

    // A reply from the fediverse is hidden here only, which is said.
    const author = getAuthor(reply);
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
  const blockFromOwner = (reply) => {
    const group = root.owner || {};
    const groupName = getActorName(group);
    const author = getAuthor(reply);

    setAsking({
      message: i18n.t('socialgraph:blockFromOwner.confirm', {
        person: getActorName(author),
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

  const like = (reply) => {
    const call = reply.isLikedByViewer ? api.likes.deleteItem : api.likes.add;

    call(reply).then((result) => {
      const liked = result.data || {};
      change({
        id: reply.id,
        isLikedByViewer: !reply.isLikedByViewer,
        likesCount: typeof liked.likesCount === 'number' ?
          liked.likesCount :
          Math.max((reply.likesCount || 0) + (reply.isLikedByViewer ? -1 : 1), 0),
      });
    }).catch(() => {
      alertError(i18n.t('replies:prompts.notHidden'));
    });
  };

  return {
    viewer,
    isAuthenticated,
    heldBack,
    staysHere,
    canReply,
    limitedTo,
    isTruncated,
    isLoading,
    hasFailed,
    // The thread as it is drawn, and the writer of the post it is under.
    ...arrange(replies, root, under, order),
    writerId: writerOf(root),
    load,
    order,
    choose: (chosen) => {
      setOrder(chosen);
      replyOrder.save(chosen);
    },
    onTheWay,
    // A reply with a file is no longer on its way: made, or failed and
    // dismissed.
    gone: (key) => {
      setOnTheWay((current) => {
        return current.filter((other) => { return other.key !== key; });
      });
    },
    asking,
    // The question answered: no, or yes, which does what it asked about.
    dismiss: () => {
      setAsking(null);
    },
    confirm: () => {
      const { run } = asking;
      setAsking(null);
      run();
    },
    add,
    edit,
    warn,
    deleteItem,
    hide,
    like,
    blockFromOwner,
  };
};

export { arrange, writerOf };
export default useThread;
