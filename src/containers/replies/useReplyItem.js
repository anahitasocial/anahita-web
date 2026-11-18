import { useState } from 'react';

import { useWarning } from '../../components/WarningCover';
import mediumPermissions from '../../permissions/medium';
import utils from '../../utils';
import warnings from '../../utils/warnings';
import { useOnBluesky, useReplyStaysHere } from '../media/Composer/useOnFediverse';
import useMute from '../controls/useMute';
import useReport from '../reports/useReport';

const { getAuthor } = utils.node;

// What one reply in a thread can show and do, for ReplyItem to draw: whether
// it is being answered, changed or given a content warning, and which of
// its menu's items are there.
//
// Everything it can do is handed to it by the thread, which keeps the
// replies. What a viewer may do with a reply comes from the server, in
// `authorized`, so a control is offered only when it will work.
const useReplyItem = ({
  reply,
  viewer,
  writerId = 0,
  onReply,
  onEdit,
  onWarning = null,
  onBlockFromOwner = null,
}) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [isSavingWarning, setIsSavingWarning] = useState(false);
  const report = useReport(viewer, reply);
  // Its content warning (row 122), not over it while it is edited.
  const cover = useWarning(reply);
  const warned = isEditing ? { ...cover, hidden: false, collapsed: false } : cover;
  // Answering something from another server, and not on the fediverse:
  // said before it is sent.
  const staysHere = useReplyStaysHere(viewer, reply);
  // Whether the viewer's posts go to Bluesky, where a change does not follow.
  const onBluesky = useOnBluesky(viewer);

  const authorized = reply.authorized || {};
  const author = reply.deleted ? {} : getAuthor(reply);
  const isWriter = Boolean(writerId) && author.id === writerId;

  // A reply from another server can be read where it was written.
  const original = utils.federation.isRemote(reply) ? utils.federation.pageOf(reply) : '';
  // Whoever runs the group the thread is in may block its writer from there.
  const canBlockFromOwner = Boolean(authorized.blockFromOwner && onBlockFromOwner);
  // Whoever wrote it, unless it is the viewer (roadmap row 133). Their
  // replies leave the thread when it is read again.
  const mute = useMute(reply.deleted ? null : viewer, author);
  // Its content warning, changed by its writer (row 122), but not one the
  // administrators gave; or by a site administrator, as a moderator, on
  // anybody's reply (phase 4).
  const warning = warnings.of(reply);
  const moderating = mediumPermissions.isWarningModerator(viewer, { ...reply, author });
  const canWarn = Boolean(onWarning && !reply.deleted &&
    (moderating || (authorized.edit && !warning.byModerator)));
  const hasMenu = authorized.edit || canWarn || authorized.delete || authorized.hide ||
    canBlockFromOwner || mute.canMute || report.canReport || original;

  return {
    authorized,
    author,
    isWriter,
    warned,
    media: warnings.hasMedia(reply),
    staysHere,
    onBluesky,
    original,
    canBlockFromOwner,
    mute,
    report,
    warning,
    moderating,
    canWarn,
    hasMenu,

    menuAnchor,
    openMenu: (event) => {
      setMenuAnchor(event.currentTarget);
    },
    closeMenu: () => {
      setMenuAnchor(null);
    },

    isReplying,
    toggleReplying: () => {
      setIsReplying(!isReplying);
    },
    stopReplying: () => {
      setIsReplying(false);
    },
    // An answer to this reply, sent by the thread; the box closes once it
    // is in.
    sendReply: (body, card, attached) => {
      return onReply(reply, body, card, attached).then(() => {
        setIsReplying(false);
      });
    },

    isEditing,
    startEditing: () => {
      setIsEditing(true);
    },
    stopEditing: () => {
      setIsEditing(false);
    },
    saveEdit: (body, card) => {
      return onEdit(reply, body, card).then(() => {
        setIsEditing(false);
      });
    },

    isWarning,
    isSavingWarning,
    startWarning: () => {
      setIsWarning(true);
    },
    stopWarning: () => {
      setIsWarning(false);
    },
    saveWarning: (chosen) => {
      setIsSavingWarning(true);
      onWarning(reply, chosen).then(() => {
        setIsWarning(false);
      }).catch(() => {
        // Said by the thread; the dialog stays.
      }).finally(() => {
        setIsSavingWarning(false);
      });
    },
  };
};

export default useReplyItem;
