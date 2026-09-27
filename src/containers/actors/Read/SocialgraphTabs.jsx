import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import i18n from '../../../languages';

const styles = (theme) => {
  return {
    root: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    appBar: {
      marginBottom: theme.spacing(2),
    },
  };
};

const SocialgraphTabs = ({
  classes,
  followers = null,
  leaders = null,
  mutuals = null,
  blocks = null,
  selectedTab = 'followers',
}) => {
  const [value, setValue] = React.useState(selectedTab);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box className={classes.root}>
      <AppBar
        position="sticky"
        color="inherit"
        className={classes.appBar}
        variant="outlined"
      >
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="Socialgraph Tabs"
        >
          <Tab label={i18n.t('socialgraph:followers')} value="followers" id="socialgraph-tab-followers" />
          {leaders && <Tab label={i18n.t('socialgraph:leaders')} value="leaders" id="socialgraph-tab-leaders" />}
          {mutuals && <Tab label={i18n.t('socialgraph:mutuals')} value="mutuals" id="socialgraph-tab-mutuals" />}
          {blocks && <Tab label={i18n.t('socialgraph:blocks')} value="blocks" id="socialgraph-tab-blocks" />}
        </Tabs>
      </AppBar>
      {value === 'followers' && followers}
      {value === 'leaders' && leaders}
      {value === 'mutuals' && mutuals}
      {value === 'blocks' && blocks}
    </Box>
  );
};

SocialgraphTabs.propTypes = {
  classes: PropTypes.object.isRequired,
  followers: PropTypes.node,
  leaders: PropTypes.node,
  mutuals: PropTypes.node,
  blocks: PropTypes.node,
  selectedTab: PropTypes.oneOf(['followers', 'leaders', 'mutuals', 'blocks']),
};

export default withStyles(styles)(SocialgraphTabs);
