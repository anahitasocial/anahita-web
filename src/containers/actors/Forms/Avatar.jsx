import React, { useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import UploadIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import ViewIcon from '@mui/icons-material/ZoomInOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import MenuItemLabel from '../../../components/MenuItemLabel';
import NodeType from '../../../proptypes/Node';
import utils from '../../../utils';
import i18n from '../../../languages';

const { getActorName, getActorInitials } = utils.node;

const styles = (theme) => {
  return {
    largeAvatar: {
      width: theme.spacing(20),
      height: theme.spacing(20),
      fontSize: 48,
    },
    smallAvatar: {
      width: theme.spacing(3),
      height: theme.spacing(3),
      fontSize: 12,
    },
    defaultAvatar: {
      width: theme.spacing(6),
      height: theme.spacing(6),
      fontSize: 20,
    },
    avatar: {
      backgroundColor: theme.palette.background.paper,
      borderColor: theme.palette.background.paper,
      borderWidth: 4,
      borderStyle: 'solid',
    },
    button: {
      position: 'relative',
      width: theme.spacing(15),
      height: theme.spacing(15),
      zIndex: 1,
    },
    input: {
      display: 'none',
    },
  };
};

const ActorAvatarForm = ({
  classes,
  node,
  avatar = null,
  anchorEl = null,
  isFetching = false,
  canEdit = false,
  handleOpen,
  handleClose,
  handleFieldChange,
  handleDelete,
  size = 'default',
  prominent = false,
  viewable = false,
}) => {
  const [viewing, setViewing] = useState(false);
  const initials = getActorInitials(node);

  // Whether the picture can be seen larger: by pressing it, or for somebody
  // who can change it, from the menu it opens.
  const canView = viewable && Boolean(avatar);

  // On a profile the circle stands over the cover, and its white edge is
  // what sets it off. On a plain card, as in signing up, that is white on
  // white: there it is solid grey with the initials in white, so it is
  // plainly the thing to press. `&&` so that it wins over the white of the
  // class above.
  const prominentLook = prominent ? {
    '&&': {
      backgroundColor: 'grey.500',
      color: 'common.white',
      borderColor: 'grey.500',
    },
  } : undefined;

  // With no picture, the circle is filled in grey, a shade off the card in
  // light mode and dark, so that it is plainly a picture's place and not a
  // gap with two letters floating in it.
  const emptyLook = !prominent && !avatar && !isFetching ? {
    '&&': {
      backgroundColor: (theme) => {
        return theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300];
      },
      color: 'text.secondary',
    },
  } : undefined;

  return (
    <>
      <IconButton
        color="primary"
        component="span"
        className={classes.button}
        disabled={!(canEdit || canView) || isFetching}
        onClick={canEdit ? handleOpen : () => { setViewing(true); }}
        size="large"
      >
        <Avatar
          aria-label={getActorName(node)}
          className={clsx(classes[`${size}Avatar`], classes.avatar)}
          sx={prominentLook || emptyLook}
          alt={getActorName(node)}
          src={isFetching ? '' : avatar}
        >
          {!isFetching && !avatar && initials}
          {isFetching && <CircularProgress />}
        </Avatar>
      </IconButton>

      {/* The picture alone over the page, as wide as the largest size kept:
      a Dialog's paper made clear, so that there is nothing around it. */}
      {canView &&
        <Dialog
          open={viewing}
          onClose={() => { setViewing(false); }}
          maxWidth={false}
          slotProps={{
            paper: {
              'aria-label': getActorName(node),
              sx: {
                bgcolor: 'transparent',
                backgroundImage: 'none',
                boxShadow: 'none',
                m: 2,
                maxWidth: 'calc(100% - 32px)',
                overflow: 'visible',
              },
            },
          }}
        >
          <Box
            component="img"
            src={avatar}
            alt={getActorName(node)}
            sx={{
              display: 'block',
              width: 480,
              maxWidth: '100%',
              maxHeight: 'calc(100dvh - 32px)',
              objectFit: 'contain',
              borderRadius: 2,
            }}
          />
          <IconButton
            aria-label={i18n.t('actions:close')}
            onClick={() => { setViewing(false); }}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'common.white',
              bgcolor: 'rgba(0, 0, 0, 0.56)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.72)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Dialog>}

      <Menu
        id="avatar-add-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {canView &&
          <MenuItem
            onClick={() => {
              handleClose();
              setViewing(true);
            }}
          >
            <MenuItemLabel icon={<ViewIcon fontSize="small" />}>
              {i18n.t('actions:view')}
            </MenuItemLabel>
          </MenuItem>}
        {/* The whole row is the file's label, so that all of it opens the
        picker; Delete only when there is a picture to delete. */}
        <MenuItem component="label" htmlFor="selectAvatarFile">
          <input
            accept="image/*"
            className={classes.input}
            id="selectAvatarFile"
            type="file"
            disabled={!canEdit || isFetching}
            onChange={handleFieldChange}
          />
          <MenuItemLabel icon={<UploadIcon fontSize="small" />}>
            {i18n.t('actions:upload')}
          </MenuItemLabel>
        </MenuItem>
        {avatar &&
          <MenuItem onClick={handleDelete}>
            <MenuItemLabel icon={<DeleteIcon fontSize="small" />}>
              {i18n.t('actions:delete')}
            </MenuItemLabel>
          </MenuItem>}
      </Menu>
    </>
  );
};

ActorAvatarForm.propTypes = {
  classes: PropTypes.object.isRequired,
  node: NodeType.isRequired,
  avatar: PropTypes.string,
  anchorEl: PropTypes.object,
  isFetching: PropTypes.bool,
  canEdit: PropTypes.bool,
  handleOpen: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleFieldChange: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  size: PropTypes.oneOf(['small', 'large', 'default']),
  // Drawn to stand out on a plain card, as in signing up.
  prominent: PropTypes.bool,
  // Whether the picture may be seen larger: not
  // on a profile they have blocked, where it is blurred.
  viewable: PropTypes.bool,
};

export default withStyles(ActorAvatarForm, styles);
