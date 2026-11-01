import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@mui/material/Button';

import LikeIcon from '@mui/icons-material/FavoriteBorder';
import UnlikeIcon from '@mui/icons-material/Favorite';

import actions from '../../../actions';
import NodeType from '../../../proptypes/Node';
import i18n from '../../../languages';
import likePerms from '../../../permissions/like';

const LikesActionLikeStory = React.forwardRef(({
  repostNode,
  node,
  likeNode,
  unlikeNode = null,
  size = 'medium',
}, ref) => {
  const likeableNode = node;
  const { isLikedByViewer: liked } = likeableNode;

  const handleLike = () => {
    likeNode(repostNode, node);
  };

  const handleUnlike = () => {
    unlikeNode(repostNode, node);
  };

  const label = liked ? i18n.t('actions:unlike') : i18n.t('actions:like');
  const onClick = liked ? handleUnlike : handleLike;
  const color = liked ? 'primary' : 'inherit';
  // Unliking is always allowed; liking only when the server says so.
  const disabled = !liked && !likePerms.canLike(node);

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      color={color}
      aria-label={label}
      ref={ref}
      startIcon={
        <>
          {liked && <UnlikeIcon fontSize={size} />}
          {!liked && <LikeIcon fontSize={size} />}
        </>
      }
      fullWidth
    >
      {node.likesCount > 0 && node.likesCount}
    </Button>
  );
});

LikesActionLikeStory.propTypes = {
  likeNode: PropTypes.func.isRequired,
  unlikeNode: PropTypes.func.isRequired,
  repostNode: NodeType,
  node: NodeType.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'inherit']),
};

const mapStateToProps = () => {
  return () => {
    return {};
  };
};

const mapDispatchToProps = (namespace) => {
  return (dispatch) => {
    return {
      likeNode: (child, node) => {
        return dispatch(actions[namespace].likes.add({ child, node }));
      },
      unlikeNode: (child, node) => {
        return dispatch(actions[namespace].likes.deleteItem({ child, node }));
      },
    };
  };
};

export default (namespace) => {
  return connect(
    mapStateToProps(namespace),
    mapDispatchToProps(namespace),
  )(LikesActionLikeStory);
};
