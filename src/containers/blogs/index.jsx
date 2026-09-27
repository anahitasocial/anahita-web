import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import BlogsBrowse from './Browse';
import { App as APP } from '../../constants';
import i18n from '../../languages';

const {
  SORTING: {
    UPDATED,
    RECENT,
  },
} = APP.BROWSE;

const useStyles = makeStyles()({
  root: {
    marginBottom: 8 * 2,
    position: 'sticky',
    top: 8 * 7,
    zIndex: 8,
  },
});

const Blogs = ({ selectedTab = RECENT }) => {
  const { classes } = useStyles();
  const [tab, setTab] = useState(selectedTab);

  const changeTab = (event, value) => {
    setTab(value);
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        className={classes.root}
        variant="outlined"
        elevation={0}
      >
        <Tabs
          value={tab}
          onChange={changeTab}
          centered
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={i18n.t('commons:sortByOptions.recent')} value={RECENT} />
          <Tab label={i18n.t('commons:sortByOptions.updated')} value={UPDATED} />
        </Tabs>
      </AppBar>
      {useMemo(() => {
        return (<BlogsBrowse
          key={`blog-tab-${tab}`}
          queryFilters={{
            q: '',
            sort: tab,
          }}
        />);
      }, [tab])}
    </>
  );
};

Blogs.propTypes = {
  selectedTab: PropTypes.oneOf([
    UPDATED,
    RECENT,
  ]),
};

const mapStateToProps = () => {
  return () => {
    return {};
  };
};

export default connect(
  mapStateToProps(),
)(Blogs);
