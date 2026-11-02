import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import FollowingIcon from '@mui/icons-material/HowToRegOutlined';
import CompleteProfileCard from './CompleteProfileCard';
import FeedBrowse from '../feed/Leaders';
import FeedCustomBrowse from '../feed/Custom';
import useFeedView from './useFeedView';
import usePinnedFeeds from './usePinnedFeeds';
import WhoToFollow from '../recommendations/WhoToFollow';
import VideoOnItsWayCard from '../media/Composer/VideoOnItsWayCard';
import CustomFeedIcon from '../../components/CustomFeedIcon';
import FeedViewToggle from '../../components/FeedViewToggle';
import PageColumn from '../../components/PageColumn';
import SideTabs, {
  listSx, sideTabSx, sideTabsSx, useTabbedList,
} from '../../components/SideTabs';
import actions from '../../actions';
import i18n from '../../languages';
import BackToTop from '../../components/BackToTop';

import PersonType from '../../proptypes/Person';

// Which tab is the feed of the people and groups the viewer follows.
const FOLLOWING = 0;

// Home, for somebody signed in: a place to post, and their feeds.
//
// The first tab is always the feed of the people and groups they follow,
// newest first. After it come the custom feeds they keep here, their own and
// other people's, in the order they put them in. The tab that is open is in
// the address (`?feed=`), so it survives a reload and can be linked to.
//
// At the end of the tabs, where a phone has it too, is the way to the list
// of feeds, which is where a feed is made, changed and deleted.
//
// On a wide screen the feeds are read one post under another with the tabs
// beside them, or by a pair of buttons in columns, with the tabs above and the
// width of the page. On a narrow one there is one column with the tabs above,
// and the buttons are not shown.
const FeedsPage = ({
  viewer,
}) => {
  const pinned = usePinnedFeeds(true);

  // The + button posts from here, to the viewer's own profile.
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(actions.composeTarget.home());
    return () => {
      dispatch(actions.composeTarget.clear('home'));
    };
  }, []);
  const {
    view, isWide, columns, sideTabs, chooseView,
  } = useFeedView();
  const [params, setParams] = useSearchParams();
  const [listRef, startList] = useTabbedList();

  const asked = Number(params.get('feed')) || FOLLOWING;
  const open = pinned.find((feed) => {
    return feed.id === asked;
  });

  const tabSx = sideTabs ? sideTabSx : { minHeight: 48 };

  const tabs = (
    <Tabs
      value={open ? open.id : FOLLOWING}
      orientation={sideTabs ? 'vertical' : 'horizontal'}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      onChange={(event, feedId) => {
        setParams(
          feedId === FOLLOWING ? {} : { feed: String(feedId) },
          { state: { keepPlace: true } },
        );
        startList();
      }}
      sx={sideTabs ? sideTabsSx : { flexGrow: 1, minWidth: 0 }}
    >
      {/* With an icon, as the custom feeds beside it have. */}
      <Tab
        value={FOLLOWING}
        label={i18n.t('customFeeds:home.following')}
        icon={<FollowingIcon fontSize="small" />}
        iconPosition="start"
        sx={tabSx}
      />
      {pinned.map((feed) => {
        return (
          <Tab
            key={`home-feed-${feed.id}`}
            value={feed.id}
            label={feed.name}
            icon={<CustomFeedIcon name={feed.icon} fontSize="small" />}
            iconPosition="start"
            sx={tabSx}
          />
        );
      })}
    </Tabs>
  );

  const toggle = isWide && (
    <FeedViewToggle
      view={view}
      onChoose={chooseView}
      sx={sideTabs ? { mb: 2 } : { ml: 2 }}
    />
  );

  const feed = (
    <Box ref={listRef} sx={listSx}>
      {/* A video posted, on its way, at the head of the feed it will
            be in (roadmap row 115). */}
      <VideoOnItsWayCard />
      {/* Keyed by when it was last changed, so a feed that was just
            edited is read again from the top. */}
      {open ?
        <FeedCustomBrowse
          key={`home-feed-${open.id}-${open.updatedAt}`}
          feed={open}
          columns={columns}
        /> :
        <FeedBrowse columns={columns} />}
    </Box>
  );

  return (
    <>
      <Helmet>
        <title>{i18n.t('home:cTitle')}</title>
      </Helmet>
      {sideTabs ?
        // The feed in the middle of the page, and the tabs beside it.
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr minmax(0, 600px) 1fr',
            columnGap: 2,
            alignItems: 'start',
          }}
        >
          <Box sx={{ gridColumn: 2, minWidth: 0 }}>
            <CompleteProfileCard viewer={viewer} />
            <WhoToFollow columns={false} />
            {feed}
          </Box>
          <SideTabs>
            {toggle}
            {tabs}
          </SideTabs>
        </Box> :
        <>
          <PageColumn>
            <CompleteProfileCard viewer={viewer} />
          </PageColumn>
          {/* A few people to follow, when the installation suggests any: as
              wide as the feeds, side by side when they are in columns. */}
          <PageColumn wide={columns}>
            <WhoToFollow columns={columns} />
          </PageColumn>
          <PageColumn wide={columns}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: 1,
                borderColor: 'divider',
                mb: 2,
              }}
            >
              {tabs}
              {toggle}
            </Box>
            {feed}
          </PageColumn>
        </>}
      <BackToTop />
    </>
  );
};

FeedsPage.propTypes = {
  viewer: PersonType.isRequired,
};

const mapStateToProps = (state) => {
  return {
    viewer: state.session.viewer,
  };
};

export default connect(mapStateToProps)(FeedsPage);
