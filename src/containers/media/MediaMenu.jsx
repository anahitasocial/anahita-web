import React from 'react';
import PropTypes from 'prop-types';

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import permissions from '../../permissions/medium';
import utils from '../../utils';

import ControlNotificationSub from '../controls/medium/NotificationSub';
import ControlReplyAccess from '../controls/medium/ReplyAccess';
import ControlDelete from '../controls/Delete';
import useReport from '../reports/useReport';
import PhotoFilesDialog from './PhotoFilesDialog';

import PersonType from '../../proptypes/Person';
import MediumType from '../../proptypes/Medium';
import i18n from '../../languages';

const { withRef } = utils.component;
const {
  getNamespace,
  getURL,
  // isLikeable,
  isCommentable,
  isSubscribable,
} = utils.node;

const NotificationSubActionWithRef = withRef(ControlNotificationSub);
const DeleteActionWithRef = withRef(ControlDelete);

const MediaMenu = ({
  medium,
  viewer,
  handleEdit,
  inline = false,
}) => {
  const [menuAnchorEl, setAnchorEl] = React.useState(null);
  const [isEditingPhotos, setIsEditingPhotos] = React.useState(false);
  const [isSettingReplies, setIsSettingReplies] = React.useState(false);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const canEdit = permissions.canEdit(viewer, medium);
  const canSubscribe = isSubscribable(medium);
  // Who can reply is the post's own setting, changed by whoever may edit
  // the post.
  const canSetReplies = canEdit && isCommentable(medium);
  const canDelete = permissions.canDelete(viewer, medium);
  const report = useReport(viewer, medium);
  // A photo post's images are changed in a dialog of their own: their
  // order, their descriptions, and which there are.
  const canEditPhotos = canEdit && getNamespace(medium) === 'photos';

  // Somebody who may do nothing else here may still report it, so the
  // menu is drawn for them too.
  if (!canEdit && !canSubscribe && !canDelete && !report.canReport) {
    return null;
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
        {canEditPhotos &&
          <MenuItem
            onClick={() => {
              handleClose();
              setIsEditingPhotos(true);
            }}
          >
            {i18n.t('photos:editor.edit')}
          </MenuItem>}
        {isSubscribable(medium) &&
          <NotificationSubActionWithRef
            medium={medium}
            isSubscribedByViewer={medium.isSubscribedByViewer}
            key={`medium-notification-${medium.id}`}
          />}
        {canSetReplies &&
          <MenuItem
            onClick={() => {
              handleClose();
              setIsSettingReplies(true);
            }}
          >
            {i18n.t('replies:access.menu')}
          </MenuItem>}
        <DeleteActionWithRef
          node={medium}
          key={`medium-delete-${medium.id}`}
          redirect={inline ? '' : getURL(medium.owner)}
          component="menuitem"
          confirmMessage={i18n.t('media:confirm.delete')}
        />
        {report.canReport &&
          <MenuItem
            onClick={() => {
              handleClose();
              report.open();
            }}
          >
            {i18n.t('abuseReports:report')}
          </MenuItem>}
      </Menu>
      {report.dialog}
      {canSetReplies &&
        <ControlReplyAccess
          medium={medium}
          open={isSettingReplies}
          onClose={() => {
            setIsSettingReplies(false);
          }}
        />}
      {canEditPhotos &&
        <PhotoFilesDialog
          medium={medium}
          open={isEditingPhotos}
          onClose={() => {
            setIsEditingPhotos(false);
          }}
        />}
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
