import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';

import ColumnsIcon from '@mui/icons-material/ViewColumnOutlined';
import ManageIcon from '@mui/icons-material/TuneOutlined';
import StreamIcon from '@mui/icons-material/ViewStreamOutlined';

import CompleteProfileCard from './CompleteProfileCard';
import FeedBrowse from '../feed/Leaders';
import FeedCustomBrowse from '../feed/Custom';
import usePinnedFeeds from './usePinnedFeeds';
import WhoToFollow from '../recommendations/WhoToFollow';
import CustomFeedIcon from '../../components/CustomFeedIcon';
import PageColumn from '../../components/PageColumn';
import actions from '../../actions';
import i18n from '../../languages';

import PersonType from '../../proptypes/Person';

// Which tab is the feed of the people and groups the viewer follows.
const FOLLOWING = 0;

// How a feed is laid out on a wide screen: one post under another, or in
// columns. The choice is the viewer's, kept in their browser.
const STREAM = 'stream';
const COLUMNS = 'columns';
const VIEW_KEY = 'home.feedView';

const rememberedView = () => {
  try {
    return window.localStorage.getItem(VIEW_KEY) === COLUMNS ? COLUMNS : STREAM;
  } catch (e) {
    return STREAM;
  }
};

const rememberView = (view) => {
  try {
    window.localStorage.setItem(VIEW_KEY, view);
  } catch (e) {
    // Not kept, and chosen again next time.
  }
};

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
// On a wide screen the feeds can be read in columns, by a pair of buttons
// beside it, and then take the width of the page. On a narrow one there is
// one column either way, and the buttons are not shown.
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
  const [view, setView] = useState(rememberedView);
  const isWide = useMediaQuery((theme) => {
    return theme.breakpoints.up('md');
  });
  const columns = isWide && view === COLUMNS;
  const [params, setParams] = useSearchParams();

  const asked = Number(params.get('feed')) || FOLLOWING;
  const open = pinned.find((feed) => {
    return feed.id === asked;
  });

  return (
    <>
      <Helmet>
        <title>{i18n.t('home:cTitle')}</title>
      </Helmet>
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
          <Tabs
            value={open ? open.id : FOLLOWING}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            onChange={(event, feedId) => {
              setParams(feedId === FOLLOWING ? {} : { feed: String(feedId) });
            }}
            sx={{ flexGrow: 1, minWidth: 0 }}
          >
            <Tab value={FOLLOWING} label={i18n.t('customFeeds:home.following')} />
            {pinned.map((feed) => {
              return (
                <Tab
                  key={`home-feed-${feed.id}`}
                  value={feed.id}
                  label={feed.name}
                  icon={<CustomFeedIcon name={feed.icon} fontSize="small" />}
                  iconPosition="start"
                  sx={{ minHeight: 48 }}
                />
              );
            })}
          </Tabs>
          {isWide &&
          <ToggleButtonGroup
            exclusive
            size="small"
            value={view}
            aria-label={i18n.t('customFeeds:home.view')}
            onChange={(event, chosen) => {
              // Pressing the one that is on leaves it on.
              if (chosen) {
                setView(chosen);
                rememberView(chosen);
              }
            }}
            sx={{ mx: 1 }}
          >
            <ToggleButton
              value={STREAM}
              aria-label={i18n.t('customFeeds:home.viewStream')}
              title={i18n.t('customFeeds:home.viewStream')}
            >
              <StreamIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton
              value={COLUMNS}
              aria-label={i18n.t('customFeeds:home.viewColumns')}
              title={i18n.t('customFeeds:home.viewColumns')}
            >
              <ColumnsIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>}
          <Tooltip title={i18n.t('customFeeds:home.manage')}>
            <IconButton
              component={RouterLink}
              to="/feeds"
              aria-label={i18n.t('customFeeds:home.manage')}
            >
              <ManageIcon />
            </IconButton>
          </Tooltip>
        </Box>
        {/* Keyed by when it was last changed, so a feed that was just
              edited is read again from the top. */}
        {open ?
          <FeedCustomBrowse
            key={`home-feed-${open.id}-${open.updatedAt}`}
            feed={open}
            columns={columns}
          /> :
          <FeedBrowse columns={columns} />}
      </PageColumn>
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
