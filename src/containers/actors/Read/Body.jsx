import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import ActorType from '../../../proptypes/Actor';
import PersonType from '../../../proptypes/Person';
import ActorBodyAbout from './About';
import i18n from '../../../languages';
import utils from '../../../utils';

const { getNamespace, getActorFeatureTabs } = utils.node;

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

const ActorBody = ({
  classes,
  actor,
  viewer,
  admins = null,
  composers = null,
  feed = null,
  replies = null,
  reposts = null,
  onTabChange = null,
  locations = null,
  socialgraph = null,
  tabPanels = {},
  mentions = null,
  selectedTab = null,
}) => {
  const namespace = getNamespace(actor);
  // The profile's own lists come first: what was posted on it, what its
  // owner replied, and what they reposted. The last two are the feed asked
  // for differently, so they are there wherever the feed is.
  const featureTabs = getActorFeatureTabs(actor).flatMap((tab) => {
    return tab === 'feed' ? ['feed', 'replies', 'reposts'] : [tab];
  });
  const defaultTab = featureTabs[0] || 'feed';
  const known = (tab) => {
    return featureTabs.includes(tab) ? tab : defaultTab;
  };

  const [value, setValue] = useState(known(selectedTab));

  // The tab is in the address, so it can be linked to and survives a
  // reload. Going back or forward changes the address without this
  // component being made again.
  useEffect(() => {
    setValue(known(selectedTab));
  }, [selectedTab, actor.id]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (onTabChange) {
      onTabChange(newValue === defaultTab ? '' : newValue);
    }
  };

  const getTabLabel = (tab) => {
    if (tab === 'feed') {
      return i18n.t('replies:tabs.posts');
    }
    if (tab === 'replies' || tab === 'reposts') {
      return i18n.t(`replies:tabs.${tab}`);
    }
    if (tab === 'socialgraph') {
      return i18n.t('socialgraph:mTitle');
    }
    return i18n.t(`${tab}:mTitle`);
  };

  return (
    <Box className={classes.root}>
      <AppBar
        position="static"
        color="default"
        className={classes.appBar}
        elevation={1}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Profile Tabs"
        >
          {featureTabs.map((tab) => {
            return (
              <Tab
                label={getTabLabel(tab)}
                value={tab}
                key={`${namespace}-${tab}-tab`}
              />
            );
          })}
        </Tabs>
      </AppBar>

      {['feed', 'replies', 'reposts'].includes(value) && (
        <Grid
          container
          spacing={2}
          direction="row"
          sx={{
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          }}
        >
          <Grid size={{ xs: 12, md: 4 }}>
            <Grid container spacing={2}>
              {actor.body && (
                <Grid size={12}>
                  <ActorBodyAbout actor={actor} />
                </Grid>
              )}
              {admins && (
                <Grid size={12}>
                  {admins}
                </Grid>
              )}
              {locations && (
                <Grid size={12}>
                  {locations}
                </Grid>
              )}
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            {value === 'feed' &&
              <Grid size={12}>
                {composers}
              </Grid>}
            <Grid size={12}>
              {value === 'feed' && feed}
              {value === 'replies' && replies}
              {value === 'reposts' && reposts}
            </Grid>
          </Grid>
        </Grid>
      )}

      {value === 'socialgraph' && socialgraph}

      {tabPanels[value] && tabPanels[value]}

      {actor.id === viewer.id && value === 'mentions' && mentions}
    </Box>
  );
};

ActorBody.propTypes = {
  classes: PropTypes.object.isRequired,
  actor: ActorType.isRequired,
  viewer: PersonType.isRequired,
  composers: PropTypes.node,
  feed: PropTypes.node,
  // The profile's other two lists.
  replies: PropTypes.node,
  reposts: PropTypes.node,
  // Called with the tab chosen, '' for the first one.
  onTabChange: PropTypes.func,
  locations: PropTypes.node,
  admins: PropTypes.node,
  socialgraph: PropTypes.node,
  tabPanels: PropTypes.objectOf(PropTypes.node),
  mentions: PropTypes.node,
  selectedTab: PropTypes.string,
};

export default withStyles(ActorBody, styles);
