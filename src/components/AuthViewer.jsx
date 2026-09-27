import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

import ViewerType from '../proptypes/Viewer';
import utils from '../utils';
import i18n from '../languages';
import actions from '../actions';

const {
  getActorInitials,
  getAvatarURL,
} = utils.node;

const styles = () => {
  return {
    avatarContent: {
      flex: '1 1 auto',
    },
    avatar: {
      fontSize: 16,
    },
  };
};

const AuthViewer = ({
  classes,
  viewer = {},
  isAuthenticated = false,
  login,
}) => {
  const profile = `/people/${viewer.alias}/`;
  const initials = getActorInitials(viewer);
  const avatar = getAvatarURL(viewer);

  return (
    <>
      {!isAuthenticated && !viewer.id &&
      <Button
        onClick={() => {
          login();
        }}
        color="inherit"
        variant="outlined"
      >
        {i18n.t('actions:login')}
      </Button>}
      {viewer.id &&
        <IconButton
          href={profile}
          color="inherit"
          size="small"
        >
          <div className={classes.avatarContent}>
            <Avatar
              alt={viewer.alias}
              src={avatar || undefined}
              className={classes.avatar}
            >
              {initials}
            </Avatar>
          </div>
        </IconButton>}
    </>
  );
};

AuthViewer.propTypes = {
  classes: PropTypes.object.isRequired,
  viewer: ViewerType,
  isAuthenticated: PropTypes.bool,
  login: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const {
    isAuthenticated,
    success,
    error,
    isFetching,
  } = state.session;

  return {
    isAuthenticated,
    success,
    error,
    isFetching,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    login: () => {
      return dispatch(actions.session.add());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(AuthViewer, styles));
