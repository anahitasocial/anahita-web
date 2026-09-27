import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../../api/avatar';
import AvatarForm from '../Forms/Avatar';
import NodeType from '../../../proptypes/Node';

const ActorsAvatar = (props) => {
  const {
    node,
    canEdit,
    onChange = () => {},
  } = props;

  const [anchorEl, setAnchorEl] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    const src = node.avatarUrls && node.avatarUrls.large && node.avatarUrls.large.url;
    if (src) {
      setAvatar(src);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (avatar) {
      // eslint-disable-next-line no-undef
      const image = new Image();

      setIsLoading(true);
      image.src = avatar;

      image.onload = () => {
        setIsLoading(false); // Image loaded successfully
      };

      image.onError = () => {
        setIsLoading(false); // Error loading image
      };
    }
  }, [avatar]);

  const handleFieldChange = (event) => {
    const { files } = event.target;

    setAnchorEl(null);
    if (!files.length) {
      return;
    }

    setWaiting(true);
    api.add(node, files[0])
      .then((result) => {
        const { data } = result;
        setAvatar(data.large.url);
        onChange(data);
      })
      // Stop spinning either way. On a failed upload the avatar was left
      // spinning for good, with nothing to say the upload had not happened.
      .catch(() => {})
      .then(() => { setWaiting(false); });
  };

  const handleDelete = () => {
    setAnchorEl(null);
    setWaiting(true);
    api.deleteItem(node)
      .then(() => {
        setAvatar(null);
        onChange(null);
      })
      .catch(() => {})
      .then(() => { setWaiting(false); });
  };

  const handleOpen = (event) => {
    const { currentTarget } = event;
    setAnchorEl(currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AvatarForm
      isFetching={waiting || isLoading}
      node={node}
      avatar={avatar}
      anchorEl={anchorEl}
      canEdit={canEdit}
      handleOpen={handleOpen}
      handleClose={handleClose}
      handleFieldChange={handleFieldChange}
      handleDelete={handleDelete}
      size="large"
    />
  );
};

ActorsAvatar.propTypes = {
  node: NodeType.isRequired,
  canEdit: PropTypes.bool.isRequired,
  // Called with the new image URLs after an upload, and with null after a
  // delete. Onboarding re-reads the session on it, so the viewer's avatar
  // updates everywhere without a reload.
  onChange: PropTypes.func,
};

export default ActorsAvatar;
