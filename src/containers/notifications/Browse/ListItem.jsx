import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import MoreVertIcon from '@mui/icons-material/MoreVert';

import ActorAvatar from '../../../components/ActorAvatar';
import NotificationMessage from './NotificationMessage';

import NotificationType from '../../../proptypes/Notification';

const NotificationListItem = ({ item, handleEdit, handleDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <ListItem divider>
      <ListItemAvatar>
        <ActorAvatar
          actor={item.subject}
          linked={Boolean(item.subject.id)}
        />
      </ListItemAvatar>
      <ListItemText
        primary={<NotificationMessage notification={item} />}
        secondary={moment.utc(item.createdAt).fromNow()}
      />
      <ListItemSecondaryAction>
        <IconButton
          edge="end"
          aria-label="actions"
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
            Mark as read
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              handleDelete(item);
            }}
          >
            Delete notification
          </MenuItem>
        </Menu>
        <Badge
          color="primary"
          variant="dot"
          invisible={item.isRead}
          style={{ marginLeft: 24 }}
        />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

NotificationListItem.propTypes = {
  item: NotificationType.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
};

export default NotificationListItem;
