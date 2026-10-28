import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import assets from '../assets';
import siteLogo from '../utils/siteLogo';

const useStyles = makeStyles()((theme) => {
  return {
    logo: {
      backgroundColor: theme.palette.background.paper,
      borderColor: theme.palette.background.paper,
      borderWidth: 1,
      borderStyle: 'solid',
      width: theme.spacing(6),
      height: theme.spacing(6),
    },
  };
});

// The site's logo at the top of the menu: the server's (SITE_LOGO_URL) when
// it gives one, else the active theme's.
const Logo = ({ nodeInfo = null }) => {
  const { classes } = useStyles();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const src = siteLogo(nodeInfo, assets.logo, prefersDarkMode);

  return (
    <IconButton href="/" size="small">
      <Avatar
        src={src}
        alt={process.env.REACT_APP_NAME}
        className={classes.logo}
      />
    </IconButton>
  );
};

Logo.propTypes = {
  nodeInfo: PropTypes.object,
};

const mapStateToProps = (state) => {
  return {
    nodeInfo: state.app.nodeInfo,
  };
};

export default connect(mapStateToProps)(Logo);
