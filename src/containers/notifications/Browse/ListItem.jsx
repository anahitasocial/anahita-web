import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import MarkReadIcon from '@mui/icons-material/DoneAll';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import i18n from '../../../languages';

import ActorAvatar from '../../../components/ActorAvatar';
import MenuItemLabel from '../../../components/MenuItemLabel';
import ControlInviteAnswer from '../../controls/InviteAnswer';
import NotificationActions from './Actions';
import NotificationMessage from './NotificationMessage';

import NotificationType from '../../../proptypes/Notification';

// Read by a screen reader and not seen: the dot says it to the eye.
const unseen = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

const NotificationListItem = ({
  item,
  handleEdit,
  handleDelete,
  handleOpen,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const subject = item.subject || {};
  const target = item.target || {};

  return (
    <ListItem
      divider
      // Opened, by any of its links, it is read (roadmap row 97): seeing it
      // in the list is not reading it.
      onClickCapture={(event) => {
        if (!item.isRead && event.target.closest && event.target.closest('a')) {
          handleOpen(item);
        }
      }}
      secondaryAction={
        <>
          <Badge
            color="primary"
            variant="dot"
            invisible={item.isRead}
            sx={{ mr: 2 }}
          />
          <IconButton
            edge="end"
            aria-label={i18n.t('actions:more')}
            onClick={(event) => {
              return setAnchorEl(event.currentTarget);
            }}
            size="large"
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => {
              return setAnchorEl(null);
            }}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                handleEdit(item);
              }}
              disabled={item.isRead}
            >
              <MenuItemLabel icon={<MarkReadIcon fontSize="small" />}>
                {i18n.t('notifications:markRead')}
              </MenuItemLabel>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                handleDelete(item);
              }}
            >
              <MenuItemLabel icon={<DeleteIcon fontSize="small" />}>
                {i18n.t('actions:delete')}
              </MenuItemLabel>
            </MenuItem>
          </Menu>
        </>
      }
      sx={{ pr: 13 }}
    >
      <ListItemAvatar>
        {item.others && item.others.length > 0 ?
          // Several: in a row, each a little over the one after it, the
          // newest on top.
          <Box sx={{ display: 'flex', pr: 1 }}>
            {[subject, ...item.others].slice(0, 3).map((actor, index) => {
              return (
                <Box
                  key={`grouped-${item.id}-${actor.id}`}
                  sx={{
                    position: 'relative',
                    zIndex: 3 - index,
                    ml: index === 0 ? 0 : -1,
                    borderRadius: '50%',
                    border: 2,
                    borderColor: 'background.paper',
                  }}
                >
                  <ActorAvatar actor={actor} linked={Boolean(actor.id)} size="small" />
                </Box>
              );
            })}
          </Box> :
          <ActorAvatar
            actor={subject}
            linked={Boolean(subject.id)}
          />}
      </ListItemAvatar>
      <ListItemText
        primary={
          <>
            {!item.isRead &&
              <Box component="span" sx={unseen}>
                {`${i18n.t('notifications:unread')}: `}
              </Box>}
            <NotificationMessage notification={item} />
          </>
        }
        secondary={
          <>
            {moment.utc(item.createdAt).fromNow()}
            {/* An invitation is answered from where it is read. */}
            {item.type === 'actor_invite' && target.id &&
              <Box component="span" sx={{ display: 'block', pt: 1, maxWidth: 320 }}>
                <ControlInviteAnswer actor={target} />
              </Box>}
            {/* And what else is still to be done from it. */}
            <NotificationActions item={item} onActed={handleOpen} />
          </>
        }
        // The buttons are not text, so the line that holds them is not a
        // paragraph.
        slotProps={{ secondary: { component: 'div' } }}
      />
    </ListItem>
  );
};

NotificationListItem.propTypes = {
  item: NotificationType.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleOpen: PropTypes.func.isRequired,
};

export default NotificationListItem;
