import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import BlockIcon from '@mui/icons-material/BlockOutlined';

import MenuItemLabel from '../../components/MenuItemLabel';

import actions from '../../actions/socialgraph';
import PersonType from '../../proptypes/Person';
import i18n from '../../languages';

const ControlsBlock = React.forwardRef(({
  blockPerson,
  unblockPerson,
  actor,
  component = 'button',
  blockLabel = i18n.t('actions:block'),
  unblockLabel = i18n.t('actions:unblock'),
  viewer,
  onChange = null,
  buttonProps = {},
}, ref) => {
  const [blocked, setBlocked] = useState(Boolean(actor.isBlockedByViewer));
  const [waiting, setWaiting] = useState(false);

  // As the profile says, when it is read again.
  useEffect(() => {
    setBlocked(Boolean(actor.isBlockedByViewer));
  }, [actor.id, actor.isBlockedByViewer]);

  const handleBlock = () => {
    setWaiting(true);
    blockPerson({ actor, viewer })
      .then(() => {
        setWaiting(false);
        setBlocked(true);
        if (onChange) {
          onChange(true);
        }
      });
  };

  const handleUnblock = () => {
    setWaiting(true);
    unblockPerson({ actor, viewer })
      .then(() => {
        setWaiting(false);
        setBlocked(false);
        if (onChange) {
          onChange(false);
        }
      });
  };

  const title = blocked ? unblockLabel : blockLabel;
  const onClick = blocked ? handleUnblock : handleBlock;
  const color = blocked ? 'secondary' : 'inherit';

  if (component === 'menuitem') {
    return (
      <MenuItem
        onClick={onClick}
        disabled={waiting}
        ref={ref}
      >
        <MenuItemLabel icon={<BlockIcon fontSize="small" />}>
          {title}
        </MenuItemLabel>
      </MenuItem>
    );
  }

  return (
    <Button
      onClick={onClick}
      disabled={waiting}
      color={color}
      ref={ref}
      {...buttonProps}
    >
      {title}
    </Button>
  );
});

ControlsBlock.propTypes = {
  blockPerson: PropTypes.func.isRequired,
  unblockPerson: PropTypes.func.isRequired,
  actor: PropTypes.object.isRequired,
  component: PropTypes.oneOf(['button', 'menuitem']),
  blockLabel: PropTypes.string,
  unblockLabel: PropTypes.string,
  viewer: PersonType.isRequired,
  // Told, with whether they are blocked now, once it is done: the profile
  // is read again, so that everything on the page says the same.
  onChange: PropTypes.func,
  // For the button: its width and look where it stands alone.
  buttonProps: PropTypes.object,
};

const mapStateToProps = (state) => {
  const {
    viewer,
  } = state.session;

  return {
    viewer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    blockPerson: (param) => {
      return dispatch(actions.block(param));
    },
    unblockPerson: (param) => {
      return dispatch(actions.unblock(param));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ControlsBlock);
