import React from 'react';
import PropTypes from 'prop-types';

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import permissions from '../../permissions/medium';
import utils from '../../utils';

import ControlNotificationSub from '../controls/medium/NotificationSub';
import ControlCommentStatus from '../controls/medium/CommentStatus';
import ControlDelete from '../controls/Delete';

import PersonType from '../../proptypes/Person';
import MediumType from '../../proptypes/Medium';
import i18n from '../../languages';

const { withRef } = utils.component;
const {
  getURL,
  // isLikeable,
  isCommentable,
  isSubscribable,
} = utils.node;

const NotificationSubActionWithRef = withRef(ControlNotificationSub);
const CommentStatusActionWithRef = withRef(ControlCommentStatus);
const DeleteActionWithRef = withRef(ControlDelete);

const MediaMenu = ({
  medium,
  viewer,
  handleEdit,
  inline = false,
}) => {
  const [menuAnchorEl, setAnchorEl] = React.useState(null);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const canEdit = permissions.canEdit(viewer, medium);
  const canSubscribe = isSubscribable(medium);
  const canComment = isCommentable(medium);
  const canDelete = permissions.canDelete(viewer, medium);

  if (!canEdit && !canSubscribe && !canComment && !canDelete) {
    return (<></>);
  }

  return (
    <>
      <IconButton
        aria-owns={menuAnchorEl ? `medium-card-menu-${medium.id}` : undefined}
        aria-haspopup="true"
        onClick={handleOpenMenu}
        size="large"
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id={`medium-menu-${medium.id}`}
        anchorEl={menuAnchorEl}
        keepMounted
        open={Boolean(menuAnchorEl)}
        onClose={handleClose}
      >
        {handleEdit &&
          <MenuItem
            onClick={() => {
              handleEdit();
              handleClose();
            }}
            disabled={!canEdit}
          >
            Edit
          </MenuItem>}
        {isSubscribable(medium) &&
          <NotificationSubActionWithRef
            medium={medium}
            isSubscribedByViewer={medium.isSubscribedByViewer}
            key={`medium-notification-${medium.id}`}
          />}
        {isCommentable(medium) &&
          <CommentStatusActionWithRef
            medium={medium}
            key={`medium-comment-status-${medium.id}`}
          />}
        <DeleteActionWithRef
          node={medium}
          key={`medium-delete-${medium.id}`}
          redirect={inline ? '' : getURL(medium.owner)}
          component="menuitem"
          confirmMessage={i18n.t('media:confirm.delete')}
        />
      </Menu>
    </>
  );
};

MediaMenu.propTypes = {
  medium: MediumType.isRequired,
  viewer: PersonType.isRequired,
  handleEdit: PropTypes.func,
  inline: PropTypes.bool,
};

export default MediaMenu;
