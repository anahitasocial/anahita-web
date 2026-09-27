import React from 'react';
import { makeStyles } from 'tss-react/mui';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';

const useStyles = makeStyles()((theme) => {
  return {
    progress: {
      margin: theme.spacing(1),
    },
  };
});

const Progress = () => {
  const { classes } = useStyles();
  return (
    <Grid
      container
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Grid>
        <CircularProgress className={classes.progress} />
      </Grid>
    </Grid>
  );
};

export default Progress;
