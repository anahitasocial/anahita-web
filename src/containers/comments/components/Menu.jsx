import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import i18n from '../../../languages';
import utils from '../../../utils';

import ControlFollow from '../../controls/Follow';
import ControlBlock from '../../controls/Block';
import ControlDelete from '../../controls/comment/Delete';
import useReport from '../../reports/useReport';

import PersonType from '../../../proptypes/Person';
import CommentType from '../../../proptypes/Comment';

const { withRef } = utils.component;

const FollowActionWithRef = withRef(ControlFollow);
const BlockActionActionWithRef = withRef(ControlBlock);
const DeleteActionWithRef = withRef(ControlDelete);

const CommentMenu = ({
  comment,
  viewer,
  handleEdit,
  inline = false,
}) => {
  const canEdit = Boolean(comment.authorized.edit);
  const canDelete = Boolean(comment.authorized.delete);
  const { author } = comment;
  const report = useReport(viewer, comment);

  const [menuAnchorEl, setAnchorEl] = React.useState(null);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        aria-owns={menuAnchorEl ? `comment-card-menu-${comment.id}` : undefined}
        aria-haspopup="true"
        onClick={handleOpenMenu}
        size="large"
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id={`comment-menu-${comment.id}`}
        anchorEl={menuAnchorEl}
        keepMounted
        open={Boolean(menuAnchorEl)}
        onClose={handleClose}
      >
        {canEdit &&
          <MenuItem
            onClick={handleEdit}
            key={`comment-edit-${comment.id}`}
          >
            {i18n.t('actions:edit')}
          </MenuItem>}
        {author && author.id !== viewer.id &&
          <BlockActionActionWithRef
            actor={author}
            component="menuitem"
            key={`comment-block-${comment.id}`}
            followLabel={i18n.t('comments:actions.followAuthor', {
              name: author.name,
            })}
            unfollowLabel={i18n.t('comments:actions.unfollowAuthor', {
              name: author.name,
            })}
          />}
        {author && author.id !== viewer.id && false &&
          <FollowActionWithRef
            actor={author}
            component="menuitem"
            key={`comment-follow-${comment.id}`}
            followLabel={i18n.t('comments:actions.followAuthor', {
              name: author.name,
            })}
            unfollowLabel={i18n.t('comments:actions.unfollowAuthor', {
              name: author.name,
            })}
          />}
        {canDelete &&
          <DeleteActionWithRef
            comment={comment}
            key={`comment-delete-${comment.id}`}
            inline={inline}
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

CommentMenu.propTypes = {
  comment: CommentType.isRequired,
  viewer: PersonType.isRequired,
  handleEdit: PropTypes.func.isRequired,
  inline: PropTypes.bool,
};

export default CommentMenu;
