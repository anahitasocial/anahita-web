import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';

import ActorTitle from '../../../components/actor/Title';
import ActorAvatar from '../../../components/actor/Avatar';
import EntityBody from '../../../components/EntityBody';
import CommentType from '../../../proptypes/Comment';

const CommentListItem = ({
  comment,
  actions = null,
  menu = null,
  isEditing = false,
  commentForm = null,
}) => {
  const { author, createdAt } = comment;

  if (isEditing) {
    return (
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <ActorAvatar
            actor={author}
            linked={Boolean(author.id)}
            size="small"
          />
        </ListItemAvatar>
        <ListItemText
          primary={
            <ActorTitle
              actor={author}
              linked={Boolean(author.id)}
            />
          }
          secondary={commentForm}
        />
        <ListItemSecondaryAction>
          {menu}
        </ListItemSecondaryAction>
      </ListItem>
    );
  }

  return (
    <>
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <ActorAvatar
            actor={author}
            linked={Boolean(author.id)}
            size="small"
          />
        </ListItemAvatar>
        <ListItemText
          primary={
            <>
              <ActorTitle
                actor={author}
                linked={Boolean(author.id)}
              />
              {moment(createdAt).fromNow()}
            </>
          }
          secondary={
            <>
              <EntityBody size="small">
                {comment.body}
              </EntityBody>
              <div>
                {actions}
              </div>
            </>
          }
        />
        <ListItemSecondaryAction>
          {menu}
        </ListItemSecondaryAction>
      </ListItem>
      <Divider variant="inset" component="li" />
    </>
  );
};

CommentListItem.propTypes = {
  actions: PropTypes.node,
  menu: PropTypes.node,
  comment: CommentType.isRequired,
  commentForm: PropTypes.node,
  isEditing: PropTypes.bool,
};

export default CommentListItem;
