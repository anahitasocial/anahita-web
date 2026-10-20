import React from 'react';
import PropTypes from 'prop-types';

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/EditOutlined';
import PhotosIcon from '@mui/icons-material/PhotoLibraryOutlined';
import TagPeopleIcon from '@mui/icons-material/PersonAddOutlined';
import ActivityIcon from '@mui/icons-material/BarChartOutlined';
import RepliesIcon from '@mui/icons-material/ForumOutlined';
import ReportIcon from '@mui/icons-material/FlagOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import MenuItemLabel from '../../components/MenuItemLabel';

import permissions from '../../permissions/medium';
import utils from '../../utils';

import ControlNotificationSub from '../controls/medium/NotificationSub';
import ControlReplyAccess from '../controls/medium/ReplyAccess';
import ControlDelete from '../controls/Delete';
import ControlPin from '../controls/medium/Pin';
import ControlBlockFromOwner from '../controls/BlockFromOwner';
import ControlSave from '../controls/medium/Save';
import { DownloadSwitchMenuItem } from '../controls/medium/Download';
import PostActivity from '../activity/PostActivity';
import useReport from '../reports/useReport';
import PhotoFilesDialog from './PhotoFilesDialog';
import TagPeopleDialog from './TagPeopleDialog';

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
  const [isTagging, setIsTagging] = React.useState(false);
  const [isSettingReplies, setIsSettingReplies] = React.useState(false);
  const [isShowingActivity, setIsShowingActivity] = React.useState(false);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const canEdit = permissions.canEdit(viewer, medium);
  // Who can reply is the post's own setting, changed by whoever may edit
  // the post.
  // Not on a reply, which follows the post at the top of its thread.
  const canSetReplies = canEdit && isCommentable(medium) && !medium.rootId;
  // Pinning is the profile's: the server says whether this viewer may.
  const canPin = Boolean(medium.authorized && medium.authorized.pin);
  // Whoever runs the group it is in, or a site administrator, may block
  // its writer from there.
  const canBlockFromOwner = Boolean(medium.authorized && medium.authorized.blockFromOwner);
  const report = useReport(viewer, medium);
  // A photo post's images are changed in a dialog of their own: their
  // order, their descriptions, and which there are.
  const canEditPhotos = canEdit && getNamespace(medium) === 'photos';
  // Who is in a photo or a video is its author's to say (roadmap row 103).
  const canTagPeople = Boolean(viewer && medium.author && medium.author.id === viewer.id) &&
    ['photos', 'videos'].includes(getNamespace(medium)) && !utils.federation.isRemote(medium);

  // Somebody who may do nothing else here may still report it, so the
  // menu is drawn for them too.
  // Always drawn for a post: its activity is there for anybody who can
  // see it.

  return (
    <>
      <IconButton
        aria-owns={menuAnchorEl ? `medium-card-menu-${medium.id}` : undefined}
        aria-haspopup="true"
        aria-label={i18n.t('actions:more')}
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
        {utils.federation.isRemote(medium) && utils.federation.pageOf(medium) &&
          <MenuItem
            component="a"
            href={utils.federation.pageOf(medium)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
          >
            <MenuItemLabel icon={<OpenInNewIcon fontSize="small" />}>
              {i18n.t('federation:remote.viewOriginal', { domain: utils.federation.domainOf(medium) })}
            </MenuItemLabel>
          </MenuItem>}
        {handleEdit && !utils.federation.isRemote(medium) &&
          <MenuItem
            onClick={() => {
              handleEdit();
              handleClose();
            }}
            disabled={!canEdit}
          >
            <MenuItemLabel icon={<EditIcon fontSize="small" />}>
              {i18n.t('actions:edit')}
            </MenuItemLabel>
          </MenuItem>}
        {canEditPhotos &&
          <MenuItem
            onClick={() => {
              handleClose();
              setIsEditingPhotos(true);
            }}
          >
            <MenuItemLabel icon={<PhotosIcon fontSize="small" />}>
              {i18n.t('photos:editor.edit')}
            </MenuItemLabel>
          </MenuItem>}
        {canTagPeople &&
          <MenuItem
            onClick={() => {
              handleClose();
              setIsTagging(true);
            }}
          >
            <MenuItemLabel icon={<TagPeopleIcon fontSize="small" />}>
              {i18n.t('peopleTags:menu')}
            </MenuItemLabel>
          </MenuItem>}
        {isSubscribable(medium) &&
          <NotificationSubActionWithRef
            medium={medium}
            isSubscribedByViewer={medium.isSubscribedByViewer}
            key={`medium-notification-${medium.id}`}
          />}
        <MenuItem
          onClick={() => {
            handleClose();
            setIsShowingActivity(true);
          }}
        >
          <MenuItemLabel icon={<ActivityIcon fontSize="small" />}>
            {i18n.t('media:activity.title')}
          </MenuItemLabel>
        </MenuItem>
        <ControlSave
          medium={medium}
          onDone={handleClose}
          key={`post-save-${medium.id}`}
        />
        {canPin &&
          <ControlPin
            medium={medium}
            onDone={handleClose}
            key={`medium-pin-${medium.id}`}
          />}
        {canEdit &&
          <DownloadSwitchMenuItem
            medium={medium}
            onDone={handleClose}
            key={`medium-download-switch-${medium.id}`}
          />}
        {canSetReplies &&
          <MenuItem
            onClick={() => {
              handleClose();
              setIsSettingReplies(true);
            }}
          >
            <MenuItemLabel icon={<RepliesIcon fontSize="small" />}>
              {i18n.t('replies:access.menu')}
            </MenuItemLabel>
          </MenuItem>}
        <DeleteActionWithRef
          node={medium}
          key={`medium-delete-${medium.id}`}
          redirect={inline ? '' : getURL(medium.owner)}
          component="menuitem"
          confirmMessage={i18n.t('media:confirm.delete')}
        />
        {canBlockFromOwner &&
          <ControlBlockFromOwner
            node={medium}
            onDone={handleClose}
            key={`medium-block-from-owner-${medium.id}`}
          />}
        {report.canReport &&
          <MenuItem
            onClick={() => {
              handleClose();
              report.open();
            }}
          >
            <MenuItemLabel icon={<ReportIcon fontSize="small" />}>
              {i18n.t('abuseReports:report')}
            </MenuItemLabel>
          </MenuItem>}
      </Menu>
      {report.dialog}
      <PostActivity
        post={medium}
        open={isShowingActivity}
        onClose={() => {
          setIsShowingActivity(false);
        }}
      />
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
      {canTagPeople &&
        <TagPeopleDialog
          medium={medium}
          open={isTagging}
          onClose={() => {
            setIsTagging(false);
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
