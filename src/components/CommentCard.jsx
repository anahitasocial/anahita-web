import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Link from '@mui/material/Link';

import ActorTitle from './ActorTitle';
import ActorAvatar from './ActorAvatar';
import EntityBody from './NodeBody';
import CommentType from '../proptypes/Comment';
import utils from '../utils';

const {
  getCommentURL,
  getAuthor,
} = utils.node;

const CommentCard = ({
  comment,
  stats = null,
  actions = null,
  menu = null,
  isEditing = false,
  commentForm = null,
}) => {
  const { createdAt } = comment;
  const author = getAuthor(comment);
  const url = getCommentURL(comment);

  if (isEditing) {
    return commentForm;
  }

  return (
    <Card component="section">
      <CardHeader
        avatar={
          <ActorAvatar
            actor={author}
            linked={Boolean(author.id)}
            size="small"
          />
        }
        title={
          <ActorTitle
            actor={author}
            linked={Boolean(author.id)}
          />
        }
        subheader={
          <Link
            href={url}
            title={moment.utc(createdAt).format('LLL').toString()}
          >
            {moment.utc(createdAt).fromNow()}
          </Link>
        }
        action={menu}
      />
      <CardContent>
        <EntityBody contentFilter>
          {comment.body}
        </EntityBody>
      </CardContent>
      {stats &&
        <CardActions>
          {stats}
        </CardActions>}
      {actions &&
        <CardActions>
          {actions}
        </CardActions>}
    </Card>
  );
};

CommentCard.propTypes = {
  stats: PropTypes.node,
  actions: PropTypes.node,
  menu: PropTypes.node,
  comment: CommentType.isRequired,
  commentForm: PropTypes.node,
  isEditing: PropTypes.bool,
};

export default CommentCard;
