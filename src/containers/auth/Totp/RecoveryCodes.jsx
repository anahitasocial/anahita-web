import React from 'react';
import { makeStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';

import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import i18n from '../../../languages';

const useStyles = makeStyles()((theme) => {
  return {
    list: {
      fontSize: 16,
      fontWeight: 600,
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    textBlock: {
      marginTop: theme.spacing(),
      marginBottom: theme.spacing(),
    },
  };
});

const TOTPRecoveryCodes = ({
  items: recoveryCodes = [],
}) => {
  const { classes } = useStyles();

  return (
    <>
      <Typography variant="h5" className={classes.textBlock}>
        {i18n.t('auth:totp.recoveryCodes.cTitle')}
      </Typography>
      <Typography variant="body2" className={classes.textBlock}>
        {i18n.t('auth:totp.recoveryCodes.cDesc')}
      </Typography>
      <Grid
        container
        direction="row"
        spacing={2}
        sx={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <Grid>
          <List>
            {recoveryCodes.map((rCode, index) => {
              const key = `recoveryCode-left-${index}`;
              if (index % 2 === 0) {
                return (
                  <ListItem key={key}>
                    <ListItemText primary={rCode} />
                  </ListItem>
                );
              }

              return null;
            })}
          </List>
        </Grid>
        <Grid>
          <List>
            {recoveryCodes.map((rCode, index) => {
              const key = `recoveryCode-right-${index}`;
              if (index % 2 !== 0) {
                return (
                  <ListItem key={key}>
                    <ListItemText primary={rCode} />
                  </ListItem>
                );
              }

              return null;
            })}
          </List>
        </Grid>
      </Grid>
      <Typography variant="body2" className={classes.textBlock}>
        {i18n.t('auth:totp.recoveryCodes.warning')}
      </Typography>
    </>
  );
};

TOTPRecoveryCodes.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string),
};

export default TOTPRecoveryCodes;
