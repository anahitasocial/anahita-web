import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MenuItem from '@mui/material/MenuItem';
import BlockIcon from '@mui/icons-material/BlockOutlined';

import DialogConfirm from '../../components/DialogConfirm';
import MenuItemLabel from '../../components/MenuItemLabel';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import NodeType from '../../proptypes/Node';
import utils from '../../utils';
import events from '../../utils/events';

const { getAuthor, getActorName } = utils.node;

// "Block from group", in the menu of a post in a group or an event, for
// whoever runs it: the group blocks whoever wrote the post, not the viewer.
// Shown only where the server says it may be done
// (`authorized.blockFromOwner`).
//
// What it does is said first: they can no longer see or take part in the
// group, and what they left in it is hidden from everybody.
const ControlsBlockFromOwner = React.forwardRef(({
  node,
  alertSuccess,
  alertError,
  onDone = null,
}, ref) => {
  const [waiting, setWaiting] = useState(false);
  const owner = node.owner || {};
  const author = getAuthor(node);
  const name = getActorName(owner);

  const handleBlock = () => {
    setWaiting(true);
    api.socialgraph.block({ actor: author, viewer: owner }).then(() => {
      alertSuccess(i18n.t('socialgraph:blockFromOwner.done', { name }));
      if (onDone) {
        onDone();
      }
    }).catch(() => {
      alertError(i18n.t('socialgraph:blockFromOwner.failed'));
    }).finally(() => {
      setWaiting(false);
    });
  };

  return (
    <DialogConfirm
      title={i18n.t('socialgraph:blockFromOwner.title', { name })}
      message={i18n.t('socialgraph:blockFromOwner.confirm', {
        person: getActorName(author),
        name,
      })}
      confirm={i18n.t('actions:block')}
    >
      <MenuItem onClick={handleBlock} disabled={waiting} ref={ref}>
        <MenuItemLabel icon={<BlockIcon fontSize="small" />}>
          {i18n.t(events.isEvent(owner) ?
            'socialgraph:blockFromOwner.actionEvent' :
            'socialgraph:blockFromOwner.action')}
        </MenuItemLabel>
      </MenuItem>
    </DialogConfirm>
  );
});

ControlsBlockFromOwner.propTypes = {
  node: NodeType.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
  // Told once the block is made.
  onDone: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(
  null,
  mapDispatchToProps,
  null,
  { forwardRef: true },
)(ControlsBlockFromOwner);
