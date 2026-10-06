import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import utils from '../../utils';
import i18n from '../../languages';

import ControlNotificationSub from '../controls/medium/NotificationSub';
import ControlDelete from '../controls/Delete';
import ControlFollow from '../controls/Follow';
import useReport from '../reports/useReport';

import PersonType from '../../proptypes/Person';
import NodeType from '../../proptypes/Node';
import permissions from '../../permissions';

const { withRef } = utils.component;
const {
  getOwnerName,
  isSubscribable,
  getURL,
} = utils.node;

const FollowActionWithRef = withRef(ControlFollow);
const NotificationSubActionWithRef = withRef(ControlNotificationSub);
const DeleteActionWithRef = withRef(ControlDelete);

const FeedItemMenu = ({
  node,
  viewer,
}) => {
  const [menuAnchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const ownerName = getOwnerName(node);
  const { id } = node;
  const canSubscribe = node.id && isSubscribable(node);
  const canFollow = permissions.actor.canFollow(node.owner, viewer);
  // Whether the viewer may edit and remove the post is the server's
  // answer, sent with it in the feed as on its own page.
  const canEdit = permissions.medium.canEdit(viewer, node);
  const canDelete = permissions.medium.canDelete(viewer, node);
  const report = useReport(viewer, node);

  if (!canSubscribe && !canFollow && !canEdit && !canDelete && !report.canReport) {
    return null;
  }

  return (
    <>
      <IconButton
        aria-owns={menuAnchorEl ? `node-card-menu-${id}` : undefined}
        aria-haspopup="true"
        onClick={handleOpenMenu}
        size="large"
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id={`node-menu-${id}`}
        anchorEl={menuAnchorEl}
        keepMounted
        open={Boolean(menuAnchorEl)}
        onClose={handleClose}
      >
        {canFollow &&
          <FollowActionWithRef
            actor={node.owner}
            component="menuitem"
            key={`feed-follow-${id}`}
            followLabel={i18n.t('feed:actions.followOwner', {
              name: ownerName,
            })}
            unfollowLabel={i18n.t('feed:actions.unfollowOwner', {
              name: ownerName,
            })}
          />}
        {canSubscribe &&
          <NotificationSubActionWithRef
            medium={node}
            isSubscribedByViewer={node.isSubscribedByViewer}
            key={`feed-notification-${id}`}
          />}
        {/* Editing is done on the post's own page, which is opened with
            its form already up. */}
        {canEdit &&
          <MenuItem
            onClick={() => {
              handleClose();
              navigate(`${getURL(node)}?edit=1`);
            }}
          >
            {i18n.t('actions:edit')}
          </MenuItem>}
        {canDelete &&
          <DeleteActionWithRef
            node={node}
            key={`feed-delete-${id}`}
            component="menuitem"
            confirmMessage={i18n.t('media:confirm.delete')}
          />}
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
    </>
  );
};

FeedItemMenu.propTypes = {
  node: NodeType.isRequired,
  viewer: PersonType.isRequired,
};

export default FeedItemMenu;
