import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import assets from '../assets';

const {
  white: darkThemeLogo,
  color: lightThemeLogo,
} = assets.logo;

const useStyles = makeStyles((theme) => {
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

const Logo = () => {
  const classes = useStyles();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const src = prefersDarkMode ? darkThemeLogo : lightThemeLogo;

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

export default Logo;
