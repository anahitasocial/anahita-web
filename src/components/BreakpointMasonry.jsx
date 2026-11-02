import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import Masonry from 'react-masonry-css';

const useStyles = makeStyles()((theme) => {
  return {
    masonryGrid: {
      display: 'flex',
      marginLeft: theme.spacing(-2),
      width: 'inherit',
    },
    masonryColumn: {
      paddingLeft: theme.spacing(2),
      backgroundClip: 'padding-box',
    },
  };
});

const FixedColumnsContext = createContext(null);

// Any list inside this has `count` columns, however wide the window: a
// profile's lists when they sit beside its details.
export const FixedColumns = ({ count, children }) => {
  return (
    <FixedColumnsContext.Provider value={count}>
      {children}
    </FixedColumnsContext.Provider>
  );
};

FixedColumns.propTypes = {
  count: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired,
};

const BreakpointMasonry = (params) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const { children } = params;
  const fixedColumns = useContext(FixedColumnsContext);

  const breakpointCols = {
    default: 3,
    [theme.breakpoints.values.xl]: 3,
    [theme.breakpoints.values.lg]: 3,
    [theme.breakpoints.values.md]: 1,
    [theme.breakpoints.values.sm]: 1,
    [theme.breakpoints.values.xs]: 1,
  };

  return (
    <Masonry
      breakpointCols={fixedColumns || breakpointCols}
      className={classes.masonryGrid}
      columnClassName={classes.masonryColumn}
    >
      {children}
    </Masonry>
  );
};

export default BreakpointMasonry;
