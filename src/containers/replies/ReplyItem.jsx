import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import ActorAvatar from '../../components/ActorAvatar';
import { HiddenLine } from '../../components/WarningCover';
import ReplyActions from './ReplyActions';
import ReplyBox from './ReplyBox';
import ReplyContent, { HEAD } from './ReplyContent';
import ReplyForm from './ReplyForm';
import ReplyMenu from './ReplyMenu';
import useReplyItem from './useReplyItem';
import PersonType from '../../proptypes/Person';
import i18n from '../../languages';
import thread from '../../utils/thread';

// How far each level of a thread is set in from the one above: 24 pixels.
// Every space in a thread is a whole number of the theme's 8-pixel steps.
const STEP = 3;
// Around a reply's picture: one step on a mobile, two on anything wider.
const EDGE = { xs: 1, sm: 2 };

// One reply, and under it the replies made to it.
//
// It draws, and asks: what it holds and may do is useReplyItem's, and what
// it does is the thread's, handed to it.
const ReplyItem = ({
  node,
  viewer,
  depth = 0,
  onReply,
  onEdit,
  onDelete,
  onHide,
  onLike,
  onWarning = null,
  onBlockFromOwner = null,
  blockFromOwnerLabel = '',
  context = '',
  joined = false,
  footer = null,
  writerId = 0,
}) => {
  const { reply, children } = node;
  const item = useReplyItem({
    reply, viewer, writerId, onReply, onEdit, onWarning, onBlockFromOwner,
  });
  const {
    author, warned, media, isEditing,
  } = item;
  // What is done with a reply, handed down to the replies under it.
  const handlers = {
    onReply, onEdit, onDelete, onHide, onLike, onWarning, onBlockFromOwner, blockFromOwnerLabel,
  };

  const under = children.length > 0 && (
    <Box
      sx={{
        // Set in a level, with a line down the side that ties the replies
        // to what they answer. Past a few levels they stop moving in.
        ml: depth < thread.MAX_INDENT ? STEP : 0,
        borderLeft: depth < thread.MAX_INDENT ? 2 : 0,
        borderColor: 'divider',
      }}
    >
      {children.map((child) => {
        return (
          <ReplyItem
            key={`reply-${child.reply.id}`}
            node={child}
            viewer={viewer}
            depth={depth + 1}
            {...handlers}
            writerId={writerId}
          />
        );
      })}
    </Box>
  );

  // Of a kind the reader chose to hide: one line where it would be, and
  // the replies to it as they are.
  if (warned.collapsed && !reply.deleted) {
    return (
      <Box component="section" id={`reply-${reply.id}`}>
        <HiddenLine state={warned} />
        {under}
      </Box>
    );
  }

  // Where a reply was removed and others still hang from it.
  if (reply.deleted) {
    return (
      <Box component="section">
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ px: 2, py: 2, fontStyle: 'italic' }}
        >
          {i18n.t('replies:removed')}
        </Typography>
        {under}
      </Box>
    );
  }

  return (
    <Box component="section" id={`reply-${reply.id}`}>
      {context &&
        <Typography variant="caption" color="textSecondary" component="p" sx={{ px: EDGE, pt: 2 }}>
          {context}
        </Typography>}
      {/* On a mobile, a step around the picture, not two: the words have
          the room (the user, 2026-11-07, after Threads). */}
      <Box sx={{
        display: 'flex', alignItems: 'flex-start', gap: EDGE, px: EDGE, pt: context ? 1 : 2, pb: 1,
      }}
      >
        {/* As tall as the line their name is on, with the picture in the
            middle of it: a small picture set at the top of a taller line
            sat above the name it belongs to. */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            alignSelf: 'stretch',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', minHeight: HEAD }}>
            <ActorAvatar
              actor={author}
              linked={Boolean(author.id)}
              size="small"
            />
          </Box>
          {/* Joined to the next reply of its conversation (roadmap row
              129): a line from under the picture down to the next one's,
              through the space between the two. */}
          {joined &&
            <Box
              aria-hidden
              sx={{
                flex: 1, width: 2, bgcolor: 'divider', borderRadius: 1, mt: 1, mb: -3,
              }}
            />}
        </Box>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            // The text's own paragraphs, brought onto the same steps.
            '& p': { mt: 1, mb: 1 },
          }}
        >
          <ReplyContent
            reply={reply}
            author={author}
            isWriter={item.isWriter}
            warned={warned}
            media={media}
            isEditing={isEditing}
          />
          {isEditing &&
            <ReplyForm
              initial={reply.content || ''}
              flush
              submitLabel={i18n.t('actions:save')}
              autoFocus
              onCancel={item.stopEditing}
              linkPreview={reply.linkPreview}
              hint={item.onBluesky ? i18n.t('federation:composer.editStaysHereBluesky') : ''}
              onSubmit={item.saveEdit}
            />}
          {!isEditing &&
            <ReplyActions
              reply={reply}
              authorized={item.authorized}
              isReplying={item.isReplying}
              onLike={onLike}
              onToggleReplying={item.toggleReplying}
            />}
          {footer}
        </Box>
        {item.hasMenu &&
          <ReplyMenu
            reply={reply}
            item={item}
            onDelete={onDelete}
            onHide={onHide}
            onBlockFromOwner={onBlockFromOwner}
            blockFromOwnerLabel={blockFromOwnerLabel}
          />}
      </Box>
      {item.isReplying &&
        <Box sx={{ ml: STEP }}>
          <ReplyBox
            autoFocus
            hint={item.staysHere ? i18n.t(item.staysHere) : ''}
            placeholder={author.name ?
              i18n.t('replies:placeholderTo', { name: author.name }) :
              i18n.t('replies:placeholder')}
            onCancel={item.stopReplying}
            attachments
            onSubmit={item.sendReply}
          />
        </Box>}
      {under}
    </Box>
  );
};

ReplyItem.propTypes = {
  // A reply, and the replies made to it, as utils/thread arranges them.
  node: PropTypes.shape({
    reply: PropTypes.object.isRequired,
    children: PropTypes.array.isRequired,
  }).isRequired,
  viewer: PersonType.isRequired,
  depth: PropTypes.number,
  // Each returns a promise where the form waits on it.
  onReply: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
  // Changing its content warning: called with the reply and { kind, text }.
  onWarning: PropTypes.func,
  // Blocking the writer from the group the thread is in, for whoever runs
  // it. Given only on a group's thread.
  onBlockFromOwner: PropTypes.func,
  // What that item says: "Block from group".
  blockFromOwnerLabel: PropTypes.string,
  // A line above it: which note of the writer's thread it answers.
  context: PropTypes.string,
  // Joined by a line to the reply after it, in its conversation.
  joined: PropTypes.bool,
  // Under its words and actions: the way to more of its conversation.
  footer: PropTypes.node,
  // The post's writer: said beside their name where they reply.
  writerId: PropTypes.number,
};

export default ReplyItem;
