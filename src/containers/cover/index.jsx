import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import api from '../../api/cover';
import CoverForm from '../../components/CoverForm';
import NodeType from '../../proptypes/Node';
import actions from '../../actions';
import i18n from '../../languages';
import upload from '../../utils/upload';

const Cover = (props) => {
  const {
    node,
    canEdit,
    alertError,
  } = props;

  const [anchorEl, setAnchorEl] = useState(null);
  const [cover, setCover] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    const src = node.coverUrls && node.coverUrls.large && node.coverUrls.large.url;
    if (src) {
      setCover(src);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cover) {
      // eslint-disable-next-line no-undef
      const image = new Image();

      setIsLoading(true);
      image.src = cover;

      image.onload = () => {
        setIsLoading(false); // Image loaded successfully
      };

      image.onError = () => {
        setIsLoading(false); // Error loading image
      };
    }
  }, [cover]);

  const handleFieldChange = (event) => {
    const { files } = event.target;

    setAnchorEl(null);
    if (!files.length) {
      return;
    }

    setWaiting(true);
    api.add(node, files[0]).then((result) => {
      const { data } = result;
      setCover(data.large.url);
    }).catch((failure) => {
      // Said, and why: too large, not an image. A refused upload used to
      // leave the cover spinning for good with nothing to explain it.
      alertError(i18n.t(upload.refusalKey(failure)));
    }).finally(() => {
      setWaiting(false);
    });
  };

  const handleDelete = () => {
    setAnchorEl(null);
    setWaiting(true);
    api.deleteItem(node).then(() => {
      setCover(null);
    }).catch(() => {
      alertError(i18n.t('media:image.failed'));
    }).finally(() => {
      setWaiting(false);
    });
  };

  const handleOpen = (event) => {
    const { currentTarget } = event;
    setAnchorEl(currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <CoverForm
      isFetching={waiting || isLoading}
      node={node}
      cover={cover}
      anchorEl={anchorEl}
      canEdit={canEdit}
      handleOpen={handleOpen}
      handleClose={handleClose}
      handleFieldChange={handleFieldChange}
      handleDelete={handleDelete}
    />
  );
};

Cover.propTypes = {
  node: NodeType.isRequired,
  canEdit: PropTypes.bool.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(Cover);
