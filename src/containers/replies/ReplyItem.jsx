import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import LikeIcon from '@mui/icons-material/FavoriteBorder';
import LikedIcon from '@mui/icons-material/Favorite';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import ActorAvatar from '../../components/ActorAvatar';
import ActorTitle from '../../components/ActorTitle';
import EntityBody from '../../components/NodeBody';
import ReplyForm from './ReplyForm';
import useReport from '../reports/useReport';
import PersonType from '../../proptypes/Person';
import i18n from '../../languages';
import thread from '../../utils/thread';
import utils from '../../utils';

const { getAuthor } = utils.node;

// How far each level of a thread is set in from the one above: 24 pixels.
// Every space in a thread is a whole number of the theme's 8-pixel steps.
const STEP = 3;

// One reply, and under it the replies made to it.
//
// Everything it can do is handed to it: it draws, and asks. What a viewer
// may do with a reply comes from the server, in `authorized`, so a control
// is here only when it will work.
const ReplyItem = ({
  node,
  viewer,
  depth = 0,
  onReply,
  onEdit,
  onDelete,
  onHide,
  onLike,
}) => {
  const { reply, children } = node;
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const report = useReport(viewer, reply);

  const authorized = reply.authorized || {};
  const author = reply.deleted ? {} : getAuthor(reply);
  const closeMenu = () => {
    setMenuAnchor(null);
  };

  const hasMenu = authorized.edit || authorized.delete || authorized.hide || report.canReport;

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
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onHide={onHide}
            onLike={onLike}
          />
        );
      })}
    </Box>
  );

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
      <Box sx={{
        display: 'flex', alignItems: 'flex-start', gap: 2, px: 2, pt: 2, pb: 1,
      }}
      >
        <ActorAvatar
          actor={author}
          linked={Boolean(author.id)}
          size="small"
        />
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            // The text's own paragraphs, brought onto the same steps.
            '& p': { mt: 1, mb: 1 },
          }}
        >
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap',
          }}
          >
            <ActorTitle
              actor={author}
              linked={Boolean(author.id)}
            />
            <Typography
              variant="caption"
              color="textSecondary"
              title={moment.utc(reply.createdAt).local().format('LLL').toString()}
            >
              {moment.utc(reply.createdAt).fromNow()}
            </Typography>
            {reply.hidden &&
              <Chip size="small" label={i18n.t('replies:hidden.badge')} />}
          </Box>
          {!isEditing &&
            <EntityBody contentFilter size="body2" lang={reply.language}>
              {reply.body || ''}
            </EntityBody>}
          {isEditing &&
            <ReplyForm
              initial={reply.body || ''}
              flush
              submitLabel={i18n.t('actions:save')}
              autoFocus
              onCancel={() => {
                setIsEditing(false);
              }}
              onSubmit={(body) => {
                return onEdit(reply, body).then(() => {
                  setIsEditing(false);
                });
              }}
            />}
          {!isEditing &&
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1, ml: -1,
            }}
            >
              {authorized.comment &&
                <Button
                  size="small"
                  onClick={() => {
                    setIsReplying(!isReplying);
                  }}
                >
                  {i18n.t('replies:reply')}
                </Button>}
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
                  onClick={() => {
                    onLike(reply);
                  }}
                >
                  {reply.likesCount > 0 ? reply.likesCount : ''}
                </Button>}
            </Box>}
        </Box>
        {hasMenu &&
          <>
            <IconButton
              aria-label={i18n.t('replies:actions.menu')}
              aria-haspopup="true"
              onClick={(event) => {
                setMenuAnchor(event.currentTarget);
              }}
              size="small"
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={closeMenu}
            >
              {authorized.edit &&
                <MenuItem
                  onClick={() => {
                    closeMenu();
                    setIsEditing(true);
                  }}
                >
                  {i18n.t('replies:actions.edit')}
                </MenuItem>}
              {authorized.hide &&
                <MenuItem
                  onClick={() => {
                    closeMenu();
                    onHide(reply, !reply.hidden);
                  }}
                >
                  {i18n.t(reply.hidden ? 'replies:actions.show' : 'replies:actions.hide')}
                </MenuItem>}
              {authorized.delete &&
                <MenuItem
                  onClick={() => {
                    closeMenu();
                    onDelete(reply);
                  }}
                >
                  {i18n.t('replies:actions.delete')}
                </MenuItem>}
              {report.canReport &&
                <MenuItem
                  onClick={() => {
                    closeMenu();
                    report.open();
                  }}
                >
                  {i18n.t('abuseReports:report')}
                </MenuItem>}
            </Menu>
            {report.dialog}
          </>}
      </Box>
      {isReplying &&
        <Box sx={{ ml: STEP }}>
          <ReplyForm
            autoFocus
            placeholder={author.name ?
              i18n.t('replies:placeholderTo', { name: author.name }) :
              i18n.t('replies:placeholder')}
            onCancel={() => {
              setIsReplying(false);
            }}
            onSubmit={(body) => {
              return onReply(reply, body).then(() => {
                setIsReplying(false);
              });
            }}
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
};

export default ReplyItem;
