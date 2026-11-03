import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import ActorType from '../../../proptypes/Actor';
import PersonType from '../../../proptypes/Person';
import { FixedColumns } from '../../../components/BreakpointMasonry';
import SideTabs, {
  listSx, sideTabSx, sideTabsSx, sideWidth, useStickyColumn, useTabbedList,
} from '../../../components/SideTabs';
import ActorBodyAbout from './About';
import ActorPhotos from './Photos';
import useActorRules from './useRules';
import tabIcon from './tabIcons';
import i18n from '../../../languages';
import eventDetails from '../../../utils/events';
import permissions from '../../../permissions/actor';
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
  feedView,
}) => {
  const namespace = getNamespace(actor);
  // A group's or an event's rules, for its About card (roadmap row 102).
  const rules = useActorRules(actor);
  const hasRules = Boolean(rules && rules.items && rules.items.length > 0);
  // None yet: its administrators are asked to add some, in the About card.
  const addRules = rules && !hasRules && permissions.canAdminister(actor) ?
    `${utils.node.getKindURL(actor)}settings` :
    '';
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

  const [listRef, startList] = useTabbedList();

  const handleChange = (event, newValue) => {
    setValue(newValue);
    startList();
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

  const { columns, sideTabs } = feedView;

  // In columns the details stay beside the posts alone.
  const besidePosts = columns && value === 'feed';
  const [detailsRef, detailsTop] = useStickyColumn(sideTabs || besidePosts);

  const hasAbout = actor.body || actor.websiteUrl || eventDetails.hasWhere(actor) ||
    utils.federation.isRemote(actor) || hasRules || addRules;

  // What the profile says about itself: the first items in columns, and
  // otherwise beside its posts or above them. Who looks after it (a
  // group's admins, an event's hosts) right after its About card.
  const details = [
    hasAbout && <ActorBodyAbout key="about" actor={actor} rules={rules} addRules={addRules} />,
    admins && <Box key="admins">{admins}</Box>,
    featureTabs.includes('photos') && (
      <ActorPhotos
        key="photos"
        actor={actor}
        onSeeAll={(event) => {
          handleChange(event, 'photos');
          window.scrollTo({ top: 0 });
        }}
      />
    ),
    locations && <Box key="locations">{locations}</Box>,
  ].filter(Boolean);

  const tabList = (
    <Tabs
      value={value}
      onChange={handleChange}
      orientation={sideTabs ? 'vertical' : 'horizontal'}
      indicatorColor="primary"
      textColor="primary"
      variant="scrollable"
      scrollButtons="auto"
      aria-label={i18n.t('actor:tabs')}
      sx={sideTabs ? sideTabsSx : null}
    >
      {featureTabs.map((tab) => {
        return (
          <Tab
            label={getTabLabel(tab)}
            icon={tabIcon(tab)}
            iconPosition="start"
            value={tab}
            key={`${namespace}-${tab}-tab`}
            sx={sideTabs ? sideTabSx : { minHeight: 48 }}
          />
        );
      })}
    </Tabs>
  );

  const posts = feed && (columns ? React.cloneElement(feed, { columns }) : feed);

  const panel = (
    <>
      {value === 'feed' && posts}
      {value === 'replies' && replies}
      {value === 'reposts' && reposts}
      {value === 'tagged' && tagged}
      {value === 'events' && events}

      {tabPanels[value] && tabPanels[value]}

      {actor.id === viewer.id && value === 'mentions' && mentions}
    </>
  );

  const detailsColumn = (
    <Stack
      ref={detailsRef}
      spacing={2}
      sx={{ position: 'sticky', top: detailsTop, minWidth: 0 }}
    >
      {details}
    </Stack>
  );

  // One post under another: the details, the feed, and the tabs beside it.
  // The feed's column is 600 wide on the widest page there is. On a narrower
  // one the details give way first, down to a width they can still be read at.
  if (sideTabs) {
    return (
      <Box
        className={classes.root}
        sx={{
          display: 'grid',
          gridTemplateColumns: `minmax(240px, 1fr) minmax(0, 600px) ${sideWidth}px`,
          columnGap: 2,
          alignItems: 'start',
        }}
      >
        {detailsColumn}
        <Box ref={listRef} sx={{ minWidth: 0, ...listSx }}>
          <FixedColumns count={1}>{panel}</FixedColumns>
        </Box>
        <SideTabs>
          {tabList}
        </SideTabs>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <AppBar
        position="static"
        color="default"
        className={classes.appBar}
        elevation={1}
      >
        {tabList}
      </AppBar>

      {value === 'feed' && !columns && details.length > 0 && (
        <Stack spacing={2} sx={{ mb: 2 }}>{details}</Stack>
      )}
      <Box ref={listRef} sx={listSx}>
        {besidePosts ?
          // The details as they are, in a column of their own, and the posts
          // in the other two.
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              columnGap: 2,
              alignItems: 'start',
            }}
          >
            {detailsColumn}
            <Box sx={{ gridColumn: 'span 2', minWidth: 0 }}>
              <FixedColumns count={2}>{panel}</FixedColumns>
            </Box>
          </Box> :
          panel}
      </Box>
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
  // How the posts are laid out: useFeedView, which the page holds so that the
  // buttons can be in its header.
  feedView: PropTypes.shape({
    columns: PropTypes.bool.isRequired,
    sideTabs: PropTypes.bool.isRequired,
  }).isRequired,
};

export default withStyles(ActorBody, styles);
