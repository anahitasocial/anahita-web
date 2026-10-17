import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';

import TagType from '../../../../proptypes/Location';
import NodeType from '../../../../proptypes/Node';
import actions from '../../../../actions';
import i18n from '../../../../languages';
import { Medium as MEDIUM } from '../../../../constants';

const ControlsTagsLocationAdd = React.forwardRef((props, ref) => {
  const {
    addTag,
    alertError,
    node,
    tag,
    callback,
  } = props;

  const [isWaiting, setIsWaiting] = useState(false);

  return (
    <IconButton
      edge="end"
      aria-label="delete"
      ref={ref}
      onClick={() => {
        setIsWaiting(true);
        addTag(node, tag)
          .then(() => {
            setIsWaiting(false);
            callback();
          })
          .catch((err) => {
            setIsWaiting(false);
            const refusal = err && err.response && err.response.data;
            if (refusal && refusal.error === 'too_many_locations') {
              alertError(i18n.t('locations:add.full', { count: MEDIUM.MAX_LOCATIONS }));
              return;
            }
            console.error(err);
          });
      }}
      size="large"
    >
      {!isWaiting && <AddIcon />}
      {isWaiting && <CircularProgress size={20} />}
    </IconButton>
  );
});

ControlsTagsLocationAdd.propTypes = {
  addTag: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
  node: NodeType.isRequired,
  tag: TagType.isRequired,
  callback: PropTypes.func.isRequired,
};

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    addTag: (node, tag) => {
      return dispatch(actions.locationsGraph.add(node)(tag));
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ControlsTagsLocationAdd);
