import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import InboundsBrowse from './Browse';
import NodeType from '../../proptypes/Node';
import { App as APP } from '../../constants';
import i18n from '../../languages';

const {
  SORTING: {
    RECENT,
    RELEVANT,
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

// A hashtag's or a place's posts: newest first by default, as every list of
// posts is, or Most relevant, ranked as search ranks it (the user,
// 2026-10-17; Popular, an all-time sum, kept an old hit on top for good).
const Inbounds = ({
  selectedTab = RECENT,
  tag,
}) => {
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
        elevation={1}
      >
        <Tabs
          value={tab}
          onChange={changeTab}
          centered
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            label={i18n.t('search:sortOptions.recent')}
            value={RECENT}
          />
          <Tab
            label={i18n.t('search:sortOptions.relevant')}
            value={RELEVANT}
          />
        </Tabs>
      </AppBar>
      {useMemo(() => {
        return (<InboundsBrowse
          key={`inbound-tab-${tab}`}
          tag={tag}
          queryFilters={{
            q: '',
            sort: tab,
          }}
        />);
      }, [tab])}
    </>
  );
};

Inbounds.propTypes = {
  tag: NodeType.isRequired,
  selectedTab: PropTypes.oneOf([
    RECENT,
    RELEVANT,
  ]),
};

export default Inbounds;
