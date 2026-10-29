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
import useActorRules from './useRules';
import i18n from '../../../languages';
import eventDetails from '../../../utils/events';
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
  feed = null,
  replies = null,
  reposts = null,
  tagged = null,
  events = null,
  onTabChange = null,
  locations = null,
  tabPanels = {},
  mentions = null,
  selectedTab = null,
}) => {
  const namespace = getNamespace(actor);
  // A group's or an event's rules, for its About card (roadmap row 102).
  const rules = useActorRules(actor);
  const hasRules = Boolean(rules && rules.items && rules.items.length > 0);
  // What a person posted and reposted, what they chose to put out, comes
  // first; then the lists of each kind (notes, articles, photos); then
  // their replies, and the photos and videos they are in (roadmap row
  // 103), which are other people's posts (the user, 2026-10-28). Only
  // people reply, repost and are tagged, so a group or any other kind of
  // actor has Posts alone. Nor somebody on another server: their replies
  // and reposts are not taken in from there.
  const hasOwnWords = utils.node.isPerson(actor) && !utils.federation.isRemote(actor);
  const featureList = getActorFeatureTabs(actor);
  const ownTabs = hasOwnWords && featureList.includes('feed') ?
    [
      ...featureList.flatMap((tab) => { return tab === 'feed' ? ['feed', 'reposts'] : [tab]; }),
      'replies',
      'tagged',
    ] :
    featureList;
  // A group has the events it hosts, after what it has posted.
  const featureTabs = events ? [...ownTabs, 'events'] : ownTabs;
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
    if (tab === 'replies' || tab === 'reposts' || tab === 'tagged') {
      return i18n.t(`replies:tabs.${tab}`);
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
          aria-label={i18n.t('actor:tabs')}
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

      {value === 'feed' && (
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
              {(actor.body || actor.websiteUrl || eventDetails.hasWhere(actor) ||
                utils.federation.isRemote(actor) || hasRules) && (
                <Grid size={12}>
                  <ActorBodyAbout actor={actor} rules={rules} />
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
            <Grid size={12}>
              {feed}
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* The whole width, like the lists of notes, articles and photos. */}
      {value === 'replies' && replies}
      {value === 'reposts' && reposts}
      {value === 'tagged' && tagged}
      {value === 'events' && events}

      {tabPanels[value] && tabPanels[value]}

      {actor.id === viewer.id && value === 'mentions' && mentions}
    </Box>
  );
};

ActorBody.propTypes = {
  classes: PropTypes.object.isRequired,
  actor: ActorType.isRequired,
  viewer: PersonType.isRequired,
  feed: PropTypes.node,
  // The profile's other two lists.
  replies: PropTypes.node,
  reposts: PropTypes.node,
  // On a person: the photos and videos they are in.
  tagged: PropTypes.node,
  // On a group: the events it hosts.
  events: PropTypes.node,
  // Called with the tab chosen, '' for the first one.
  onTabChange: PropTypes.func,
  locations: PropTypes.node,
  admins: PropTypes.node,
  tabPanels: PropTypes.objectOf(PropTypes.node),
  mentions: PropTypes.node,
  selectedTab: PropTypes.string,
};

export default withStyles(ActorBody, styles);
