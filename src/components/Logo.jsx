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
    // The logo as it is drawn: no fill and no border of our own, which
    // showed as a white ring round it on the coloured top bar of a mobile,
    // through the clear margin a logo's image has (the user, 2026-11-23).
    logo: {
      backgroundColor: 'transparent',
      width: theme.spacing(6),
      height: theme.spacing(6),
    },
  };
});

// The site's logo at the top of the menu: the server's (SITE_LOGO_URL) when
// it gives one, else the active theme's.
//
// `size` is the circle's, in pixels: 40 in a mobile's top bar, 8 pixels
// clear of its top and its foot.
const Logo = ({ nodeInfo = null, size = 48 }) => {
  const { classes } = useStyles();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const src = siteLogo(nodeInfo, assets.logo, prefersDarkMode);

  return (
    <IconButton href="/" size="small">
      <Avatar
        src={src}
        alt={process.env.REACT_APP_NAME}
        className={classes.logo}
        style={{ width: size, height: size }}
      />
    </IconButton>
  );
};

Logo.propTypes = {
  nodeInfo: PropTypes.object,
  size: PropTypes.number,
};

const mapStateToProps = (state) => {
  return {
    nodeInfo: state.app.nodeInfo,
  };
};

export default connect(mapStateToProps)(Logo);
